import React, { useState, useEffect, useSyncExternalStore, createContext, useContext } from 'react';
import { collection, doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Edit2, Check, X, Loader2 } from 'lucide-react';
import { useAlert } from './AlertModal';

interface EditModeContextType {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  isAdmin: boolean;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  setIsEditMode: () => {},
  isAdmin: false,
});

export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { profile, user } = useFirebase();

  // Local development only: ?edit shows the editing UI without the admin account (saves are still refused by the rules).
  const devEdit = import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('edit');
  const isAdmin = devEdit || profile?.role === 'admin' || profile?.email === 'hen27e@gmail.com' || user?.email === 'hen27e@gmail.com';

  // Leaving the admin account always leaves edit mode.
  useEffect(() => {
    if (!isAdmin && isEditMode) setIsEditMode(false);
  }, [isAdmin, isEditMode]);

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode, isAdmin }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => useContext(EditModeContext);

/* ------------------------------------------------------------------ */
/* Site texts: one shared listener for the whole site_content          */
/* collection, instead of one per text on the page.                    */
/* ------------------------------------------------------------------ */

type ContentDoc = Record<string, unknown>;
let contentCache: Record<string, ContentDoc> = {};
let unsubscribe: (() => void) | null = null;
const listeners = new Set<() => void>();

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  if (!unsubscribe) {
    unsubscribe = onSnapshot(
      collection(db, 'site_content'),
      (snap) => {
        const next: Record<string, ContentDoc> = {};
        snap.forEach((d) => {
          next[d.id] = d.data();
        });
        contentCache = next;
        listeners.forEach((l) => l());
      },
      (err) => console.error('Error loading site content:', err)
    );
  }
  return () => {
    listeners.delete(cb);
  };
};

/** The saved text for a content id in the current language, or the default. */
export const useSiteText = (contentId: string, defaultText: string) => {
  const { language } = useLanguage();
  const data = useSyncExternalStore(subscribe, () => contentCache[contentId]);
  const saved = (data?.[`text_${language}`] ?? (language === 'he' ? data?.text : undefined)) as string | undefined;
  return typeof saved === 'string' && saved.trim() ? saved : defaultText;
};

interface EditableTextProps {
  contentId: string;
  defaultText: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
  multiline?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const EditableText: React.FC<EditableTextProps> = ({
  contentId,
  defaultText,
  className = '',
  as: Component = 'span',
  multiline = false,
  onClick,
}) => {
  const { isEditMode, isAdmin } = useEditMode();
  const { language } = useLanguage();
  const { showAlert } = useAlert();
  const text = useSiteText(contentId, defaultText);
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(text);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) setTempText(text);
  }, [text, isEditing]);

  const handleSave = async () => {
    if (!isAdmin) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'site_content', contentId),
        {
          contentId,
          [`text_${language}`]: tempText.trim() ? tempText : defaultText,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser?.uid,
        },
        { merge: true }
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
      showAlert('שגיאה בשמירת התוכן');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setTempText(defaultText);
  };

  const handleCancel = () => {
    setTempText(text);
    setIsEditing(false);
  };

  if (isEditMode && isAdmin) {
    if (isEditing) {
      return (
        <div className="relative z-40 my-2 w-full border border-gold/60 bg-surface p-3 text-start text-base font-normal not-italic text-ink" style={{ zoom: 1 }}>
          {multiline || text.length > 60 ? (
            <textarea
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              rows={4}
              className="w-full border border-rule bg-paper p-2 text-base leading-relaxed text-ink outline-none focus:border-gold"
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              className="w-full border border-rule bg-paper p-2 text-base text-ink outline-none focus:border-gold"
              autoFocus
            />
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold">
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 bg-ink px-3 py-1.5 text-paper hover:bg-spot disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} לשמור
            </button>
            <button onClick={handleCancel} disabled={saving} className="inline-flex items-center gap-1 border border-ink px-3 py-1.5 hover:text-spot">
              <X size={14} /> ביטול
            </button>
            {tempText !== defaultText && (
              <button onClick={handleReset} disabled={saving} className="ms-auto underline underline-offset-4 hover:text-spot">
                להחזיר לנוסח המקורי
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <Component
        className={`${className} group/edit relative cursor-pointer outline outline-1 outline-dashed outline-offset-4 outline-gold/50 hover:outline-gold`}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }}
        title="לחצו לעריכה"
      >
        {text}
        <span aria-hidden="true" className="pointer-events-none absolute -top-3 -end-3 bg-gold p-1 text-[#110E0D] opacity-0 transition-opacity group-hover/edit:opacity-100" style={{ zoom: 1 }}>
          <Edit2 size={10} />
        </span>
      </Component>
    );
  }

  return (
    <Component className={className} onClick={onClick}>
      {text}
    </Component>
  );
};

/** Shorthand: the children are the default text. `<E id="home_title" as="h2">התוכנייה</E>` */
export const E = ({ id, as = 'span', className, multiline, children }: { id: string; as?: EditableTextProps['as']; className?: string; multiline?: boolean; children: string }) => (
  <EditableText contentId={id} defaultText={children} as={as} className={className} multiline={multiline} />
);

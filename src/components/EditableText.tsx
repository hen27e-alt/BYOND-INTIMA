import React, { useState, useEffect, createContext, useContext } from 'react';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
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
  
  const isAdmin = profile?.role === 'admin' || profile?.email === 'hen27e@gmail.com' || user?.email === 'hen27e@gmail.com';

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode, isAdmin }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = () => useContext(EditModeContext);

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
  onClick
}) => {
  const { isEditMode, isAdmin } = useEditMode();
  const { language } = useLanguage();
  const { showAlert } = useAlert();
  const [text, setText] = useState(defaultText);
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(text);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site_content', contentId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const langText = data[`text_${language}`] || data.text || defaultText;
        setText(langText);
        setTempText(langText);
      } else {
        setText(defaultText);
        setTempText(defaultText);
      }
      setLoading(false);
    }, (err) => {
      console.error(`Error loading site content (${contentId}):`, err);
      setLoading(false);
    });

    return () => unsub();
  }, [contentId, language, defaultText]);

  const handleSave = async () => {
    if (!isAdmin) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'site_content', contentId), {
        contentId,
        [`text_${language}`]: tempText,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid
      }, { merge: true });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving content:', error);
      showAlert('שגיאה בשמירת התוכן');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempText(text);
    setIsEditing(false);
  };

  if (loading) {
    return <span className="animate-pulse opacity-50">{defaultText}</span>;
  }

  if (isEditMode && isAdmin) {
    if (isEditing) {
      return (
        <div className={`relative group inline-block w-full ${className}`}>
          {multiline ? (
            <textarea
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              className="w-full p-2 bg-white border-2 border-brand-gold rounded-lg text-brand-black focus:outline-none min-h-[100px]"
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              className="w-full p-2 bg-white border-2 border-brand-gold rounded-lg text-brand-black focus:outline-none"
              autoFocus
            />
          )}
          <div className="absolute -top-10 right-0 flex gap-2 bg-white p-1 rounded-lg shadow-lg border border-brand-gold/20 z-50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              title="שמור"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              title="ביטול"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`relative group cursor-pointer border border-dashed border-brand-gold/30 hover:border-brand-gold p-1 rounded transition-all ${className}`}
        onClick={() => setIsEditing(true)}
      >
        <Component>{text}</Component>
        <div className="absolute -top-2 -right-2 bg-brand-gold text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <Edit2 size={10} />
        </div>
      </div>
    );
  }

  return (
    <Component className={className} onClick={onClick}>{text}</Component>
  );
};

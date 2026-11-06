import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { PartnerLink } from './PartnerLink';
import { cn } from '../../lib/utils';

interface ProfileViewProps {
  profile: any;
  updateProfile: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setActiveTab: (tab: string) => void;
  notifications: any[];
}

const Section = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <section className="grid gap-4 border-b border-ink py-8 md:grid-cols-[200px_1fr] md:gap-10">
    <h2 className="flex items-baseline gap-3 font-display text-4xl font-bold leading-none">
      <span className="text-spot tabular-nums">{n}</span>
      {title}
    </h2>
    <div>{children}</div>
  </section>
);

const Choice = ({ on, onClick, children, disabled }: { on: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-pressed={on}
    className={cn('border-2 border-ink px-4 py-2.5 text-base font-bold disabled:opacity-50', on ? 'bg-ink text-paper' : 'hover:bg-ink hover:text-paper')}
  >
    {children}
  </button>
);

const dateOf = (d: any) => (d?.toDate ? d.toDate() : new Date(d)).toLocaleDateString('he-IL');

/** Profile room: who you are, your partner, and the few settings that actually change something. */
export const ProfileView = ({ profile, updateProfile, logout, setActiveTab, notifications }: ProfileViewProps) => {
  const { language, setLanguage } = useLanguage();
  const { fontSize, setFontSize } = useTheme();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState<string>(profile?.displayName ?? '');
  const [partner, setPartner] = useState<string>(profile?.partnerName ?? '');
  const [saved, setSaved] = useState(false);
  const notify = profile?.preferences?.notificationsEnabled !== false;

  const save = async (data: Record<string, unknown>) => {
    setBusy(true);
    try {
      await updateProfile(data);
    } finally {
      setBusy(false);
    }
  };

  const changed = name.trim() !== (profile?.displayName ?? '') || partner.trim() !== (profile?.partnerName ?? '');
  const saveNames = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !changed) return;
    await save({ displayName: name.trim().slice(0, 40), partnerName: partner.trim().slice(0, 40) });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl">
      <Section n="01" title="אתם">
        <form onSubmit={saveNames} className="grid gap-5 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm font-bold">השם שלכם</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              required
              className="w-full border-b-[3px] border-ink bg-transparent py-2 text-xl font-bold outline-none focus:border-spot"
            />
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold">השם של בן או בת הזוג</span>
            <input
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              maxLength={40}
              className="w-full border-b-[3px] border-ink bg-transparent py-2 text-xl font-bold outline-none focus:border-spot"
            />
          </label>
          <div className="flex items-center gap-4 sm:col-span-2">
            <button disabled={busy || !name.trim() || !changed} className="bg-ink px-5 py-2.5 font-bold text-paper hover:bg-spot disabled:opacity-40">
              לשמור
            </button>
            <span role="status" className="text-sm font-bold text-spot">
              {saved ? 'נשמר' : ''}
            </span>
          </div>
        </form>
        <p className="mt-4 text-base text-ink/70">
          <bdi>{profile?.email}</bdi>
          {profile?.loveLanguage && <> · שפת האהבה: {profile.loveLanguage}</>}
        </p>
      </Section>

      <Section n="02" title="בן או בת הזוג">
        <PartnerLink />
      </Section>

      {notifications.length > 0 && (
        <Section n="03" title="קרוב לסיום">
          <ul>
            {notifications.map((m: any) => (
              <li key={m.id} className="flex items-center justify-between gap-4 border-b border-rule py-3 last:border-0">
                <span>
                  <span className="block font-bold">{m.title}</span>
                  <span className="text-sm text-ink/70">עד {dateOf(m.deadline)}</span>
                </span>
                <button onClick={() => setActiveTab('missions')} className="text-sm font-bold underline underline-offset-4 hover:text-spot">
                  למשימה
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section n={notifications.length ? '04' : '03'} title="העדפות">
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-bold">שפה</p>
            <div className="flex flex-wrap gap-2">
              <Choice on={language === 'he'} disabled={busy} onClick={() => { setLanguage('he'); void save({ language: 'he' }); }}>
                עברית
              </Choice>
              <Choice on={language === 'en'} disabled={busy} onClick={() => { setLanguage('en'); void save({ language: 'en' }); }}>
                English
              </Choice>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">גודל הטקסט</p>
            <div className="flex flex-wrap gap-2">
              {([['small', 'קטן'], ['medium', 'רגיל'], ['large', 'גדול']] as const).map(([v, l]) => (
                <Choice key={v} on={fontSize === v} onClick={() => { setFontSize(v); void save({ fontSize: v }); }}>
                  {l}
                </Choice>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">כמה זמן יש למשימה חדשה</p>
            <div className="flex flex-wrap gap-2">
              {([[3, '3 ימים'], [7, 'שבוע'], [14, 'שבועיים'], [30, 'חודש']] as const).map(([d, l]) => (
                <Choice key={d} on={(profile?.defaultMissionDuration || 7) === d} disabled={busy} onClick={() => void save({ defaultMissionDuration: d })}>
                  {l}
                </Choice>
              ))}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={notify}
              disabled={busy}
              onChange={() => void save({ preferences: { ...(profile?.preferences ?? {}), notificationsEnabled: !notify } })}
              className="h-5 w-5 accent-[var(--color-accent)]"
            />
            <span className="text-base font-bold">תזכורות על משימות ואתגרים</span>
          </label>
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 py-8">
        <p className="text-sm text-ink/70">הפרטים שלכם נשמרים בחשבון ולא מוצגים לאף אחד אחר.</p>
        <button onClick={logout} className="border-2 border-ink px-5 py-2.5 font-bold hover:bg-ink hover:text-paper">
          יציאה מהחשבון
        </button>
      </div>
    </div>
  );
};

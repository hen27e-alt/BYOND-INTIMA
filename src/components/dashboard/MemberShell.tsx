import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MissionCard } from '../season/MissionCard';
import { MISSION_CARDS } from '../../data/missionCards';
import { useSeasonSettings } from '../../lib/catalogue';
import { cn } from '../../lib/utils';

const pad = (n: number) => String(n).padStart(2, '0');

/** Rooms that open inside the dashboard, and doors that lead to their own pages. */
type Room = { id: string; name: string; to?: string };
const ROOMS: { title: string; rooms: Room[] }[] = [
  { title: 'הבית', rooms: [{ id: 'feed', name: 'הערב שלכם' }, { id: 'profile', name: 'הפרופיל' }, { id: 'orders', name: 'ההזמנות', to: '/orders' }] },
  {
    title: 'יחד',
    rooms: [
      { id: 'journal', name: 'היומן' },
      { id: 'missions', name: 'משימות' },
      { id: 'dating-goals', name: 'יעדים לזוגיות' },
      { id: 'vision-board', name: 'לוח חזון' },
      { id: 'weekly-checkin', name: "צ'ק־אין שבועי" },
    ],
  },
  {
    title: 'לשחק',
    rooms: [
      { id: 'cards', name: 'קלפי המשימה', to: '/cards' },
      { id: 'games', name: 'משחקים', to: '/games' },
      { id: 'treasure-hunt', name: 'חיפוש המטמון' },
      { id: 'gamification', name: 'ההישגים' },
    ],
  },
  { title: 'לדבר', rooms: [{ id: 'suggestions', name: 'השראה לערב' }, { id: 'live-counselor', name: 'יועץ AI' }] },
  { title: 'הגוף', rooms: [{ id: 'fitness', name: 'כושר ותזונה' }] },
];

const ALL_ROOMS = ROOMS.flatMap((g) => g.rooms);

const greeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'בוקר טוב';
  if (h >= 12 && h < 17) return 'צהריים טובים';
  if (h >= 17 && h < 22) return 'ערב טוב';
  return 'לילה טוב';
};

type Props = {
  user: any;
  profile: any;
  activeTab: string;
  setActiveTab: (t: string) => void;
  renderTabContent: () => React.ReactNode;
  logout: () => void;
  updateProfile: (u: Record<string, unknown>) => Promise<void>;
  notificationCount: number;
};

/** The overview: this season's programme with what you've done, a card to draw, and the doors you use most. */
const Overview = ({ profile, updateProfile, setActiveTab }: Pick<Props, 'profile' | 'updateProfile' | 'setActiveTab'>) => {
  const { seasonNumber, evenings } = useSeasonSettings();
  const reduce = useReducedMotion();
  const key = `s${seasonNumber}`;
  const done: number[] = profile?.programme?.[key] ?? [];
  const [saving, setSaving] = useState<number | null>(null);
  const [cardIdx, setCardIdx] = useState(() => Math.floor(Math.random() * MISSION_CARDS.length));
  const [flipped, setFlipped] = useState(true);
  const next = evenings.find((e) => !done.includes(e.n));

  const toggle = async (n: number) => {
    setSaving(n);
    const nextDone = done.includes(n) ? done.filter((x) => x !== n) : [...done, n];
    try {
      await updateProfile({ programme: { ...(profile?.programme ?? {}), [key]: nextDone } });
    } finally {
      setSaving(null);
    }
  };

  const drawCard = () => {
    if (!flipped) {
      setFlipped(true);
      window.setTimeout(() => {
        setCardIdx((i) => (i + 1 + Math.floor(Math.random() * (MISSION_CARDS.length - 1))) % MISSION_CARDS.length);
        setFlipped(false);
      }, reduce ? 0 : 300);
    } else setFlipped(false);
  };

  const doors = [
    { id: 'journal', n: '01', t: 'היומן', d: 'מה היה הערב, במילים שלכם' },
    { id: 'missions', n: '02', t: 'משימות', d: 'מה מחכה לכם השבוע' },
    { id: 'cards', n: '03', t: 'קלפי המשימה', d: 'שולפים ומתחילים', to: '/cards' },
    { id: 'orders', n: '04', t: 'ההזמנות', d: 'איפה המארז', to: '/orders' },
  ];

  return (
    <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-16">
      <div>
        <section aria-labelledby="prog-title">
          <h2 id="prog-title" className="flex items-end justify-between border-b-[3px] border-ink pb-3 font-display text-5xl font-bold leading-none md:text-6xl">
            התוכנייה שלכם
            <span className="pb-1 font-sans text-sm font-bold tabular-nums">
              {done.length}/{evenings.length} ערבים
            </span>
          </h2>
          <ol>
            {evenings.map((ev) => {
              const isDone = done.includes(ev.n);
              const isNext = next?.n === ev.n;
              return (
                <li key={ev.n} className={cn('grid grid-cols-[52px_1fr_auto] items-center gap-3 border-b border-ink py-3 md:grid-cols-[64px_1fr_1fr_auto]', isDone && 'text-ink/45')}>
                  <span className={cn('font-display text-4xl font-bold leading-none tabular-nums md:text-5xl', isDone ? 'text-ink/30' : 'text-spot')}>{pad(ev.n)}</span>
                  <span>
                    <span className={cn('block text-lg font-bold md:text-xl', isDone && 'line-through decoration-2')}>{ev.he}</span>
                    {isNext && <span className="text-sm font-bold text-spot">הערב הבא שלכם</span>}
                  </span>
                  <span className="hidden text-sm md:block">{ev.themeHe}</span>
                  <label className={cn('flex cursor-pointer items-center gap-2 border-2 px-3 py-1.5 text-sm font-bold', isDone ? 'border-ink bg-ink text-paper' : 'border-ink hover:bg-ink hover:text-paper')}>
                    <input type="checkbox" className="sr-only" checked={isDone} disabled={saving === ev.n} onChange={() => void toggle(ev.n)} />
                    {isDone ? 'עשינו' : 'סמנו שעשיתם'}
                  </label>
                </li>
              );
            })}
          </ol>
          {next?.boxId && (
            <p className="mt-4 text-base">
              לערב הבא יש מארז.{' '}
              <Link to={`/experience#${next.boxId}`} className="font-bold underline underline-offset-4 hover:text-spot">
                לראות את המארז
              </Link>
            </p>
          )}
        </section>

        <section aria-labelledby="doors-title" className="mt-14">
          <h2 id="doors-title" className="border-b-[3px] border-ink pb-3 font-display text-5xl font-bold leading-none">
            הדלתות שלכם
          </h2>
          <ul className="grid sm:grid-cols-2">
            {doors.map((d, i) => {
              const inner = (
                <>
                  <span className="font-display text-5xl font-bold leading-none text-spot tabular-nums">{d.n}</span>
                  <span>
                    <span className="block text-xl font-bold group-hover:text-spot">{d.t}</span>
                    <span className="text-base text-ink/70">{d.d}</span>
                  </span>
                </>
              );
              const cls = 'group grid w-full grid-cols-[64px_1fr] items-center gap-3 py-5 text-start';
              return (
                <li key={d.id} className={cn('border-b border-ink', i % 2 === 0 && 'sm:border-e sm:pe-6', i % 2 === 1 && 'sm:ps-6')}>
                  {d.to ? (
                    <Link to={d.to} className={cls}>
                      {inner}
                    </Link>
                  ) : (
                    <button onClick={() => setActiveTab(d.id)} className={cls}>
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <aside aria-labelledby="draw-title">
        <h2 id="draw-title" className="border-b-[3px] border-ink pb-3 font-display text-5xl font-bold leading-none">
          קלף להערב
        </h2>
        <div className="mx-auto mt-6 max-w-[300px]">
          <MissionCard card={MISSION_CARDS[cardIdx]} flipped={flipped} season={seasonNumber} onClick={drawCard} label={flipped ? 'לשלוף קלף' : undefined} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <button onClick={drawCard} className="bg-ink px-4 py-2.5 font-bold text-paper hover:bg-spot">
            {flipped ? 'לשלוף קלף' : 'קלף אחר'}
          </button>
          <Link to="/cards" className="text-sm font-bold underline underline-offset-4 hover:text-spot">
            כל החפיסה
          </Link>
        </div>
      </aside>
    </div>
  );
};

/** The member area's frame: a ruled index of rooms beside the room you're in. */
export const MemberShell = ({ user, profile, activeTab, setActiveTab, renderTabContent, logout, updateProfile, notificationCount }: Props) => {
  const { seasonNumber } = useSeasonSettings();
  const reduce = useReducedMotion();
  const first = (profile?.displayName || user?.displayName || '').split(' ')[0];
  const partner = profile?.partnerName as string | undefined;
  const current = ALL_ROOMS.find((r) => r.id === activeTab) ?? ALL_ROOMS[0];
  const names = useMemo(() => [first, partner].filter(Boolean).join(' ו'), [first, partner]);

  const roomButton = (r: Room, compact = false) => {
    const active = r.id === activeTab;
    const cls = cn(
      'flex w-full items-baseline justify-between gap-3 text-start font-bold transition-colors',
      compact ? 'whitespace-nowrap border-b-[4px] px-3 py-2.5 text-base' : 'border-b border-rule py-2.5 text-[17px]',
      active ? (compact ? 'border-spot text-spot' : 'text-spot') : compact ? 'border-transparent hover:text-spot' : 'hover:text-spot'
    );
    const badge = r.id === 'profile' && notificationCount > 0 && <span className="bg-spot px-1.5 text-xs text-paper tabular-nums">{notificationCount}</span>;
    return r.to ? (
      <Link to={r.to} className={cls}>
        {r.name}
        {!compact && <span className="text-xs text-ink/40">↗</span>}
      </Link>
    ) : (
      <button onClick={() => setActiveTab(r.id)} aria-current={active ? 'page' : undefined} className={cls}>
        {r.name}
        {badge}
      </button>
    );
  };

  return (
    <div className="bg-paper text-ink">
      <header className="mx-auto max-w-[1440px] px-4 pt-10 md:px-8 lg:px-14 lg:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b-[3px] border-ink pb-6">
          <div>
            <p className="text-base font-bold text-spot">
              {greeting()}
              {first ? `, ${first}` : ''}
            </p>
            <h1 className="font-display text-[clamp(3.75rem,10vw,8.5rem)] font-bold leading-[0.8]">{activeTab === 'feed' ? 'המקום שלכם' : current.name}</h1>
          </div>
          <dl className="flex gap-8 text-end">
            {names && (
              <div>
                <dt className="text-sm font-bold text-ink/60">הזוג</dt>
                <dd className="text-lg font-bold">{names}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-bold text-ink/60">עונה</dt>
              <dd className="font-display text-4xl font-bold leading-none text-spot tabular-nums">{pad(seasonNumber)}</dd>
            </div>
          </dl>
        </div>
        {/* Phones and tablets: rooms as a ruled strip */}
        <nav aria-label="חדרים" className="-mx-4 overflow-x-auto border-b border-ink px-4 lg:hidden">
          <ul className="flex min-w-max">
            {ALL_ROOMS.map((r) => (
              <li key={r.id}>{roomButton(r, true)}</li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 pb-24 pt-8 md:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-14 lg:pt-10">
        <nav aria-label="חדרים" className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          {ROOMS.map((g) => (
            <div key={g.title} className="mb-6">
              <h2 className="border-b-[3px] border-ink pb-1 font-display text-2xl font-bold leading-none">{g.title}</h2>
              <ul>
                {g.rooms.map((r) => (
                  <li key={r.id}>{roomButton(r)}</li>
                ))}
              </ul>
            </div>
          ))}
          <button onClick={logout} className="mt-2 text-sm font-bold text-ink/60 underline underline-offset-4 hover:text-spot">
            יציאה מהחשבון
          </button>
        </nav>

        <main>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="season-skin"
            >
              {activeTab === 'feed' ? <Overview profile={profile} updateProfile={updateProfile} setActiveTab={setActiveTab} /> : renderTabContent()}
            </motion.div>
          </AnimatePresence>
          <button onClick={logout} className="mt-12 text-sm font-bold text-ink/60 underline underline-offset-4 hover:text-spot lg:hidden">
            יציאה מהחשבון
          </button>
        </main>
      </div>
    </div>
  );
};

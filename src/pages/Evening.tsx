import { createPortal } from 'react-dom';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Moon, Play, Pause, RotateCcw } from 'lucide-react';
import { MISSION_CARDS, SUITS, type SuitId } from '../data/missionCards';
import { cn } from '../lib/utils';

const SUIT_IDS: SuitId[] = ['dusk', 'midnight', 'dawn'];
const TONE: Record<SuitId, string> = {
  dusk: 'from-[#F2C9B8] via-[#D98B7A] to-[#B4566A]',
  midnight: 'from-[#F0B08A] via-[#D9361F] to-[#7A1828]',
  dawn: 'from-[#F4E4BE] via-[#C9A66B] to-[#9C7742]',
};

/** Keeps the screen awake while the evening runs, where the browser allows it. */
const useWakeLock = (on: boolean) => {
  useEffect(() => {
    if (!on || !('wakeLock' in navigator)) return;
    let lock: { release: () => Promise<void> } | null = null;
    let cancelled = false;
    const get = async () => {
      try {
        lock = await (navigator as unknown as { wakeLock: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock.request('screen');
        if (cancelled) lock.release().catch(() => {});
      } catch {
        /* not allowed (battery saver, iframe): the evening still works */
      }
    };
    get();
    const onVis = () => document.visibilityState === 'visible' && get();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
      lock?.release().catch(() => {});
    };
  }, [on]);
};

/** A gentle countdown for the card's minutes. */
const Timer = ({ minutes, resetKey }: { minutes: number; resetKey: number }) => {
  const total = minutes * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    setLeft(total);
    setRunning(false);
  }, [resetKey, total]);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setLeft((s) => (s <= 1 ? (setRunning(false), 0) : s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [running]);
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  return (
    <div className="flex items-center gap-3">
      <span className="font-display text-3xl tabular-nums" dir="ltr" aria-live="off">
        {mm}:{ss}
      </span>
      <button
        onClick={() => (left === 0 ? (setLeft(total), setRunning(true)) : setRunning(!running))}
        className="grid h-11 w-11 place-items-center rounded-full border border-current/40 hover:border-current"
        aria-label={running ? 'עצירת הטיימר' : 'הפעלת הטיימר'}
      >
        {left === 0 ? <RotateCcw size={16} /> : running ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </div>
  );
};

/**
 * Evening mode: the cards of one suit, full screen, nothing else on it. Opened from the QR
 * code in the box (/evening/midnight) or from the cards page. Quiet mode warms and dims the
 * screen for a dark room, enlarges the text, and asks the phone not to sleep.
 */
const EveningInner = () => {
  const { suit: raw } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const suit: SuitId | null = SUIT_IDS.includes(raw as SuitId) ? (raw as SuitId) : null;
  const deck = useMemo(() => (suit ? MISSION_CARDS.filter((c) => c.suit === suit) : []), [suit]);
  const [i, setI] = useState(-1);
  const [dir, setDir] = useState(1);
  const [quiet, setQuiet] = useState(() => {
    try {
      return localStorage.getItem('byond_quiet') === '1';
    } catch {
      return false;
    }
  });
  useWakeLock(i >= 0);
  const closeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('byond_quiet', quiet ? '1' : '0');
    } catch {
      /* private mode */
    }
  }, [quiet]);

  // Full screen: nothing of the site's chrome scrolls behind it.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const go = useCallback(
    (d: number) => {
      setDir(d);
      setI((x) => Math.max(0, Math.min(deck.length, x + d)));
    },
    [deck.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (i < 0) return;
      if (e.key === 'ArrowLeft') go(1);
      if (e.key === 'ArrowRight') go(-1);
      if (e.key === 'Escape') navigate('/cards');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, i, navigate]);

  if (!suit) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-[#0A0809] px-6 text-center text-[#EFE6D8]">
        <p className="text-sm font-bold text-gold">מצב ערב</p>
        <h1 className="font-display text-6xl font-bold leading-none">איזה ערב הלילה?</h1>
        <div className="grid w-full max-w-sm gap-3">
          {SUIT_IDS.map((s) => (
            <Link key={s} to={`/evening/${s}`} className="flex min-h-16 items-center justify-between border border-[#EFE6D8]/25 px-5 text-xl font-bold hover:border-gold">
              {SUITS[s].he}
              <span className="font-display text-lg text-[#EFE6D8]/60 tabular-nums" dir="ltr">{SUITS[s].hour}</span>
            </Link>
          ))}
        </div>
        <Link to="/cards" className="text-sm font-bold underline underline-offset-4">חזרה לאתר</Link>
      </div>
    );
  }

  const card = deck[i];
  const finished = i >= deck.length;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    // RTL: dragging to the right moves forward, like turning a Hebrew page.
    if (info.offset.x > 80) go(1);
    else if (info.offset.x < -80) go(-1);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex flex-col overflow-hidden text-[#EFE6D8] transition-colors duration-700',
        quiet ? 'bg-[#120806]' : 'bg-[#0A0809]'
      )}
      style={quiet ? { filter: 'sepia(.35) brightness(.78)' } : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={`מצב ערב: ${SUITS[suit].he}`}
    >
      <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(60%_50%_at_50%_35%,rgba(217,54,31,.22),transparent_70%)]', quiet && 'opacity-30')} />

      <header className="relative flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-8">
        <Link ref={closeRef} to="/cards" className="grid h-11 w-11 place-items-center" aria-label="יציאה ממצב ערב">
          <X size={22} />
        </Link>
        <p className="text-sm font-bold">
          {SUITS[suit].he}
          {card && <span className="ms-2 tabular-nums text-[#EFE6D8]/55">{i + 1}/{deck.length}</span>}
        </p>
        <button
          onClick={() => setQuiet(!quiet)}
          aria-pressed={quiet}
          className={cn('flex h-11 items-center gap-2 px-3 text-sm font-bold', quiet ? 'text-gold' : 'text-[#EFE6D8]/70')}
        >
          <Moon size={16} aria-hidden /> מצב שקט
        </button>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          {i === -1 && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex max-w-md flex-col items-center gap-6 text-center">
              <span className={cn('h-px w-24 bg-gradient-to-l', TONE[suit])} />
              <p className="font-display text-xl tabular-nums text-[#EFE6D8]/60" dir="ltr">{SUITS[suit].hour}</p>
              <h1 className={cn('bg-gradient-to-l bg-clip-text font-display text-7xl font-bold leading-[0.9] text-transparent md:text-8xl', TONE[suit])}>{SUITS[suit].he}</h1>
              <p className="text-lg text-[#EFE6D8]/80">{SUITS[suit].note}.</p>
              <p className="text-base text-[#EFE6D8]/60">{deck.length} קלפים. שימו את שאר הטלפונים בחדר אחר, ועמעמו את האור.</p>
              <button onClick={() => go(1)} className="mt-2 min-h-14 bg-[#D9361F] px-10 text-lg font-bold text-white hover:bg-[#E2492F]">
                לקלף הראשון
              </button>
            </motion.div>
          )}

          {card && (
            <motion.article
              key={card.n}
              custom={dir}
              drag={reduce ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={onDragEnd}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -60, rotate: dir * -2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 60, rotate: dir * 2 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex aspect-[3/4.2] w-full max-w-[380px] cursor-grab touch-pan-y flex-col justify-between border border-gold/40 bg-[linear-gradient(165deg,#1E1917,#0E0B0A)] p-7 shadow-[0_30px_60px_rgba(0,0,0,.6)] active:cursor-grabbing md:max-w-[420px]"
            >
              <span aria-hidden="true" className="pointer-events-none absolute inset-2.5 border border-gold/15" />
              <div className="flex items-baseline justify-between">
                <span className={cn('bg-gradient-to-l bg-clip-text font-display text-4xl tabular-nums text-transparent', TONE[suit])}>{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm text-[#EFE6D8]/55">{card.minutes} דק׳</span>
              </div>
              <div>
                <h2 className={cn('font-display font-bold leading-[0.95]', quiet ? 'text-6xl' : 'text-5xl')}>{card.title}</h2>
                <p className={cn('mt-5 leading-relaxed text-[#EFE6D8]/85', quiet ? 'text-2xl' : 'text-xl')}>{card.text}</p>
              </div>
              <Timer minutes={card.minutes} resetKey={card.n} />
            </motion.article>
          )}

          {finished && (
            <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex max-w-md flex-col items-center gap-6 text-center">
              <h2 className="font-display text-6xl font-bold leading-none">לילה טוב.</h2>
              <p className="text-lg text-[#EFE6D8]/75">סיימתם את הקלפים של {SUITS[suit].he}. אם בא לכם, כתבו ביומן מה היה הערב.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/dashboard#journal" className="min-h-12 bg-[#D9361F] px-6 py-3 font-bold text-white">ליומן</Link>
                <button onClick={() => { setDir(-1); setI(0); }} className="min-h-12 border border-[#EFE6D8]/30 px-6 font-bold">מההתחלה</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {card && (
        <nav className="relative flex items-center justify-between px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8" aria-label="מעבר בין קלפים">
          <button onClick={() => go(-1)} disabled={i === 0} className="flex h-12 items-center gap-1 px-3 font-bold disabled:opacity-30">
            <ChevronRight size={20} aria-hidden /> הקודם
          </button>
          <div className="flex gap-1.5" aria-hidden="true">
            {deck.map((c, k) => (
              <span key={c.n} className={cn('h-1.5 w-1.5 rounded-full', k === i ? 'bg-gold' : k < i ? 'bg-[#EFE6D8]/50' : 'bg-[#EFE6D8]/20')} />
            ))}
          </div>
          <button onClick={() => go(1)} className="flex h-12 items-center gap-1 px-3 font-bold text-gold">
            {i === deck.length - 1 ? 'סיום' : 'הבא'} <ChevronLeft size={20} aria-hidden />
          </button>
        </nav>
      )}
    </div>
  );
};

/** Rendered on <body>, above the site's navbar and floating buttons. */
export const Evening = () => createPortal(<EveningInner />, document.body);

export default Evening;

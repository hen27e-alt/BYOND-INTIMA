import { E } from '../components/EditableText';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CardBack, CardFront, MissionCard } from '../components/season/MissionCard';
import { Ticket } from '../components/season/Ticket';
import { MISSION_CARDS, SUITS, type SuitId } from '../data/missionCards';
import { useSeasonSettings } from '../lib/catalogue';
import { cn } from '../lib/utils';

const pad = (n: number) => String(n).padStart(2, '0');

const shuffle = <T,>(xs: T[]) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** The mission deck: draw one card at a time, browse the whole deck, or print it. */
export const MissionCards = () => {
  const { seasonNumber } = useSeasonSettings();
  const reduce = useReducedMotion();
  const [suit, setSuit] = useState<SuitId | 'all'>('all');
  const pool = useMemo(() => MISSION_CARDS.filter((c) => suit === 'all' || c.suit === suit), [suit]);
  const [order, setOrder] = useState(() => shuffle(MISSION_CARDS.map((c) => c.n)));
  const [pos, setPos] = useState(-1); // -1: the deck is face down
  const [flipped, setFlipped] = useState(true);

  const deck = order.filter((n) => pool.some((c) => c.n === n));
  const current = pos >= 0 ? MISSION_CARDS.find((c) => c.n === deck[pos]) : undefined;
  const left = deck.length - (pos + 1);

  const pickSuit = (s: SuitId | 'all') => {
    setSuit(s);
    setPos(-1);
    setFlipped(true);
  };

  const draw = () => {
    if (left <= 0) {
      setOrder(shuffle(MISSION_CARDS.map((c) => c.n)));
      setPos(-1);
      setFlipped(true);
      return;
    }
    setFlipped(true);
    window.setTimeout(() => {
      setPos((p) => p + 1);
      setFlipped(false);
    }, reduce ? 0 : 280);
  };

  const shown = current ?? pool[0];

  return (
    <div className="bg-paper pt-16 text-ink md:pt-20">
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body * { visibility: hidden !important; }
          #print-sheet, #print-sheet * { visibility: visible !important; }
          #print-sheet { position: absolute; inset: 0; display: grid !important; grid-template-columns: repeat(3, 63mm); grid-auto-rows: 88mm; gap: 4mm; justify-content: center; }
          #print-sheet > div { break-inside: avoid; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <header className="mx-auto max-w-[1440px] px-4 pt-12 md:px-8 lg:px-14 lg:pt-20">
        <div className="grid gap-6 border-b-[3px] border-ink pb-8 lg:grid-cols-[1fr_minmax(0,460px)] lg:items-end">
          <h1 className="font-display text-[clamp(4.5rem,13vw,11rem)] font-bold leading-[0.8]"><E id="cards_title">קלפי המשימה</E></h1>
          <p className="text-lg leading-relaxed text-ink/80">
            {MISSION_CARDS.length} משימות לערב, בשלוש חפיסות לפי שעות הלילה. שולפים קלף, עושים מה שכתוב, ומעבירים את התור. כל מארז מגיע עם החפיסה שלו.
          </p>
          <Link
            to={suit === 'all' ? '/evening' : `/evening/${suit}`}
            className="glow-oxblood inline-flex min-h-12 items-center justify-between gap-4 border border-gold/50 px-5 text-base font-bold hover:border-gold lg:col-start-2"
          >
            <span>
              <span className="text-gold">מצב ערב</span>
              <span className="ms-2 font-normal text-ink/70">קלף אחרי קלף, מסך מלא, בלי הסחות</span>
            </span>
            <span aria-hidden="true">←</span>
          </Link>
        </div>
        <div role="group" aria-label="בחירת חפיסה" className="flex flex-wrap gap-x-1 gap-y-2 border-b border-ink py-3">
          {(['all', 'dusk', 'midnight', 'dawn'] as const).map((s) => (
            <button
              key={s}
              onClick={() => pickSuit(s)}
              aria-pressed={suit === s}
              className={cn('flex items-baseline gap-2 px-4 py-2 text-base font-bold', suit === s ? 'bg-ink text-paper' : 'hover:text-spot')}
            >
              {s === 'all' ? 'כל החפיסות' : SUITS[s].he}
              {s !== 'all' && (
                <bdi dir="ltr" className="text-xs tabular-nums opacity-70">
                  {SUITS[s].hour}
                </bdi>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* The table: one card in play */}
      <section aria-label="שליפת קלף" className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-12 md:px-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-20 lg:px-14 lg:py-20">
        <div className="relative mx-auto w-full max-w-[340px] lg:max-w-none">
          {/* the rest of the deck, stacked behind */}
          <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 border-[3px] border-ink bg-room" />
          <div aria-hidden="true" className="absolute inset-0 translate-x-1.5 translate-y-1.5 border-[3px] border-ink bg-room" />
          <MissionCard card={shown} flipped={flipped || !current} season={seasonNumber} onClick={draw} label={current && !flipped ? undefined : 'לשלוף קלף'} />
        </div>

        <div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current && !flipped ? current.n : 'deck'}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              aria-live="polite"
            >
              {current && !flipped ? (
                <>
                  <p className="text-base font-bold text-spot">
                    {SUITS[current.suit].he} · קלף {pad(current.n)}
                  </p>
                  <p className="mt-2 font-display text-[clamp(3rem,7vw,5.5rem)] font-bold leading-[0.85]">{current.title}</p>
                  <p className="mt-4 max-w-[40ch] text-2xl font-bold leading-snug">{current.text}</p>
                </>
              ) : (
                <>
                  <p className="font-display text-[clamp(3rem,7vw,5.5rem)] font-bold leading-[0.85]">החפיסה מוכנה.</p>
                  <p className="mt-4 max-w-[40ch] text-xl leading-relaxed text-ink/80">
                    {suit === 'all' ? 'מכל שלוש החפיסות, מעורבב.' : `חפיסת ${SUITS[suit].he}: ${SUITS[suit].note}.`} לוחצים על הקלף או על הכרטיס כדי לשלוף.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Ticket label={left <= 0 ? 'לערבב מחדש' : current ? 'הקלף הבא' : 'לשלוף קלף'} stub={pad(Math.max(left, 0))} stubCaption="נשארו" tone="spot" onClick={draw} />
            <button onClick={() => window.print()} className="text-base font-bold underline underline-offset-4 hover:text-spot">
              להדפיס את החפיסה
            </button>
          </div>
        </div>
      </section>

      {/* The whole deck, laid out */}
      <section className="bg-surface">
        <div className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 lg:px-14 lg:py-24">
          <h2 className="flex flex-wrap items-baseline justify-between gap-3 border-b-[3px] border-ink pb-3 font-display text-6xl font-bold leading-none md:text-7xl">
            כל הקלפים
            <span className="font-sans text-base font-bold">{pool.length} קלפים</span>
          </h2>
          <ul className="grid grid-cols-2 gap-4 pt-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {pool.map((c) => (
              <li key={c.n}>
                <MissionCard card={c} season={seasonNumber} />
              </li>
            ))}
            <li>
              <div className="aspect-[63/88]">
                <CardBack season={seasonNumber} />
              </div>
              <p className="mt-2 text-sm font-bold text-ink/70">גב הקלף</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-room text-paper">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-8 px-4 py-16 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:py-20">
          <p className="max-w-[20ch] font-display text-[clamp(3.5rem,8vw,6.5rem)] font-bold leading-[0.85]"><E id="cards_print_title">החפיסה המודפסת מגיעה במארז.</E></p>
          <div className="flex flex-col items-start gap-3">
            <Ticket label="לבחור מארז" stub="03" stubCaption="מארזים" tone="spot" to="/experience" />
            <Link to="/boutique" className="text-sm font-bold underline underline-offset-4 hover:text-[var(--color-accent-light)]">
              לבוטיק
            </Link>
          </div>
        </div>
      </section>

      {/* Print layout: 9 cards a page at real card size (63 × 88 mm) */}
      <div id="print-sheet" className="hidden" aria-hidden="true">
        {pool.map((c) => (
          <div key={c.n}>
            <CardFront card={c} season={seasonNumber} />
          </div>
        ))}
      </div>
    </div>
  );
};

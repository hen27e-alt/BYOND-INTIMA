import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { BOX_IDS } from '../../data/season';
import { type Product } from '../../lib/catalogue';
import { Ticket } from './Ticket';
import { cn } from '../../lib/utils';

type Answer = { label: string; score: [number, number, number]; gift?: boolean };
type Question = { q: string; answers: Answer[] };

// Each answer leans toward Dusk, Midnight or Until-dawn; the highest total wins.
const QUESTIONS: Question[] = [
  {
    q: 'כמה זמן יש לכם?',
    answers: [
      { label: 'שעה, שעתיים', score: [2, 0, 0] },
      { label: 'ערב שלם', score: [0, 2, 0] },
      { label: 'כל הלילה', score: [0, 0, 2] },
    ],
  },
  {
    q: 'איזה ערב מתחשק לכם?',
    answers: [
      { label: 'צחוק, משחק, קלילות', score: [2, 0, 0] },
      { label: 'רוך, מגע, האטה', score: [0, 2, 0] },
      { label: 'עומק, אמת ותשוקה', score: [0, 0, 2] },
    ],
  },
  {
    q: 'כמה רחוק בא לכם ללכת?',
    answers: [
      { label: 'בעדינות, להתחיל', score: [2, 1, 0] },
      { label: 'קצת מעבר למה שאנחנו רגילים', score: [0, 2, 1] },
      { label: 'לגלות דברים חדשים', score: [0, 1, 2] },
    ],
  },
  {
    q: 'למי הערב הזה?',
    answers: [
      { label: 'לנו', score: [0, 0, 0] },
      { label: 'מתנה לזוג אחר', score: [1, 1, 0], gift: true },
    ],
  },
];

/** "Which box is yours?" Four quick questions, then one box with its price and an add button. */
export const BoxQuiz = ({ products }: { products: Product[] }) => {
  const reduce = useReducedMotion();
  const { addToCart, openCart } = useCart();
  const [step, setStep] = useState(-1);
  const [picks, setPicks] = useState<number[]>([]);

  const choose = (i: number) => {
    const next = [...picks.slice(0, step), i];
    setPicks(next);
    setStep(step + 1);
  };

  const totals = [0, 0, 0];
  picks.forEach((a, qi) => QUESTIONS[qi].answers[a].score.forEach((v, k) => (totals[k] += v)));
  const winner = totals.indexOf(Math.max(...totals));
  const box = products.find((p) => p.id === BOX_IDS[winner]);
  const gift = picks[3] !== undefined && QUESTIONS[3].answers[picks[3]].gift;
  const done = step >= QUESTIONS.length;

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, x: -24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 24 }, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <section id="quiz" aria-labelledby="quiz-title" className="glow-dawn scroll-mt-24 border-y border-ink/20">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 md:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:px-14 lg:py-16">
        <div>
          <p className="text-sm font-bold text-gold">לא בטוחים איזה?</p>
          <h2 id="quiz-title" className="mt-2 font-display text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[0.85]">
            ארבע שאלות,
            <br />
            מארז אחד.
          </h2>
          {step >= 0 && !done && (
            <div className="mt-6 flex gap-1.5" aria-hidden="true">
              {QUESTIONS.map((_, i) => (
                <span key={i} className={cn('h-px flex-1', i <= step ? 'bg-gold' : 'bg-ink/20')} />
              ))}
            </div>
          )}
        </div>

        <div className="min-h-[260px]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {step === -1 && (
              <motion.div key="start" {...slide} className="flex h-full flex-col items-start justify-center gap-5">
                <p className="max-w-[44ch] text-lg text-ink/80">שלושה מארזים, שלושה אורכי ערב. ענו בכנות, ונגיד לכם עם איזה להתחיל.</p>
                <Ticket label="להתחיל" stub="04" stubCaption="שאלות" tone="spot" size="md" onClick={() => setStep(0)} />
              </motion.div>
            )}

            {step >= 0 && !done && (
              <motion.fieldset key={`q${step}`} {...slide}>
                <legend className="font-display text-4xl font-bold leading-tight md:text-5xl">{QUESTIONS[step].q}</legend>
                <div className="mt-6 grid gap-2">
                  {QUESTIONS[step].answers.map((a, i) => (
                    <button
                      key={a.label}
                      onClick={() => choose(i)}
                      className={cn(
                        'group flex min-h-14 items-center justify-between border px-5 text-start text-lg transition-colors',
                        picks[step] === i ? 'border-gold bg-gold/10' : 'border-ink/30 hover:border-gold hover:bg-gold/5'
                      )}
                    >
                      {a.label}
                      <ArrowLeft size={18} className="text-gold opacity-0 transition-opacity group-hover:opacity-100 ltr:rotate-180" aria-hidden />
                    </button>
                  ))}
                </div>
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="mt-4 text-sm font-bold text-ink/60 underline underline-offset-4 hover:text-ink">
                    לשאלה הקודמת
                  </button>
                )}
              </motion.fieldset>
            )}

            {done && box && (
              <motion.div key="result" {...slide} className="grid items-center gap-6 sm:grid-cols-[180px_1fr]">
                <img src={box.image} alt="" className="aspect-square w-full max-w-[180px] border border-gold/30 object-cover" />
                <div>
                  <p className="text-sm font-bold text-gold">המארז שלכם</p>
                  <p className="text-sheen mt-1 font-display text-5xl font-bold leading-none md:text-6xl">{box.name}</p>
                  <p className="mt-3 max-w-[48ch] text-ink/80">{box.description}</p>
                  {gift && <p className="mt-2 text-sm text-gold">אריזת מתנה וכרטיס ברכה בלי עלות, בקופה.</p>}
                  <div className="mt-5 flex flex-wrap items-center gap-5">
                    {!box.soldOut && (
                      <Ticket
                        label="להוסיף לסל"
                        stub={`₪${box.price}`}
                        tone="spot"
                        size="md"
                        onClick={() => {
                          addToCart(box.id);
                          openCart();
                        }}
                      />
                    )}
                    <a href={`#${box.id}`} className="text-sm font-bold underline underline-offset-4 hover:text-spot">מה יש בפנים</a>
                    <button onClick={() => { setPicks([]); setStep(0); }} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 hover:text-ink">
                      <RotateCcw size={14} aria-hidden /> שוב מההתחלה
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

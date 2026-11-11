import React, { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { Ticket } from './Ticket';
import { cn } from '../../lib/utils';

type Box = { id: string; name: string; image: string; price: number; features?: string[]; soldOut?: boolean };

/** One thing out of the box: it rises into view as the lid comes off. */
const Item = ({ progress, at, n, children }: { progress: MotionValue<number>; at: number; n: number; children: React.ReactNode }) => {
  const opacity = useTransform(progress, [at, at + 0.08], [0, 1]);
  const y = useTransform(progress, [at, at + 0.1], [28, 0]);
  return (
    <motion.li style={{ opacity, y }} className="flex items-baseline gap-4 border-b border-ink/20 py-2 md:py-3">
      <span className="text-sheen font-display text-2xl tabular-nums">{String(n).padStart(2, '0')}</span>
      <span className="text-base md:text-xl">{children}</span>
    </motion.li>
  );
};

/**
 * "Opening the box": a pinned scene where scrolling lifts the lid and the contents
 * come out one by one. Reduced motion shows the open box and the list at once.
 */
export const Unboxing = ({ boxes, he, onAdd }: { boxes: Box[]; he: boolean; onAdd: (b: Box) => void }) => {
  const tx = (h: string, e: string) => (he ? h : e);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [pick, setPick] = useState(Math.min(1, boxes.length - 1));
  const box = boxes[pick];
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const sleeveY = useTransform(scrollYProgress, [0.04, 0.34], ['0%', '-104%']);
  const inner = useTransform(scrollYProgress, [0.12, 0.4], [0, 1]);
  const hint = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const cta = useTransform(scrollYProgress, [0.82, 0.9], [0, 1]);

  if (!box) return null;
  const features = box.features ?? [];
  const step = features.length ? 0.42 / features.length : 0;

  const visual = (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px]">
      {/* light from inside the box */}
      <motion.div
        aria-hidden="true"
        style={reduce ? { opacity: 1 } : { opacity: inner }}
        className="absolute inset-x-[-20%] top-[-12%] h-[70%] bg-[radial-gradient(50%_60%_at_50%_55%,rgba(232,201,138,.45),rgba(217,54,31,.22)_45%,transparent_75%)] blur-2xl"
      />
      <div className="absolute inset-0 overflow-hidden border border-gold/30">
        <img src={box.image} alt={box.name} className="h-full w-full object-cover" />
        {/* the black sleeve the box ships in, drawn off upwards */}
        {!reduce && (
          <motion.div
            aria-hidden="true"
            style={{ y: sleeveY }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[linear-gradient(160deg,#1E1917_0%,#0A0809_55%,#140D0C_100%)] shadow-[0_30px_40px_rgba(0,0,0,.7)]"
          >
            <span className="absolute inset-3 border border-gold/35" />
            <span className="wordmark text-2xl md:text-3xl" dir="ltr">BYOND INTIMA</span>
            <span className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <span className="text-xs font-bold text-gold/80">{box.name}</span>
          </motion.div>
        )}
      </div>
    </div>
  );

  const picker = boxes.length > 1 && (
    <div role="tablist" aria-label={tx('בחירת מארז', 'Choose a box')} className="flex flex-wrap gap-2">
      {boxes.map((b, i) => (
        <button
          key={b.id}
          role="tab"
          aria-selected={i === pick}
          onClick={() => setPick(i)}
          className={cn(
            'min-h-11 border px-4 text-sm font-bold transition-colors',
            i === pick ? 'border-gold bg-gold/10 text-gold' : 'border-ink/30 text-ink/70 hover:border-gold/60 hover:text-ink'
          )}
        >
          {b.name.replace(/^מארז /, '')}
        </button>
      ))}
    </div>
  );

  const text = (list: React.ReactNode) => (
    <div>
      <p className={cn('text-sm font-bold text-gold', !he && 'text-xs uppercase tracking-[0.3em]')}>{tx('פותחים את המארז', 'Opening the box')}</p>
      <h2 className="mt-2 font-display text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.85] md:mt-3">{box.name}</h2>
      <div className="mt-4 md:mt-6">{picker}</div>
      <ol className="mt-3 md:mt-6">{list}</ol>
    </div>
  );

  const add = !box.soldOut && <Ticket label={tx('להוסיף לסל', 'Add to cart')} stub={`₪${box.price}`} tone="spot" onClick={() => onAdd(box)} />;

  if (reduce) {
    return (
      <section className="glow-oxblood border-y border-ink/20">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-16 md:px-8 lg:grid-cols-2 lg:px-14">
          {visual}
          <div>
            {text(features.map((f, i) => (
              <li key={f} className="flex items-baseline gap-4 border-b border-ink/20 py-3">
                <span className="text-sheen font-display text-2xl tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-lg md:text-xl">{f}</span>
              </li>
            )))}
            <div className="mt-8">{add}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="glow-oxblood relative h-[300svh] border-y border-ink/20" aria-label={tx('פותחים את המארז', 'Opening the box')}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1440px] items-center gap-4 px-4 pb-20 pt-16 md:px-8 lg:grid-cols-2 lg:gap-14 lg:pb-0 lg:px-14">
          <div className="mx-auto w-[min(40vw,30svh,420px)] lg:w-full">{visual}</div>
          <div>
            {text(
              features.map((f, i) => (
                <Item key={`${box.id}-${f}`} progress={scrollYProgress} at={0.36 + i * step} n={i + 1}>
                  {f}
                </Item>
              ))
            )}
            <motion.div style={{ opacity: cta }} className="mt-4 md:mt-8">{add}</motion.div>
          </div>
        </div>
        <motion.p style={{ opacity: hint }} aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-sm font-bold text-ink/50">
          {tx('גללו כדי לפתוח', 'Scroll to open')}
        </motion.p>
      </div>
    </section>
  );
};

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

/**
 * The season as a path through the night: one light per evening, lit in gold once
 * it's done, the next one breathing. The line fills as far as you've come.
 */
export const SeasonPath = ({ evenings, done, nextN }: { evenings: { n: number; he: string }[]; done: number[]; nextN?: number }) => {
  const reduce = useReducedMotion();
  const count = evenings.length;
  const lit = evenings.filter((e) => done.includes(e.n)).length;
  const fill = count > 1 ? Math.min(1, lit / count) : 0;

  return (
    <div className="relative py-8" aria-label={`${lit} מתוך ${count} ערבים של העונה`}>
      <div className="absolute inset-x-[calc(100%/var(--n)/2)] top-[calc(2rem+7px)] h-px bg-ink/20" style={{ ['--n' as string]: count }}>
        <motion.div
          className="h-px bg-gradient-to-l from-[#F4E4BE] via-[#C9A66B] to-[#D9361F]"
          style={{ transformOrigin: 'right' }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: fill }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${count}, minmax(0,1fr))` }}>
        {evenings.map((e, i) => {
          const isDone = done.includes(e.n);
          const isNext = e.n === nextN;
          return (
            <li key={e.n} className="flex flex-col items-center gap-2 text-center">
              <span className="relative grid h-4 w-4 place-items-center">
                {isNext && !reduce && <span className="absolute inset-[-6px] animate-ping rounded-full bg-[#D9361F]/40" />}
                <motion.span
                  initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: reduce ? 0 : 0.15 + i * 0.08, duration: 0.35 }}
                  className={cn(
                    'h-3.5 w-3.5 rounded-full border',
                    isDone && 'border-[#E8C98A] bg-[#C9A66B] shadow-[0_0_14px_rgba(232,201,138,.7)]',
                    isNext && 'border-[#D9361F] bg-[#D9361F]',
                    !isDone && !isNext && 'border-ink/40 bg-transparent'
                  )}
                />
              </span>
              <span className={cn('hidden text-xs font-bold leading-tight sm:block', isDone ? 'text-gold' : isNext ? 'text-ink' : 'text-ink/45')}>{e.he}</span>
              <span className="text-xs tabular-nums text-ink/50 sm:hidden">{String(e.n).padStart(2, '0')}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SUITS, type MissionCard as Card } from '../../data/missionCards';
import { cn } from '../../lib/utils';

const pad = (n: number) => String(n).padStart(2, '0');

/** The night axis printed on every card: 18:00 to 06:00, with the suit's hour marked. */
const HOURS = ['18', '20', '22', '00', '02', '04', '06'];

/**
 * Each suit is printed on its own stock, so the deck sorts itself by colour:
 * dusk on paper, midnight on the dark room, until-dawn on the spot red.
 */
const STOCK = {
  dusk: { face: 'bg-paper text-ink', number: 'text-spot', rule: 'border-ink', mark: 'bg-spot', track: 'bg-ink/15', muted: 'text-ink/65' },
  midnight: { face: 'bg-room text-paper', number: 'text-[var(--color-accent-light)]', rule: 'border-paper', mark: 'bg-[var(--color-accent-light)]', track: 'bg-paper/20', muted: 'text-paper/65' },
  dawn: { face: 'bg-spot text-paper', number: 'text-ink', rule: 'border-paper', mark: 'bg-ink', track: 'bg-paper/30', muted: 'text-paper/80' },
} as const;

const minutesLabel = (m: number) => (m === 1 ? 'דקה' : m >= 60 ? 'שעה ומעלה' : `${m} דקות`);

export const CardFront = ({ card, season = 1 }: { card: Card; season?: number }) => {
  const s = STOCK[card.suit];
  const suit = SUITS[card.suit];
  const at = HOURS.indexOf(suit.hour.slice(0, 2));
  return (
    <div className={cn('@container flex h-full w-full flex-col border-[3px] border-ink', s.face)} dir="rtl">
      <div className="flex items-start justify-between px-[6cqw] pt-[5cqw]">
        <span className={cn('font-display font-bold leading-[0.8] tabular-nums text-[22cqw]', s.number)}>{pad(card.n)}</span>
        <span className="pt-[2cqw] text-end">
          <span className="block text-[5.2cqw] font-black leading-tight">{suit.he}</span>
          <bdi dir="ltr" className={cn('block text-[4.4cqw] font-bold tabular-nums', s.muted)}>
            {suit.hour}
          </bdi>
        </span>
      </div>

      <h3 className={cn('mx-[6cqw] mt-[3cqw] border-b-[3px] pb-[2cqw] font-display text-[13cqw] font-bold leading-[0.85]', s.rule)}>{card.title}</h3>
      <p className="mx-[6cqw] mt-[4cqw] flex-1 text-[6.4cqw] font-bold leading-[1.3]">{card.text}</p>

      <div className="mx-[6cqw] mb-[3cqw]" aria-hidden="true">
        <div className={cn('relative h-[1.6cqw] w-full', s.track)}>
          <span className={cn('absolute top-0 h-full w-[16.66%]', s.mark)} style={{ insetInlineStart: `${(Math.max(at, 0) / 6) * 100 - 8.33}%` }} />
        </div>
        <div className={cn('mt-[1cqw] flex justify-between text-[3.4cqw] font-bold tabular-nums', s.muted)} dir="ltr">
          {[...HOURS].reverse().map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
      </div>

      <div className={cn('flex items-center justify-between border-t-[3px] border-dashed px-[6cqw] py-[3cqw] text-[4.2cqw] font-bold', s.rule)}>
        <span>{minutesLabel(card.minutes)}</span>
        <span className={s.muted}>BYOND INTIMA · עונה {pad(season)}</span>
      </div>
    </div>
  );
};

export const CardBack = ({ season = 1 }: { season?: number }) => (
  <div className="@container flex h-full w-full items-center justify-center border-[3px] border-ink bg-room p-[5cqw] text-paper" dir="rtl">
    <div className="flex h-full w-full flex-col items-center justify-between border-2 border-dashed border-paper/40 py-[8cqw] text-center">
      <span className="text-[4.4cqw] font-bold text-paper/70">קלפי המשימה</span>
      <span className="font-display font-bold leading-[0.82]">
        <span className="block text-[19cqw]">BYOND</span>
        <span className="block text-[19cqw]">INTIMA</span>
      </span>
      <span className="flex flex-col items-center">
        <span className="font-display text-[16cqw] font-bold leading-none text-[var(--color-accent-light)] tabular-nums">{pad(season)}</span>
        <span className="text-[4.2cqw] font-bold text-paper/70">עונה</span>
      </span>
    </div>
  </div>
);

/** A card that turns over. `flipped` shows the back. */
export const MissionCard = ({
  card,
  flipped = false,
  season = 1,
  className,
  onClick,
  label,
}: {
  card: Card;
  flipped?: boolean;
  season?: number;
  className?: string;
  onClick?: () => void;
  label?: string;
}) => {
  const reduce = useReducedMotion();
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={label ?? (flipped ? 'קלף הפוך' : `קלף ${card.n}: ${card.title}. ${card.text}`)}
      className={cn('relative block aspect-[63/88] w-full text-start [perspective:1400px]', onClick && 'cursor-pointer', className)}
    >
      <motion.span
        className="absolute inset-0 block [transform-style:preserve-3d]"
        initial={false}
        animate={reduce ? { opacity: 1 } : { rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <span className={cn('absolute inset-0 block [backface-visibility:hidden]', reduce && flipped && 'invisible')}>
          <CardFront card={card} season={season} />
        </span>
        <span className={cn('absolute inset-0 block [backface-visibility:hidden]', !reduce && '[transform:rotateY(180deg)]', reduce && !flipped && 'invisible')}>
          <CardBack season={season} />
        </span>
      </motion.span>
    </Tag>
  );
};

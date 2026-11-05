import React from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

type TicketProps = {
  /** Main label, e.g. "להצטרף למנוי". */
  label: string;
  /** Big text on the stub, e.g. the season number or a price. */
  stub: string;
  /** Small caption under the stub text. */
  stubCaption?: string;
  /** Internal link target. When set, the ticket is a link. */
  to?: string;
  /** Click handler; runs after the stub tears. */
  onClick?: () => void;
  disabled?: boolean;
  size?: 'lg' | 'md';
  tone?: 'ink' | 'spot';
  className?: string;
};

/**
 * The primary action of the season-programme world: a ticket with a
 * perforated stub. On press the stub tears along the perforation and drops,
 * then the action runs.
 */
export const Ticket = ({ label, stub, stubCaption, to, onClick, disabled, size = 'lg', tone = 'ink', className }: TicketProps) => {
  const controls = useAnimationControls();
  const reduce = useReducedMotion();
  const [torn, setTorn] = React.useState(false);

  const tear = async () => {
    if (disabled || torn) return;
    if (!reduce) {
      setTorn(true);
      await controls.start({ x: -14, y: 26, rotate: -9, opacity: 0, transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] } });
    }
    onClick?.();
    if (!reduce) {
      controls.set({ x: 0, y: -8, rotate: 0, opacity: 0 });
      await controls.start({ y: 0, opacity: 1, transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] } });
      setTorn(false);
    }
  };

  const body = (
    <>
      <span
        className={cn(
          'flex flex-1 items-center justify-center px-6 font-black text-[var(--color-bg)] transition-colors',
          tone === 'ink' ? 'bg-ink group-hover:bg-spot' : 'bg-spot group-hover:bg-ink',
          size === 'lg' ? 'text-xl md:text-2xl' : 'text-base md:text-lg',
          disabled && 'bg-ink/40 group-hover:bg-ink/40'
        )}
      >
        {label}
      </span>
      <motion.span
        animate={controls}
        aria-hidden="true"
        style={{ borderInlineStartStyle: 'dashed' }}
        className={cn(
          'flex flex-col items-center justify-center border-[3px] border-ink bg-paper text-spot',
          size === 'lg' ? 'w-28 md:w-36' : 'w-20 md:w-24'
        )}
      >
        <span className={cn('font-display font-bold leading-[0.85]', size === 'lg' ? 'text-4xl md:text-5xl' : 'text-3xl')}>{stub}</span>
        {stubCaption && <span className="mt-1 text-[11px] font-bold text-ink">{stubCaption}</span>}
      </motion.span>
    </>
  );

  const shared = cn(
    'group flex items-stretch select-none',
    size === 'lg' ? 'h-20 md:h-24' : 'h-14 md:h-16',
    disabled && 'cursor-not-allowed',
    className
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={shared} onClick={() => void tear()}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" className={shared} onClick={() => void tear()} disabled={disabled} aria-disabled={disabled}>
      {body}
    </button>
  );
};

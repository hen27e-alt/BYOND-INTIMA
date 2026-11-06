import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const KEY = 'cookie-consent';

const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return 'unavailable';
  }
};

/** A small ruled notice in the corner; both choices are equally easy, and nothing loads behind it. */
export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (read()) return;
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const choose = (value: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* private mode: just close */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="region"
          aria-label="עוגיות"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed inset-x-4 bottom-20 z-[100] border-[3px] border-ink bg-paper p-5 text-ink shadow-[6px_6px_0_var(--color-ink)] lg:bottom-6 lg:end-auto lg:start-6 lg:max-w-sm"
        >
          <p className="font-display text-3xl font-bold leading-none">עוגיות</p>
          <p className="mt-2 text-base leading-relaxed text-ink/80">
            אנחנו משתמשים בעוגיות כדי לזכור את הסל וההעדפות שלכם, ולהבין איך משתמשים באתר.{' '}
            <Link to="/legal#privacy" className="font-bold underline underline-offset-4 hover:text-spot">
              מדיניות הפרטיות
            </Link>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => choose('accepted')} className="bg-ink px-4 py-2.5 font-bold text-paper hover:bg-spot">
              מאשרים
            </button>
            <button onClick={() => choose('declined')} className="border-2 border-ink px-4 py-2.5 font-bold hover:bg-ink hover:text-paper">
              רק ההכרחיות
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

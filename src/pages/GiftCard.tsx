import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { E } from '../components/EditableText';
import { Ticket } from '../components/season/Ticket';
import { useCart } from '../contexts/CartContext';
import { useCatalogue, visible } from '../lib/catalogue';
import { cn } from '../lib/utils';

// Which box each amount covers, so the choice reads as "an evening", not a number.
const COVERS: Record<string, string> = { gift_card_300: 'מספיק למארז דמדומים', gift_card_600: 'מספיק למארז חצות', gift_card_900: 'מספיק למארז עד אור הבוקר' };

const NAME_MAX = 24;
const NOTE_MAX = 80;

/** The card itself, drawn live from what's typed: foil edge, amount, who it's for, the note. */
const CardPreview = ({ amount, to, note }: { amount: number; to: string; note: string }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { rotate: -6, y: 24, opacity: 0 }}
      animate={{ rotate: -3, y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto aspect-[1.586] w-full max-w-[520px] rounded-2xl p-[1.5px] shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)]"
      style={{ background: 'linear-gradient(115deg,#8E6B3A,#F4E4BE 25%,#C9A66B 50%,#FBEFD2 75%,#8E6B3A)' }}
      aria-hidden
    >
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[15px] bg-[linear-gradient(135deg,#241C1B,#120E0E_55%,#0A0808)] p-6 md:p-8">
        <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-[#D9361F]/25 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <span dir="ltr" className="font-display text-sm tracking-[0.35em] text-gold">
            BYOND INTIMA
          </span>
          <span className="text-xs font-bold tracking-widest text-gold/70">כרטיס מתנה</span>
        </div>
        <div className="relative">
          <motion.p
            key={amount}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sheen font-display text-6xl font-bold leading-none tabular-nums md:text-7xl"
          >
            ₪{amount}
          </motion.p>
          <p className="mt-3 min-h-[1.5em] text-lg font-bold text-ink">{to ? `ל${to}` : 'לשניים'}</p>
          <p className="min-h-[1.4em] text-sm leading-snug text-ink/70">{note || 'לערב אחד, רק שלכם.'}</p>
        </div>
        <p dir="ltr" className="relative self-end font-mono text-sm tracking-[0.2em] text-ink/40">
          BYND-····-····
        </p>
      </div>
    </motion.div>
  );
};

export const GiftCard = () => {
  const { addToCart, openCart } = useCart();
  const { products } = useCatalogue();
  const cards = useMemo(() => products.filter((p) => p.giftCard && visible(p)).sort((a, b) => a.price - b.price), [products]);
  const [pick, setPick] = useState('gift_card_600');
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');
  const [added, setAdded] = useState(false);
  const chosen = cards.find((c) => c.id === pick) ?? cards[0];

  const add = () => {
    if (!chosen || chosen.soldOut) return;
    addToCart(chosen.id, to.trim() || note.trim() ? { name: to.trim(), dedication: note.trim() } : undefined);
    setAdded(true);
    openCart();
  };

  return (
    <div className="bg-paper pt-16 text-ink md:pt-20">
      <section className="glow-dawn">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 pb-16 pt-12 md:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center lg:gap-16 lg:px-14 lg:pt-20">
          <div>
            <h1 className="font-display text-[clamp(4rem,11vw,8.5rem)] font-bold leading-[0.82]">
              <E id="gift_title">כרטיס מתנה</E>
            </h1>
            <E id="gift_lede" as="p" multiline className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink/80">
              כשאתם לא בטוחים איזה ערב הם צריכים, תנו להם לבחור. קוד אישי שנשלח אליכם, ומממשים אותו על כל מה שבאתר.
            </E>

            <fieldset className="mt-10">
              <legend className="text-sm font-bold text-gold">כמה?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3" role="radiogroup">
                {cards.map((c) => {
                  const on = c.id === chosen?.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        setPick(c.id);
                        setAdded(false);
                      }}
                      disabled={c.soldOut}
                      className={cn(
                        'relative flex min-h-24 flex-col items-start justify-between border p-4 text-start transition-colors',
                        on ? 'border-gold bg-gold/[0.08]' : 'border-ink/25 hover:border-ink/60',
                        c.soldOut && 'opacity-40'
                      )}
                    >
                      <span className="font-display text-4xl font-bold leading-none tabular-nums">₪{c.price}</span>
                      <span className="mt-2 text-xs text-ink/70">{COVERS[c.id] ?? ''}</span>
                      {on && <Check size={16} aria-hidden className="absolute end-3 top-3 text-gold" />}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-gold">למי? (לא חובה)</span>
                <input
                  value={to}
                  maxLength={NAME_MAX}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="נועה ואיתי"
                  className="mt-2 w-full border-b border-ink/40 bg-transparent py-2 text-lg outline-none transition-colors placeholder:text-ink/35 focus:border-gold"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="flex justify-between text-sm font-bold text-gold">
                  <span>כמה מילים על הכרטיס (לא חובה)</span>
                  <span className="font-normal tabular-nums text-ink/50">
                    {note.length}/{NOTE_MAX}
                  </span>
                </span>
                <input
                  value={note}
                  maxLength={NOTE_MAX}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="מזל טוב לשנה הראשונה. באהבה, דנה"
                  className="mt-2 w-full border-b border-ink/40 bg-transparent py-2 text-lg outline-none transition-colors placeholder:text-ink/35 focus:border-gold"
                />
              </label>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Ticket label={added ? 'נוסף לסל' : 'להוסיף לסל'} stub={chosen ? `₪${chosen.price}` : '–'} tone="spot" size="md" onClick={add} disabled={!chosen || chosen.soldOut} />
              <p className="text-sm text-ink/60">דיגיטלי, בלי משלוח.</p>
            </div>
          </div>

          <div className="lg:ps-6">
            <CardPreview amount={chosen?.price ?? 0} to={to.trim()} note={note.trim()} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 lg:px-14">
        <h2 className="font-display text-5xl font-bold leading-none md:text-6xl">
          <E id="gift_how_title">איך זה עובד</E>
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {[
            ['gift_how_1', 'בוחרים סכום ומשלמים', 'כותבים למי ומה, ומשלמים כרגיל בקופה.'],
            ['gift_how_2', 'הקוד מגיע אליכם', 'אחרי התשלום מקבלים קוד אישי, והוא מופיע גם ב"ההזמנות שלי". מעבירים אותו הלאה איך שנוח: בהודעה, בכרטיס, בתוך מתנה.'],
            ['gift_how_3', 'הם בוחרים את הערב', 'מקלידים את הקוד בקופה. מה שלא נוצל נשאר ביתרה לפעם הבאה.'],
          ].map(([id, t, d], i) => (
            <li key={id} className="border-t border-ink/30 pt-5">
              <span className="text-sheen font-display text-3xl font-bold tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <E id={`${id}_t`} as="h3" className="mt-3 block text-xl font-bold">
                {t}
              </E>
              <E id={`${id}_d`} as="p" multiline className="mt-2 text-base leading-relaxed text-ink/75">
                {d}
              </E>
            </li>
          ))}
        </ol>
        <E id="gift_fine" as="p" multiline className="mt-12 max-w-[70ch] border-t border-ink/20 pt-6 text-sm leading-relaxed text-ink/60">
          הכרטיס תקף חמש שנים מיום הרכישה ואפשר לממש אותו בכמה הזמנות, עד שהיתרה נגמרת. הוא לא ניתן להמרה לכסף, ואי אפשר לקנות בו כרטיס מתנה אחר.
        </E>
        <p className="mt-3 text-sm text-ink/60">
          עוד שאלות?{' '}
          <Link to="/faq" className="font-bold underline underline-offset-4 hover:text-gold">
            שאלות ותשובות
          </Link>
        </p>
      </section>
    </div>
  );
};

export default GiftCard;

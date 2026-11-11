import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Plus } from 'lucide-react';
import { E, useSiteText } from '../components/EditableText';
import { Ticket } from '../components/season/Ticket';
import { FREE_SHIPPING_FROM, SHIPPING_FEE } from '../lib/catalogue';
import { BRANDING } from '../constants/branding';
import { cn } from '../lib/utils';

type Item = { id: string; q: string; a: string };
type Group = { title: string; items: Item[] };

// Answers state only what the site already promises elsewhere (checkout, terms).
// Every question and answer is editable from edit mode.
const GROUPS: Group[] = [
  {
    title: 'המארזים',
    items: [
      { id: 'faq_diff', q: 'מה ההבדל בין שלושת המארזים?', a: 'כל מארז הוא אורך אחר של ערב. דמדומים הוא שעה־שעתיים, קליל ומשחקי. חצות הוא ערב שלם של מגע ורוך. עד אור הבוקר הוא לילה שלם, עמוק ונועז יותר. בעמוד המארזים יש השוואה מלאה, ושאלון קצר שעוזר לבחור.' },
      { id: 'faq_cards', q: 'אפשר לקנות רק את הקלפים?', a: 'כן. לכל מארז יש חפיסת קלפי משימה בלי האביזרים, ב־₪99, והמשלוח כלול במחיר.' },
      { id: 'faq_gift', q: 'אפשר לשלוח כמתנה?', a: 'כן. בקופה מסמנים "לעטוף כמתנה" וכותבים ברכה לכרטיס. האריזה והכרטיס בלי עלות, ואין קבלה בתוך החבילה.' },
    ],
  },
  {
    title: 'משלוח ודיסקרטיות',
    items: [
      { id: 'faq_ship', q: 'כמה עולה משלוח?', a: `משלוח עולה ₪${SHIPPING_FEE}, וחינם בהזמנה מ־₪${FREE_SHIPPING_FROM}. בחפיסות הקלפים המשלוח כבר כלול.` },
      { id: 'faq_discreet', q: 'מה כתוב על החבילה?', a: 'שום דבר שמסגיר מה בפנים. החבילה נשלחת באריזה חומה ופשוטה, בלי השם שלנו ובלי תיאור של המוצר.' },
      { id: 'faq_track', q: 'איך יודעים איפה ההזמנה?', a: 'בעמוד "ההזמנות שלי" רואים את מצב ההזמנה: התקבלה, בהכנה, נשלחה, הגיעה.' },
    ],
  },
  {
    title: 'תשלום והחזרות',
    items: [
      { id: 'faq_pay', q: 'איך משלמים?', a: 'בכרטיס אשראי, בעמוד התשלום המאובטח של Stripe. אנחנו לא רואים ולא שומרים את פרטי הכרטיס. אפשר גם להשאיר הזמנה טלפונית ואנחנו נחזור אליכם.' },
      { id: 'faq_return', q: 'אפשר להחזיר?', a: 'אפשר לבטל רכישה של מוצר פיזי תוך 14 יום מקבלתו, אם לא נעשה בו שימוש והוא באריזה המקורית, לפי חוק הגנת הצרכן. הפרטים המלאים בתקנון.' },
    ],
  },
  {
    title: 'האתר והמנוי',
    items: [
      { id: 'faq_account', q: 'צריך להירשם כדי להזמין?', a: 'לא. אפשר להזמין בלי חשבון. עם חשבון יש גם את המקום שלכם: התוכנייה, היומן הזוגי, הקלפים וההזמנות.' },
      { id: 'faq_privacy', q: 'מה אתם שומרים עליי?', a: 'רק מה שצריך כדי לשלוח את ההזמנה ולהפעיל את החשבון. מה שאתם כותבים ביומן פרטי לכם. הפרטים המלאים במדיניות הפרטיות שבתקנון.' },
    ],
  },
];

const Row = ({ item, open, onToggle }: { item: Item; open: boolean; onToggle: () => void }) => {
  const reduce = useReducedMotion();
  return (
    <li className="border-b border-ink/20">
      <h3>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${item.id}-a`}
          className="flex min-h-16 w-full items-center justify-between gap-6 py-4 text-start text-lg font-bold transition-colors hover:text-gold md:text-xl"
        >
          <E id={`${item.id}_q`}>{item.q}</E>
          <Plus size={20} aria-hidden className={cn('shrink-0 text-gold transition-transform duration-300', open && 'rotate-45')} />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${item.id}-a`}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <E id={`${item.id}_a`} as="p" multiline className="max-w-[62ch] pb-6 text-lg leading-relaxed text-ink/80">
              {item.a}
            </E>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

/** Feeds the edited (or default) questions to Google as FAQPage structured data. */
const FaqSchema = () => {
  const all = GROUPS.flatMap((g) => g.items);
  const texts = all.map((i) => [useSiteText(`${i.id}_q`, i.q), useSiteText(`${i.id}_a`, i.a)] as const);
  useEffect(() => {
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: texts.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    });
    document.head.appendChild(el);
    return () => el.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(texts)]);
  return null;
};

export const Faq = () => {
  const [open, setOpen] = useState<string | null>(GROUPS[0].items[0].id);
  return (
    <div className="bg-paper pt-16 text-ink md:pt-20">
      <FaqSchema />
      <header className="glow-ember">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 pb-10 pt-12 md:px-8 lg:grid-cols-[1fr_minmax(0,460px)] lg:items-end lg:px-14 lg:pt-20">
          <h1 className="font-display text-[clamp(4.5rem,13vw,10rem)] font-bold leading-[0.8]">
            <E id="faq_title">שאלות ותשובות</E>
          </h1>
          <E id="faq_lede" as="p" multiline className="text-lg leading-relaxed text-ink/80">
            מה שזוגות שואלים לפני שהם מזמינים. לא מצאתם? כתבו לנו, אנחנו עונים בעצמנו.
          </E>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 pb-20 md:px-8 lg:px-14">
        {GROUPS.map((g, gi) => (
          <section key={g.title} className="grid gap-4 border-t border-ink/30 py-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-14">
            <h2 className="flex items-baseline gap-3 font-display text-4xl font-bold leading-none md:text-5xl">
              <span className="text-sheen tabular-nums">{String(gi + 1).padStart(2, '0')}</span>
              {g.title}
            </h2>
            <ul>
              {g.items.map((it) => (
                <Row key={it.id} item={it} open={open === it.id} onToggle={() => setOpen(open === it.id ? null : it.id)} />
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-6 flex flex-col items-start gap-6 border-t border-ink/30 pt-10 md:flex-row md:items-end md:justify-between">
          <p className="font-display text-5xl font-bold leading-none md:text-6xl">עוד שאלה?</p>
          <div className="flex flex-wrap items-center gap-6">
            <Ticket label="לכתוב לנו" stub="@" tone="spot" size="md" to="/contact" />
            <a href={`mailto:${BRANDING.email}`} className="text-sm font-bold underline underline-offset-4 hover:text-spot" dir="ltr">
              {BRANDING.email}
            </a>
            <Link to="/legal" className="text-sm font-bold underline underline-offset-4 hover:text-spot">התקנון המלא</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Faq;

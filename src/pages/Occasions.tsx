import React, { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { E } from '../components/EditableText';
import { Ticket } from '../components/season/Ticket';
import { useCart } from '../contexts/CartContext';
import { useCatalogue } from '../lib/catalogue';
import { BOX_TONE, boxDuration } from '../data/season';
import { cn } from '../lib/utils';

type Occasion = {
  slug: string;
  name: string;
  /** Next date this falls on, or null when it's the couple's own date. */
  next: (from: Date) => Date | null;
  lede: string;
  box: 'exp_spark' | 'exp_velvet' | 'exp_ecstasy';
  suit: 'dusk' | 'midnight' | 'dawn';
  why: string;
  ideas: [string, string][];
  glow: string;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Next 14 February, today included. */
const nextValentines = (from: Date) => {
  const y = from.getFullYear();
  const d = new Date(y, 1, 14);
  return d >= startOfDay(from) ? d : new Date(y + 1, 1, 14);
};

/** Next 15 Av, read off the Hebrew calendar so it's right every year. */
const nextTuBeAv = (from: Date) => {
  const f = new Intl.DateTimeFormat('en-u-ca-hebrew', { day: 'numeric', month: 'long' });
  const d = startOfDay(from);
  for (let i = 0; i < 400; i++) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    const parts = f.formatToParts(x);
    if (parts.find((p) => p.type === 'day')?.value === '15' && parts.find((p) => p.type === 'month')?.value === 'Av') return x;
  }
  return null;
};

export const OCCASIONS: Occasion[] = [
  {
    slug: 'valentines',
    name: 'ולנטיין',
    next: nextValentines,
    lede: 'לא עוד ארוחה במסעדה מלאה. ערב בבית, רק שניכם, עם תוכנית שמישהו כבר חשב עליה בשבילכם.',
    box: 'exp_velvet',
    suit: 'midnight',
    why: 'חצות הוא הערב הקלאסי: שעתיים עד ארבע של מגע, רוך והאטה. מספיק ארוך כדי לשכוח מהטלפון, מספיק קליל כדי להתחיל בו גם אחרי יום עבודה.',
    ideas: [
      ['אוכל בלי לצאת', 'מזמינים מהמקום הקבוע, אבל מגישים על השולחן הנמוך בסלון, עם נרות.'],
      ['טלפונים בחדר אחר', 'שמים את שניהם בשקית אחת, בחדר אחר, עד הבוקר.'],
      ['הקלף הראשון בעשר', 'קובעים שעה לפתוח את הקופסה. הציפייה היא חצי מהערב.'],
    ],
    glow: 'radial-gradient(70% 60% at 85% 10%, rgba(217,54,31,.32), transparent 62%), radial-gradient(55% 55% at 8% 95%, rgba(106,18,38,.4), transparent 64%)',
  },
  {
    slug: 'tu-beav',
    name: 'ט״ו באב',
    next: nextTuBeAv,
    lede: 'חג האהבה העברי נופל באמצע הקיץ. ערב חם, חלונות פתוחים, ומשהו קליל שלא דורש תכנון.',
    box: 'exp_spark',
    suit: 'dusk',
    why: 'דמדומים הוא שעה עד שעתיים של משחק וסקרנות. בדיוק בשביל ערב קיץ שמתחיל במרפסת ולא ברור איפה הוא נגמר.',
    ideas: [
      ['מתחילים בחוץ', 'מרפסת, גג או חוף בשקיעה. הקלפים הראשונים עובדים גם בחוץ.'],
      ['משהו קר לשתות', 'קנקן לימונדה, יין לבן או קוקטייל אחד שמכינים יחד.'],
      ['בלי לוח זמנים', 'לא קובעים כלום אחריו. אם הערב נמשך, שיימשך.'],
    ],
    glow: 'radial-gradient(70% 60% at 15% 5%, rgba(232,140,130,.26), transparent 62%), radial-gradient(60% 60% at 95% 100%, rgba(201,166,107,.18), transparent 66%)',
  },
  {
    slug: 'anniversary',
    name: 'יום נישואין',
    next: () => null,
    lede: 'שנה, עשר או עשרים. התאריך שלכם, ולילה שלם שמוקדש רק לו.',
    box: 'exp_ecstasy',
    suit: 'dawn',
    why: 'עד אור הבוקר הוא לילה שלם, העמוק והנועז מבין השלושה. מתאים לתאריך שרוצים לזכור, ולזוג שמכיר אחד את השנייה מספיק טוב כדי להפתיע.',
    ideas: [
      ['חוזרים לאיפה שהתחלתם', 'השיר מהחתונה, המנה מהדייט הראשון, תמונה אחת מאז על השולחן.'],
      ['מכתב אחד לכל אחד', 'כותבים מראש, קוראים בקול באמצע הערב.'],
      ['מקדישים את הקופסה', 'בקופה אפשר להוסיף שם והקדשה, ולעטוף כמתנה בלי עלות.'],
    ],
    glow: 'radial-gradient(75% 65% at 20% 0%, rgba(201,166,107,.24), transparent 62%), radial-gradient(60% 60% at 95% 100%, rgba(217,54,31,.16), transparent 66%)',
  },
];

const daysUntil = (d: Date) => Math.round((startOfDay(d).getTime() - startOfDay(new Date()).getTime()) / 864e5);
const dateLabel = (d: Date) => d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });

/** "בעוד 95 ימים", "מחר", "היום". */
const Countdown = ({ date, className }: { date: Date; className?: string }) => {
  const n = daysUntil(date);
  return (
    <p className={cn('flex items-baseline gap-3', className)}>
      {n === 0 ? (
        <span className="text-sheen font-display text-6xl font-bold leading-none">היום</span>
      ) : n === 1 ? (
        <span className="text-sheen font-display text-6xl font-bold leading-none">מחר</span>
      ) : (
        <>
          <span className="text-sm font-bold text-ink/70">בעוד</span>
          <span className="text-sheen font-display text-6xl font-bold leading-none tabular-nums">{n}</span>
          <span className="text-sm font-bold text-ink/70">ימים</span>
        </>
      )}
      <span className="ms-2 text-sm text-ink/60">{dateLabel(date)}</span>
    </p>
  );
};

/** All three, as a short list with what's coming next. */
const OccasionsIndex = () => {
  const now = new Date();
  const list = OCCASIONS.map((o) => ({ o, d: o.next(now) })).sort((a, b) => (a.d?.getTime() ?? Infinity) - (b.d?.getTime() ?? Infinity));
  return (
    <div className="bg-paper pt-16 text-ink md:pt-20">
      <header className="glow-ember">
        <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-12 md:px-8 lg:px-14 lg:pt-20">
          <h1 className="font-display text-[clamp(4rem,12vw,9rem)] font-bold leading-[0.82]">
            <E id="occ_index_title">ערבים שמסמנים</E>
          </h1>
          <E id="occ_index_lede" as="p" multiline className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink/80">
            יש תאריכים שמבקשים יותר מעוד ערב רגיל. לכל אחד מהם בחרנו מארז, וכמה רעיונות שיעזרו לו להיות שלכם.
          </E>
        </div>
      </header>
      <ul className="mx-auto max-w-[1440px] px-4 pb-24 md:px-8 lg:px-14">
        {list.map(({ o, d }) => (
          <li key={o.slug} className="border-b border-ink/20">
            <Link to={`/occasions/${o.slug}`} className="group grid gap-4 py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_auto] md:items-center">
              <span className="font-display text-5xl font-bold leading-none transition-colors group-hover:text-gold md:text-7xl">{o.name}</span>
              {d ? <Countdown date={d} /> : <span className="text-lg text-ink/70">בתאריך שלכם</span>}
              <span aria-hidden className="text-3xl text-gold transition-transform group-hover:-translate-x-2">←</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Occasions = () => {
  const { slug } = useParams();
  const reduce = useReducedMotion();
  const { addToCart, openCart } = useCart();
  const { products } = useCatalogue();
  const o = OCCASIONS.find((x) => x.slug === slug);
  const date = useMemo(() => o?.next(new Date()) ?? null, [o]);

  if (!slug) return <OccasionsIndex />;
  if (!o) return <Navigate to="/occasions" replace />;

  const box = products.find((p) => p.id === o.box);
  const tone = BOX_TONE[o.box];
  const k = (s: string) => `occ_${o.slug.replace('-', '_')}_${s}`;
  const others = OCCASIONS.filter((x) => x.slug !== o.slug);

  return (
    <div className="bg-paper pt-16 text-ink md:pt-20">
      <header style={{ backgroundImage: o.glow }}>
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 pb-16 pt-12 md:px-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:px-14 lg:pb-24 lg:pt-20">
          <div>
            <Link to="/occasions" className="text-sm font-bold text-gold hover:underline">
              ערבים שמסמנים
            </Link>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 font-display text-[clamp(4.5rem,14vw,11rem)] font-bold leading-[0.8]"
            >
              <E id={k('title')}>{o.name}</E>
            </motion.h1>
            <E id={k('lede')} as="p" multiline className="mt-6 max-w-[48ch] text-xl leading-relaxed text-ink/85">
              {o.lede}
            </E>
          </div>
          <div className="lg:pb-3">{date ? <Countdown date={date} /> : <p className="text-lg text-ink/70">התאריך שלכם. אנחנו רק מביאים את הערב.</p>}</div>
        </div>
      </header>

      {box && (
        <section className="border-t border-ink/15">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 md:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16 lg:px-14 lg:py-24">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-[420px]"
            >
              <div aria-hidden className="absolute inset-[12%] rounded-full blur-3xl" style={{ background: tone?.glow }} />
              {box.image && <img src={box.image} alt={box.name} className="relative aspect-[4/5] w-full object-cover" />}
            </motion.div>
            <div>
              <p className="text-sm font-bold tracking-wider text-gold">המארז לערב הזה</p>
              <h2 className="mt-3 font-display text-5xl font-bold leading-none md:text-7xl">
                <span style={{ backgroundImage: tone?.foil }} className="bg-clip-text text-transparent">
                  {box.name}
                </span>
              </h2>
              <p className="mt-3 text-base text-ink/70">
                {boxDuration(o.box, true)} · ₪{box.price}
              </p>
              <E id={k('why')} as="p" multiline className="mt-6 max-w-[56ch] text-lg leading-relaxed text-ink/85">
                {o.why}
              </E>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Ticket
                  label={box.soldOut ? 'אזל כרגע' : 'להוסיף לסל'}
                  stub={`₪${box.price}`}
                  tone="spot"
                  size="md"
                  disabled={!!box.soldOut}
                  onClick={() => {
                    addToCart(box.id);
                    openCart();
                  }}
                />
                <Link to="/experience" className="text-base font-bold underline underline-offset-4 hover:text-gold">
                  להשוות בין המארזים
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="glow-oxblood border-t border-ink/15">
        <div className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 lg:px-14 lg:py-24">
          <h2 className="font-display text-5xl font-bold leading-none md:text-6xl">
            <E id={k('ideas_title')}>שלושה דברים לערב הזה</E>
          </h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {o.ideas.map(([t, d], i) => (
              <li key={i} className="border-t border-gold/60 pt-5">
                <span className="text-sheen font-display text-3xl font-bold tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <E id={k(`idea${i + 1}_t`)} as="h3" className="mt-3 block text-xl font-bold">
                  {t}
                </E>
                <E id={k(`idea${i + 1}_d`)} as="p" multiline className="mt-2 text-base leading-relaxed text-ink/75">
                  {d}
                </E>
              </li>
            ))}
          </ol>
          <p className="mt-12 text-base text-ink/75">
            כבר יש לכם את הקופסה?{' '}
            <Link to={`/evening/${o.suit}`} className="font-bold underline underline-offset-4 hover:text-gold">
              לפתוח את מצב ערב
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-ink/15">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-16 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-14">
          <div>
            <h2 className="font-display text-4xl font-bold leading-none md:text-5xl">
              <E id={k('gift_title')}>זה בשביל זוג אחר?</E>
            </h2>
            <E id={k('gift_text')} as="p" multiline className="mt-3 max-w-[48ch] text-lg text-ink/75">
              כרטיס מתנה, והם בוחרים את הערב בעצמם. הקוד מגיע במייל מיד אחרי התשלום.
            </E>
          </div>
          <Ticket label="לכרטיס מתנה" stub="₪" tone="ink" size="md" to="/gift-card" />
        </div>
        <nav aria-label="ערבים נוספים" className="mx-auto flex max-w-[1440px] flex-wrap gap-x-8 gap-y-2 border-t border-ink/15 px-4 py-8 text-base font-bold md:px-8 lg:px-14">
          <span className="text-ink/60">עוד ערבים:</span>
          {others.map((x) => (
            <Link key={x.slug} to={`/occasions/${x.slug}`} className="underline underline-offset-4 hover:text-gold">
              {x.name}
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
};

export default Occasions;

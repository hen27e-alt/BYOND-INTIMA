import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useCart } from '../contexts/CartContext';
import { useAlert } from '../components/AlertModal';
import { Ticket } from '../components/season/Ticket';
import { useCatalogue, useSeasonSettings, visible } from '../lib/catalogue';
import { BOX_IDS, BOX_TONE, boxDuration } from '../data/season';
import { SUITS } from '../data/missionCards';

const pad = (n: number) => String(n).padStart(2, '0');
const HOUR_OF: Record<string, string> = { exp_spark: SUITS.dusk.hour, exp_velvet: SUITS.midnight.hour, exp_ecstasy: SUITS.dawn.hour };
const SUIT_OF: Record<string, string> = { exp_spark: SUITS.dusk.he, exp_velvet: SUITS.midnight.he, exp_ecstasy: SUITS.dawn.he };

/**
 * The hero is a dark room. A small circle of light follows the pointer (or a finger)
 * and shows what is written on the walls: this season's evenings.
 */
const DarkRoom = ({ evenings, children }: { evenings: { n: number; he: string }[]; children: React.ReactNode }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [moved, setMoved] = React.useState(false);
  // On phones the copy fills the lower half, so the light starts on the empty wall above it.
  const narrow = typeof window !== 'undefined' && window.innerWidth < 768;

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
    if (!moved) setMoved(true);
  };

  const words = (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col justify-start gap-1 overflow-hidden px-4 pt-6 md:justify-center md:px-8 md:pt-0 lg:px-14"
      style={narrow ? { WebkitMaskImage: 'linear-gradient(180deg,#000 16%,transparent 32%)', maskImage: 'linear-gradient(180deg,#000 16%,transparent 32%)' } : undefined}
    >
      {evenings.map((ev, i) => (
        <p
          key={ev.n}
          className="whitespace-nowrap font-display text-[clamp(4.5rem,13vw,12rem)] font-bold leading-[0.82]"
          style={{ paddingInlineStart: `${(i % 3) * 12}%` }}
        >
          {pad(ev.n)} {ev.he}
        </p>
      ))}
    </div>
  );

  const light = reduce ? `radial-gradient(circle ${narrow ? 200 : 340}px at ${narrow ? '45% 16%' : '28% 42%'}, #000 0%, transparent 100%)` : 'radial-gradient(circle 240px at var(--x) var(--y), #000 0%, rgba(0,0,0,.55) 45%, transparent 100%)';

  return (
    <div
      ref={ref}
      onPointerMove={reduce ? undefined : move}
      className="glow-ember relative isolate overflow-hidden"
      style={{ ['--x' as string]: narrow ? '45%' : '28%', ['--y' as string]: narrow ? '16%' : '42%' }}
    >
      {/* the walls, barely there */}
      <div className="absolute inset-0 text-ink/[0.035]">{words}</div>
      {/* the same walls, lit */}
      <div className="absolute inset-0 text-ink/45" style={{ WebkitMaskImage: light, maskImage: light }}>
        {words}
      </div>
      {/* warm falloff of the light itself */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{ background: reduce ? `radial-gradient(circle 420px at ${narrow ? '45% 16%' : '28% 42%'}, rgba(217,54,31,.14), transparent 70%)` : 'radial-gradient(circle 360px at var(--x) var(--y), rgba(217,54,31,.16), transparent 70%)' }}
      />
      <div className="relative">{children}</div>
      {!reduce && (
        <p aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-6 text-center text-sm font-bold text-ink/50 transition-opacity duration-700 ${moved ? 'opacity-0' : 'opacity-100'}`}>
          הזיזו את האור. יש פה עוד משהו.
        </p>
      )}
    </div>
  );
};

export const Home = () => {
  const { user } = useFirebase();
  const { addToCart } = useCart();
  const { showAlert } = useAlert();
  const reduce = useReducedMotion();
  const { products } = useCatalogue();
  const season = useSeasonSettings();
  const shown = products.filter(visible);
  const boxes = BOX_IDS.map((id) => shown.find((p) => p.id === id)).filter((p): p is (typeof shown)[number] => Boolean(p));
  const intermission = shown.filter((p) => p.category !== 'experience' && !p.isPremium).slice(0, 4);
  const joinTo = user ? '/dashboard' : '/login';
  const discount = season.memberDiscountPercent;

  // The night section goes from ember at dusk, to black at midnight, to a grey-warm dawn.
  const nightRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: nightRef, offset: ['start end', 'end start'] });
  const nightBg = useTransform(scrollYProgress, [0.1, 0.45, 0.85], ['#2B110C', '#09080A', '#241C17']);

  const fadeUp = (i = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { delay: i * 0.08, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const },
        };

  return (
    <div className="bg-paper pt-16 text-ink md:pt-20">
      {/* 1. The dark room */}
      <section aria-labelledby="night-title">
        <DarkRoom evenings={season.evenings}>
          <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-[1440px] flex-col justify-end px-4 pb-20 pt-16 md:px-8 lg:px-14 lg:pb-24">
            <p className="text-base font-bold text-spot">עונה {pad(season.seasonNumber)} · מהדמדומים עד אור הבוקר</p>
            <h1 id="night-title" className="mt-3 max-w-[11ch] font-display text-[clamp(4.5rem,12vw,10.5rem)] font-bold leading-[0.8]">
              הלילה הזה <span className="text-spot">שלכם.</span>
            </h1>
            <p className="mt-6 max-w-[38ch] text-xl leading-relaxed text-ink/80 md:text-2xl">
              עונה של ערבים זוגיים מודרכים. מארזים שנפתחים כשהאור יורד, משימות שלא מספרים לאף אחד, ומקום באתר שרק שניכם נכנסים אליו.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Ticket label="להצטרף למנוי" stub={pad(season.seasonNumber)} stubCaption="עונה" to={joinTo} tone="spot" />
              <a href="#night" className="text-base font-bold underline decoration-2 underline-offset-4 hover:text-spot">
                או לבחור לילה אחד
              </a>
            </div>
          </div>
        </DarkRoom>
      </section>

      {/* 2. The programme, by candlelight */}
      <section aria-labelledby="prog-title" className="border-t border-rule">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-20 md:px-8 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-16 lg:px-14 lg:py-28">
          <div>
            <h2 id="prog-title" className="font-display text-[clamp(3.5rem,8vw,6.5rem)] font-bold leading-[0.85]">
              התוכנייה
            </h2>
            <p className="mt-5 max-w-[34ch] text-lg leading-relaxed text-ink/75">שישה ערבים בעונה. כל ערב נפתח במעטפה סגורה, ואת ההמשך אתם כותבים.</p>
          </div>
          <ol className="border-t-[3px] border-ink">
            {season.evenings.map((ev, i) => (
              <motion.li
                key={ev.n}
                {...fadeUp(i)}
                className="group grid grid-cols-[56px_1fr_auto] items-baseline gap-4 border-b border-rule py-5 transition-colors md:grid-cols-[80px_1fr_1fr_auto]"
              >
                <span className="font-display text-4xl font-bold leading-none text-ink/25 tabular-nums transition-colors group-hover:text-spot md:text-6xl">{pad(ev.n)}</span>
                <span className="text-xl font-bold text-ink/70 transition-colors group-hover:text-ink md:text-2xl">{ev.he}</span>
                <span className="hidden text-base text-ink/45 transition-colors group-hover:text-ink/80 md:block">{ev.themeHe}</span>
                {ev.boxId ? (
                  <span className="text-sheen text-sm font-bold">עם מארז</span>
                ) : (
                  <span className="text-sm font-bold text-ink/40">במנוי</span>
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. One night, three boxes. The background follows the night down and back up. */}
      <motion.section id="night" ref={nightRef} aria-labelledby="boxes-title" className="relative scroll-mt-20 text-[#EFE6D8]" style={{ backgroundColor: reduce ? '#09080A' : nightBg }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(60% 30% at 80% 0%, rgba(217,54,31,.28), transparent 70%), radial-gradient(50% 25% at 15% 50%, rgba(106,18,38,.35), transparent 70%), radial-gradient(70% 30% at 50% 100%, rgba(201,166,107,.16), transparent 70%)' }} />
        <div className="relative mx-auto max-w-[1440px] px-4 py-24 md:px-8 lg:px-14 lg:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 id="boxes-title" className="font-display text-[clamp(3.5rem,9vw,7.5rem)] font-bold leading-[0.82]">
              לילה אחד,
              <br />
              שלוש שעות.
            </h2>
            <p className="max-w-[38ch] text-lg leading-relaxed text-[#EFE6D8]/75">כל מארז מתחיל בשעה אחרת של הלילה. ככל שמאוחר יותר, הוא עמוק יותר. אפשר לקנות כל אחד בנפרד, ומנויים מקבלים עליהם הנחה.</p>
          </div>

          <ol className="mt-16 space-y-24 md:space-y-32">
            {boxes.map((box, i) => (
              <motion.li key={box.id} {...fadeUp()} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                <div className={`relative lg:col-span-5 ${i % 2 ? 'lg:order-2 lg:col-start-8' : ''}`}>
                  <div
                    className="relative aspect-[4/5] overflow-hidden bg-[#0B0909]"
                    style={{ boxShadow: `0 40px 140px -40px ${BOX_TONE[box.id]?.glow ?? 'rgba(217,54,31,.5)'}` }}
                  >
                    <img src={box.image} alt={box.name} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <span className="absolute -top-6 start-4 font-display text-[clamp(4rem,9vw,7rem)] font-bold leading-none text-[#EFE6D8] tabular-nums md:-top-10" dir="ltr">
                    {HOUR_OF[box.id]}
                  </span>
                </div>
                <div className={`lg:col-span-6 ${i % 2 ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-7'}`}>
                  <p className="text-sheen text-sm font-bold" style={{ backgroundImage: BOX_TONE[box.id]?.foil }}>
                    {SUIT_OF[box.id]} · {boxDuration(box.id, true)}
                  </p>
                  <h3 className="mt-2 font-display text-[clamp(4rem,8vw,6.5rem)] font-bold leading-[0.82]">{box.name.replace(/^מארז /, '')}</h3>
                  <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-[#EFE6D8]/80">{box.description}</p>
                  {box.features?.length ? (
                    <ul className="mt-6 grid gap-x-8 border-t border-[#EFE6D8]/20 text-base text-[#EFE6D8]/85 sm:grid-cols-2">
                      {box.features.slice(0, 6).map((f: string) => (
                        <li key={f} className="border-b border-[#EFE6D8]/10 py-2.5">
                          {f}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-8 flex flex-wrap items-center gap-6">
                    <Ticket
                      label="להוסיף לסל"
                      stub={`₪${box.price}`}
                      size="md"
                      tone="spot"
                      onClick={() => {
                        addToCart(box.id);
                        showAlert(`${box.name} נוסף לסל`);
                      }}
                    />
                    <Link to="/experience" className="text-sm font-bold underline underline-offset-4 hover:text-spot">
                      מה יש בפנים
                    </Link>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </motion.section>

      {/* 4. Membership: the one place gold is allowed to speak */}
      <section aria-labelledby="mem-title" className="glow-dawn border-b border-rule">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-24 md:px-8 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-16 lg:px-14 lg:py-32">
          <div>
            <p className="text-sheen text-sm font-bold">המנוי</p>
            <h2 id="mem-title" className="mt-2 font-display text-[clamp(3.5rem,8vw,6.5rem)] font-bold leading-[0.85]">
              העונה כולה, אצלכם
            </h2>
          </div>
          <dl className="rule-sheen border-t">
            {[
              ['ערבים בעונות', 'תוכנייה חדשה בכל עונה: משימות, בישול, הקרנות ושיחות. הכול מגיע מוכן, אתם רק פותחים.'],
              ['הנחה קבועה', discount !== null ? `${discount}% על כל מארז בודד ומוצר מהבוטיק, כל עוד אתם במנוי.` : 'אחוז קבוע על כל מארז בודד ומוצר מהבוטיק, כל עוד אתם במנוי. יפורסם עם פתיחת העונה.'],
              ['המקום שלכם', 'אזור פרטי באתר עם היומן, המשימות, המשחקים וקלפי המשימה. שם העונה ממשיכה בין משלוח למשלוח.'],
            ].map(([t, d], i) => (
              <motion.div key={t} {...fadeUp(i)} className="grid gap-2 rule-sheen border-b py-7 md:grid-cols-[220px_1fr] md:gap-8">
                <dt className="font-display text-4xl font-bold leading-none md:text-5xl">{t}</dt>
                <dd className="max-w-[56ch] text-lg leading-relaxed text-ink/80">{d}</dd>
              </motion.div>
            ))}
            <div className="pt-8">
              <Ticket label="להצטרף למנוי" stub={season.price !== null ? `₪${season.price}` : pad(season.seasonNumber)} stubCaption={season.price !== null ? 'לחודש' : 'עונה'} to={joinTo} size="md" />
            </div>
          </dl>
        </div>
      </section>

      {/* 5. Intermission */}
      <section aria-labelledby="bq-title">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-24 md:px-8 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-16 lg:px-14 lg:py-28">
          <div>
            <h2 id="bq-title" className="font-display text-[clamp(3.5rem,8vw,6.5rem)] font-bold leading-[0.85]">
              בהפסקה: הבוטיק
            </h2>
            <p className="mt-5 max-w-[34ch] text-lg leading-relaxed text-ink/75">דברים שמשלימים את הערב: אווירה, אירוח, מתנות וחריטה אישית.</p>
            <Link to="/boutique" className="mt-8 inline-block border-2 border-ink px-6 py-3 text-lg font-bold hover:border-transparent hover:fill-spot">
              לבוטיק
            </Link>
          </div>
          <ul className="border-t-[3px] border-ink">
            {intermission.map((p, i) => (
              <motion.li key={p.id} {...fadeUp(i)}>
                <Link to="/boutique" className="group grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-rule py-4 md:grid-cols-[88px_1fr_auto]">
                  <span className="fill-spot aspect-square overflow-hidden">
                    <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover mix-blend-luminosity grayscale contrast-125 transition-[filter] group-hover:brightness-110" />
                  </span>
                  <span className="text-lg font-bold group-hover:text-spot md:text-xl">{p.name}</span>
                  <span className="text-sheen font-display text-3xl font-bold tabular-nums md:text-4xl">₪{p.price}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Lights out */}
      <section className="glow-oxblood rule-ember border-t">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-8 px-4 py-24 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:py-32">
          <h2 className="max-w-[12ch] font-display text-[clamp(3.5rem,9vw,7.5rem)] font-bold leading-[0.82]">
            מכבים את האור. <span className="text-spot">מתחילים.</span>
          </h2>
          <Ticket label={user ? 'למקום שלכם' : 'להצטרף למנוי'} stub={pad(season.seasonNumber)} stubCaption="עונה" to={joinTo} tone="spot" className="w-full max-w-md" />
        </div>
      </section>
    </div>
  );
};

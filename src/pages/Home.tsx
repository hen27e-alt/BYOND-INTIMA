import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { useCart } from '../contexts/CartContext';
import { useAlert } from '../components/AlertModal';
import { Ticket } from '../components/season/Ticket';
import { useCatalogue, useSeasonSettings, visible } from '../lib/catalogue';
import { BOX_IDS, NIGHT_BANDS, boxDuration } from '../data/season';

const pad = (n: number) => String(n).padStart(2, '0');

/** Fixed-digit counter: each character sits in its own dark cell. Unknown values render as dashes. */
const Digits = ({ value, cells, suffix }: { value: number | null; cells: number; suffix?: string }) => {
  const chars = value === null ? Array(cells).fill('–') : String(value).padStart(cells, '0').split('');
  return (
    <div className="flex gap-1" dir="ltr">
      {[...chars, ...(suffix ? [suffix] : [])].map((c, i) => (
        <span key={i} className="flex h-16 w-11 items-center justify-center bg-room font-display text-5xl font-bold text-spot md:h-20 md:w-14 md:text-6xl">
          {c}
        </span>
      ))}
    </div>
  );
};

const daysUntil = (iso: string | null) => {
  if (!iso) return null;
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  return d >= 0 ? d : null;
};

const AXIS_HOURS = [18, 20, 22, 0, 2, 4];

export const Home = () => {
  const { language } = useLanguage();
  const { user } = useFirebase();
  const { addToCart } = useCart();
  const { showAlert } = useAlert();
  const location = useLocation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const he = language === 'he';
  const tx = (h: string, e: string) => (he ? h : e);
  const Arrow = he ? ArrowLeft : ArrowRight;

  const { products } = useCatalogue();
  const season = useSeasonSettings();
  const SUBSCRIPTION = season;
  const CURRENT_SEASON = { number: season.seasonNumber, evenings: season.evenings };
  const shown = products.filter(visible);
  const boxes = BOX_IDS.map((id) => shown.find((p) => p.id === id)).filter((p): p is (typeof shown)[number] => Boolean(p));
  const intermission = shown.filter((p) => p.category !== 'experience' && !p.isPremium).slice(0, 4);
  const discount = season.memberDiscountPercent;
  const days = daysUntil(season.nextSeasonStarts);
  const joinTo = user ? '/dashboard' : '/login';

  React.useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), 60);
    }
  }, [location.hash, reduce]);

  const addBox = (id: string, name: string) => {
    addToCart(id);
    showAlert(tx(`${name} נוסף לסל`, `${name} added to your cart`));
  };

  const rowIn = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, x: he ? 18 : -18 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, margin: '-40px' },
          transition: { delay: i * 0.06, duration: 0.35, ease: [0.2, 0.8, 0.2, 1] as const },
        };

  return (
    <div className="bg-paper pt-16 text-ink md:pt-20">
      {/* First viewport: the season cover + this season's programme */}
      <section className="mx-auto grid max-w-[1440px] lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[minmax(0,560px)_1fr]">
        <div className="flex flex-col border-ink px-4 py-10 md:px-8 lg:border-e-[3px] lg:px-14 lg:py-12">
          <h1 className="font-display font-bold leading-[0.8]">
            <span className="block text-[clamp(9rem,26vw,15.5rem)] text-spot" aria-hidden="true">
              {pad(CURRENT_SEASON.number)}
            </span>
            <span className="mt-2 block text-[clamp(3.25rem,8vw,6rem)] leading-[0.9]">
              <span className="sr-only">{tx(`עונה ${CURRENT_SEASON.number}: `, `Season ${CURRENT_SEASON.number}: `)}</span>
              {tx('עונה של ערבים שלכם', 'A season of evenings, yours')}
            </span>
          </h1>
          <p className="mt-6 max-w-[34ch] text-xl font-medium leading-relaxed md:text-2xl">
            {tx(
              'מנוי אחד, עונה שלמה של ערבים זוגיים מודרכים. הערבים מגיעים בעונות, והמנויים מקבלים הנחה קבועה על כל מארז או מוצר שיבחרו.',
              'One membership, a whole season of guided evenings for two. The evenings arrive in seasons, and members get a standing discount on any box or item they choose.'
            )}
          </p>
          <div className="mt-10 lg:mt-auto">
            <Ticket label={tx('להצטרף למנוי', 'Become a member')} stub={pad(CURRENT_SEASON.number)} stubCaption={tx('עונה', 'Season')} to={joinTo} />
            <Link to="/experience" className="mt-4 inline-flex items-center gap-2 text-base font-bold underline decoration-2 underline-offset-4 hover:text-spot">
              {tx('או לבחור מארז בודד', 'Or pick a single box')}
              <Arrow size={16} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col border-t-[3px] border-ink px-4 py-10 md:px-8 lg:border-t-0 lg:px-14 lg:py-12">
          <h2 className="flex items-end justify-between border-b-[3px] border-ink pb-3 font-display text-6xl font-bold leading-[0.9] md:text-7xl">
            {tx('לוח הערבים', 'The programme')}
            <span className="pb-2 font-sans text-sm font-bold">{tx(`עונה ${pad(CURRENT_SEASON.number)}`, `Season ${pad(CURRENT_SEASON.number)}`)}</span>
          </h2>
          <table className="w-full border-collapse">
            <caption className="sr-only">{tx('הערבים בעונה הנוכחית', 'Evenings this season')}</caption>
            <tbody>
              {CURRENT_SEASON.evenings.map((ev, i) => (
                <motion.tr key={ev.n} className="border-b border-ink" {...rowIn(i)}>
                  <td className="w-16 py-3 align-middle font-display text-4xl font-bold leading-none text-spot tabular-nums md:w-20 md:text-5xl">{pad(ev.n)}</td>
                  <td className="py-3 align-middle text-lg font-bold md:text-2xl">{he ? ev.he : ev.en}</td>
                  <td className="hidden py-3 align-middle text-sm font-medium md:table-cell">{he ? ev.themeHe : ev.themeEn}</td>
                  <td className="py-3 text-end align-middle">
                    {ev.boxId ? (
                      <Link to="/experience" className="inline-block border-2 border-spot bg-spot px-2.5 py-1 text-xs font-bold text-paper hover:border-ink hover:bg-ink md:text-sm">
                        {tx('מארז', 'Box')}
                      </Link>
                    ) : (
                      <span className="inline-block border-2 border-ink px-2.5 py-1 text-xs font-bold md:text-sm">{tx('במנוי', 'Members')}</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <div className="mt-10 flex flex-wrap items-end gap-8 lg:mt-auto lg:pt-10">
            <div>
              <Digits value={discount} cells={2} suffix="%" />
              <p className="mt-2 text-sm font-bold">{tx('הנחה למנויים', 'Member discount')}</p>
            </div>
            <div>
              <Digits value={days} cells={2} />
              <p className="mt-2 text-sm font-bold">{tx('ימים לעונה הבאה', 'Days to next season')}</p>
            </div>
            {(discount === null || days === null) && (
              <p className="max-w-[24ch] text-sm text-ink/70">{tx('המספרים יתעדכנו עם פתיחת ההרשמה לעונה.', 'Numbers update when the season opens for sign-up.')}</p>
            )}
          </div>
        </div>
      </section>

      {/* What the membership gives */}
      <section id="membership" className="scroll-mt-24 border-t-[3px] border-ink">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-20 md:px-8 lg:grid-cols-[minmax(0,560px)_1fr] lg:gap-0 lg:px-0 lg:py-28">
          <h2 className="font-display text-[clamp(3.5rem,9vw,7rem)] font-bold leading-[0.85] lg:px-14">{tx('מה מקבלים במנוי', 'What membership brings')}</h2>
          <dl className="border-t-[3px] border-ink lg:me-14">
            {[
              {
                t: tx('ערבים בעונות', 'Evenings in seasons'),
                d: tx('בכל עונה תוכנייה חדשה של ערבים מודרכים: משימות, בישול, הקרנות, שיחות. מגיעים אליכם, אתם רק פותחים.', 'Each season brings a new programme of guided evenings: missions, cooking, screenings, conversations. You just open it.'),
              },
              {
                t: tx('הנחה קבועה', 'A standing discount'),
                d:
                  discount !== null
                    ? tx(`${discount}% הנחה על כל מארז בודד או מוצר מהבוטיק, לאורך כל המנוי.`, `${discount}% off any single box or boutique item, for as long as you are a member.`)
                    : tx('הנחה באחוזים על כל מארז בודד או מוצר מהבוטיק, לאורך כל המנוי. האחוז יפורסם עם פתיחת העונה.', 'A percentage off any single box or boutique item for as long as you are a member. The rate is announced when the season opens.'),
              },
              {
                t: tx('המקום שלכם', 'Your own place'),
                d: tx('אזור זוגי פרטי באתר: היומן שלכם, המשימות, המשחקים והמדריך האישי Byond Concierge. שם העונה קורית בין משלוח למשלוח.', 'A private couple space on the site: your journal, missions, games and your Byond Concierge guide. It is where the season lives between deliveries.'),
              },
            ].map((row, i) => (
              <motion.div key={row.t} className="grid gap-2 border-b border-ink py-7 md:grid-cols-[220px_1fr] md:gap-8" {...rowIn(i)}>
                <dt className="font-display text-4xl font-bold leading-none md:text-5xl">{row.t}</dt>
                <dd className="max-w-[60ch] text-lg leading-relaxed">{row.d}</dd>
              </motion.div>
            ))}
            <div className="flex flex-wrap items-center gap-6 pt-8">
              <Ticket
                label={tx('להצטרף למנוי', 'Become a member')}
                stub={SUBSCRIPTION.price !== null ? `₪${SUBSCRIPTION.price}` : pad(CURRENT_SEASON.number)}
                stubCaption={SUBSCRIPTION.price !== null ? tx('לחודש', '/ month') : tx('עונה', 'Season')}
                to={joinTo}
                size="md"
              />
              {SUBSCRIPTION.price === null && <p className="text-sm text-ink/70">{tx('מחיר המנוי יפורסם בקרוב.', 'Membership price coming soon.')}</p>}
            </div>
          </dl>
        </div>
      </section>

      {/* The three boxes on one night: dusk to dawn */}
      <section className="bg-room text-paper">
        <div className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 lg:px-14 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b-[3px] border-paper pb-4">
            <h2 className="font-display text-[clamp(3.5rem,9vw,7rem)] font-bold leading-[0.85]">{tx('מדמדומים עד אור הבוקר', 'From dusk until dawn')}</h2>
            <p className="max-w-[40ch] text-lg text-paper/80">{tx('שלושה מארזים, שלושה אורכי ערב. אפשר לקנות כל אחד בנפרד, ומנויים מקבלים עליהם הנחה.', 'Three boxes, three lengths of evening. Each can be bought on its own; members get them at a discount.')}</p>
          </div>

          <div className="mt-10 hidden md:block" aria-hidden="true">
            <div className="grid grid-cols-6 text-sm font-bold text-paper/70">
              {AXIS_HOURS.map((h) => (
                <span key={h} className="border-s border-paper/40 ps-2 tabular-nums">
                  <bdi dir="ltr">{pad(h)}:00</bdi>
                </span>
              ))}
            </div>
          </div>

          <ol className="mt-4 md:mt-2">
            {boxes.map((box, i) => {
              const band = NIGHT_BANDS[box.id];
              return (
                <motion.li key={box.id} className="border-b border-paper/40 py-8 md:py-10" {...rowIn(i)}>
                  <div className="relative mb-6 hidden h-3 md:block" aria-hidden="true">
                    <motion.span
                      className="absolute inset-y-0 bg-spot"
                      style={{ insetInlineStart: `${(band.from / 12) * 100}%`, width: `${((band.to - band.from) / 12) * 100}%`, transformOrigin: he ? 'right' : 'left' }}
                      initial={reduce ? undefined : { scaleX: 0 }}
                      whileInView={reduce ? undefined : { scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                  </div>
                  <div className="grid items-start gap-6 lg:grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)_auto] lg:gap-10">
                    <div className="aspect-[4/5] w-40 overflow-hidden bg-paper lg:w-full">
                      <img src={box.image} alt="" loading="lazy" className="h-full w-full object-cover mix-blend-multiply grayscale contrast-125" />
                    </div>
                    <div>
                      <h3 className="font-display text-6xl font-bold leading-[0.85] md:text-7xl">{box.name.replace(/^מארז /, '')}</h3>
                      <p className="mt-2 text-sm font-bold text-spot">{boxDuration(box.id, he)}</p>
                      <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-paper/85">{box.description}</p>
                    </div>
                    <ul className="border-t border-paper/40 text-base">
                      {(box.features ?? []).map((f: string) => (
                        <li key={f} className="border-b border-paper/20 py-2.5">
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col items-start gap-3">
                      <Ticket label={tx('להוסיף לסל', 'Add to cart')} stub={`₪${box.price}`} size="md" tone="spot" onClick={() => addBox(box.id, box.name)} />
                      <button onClick={() => navigate('/experience')} className="text-sm font-bold underline underline-offset-4 hover:text-spot">
                        {tx('כל הפרטים', 'Full details')}
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Intermission: the boutique */}
      <section className="border-b-[3px] border-ink">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-20 md:px-8 lg:grid-cols-[minmax(0,560px)_1fr] lg:gap-0 lg:px-0 lg:py-28">
          <div className="lg:px-14">
            <h2 className="font-display text-[clamp(3.5rem,9vw,7rem)] font-bold leading-[0.85]">{tx('בהפסקה: הבוטיק', 'Intermission: the boutique')}</h2>
            <p className="mt-6 max-w-[36ch] text-lg leading-relaxed">{tx('חנות נפרדת של דברים שמשלימים את הערב: אווירה, אירוח, מתנות וחריטה אישית.', 'A separate shop of things that complete the evening: atmosphere, hosting, gifts and personal engraving.')}</p>
            <Link to="/boutique" className="mt-8 inline-flex items-center gap-2 border-[3px] border-ink px-6 py-3 text-lg font-bold hover:bg-ink hover:text-paper">
              {tx('לבוטיק', 'Enter the boutique')} <Arrow size={18} />
            </Link>
          </div>
          <ul className="border-t-[3px] border-ink lg:me-14">
            {intermission.map((p, i) => (
              <motion.li key={p.id} {...rowIn(i)}>
                <Link to="/boutique" className="grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-ink py-4 hover:text-spot md:grid-cols-[88px_1fr_auto]">
                  <img src={p.image} alt="" loading="lazy" className="aspect-square w-full object-cover mix-blend-multiply grayscale contrast-125" />
                  <span className="text-lg font-bold md:text-xl">{p.name}</span>
                  <span className="font-display text-3xl font-bold tabular-nums md:text-4xl">₪{p.price}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Close: your place */}
      <section className="mx-auto flex max-w-[1440px] flex-col items-start gap-8 px-4 py-20 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:py-28">
        <h2 className="max-w-[12ch] font-display text-[clamp(3.5rem,9vw,7rem)] font-bold leading-[0.85]">
          {user ? tx('המקום שלכם מחכה', 'Your place is waiting') : tx('מקום אחד, רק לשניכם', 'One place, just for two')}
        </h2>
        <Ticket
          label={user ? tx('למקום שלכם', 'Go to your place') : tx('להצטרף למנוי', 'Become a member')}
          stub={pad(CURRENT_SEASON.number)}
          stubCaption={tx('עונה', 'Season')}
          to={joinTo}
          className="w-full max-w-md"
        />
      </section>
    </div>
  );
};

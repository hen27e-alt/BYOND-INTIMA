import { BoxQuiz } from '../components/season/BoxQuiz';
import { Unboxing } from '../components/season/Unboxing';
import { E } from '../components/EditableText';
import { CardsOnly } from '../components/season/CardsOnly';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useAlert } from '../components/AlertModal';
import { EditableImage } from '../components/EditableImage';
import { Ticket } from '../components/season/Ticket';
import { BOX_IDS, NIGHT_BANDS, bandHour, boxDuration, isBoxArt } from '../data/season';
import { type Product, memberPriceFor, useCatalogue, useSeasonSettings, visible } from '../lib/catalogue';

type Box = Product & {
  avgTime?: string;
  hasIntimateTasks?: boolean;
  hasCookingKit?: boolean;
  hasCinemaAccess?: boolean;
  atmosphereLevel?: string;
  hasAiGuide?: boolean;
};

const ATMOSPHERE: Record<string, [string, string]> = {
  Light: ['קלילה', 'Light'],
  Deep: ['עמוקה', 'Deep'],
  Intense: ['עוצמתית', 'Intense'],
};

const pad = (n: number) => String(n).padStart(2, '0');

/** The three boxes as programme notes: one numbered entry per box, then a side-by-side schedule. */
export const Experience = () => {
  const { language } = useLanguage();
  const { addToCart, openCart } = useCart();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const he = language === 'he';
  const tx = (h: string, e: string) => (he ? h : e);

  const { products } = useCatalogue();
  const { memberDiscountPercent: discount } = useSeasonSettings();
  const boxes = BOX_IDS.map((id) => products.find((p) => p.id === id)).filter((p): p is Box => Boolean(p) && visible(p as Box));

  const addBox = (box: Box) => {
    addToCart(box.id);
    openCart();
  };

  const rows: { label: string; render: (b: Box) => React.ReactNode }[] = [
    { label: tx('אורך הערב', 'Length'), render: (b) => boxDuration(b.id, he) },
    {
      label: tx('שעות', 'Hours'),
      render: (b) => (
        <bdi dir="ltr" className="tabular-nums">
          {bandHour(NIGHT_BANDS[b.id].from)}–{bandHour(NIGHT_BANDS[b.id].to)}
        </bdi>
      ),
    },
    { label: tx('אווירה', 'Atmosphere'), render: (b) => (b.atmosphereLevel ? ATMOSPHERE[b.atmosphereLevel]?.[he ? 0 : 1] : '–') },
    { label: tx('משימות אינטימיות', 'Intimate tasks'), render: (b) => b.hasIntimateTasks },
    { label: tx('ערכת בישול זוגית', 'Cooking kit for two'), render: (b) => b.hasCookingKit },
    { label: tx('ספריית קולנוע', 'Cinema library'), render: (b) => b.hasCinemaAccess },
    { label: tx('ליווי AI', 'AI guide'), render: (b) => b.hasAiGuide },
    { label: tx('מחיר', 'Price'), render: (b) => <span className="font-display text-3xl font-bold text-spot">₪{b.price}</span> },
  ];

  const cell = (v: React.ReactNode) =>
    typeof v === 'boolean' ? (
      v ? (
        <span className="inline-block h-3 w-3 bg-spot" role="img" aria-label={tx('כלול', 'Included')} />
      ) : (
        <span className="text-ink/40" aria-label={tx('לא כלול', 'Not included')}>–</span>
      )
    ) : (
      v
    );

  return (
    <div className="bg-paper pt-16 text-ink md:pt-20">
      <header className="mx-auto max-w-[1440px] px-4 pt-12 md:px-8 lg:px-14 lg:pt-20">
        <div className="grid gap-6 border-b-[3px] border-ink pb-8 lg:grid-cols-[1fr_minmax(0,460px)] lg:items-end">
          <h1 className="font-display text-[clamp(4.5rem,13vw,11rem)] font-bold leading-[0.8]"><E id="exp_title">{tx('המארזים', 'The boxes')}</E></h1>
          <p className="text-lg leading-relaxed text-ink/80">
            <E id="exp_lede" multiline>{tx(
              'שלושה מארזים, שלושה אורכי ערב: משעה קלה של דמדומים ועד לילה שלם. כל מארז נשלח הביתה עם כל מה שצריך, ואפשר לקנות כל אחד בנפרד.',
              'Three boxes, three lengths of evening: from a light hour at dusk to a whole night. Each one ships home with everything you need, and each can be bought on its own.'
            )}</E>
          </p>
        </div>
        <nav aria-label={tx('קפיצה למארז', 'Jump to a box')} className="flex flex-wrap gap-x-8 gap-y-2 border-b border-ink py-4 text-base font-bold">
          {boxes.map((b, i) => (
            <a key={b.id} href={`#${b.id}`} className="hover:text-spot">
              <span className="tabular-nums text-spot">{pad(i + 1)}</span> {b.name.replace(/^מארז /, '')}
            </a>
          ))}
          <a href="#compare" className="hover:text-spot">
            {tx('השוואה', 'Compare')}
          </a>
          {he && (
            <a href="#quiz" className="text-gold hover:text-spot">
              לא בטוחים איזה?
            </a>
          )}
        </nav>
      </header>
      {he && <BoxQuiz products={products.filter(visible)} />}

      <ol className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-14">
        {boxes.map((box, i) => {
          const band = NIGHT_BANDS[box.id];
          return (
            <motion.li
              key={box.id}
              id={box.id}
              className="scroll-mt-24 border-b-[3px] border-ink py-12 lg:py-20"
              {...(reduce
                ? {}
                : {
                    initial: { opacity: 0, y: 16 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, margin: '-60px' },
                    transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] },
                  })}
            >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
                <div className="relative">
                  <div className="aspect-[4/5] overflow-hidden border-[3px] border-ink bg-ink">
                    <EditableImage
                      contentId={`exp_card_${box.id}_image`}
                      defaultSrc={box.image}
                      alt={box.name}
                      className={isBoxArt(box.image) ? "h-full w-full object-cover" : "h-full w-full object-cover grayscale contrast-125"}
                    />
                  </div>
                  <span className="absolute -top-5 start-4 bg-paper px-2 font-display text-7xl font-bold leading-none text-spot md:text-8xl" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                </div>

                <div className="flex flex-col">
                  <p className="text-base font-bold">
                    <bdi dir="ltr" className="tabular-nums">
                      {bandHour(band.from)}–{bandHour(band.to)}
                    </bdi>
                    <span className="mx-2 text-ink/40">/</span>
                    {boxDuration(box.id, he)}
                  </p>
                  <h2 className="mt-2 font-display text-[clamp(4rem,9vw,8rem)] font-bold leading-[0.82]">{box.name.replace(/^מארז /, '')}</h2>

                  <div className="mt-4 h-3 w-full bg-ink/10" aria-hidden="true">
                    <div
                      className="h-full bg-spot"
                      style={{ marginInlineStart: `${(band.from / 12) * 100}%`, width: `${((band.to - band.from) / 12) * 100}%` }}
                    />
                  </div>

                  <p className="mt-6 max-w-[52ch] text-xl leading-relaxed text-ink/85">{box.description}</p>

                  <h3 className="mt-8 border-b-[3px] border-ink pb-2 text-sm font-bold">{tx('מה בקופסה', "What's in the box")}</h3>
                  <ul className="text-lg">
                    {(box.features ?? []).map((f: string) => (
                      <li key={f} className="border-b border-rule py-3">
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                    {box.soldOut ? (
                      <p className="border-[3px] border-dashed border-ink px-6 py-4 text-lg font-bold">{tx('אזל מהמלאי, יחזור בקרוב', 'Sold out, back soon')}</p>
                    ) : (
                      <Ticket label={tx('להוסיף לסל', 'Add to cart')} stub={`₪${box.price}`} tone={i === 1 ? 'spot' : 'ink'} onClick={() => addBox(box)} />
                    )}
                    {memberPriceFor(box.price, discount) !== null && (
                      <p className="text-base">
                        {tx('למנויים', 'Members')}: <strong className="text-spot">₪{memberPriceFor(box.price, discount)}</strong>
                      </p>
                    )}
                    <div className="basis-full">
                      <CardsOnly boxId={box.id} products={products.filter(visible)} he={he} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>

      <Unboxing boxes={boxes} he={he} onAdd={addBox} />

      <section id="compare" className="scroll-mt-24 bg-paper">
        <div className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 lg:px-14 lg:py-24">
          <h2 className="border-b-[3px] border-ink pb-3 font-display text-6xl font-bold leading-none md:text-7xl"><E id="exp_compare_title">{tx('זה מול זה', 'Side by side')}</E></h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-start text-base">
              <thead>
                <tr className="border-b-[3px] border-ink">
                  <th scope="col" className="py-4 pe-4 text-start text-sm font-bold text-ink/60">
                    <span className="sr-only">{tx('תכונה', 'Feature')}</span>
                  </th>
                  {boxes.map((b, i) => (
                    <th key={b.id} scope="col" className="px-4 py-4 text-start align-bottom">
                      <span className="block text-sm font-bold tabular-nums text-spot">{pad(i + 1)}</span>
                      <span className="font-display text-4xl font-bold leading-none">{b.name.replace(/^מארז /, '')}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-rule">
                    <th scope="row" className="py-4 pe-4 text-start font-medium">
                      {row.label}
                    </th>
                    {boxes.map((b) => (
                      <td key={b.id} className="px-4 py-4">
                        {cell(row.render(b))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-room text-paper">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-8 px-4 py-16 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:py-24">
          <div className="max-w-[46ch]">
            <h2 className="font-display text-6xl font-bold leading-[0.85] md:text-7xl"><E id="exp_season_title">{tx('או את כל העונה', 'Or the whole season')}</E></h2>
            <p className="mt-4 text-lg leading-relaxed text-paper/80">
              <E id="exp_season_lede" multiline>{tx(
                'מנויים מקבלים את התוכנייה של העונה, ערבים מוכנים מראש והנחה קבועה על כל מארז ועל הבוטיק.',
                "Members get the season's programme, evenings planned ahead, and a standing discount on every box and on the boutique."
              )}</E>
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <Ticket label={tx('על המנוי', 'About membership')} stub="01" stubCaption={tx('עונה', 'Season')} tone="spot" onClick={() => navigate('/#membership')} />
            <Link to="/boutique" className="text-sm font-bold underline underline-offset-4 hover:text-[var(--color-accent-light)]">
              {tx('לבוטיק', 'To the boutique')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

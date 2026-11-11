import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { EditableText } from '../components/EditableText';
import { useLanguage } from '../contexts/LanguageContext';
import { Ticket } from '../components/season/Ticket';
import { cn } from '../lib/utils';

/**
 * "About" as one night: the story in three chapters lit like the three boxes
 * (dusk, midnight, first light), a line to hold on to, what guides us, and
 * what we promise. Content ids are unchanged, so text edited in edit mode stays.
 */
export const About = () => {
  const { language } = useLanguage();
  const reduce = useReducedMotion();
  const he = language === 'he';
  const tx = (h: string, e: string) => (he ? h : e);

  const reveal = reduce
    ? {}
    : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } };

  const parts = [
    {
      id: 'genesis',
      hour: tx('דמדומים', 'Dusk'),
      glow: 'radial-gradient(60% 80% at 100% 0%, rgba(217,54,31,.16), transparent 70%)',
      title: 'איך זה התחיל',
      text: 'Byond Intima נולדה מתוך ההבנה שהדבר היקר ביותר שיש לנו הוא הזמן שאנחנו מקדישים לאנשים שאנחנו אוהבים. בעולם מהיר, דיגיטלי ורועש, החיבור הזוגי הוא לעיתים הראשון להישחק.',
    },
    {
      id: 'why',
      hour: tx('חצות', 'Midnight'),
      glow: 'radial-gradient(60% 80% at 0% 50%, rgba(122,20,34,.28), transparent 70%)',
      title: 'למה',
      text: 'המותג הוקם על ידי זוג שחיפש דרך להחזיר את הקסם לשגרה. הם גילו שמה שבאמת חסר הוא לא זמן, אלא נוכחות. הם רצו ליצור משהו שיהיה יותר ממוצר: שפה חדשה של אינטימיות, שמשלבת משחקיות בוגרת, עומק רגשי וחיבור פיזי.',
    },
    {
      id: 'craft',
      hour: tx('אור ראשון', 'First light'),
      glow: 'radial-gradient(60% 80% at 100% 100%, rgba(201,166,107,.16), transparent 70%)',
      title: 'איך אנחנו עובדים',
      text: 'כל מארז, כל משימה וכל פרק במסע שלנו עוצבו בקפידה כדי לשלב בין הנאה פיזית, עומק רגשי ומשחקיות בוגרת. אנחנו מאמינים שאינטימיות היא לא יעד, אלא תרגול יומיומי של נוכחות.',
    },
  ];

  const values = [
    ['about_value_1', 'כבוד', 'כבוד הדדי הוא הבסיס לכל מערכת יחסים בריאה ומעצימה.'],
    ['about_value_2', 'צמיחה', 'אנו מעודדים התפתחות אישית וזוגית מתמדת, יחד ולחוד.'],
    ['about_value_3', 'חיבור', 'יצירת מרחב בטוח ועמוק לאינטימיות רגשית ופיזית.'],
  ];

  // Only what the site already promises elsewhere (checkout, FAQ, terms).
  const promises = [
    ['about_promise_1', 'דיסקרטיות', 'כל חבילה יוצאת באריזה חומה ופשוטה. בלי השם שלנו ובלי תיאור של מה שבפנים.'],
    ['about_promise_2', 'פרטיות', 'מה שאתם כותבים ביומן הזוגי שייך לכם. אנחנו שומרים רק מה שצריך כדי לשלוח הזמנה.'],
    ['about_promise_3', 'אנשים, לא בוט', 'כותבים לנו? עונים לכם אנחנו, בעצמנו.'],
  ];

  return (
    <div className="bg-paper pt-16 text-ink md:pt-20">
      <header className="glow-ember">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 pb-16 pt-12 md:px-8 lg:grid-cols-[1fr_minmax(0,540px)] lg:items-end lg:px-14 lg:pb-24 lg:pt-24">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(5rem,15vw,12rem)] font-bold leading-[0.78]"
          >
            {tx('עלינו', 'About')}
          </motion.h1>
          <EditableText
            contentId="about_vision_text"
            defaultText="אנחנו לא מוכרים מוצרים. אנחנו יוצרים מרחבים. סטודיו לחוויות זוגיות מודרכות שנועד לעזור לכם להאט, להסתכל בעיניים, ולגלות מחדש את העומק שנמצא מתחת לפני השטח."
            as="p"
            multiline
            className="text-xl leading-relaxed text-ink/85 md:text-2xl"
          />
        </div>
      </header>

      <ol>
        {parts.map((p, i) => (
          <li key={p.id} className="border-t border-ink/15" style={{ backgroundImage: p.glow }}>
            <motion.div {...reveal} className="mx-auto grid max-w-[1440px] gap-6 px-4 py-14 md:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:px-14 lg:py-24">
              <div>
                <p className="flex items-baseline gap-3 text-sm font-bold tracking-wider text-gold">
                  <span className="text-sheen font-display text-5xl tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {p.hour}
                </p>
                <EditableText contentId={`about_${p.id}_title`} defaultText={p.title} as="h2" className="mt-4 block font-display text-5xl font-bold leading-[0.95] md:text-7xl" />
              </div>
              <EditableText contentId={`about_${p.id}_text`} defaultText={p.text} as="p" multiline className="max-w-[58ch] self-end text-xl leading-relaxed text-ink/85" />
            </motion.div>
          </li>
        ))}
      </ol>

      <section className="glow-dawn border-t border-ink/15">
        <motion.blockquote {...reveal} className="mx-auto max-w-[1100px] px-4 py-20 text-center md:px-8 lg:py-28">
          <span aria-hidden className="text-sheen block font-display text-7xl leading-none">„</span>
          <EditableText
            contentId="about_quote"
            defaultText="אינטימיות היא לא יעד. היא תרגול יומיומי של נוכחות."
            as="p"
            multiline
            className="mt-2 font-display text-[clamp(2.5rem,6vw,4.75rem)] font-bold leading-[1.02]"
          />
        </motion.blockquote>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 lg:px-14 lg:py-24">
        <h2 className="font-display text-5xl font-bold leading-none md:text-7xl">{tx('מה מנחה אותנו', 'What guides us')}</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {values.map(([id, t, d], i) => (
            <motion.div key={id} {...reveal} transition={reduce ? undefined : { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }} className="border-t border-gold/60 pt-5">
              <EditableText contentId={`${id}_title`} defaultText={t} as="h3" className="font-display text-4xl font-bold leading-none md:text-5xl" />
              <EditableText contentId={`${id}_desc`} defaultText={d} as="p" multiline className="mt-3 text-lg leading-relaxed text-ink/75" />
            </motion.div>
          ))}
        </div>

        <h2 className="mt-20 font-display text-5xl font-bold leading-none md:text-7xl">{tx('מה אנחנו מבטיחים', 'What we promise')}</h2>
        <ul className="mt-10 grid border border-ink/20 md:grid-cols-3">
          {promises.map(([id, t, d], i) => (
            <li key={id} className={cn('p-6 md:p-8', i > 0 && 'border-t border-ink/20 md:border-s md:border-t-0')}>
              <EditableText contentId={`${id}_title`} defaultText={t} as="h3" className="text-xl font-bold text-gold" />
              <EditableText contentId={`${id}_desc`} defaultText={d} as="p" multiline className="mt-2 text-base leading-relaxed text-ink/80" />
            </li>
          ))}
        </ul>
      </section>

      <section className="glow-oxblood border-t border-ink/15">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-10 px-4 py-20 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:py-28">
          <EditableText contentId="about_footer_text" defaultText="בואו נלך מעבר." as="p" className="font-display text-[clamp(4rem,10vw,8rem)] font-bold leading-[0.85]" />
          <div className="flex flex-col items-start gap-4">
            <Ticket label={tx('לראות את המארזים', 'See the boxes')} stub="03" stubCaption={tx('מארזים', 'Boxes')} tone="spot" to="/experience" />
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
              <Link to="/gift-card" className="underline underline-offset-4 hover:text-gold">
                {tx('כרטיס מתנה', 'Gift card')}
              </Link>
              <Link to="/contact" className="underline underline-offset-4 hover:text-gold">
                {tx('לכתוב לנו', 'Write to us')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

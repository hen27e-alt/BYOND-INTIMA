import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { EditableText } from '../components/EditableText';
import { useLanguage } from '../contexts/LanguageContext';
import { Ticket } from '../components/season/Ticket';

/** "About" as programme notes: a short essay in numbered parts, then the house rules. */
export const About = () => {
  const { language } = useLanguage();
  const reduce = useReducedMotion();
  const he = language === 'he';
  const tx = (h: string, e: string) => (he ? h : e);

  const reveal = reduce
    ? {}
    : { initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const } };

  const parts = [
    {
      id: 'genesis',
      title: 'איך זה התחיל',
      text: 'Byond Intima נולדה מתוך ההבנה שהדבר היקר ביותר שיש לנו הוא הזמן שאנחנו מקדישים לאנשים שאנחנו אוהבים. בעולם מהיר, דיגיטלי ורועש, החיבור הזוגי הוא לעיתים הראשון להישחק.',
    },
    {
      id: 'why',
      title: 'למה',
      text: "המותג הוקם על ידי זוג שחיפש דרך להחזיר את ה'קסם' לשגרה. הם גילו שמה שבאמת חסר הוא לא 'זמן', אלא 'נוכחות'. הם רצו ליצור משהו שיהיה יותר מסתם מוצר - הם רצו ליצור שפה חדשה של אינטימיות, כזו שמשלבת בין משחקיות בוגרת, עומק רגשי וחיבור פיזי.",
    },
    {
      id: 'craft',
      title: 'איך אנחנו עובדים',
      text: 'כל מארז, כל משימה וכל פרק במסע שלנו עוצבו בקפידה כדי לשלב בין הנאה פיזית, עומק רגשי ומשחקיות בוגרת. אנחנו מאמינים שאינטימיות היא לא יעד, אלא תרגול יומיומי של נוכחות.',
    },
  ];

  const values = [
    ['about_value_1', 'כבוד', 'כבוד הדדי הוא הבסיס לכל מערכת יחסים בריאה ומעצימה.'],
    ['about_value_2', 'צמיחה', 'אנו מעודדים התפתחות אישית וזוגית מתמדת, יחד ולחוד.'],
    ['about_value_3', 'חיבור', 'יצירת מרחב בטוח ועמוק לאינטימיות רגשית ופיזית.'],
  ];

  return (
    <div className="bg-paper pt-16 text-ink md:pt-20">
      <header className="mx-auto max-w-[1440px] px-4 pt-12 md:px-8 lg:px-14 lg:pt-20">
        <div className="grid gap-6 border-b-[3px] border-ink pb-8 lg:grid-cols-[1fr_minmax(0,520px)] lg:items-end">
          <h1 className="font-display text-[clamp(4.5rem,13vw,11rem)] font-bold leading-[0.8]">{tx('עלינו', 'About')}</h1>
          <EditableText
            contentId="about_vision_text"
            defaultText="אנחנו לא מוכרים מוצרים. אנחנו יוצרים מרחבים. סטודיו לחוויות זוגיות מודרכות שנועד לעזור לכם להאט, להסתכל בעיניים, ולגלות מחדש את העומק שנמצא מתחת לפני השטח. המשימה שלנו היא להפוך כל רגע זוגי להזדמנות לצמיחה, גילוי וחיבור עמוק יותר."
            as="p"
            multiline
            className="text-xl leading-relaxed text-ink/85"
          />
        </div>
      </header>

      <ol className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-14">
        {parts.map((p, i) => (
          <motion.li key={p.id} {...reveal} className="grid gap-4 border-b border-ink py-12 lg:grid-cols-[160px_minmax(0,4fr)_minmax(0,7fr)] lg:gap-10 lg:py-16">
            <span className="font-display text-8xl font-bold leading-[0.8] text-spot tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            <EditableText contentId={`about_${p.id}_title`} defaultText={p.title} as="h2" className="font-display text-5xl font-bold leading-[0.9] md:text-6xl" />
            <EditableText contentId={`about_${p.id}_text`} defaultText={p.text} as="p" multiline className="max-w-[60ch] text-xl leading-relaxed text-ink/85" />
          </motion.li>
        ))}
      </ol>

      <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 lg:px-14 lg:py-24">
        <h2 className="border-b-[3px] border-ink pb-3 font-display text-6xl font-bold leading-none md:text-7xl">{tx('מה מנחה אותנו', 'What guides us')}</h2>
        <div className="grid md:grid-cols-3">
          {values.map(([id, t, d], i) => (
            <div key={id} className={`border-b border-ink py-8 md:border-b-0 md:px-6 ${i > 0 ? 'md:border-s' : 'md:ps-0'}`}>
              <EditableText contentId={`${id}_title`} defaultText={t} as="h3" className="font-display text-5xl font-bold leading-none" />
              <EditableText contentId={`${id}_desc`} defaultText={d} as="p" multiline className="mt-3 text-lg leading-relaxed text-ink/80" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-room text-paper">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-8 px-4 py-16 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:py-24">
          <EditableText contentId="about_footer_text" defaultText="בואו נלך מעבר." as="p" className="font-display text-[clamp(4rem,10vw,8rem)] font-bold leading-[0.85]" />
          <div className="flex flex-col items-start gap-3">
            <Ticket label={tx('לראות את המארזים', 'See the boxes')} stub="03" stubCaption={tx('מארזים', 'Boxes')} tone="spot" to="/experience" />
            <Link to="/contact" className="text-sm font-bold underline underline-offset-4 hover:text-[var(--color-accent-light)]">
              {tx('לכתוב לנו', 'Write to us')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Shield, Scale, Eye, Accessibility, AlertTriangle, RefreshCcw, Copyright } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditableText } from '../components/EditableText';

import { BRANDING } from '../constants/branding';

const sections = [
  {
    id: 'terms',
    title: 'תקנון ותנאי שימוש',
    icon: Scale,
    content: `
      ברוכים הבאים לאתר BYOND INTIMA. השימוש באתר ובשירותיו כפוף להסכמתכם לתנאים המפורטים להלן.
      1. האתר מיועד לשימוש אישי ופרטי בלבד.
      2. המשתמש מצהיר כי הוא מעל גיל 18.
      3. אין להעתיק, לשכפל או להפיץ תכנים מהאתר ללא אישור בכתב.
      4. מפעיל האתר שומר לעצמו את הזכות לשנות את תנאי השימוש בכל עת.
    `
  },
  {
    id: 'liability',
    title: 'הגבלת אחריות',
    icon: Shield,
    content: `
      1. מפעיל האתר אינו אחראי לכל נזק ישיר או עקיף שייגרם כתוצאה מהשימוש באתר או במוצרים.
      2. השירות ניתן כפי שהוא (AS IS) ללא כל התחייבות לדיוק או התאמה לצרכים ספציפיים.
      3. המשתמש נושא באחריות המלאה לכל פעולה שיבצע בהסתמך על המידע באתר.
    `
  },
  {
    id: 'privacy',
    title: 'מדיניות פרטיות',
    icon: Eye,
    content: `
      1. אנו מכבדים את פרטיותכם. המידע שנאסף משמש לשיפור השירות בלבד.
      2. פרטיכם האישיים לא יועברו לצדדים שלישיים ללא הסכמתכם, למעט במקרים הנדרשים על פי חוק.
      3. האתר משתמש בעוגיות (Cookies) לצורך חוויית משתמש אופטימלית.
    `
  },
  {
    id: 'accessibility',
    title: 'הצהרת נגישות',
    icon: Accessibility,
    content: `
      אנו פועלים להנגשת האתר לכלל האוכלוסייה, כולל אנשים עם מוגבלויות.
      1. האתר עומד בדרישות תקנות שוויון זכויות לאנשים עם מוגבלויות.
      2. בוצעו התאמות טכנולוגיות לתמיכה בקוראי מסך וניווט מקלדת.
      3. אם נתקלתם בבעיית נגישות, אנא צרו קשר עם רכז הנגישות שלנו בכתובת ${BRANDING.email}.
    `
  },
  {
    id: 'disclaimer',
    title: 'דיסקליימר (הבהרה משפטית)',
    icon: AlertTriangle,
    content: `
      1. התוכן באתר נועד למטרות בידור והעשרה בלבד.
      2. אין לראות במידע באתר תחליף לייעוץ מקצועי, טיפולי, פסיכולוגי או רפואי.
      3. כל הסתמכות על המידע היא על אחריות המשתמש בלבד.
    `
  },
  {
    id: 'refunds',
    title: 'מדיניות ביטולים והחזרים',
    icon: RefreshCcw,
    content: `
      1. ביטול עסקה יתבצע בהתאם לחוק הגנת הצרכן, התשמ"א-1981.
      2. ניתן לבטל רכישת מוצר פיזי תוך 14 יום מקבלתו, בתנאי שלא נעשה בו שימוש והוא באריזתו המקורית.
      3. שירותים דיגיטליים הניתנים להורדה או צפייה אינם ניתנים לביטול לאחר קבלת הגישה.
    `
  },
  {
    id: 'copyright',
    title: 'זכויות יוצרים',
    icon: Copyright,
    content: `
      1. כל הזכויות בתכנים, בעיצובים, בטקסטים ובתמונות באתר שמורות ל-BYOND INTIMA.
      2. אין לעשות שימוש מסחרי או אחר ללא אישור מפורש בכתב.
      3. הפרת זכויות יוצרים תגרור נקיטה בצעדים משפטיים.
    `
  }
];

/** Read mode: every section on one page, with a sticky index that tracks where you are. */
const Legal = () => {
  const [active, setActive] = useState(sections[0].id);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(hash)?.scrollIntoView();
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-20% 0px -65% 0px' }
    );
    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="bg-paper pt-16 text-ink md:pt-20" dir="rtl">
      <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-12 md:px-8 lg:pt-20">
        <header className="border-b-[3px] border-ink pb-8">
          <EditableText contentId="legal_title" defaultText="תקנון ומדיניות" as="h1" className="font-display text-[clamp(4rem,11vw,9rem)] font-bold leading-[0.82]" />
          <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-ink/80">
            תנאי השימוש, הפרטיות, הנגישות והחזרות, במקום אחד. לשאלות אפשר לכתוב ל־
            <a href={`mailto:${BRANDING.email}`} className="font-bold underline underline-offset-4 hover:text-spot" dir="ltr">
              {BRANDING.email}
            </a>
          </p>
        </header>

        <div className="grid gap-10 pt-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="פרקים" className="lg:sticky lg:top-28 lg:self-start">
            <ol className="flex gap-x-5 gap-y-1 overflow-x-auto border-b border-ink pb-3 lg:block lg:border-b-0 lg:pb-0">
              {sections.map((sec, i) => (
                <li key={sec.id} className="shrink-0 lg:border-b lg:border-rule">
                  <a
                    href={`#${sec.id}`}
                    aria-current={active === sec.id ? 'location' : undefined}
                    className={`flex items-baseline gap-2 py-2 text-base font-bold transition-colors ${active === sec.id ? 'text-spot' : 'hover:text-spot'}`}
                  >
                    <span className="tabular-nums text-sm">{String(i + 1).padStart(2, '0')}</span>
                    {sec.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div>
            {sections.map((sec, i) => {
              const lines = sec.content.split(/\n/).map((l) => l.trim()).filter(Boolean);
              return (
                <section key={sec.id} id={sec.id} className="scroll-mt-28 border-t-[3px] border-ink pb-12 pt-4 first:border-t-0 first:pt-0">
                  <h2 className="flex items-baseline gap-3 font-display text-5xl font-bold leading-none">
                    <span className="text-spot tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    {sec.title}
                  </h2>
                  <div className="mt-5 max-w-[68ch] space-y-3 text-lg leading-relaxed text-ink/85">
                    {lines.map((l) => (
                      <p key={l}>{l}</p>
                    ))}
                  </div>
                </section>
              );
            })}
            <Link to="/contact" className="inline-block bg-ink px-6 py-3.5 text-lg font-bold text-paper hover:bg-spot">
              שאלה? לכתוב לנו
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;

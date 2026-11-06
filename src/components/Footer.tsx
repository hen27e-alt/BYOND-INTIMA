import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BRANDING } from '../constants/branding';
import { useSeasonSettings } from '../lib/catalogue';

const pad = (n: number) => String(n).padStart(2, '0');

/** The colophon: printed on the dark "room" at the end of every page. */
export const Footer = () => {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = React.useState(false);
  const { profile, user } = useFirebase();
  const { language } = useLanguage();
  const { seasonNumber } = useSeasonSettings();
  const he = language === 'he';
  const tx = (h: string, e: string) => (he ? h : e);
  const isAdmin = profile?.role === 'admin' || profile?.email === 'hen27e@gmail.com';

  React.useEffect(() => {
    if (!isDisclaimerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsDisclaimerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDisclaimerOpen]);

  const columns = [
    {
      title: tx('התוכנייה', 'The programme'),
      links: [
        { to: '/#membership', label: tx('המנוי', 'Membership') },
        { to: '/experience', label: tx('המארזים', 'The boxes') },
        { to: '/boutique', label: tx('הבוטיק', 'Boutique') },
        { to: '/cards', label: tx('קלפי המשימה', 'Mission cards') },
        { to: user ? '/dashboard' : '/login', label: tx('המקום שלכם', 'Your place') },
      ],
    },
    {
      title: tx('הבית', 'The house'),
      links: [
        { to: '/about', label: tx('עלינו', 'About') },
        { to: '/contact', label: tx('צרו קשר', 'Contact') },
        { to: '/orders', label: tx('ההזמנות שלי', 'My orders') },
        { to: '/legal', label: tx('תקנון ותנאי שימוש', 'Terms') },
      ],
    },
  ];

  return (
    <footer className="bg-room text-paper">
      <div className="mx-auto max-w-[1440px] px-4 pt-14 pb-8 md:px-8 lg:px-14 lg:pt-20">
        <div className="grid gap-12 border-b border-paper/20 pb-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="font-display text-[64px] font-bold leading-[0.85] md:text-[88px]">
              BYOND INTIMA
            </Link>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-paper/75">
              {tx(
                `ערבים זוגיים בעונות. עכשיו בתוכנייה: עונה ${pad(seasonNumber)}.`,
                `Evenings for two, in seasons. Now showing: season ${pad(seasonNumber)}.`
              )}
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
              <li>
                <a href={`mailto:${BRANDING.email}`} className="underline decoration-paper/30 underline-offset-4 hover:text-[var(--color-accent-light)]">
                  {BRANDING.email}
                </a>
              </li>
              <li>
                <a href={BRANDING.instagram} target="_blank" rel="noopener noreferrer" className="underline decoration-paper/30 underline-offset-4 hover:text-[var(--color-accent-light)]">
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="border-b-[3px] border-paper pb-2 font-display text-3xl font-bold leading-none">{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to} className="block border-b border-paper/15 py-3 text-[15px] transition-colors hover:text-[var(--color-accent-light)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 pt-6 text-sm text-paper/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Byond Intima</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <button onClick={() => setIsDisclaimerOpen(true)} className="hover:text-paper">
              {tx('כתב ויתור', 'Disclaimer')}
            </button>
            {isAdmin && (
              <Link to="/admin" className="font-bold text-[var(--color-accent-light)] hover:text-paper">
                {tx('פאנל ניהול', 'Admin')}
              </Link>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDisclaimerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsDisclaimerOpen(false)}
              className="absolute inset-0 bg-ink/70"
            />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative max-h-[80vh] w-full max-w-2xl overflow-y-auto border-[3px] border-ink bg-paper p-6 text-ink md:p-10"
            >
              <button
                onClick={() => setIsDisclaimerOpen(false)}
                className="absolute end-4 top-4 p-1 hover:text-spot"
                aria-label={tx('סגירה', 'Close')}
              >
                <X size={22} />
              </button>
              <h3 id="disclaimer-title" className="mb-6 border-b-[3px] border-ink pb-3 pe-10 font-display text-4xl font-bold leading-none">
                כתב ויתור והגבלת אחריות
              </h3>
              <div className="space-y-5 text-[15px] leading-relaxed text-ink/80" dir="rtl">
                <p>
                  1. כללי ומהות השירות: התכנים, המשימות, המשחקים והמוצרים המוצעים באתר Byond Intima ובמארזים הפיזיים נועדו למטרות בידור, פנאי והעשרה חווייתית בלבד. מפעיל האתר אינו איש מקצוע בתחומי בריאות הנפש, טיפול זוגי או ייעוץ מיני מוסמך, ואין לראות בתכנים המועברים משום ייעוץ מקצועי, טיפולי או אבחנתי מכל סוג שהוא.
                </p>
                <p>
                  2. העדר אחריות מקצועית: השימוש באתר ובמארזים אינו מהווה תחליף לייעוץ זוגי, פסיכולוגי, רפואי או סקסולוגי פרטני המותאם לצרכי המשתמש. למען הסר ספק, מפעיל האתר לא יישא באחריות לכל תוצאה, ישירה או עקיפה, הנובעת מהסתמכות על המידע או על המשימות המוצעים, ואלו מבוצעים על דעת המשתמשים בלבד.
                </p>
                <p>
                  3. אחריות המשתמש ובטיחות: ההחלטה לבצע משימה כלשהי או להשתמש במוצר כלשהו היא באחריותם הבלעדית והמלאה של המשתמשים. המשתמשים מתחייבים להפעיל שיקול דעת, לכבד את גבולות הנוחות של בני זוגם ולהפסיק כל פעילות הגורמת לאי-נוחות פיזית או רגשית. מפעיל האתר לא יהיה אחראי לכל נזק גופני, רגשי או נפשי שייגרם, ככל שייגרם, כתוצאה משימוש לא סביר, חריגה מגבולות הנוחות או אי-הבנה של הוראות המשחק.
                </p>
                <p>
                  4. מוצרים ואביזרים: האחריות על איכות האביזרים הפיזיים ובטיחותם חלה על יצרני המוצרים המצורפים למארז. יש לקרוא בעיון את הוראות היצרן לפני השימוש. מפעיל האתר אינו אחראי לנזקים הנובעים משימוש לקוי או רשלני במוצרים.
                </p>
                <p>
                  5. סמכות שיפוט: על תנאים אלו יחולו דיני מדינת ישראל, וסמכות השיפוט הבלעדית תהא לבתי המשפט המוסמכים במחוז הצפון/חיפה.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

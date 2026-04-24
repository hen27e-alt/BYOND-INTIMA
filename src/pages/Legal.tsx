import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Scale, Eye, Accessibility, AlertTriangle, RefreshCcw, Copyright, ArrowRight } from 'lucide-react';
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

const Legal = () => {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <EditableText 
            contentId="legal_title"
            defaultText="מידע משפטי ותנאים"
            as="h1"
            className="text-5xl font-serif mb-4"
          />
          <p className="text-brand-black/50 max-w-2xl mx-auto">
            כאן תוכלו למצוא את כל המידע המשפטי, תנאי השימוש ומדיניות האתר שלנו. אנו מחויבים לשקיפות והגנה על זכויותיכם.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all text-right ${
                  activeSection === section.id
                    ? 'bg-brand-black text-white shadow-lg shadow-brand-black/20'
                    : 'bg-white/50 text-brand-black/60 hover:bg-white'
                }`}
              >
                <section.icon size={18} className={activeSection === section.id ? 'text-brand-gold' : ''} />
                <span className="text-sm font-medium">{section.title}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-brand-gold/10 min-h-[500px]"
            >
              {sections.find(s => s.id === activeSection) && (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                      {React.createElement(sections.find(s => s.id === activeSection)!.icon, { size: 24 })}
                    </div>
                    <h2 className="text-3xl font-serif">{sections.find(s => s.id === activeSection)!.title}</h2>
                  </div>
                  <div className="prose prose-brand max-w-none text-brand-black/70 leading-relaxed whitespace-pre-line">
                    {sections.find(s => s.id === activeSection)!.content}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-black transition-colors font-medium"
          >
            חזרה לדף הבית <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Legal;

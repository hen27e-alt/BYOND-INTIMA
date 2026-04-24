import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Lightbulb, Star, Info } from 'lucide-react';
import { ContentFeedback } from './ContentFeedback';

const tips = [
  {
    id: 1,
    title: 'זמן איכות ללא מסכים',
    content: 'הקדישו לפחות 30 דקות ביום לשיחה אמיתית, ללא טלפונים או טלוויזיה ברקע. זה הזמן שלכם להתחבר מחדש.',
    category: 'תקשורת',
    icon: Heart
  },
  {
    id: 2,
    title: 'הפתעות קטנות',
    content: 'לא צריך לחכות ליום הולדת או יום נישואין. פתק קטן בתיק, כוס קפה במיטה, או הודעה מתוקה באמצע היום יכולים לעשות את ההבדל.',
    category: 'רומנטיקה',
    icon: Star
  },
  {
    id: 3,
    title: 'הקשבה פעילה',
    content: 'כשבן או בת הזוג מדברים, נסו באמת להקשיב כדי להבין, ולא רק כדי להגיב. תנו להם לסיים את דבריהם לפני שאתם עונים.',
    category: 'תקשורת',
    icon: Info
  },
  {
    id: 4,
    title: 'חלוקת תפקידים הוגנת',
    content: 'שבו יחד ועברו על מטלות הבית. ודאו שהחלוקה הוגנת ומתאימה לשניכם, כדי למנוע תסכולים מיותרים.',
    category: 'חיי יומיום',
    icon: Lightbulb
  },
  {
    id: 5,
    title: 'ללמוד משהו חדש יחד',
    content: 'הירשמו לסדנה, קחו קורס מקוון, או למדו שפה חדשה יחד. חוויה משותפת של למידה מקרבת ומייצרת נושאי שיחה חדשים.',
    category: 'צמיחה משותפת',
    icon: Star
  },
  {
    id: 6,
    title: 'דייט "מיקרו" של 10 דקות',
    content: 'במקום לחכות לערב פנוי שלם, הקדישו 10 דקות בכל ערב לשיחה ממוקדת ללא הסחות דעת. שאלו שאלה אחת עמוקה כמו "מה הדבר שהכי ריגש אותך השבוע?".',
    category: 'רומנטיקה',
    icon: Star
  },
  {
    id: 7,
    title: 'חילופי שפות אהבה',
    content: 'במשך סוף שבוע אחד, כל אחד מכם יפעל אך ורק לפי שפת האהבה של השני. זו דרך מצוינת להבין מה באמת גורם לצד השני להרגיש אהוב.',
    category: 'חיבור רגשי',
    icon: Heart
  },
  {
    id: 8,
    title: 'משימת המסתורין החודשית',
    content: 'פעם בחודש, אחד מכם מתכנן פעילות מפתיעה בתקציב מוגבל (עד 50 ש"ח). המטרה היא יצירתיות ומחשבה, לא השקעה כספית.',
    category: 'חוויה משותפת',
    icon: Lightbulb
  }
];

export const CoupleTips = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(tips.map(tip => tip.category)));
  const filteredTips = activeCategory ? tips.filter(tip => tip.category === activeCategory) : tips;

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-gold/10 text-brand-gold mb-6">
          <Lightbulb size={32} />
        </div>
        <h2 className="text-3xl font-serif mb-4">טיפים לזוגיות</h2>
        <p className="text-brand-black/60 max-w-2xl mx-auto">
          עצות קטנות שיכולות לעשות הבדל גדול. גלו דרכים חדשות לחזק את הקשר, לשפר את התקשורת ולהוסיף ניצוץ לחיי היומיום.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            activeCategory === null
              ? 'bg-brand-gold text-white'
              : 'bg-white border border-brand-gold/20 text-brand-black/60 hover:border-brand-gold'
          }`}
        >
          הכל
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              activeCategory === category
                ? 'bg-brand-gold text-white'
                : 'bg-white border border-brand-gold/20 text-brand-black/60 hover:border-brand-gold'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Tips Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredTips.map((tip, index) => (
          <motion.div
            key={tip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-brand-gold/10 p-6 rounded-xl hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-cream flex items-center justify-center text-brand-gold shrink-0 group-hover:scale-110 transition-transform">
                <tip.icon size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mb-2 block">
                  {tip.category}
                </span>
                <h3 className="font-serif text-xl mb-3">{tip.title}</h3>
                <p className="text-brand-black/70 leading-relaxed text-sm">
                  {tip.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feedback Section */}
      <div className="pt-8 mt-8 border-t border-brand-gold/10 flex justify-center">
        <ContentFeedback 
          pageId="couple-tips" 
          sectionId="tips-list" 
          sectionTitle="טיפים לזוגיות" 
        />
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { Check, Star, Shield, Award } from 'lucide-react';

const ExperienceCard = ({ tier, title, description, features, focus, img, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className="bg-white border border-brand-gold/10 p-8 md:p-12 flex flex-col h-full hover:shadow-xl hover:shadow-brand-gold/5 transition-all duration-500"
  >
    <div className="aspect-[16/9] overflow-hidden mb-10 -mx-8 md:-mx-12 -mt-8 md:-mt-12">
      <img src={img} alt={title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" referrerPolicy="no-referrer" />
    </div>
    <div className="mb-auto">
      <span className="text-xs tracking-[0.3em] uppercase text-brand-gold mb-4 block">{tier}</span>
      <h3 className="text-3xl font-serif mb-6">{title}</h3>
      <p className="text-brand-black/60 mb-10 leading-relaxed font-light">{description}</p>
      
      <div className="space-y-4 mb-12">
        {features.map((feature: string, i: number) => (
          <div key={i} className="flex items-start gap-3 text-sm text-brand-black/80">
            <Check size={16} className="text-brand-gold mt-0.5 shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="pt-8 border-t border-brand-gold/10">
      <p className="text-xs tracking-widest uppercase text-brand-black/40 mb-6">פוקוס: {focus}</p>
      <button className="w-full py-4 bg-brand-black text-white text-xs tracking-[0.2em] uppercase hover:bg-brand-gold transition-colors duration-500">
        הזמינו עכשיו
      </button>
    </div>
  </motion.div>
);

export const Experience = () => {
  return (
    <div className="pt-32 pb-32 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-6xl font-serif mb-8">קולקציית EXPERIENCE</h1>
          <p className="text-lg text-brand-black/50 max-w-2xl mx-auto italic">
            שלוש רמות של חוויית ערב זוגית מובנית: בישול, קולנוע, משימות וחיבור עמוק.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <ExperienceCard 
            tier="Level 01"
            title="CORE"
            img="https://images.unsplash.com/photo-1516589174184-c685266e430c?auto=format&fit=crop&q=80&w=800"
            description="ערב זוגי קליל ומהנה המיועד לשבור את השגרה ולהחזיר את החיוך."
            focus="כיף. צחוק. חיבור מחדש."
            delay={0.1}
            features={[
              "קלפי משימות בסיסיים",
              "אתגר בישול זוגי",
              "שלב סרט אינטראקטיבי",
              "אמת/חובה קליל",
              "3 כרטיסי גירוד",
              "QR לאזור האישי"
            ]}
          />
          <ExperienceCard 
            tier="Level 02"
            title="PRO"
            img="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=800"
            description="אותו ערב בסיסי, עם הרבה יותר עומק, משחקיות ואלמנטים פיזיים."
            focus="תחרות בריאה + קרבה רגשית."
            delay={0.3}
            features={[
              "חפיסת קלפים מורחבת",
              "קוביות משימה מעץ",
              "טיימר / שעון חול",
              "7 כרטיסי גירוד",
              "תבלין סודי",
              "נר עיסוי",
              "מערכת ניקוד ופתיחת רמות"
            ]}
          />
          <ExperienceCard 
            tier="Level 03"
            title="SIGNATURE"
            img="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800"
            description="הגרסה היוקרתית והמלאה ביותר. חוויה שהיא מתנה בלתי נשכחת לעצמכם."
            focus="חוויה מתנה. ערב בלתי נשכח."
            delay={0.5}
            features={[
              "שעון חול שחור-זהב",
              "מלקחיים פרימיום",
              "10 כרטיסי גירוד",
              "3 תבלינים סודיים",
              "חפש את המטמון מלא",
              "קנבס קטן וצבעי גוף",
              "מפתח פיזי לפתיחת עונה 2"
            ]}
          />
        </div>
      </div>
    </div>
  );
};

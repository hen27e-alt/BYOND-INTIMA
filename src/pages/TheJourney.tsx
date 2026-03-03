import React from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

export const TheJourney = () => {
  const stages = [
    { name: 'נוכחות', desc: 'להיות כאן ועכשיו.' },
    { name: 'סקרנות', desc: 'לגלות מחדש את מי שמולנו.' },
    { name: 'פגיעות', desc: 'להסיר את המגננות.' },
    { name: 'אמת', desc: 'לדבר את הלב ללא פילטרים.' },
    { name: 'תשוקה', desc: 'להצית את האש הפנימית.' },
    { name: 'הצתה', desc: 'חיבור פיזי ורגשי עוצמתי.' },
    { name: 'בחירה', desc: 'לבחור אחד בשנייה מחדש.' }
  ];

  return (
    <div className="bg-brand-black text-white min-h-screen pt-32 pb-32 selection:bg-brand-gold selection:text-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
          >
            <span className="text-xs tracking-[0.5em] text-brand-gold uppercase mb-8 block">Private Collection</span>
            <h1 className="text-6xl md:text-8xl font-serif font-light mb-12 tracking-wider">THE JOURNEY</h1>
            <div className="w-24 h-px bg-brand-gold mx-auto mb-12"></div>
            <p className="text-xl text-white/60 leading-relaxed font-light italic">
              זהו לא ערב קליל. זהו מסע זוגי עמוק בן 7 פרקים, המעוצב כקשת רגשית של גילוי וחיבור.
            </p>
          </motion.div>
        </div>

        {/* Product Showcase */}
        <div className="grid lg:grid-cols-2 gap-24 items-center mb-40">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-white/5 border border-white/10 p-12 flex items-center justify-center">
               <div className="w-full h-full border border-brand-gold/20 flex flex-col items-center justify-center text-center p-8">
                  <h4 className="font-serif text-3xl mb-4">THE BOX</h4>
                  <p className="text-sm text-white/40 uppercase tracking-widest">Matte Black & Gold Embossing</p>
               </div>
            </div>
            <div className="absolute -bottom-8 -right-8 bg-brand-gold p-8 text-black">
               <Lock size={32} />
            </div>
          </motion.div>

          <div className="space-y-12">
            <h3 className="text-3xl font-serif text-brand-gold">מה בתוך המארז?</h3>
            <ul className="space-y-6 text-lg text-white/70 font-light">
              <li className="flex items-center gap-4 border-b border-white/10 pb-4">
                <span className="text-brand-gold font-serif">01</span> קופסה קשיחה מגנטית
              </li>
              <li className="flex items-center gap-4 border-b border-white/10 pb-4">
                <span className="text-brand-gold font-serif">02</span> יומן מסע בכריכה קשה
              </li>
              <li className="flex items-center gap-4 border-b border-white/10 pb-4">
                <span className="text-brand-gold font-serif">03</span> 7 כרכים עומדים (פרקי המסע)
              </li>
              <li className="flex items-center gap-4 border-b border-white/10 pb-4">
                <span className="text-brand-gold font-serif">04</span> תא נסתר עם הפתעות
              </li>
              <li className="flex items-center gap-4 border-b border-white/10 pb-4">
                <span className="text-brand-gold font-serif">05</span> כיסוי עיניים סאטן ונוצה
              </li>
              <li className="flex items-center gap-4 border-b border-white/10 pb-4">
                <span className="text-brand-gold font-serif">06</span> ריח מותגי ייחודי
              </li>
            </ul>
          </div>
        </div>

        {/* The 7 Stages */}
        <div className="mb-40">
          <h3 className="text-center text-4xl font-serif mb-24">שבעת שלבי המסע</h3>
          <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-8">
            {stages.map((stage, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-12 h-12 rounded-full border border-brand-gold/30 flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-gold group-hover:text-black transition-all duration-500">
                  {i + 1}
                </div>
                <h4 className="font-serif text-xl mb-2 text-brand-gold">{stage.name}</h4>
                <p className="text-xs text-white/40 uppercase tracking-tighter">{stage.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-brand-gold mb-8 tracking-[0.3em] uppercase text-sm">זמין בקרוב</p>
            <button className="px-16 py-6 border border-brand-gold text-brand-gold uppercase tracking-[0.4em] text-sm hover:bg-brand-gold hover:text-black transition-all duration-700">
              בקשת גישה מוקדמת
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

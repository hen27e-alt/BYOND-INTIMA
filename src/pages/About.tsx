import React from 'react';
import { motion } from 'motion/react';

export const About = () => {
  return (
    <div className="pt-32 pb-32 bg-brand-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-24"
        >
          <span className="text-xs tracking-[0.5em] text-brand-gold uppercase mb-8 block">Our Story</span>
          <h1 className="text-5xl md:text-7xl font-serif mb-12">BYOND INTIMA</h1>
          <div className="w-24 h-px bg-brand-gold mx-auto"></div>
        </motion.div>

        <div className="space-y-16 text-lg text-brand-black/70 leading-relaxed font-light text-center">
          <p>
            Byond Intima נולדה מתוך ההבנה שהדבר היקר ביותר שיש לנו הוא הזמן שאנחנו מקדישים לאנשים שאנחנו אוהבים. 
            בעולם מהיר, דיגיטלי ורועש, החיבור הזוגי הוא לעיתים הראשון להישחק.
          </p>
          
          <div className="py-12 border-y border-brand-gold/10">
            <h3 className="text-3xl font-serif text-brand-black mb-8 italic">החזון שלנו</h3>
            <p>
              אנחנו לא מוכרים מוצרים. אנחנו יוצרים מרחבים. <br />
              סטודיו לחוויות זוגיות מודרכות שנועד לעזור לכם להאט, להסתכל בעיניים, 
              ולגלות מחדש את העומק שנמצא מתחת לפני השטח.
            </p>
          </div>

          <p>
            כל מארז, כל משימה וכל פרק במסע שלנו עוצבו בקפידה כדי לשלב בין הנאה פיזית, 
            עומק רגשי ומשחקיות בוגרת. אנחנו מאמינים שאינטימיות היא לא יעד, אלא תרגול יומיומי של נוכחות.
          </p>

          <div className="pt-12">
            <p className="font-serif text-2xl italic text-brand-gold">
              בואו נלך מעבר.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

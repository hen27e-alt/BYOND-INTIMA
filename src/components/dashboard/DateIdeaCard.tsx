import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Heart, Sparkles, Music, Wine } from 'lucide-react';

export const DateIdeaCard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white border border-brand-gold/20 p-8 rounded-3xl shadow-xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
            <Sparkles className="text-brand-gold" size={20} />
          </div>
          <h3 className="text-sm tracking-[0.3em] uppercase text-brand-black/40 font-bold">רעיון לדייט מפתיע</h3>
        </div>

        <h4 className="text-2xl font-serif mb-4 text-brand-black">לילה של כוכבים ונוסטלגיה</h4>
        
        <p className="text-brand-black/60 mb-8 leading-relaxed text-right">
          צאו לפיקניק לילי על גג או במקום שקט תחת כיפת השמיים. הכינו פלייליסט של "השירים שלנו" וכתבו מכתב אחד לשנייה על העתיד המשותף שלכם. אל תשכחו להביא את היין האהוב עליכם!
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-black/40">
            <MapPin size={14} className="text-brand-gold" />
            <span>תחת כיפת השמיים</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-black/40">
            <Calendar size={14} className="text-brand-gold" />
            <span>סוף שבוע הקרוב</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-black/40">
            <Music size={14} className="text-brand-gold" />
            <span>פלייליסט אישי</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-black/40">
            <Wine size={14} className="text-brand-gold" />
            <span>יין וגבינות</span>
          </div>
        </div>

        <button className="w-full py-4 bg-brand-black text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold transition-all rounded-xl flex items-center justify-center gap-2 group/btn">
          <Heart size={14} className="group-hover/btn:scale-125 transition-transform" />
          שמור ליומן המשותף
        </button>
      </div>
    </motion.div>
  );
};

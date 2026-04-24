import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, Sparkles, MapPin, Loader2, RefreshCw, Star, Heart, Coffee, Utensils, Music, Camera } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';

const DATE_CATEGORIES = [
  { id: 'food', name: 'קולינריה', icon: Utensils, color: 'bg-orange-500', ideas: ['סדנת בישול איטלקית', 'פיקניק בשקיעה', 'טעימות יין', 'ארוחת שף פרטית'] },
  { id: 'adventure', name: 'הרפתקה', icon: MapPin, color: 'bg-emerald-500', ideas: ['טיול ג\'יפים', 'קיר טיפוס', 'חדר בריחה', 'טיסה בכדור פורח'] },
  { id: 'chill', name: 'רוגע', icon: Heart, color: 'bg-pink-500', ideas: ['ספא זוגי', 'ערב סרטים בבית', 'יוגה בשקיעה', 'סדנת ציור ויין'] },
  { id: 'culture', name: 'תרבות', icon: Music, color: 'bg-indigo-500', ideas: ['הופעה חיה', 'סיור במוזיאון', 'הצגת תיאטרון', 'סטנדאפ'] },
  { id: 'creative', name: 'יצירה', icon: Camera, color: 'bg-purple-500', ideas: ['סדנת נגרות', 'צילומי זוגיות', 'סדנת קרמיקה', 'כתיבת שיר משותף'] },
  { id: 'coffee', name: 'קפה ופינוק', icon: Coffee, color: 'bg-amber-700', ideas: ['בית קפה בוטיק', 'סדנת בריסטה', 'טעימות שוקולד', 'בראנץ\' מושחת'] }
];

export const DateNightRoulette = () => {
  const { profile } = useFirebase();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowResult(false);
    
    // Add multiple full rotations + random offset
    const extraRotations = 5 + Math.random() * 5;
    const newRotation = rotation + (extraRotations * 360);
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const normalizedRotation = newRotation % 360;
      const segmentSize = 360 / DATE_CATEGORIES.length;
      // Calculate which segment landed on top (0 degrees is the first segment)
      // We subtract from 360 because rotation is clockwise
      const index = Math.floor(((360 - (normalizedRotation % 360)) % 360) / segmentSize);
      const category = DATE_CATEGORIES[index];
      const idea = category.ideas[Math.floor(Math.random() * category.ideas.length)];
      
      setResult({ ...category, idea });
      setShowResult(true);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto">
          <Dices size={40} className="text-brand-gold" />
        </div>
        <h2 className="text-4xl font-serif text-brand-black">רולטת הדייטים</h2>
        <p className="text-brand-black/60 max-w-xl mx-auto text-lg">
          לא יודעים מה לעשות הערב? תנו לגורל להחליט! סובבו את הרולטה וקבלו רעיון לדייט מושלם.
        </p>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
          <div className="w-8 h-12 bg-brand-gold clip-path-triangle shadow-lg" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
        </div>

        {/* Roulette Wheel */}
        <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] rounded-full border-8 border-brand-black/5 shadow-2xl overflow-hidden bg-white">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: [0.45, 0.05, 0.55, 0.95] }}
            className="w-full h-full relative"
          >
            {DATE_CATEGORIES.map((cat, i) => {
              const angle = 360 / DATE_CATEGORIES.length;
              const rotate = i * angle;
              return (
                <div
                  key={cat.id}
                  className="absolute top-0 left-1/2 w-1/2 h-full origin-left"
                  style={{ 
                    transform: `rotate(${rotate}deg)`,
                    backgroundColor: i % 2 === 0 ? '#fdfbf7' : '#ffffff'
                  }}
                >
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-start pt-12 md:pt-20"
                    style={{ transform: `rotate(${angle / 2}deg)` }}
                  >
                    <cat.icon size={32} className="text-brand-gold mb-2" />
                    <span className="text-xs md:text-sm font-bold text-brand-black/60 uppercase tracking-widest vertical-text">
                      {cat.name}
                    </span>
                  </div>
                  {/* Divider Line */}
                  <div className="absolute top-0 left-0 w-px h-full bg-brand-gold/10 origin-left" />
                </div>
              );
            })}
          </motion.div>
          
          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 bg-white rounded-full shadow-inner border-4 border-brand-gold/20 flex items-center justify-center z-10">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-gold rounded-full flex items-center justify-center text-white shadow-lg">
              <Star size={24} />
            </div>
          </div>
        </div>

        <button
          onClick={spin}
          disabled={isSpinning}
          className={`mt-12 px-12 py-5 rounded-full text-xl font-bold uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${
            isSpinning 
              ? 'bg-brand-black/20 text-brand-black/40 cursor-not-allowed' 
              : 'bg-brand-gold text-white hover:bg-brand-black hover:scale-105 active:scale-95'
          }`}
        >
          {isSpinning ? (
            <>
              <Loader2 className="animate-spin" />
              מסתובב...
            </>
          ) : (
            <>
              <RefreshCw />
              סובבו את הרולטה
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border border-brand-gold/20 text-center space-y-8 relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-full h-2 ${result.color}`} />
            
            <div className="space-y-4">
              <div className={`w-20 h-20 ${result.color} text-white rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                <result.icon size={40} />
              </div>
              <h3 className="text-3xl font-serif text-brand-black">הגורל בחר: {result.name}</h3>
            </div>

            <div className="bg-brand-cream/30 rounded-3xl p-8 border border-brand-gold/10">
              <p className="text-sm text-brand-gold font-bold uppercase tracking-widest mb-2">הרעיון הנבחר</p>
              <h4 className="text-4xl font-serif text-brand-black">{result.idea}</h4>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-4">
              <button className="px-8 py-4 bg-brand-black text-white rounded-full font-bold hover:bg-brand-gold transition-all shadow-lg flex items-center justify-center gap-2">
                <MapPin size={20} />
                מצא מקומות קרובים
              </button>
              <button 
                onClick={() => setShowResult(false)}
                className="px-8 py-4 border border-brand-gold text-brand-gold rounded-full font-bold hover:bg-brand-gold hover:text-white transition-all"
              >
                סובבו שוב
              </button>
            </div>

            <div className="pt-6 border-t border-brand-gold/10">
              <p className="text-brand-black/40 italic flex items-center justify-center gap-2">
                <Sparkles size={16} />
                טיפ: אל תתווכחו עם הרולטה, היא יודעת מה טוב לכם!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCw } from 'lucide-react';

const options = [
  { text: "נשיקה צרפתית", color: "#C9A96E" },
  { text: "מסאז' 5 דקות", color: "#1E293B" },
  { text: "מחמאה כנה", color: "#F59E0B" },
  { text: "חיבוק דוב", color: "#EF4444" },
  { text: "לחישה באוזן", color: "#3B82F6" },
  { text: "סלפי מצחיק", color: "#A855F7" },
  { text: "לשתות שוט", color: "#10B981" },
  { text: "ריקוד קצר", color: "#EC4899" },
];

export const SpinTheWheel = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const spinAmount = Math.floor(Math.random() * 360) + 1440; // At least 4 full spins
    const newRotation = rotation + spinAmount;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const finalAngle = newRotation % 360;
      const segmentAngle = 360 / options.length;
      // Calculate which segment is at the top (0 degrees)
      // The wheel rotates clockwise, so the top segment is the one that was at (360 - finalAngle)
      const normalizedAngle = (360 - finalAngle) % 360;
      const index = Math.floor(normalizedAngle / segmentAngle);
      setResult(options[index].text);
    }, 4000); // Matches transition duration
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 md:p-12 bg-brand-cream rounded-3xl shadow-xl border border-brand-gold/20 relative overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-serif text-brand-black mb-4">רולטת האהבה</h2>
        <p className="text-brand-black/50 text-sm uppercase tracking-widest">סובבו את הגלגל וגלו מה המשימה הבאה</p>
      </div>

      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-12">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 text-brand-black drop-shadow-md">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L22 20H2L12 2Z" />
          </svg>
        </div>

        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full border-4 border-brand-gold shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] ease-[cubic-bezier(0.25,0.1,0.15,1)]"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {options.map((option, index) => {
            const angle = (360 / options.length) * index;
            const skewY = 90 - (360 / options.length);
            return (
              <div
                key={index}
                className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left border-l border-white/20"
                style={{
                  backgroundColor: option.color,
                  transform: `rotate(${angle}deg) skewY(${skewY}deg)`,
                }}
              >
                <div 
                  className="absolute bottom-0 left-0 w-[200%] h-[200%] origin-bottom-left flex items-center justify-center text-white font-bold text-sm md:text-base"
                  style={{
                    transform: `skewY(-${skewY}deg) rotate(${360 / options.length / 2}deg) translate(50%, -50%)`,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  <span className="block -rotate-90 translate-x-4 translate-y-4 whitespace-nowrap">
                    {option.text}
                  </span>
                </div>
              </div>
            );
          })}
          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-brand-gold z-10 shadow-inner flex items-center justify-center">
            <div className="w-4 h-4 bg-brand-black rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="h-24 flex flex-col items-center justify-center">
        {!isSpinning && !result && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={spin}
            className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-brand-gold to-[#e5c687] text-brand-black rounded-full hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] transition-all uppercase tracking-widest text-sm font-bold shadow-lg"
          >
            <RotateCw size={18} />
            סובב עכשיו
          </motion.button>
        )}
        
        {isSpinning && (
          <p className="text-brand-gold font-bold text-xl animate-pulse tracking-widest uppercase">
            מסתובב...
          </p>
        )}

        {result && !isSpinning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-3xl md:text-4xl font-serif text-brand-black mb-6">
              {result}!
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={spin}
              className="text-brand-gold text-sm uppercase tracking-widest hover:underline font-bold"
            >
              סובב שוב
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

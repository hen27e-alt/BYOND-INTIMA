import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Star } from 'lucide-react';

interface CelebrationOverlayProps {
  showCelebration: boolean;
  celebratedMission: any;
}

export const CelebrationOverlay = ({ showCelebration, celebratedMission }: CelebrationOverlayProps) => (
  <AnimatePresence>
    {showCelebration && celebratedMission && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none"
      >
        <div className="absolute inset-0 bg-brand-black/20 backdrop-blur-[2px]" />
        
        <motion.div 
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          className="relative bg-white p-12 shadow-2xl border border-brand-gold/20 text-center max-w-sm w-full mx-6 pointer-events-auto"
        >
          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: "50%", 
                  y: "50%", 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: `${50 + (Math.random() - 0.5) * 120}%`, 
                  y: `${50 + (Math.random() - 0.5) * 120}%`,
                  scale: Math.random() * 1.2,
                  opacity: 0,
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 1.2 + Math.random() * 0.8, 
                  ease: "easeOut",
                  delay: Math.random() * 0.1
                }}
                className="absolute w-1.5 h-1.5 bg-brand-gold rounded-full"
              />
            ))}
          </div>

          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 relative"
          >
            <Check className="text-emerald-600" size={40} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-2xl font-serif mb-2 text-brand-black">כל הכבוד!</h3>
            <p className="text-brand-black/60 text-sm mb-6">
              השלמתם את המשימה: <br/>
              <span className="text-brand-black font-medium">"{celebratedMission.title}"</span>
            </p>
            
            <div className="inline-flex items-center gap-2 bg-brand-gold/10 px-4 py-2 rounded-full">
              <Star size={14} className="text-brand-gold fill-brand-gold" />
              <span className="text-brand-gold font-serif text-lg">+{celebratedMission.points}</span>
              <span className="text-brand-gold/60 text-[10px] uppercase tracking-widest font-bold">נקודות זהב</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

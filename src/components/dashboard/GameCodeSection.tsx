import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

interface GameCodeSectionProps {
  onUnlock: () => void;
}

export const GameCodeSection: React.FC<GameCodeSectionProps> = ({ onUnlock }) => {
  const [gameCode, setGameCode] = useState('');
  const [gameError, setGameError] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 bg-brand-gold/10 rounded-full flex items-center justify-center mb-8">
        <Lock className="text-brand-gold" size={40} />
      </div>
      <h3 className="text-3xl font-serif mb-4 text-brand-black">אזור המשחקים נעול</h3>
      <p className="text-brand-black/60 mb-8 leading-relaxed">הזינו את הקוד הסודי (2026) כדי לפתוח את ספריית המשחקים הזוגיים.</p>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (gameCode === '2026') {
          onUnlock();
          setGameError(false);
        } else {
          setGameError(true);
          setGameCode('');
        }
      }} className="space-y-6">
        <input 
          type="password" 
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          placeholder="הזינו קוד"
          className={`w-full bg-brand-cream border-b-2 py-4 text-center text-2xl tracking-[0.5em] outline-none transition-colors text-brand-black rounded-t-xl ${gameError ? 'border-red-500' : 'border-brand-gold/30 focus:border-brand-gold'}`}
        />
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-brand-black text-white py-4 text-sm tracking-[0.2em] uppercase font-bold hover:bg-brand-gold transition-colors"
        >
          פתיחת המשחקים
        </motion.button>
      </form>
      {gameError && (
        <p className="text-red-500 text-sm mt-4 animate-pulse">קוד שגוי, נסו שוב</p>
      )}
    </div>
  );
};

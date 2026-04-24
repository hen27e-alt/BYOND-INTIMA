import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Award, Zap, Target, Medal, ChevronRight, Sparkles, Gift, Brain } from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { cn } from '../../lib/utils';

export const GamificationHub = () => {
  const { profile } = useFirebase();
  
  const points = profile?.progress?.totalPoints || 0;
  const medals = profile?.medals || [];
  
  // Fun Meter calculation (0-100)
  const funLevel = Math.min(
    ((profile?.progress?.cookedCount || 0) * 5) + 
    ((profile?.progress?.watchedMoviesCount || 0) * 5) + 
    ((profile?.progress?.solvedRiddlesCount || 0) * 10),
    100
  );

  const medalList = [
    { id: 'bronze', name: 'המתחיל', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50', unlocked: medals.includes('bronze') },
    { id: 'silver', name: 'המנוסה', icon: Trophy, color: 'text-slate-400', bg: 'bg-slate-50', unlocked: medals.includes('silver') },
    { id: 'gold', name: 'המאסטר', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50', unlocked: medals.includes('gold') },
    { id: 'romantic', name: 'הרומנטיקן', icon: Medal, color: 'text-rose-500', bg: 'bg-rose-50', unlocked: medals.includes('romantic') },
  ];

  return (
    <div className="space-y-8">
      {/* Points & Fun Meter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-brand-gold/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Star size={80} className="text-brand-gold" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-brand-gold/10 rounded-xl">
                <Star className="text-brand-gold" size={24} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-brand-black/40">נקודות זהב</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-serif font-light text-brand-black">{points}</span>
              <span className="text-brand-gold font-bold">GP</span>
            </div>
            <p className="text-xs text-brand-black/40 mt-4">השלימו משימות כדי לצבור עוד נקודות!</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-brand-gold/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-gold/10 rounded-xl">
                <Zap className="text-brand-gold" size={24} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-brand-black/40">מדד ההנאה</h3>
            </div>
            <span className="text-2xl font-serif text-brand-gold">{funLevel}%</span>
          </div>
          
          <div className="h-4 bg-brand-cream rounded-full overflow-hidden mb-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${funLevel}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-brand-gold to-brand-black"
            />
          </div>
          
          <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-brand-black/40">
            <span>שגרה</span>
            <span>שיא ההנאה</span>
          </div>
        </motion.div>
      </div>

      {/* Medal Cabinet */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-gold/10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-gold/10 rounded-xl">
              <Medal className="text-brand-gold" size={24} />
            </div>
            <h3 className="text-lg font-serif">ארון המדליות</h3>
          </div>
          <button className="text-[10px] uppercase tracking-widest font-bold text-brand-gold hover:underline">לכל ההישגים</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {medalList.map((medal) => (
            <div key={medal.id} className="flex flex-col items-center text-center space-y-3">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
                medal.unlocked ? medal.bg : "bg-brand-cream grayscale opacity-40",
                medal.unlocked && "shadow-lg scale-110"
              )}>
                <medal.icon size={32} className={medal.unlocked ? medal.color : "text-brand-black/20"} />
              </div>
              <div>
                <p className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  medal.unlocked ? "text-brand-black" : "text-brand-black/20"
                )}>
                  {medal.name}
                </p>
                {!medal.unlocked && <p className="text-[8px] text-brand-black/20 uppercase mt-1">נעול</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'משימות', value: profile?.progress?.missionsCompleted || 0, icon: Target },
          { label: 'מתכונים', value: profile?.progress?.cookedCount || 0, icon: Sparkles },
          { label: 'סרטים', value: profile?.progress?.watchedMoviesCount || 0, icon: Gift },
          { label: 'חידות', value: profile?.progress?.solvedRiddlesCount || 0, icon: Brain },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-cream/30 p-4 rounded-2xl flex flex-col items-center text-center">
            <stat.icon size={16} className="text-brand-gold/60 mb-2" />
            <span className="text-xl font-serif text-brand-black">{stat.value}</span>
            <span className="text-[8px] uppercase tracking-widest font-bold text-brand-black/40">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

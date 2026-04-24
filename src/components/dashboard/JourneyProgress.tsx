import React from 'react';
import { motion } from 'motion/react';
import { Star, Flame, Trophy } from 'lucide-react';

interface JourneyProgressProps {
  funLevel: number;
  cookedCount: number;
  solvedRiddlesCount: number;
  watchedMoviesCount: number;
  profile: any;
  navigate: any;
  setActiveTab: (tab: string) => void;
}

export const JourneyProgress = ({ 
  funLevel, 
  cookedCount, 
  solvedRiddlesCount, 
  watchedMoviesCount,
  profile, 
  navigate,
  setActiveTab
}: JourneyProgressProps) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 mb-8 md:mb-16 bg-white p-4 md:p-10 rounded-3xl md:rounded-[40px] shadow-sm border border-brand-black/5">
    {/* Left: Fun Meter */}
    <div className="md:col-span-3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-l border-brand-black/5 pb-6 md:pb-0 md:pl-8">
      <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6"
            className="text-brand-cream"
          />
          <motion.circle
            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
            className="text-brand-gold"
            initial={{ strokeDasharray: "0 283" }}
            animate={{ strokeDasharray: `${(funLevel / 100) * 283} 283` }}
            transition={{ duration: 2, ease: "circOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl md:text-4xl font-serif text-brand-gold">{funLevel}%</span>
          <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-brand-black/40">מד כיף</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
        <div className="text-center p-2 md:p-3 bg-brand-cream/30 rounded-2xl">
          <p className="text-[7px] md:text-[8px] uppercase tracking-widest text-brand-black/40 mb-1">ימי רצף</p>
          <div className="flex items-center justify-center gap-1">
            <Flame size={10} className="text-orange-500" />
            <span className="text-base md:text-lg font-bold">{profile?.streak || 1}</span>
          </div>
        </div>
        <div className="text-center p-2 md:p-3 bg-brand-cream/30 rounded-2xl">
          <p className="text-[7px] md:text-[8px] uppercase tracking-widest text-brand-black/40 mb-1">נקודות זהב</p>
          <span className="text-base md:text-lg font-serif text-brand-gold">{profile?.progress?.totalPoints || 0}</span>
        </div>
      </div>
    </div>

    {/* Center: Journey & Medals */}
    <div className="md:col-span-5 flex flex-col justify-between">
      <div>
        <h2 className="text-xl md:text-2xl font-serif mb-1 md:mb-2">המסע שלכם</h2>
        <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-brand-black/40 mb-4 md:mb-8">התקדמות כוללת בחוויית Byond Intima</p>
        
        <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
          <div className="flex items-center justify-between text-[8px] md:text-[10px] uppercase tracking-widest font-bold">
            <span className="text-brand-black/60">הישג קרוב: Master Experience</span>
            <span className="text-brand-gold">עוד 350 נקודות</span>
          </div>
          <div className="h-1 bg-brand-cream rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              className="h-full bg-brand-gold"
            />
          </div>
        </div>

        <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-2">
          {profile?.medals?.filter((m: any) => m.unlocked).slice(0, 4).map((medal: any, i: number) => (
            <div key={i} className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
              <Trophy size={14} />
            </div>
          ))}
          <button 
            onClick={() => setActiveTab('medals')}
            className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full border border-dashed border-brand-black/10 flex items-center justify-center text-brand-black/30 hover:border-brand-gold hover:text-brand-gold transition-colors"
          >
            <Star size={14} />
          </button>
        </div>
      </div>
    </div>

    {/* Right: Quick Stats */}
    <div className="md:col-span-4 flex flex-col justify-between pt-6 md:pt-0 border-t md:border-t-0 md:border-r border-brand-black/5 md:pr-8">
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-brand-black/40">משימות שהושלמו</span>
          <span className="text-xs md:text-sm font-bold">{profile?.progress?.completedMissionsCount || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-brand-black/40">מתכונים שבושלו</span>
          <span className="text-xs md:text-sm font-bold">{cookedCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-brand-black/40">חידות שנפתרו</span>
          <span className="text-xs md:text-sm font-bold">{solvedRiddlesCount}</span>
        </div>
      </div>
      
      <button 
        onClick={() => navigate('/the-journey')}
        className="mt-6 md:mt-0 w-full py-3 md:py-4 bg-brand-black text-white text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-gold transition-all rounded-xl"
      >
        המשך במסע
      </button>
    </div>
  </div>
);

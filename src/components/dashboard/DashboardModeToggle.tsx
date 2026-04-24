import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Coffee } from 'lucide-react';

interface DashboardModeToggleProps {
  dashboardMode: 'experience' | 'lounge';
  setDashboardMode: (mode: 'experience' | 'lounge') => void;
  isGuest: boolean;
  showAlert: any;
}

export const DashboardModeToggle = ({ 
  dashboardMode, 
  setDashboardMode, 
  isGuest, 
  showAlert 
}: DashboardModeToggleProps) => (
  <div className="flex justify-center mb-8 md:mb-16">
    <div className="bg-brand-cream/50 p-1 md:p-1.5 rounded-2xl md:rounded-3xl flex items-center gap-1 md:gap-2 relative overflow-hidden shadow-inner border border-brand-black/5">
      <motion.div
        className="absolute h-[calc(100%-8px)] md:h-[calc(100%-12px)] bg-white rounded-xl md:rounded-2xl shadow-sm border border-brand-black/5"
        initial={false}
        animate={{
          x: dashboardMode === 'experience' ? 0 : '100%',
          width: '50%'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      
      <button
        onClick={() => {
          if (isGuest) {
            showAlert({
              title: "Experience Mode Restricted",
              message: "Please log in to access your personalized experience kit.",
              type: 'info'
            });
            return;
          }
          setDashboardMode('experience');
        }}
        className={`relative z-10 px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2 md:gap-3 transition-colors ${
          dashboardMode === 'experience' ? 'text-brand-gold' : 'text-brand-black/40 hover:text-brand-black/60'
        }`}
      >
        <Sparkles size={14} className="md:w-4 md:h-4" />
        <span>The Experience</span>
      </button>
      
      <button
        onClick={() => setDashboardMode('lounge')}
        className={`relative z-10 px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2 md:gap-3 transition-colors ${
          dashboardMode === 'lounge' ? 'text-brand-gold' : 'text-brand-black/40 hover:text-brand-black/60'
        }`}
      >
        <Coffee size={14} className="md:w-4 md:h-4" />
        <span>The Lounge</span>
      </button>
    </div>
  </div>
);

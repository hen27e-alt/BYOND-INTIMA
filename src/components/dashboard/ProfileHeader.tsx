import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { NotificationCenter } from '../NotificationCenter';
import { useUI } from '../../contexts/UIContext';

interface ProfileHeaderProps {
  user: any;
  profile: any;
  language: string;
  dashboardMode: 'experience' | 'lounge';
}

export const ProfileHeader = ({ user, profile, language, dashboardMode }: ProfileHeaderProps) => {
  const { isPurchaseMode } = useUI();
  
  return (
    <header className="flex items-center justify-between mb-6 md:mb-12 gap-4 text-right">
      <div className="flex items-center gap-3 md:gap-8">
            <div className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 border-brand-gold p-0.5 md:p-1 overflow-hidden" aria-hidden="true">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" loading="lazy" />
          ) : (
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'Byonder'}`}
              alt="" 
              className="w-full h-full rounded-full object-cover bg-brand-cream" 
              loading="lazy" 
            />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl md:text-3xl font-serif">
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return language === 'he' ? 'בוקר טוב' : 'Good Morning';
                if (hour < 17) return language === 'he' ? 'צהריים טובים' : 'Good Afternoon';
                if (hour < 21) return language === 'he' ? 'ערב טוב' : 'Good Evening';
                return language === 'he' ? 'לילה טוב' : 'Good Night';
              })()}, {user?.displayName?.split(' ')[0] || 'Byonder'}
            </h1>
            {isPurchaseMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 px-2 py-0.5 bg-brand-gold/10 border border-brand-gold/30 rounded-full"
                title="Premium Member"
              >
                <Sparkles className="text-brand-gold" size={10} />
                <span className="text-brand-gold text-[8px] font-bold uppercase tracking-widest">Premium</span>
              </motion.div>
            )}
          </div>
          <p className="text-brand-black/50 tracking-widest uppercase text-[8px] md:text-[10px] flex items-center gap-2">
            {profile?.experienceLevel || 'Medium'} – THE VELVET Experience
            <span className="text-brand-gold font-serif italic opacity-60 lowercase">
              {dashboardMode === 'experience' ? '(מצב חוויה)' : '(מצב טרקלין)'}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <NotificationCenter />
      </div>
    </header>
  );
};

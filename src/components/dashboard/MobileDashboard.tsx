import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Lock, 
  Sparkles, 
  Trophy, 
  Flame, 
  Star, 
  Award, 
  Gamepad2, 
  Book, 
  Bell,
  Settings,
  ChevronRight
} from 'lucide-react';
import { ProfileHeader } from './ProfileHeader';
import { navCategories, EXPERIENCE_ITEMS } from '../../constants/dashboardNav';
import { DateIdeaCard } from './DateIdeaCard';
import { DailySpark } from '../DailySpark';
import { RelationshipInsights } from '../RelationshipInsights';

interface MobileDashboardProps {
  user: any;
  profile: any;
  language: string;
  dashboardMode: 'experience' | 'lounge';
  setDashboardMode: (mode: 'experience' | 'lounge') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLockedItem: (open: boolean) => boolean;
  funLevel: number;
  cookedCount: number;
  solvedRiddlesCount: number;
  watchedMoviesCount: number;
  renderTabContent: () => React.ReactNode;
  signIn: () => void;
  logout: () => void;
  showAlert: any;
  navigate: any;
  notificationCount: number;
}

export const MobileDashboard = ({
  user,
  profile,
  language,
  dashboardMode,
  setDashboardMode,
  activeTab,
  setActiveTab,
  isLockedItem,
  funLevel,
  cookedCount,
  solvedRiddlesCount,
  watchedMoviesCount,
  renderTabContent,
  signIn,
  logout,
  showAlert,
  navigate,
  notificationCount
}: MobileDashboardProps) => {
  // If we are in a sub-tab (not 'feed'), show a "back" button header
  const isFeed = activeTab === 'feed';

  return (
    <div className="min-h-screen bg-brand-cream pb-32">
      {/* Mobile Header - Immersive */}
      <header className="sticky top-0 z-40 bg-brand-cream/80 backdrop-blur-3xl border-b border-brand-gold/10 px-6 py-5 flex items-center justify-between">
        {isFeed ? (
          <>
            <div className="flex items-center gap-4">
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-2xl border-2 border-brand-gold/20 p-0.5 bg-white shadow-sm"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full rounded-[14px] object-cover" />
                ) : (
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'Byonder'}`}
                    alt="" 
                    className="w-full h-full rounded-[14px] object-cover bg-brand-cream" 
                  />
                )}
              </motion.div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-brand-black/40 font-black">Welcome back,</p>
                <h1 className="text-xl font-serif font-medium tracking-tight">{user?.displayName?.split(' ')[0] || 'Byonder'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="relative w-10 h-10 rounded-xl bg-white border border-brand-gold/10 flex items-center justify-center text-brand-black/60 shadow-sm"
                onClick={() => setActiveTab('profile')}
              >
                <Bell size={18} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] flex items-center justify-center text-white font-black">
                    {notificationCount}
                  </span>
                )}
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-xl bg-white border border-brand-gold/10 flex items-center justify-center text-brand-black/60 shadow-sm"
                onClick={() => setActiveTab('profile')}
              >
                <Settings size={18} />
              </motion.button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4 w-full">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab('feed')}
              className="w-10 h-10 rounded-xl bg-white border border-brand-gold/10 flex items-center justify-center text-brand-black/60 shadow-sm"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <h1 className="text-lg font-serif font-medium flex-1 text-center mr-10">
              {navCategories.flatMap(c => c.items).find(i => i.id === activeTab)?.name || 'אזור אישי'}
            </h1>
          </div>
        )}
      </header>

      <main className="px-6 pt-8">
        {isFeed ? (
          <div className="space-y-10">
            {/* Mode Switcher - Premium Toggle */}
            <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-[24px] flex gap-1 border border-brand-black/5 shadow-inner">
              <button
                onClick={() => setDashboardMode('experience')}
                className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  dashboardMode === 'experience' ? 'bg-brand-black text-brand-gold shadow-xl scale-[1.02]' : 'text-brand-black/40'
                }`}
              >
                <Gamepad2 size={14} />
                The Experience
              </button>
              <button
                onClick={() => setDashboardMode('lounge')}
                className={`flex-1 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  dashboardMode === 'lounge' ? 'bg-brand-black text-brand-gold shadow-xl scale-[1.02]' : 'text-brand-black/40'
                }`}
              >
                <Sparkles size={14} />
                The Lounge
              </button>
            </div>

            <div className="space-y-10">
              {/* Bento Grid - Top Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <DailySpark />
                </div>
                
                <div className="col-span-2">
                  <RelationshipInsights />
                </div>

                <div className="col-span-2">
                  <DateIdeaCard />
                </div>

                {/* Suggestions Card */}
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('suggestions')}
                  className="col-span-2 bg-brand-black p-10 rounded-[40px] shadow-2xl overflow-hidden relative group"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] opacity-50" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                        <Sparkles size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold/60">Suggestions</span>
                    </div>
                    <h3 className="text-3xl font-serif text-white mb-4 leading-tight">הצעות והשראה<br/>במיוחד בשבילכם.</h3>
                    <p className="text-white/40 text-sm mb-8 leading-relaxed font-light italic">
                      "לפעמים כל מה שצריך זה רעיון קטן כדי ליצור רגע גדול."
                    </p>
                    <div className="flex items-center gap-2 text-brand-gold text-[10px] font-black uppercase tracking-[0.2em]">
                      Get Inspired <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>

                {/* Vision Board Preview - Level 6 Style */}
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('vision-board')}
                  className="col-span-2 bg-brand-black p-10 rounded-[40px] shadow-2xl overflow-hidden relative group"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10">
                        <Sparkles className="text-brand-gold" size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold/60">Vision Board</span>
                    </div>
                    <h3 className="text-3xl font-serif text-white mb-4 leading-tight">בואו נבנה את<br/>העתיד שלנו.</h3>
                    <p className="text-white/40 text-sm mb-8 leading-relaxed font-light italic">
                      "החלומות שלנו הם המצפן של הזוגיות שלנו."
                    </p>
                    <div className="flex items-center gap-2 text-brand-gold text-[10px] font-black uppercase tracking-[0.2em]">
                      Explore Vision <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>

                {/* Progress Card - Level 6 Style */}
                <div className="col-span-2 bg-white rounded-[40px] p-10 shadow-premium border border-brand-gold/10">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h2 className="text-2xl font-serif mb-1">ההתקדמות שלכם</h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">Level {profile?.level || 1} Master</p>
                    </div>
                    <div className="w-16 h-16 rounded-3xl bg-brand-gold/5 flex items-center justify-center text-brand-gold border border-brand-gold/10">
                      <Trophy size={28} />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-end justify-between">
                      <span className="text-5xl font-serif text-brand-black">{funLevel}<span className="text-xl ml-1">%</span></span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/40 mb-2">Experience Points</span>
                    </div>
                    <div className="h-3 bg-brand-cream rounded-full overflow-hidden p-0.5 border border-brand-gold/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${funLevel}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-brand-gold rounded-full shadow-[0_0_15px_rgba(166,124,0,0.4)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-12">
                    <div className="bg-brand-cream/40 p-6 rounded-[24px] border border-brand-gold/5">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-black/40 mb-3">Streak</p>
                      <div className="flex items-center gap-2">
                        <Flame size={20} className="text-orange-500" />
                        <span className="text-3xl font-serif">{profile?.streak || 1}</span>
                      </div>
                    </div>
                    <div className="bg-brand-cream/40 p-6 rounded-[24px] border border-brand-gold/5">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-black/40 mb-3">Points</p>
                      <div className="flex items-center gap-2">
                        <Star size={20} className="text-brand-gold" />
                        <span className="text-3xl font-serif">{profile?.progress?.totalPoints || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vertical Menu Sections - Level 6 Style */}
              {navCategories.map((category, idx) => {
                const filteredItems = category.items.filter(item => {
                  const isExp = EXPERIENCE_ITEMS.includes(item.id);
                  const isBoth = item.id === 'feed' || item.id === 'sitemap';
                  return dashboardMode === 'experience' ? (isExp || isBoth) : (!isExp || isBoth);
                }).filter(i => i.id !== 'feed');

                if (filteredItems.length === 0) return null;

                return (
                  <div key={idx} className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/30 px-4">{category.title}</h3>
                    <div className="bg-white rounded-[40px] overflow-hidden shadow-premium border border-brand-gold/5">
                      {filteredItems.map((item, i) => {
                        const isLocked = isLockedItem(item.open);
                        return (
                          <motion.button
                            key={item.id}
                            whileTap={!isLocked ? { scale: 0.98, backgroundColor: 'rgba(166, 124, 0, 0.05)' } : {}}
                            onClick={() => !isLocked && setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between p-7 transition-all border-b border-brand-gold/5 last:border-0 ${
                              isLocked ? 'opacity-30 grayscale' : ''
                            }`}
                          >
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-brand-cream/50 flex items-center justify-center text-brand-gold border border-brand-gold/5">
                                <item.icon size={24} strokeWidth={1.5} />
                              </div>
                              <div className="text-right">
                                <span className="block text-base font-serif font-medium text-brand-black">{item.name}</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-brand-black/30">Explore Section</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isLocked ? (
                                <div className="w-8 h-8 rounded-full bg-brand-black/5 flex items-center justify-center">
                                  <Lock size={14} className="text-brand-black/40" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-brand-gold/5 flex items-center justify-center">
                                  <ChevronRight size={18} className="text-brand-gold/40" />
                                </div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Logout Button - Level 6 Style */}
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={logout}
                className="w-full py-6 text-red-500 font-black uppercase tracking-[0.3em] text-[10px] border border-red-100 rounded-[40px] bg-red-50/30 hover:bg-red-50 transition-all"
              >
                Sign Out
              </motion.button>
            </div>
          </div>
          ) : (
          <div className="pb-20">
            {renderTabContent()}
          </div>
        )}
      </main>
    </div>
  );
};

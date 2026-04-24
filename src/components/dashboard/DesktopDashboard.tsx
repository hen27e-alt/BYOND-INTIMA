import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  Lock, 
  Sparkles, 
  Gamepad2
} from 'lucide-react';
import { ProfileHeader } from './ProfileHeader';
import { JourneyProgress } from './JourneyProgress';
import { DashboardModeToggle } from './DashboardModeToggle';
import { navCategories, EXPERIENCE_ITEMS } from '../../constants/dashboardNav';
import { DailySpark } from '../DailySpark';
import { DateIdeaCard } from './DateIdeaCard';
import { RelationshipInsights } from '../RelationshipInsights';
import { VisionBoard } from '../VisionBoard';

interface DesktopDashboardProps {
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

export const DesktopDashboard = ({
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
}: DesktopDashboardProps) => {
  return (
    <div className="min-h-screen bg-brand-cream/30">
      <div className="split-layout">
        {/* Left Pane: Navigation & Profile */}
        <aside className="bg-white border-r border-brand-black/5 p-8 md:p-12 flex flex-col h-screen sticky top-0">
          <div className="mb-12">
            <ProfileHeader 
              user={user} 
              profile={profile} 
              language={language} 
              dashboardMode={dashboardMode} 
            />
          </div>
          
          <div className="mb-12">
            <JourneyProgress 
              profile={profile}
              funLevel={funLevel}
              cookedCount={cookedCount}
              solvedRiddlesCount={solvedRiddlesCount}
              watchedMoviesCount={watchedMoviesCount}
              navigate={navigate}
              setActiveTab={setActiveTab}
            />
          </div>

          <nav className="flex-1 space-y-12 overflow-y-auto no-scrollbar pr-4">
            {navCategories.map((category, idx) => {
              const filteredItems = category.items.filter(item => {
                const isExp = EXPERIENCE_ITEMS.includes(item.id);
                const isBoth = item.id === 'feed' || item.id === 'sitemap';
                return dashboardMode === 'experience' ? (isExp || isBoth) : (!isExp || isBoth);
              });

              if (filteredItems.length === 0) return null;

              return (
                <div key={idx}>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-brand-black/30 font-bold mb-6 px-4 italic serif">
                    {category.title}
                  </h3>
                  <div className="space-y-2">
                    {filteredItems.map((item) => {
                      const isLocked = isLockedItem(item.open);
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => !isLocked && setActiveTab(item.id)}
                          className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                            active 
                              ? 'bg-brand-black text-brand-gold shadow-2xl shadow-brand-black/20' 
                              : isLocked 
                                ? 'opacity-30 cursor-not-allowed grayscale' 
                                : 'hover:bg-brand-cream/50 text-brand-black/50 hover:text-brand-black'
                          }`}
                        >
                          {active && (
                            <motion.div 
                              layoutId="active-bg"
                              className="absolute inset-0 bg-brand-black"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <div className="flex items-center gap-4 relative z-10">
                            <item.icon 
                              size={20} 
                              className={`transition-colors duration-500 ${
                                active ? 'text-brand-gold' : 'text-brand-gold/40 group-hover:text-brand-gold'
                              }`} 
                            />
                            <span className={`text-sm font-medium tracking-tight transition-all duration-500 ${active ? 'translate-x-1' : ''}`}>
                              {item.name}
                            </span>
                            {item.id === 'profile' && notificationCount > 0 && (
                              <span className="w-5 h-5 bg-brand-gold text-brand-black text-[9px] rounded-full flex items-center justify-center font-black shadow-glow">
                                {notificationCount}
                              </span>
                            )}
                          </div>
                          <div className="relative z-10">
                            {isLocked ? (
                              <Lock size={14} className="opacity-40" />
                            ) : (
                              <ChevronRight 
                                size={16} 
                                className={`transition-all duration-500 ${
                                  active ? 'translate-x-0 opacity-100' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                                }`} 
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="mt-12 pt-8 border-t border-brand-black/5">
            <button 
              onClick={logout}
              className="w-full py-4 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-black/40 hover:text-brand-black transition-colors text-center italic serif"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Right Pane: Content */}
        <main className="relative flex flex-col min-h-screen">
          {/* Vertical Rail */}
          <div className="vertical-rail hidden xl:flex">
            {dashboardMode === 'experience' ? 'BYOND EXPERIENCE' : 'THE LOUNGE'}
          </div>

          {/* Header */}
          <header className="sticky top-0 z-30 bg-brand-cream/80 backdrop-blur-xl border-b border-brand-black/5 px-8 md:px-16 py-8 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <DashboardModeToggle 
                dashboardMode={dashboardMode} 
                setDashboardMode={setDashboardMode} 
                isGuest={!user} 
                showAlert={showAlert} 
              />
              
              <div className="h-8 w-[1px] bg-brand-black/10 hidden md:block" />
              
              <h1 className="text-2xl font-serif italic hidden md:block">
                {activeTab === 'feed' ? 'The Feed' : navCategories.flatMap(c => c.items).find(i => i.id === activeTab)?.name}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Actions or Search could go here */}
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-brand-cream overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-8 md:p-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-6xl mx-auto"
              >
                {activeTab === 'feed' ? (
                  <div className="premium-grid">
                    {/* Main Feature: Daily Spark */}
                    <div className="lg:col-span-2 lg:row-span-2">
                      <DailySpark />
                    </div>

                    {/* Secondary: Progress */}
                    <div className="lg:col-span-1">
                      <div className="glass-card p-8 h-full flex flex-col justify-between group">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-black/40 font-bold mb-4">Current Status</p>
                          <h3 className="text-4xl font-serif italic mb-2">{funLevel}%</h3>
                          <p className="text-sm text-brand-black/60">Fun Level Reached</p>
                        </div>
                        <div className="mt-8">
                          <div className="h-1 w-full bg-brand-black/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${funLevel}%` }}
                              className="h-full bg-brand-gold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Insights */}
                    <div className="lg:col-span-1">
                      <RelationshipInsights />
                    </div>

                    {/* Vision Board Preview */}
                    <div className="lg:col-span-2">
                      <div className="bg-brand-black p-12 rounded-[40px] shadow-premium overflow-hidden relative group min-h-[300px] flex items-center">
                        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/vision/1200/800')] bg-cover bg-center opacity-20 group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/80 to-transparent" />
                        
                        <div className="relative z-10 max-w-md">
                          <div className="flex items-center gap-3 mb-6">
                            <Sparkles className="text-brand-gold animate-pulse" size={24} />
                            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold">Our Vision</span>
                          </div>
                          <h3 className="text-4xl font-serif text-white mb-6 leading-tight">בואו נמשיך לבנות את העתיד שחלמנו עליו.</h3>
                          <button 
                            onClick={() => setActiveTab('vision-board')}
                            className="px-8 py-4 bg-brand-gold text-brand-black rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 transform hover:scale-105"
                          >
                            Explore Vision Board
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Date Idea */}
                    <div className="lg:col-span-1">
                      <DateIdeaCard />
                    </div>

                    {/* Suggestions Card */}
                    <div className="lg:col-span-1">
                      <motion.div 
                        whileHover={{ y: -5 }}
                        onClick={() => setActiveTab('suggestions')}
                        className="glass-card p-10 bg-brand-black text-white cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-brand-gold/20 flex items-center justify-center text-brand-gold mb-8">
                            <Sparkles size={24} />
                          </div>
                          <h3 className="text-3xl font-serif italic mb-4">הצעות והשראה</h3>
                          <p className="text-white/60 text-sm leading-relaxed">
                            גלו רעיונות חדשים לדייטים, סרטים, מתכונים ושיחות עומק שנוצרו במיוחד עבורכם.
                          </p>
                        </div>
                        <div className="relative z-10 flex items-center gap-2 text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] mt-8">
                          Get Inspired <ChevronRight size={14} />
                        </div>
                      </motion.div>
                    </div>

                    {/* Weekly Summary */}
                    <div className="lg:col-span-1">
                      <div className="glass-card p-10 border-brand-gold/20 bg-brand-gold/5">
                        <h3 className="text-2xl font-serif italic mb-6">השבוע שלכם</h3>
                        <p className="text-brand-black/70 text-sm leading-relaxed mb-8">
                          אתם עושים עבודה מדהימה! השבוע התמקדתם בחיבור עמוק ובאינטימיות. 
                          המשיכו להשקיע ברגעים הקטנים שעושים את ההבדל הגדול.
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {[1, 2].map(i => (
                              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-brand-cream overflow-hidden">
                                <img src={`https://picsum.photos/seed/couple${i}/100/100`} alt="Couple" referrerPolicy="no-referrer" />
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">Stronger Together</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-12 min-h-[600px]">
                    {renderTabContent()}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Info */}
          <footer className="px-16 py-8 border-t border-brand-black/5 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-brand-black/30 font-bold">
            <div>© 2026 BYOND EXPERIENCE</div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-brand-black transition-colors">Privacy</a>
              <a href="#" className="hover:text-brand-black transition-colors">Terms</a>
              <a href="#" className="hover:text-brand-black transition-colors">Support</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Layers, User, Sparkles, ShoppingBag, Bell, Menu, X, LogOut, Info, Mail, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useFirebase();
  const { t, language, setLanguage } = useLanguage();
  const [notificationCount, setNotificationCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!profile?.coupleId) return;
    
    const q = query(
      collection(db, 'couple_missions'),
      where('coupleId', '==', profile.coupleId),
      where('completionStatus', '==', 'pending')
    );

    return onSnapshot(q, (snapshot) => {
      const missions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const upcomingCount = missions.filter((m: any) => {
        if (!m.deadline) return false;
        const deadline = m.deadline.toDate ? m.deadline.toDate() : new Date(m.deadline);
        const diff = deadline.getTime() - new Date().getTime();
        return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // Next 3 days
      }).length;
      setNotificationCount(upcomingCount);
    });
  }, [profile?.coupleId]);

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const navItems = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: 'Boutique', href: '/boutique', icon: ShoppingBag },
    { name: t('nav.profile'), href: user ? '/dashboard' : '/login', icon: User },
    { name: 'תפריט', href: '#', icon: Menu, isMenu: true },
  ];

  return (
    <>
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-brand-cream z-[70] rounded-t-[40px] p-8 pb-32 shadow-2xl border-t border-brand-gold/20"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-serif text-brand-black">תפריט נוסף</h3>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-black/5 text-brand-black"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { navigate('/experience'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-brand-gold/10 hover:border-brand-gold transition-all gap-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Sparkles size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-black/70">חבילות חוויה</span>
                </button>

                <button
                  onClick={() => { navigate('/about'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-brand-gold/10 hover:border-brand-gold transition-all gap-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Info size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-black/70">עלינו</span>
                </button>

                <button
                  onClick={() => { navigate('/contact'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-brand-gold/10 hover:border-brand-gold transition-all gap-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Mail size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-black/70">צור קשר</span>
                </button>

                <button
                  onClick={() => { 
                    setLanguage(language === 'he' ? 'en' : 'he');
                    setIsMenuOpen(false);
                  }}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-brand-gold/10 hover:border-brand-gold transition-all gap-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                    <Globe size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-black/70">
                    {language === 'he' ? 'English' : 'עברית'}
                  </span>
                </button>
              </div>

              {user && (
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full mt-8 py-4 bg-red-50 text-red-500 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  התנתקות מהמערכת
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-3xl border-t border-brand-gold/20 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-20 px-4 relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href === '/dashboard' && location.pathname === '/profile');
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => {
                  triggerHaptic();
                  if (item.isMenu) {
                    setIsMenuOpen(true);
                  } else {
                    navigate(item.href);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-full relative transition-all active:scale-90",
                  isActive ? "text-brand-black" : "text-brand-black/40"
                )}
              >
              <div className="relative p-2">
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-brand-gold/15 rounded-2xl"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                    />
                  )}
                </AnimatePresence>
                
                <div className="relative z-10">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300" />
                </div>
              </div>

              <motion.span 
                animate={{ 
                  opacity: isActive ? 1 : 0.6,
                  y: isActive ? 0 : 2,
                  scale: isActive ? 1 : 0.9
                }}
                className={cn(
                  "text-[9px] font-black uppercase tracking-[0.1em] mt-1",
                )}
              >
                {item.name}
              </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

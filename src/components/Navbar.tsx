import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, Menu, X, Lock, Search, Bell, LogIn, LogOut, ShoppingCart, Moon, Sun, Heart, Home, Sparkles, Compass, Layers, Info, Mail, Globe, Edit2, Eye, MapPin, UserCircle, Play, Bot, Mic, ShoppingBag, Users, Telescope } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useUI } from '../contexts/UIContext';
import { useEditMode } from '../components/EditableText';
import { cn } from '../lib/utils';
import { VideoTourModal } from './VideoTourModal';
import { LiveAudioCall } from './LiveAudioCall';
import { SearchModal } from './SearchModal';
import { NotificationCenter } from './NotificationCenter';
import { useSiteConfig } from '../contexts/SiteConfigContext';
import { BRANDING } from '../constants/branding';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const { user, profile, signIn, logout } = useFirebase();
  const { cartCount } = useCart();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { setIsMoodMatcherOpen } = useUI();
  const { isEditMode, setIsEditMode, isAdmin } = useEditMode();
  const { config } = useSiteConfig();
  const { setIsAIChatOpen } = useUI();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLangOpen, setIsLangOpen] = React.useState(false);
  const [isVideoTourOpen, setIsVideoTourOpen] = React.useState(false);
  const [isLiveCallOpen, setIsLiveCallOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const languages = [
    { code: 'he', name: 'עברית' },
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
  ] as const;

  const decks = [
    { id: 'true', name: t('deck.true.name'), href: '/decks/true', icon: Layers },
    { id: 'nasty', name: t('deck.nasty.name'), href: '/decks/nasty', icon: Layers },
    { id: 'quickie', name: t('deck.quickie.name'), href: '/decks/quickie', icon: Layers },
    { id: 'night', name: t('deck.night.name'), href: '/decks/night', icon: Layers },
    { id: 'kitchen-1', name: t('deck.kitchen1.name'), href: '/decks/kitchen-1', icon: Layers },
    { id: 'kitchen-2', name: t('deck.kitchen2.name'), href: '/decks/kitchen-2', icon: Layers },
    { id: 'kitchen-3', name: t('deck.kitchen3.name'), href: '/decks/kitchen-3', icon: Layers },
    { id: 'kitchen-4', name: t('deck.kitchen4.name'), href: '/decks/kitchen-4', icon: Layers },
    { id: 'kitchen-5', name: t('deck.kitchen5.name'), href: '/decks/kitchen-5', icon: Layers },
  ];

  const aiLinks = [
    { id: 'concierge', name: 'BYOND CONCIERGE', href: '/concierge', icon: Bot },
    { id: 'audio', name: 'שיחה קולית (Audio)', href: '#', icon: Mic, isAudioCall: true },
    { id: 'video', name: 'מדריך וידאו (Video)', href: '/ai-consultant', icon: Play },
    { id: 'tour', name: 'סיור בוידאו', href: '#', icon: Play, isVideoTour: true },
    { id: 'mood', name: 'מצב רוח (Mood Matcher)', href: '#', icon: Sparkles, isMoodMatcher: true },
    { id: 'atmosphere', name: 'אווירה (Atmosphere)', href: '#', icon: Moon, isThemeToggle: true },
    { id: 'assistant', name: 'עוזר אישי', href: '#', icon: Sparkles, isAIAssistant: true },
  ];

  const navLinks = [
    { name: t('nav.experience'), href: '/experience', icon: Sparkles },
    { name: 'Boutique', href: '/boutique', icon: ShoppingBag, isSpecial: true },
  ];

  if (!user) {
    navLinks.push({ name: t('nav.login'), href: '/login', icon: LogIn });
  }

  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-cream/80 backdrop-blur-md border-b border-brand-gold/10" role="navigation" aria-label="תפריט ראשי">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between relative">
          
          {/* Right side (RTL) - Logo & Mobile Menu */}
          <div className="flex items-center gap-4 md:gap-8 lg:ml-20">
            <button 
              className="lg:hidden p-2 -mr-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "סגור תפריט" : "פתח תפריט"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/" className="flex flex-col items-center justify-center group" aria-label="Byond Intima - דף הבית">
              <span className="text-xl md:text-2xl font-serif tracking-[0.25em] font-light leading-none text-brand-black group-hover:text-brand-gold transition-colors">
                BYOND
              </span>
              <span className="text-brand-gold text-[10px] md:text-xs tracking-[0.3em] mt-1 font-medium">
                INTIMA
              </span>
            </Link>
          </div>

          {/* Center - Nav Links (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <div key={link.href} className="relative group/nav">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={link.href}
                    aria-current={location.pathname === link.href ? "page" : undefined}
                    className={cn(
                      "text-[10px] xl:text-[11px] tracking-[0.1em] xl:tracking-[0.2em] uppercase transition-all hover:text-brand-gold relative py-2 flex items-center gap-1 px-3 rounded-full",
                      location.pathname === link.href 
                        ? "text-brand-gold bg-brand-gold/5" 
                        : link.isSpecial 
                          ? "text-brand-gold border border-brand-gold/30 bg-brand-gold/5" 
                          : "text-brand-black/60"
                    )}
                  >
                    <span className="font-medium">{link.name}</span>
                    <span className={cn(
                      "absolute bottom-0 left-0 h-px bg-brand-gold transition-all duration-300",
                      location.pathname === link.href ? "w-full" : "w-0"
                    )} />
                  </Link>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Left side (RTL) - Icons */}
          <div className="flex items-center gap-1 md:gap-2 lg:mr-12">
            {/* Notification Center */}
            {user && <NotificationCenter />}

          {/* User Menu Dropdown - Hidden on Mobile */}
          <div className="hidden md:block relative">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button 
                onClick={() => user ? setIsUserMenuOpen(!isUserMenuOpen) : navigate('/login')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-gold/20 hover:border-brand-gold/40 transition-colors"
              >
                {user && profile?.photoURL ? (
                  <img src={profile.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'Byonder'}`}
                    alt="" 
                    className="w-5 h-5 rounded-full object-cover bg-brand-cream border border-brand-gold/20" 
                  />
                )}
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-brand-black/60">
                  {user ? (profile?.displayName?.split(' ')[0] || t('nav.dashboard')) : t('nav.login')}
                </span>
              </button>
            </motion.div>

            <AnimatePresence>
              {user && isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-brand-gold/10 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="py-2">
                      <Link 
                        to="/dashboard" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs text-brand-black/70 hover:bg-brand-gold/5 transition-colors"
                      >
                        <Home size={14} className="text-brand-gold" />
                        <span>אזור אישי</span>
                      </Link>
                      <Link 
                        to="/orders" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs text-brand-black/70 hover:bg-brand-gold/5 transition-colors"
                      >
                        <ShoppingBag size={14} className="text-brand-gold" />
                        <span>הזמנות שלי</span>
                      </Link>
                      <Link 
                        to="/profile" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs text-brand-black/70 hover:bg-brand-gold/5 transition-colors"
                      >
                        <User size={14} className="text-brand-gold" />
                        <span>פרופיל</span>
                      </Link>
                      <button 
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }} 
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-500 hover:bg-red-50 transition-colors border-t border-brand-gold/5"
                      >
                        <LogOut size={14} />
                        <span>התנתקות</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Shopping Cart */}
          <Link 
            to="/checkout"
            className="relative p-2 text-brand-black/60 hover:text-brand-gold transition-colors ml-1 md:ml-2"
            aria-label="סל קניות"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Language Selector - Hidden on Mobile */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="p-2 text-brand-black/40 hover:text-brand-gold transition-colors rounded-full hover:bg-brand-black/5 flex items-center gap-1"
              title="שפה"
            >
              <Globe size={18} />
              <span className="text-[9px] font-bold uppercase">{language}</span>
            </button>
            
            <AnimatePresence>
              {isLangOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsLangOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-40 bg-white border border-brand-gold/10 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="py-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangOpen(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2 text-right text-xs transition-colors hover:bg-brand-gold/5 flex items-center justify-between",
                            language === lang.code ? "text-brand-gold font-bold bg-brand-gold/5" : "text-brand-black/70"
                          )}
                        >
                          <span className="uppercase text-[8px] opacity-40">{lang.code}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Admin Edit Button */}
          {isAdmin && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn(
                "p-2 transition-colors rounded-full mr-2",
                isEditMode ? "bg-brand-gold text-white" : "text-brand-black/40 hover:text-brand-gold hover:bg-brand-black/5"
              )}
              title={isEditMode ? "יציאה ממצב עריכה" : "מצב עריכה"}
            >
              {isEditMode ? <Eye size={18} /> : <Edit2 size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-16 md:top-20 left-0 right-0 bg-brand-cream border-b border-brand-gold/10 overflow-hidden shadow-2xl"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-lg font-serif tracking-wide flex items-center justify-between p-3 rounded-2xl transition-all",
                      location.pathname === link.href ? "bg-brand-gold/10 text-brand-gold" : "text-brand-black/70 hover:bg-brand-black/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <link.icon size={20} className={location.pathname === link.href ? "text-brand-gold" : "text-brand-black/40"} />
                      {link.name}
                    </div>
                  </Link>
                </div>
              ))}

              {/* Boutique Mobile Button */}
              <Link
                to="/boutique"
                onClick={() => setIsOpen(false)}
                className="text-lg font-serif tracking-wide flex items-center gap-4 p-4 rounded-2xl bg-brand-gold/10 text-brand-gold border border-brand-gold/20 hover:bg-brand-gold/20 transition-all mt-4"
              >
                <ShoppingBag size={22} />
                הבוטיק שלנו
              </Link>

              {/* Personal Area for Mobile */}
              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-lg font-serif tracking-wide flex items-center gap-4 p-3 rounded-2xl transition-all mt-2",
                    location.pathname === '/dashboard' ? "bg-brand-gold/10 text-brand-gold" : "text-brand-black/70 hover:bg-brand-black/5"
                  )}
                >
                  <Home size={20} className={location.pathname === '/dashboard' ? "text-brand-gold" : "text-brand-black/40"} />
                  אזור אישי
                </Link>
              )}
              
              {/* Search Mobile Button */}
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsOpen(false);
                }}
                className="text-lg font-serif tracking-wide flex items-center gap-4 p-3 rounded-2xl text-brand-black/70 hover:bg-brand-black/5 transition-all"
              >
                <Search size={20} />
                חיפוש באתר
              </button>

              {user && (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="text-lg font-serif tracking-wide flex items-center gap-4 p-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all mt-2 border-t border-brand-gold/10 pt-6"
                >
                  <LogOut size={20} />
                  {t('nav.logout')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <VideoTourModal isOpen={isVideoTourOpen} onClose={() => setIsVideoTourOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <LiveAudioCall 
        isOpen={isLiveCallOpen} 
        onClose={() => setIsLiveCallOpen(false)} 
        conciergeName={config?.conciergeName || BRANDING.conciergeName}
      />
    </nav>
  );
};

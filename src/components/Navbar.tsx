import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Search, LogOut, ShoppingBag, Globe, Edit2, Eye } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useEditMode } from '../components/EditableText';
import { cn } from '../lib/utils';
import { SearchModal } from './SearchModal';
import { NotificationCenter } from './NotificationCenter';
import { useSeasonSettings } from '../lib/catalogue';

const LANGUAGES = [
  { code: 'he', name: 'עברית' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLangOpen, setIsLangOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const { user, profile, logout } = useFirebase();
  const { cartCount } = useCart();
  const { language, setLanguage } = useLanguage();
  const { seasonNumber } = useSeasonSettings();
  const { isEditMode, setIsEditMode, isAdmin } = useEditMode();
  const location = useLocation();
  const navigate = useNavigate();
  const he = language === 'he';

  React.useEffect(() => setIsOpen(false), [location.pathname]);

  const links = [
    { label: he ? 'המנוי' : 'Membership', to: '/#membership' },
    { label: he ? 'המארזים' : 'The boxes', to: '/experience' },
    { label: he ? 'הבוטיק' : 'Boutique', to: '/boutique' },
    { label: he ? 'המקום שלכם' : 'Your place', to: user ? '/dashboard' : '/login' },
  ];

  const isActive = (to: string) => (to.startsWith('/#') ? false : location.pathname === to || location.pathname.startsWith(to + '/'));

  const linkClass = (to: string) =>
    cn(
      'relative py-2 text-[15px] font-medium text-ink transition-colors hover:text-spot',
      'after:absolute after:inset-x-0 after:-bottom-[3px] after:h-[3px] after:bg-spot after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100',
      isActive(to) && 'text-spot after:scale-x-100'
    );

  const firstName = profile?.displayName?.split(' ')[0];

  return (
    <nav className="rule-sheen fixed inset-x-0 top-0 z-50 border-b bg-paper/85 backdrop-blur-md" aria-label={he ? 'תפריט ראשי' : 'Main menu'}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 md:h-20 md:px-8 lg:px-14">
        <div className="flex items-center gap-3">
          <button
            className="-ms-2 p-2 text-ink lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? (he ? 'סגירת התפריט' : 'Close menu') : he ? 'פתיחת התפריט' : 'Open menu'}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="flex items-baseline gap-3 text-ink" aria-label="Byond Intima">
            <span className="wordmark text-[19px] leading-none md:text-[24px]">BYOND INTIMA</span>
            <span className="hidden text-xs font-bold text-ink/70 xl:inline">
              {he ? `עונה ${pad(seasonNumber)}` : `Season ${pad(seasonNumber)}`}
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className={linkClass(l.to)} aria-current={isActive(l.to) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden p-2 text-ink hover:text-spot md:block"
            aria-label={he ? 'חיפוש באתר' : 'Search'}
          >
            <Search size={20} />
          </button>

          {user && <NotificationCenter />}

          <div className="relative hidden md:block">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 p-2 text-ink hover:text-spot"
              aria-expanded={isLangOpen}
              aria-label={he ? 'שפה' : 'Language'}
            >
              <Globe size={18} />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute end-0 top-full z-50 mt-2 w-44 border-[3px] border-ink bg-paper"
                  >
                    {LANGUAGES.map((lang) => (
                      <li key={lang.code}>
                        <button
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center justify-between border-b border-rule px-4 py-2.5 text-sm hover:bg-ink hover:text-paper',
                            language === lang.code && 'font-bold text-spot'
                          )}
                        >
                          <span>{lang.name}</span>
                          <span className="text-[11px] uppercase opacity-60">{lang.code}</span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                </>
              )}
            </AnimatePresence>
          </div>

          <Link to="/checkout" className="relative p-2 text-ink hover:text-spot" aria-label={he ? `סל הקניות, ${cartCount} פריטים` : `Cart, ${cartCount} items`}>
            <ShoppingBag size={21} />
            {cartCount > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center bg-spot px-1 text-[11px] font-bold text-paper tabular-nums">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => (user ? setIsUserMenuOpen(!isUserMenuOpen) : navigate('/login'))}
              className="ms-1 hidden border-[3px] border-ink px-4 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-paper md:block"
              aria-expanded={user ? isUserMenuOpen : undefined}
            >
              {user ? (he ? `כרטיס המנוי${firstName ? ` · ${firstName}` : ''}` : `Member card${firstName ? ` · ${firstName}` : ''}`) : he ? 'כניסה' : 'Sign in'}
            </button>
            <AnimatePresence>
              {user && isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute end-0 top-full z-50 mt-2 w-52 border-[3px] border-ink bg-paper text-sm"
                  >
                    {[
                      { to: '/dashboard', label: he ? 'המקום שלכם' : 'Your place' },
                      { to: '/orders', label: he ? 'ההזמנות שלי' : 'My orders' },
                      { to: '/profile', label: he ? 'פרופיל' : 'Profile' },
                    ].map((item) => (
                      <li key={item.to}>
                        <Link to={item.to} onClick={() => setIsUserMenuOpen(false)} className="block border-b border-rule px-4 py-3 hover:bg-ink hover:text-paper">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-spot hover:bg-spot hover:text-paper"
                      >
                        <LogOut size={15} />
                        {he ? 'התנתקות' : 'Sign out'}
                      </button>
                    </li>
                  </motion.ul>
                </>
              )}
            </AnimatePresence>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={cn('p-2', isEditMode ? 'bg-spot text-paper' : 'text-ink hover:text-spot')}
              aria-pressed={isEditMode}
              aria-label={isEditMode ? (he ? 'יציאה ממצב עריכה' : 'Exit edit mode') : he ? 'מצב עריכה' : 'Edit mode'}
            >
              {isEditMode ? <Eye size={18} /> : <Edit2 size={18} />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden border-t-[3px] border-ink bg-paper lg:hidden"
          >
            <ul className="px-4 pb-6">
              {links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="flex items-center border-b border-ink py-4 font-display text-4xl font-bold leading-none text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 border-b border-rule py-4 text-base font-medium"
                >
                  <Search size={18} /> {he ? 'חיפוש באתר' : 'Search'}
                </button>
              </li>
              <li className="flex flex-wrap gap-2 pt-4">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn('border-2 border-ink px-3 py-1.5 text-sm', language === lang.code && 'bg-ink text-paper')}
                  >
                    {lang.name}
                  </button>
                ))}
              </li>
              {user ? (
                <li className="pt-4">
                  <button onClick={() => logout()} className="flex items-center gap-2 text-base font-bold text-spot">
                    <LogOut size={18} /> {he ? 'התנתקות' : 'Sign out'}
                  </button>
                </li>
              ) : (
                <li className="pt-4">
                  <Link to="/login" className="inline-block border-[3px] border-ink px-5 py-2 font-bold">
                    {he ? 'כניסה' : 'Sign in'}
                  </Link>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
};

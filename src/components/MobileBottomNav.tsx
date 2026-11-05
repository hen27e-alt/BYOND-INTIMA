import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

/** Phone tab bar: the four doors of the site, ruled like the masthead. */
export const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { user } = useFirebase();
  const { language } = useLanguage();
  const he = language === 'he';

  const items = [
    { label: he ? 'הבית' : 'Home', to: '/', match: (p: string) => p === '/' },
    { label: he ? 'המארזים' : 'Boxes', to: '/experience', match: (p: string) => p.startsWith('/experience') },
    { label: he ? 'הבוטיק' : 'Boutique', to: '/boutique', match: (p: string) => p.startsWith('/boutique') },
    {
      label: he ? 'המקום שלכם' : 'Your place',
      to: user ? '/dashboard' : '/login',
      match: (p: string) => ['/dashboard', '/profile', '/login', '/orders'].some((r) => p.startsWith(r)),
    },
  ];

  return (
    <nav
      aria-label={he ? 'ניווט תחתון' : 'Bottom navigation'}
      className="fixed inset-x-0 bottom-0 z-50 border-t-[3px] border-ink bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid h-16 grid-cols-4">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.to} className="border-e border-rule last:border-e-0">
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-full items-center justify-center text-sm font-bold transition-colors',
                  'before:absolute before:inset-x-0 before:-top-[3px] before:h-[3px] before:bg-spot before:transition-transform before:duration-200',
                  active ? 'text-spot before:scale-x-100' : 'text-ink before:scale-x-0 active:bg-ink/5'
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

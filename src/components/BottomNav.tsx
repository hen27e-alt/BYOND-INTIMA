import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, LayoutDashboard, User, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFirebase } from '../contexts/FirebaseContext';

export const BottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useFirebase();

  const navItems = [
    { id: 'home', path: '/', icon: Home, label: t('nav.home') },
    { id: 'recommendations', path: '/date-recommendations', icon: MapPin, label: t('nav.recommendations') },
    { id: 'experience', path: '/experience', icon: Compass, label: t('nav.experience') },
    { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-brand-gold/20 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-brand-gold' : 'text-brand-black/40 hover:text-brand-black/60'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

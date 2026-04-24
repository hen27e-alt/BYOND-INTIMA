import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Zap, Clock, Shield, LogOut, Sun, Moon, Type as TypeIcon, Calendar } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProfileViewProps {
  profile: any;
  updateProfile: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setActiveTab: (tab: string) => void;
  notifications: any[];
}

export const ProfileView = ({ profile, updateProfile, logout, setActiveTab, notifications }: ProfileViewProps) => {
  const { language, setLanguage } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLanguageChange = async (lang: any) => {
    setIsUpdating(true);
    try {
      setLanguage(lang);
      await updateProfile({ language: lang });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleThemeToggle = async () => {
    const newTheme = profile?.theme === 'dark' ? 'light' : 'dark';
    await updateProfile({ theme: newTheme });
  };

  const handleFontSizeChange = async (size: 'small' | 'medium' | 'large') => {
    await updateProfile({ fontSize: size });
  };

  const handleDefaultDurationChange = async (days: number) => {
    await updateProfile({ defaultMissionDuration: days });
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-20"
    >
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-brand-gold/10">
        <h2 className="text-2xl font-serif mb-6">הגדרות פרופיל</h2>
        
        <div className="space-y-8">
          <div className="flex items-center gap-4 p-4 bg-brand-gold/5 rounded-2xl border border-brand-gold/10">
            <div className="w-16 h-16 rounded-full border-2 border-brand-gold p-1 overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid || 'Byonder'}`}
                  alt="" 
                  className="w-full h-full rounded-full object-cover bg-brand-cream" 
                />
              )}
            </div>
            <div>
              <h3 className="font-serif text-lg">{profile?.displayName || 'משתמש'}</h3>
              <p className="text-sm text-brand-black/40">{profile?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-black/40">שפה (Language)</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleLanguageChange('he')}
                  disabled={isUpdating}
                  className={`flex-1 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${language === 'he' ? 'bg-brand-black text-white border-brand-black' : 'bg-white text-brand-black/60 border-brand-gold/20'}`}
                >
                  עברית
                </button>
                <button 
                  onClick={() => handleLanguageChange('en')}
                  disabled={isUpdating}
                  className={`flex-1 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${language === 'en' ? 'bg-brand-black text-white border-brand-black' : 'bg-white text-brand-black/60 border-brand-gold/20'}`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-black/40">התראות משימות</label>
              <button 
                onClick={() => updateProfile({ notificationsEnabled: !profile?.notificationsEnabled })}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-xl text-sm font-medium transition-all border ${profile?.notificationsEnabled ? 'bg-green-50 text-green-600 border-green-200' : 'bg-brand-gold/5 text-brand-black/60 border-brand-gold/10'}`}
              >
                <div className="flex items-center gap-3">
                  <Zap size={18} className={profile?.notificationsEnabled ? 'text-green-500' : 'text-brand-black/20'} />
                  <span className="font-bold uppercase tracking-widest text-[10px]">התראות פעילות</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${profile?.notificationsEnabled ? 'bg-green-500' : 'bg-brand-black/20'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${profile?.notificationsEnabled ? 'right-6' : 'right-1'}`} />
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-black/40">העדפות תצוגה (Display)</label>
              <div className="flex gap-3">
                <button 
                  onClick={handleThemeToggle}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${profile?.theme === 'dark' ? 'bg-brand-black text-white border-brand-black' : 'bg-white text-brand-black/60 border-brand-gold/20'}`}
                >
                  {profile?.theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                  {profile?.theme === 'dark' ? 'מצב לילה' : 'מצב יום'}
                </button>
                <div className="flex-1 flex gap-1">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={`flex-1 flex items-center justify-center p-2 rounded-xl border transition-all ${profile?.fontSize === size ? 'bg-brand-black text-white border-brand-black' : 'bg-white text-brand-black/60 border-brand-gold/20'}`}
                    >
                      <TypeIcon size={size === 'small' ? 12 : size === 'medium' ? 16 : 20} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-black/40">הגדרות יעד (Mission Goals)</label>
              <div className="flex items-center gap-3 p-4 bg-brand-gold/5 rounded-xl border border-brand-gold/10">
                <Calendar size={18} className="text-brand-gold" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-black/60 mb-1">זמן יעד ברירת מחדל</p>
                  <select 
                    value={profile?.defaultMissionDuration || 7}
                    onChange={(e) => handleDefaultDurationChange(parseInt(e.target.value))}
                    className="w-full bg-transparent text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value={3}>3 ימים</option>
                    <option value={7}>שבוע</option>
                    <option value={14}>שבועיים</option>
                    <option value={30}>חודש</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="space-y-4">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-black/40">התראות קרובות</label>
              <div className="space-y-2">
                {notifications.map((n: any) => (
                  <div key={n.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-amber-500" />
                      <div>
                        <p className="text-xs font-bold text-amber-900">{n.title}</p>
                        <p className="text-[10px] text-amber-700">יעד קרוב: {n.deadline.toDate ? n.deadline.toDate().toLocaleDateString('he-IL') : new Date(n.deadline).toLocaleDateString('he-IL')}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('missions')}
                      className="text-[10px] font-bold uppercase tracking-widest text-amber-900 hover:underline"
                    >
                      למשימה
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-brand-gold/10 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2 text-brand-black/40 text-[10px] font-bold uppercase tracking-widest">
              <Shield size={14} />
              המידע שלכם מאובטח ומוצפן
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-[10px] hover:bg-red-50 px-6 py-3 rounded-full transition-all"
            >
              <LogOut size={16} />
              התנתקות מהמערכת
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

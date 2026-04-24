import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Home, 
  Compass, 
  ShoppingBag, 
  LayoutDashboard, 
  User, 
  Gamepad2, 
  Layers, 
  Info, 
  Mail, 
  ShieldCheck, 
  Settings,
  MessageSquare,
  Heart,
  Sparkles,
  BookOpen,
  Calendar,
  Zap,
  Coffee,
  Map
} from 'lucide-react';

const PAGES = [
  { path: '/', name: { he: 'בית', en: 'Home' }, icon: Home, category: 'main' },
  { path: '/experience', name: { he: 'החוויה', en: 'Experience' }, icon: Compass, category: 'main' },
  { path: '/journey', name: { he: 'המסע', en: 'The Journey' }, icon: Map, category: 'main' },
  { path: '/boutique', name: { he: 'בוטיק', en: 'Boutique' }, icon: ShoppingBag, category: 'main' },
  { path: '/dashboard', name: { he: 'לוח בקרה', en: 'Dashboard' }, icon: LayoutDashboard, category: 'user' },
  { path: '/profile', name: { he: 'פרופיל', en: 'Profile' }, icon: User, category: 'user' },
  { path: '/games', name: { he: 'משחקים', en: 'Games' }, icon: Gamepad2, category: 'content' },
  { path: '/decks', name: { he: 'חפיסות קלפים', en: 'Card Decks' }, icon: Layers, category: 'content' },
  { path: '/date-recommendations', name: { he: 'המלצות לדייטים', en: 'Date Recommendations' }, icon: Calendar, category: 'content' },
  { path: '/healthy-relationships', name: { he: 'מערכות יחסים בריאות', en: 'Healthy Relationships' }, icon: Heart, category: 'knowledge' },
  { path: '/intimacy-guide', name: { he: 'מדריך אינטימיות', en: 'Intimacy Guide' }, icon: Sparkles, category: 'knowledge' },
  { path: '/knowledge-hub', name: { he: 'מרכז ידע', en: 'Knowledge Hub' }, icon: BookOpen, category: 'knowledge' },
  { path: '/emotional-intelligence', name: { he: 'אינטליגנציה רגשית', en: 'Emotional Intelligence' }, icon: Zap, category: 'knowledge' },
  { path: '/marriage-guide', name: { he: 'מדריך נישואין', en: 'Marriage Guide' }, icon: ShieldCheck, category: 'knowledge' },
  { path: '/wedding-planning', name: { he: 'תכנון חתונה', en: 'Wedding Planning' }, icon: Coffee, category: 'knowledge' },
  { path: '/date-night-ideas', name: { he: 'רעיונות לדייט נייט', en: 'Date Night Ideas' }, icon: Calendar, category: 'knowledge' },
  { path: '/couples-therapy', name: { he: 'טיפול זוגי', en: 'Couples Therapy' }, icon: MessageSquare, category: 'knowledge' },
  { path: '/relationship-tips', name: { he: 'טיפים לזוגיות', en: 'Relationship Tips' }, icon: Sparkles, category: 'knowledge' },
  { path: '/about', name: { he: 'אודות', en: 'About' }, icon: Info, category: 'info' },
  { path: '/contact', name: { he: 'צור קשר', en: 'Contact' }, icon: Mail, category: 'info' },
  { path: '/updates', name: { he: 'עדכונים', en: 'Updates' }, icon: Zap, category: 'info' },
  { path: '/legal', name: { he: 'משפטי', en: 'Legal' }, icon: ShieldCheck, category: 'info' },
  { path: '/ai-consultant', name: { he: 'יועץ AI', en: 'AI Consultant' }, icon: MessageSquare, category: 'ai' },
  { path: '/admin', name: { he: 'ניהול', en: 'Admin' }, icon: Settings, category: 'admin' },
];

const CATEGORIES = [
  { id: 'main', name: { he: 'ראשי', en: 'Main' } },
  { id: 'user', name: { he: 'משתמש', en: 'User' } },
  { id: 'content', name: { he: 'תוכן', en: 'Content' } },
  { id: 'knowledge', name: { he: 'מרכז ידע', en: 'Knowledge Hub' } },
  { id: 'info', name: { he: 'מידע', en: 'Information' } },
  { id: 'ai', name: { he: 'בינה מלאכותית', en: 'AI' } },
  { id: 'admin', name: { he: 'ניהול', en: 'Admin' } },
];

export const Sitemap = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-black mb-4"
          >
            {language === 'he' ? 'מפת האתר' : 'Sitemap'}
          </motion.h1>
          <p className="text-brand-black/60 max-w-2xl mx-auto">
            {language === 'he' 
              ? 'כל הדפים הזמינים באפליקציית BYOND במקום אחד.' 
              : 'All available pages in the BYOND application in one place.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {CATEGORIES.map((cat, idx) => {
            const catPages = PAGES.filter(p => p.category === cat.id);
            if (catPages.length === 0) return null;

            return (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-black text-brand-gold uppercase tracking-widest border-b border-brand-gold/20 pb-2">
                  {cat.name[language as 'he' | 'en']}
                </h2>
                <div className="grid gap-4">
                  {catPages.map(page => (
                    <Link 
                      key={page.path}
                      to={page.path}
                      className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-brand-black/5 hover:border-brand-gold hover:shadow-lg transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-colors">
                        <page.icon size={20} />
                      </div>
                      <span className="font-bold text-brand-black/80 group-hover:text-brand-black transition-colors">
                        {page.name[language as 'he' | 'en']}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

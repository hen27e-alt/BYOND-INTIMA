import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowLeft, Sparkles, Compass, Layers, User, Info, Mail, Globe, Heart, Home, Bot, Play, Mic, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  category: 'page' | 'feature' | 'deck' | 'ai';
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const searchableItems: SearchResult[] = [
    { id: 'home', title: t('nav.home'), description: 'דף הבית של Byond Intima', href: '/', icon: Home, category: 'page' },
    { id: 'experience', title: t('nav.experience'), description: 'מרחב החוויות הדיגיטלי', href: '/experience', icon: Sparkles, category: 'page' },
    { id: 'journey', title: t('nav.journey'), description: 'המסע הזוגי שלכם', href: '/journey', icon: Layers, category: 'page' },
    { id: 'decks', title: t('nav.decks'), description: 'חפיסות קלפים לשיחה וחיבור', href: '/decks', icon: Layers, category: 'page' },
    { id: 'dashboard', title: t('nav.dashboard'), description: 'האזור האישי שלכם', href: '/dashboard', icon: User, category: 'page' },
    { id: 'profile', title: t('nav.profile'), description: 'ניהול הפרופיל והעדפות', href: '/profile', icon: User, category: 'page' },
    { id: 'recommendations', title: t('nav.recommendations'), description: 'המלצות לדייטים ובילויים', href: '/date-recommendations', icon: MapPin, category: 'feature' },
    { id: 'concierge', title: 'BYOND CONCIERGE', description: 'עוזר ה-AI האישי שלכם', href: '/concierge', icon: Bot, category: 'ai' },
    { id: 'ai-consultant', title: 'יועץ AI', description: 'ייעוץ זוגי מבוסס בינה מלאכותית', href: '/ai-consultant', icon: Bot, category: 'ai' },
    { id: 'games', title: 'משחקים זוגיים', description: 'משחקים לחיזוק הקשר', href: '/games', icon: Sparkles, category: 'feature' },
    { id: 'about', title: t('nav.about'), description: 'מי אנחנו והחזון שלנו', href: '/about', icon: Info, category: 'page' },
    { id: 'contact', title: t('nav.contact'), description: 'צרו איתנו קשר', href: '/contact', icon: Mail, category: 'page' },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = searchableItems.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  const handleSelect = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-black/80 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-brand-cream rounded-3xl shadow-2xl overflow-hidden border border-brand-gold/20"
            dir="rtl"
          >
            <div className="p-6 border-b border-brand-gold/10 flex items-center gap-4">
              <Search className="text-brand-gold" size={24} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="מה תרצו למצוא?"
                className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-serif placeholder:text-brand-black/20 text-brand-black"
              />
              <button 
                onClick={onClose}
                className="p-2 text-brand-black/40 hover:text-brand-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {query && results.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold px-4 mb-4">תוצאות חיפוש</p>
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result.href)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-brand-gold/5 transition-all text-right group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white border border-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
                        <result.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-brand-black">{result.title}</h4>
                        <p className="text-xs text-brand-black/40 mt-1">{result.description}</p>
                      </div>
                      <ArrowLeft size={16} className="text-brand-gold opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                    </button>
                  ))}
                </div>
              ) : query ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-brand-gold/5 rounded-full flex items-center justify-center mx-auto">
                    <Search size={32} className="text-brand-gold/20" />
                  </div>
                  <p className="text-brand-black/40 italic">לא מצאנו תוצאות עבור "{query}"</p>
                </div>
              ) : (
                <div className="space-y-8 p-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold mb-6">חיפושים פופולריים</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['המסע', 'חוויות', 'חפיסות קלפים', 'ייעוץ AI', 'המלצות'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-4 py-3 rounded-xl bg-white border border-brand-gold/10 text-xs text-brand-black/60 hover:border-brand-gold hover:text-brand-gold transition-all text-center"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold mb-6">קטגוריות</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleSelect('/experience')}
                        className="p-6 rounded-2xl bg-brand-black text-white flex flex-col items-center gap-3 hover:bg-brand-gold transition-all group"
                      >
                        <Compass size={24} className="text-brand-gold group-hover:text-white" />
                        <span className="text-xs font-bold tracking-widest uppercase">חוויות</span>
                      </button>
                      <button 
                        onClick={() => handleSelect('/journey')}
                        className="p-6 rounded-2xl bg-brand-black text-white flex flex-col items-center gap-3 hover:bg-brand-gold transition-all group"
                      >
                        <Layers size={24} className="text-brand-gold group-hover:text-white" />
                        <span className="text-xs font-bold tracking-widest uppercase">המסע</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-brand-gold/5 border-t border-brand-gold/10 text-center">
              <p className="text-[10px] text-brand-black/40 uppercase tracking-widest">
                Byond Intima Search Engine v1.0
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

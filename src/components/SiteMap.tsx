import React from 'react';
import { motion } from 'motion/react';
import { Map, ChevronLeft, Home, Star, Compass, User, Gamepad2, Mail, Sparkles, Activity, BookOpen } from 'lucide-react';

interface SiteMapProps {
  setActiveTab: (tabId: string) => void;
}

export const SiteMap: React.FC<SiteMapProps> = ({ setActiveTab }) => {
  const sitemapData = [
    {
      title: 'Core Features',
      items: [
        { id: 'feed', name: 'Home', icon: Home, path: '/' },
        { id: 'experience', name: 'Experience', icon: Sparkles, path: '/experience' },
        { id: 'journey', name: 'The Journey', icon: Compass, path: '/journey' },
      ]
    },
    {
      title: 'Activities',
      items: [
        { id: 'games', name: 'Games', icon: Gamepad2, path: '/games' },
        { id: 'missions', name: 'Missions', icon: Star, path: '/missions' },
        { id: 'mood-tracker', name: 'Mood Tracker', icon: Activity, path: '/mood' },
      ]
    },
    {
      title: 'Resources',
      items: [
        { id: 'profile', name: 'Profile', icon: User, path: '/profile' },
        { id: 'knowledge-hub', name: 'Knowledge Hub', icon: BookOpen, path: '/knowledge' },
        { id: 'contact', name: 'Contact', icon: Mail, path: '/contact' },
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-serif text-brand-black flex items-center justify-center gap-3">
          <Map className="text-brand-gold" /> Site Map
        </h2>
        <p className="text-brand-black/60 mt-2">All the tools, experiences, and features of Byond Intima in one organized place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sitemapData.map((category, idx) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-brand-gold/10 rounded-3xl p-6 hover:border-brand-gold/30 transition-colors shadow-sm"
          >
            <h3 className="text-xl font-serif text-brand-gold mb-6 border-b border-brand-gold/10 pb-4">
              {category.title}
            </h3>
            <ul className="space-y-3">
              {category.items.map((item: any) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-brand-cream transition-colors group text-right"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-colors">
                          <Icon size={16} />
                        </div>
                        <span className="text-brand-black/80 group-hover:text-brand-black font-medium transition-colors">{item.name}</span>
                      </div>
                      <ChevronLeft size={16} className="text-brand-black/20 group-hover:text-brand-gold transition-colors" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

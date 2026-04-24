import React from 'react';
import { motion } from 'motion/react';
import { ChefHat, Music, BookOpen, Heart, MessageSquare, Sparkles, Telescope } from 'lucide-react';

interface QuickActionsProps {
  navigate: any;
}

export const QuickActions = ({ navigate }: QuickActionsProps) => (
  <div className="flex gap-3 md:gap-6 overflow-x-auto no-scrollbar pb-4 md:pb-8 mb-8 md:mb-16 -mx-4 px-4 md:mx-0 md:px-0">
    {[
      { icon: ChefHat, label: 'מתכונים', path: '/recipes', color: 'bg-orange-50 text-orange-600' },
      { icon: Music, label: 'פלייליסטים', path: '/playlists', color: 'bg-blue-50 text-blue-600' },
      { icon: BookOpen, label: 'מאמרים', path: '/articles', color: 'bg-emerald-50 text-emerald-600' },
      { icon: Heart, label: 'זוגיות', path: '/intimacy', color: 'bg-rose-50 text-rose-600' },
      { icon: MessageSquare, label: 'חידות', path: '/riddles', color: 'bg-purple-50 text-purple-600' },
      { icon: Telescope, label: 'מצפה כוכבים', path: '/observatory', color: 'bg-indigo-50 text-indigo-600' },
      { icon: Sparkles, label: 'הפתעות', path: '/surprises', color: 'bg-amber-50 text-amber-600' },
    ].map((action, i) => (
      <motion.button
        key={i}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(action.path)}
        className="flex-shrink-0 flex flex-col items-center gap-2 md:gap-4 group"
      >
        <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl ${action.color} flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-current/10`}>
          <action.icon size={24} className="md:w-8 md:h-8" />
        </div>
        <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-brand-black/60 group-hover:text-brand-gold transition-colors">{action.label}</span>
      </motion.button>
    ))}
  </div>
);

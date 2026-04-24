import React from 'react';
import { motion } from 'motion/react';
import { Home, User as UserIcon } from 'lucide-react';

interface ViewToggleProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ViewToggle = ({ activeTab, setActiveTab }: ViewToggleProps) => (
  <div className="flex justify-center mb-8">
    <div className="bg-brand-cream/50 p-1 rounded-2xl flex items-center gap-1 relative overflow-hidden shadow-inner border border-brand-black/5">
      <motion.div
        className="absolute h-[calc(100%-8px)] bg-white rounded-xl shadow-sm border border-brand-black/5"
        initial={false}
        animate={{
          x: activeTab === 'profile' ? '100%' : 0,
          width: '50%'
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      
      <button
        onClick={() => setActiveTab('feed')}
        className={`relative z-10 px-8 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
          activeTab !== 'profile' ? 'text-brand-gold' : 'text-brand-black/40 hover:text-brand-black/60'
        }`}
      >
        <Home size={14} />
        <span>Dashboard</span>
      </button>
      
      <button
        onClick={() => setActiveTab('profile')}
        className={`relative z-10 px-8 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
          activeTab === 'profile' ? 'text-brand-gold' : 'text-brand-black/40 hover:text-brand-black/60'
        }`}
      >
        <UserIcon size={14} />
        <span>Profile</span>
      </button>
    </div>
  </div>
);

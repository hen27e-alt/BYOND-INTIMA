import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Telescope, Star, Moon, Sun, Info, ExternalLink, Play, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';

const OBSERVATORIES = [
  {
    id: 'iss',
    name: 'ISS Live Stream',
    description: 'צפייה חיה מכדור הארץ ומהחלל דרך תחנת החלל הבינלאומית.',
    url: 'https://www.youtube.com/embed/P9C25Un7xaM?autoplay=1&mute=1',
    type: 'video'
  },
  {
    id: 'stellarium',
    name: 'Stellarium Web',
    description: 'מפה אינטראקטיבית של השמיים בזמן אמת. חקרו כוכבים, כוכבי לכת וגלקסיות.',
    url: 'https://stellarium-web.org/',
    type: 'iframe'
  },
  {
    id: 'nasa-eyes',
    name: 'NASA Eyes',
    description: 'סימולציה תלת-ממדית של מערכת השמש והיקום של נאס"א.',
    url: 'https://eyes.nasa.gov/apps/solar-system/#/home',
    type: 'iframe'
  }
];

export const SpaceObservatory = () => {
  const [activeObservatory, setActiveObservatory] = useState(OBSERVATORIES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold mb-4"
          >
            <Telescope size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">מצפה הכוכבים הדיגיטלי</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif mb-4"
          >
            לחקור את היקום יחד
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-2xl mx-auto"
          >
            התחברו לאחד הטלסקופים והמצפים הגדולים בעולם. צפו בכוכבים, גלקסיות ותופעות קוסמיות בזמן אמת, היישר מהספה שלכם.
          </motion.p>
        </div>

        {/* Main Viewer */}
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Sidebar Controls */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4 px-2">בחר מצפה</h3>
            {OBSERVATORIES.map((obs) => (
              <button
                key={obs.id}
                onClick={() => setActiveObservatory(obs)}
                className={cn(
                  "w-full p-4 rounded-2xl border transition-all text-right group",
                  activeObservatory.id === obs.id
                    ? "bg-brand-gold border-brand-gold text-brand-black"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    activeObservatory.id === obs.id ? "bg-brand-black/10" : "bg-brand-gold/10"
                  )}>
                    {obs.id === 'iss' && <Play size={18} />}
                    {obs.id === 'stellarium' && <Star size={18} />}
                    {obs.id === 'nasa-eyes' && <Telescope size={18} />}
                  </div>
                  {activeObservatory.id === obs.id && (
                    <motion.div layoutId="active-indicator" className="w-2 h-2 rounded-full bg-brand-black" />
                  )}
                </div>
                <h4 className="font-bold mb-1">{obs.name}</h4>
                <p className={cn(
                  "text-xs line-clamp-2",
                  activeObservatory.id === obs.id ? "text-brand-black/60" : "text-white/40"
                )}>
                  {obs.description}
                </p>
              </button>
            ))}

            <div className="p-6 rounded-3xl bg-brand-gold/5 border border-brand-gold/10 mt-8">
              <div className="flex items-center gap-3 mb-4 text-brand-gold">
                <Info size={20} />
                <h4 className="font-bold">טיפ לצפייה</h4>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                מומלץ להחשיך את האורות בחדר, לעבור למסך מלא ולהשתמש באוזניות לחוויה אימרסיבית מלאה.
              </p>
            </div>
          </div>

          {/* Viewer Window */}
          <div className={cn(
            "lg:col-span-3 bg-black rounded-[40px] border border-white/10 overflow-hidden relative shadow-2xl",
            isFullscreen ? "fixed inset-0 z-[100] rounded-0" : "aspect-video"
          )}>
            {/* Toolbar */}
            <div className="absolute top-6 right-6 left-6 flex items-center justify-between z-10 pointer-events-none">
              <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-brand-gold pointer-events-auto">
                Live Feed: {activeObservatory.name}
              </div>
              <div className="flex gap-2 pointer-events-auto">
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:bg-brand-gold hover:text-brand-black transition-all"
                >
                  <Maximize2 size={18} />
                </button>
                <a 
                  href={activeObservatory.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:bg-brand-gold hover:text-brand-black transition-all"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>

            {/* Iframe */}
            <iframe
              src={activeObservatory.url}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              title={activeObservatory.name}
            />

            {/* Overlay for Atmosphere */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>

        {/* Extra Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-brand-gold/30 transition-all">
            <Moon className="text-brand-gold mb-4" size={32} />
            <h4 className="text-lg font-serif mb-2">מופע הירח</h4>
            <p className="text-sm text-white/60 mb-4">עקבו אחר מחזור הירח הנוכחי ותכננו את ערב התצפית הבא שלכם.</p>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-brand-gold w-3/4" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-brand-gold">Waxing Gibbous - 75%</p>
          </div>

          <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-brand-gold/30 transition-all">
            <Sun className="text-brand-gold mb-4" size={32} />
            <h4 className="text-lg font-serif mb-2">פעילות שמש</h4>
            <p className="text-sm text-white/60 mb-4">צפו בכתמי שמש ובהתפרצויות סולאריות דרך טלסקופים ייעודיים של נאס"א.</p>
            <button className="text-xs font-bold uppercase tracking-widest text-brand-gold hover:underline">צפה בנתונים חיוניים</button>
          </div>

          <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-brand-gold/30 transition-all">
            <Star className="text-brand-gold mb-4" size={32} />
            <h4 className="text-lg font-serif mb-2">אירועים קרובים</h4>
            <p className="text-sm text-white/60 mb-4">מטר מטאורים, ליקויי חמה ומעברים של תחנת החלל הבינלאומית.</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/40">28 במרץ</span>
                <span className="font-bold">מטר לירידים</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/40">12 באפריל</span>
                <span className="font-bold">ליקוי לבנה חלקי</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

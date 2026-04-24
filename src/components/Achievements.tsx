import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Trophy, Star, Heart, Search, Zap, Flame, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const BADGES = [
  { id: 'first_steps', name: 'צעדים ראשונים', desc: 'השלמתם את 3 המשימות הראשונות שלכם', icon: Award, maxProgress: 3, category: 'general' },
  { id: 'fire_streak', name: 'רצף לוהט', desc: 'נכנסתם לאפליקציה 7 ימים ברציפות', icon: Flame, maxProgress: 7, category: 'general' },
  { id: 'master_chef', name: 'מאסטר שף זוגי', desc: 'בישלתם 5 מתכונים יחד', icon: Star, maxProgress: 5, category: 'kitchen' },
  { id: 'movie_buff', name: 'מבקרי קולנוע', desc: 'צפיתם ב-10 סרטים מומלצים', icon: Search, maxProgress: 10, category: 'fun' },
  { id: 'romantic_soul', name: 'רומנטיקנים חסרי תקנה', desc: 'יצרתם 5 דייטים במחולל הדייטים', icon: Heart, maxProgress: 5, category: 'romance' },
  { id: 'deep_talks', name: 'שיחות עומק', desc: 'עניתם על 20 קלפי שיח', icon: Zap, maxProgress: 20, category: 'communication' },
  { id: 'gold_member', name: 'חברי מועדון הזהב', desc: 'צברתם 1000 נקודות זוגיות', icon: Trophy, maxProgress: 1000, category: 'general' }
];

export const Achievements = () => {
  const { profile } = useFirebase();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  useEffect(() => {
    if (!profile?.coupleId) return;

    const unsubscribe = onSnapshot(doc(db, 'couples', profile.coupleId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProgress(data.badgeProgress || {
          first_steps: 3,
          fire_streak: 2,
          master_chef: 1,
          movie_buff: 4,
          romantic_soul: 5,
          deep_talks: 12,
          gold_member: 450
        });
      }
    });

    return () => unsubscribe();
  }, [profile?.coupleId]);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-white flex items-center justify-center gap-3">
          <Trophy className="text-brand-gold" /> תגיות והישגים
        </h2>
        <p className="text-white/40 italic">המסע הזוגי שלכם, מתוגמל על כל צעד.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {BADGES.map((badge, idx) => {
          const currentProgress = progress[badge.id] || 0;
          const isUnlocked = currentProgress >= badge.maxProgress;
          const progressPercent = Math.min((currentProgress / badge.maxProgress) * 100, 100);

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedBadge({ ...badge, currentProgress, isUnlocked })}
              className={`relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-500 group ${
                isUnlocked 
                  ? 'bg-brand-gold/10 border border-brand-gold/30 hover:bg-brand-gold/20' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 grayscale hover:grayscale-0'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-3 right-3 text-brand-gold">
                  <CheckCircle2 size={16} />
                </div>
              )}
              
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 ${
                isUnlocked ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' : 'bg-black/40 text-white/40'
              }`}>
                <badge.icon size={28} />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className={`font-serif text-sm ${isUnlocked ? 'text-brand-gold' : 'text-white/60'}`}>
                  {badge.name}
                </h3>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/40 font-mono">
                    <span>{currentProgress}</span>
                    <span>{badge.maxProgress}</span>
                  </div>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className={`h-full rounded-full ${isUnlocked ? 'bg-brand-gold' : 'bg-white/20'}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-black border border-brand-gold/20 p-8 rounded-[40px] max-w-sm w-full text-center relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-gold/20 to-transparent" />
              
              <div className="relative z-10">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl ${
                  selectedBadge.isUnlocked ? 'bg-brand-gold text-black shadow-brand-gold/40' : 'bg-white/5 text-white/20'
                }`}>
                  <selectedBadge.icon size={40} />
                </div>
                
                <h3 className="text-2xl font-serif text-white mb-2">{selectedBadge.name}</h3>
                <p className="text-white/60 mb-8 leading-relaxed">{selectedBadge.desc}</p>
                
                <div className="bg-black/40 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between text-sm text-white/60">
                    <span>התקדמות</span>
                    <span className="font-mono">{selectedBadge.currentProgress} / {selectedBadge.maxProgress}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((selectedBadge.currentProgress / selectedBadge.maxProgress) * 100, 100)}%` }}
                      className={`h-full rounded-full ${selectedBadge.isUnlocked ? 'bg-brand-gold' : 'bg-white/20'}`}
                    />
                  </div>
                  {selectedBadge.isUnlocked && (
                    <p className="text-brand-gold text-xs font-bold mt-4 flex items-center justify-center gap-1">
                      <Sparkles size={12} /> התג הושג בהצלחה!
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

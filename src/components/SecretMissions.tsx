import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Ghost, Gift, CheckCircle2, Loader2, Sparkles, EyeOff, Eye, Send, Volume2, Square } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp, getDocs, limit, orderBy, arrayUnion, increment } from 'firebase/firestore';
import { useTTS } from '../hooks/useTTS';

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  status: 'assigned' | 'completed';
  userId: string;
  partnerId: string;
}

export const SecretMissions = () => {
  const { user, profile } = useFirebase();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const { playText, stop: stopTTS, isPlaying: isTTSPlaying } = useTTS();
  const [playingMissionId, setPlayingMissionId] = useState<string | null>(null);

  const handleTTS = async (text: string, id: string) => {
    if (isTTSPlaying && playingMissionId === id) {
      stopTTS();
      setPlayingMissionId(null);
    } else {
      if (isTTSPlaying) stopTTS();
      setPlayingMissionId(id);
      await playText(text);
      setPlayingMissionId(null);
    }
  };

  useEffect(() => {
    if (!user || !profile?.coupleId) return;

    // Missions assigned to ME
    const q = query(
      collection(db, 'secret_missions'),
      where('userId', '==', user.uid),
      where('status', '==', 'assigned')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      let list: Mission[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Mission));
      list.sort((a, b) => {
        const dateA = (a as any).createdAt?.toDate() || new Date(0);
        const dateB = (b as any).createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      list = list.slice(0, 3);
      setMissions(list);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, profile?.coupleId]);

  const handleComplete = async (missionId: string) => {
    try {
      const mission = missions.find(m => m.id === missionId);
      if (!mission) return;

      await updateDoc(doc(db, 'secret_missions', missionId), {
        status: 'completed',
        completedAt: serverTimestamp()
      });
      // Also update user points
      if (user && profile) {
        await updateDoc(doc(db, 'users', user.uid), {
          points: increment(mission.points),
          missionsCompleted: arrayUnion(missionId)
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <div className="inline-flex p-4 bg-brand-gold/10 rounded-full text-brand-gold mb-4">
          <Shield size={32} />
        </div>
        <h2 className="text-3xl font-serif text-white">משימות סודיות</h2>
        <p className="text-white/40 italic">הפתעות קטנות שעושות הבדל גדול. אל תגלו לפרטנר!</p>
      </div>

      <div className="grid gap-6">
        {missions.map((mission) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative overflow-hidden group mission-task"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl -mr-16 -mt-16 group-hover:bg-brand-gold/10 transition-colors" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-6 text-right flex-1">
                <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center text-brand-gold shrink-0 border border-white/5">
                  <Ghost size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2 py-0.5 bg-brand-gold/20 text-brand-gold text-[10px] font-bold rounded-full uppercase tracking-widest">
                      {mission.points} נקודות
                    </span>
                    <h3 className="text-xl font-serif text-white">משימה חסויה</h3>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {revealed[mission.id] ? (
                      <motion.div
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-white font-bold">{mission.title}</p>
                          <button
                            onClick={() => handleTTS(`${mission.title}. ${mission.description}`, mission.id)}
                            className="p-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white hover:text-brand-black transition-colors"
                            title="הקרא משימה"
                          >
                            {isTTSPlaying && playingMissionId === mission.id ? <Square size={14} /> : <Volume2 size={14} />}
                          </button>
                        </div>
                        <p className="text-white/60 text-sm italic">{mission.description}</p>
                      </motion.div>
                    ) : (
                      <button 
                        onClick={() => setRevealed({ ...revealed, [mission.id]: true })}
                        className="flex items-center gap-2 text-brand-gold/60 hover:text-brand-gold transition-colors text-sm"
                      >
                        <Eye size={16} /> לחצו לחשיפת המשימה
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {revealed[mission.id] && (
                  <button
                    onClick={() => handleComplete(mission.id)}
                    className="px-8 py-4 bg-brand-gold text-black rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-brand-gold/20"
                  >
                    <CheckCircle2 size={20} /> ביצעתי!
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {missions.length === 0 && (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <Sparkles size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/40 italic">אין משימות סודיות כרגע. חזרו בקרוב!</p>
          </div>
        )}
      </div>

      <div className="bg-brand-gold/5 border border-brand-gold/20 p-6 rounded-2xl flex items-start gap-4">
        <Gift className="text-brand-gold shrink-0" size={24} />
        <div className="text-right">
          <p className="text-brand-gold font-bold mb-1">טיפ סודי:</p>
          <p className="text-white/60 text-sm italic">משימות סודיות הן הדרך הטובה ביותר להראות אהבה בלי מילים. נסו לבצע אותן בטבעיות!</p>
        </div>
      </div>
    </div>
  );
};

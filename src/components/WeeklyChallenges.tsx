import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, CheckCircle2, Clock, Star, Zap, Loader2, ChevronRight, Sparkles, Heart, Edit2, Trash2, Plus, X, Save } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAlert } from './AlertModal';
import { db } from '../firebase';
import { collection, query, onSnapshot, updateDoc, doc, arrayUnion, increment, getDocs, where, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { ContentFeedback } from './ContentFeedback';

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  startDate: any;
  endDate: any;
}

export const WeeklyChallenges = () => {
  const { user, profile } = useFirebase();
  const { t, language } = useLanguage();
  const { showAlert } = useAlert();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);
  const [editingMission, setEditingMission] = useState<Partial<Mission> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = profile?.role === 'admin' || user?.email === 'hen27e@gmail.com';

  useEffect(() => {
    const missionsRef = collection(db, 'weekly_missions');
    const unsubscribe = onSnapshot(missionsRef, (snapshot) => {
      const missionList: Mission[] = [];
      snapshot.forEach((doc) => {
        missionList.push({ id: doc.id, ...doc.data() } as Mission);
      });
      setMissions(missionList);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching missions:", err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (profile?.preferences?.notificationsEnabled === false) return;
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, [profile?.preferences?.notificationsEnabled]);

  useEffect(() => {
    if (profile?.preferences?.notificationsEnabled === false) return;
    if (missions.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
      const notifiedMissions = JSON.parse(localStorage.getItem('notifiedMissions') || '[]');
      const deadlineNotified = JSON.parse(localStorage.getItem('deadlineNotifiedMissions') || '[]');
      let updatedNotified = false;
      let updatedDeadline = false;
      
      missions.forEach(mission => {
        const isCompleted = profile?.missionsCompleted?.includes(mission.id);
        
        if (!notifiedMissions.includes(mission.id)) {
          new Notification('אתגר שבועי חדש!', {
            body: `משימה חדשה מחכה לכם: ${mission.title}`,
            icon: '/vite.svg'
          });
          notifiedMissions.push(mission.id);
          updatedNotified = true;
        } else if (!isCompleted && mission.endDate) {
          const endDate = mission.endDate.toDate();
          const now = new Date();
          const timeDiff = endDate.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 3600);
          
          if (hoursDiff > 0 && hoursDiff <= 24 && !deadlineNotified.includes(mission.id)) {
            new Notification('אתגר שבועי מסתיים בקרוב!', {
              body: `הזדמנות אחרונה להשלים את: ${mission.title}`,
              icon: '/vite.svg'
            });
            deadlineNotified.push(mission.id);
            updatedDeadline = true;
          }
        }
      });
      
      if (updatedNotified) localStorage.setItem('notifiedMissions', JSON.stringify(notifiedMissions));
      if (updatedDeadline) localStorage.setItem('deadlineNotifiedMissions', JSON.stringify(deadlineNotified));
    }
  }, [missions, profile?.missionsCompleted]);

  const handleComplete = async (missionId: string, points: number) => {
    if (!user) return;
    
    setIsCompleting(missionId);
    try {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#C5A059', '#F3E5AB', '#1A1A1A']
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        missionsCompleted: arrayUnion(missionId),
        points: increment(points)
      });
      
      // Update couple title if needed (simplified logic)
      if (profile?.missionsCompleted?.length && profile.missionsCompleted.length + 1 >= 5) {
        await updateDoc(userRef, {
          coupleTitle: 'זוג של אלופים'
        });
      }
    } catch (error) {
      console.error("Error completing mission:", error);
    } finally {
      setIsCompleting(null);
    }
  };

  const handleSaveMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMission?.title || !editingMission?.description) return;
    
    setIsSaving(true);
    try {
      const missionData = {
        title: editingMission.title,
        description: editingMission.description,
        points: Number(editingMission.points || 0),
        endDate: editingMission.endDate ? 
          (typeof editingMission.endDate === 'string' ? Timestamp.fromDate(new Date(editingMission.endDate)) : editingMission.endDate) 
          : Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        startDate: editingMission.startDate || Timestamp.now()
      };

      if (editingMission.id) {
        const missionRef = doc(db, 'weekly_missions', editingMission.id);
        await updateDoc(missionRef, missionData);
      } else {
        await addDoc(collection(db, 'weekly_missions'), missionData);
      }
      setEditingMission(null);
    } catch (error) {
      console.error("Error saving mission:", error);
      showAlert("שגיאה בשמירת המשימה");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMission = async (missionId: string) => {
    // We don't have a confirm modal yet, so we'll just check if it's okay to delete.
    // In a real app, we'd use a custom confirm modal.
    try {
      await deleteDoc(doc(db, 'weekly_missions', missionId));
    } catch (error) {
      console.error("Error deleting mission:", error);
      showAlert("שגיאה במחיקת המשימה");
    }
  };

  const formatDateForInput = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const isPastDue = (endDate: any) => {
    if (!endDate) return false;
    const date = endDate.toDate ? endDate.endDate.toDate() : new Date(endDate);
    return date < new Date();
  };

  const filteredMissions = missions.filter(mission => {
    const isCompleted = profile?.missionsCompleted?.includes(mission.id);
    if (filter === 'all') return true;
    if (filter === 'completed') return isCompleted;
    if (filter === 'pending') return !isCompleted;
    return true;
  });

  const completedCount = missions.filter(m => profile?.missionsCompleted?.includes(m.id)).length;
  const progressPercentage = missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0;

  // Badge logic
  const badges = [
    { id: 'starter', name: 'הצעד הראשון', threshold: 1, icon: Star },
    { id: 'chef', name: 'תעודת השף', threshold: 5, icon: Zap },
    { id: 'master', name: 'מאסטר זוגיות', threshold: 10, icon: Award }
  ];
  
  const currentBadge = [...badges].reverse().find(b => (profile?.missionsCompleted?.length || 0) >= b.threshold) || null;
  const nextBadge = badges.find(b => (profile?.missionsCompleted?.length || 0) < b.threshold);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="text-brand-gold animate-spin" size={48} />
        <p className="text-brand-gold/40 text-xs uppercase tracking-widest mt-4">{t('challenges.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            <Zap className="text-brand-gold fill-brand-gold" /> {t('challenges.title')}
          </h2>
          <p className="text-white/40 italic">{t('challenges.subtitle')}</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <span className="text-[10px] text-white/40 uppercase tracking-widest">סינון:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-transparent text-xs focus:outline-none text-white font-medium"
              >
                <option value="all" className="bg-zinc-900">הכל</option>
                <option value="pending" className="bg-zinc-900">פעילות</option>
                <option value="completed" className="bg-zinc-900">הושלמו</option>
              </select>
            </div>
            {isAdmin && (
              <button
                onClick={() => setEditingMission({ title: '', description: '', points: 50 })}
                className="flex items-center gap-2 px-4 py-2 bg-brand-gold/20 text-brand-gold rounded-full border border-brand-gold/30 hover:bg-brand-gold/30 transition-all"
              >
                <Plus size={16} />
                <span className="text-xs font-bold">{t('challenges.admin.add')}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-full">
            <Star className="text-brand-gold" size={20} fill="currentColor" />
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-white/40">{t('challenges.points.label')}</p>
              <p className="text-xl font-bold text-white">{profile?.points || 0}</p>
            </div>
          </div>
          
          {currentBadge && (
            <div className="flex items-center gap-2 text-brand-gold bg-brand-gold/10 px-4 py-2 rounded-full border border-brand-gold/20">
              <currentBadge.icon size={16} />
              <span className="text-xs font-bold">{currentBadge.name}</span>
            </div>
          )}

          {nextBadge && (
            <div className="text-xs text-white/40 text-right mt-1">
              {t('challenges.next_badge').replace('{count}', (nextBadge.threshold - (profile?.missionsCompleted?.length || 0)).toString()).replace('{name}', nextBadge.name)}
            </div>
          )}

          {missions.length > 0 && (
            <div className="w-full bg-white/5 rounded-full h-2 mt-2 overflow-hidden border border-white/10">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${progressPercentage}%` }} 
                className="h-full bg-brand-gold"
              />
            </div>
          )}
          <p className="text-xs text-white/40">{t('challenges.progress').replace('{completed}', completedCount.toString()).replace('{total}', missions.length.toString())}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredMissions.map((mission) => {
          const isCompleted = profile?.missionsCompleted?.includes(mission.id);
          const pastDue = isPastDue(mission.endDate);
          
          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              className={`mission-task relative overflow-hidden group p-8 rounded-3xl border transition-all ${
                isCompleted 
                  ? 'bg-brand-gold/5 border-brand-gold/20 opacity-60' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div 
                  onClick={() => !isCompleted && handleComplete(mission.id, mission.points)}
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  isCompleted ? 'bg-brand-gold text-black' : 'bg-white/10 text-brand-gold hover:bg-brand-gold/20'
                }`}>
                  {isCompleted ? <CheckCircle2 size={40} /> : <div className="w-10 h-10 rounded-full border-2 border-brand-gold/30" />}
                </div>

                <div className="flex-1 text-center md:text-right space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h3 className={`text-2xl font-serif text-white ${isCompleted ? 'line-through opacity-50' : ''}`}>{mission.title}</h3>
                    {isCompleted && (
                      <span className="px-3 py-1 bg-brand-gold/20 text-brand-gold text-[10px] uppercase tracking-widest font-bold rounded-full">
                        {t('challenges.completed')}
                      </span>
                    )}
                    {isAdmin && (
                      <div className="flex items-center gap-2 mr-auto">
                        <button
                          onClick={() => setEditingMission(mission)}
                          className="p-2 text-white/40 hover:text-brand-gold transition-colors"
                          title={t('challenges.admin.edit')}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMission(mission.id)}
                          className="p-2 text-white/40 hover:text-red-400 transition-colors"
                          title="מחק משימה"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className={`text-white/60 leading-relaxed max-w-2xl ${isCompleted ? 'opacity-50' : ''}`}>{mission.description}</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4">
                    <div className={`flex items-center gap-2 text-xs ${pastDue && !isCompleted ? 'text-red-500 font-bold' : 'text-white/40'}`}>
                      <Clock size={14} />
                      <span>{t('challenges.ends_at')} {mission.endDate?.toDate()?.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}</span>
                      {pastDue && !isCompleted && <span className="mr-1">(עבר הזמן!)</span>}
                    </div>
                    <div className="flex items-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-widest">
                      <Star size={14} fill="currentColor" />
                      <span>{t('challenges.points_value').replace('{points}', mission.points.toString())}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  {!isCompleted ? (
                    <button
                      onClick={() => handleComplete(mission.id, mission.points)}
                      disabled={isCompleting === mission.id}
                      className="w-full md:w-auto px-10 py-4 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20"
                    >
                      {isCompleting === mission.id ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Sparkles size={20} />
                      )}
                      {isCompleting === mission.id ? t('challenges.completing') : t('challenges.complete_button')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-brand-gold font-bold italic">
                      {t('challenges.congrats')} <Heart size={16} fill="currentColor" />
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar (Decoration) */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  className="h-full bg-brand-gold"
                />
              </div>
            </motion.div>
          );
        })}

        {filteredMissions.length === 0 && (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <Award size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/40 italic">{t('challenges.no_active')}</p>
          </div>
        )}
      </div>

      {/* Admin Edit Modal */}
      <AnimatePresence>
        {editingMission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-serif text-white">
                  {editingMission.id ? t('challenges.admin.edit') : t('challenges.admin.new')}
                </h3>
                <button 
                  onClick={() => setEditingMission(null)}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveMission} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 px-1">{t('challenges.admin.title_label')}</label>
                  <input
                    type="text"
                    value={editingMission.title}
                    onChange={(e) => setEditingMission({ ...editingMission, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-all"
                    placeholder="למשל: ערב בישול משותף"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 px-1">{t('challenges.admin.desc_label')}</label>
                  <textarea
                    value={editingMission.description}
                    onChange={(e) => setEditingMission({ ...editingMission, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-all min-h-[120px]"
                    placeholder="מה עליהם לעשות?"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40 px-1">{t('challenges.admin.points_label')}</label>
                    <input
                      type="number"
                      value={editingMission.points}
                      onChange={(e) => setEditingMission({ ...editingMission, points: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40 px-1">{t('challenges.admin.end_date_label')}</label>
                    <input
                      type="date"
                      value={formatDateForInput(editingMission.endDate)}
                      onChange={(e) => setEditingMission({ ...editingMission, endDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-brand-gold outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-brand-gold text-black font-bold py-4 rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSaving ? t('challenges.admin.saving') : t('challenges.admin.save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingMission(null)}
                    className="flex-1 bg-white/5 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all border border-white/10"
                  >
                    {t('challenges.admin.cancel')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feedback Section */}
      <div className="pt-8 border-t border-white/10">
        <ContentFeedback 
          pageId="weekly-challenges" 
          sectionId="main-list" 
          sectionTitle="אתגרים שבועיים" 
        />
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFirebase } from '../../contexts/FirebaseContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Check, Utensils, Heart, Zap, Search, Edit2, Calendar, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const allMissions = [
  { id: 'gold_words', points: 10, medal: 'המתמיד', category: 'Connection' },
  { id: 'screen_free', points: 25, medal: 'שומר הקשר', category: 'Connection' },
  { id: 'small_gesture', points: 15, medal: 'הרומנטיקן', category: 'Fun' },
  { id: 'date_in_box', points: 50, medal: 'חוקר המארזים', category: 'Discovery' },
  { id: 'kitchen_cards', points: 30, medal: 'השף הזוגי', type: 'cards', category: 'Culinary' },
  { id: 'business_inspiration', points: 20, medal: 'היזם', category: 'Discovery' },
  { id: 'self_learning', points: 40, medal: 'החוקר הפנימי', category: 'Discovery' },
  { id: 'morning_breath', points: 10, medal: 'השלווה', category: 'Connection' },
  { id: 'future_planning', points: 30, medal: 'המתכנן', category: 'Fun' },
  { id: 'writing_marathon', points: 100, medal: 'סופר המותג', category: 'Connection' },
  { id: 'home_spa', points: 40, medal: 'המטפח', category: 'Fun' },
  { id: 'premium_secret', points: 60, medal: 'שומר הסוד', category: 'Discovery' },
  { id: 'breakfast_in_bed', points: 35, medal: 'השף הזוגי', category: 'Culinary' },
  { id: 'first_date_reconstruction', points: 50, medal: 'הנוסטלגי', category: 'Connection' },
  { id: 'no_complaints_day', points: 40, medal: 'החיובי', category: 'Connection' },
  { id: 'shared_playlist', points: 20, medal: 'הדיג\'יי', category: 'Fun' },
  { id: 'nature_walk', points: 25, medal: 'הספורטאי', category: 'Discovery' },
  { id: 'gratitude', points: 15, medal: 'המעריך', category: 'Connection' },
  { id: 'board_game_night', points: 30, medal: 'השחקן', category: 'Fun' },
  { id: 'blind_cooking', points: 45, medal: 'השף העיוור', category: 'Culinary' },
  { id: 'letter_to_future', points: 35, medal: 'רואה העתיד', category: 'Discovery' },
  { id: 'shared_volunteering', points: 60, medal: 'התורם', category: 'Connection' },
  { id: 'eye_contact', points: 30, medal: 'החיבור', category: 'Connection' },
  { id: 'vulnerability_share', points: 40, medal: 'הפתיחות', category: 'Connection' },
  { id: 'sensory_journey', points: 35, medal: 'החושים', category: 'Connection' }
];

interface MissionsTabProps {
  profile: any;
  selectedMissionCategory: string;
  setSelectedMissionCategory: (category: string) => void;
  handleSetMissionDueDate: (title: string, date: string) => void;
  setMissionView: (view: 'list' | 'kitchen-cards') => void;
  setConfirmMission: (mission: any) => void;
}

export const MissionsTab: React.FC<MissionsTabProps> = ({
  profile,
  selectedMissionCategory,
  setSelectedMissionCategory,
  handleSetMissionDueDate,
  setMissionView,
  setConfirmMission
}) => {
  const { t, language } = useLanguage();
  const { updateProfile, user } = useFirebase();
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const initializationRef = React.useRef(false);

  useEffect(() => {
    const coupleId = profile?.coupleId || user?.uid;
    if (!coupleId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'couple_missions'),
      where('coupleId', '==', coupleId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const missionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));

      if (snapshot.empty && !initializationRef.current) {
        initializationRef.current = true;
        // Initialize missions if none exist
        const batch = [];
        const defaultDuration = profile?.defaultMissionDuration || 7;
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + defaultDuration);

        for (const m of allMissions) {
          batch.push(addDoc(collection(db, 'couple_missions'), {
            coupleId: coupleId,
            missionId: m.id,
            title: t(`missions.list.${m.id}.title`) || (m.id === 'eye_contact' ? 'מבט בעיניים' : m.id === 'vulnerability_share' ? 'שיתוף פגיעות' : m.id === 'sensory_journey' ? 'מסע חושים' : m.id),
            description: t(`missions.list.${m.id}.desc`) || (m.id === 'eye_contact' ? '5 דקות של מבט שקט בעיניים לחיבור עמוק.' : m.id === 'vulnerability_share' ? 'שתפו אחד את השני בפחד ילדות שמעולם לא סיפרתם.' : m.id === 'sensory_journey' ? 'טעימה עיוורת של 3 מאכלים אהובים אחד של השני.' : ''),
            points: m.points,
            category: m.category,
            medal: m.medal,
            type: m.type || 'standard',
            completionStatus: 'pending',
            deadline: deadlineDate,
            createdAt: serverTimestamp()
          }));
        }
        await Promise.all(batch);
      } else if (!snapshot.empty) {
        // Check for missing missions and add them
        const existingMissionIds = new Set(missionsData.map(m => (m as any).missionId));
        const missingMissions = allMissions.filter(m => !existingMissionIds.has(m.id));
        
        if (missingMissions.length > 0 && !initializationRef.current) {
          initializationRef.current = true;
          const batch = [];
          const defaultDuration = profile?.defaultMissionDuration || 7;
          const deadlineDate = new Date();
          deadlineDate.setDate(deadlineDate.getDate() + defaultDuration);

          for (const m of missingMissions) {
            batch.push(addDoc(collection(db, 'couple_missions'), {
              coupleId: coupleId,
              missionId: m.id,
              title: t(`missions.list.${m.id}.title`) || (m.id === 'eye_contact' ? 'מבט בעיניים' : m.id === 'vulnerability_share' ? 'שיתוף פגיעות' : m.id === 'sensory_journey' ? 'מסע חושים' : m.id),
              description: t(`missions.list.${m.id}.desc`) || (m.id === 'eye_contact' ? '5 דקות של מבט שקט בעיניים לחיבור עמוק.' : m.id === 'vulnerability_share' ? 'שתפו אחד את השני בפחד ילדות שמעולם לא סיפרתם.' : m.id === 'sensory_journey' ? 'טעימה עיוורת של 3 מאכלים אהובים אחד של השני.' : ''),
              points: m.points,
              category: m.category,
              medal: m.medal,
              type: m.type || 'standard',
              completionStatus: 'pending',
              deadline: deadlineDate,
              createdAt: serverTimestamp()
            }));
          }
          await Promise.all(batch);
        }
        setMissions(missionsData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.coupleId, t]);

  const handleStartEdit = (m: any) => {
    setEditingMissionId(m.id);
    setEditForm({
      title: m.title,
      desc: m.description,
      points: m.points,
      deadline: m.deadline ? new Date(m.deadline.seconds * 1000).toISOString().split('T')[0] : ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingMissionId) return;
    
    const missionRef = doc(db, 'couple_missions', editingMissionId);
    await updateDoc(missionRef, {
      title: editForm.title,
      description: editForm.desc,
      points: editForm.points,
      deadline: editForm.deadline ? new Date(editForm.deadline) : null,
      updatedAt: serverTimestamp()
    });

    setEditingMissionId(null);
    setEditForm(null);
  };

  const isOverdue = (deadline: any) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
    return dueDate < today;
  };

  const isCompleted = (m: any) => {
    return m.completionStatus === 'completed';
  };

  useEffect(() => {
    // Set default category to Connection on mount
    setSelectedMissionCategory('Connection');
  }, [setSelectedMissionCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-brand-gold" size={32} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Overall Missions Progress Bar */}
      <div className="bg-white border border-brand-gold/10 p-8 mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] text-brand-black/40 mb-2">{t('missions.progress.next_medal')}</h4>
            <p className="text-2xl font-serif">מדליית "חיבור עמוק"</p>
          </div>
          <span className="text-brand-gold font-bold">65%</span>
        </div>
        <div className="h-3 bg-brand-gold/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '65%' }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-brand-gold shadow-[0_0_15px_rgba(201,169,110,0.5)]"
          />
        </div>
        <div className="flex justify-between mt-4">
          <p className="text-[10px] text-brand-black/40 mt-4 uppercase tracking-widest">{t('missions.progress.remaining').replace('{points}', '350')}</p>
          <p className="text-[10px] text-brand-gold uppercase tracking-widest font-bold">{missions.filter(isCompleted).length}/{missions.length} משימות</p>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm tracking-[0.3em] uppercase text-brand-black/40">{t('missions.title')}</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {['All', 'Culinary', 'Connection', 'Fun', 'Discovery', 'Completed'].map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedMissionCategory(cat)}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap flex items-center gap-2 ${selectedMissionCategory === cat ? 'bg-brand-gold text-black border-brand-gold' : 'bg-white border-brand-gold/10 text-brand-black/40 hover:text-brand-black'}`}
              >
                {cat === 'Completed' && <CheckCircle2 size={12} />}
                {t(`missions.filter.${cat.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
        {missions
          .filter(m => {
            if (selectedMissionCategory === 'All') return true;
            if (selectedMissionCategory === 'Completed') return isCompleted(m);
            return m.category === selectedMissionCategory;
          })
          .map((m: any, i) => {
            const completed = isCompleted(m);
            const editing = editingMissionId === m.id;
            const overdue = isOverdue(m.deadline);

            return (
              <motion.div 
                key={m.id} 
                layout
                whileHover={{ 
                  scale: 1.02, 
                  boxShadow: "0 20px 40px -15px rgba(201,169,110,0.3)",
                  borderColor: "rgba(201,169,110,0.5)",
                  y: -4
                }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-right bg-white border p-6 flex flex-col md:flex-row md:items-center justify-between group transition-all duration-300 gap-6 relative overflow-hidden ${
                  completed ? 'border-green-200 bg-green-50/10 opacity-70' : 'border-brand-gold/10'
                }`}
              >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/0 via-brand-gold/5 to-brand-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
                {completed && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 flex items-center justify-center rotate-45 translate-x-8 -translate-y-8">
                    <CheckCircle2 size={16} className="text-green-500 -rotate-45 translate-y-4 -translate-x-4" />
                  </div>
                )}

                <div className="flex items-center gap-6 flex-1">
                  {/* Checkbox Indicator */}
                  <button 
                    onClick={() => !completed && setConfirmMission(m)}
                    className={`w-6 h-6 rounded border flex items-center justify-center transition-all shrink-0 ${
                      completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-brand-gold/30 text-transparent hover:border-brand-gold hover:text-brand-gold/30'
                    }`}
                  >
                    <Check size={14} strokeWidth={3} />
                  </button>

                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                    completed ? 'bg-green-500 border-green-500 text-white' : 'border-brand-gold/20 text-brand-gold group-hover:bg-brand-gold group-hover:text-white'
                  }`} aria-hidden="true">
                    {completed ? <Check size={20} /> : (m.category === 'Culinary' ? <Utensils size={20} /> : m.category === 'Connection' ? <Heart size={20} /> : m.category === 'Fun' ? <Zap size={20} /> : <Search size={20} />)}
                  </div>
                  
                  <div className="flex-1">
                    {editing ? (
                      <div className="space-y-3">
                        <input 
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="w-full bg-brand-cream/30 border border-brand-gold/20 px-3 py-2 text-lg font-serif outline-none focus:border-brand-gold"
                        />
                        <textarea 
                          value={editForm.desc}
                          onChange={(e) => setEditForm({...editForm, desc: e.target.value})}
                          className="w-full bg-brand-cream/30 border border-brand-gold/20 px-3 py-2 text-sm outline-none focus:border-brand-gold h-20"
                        />
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-[8px] uppercase tracking-widest text-brand-black/40 block mb-1">Points</label>
                            <input 
                              type="number"
                              value={editForm.points}
                              onChange={(e) => setEditForm({...editForm, points: parseInt(e.target.value)})}
                              className="w-full bg-brand-cream/30 border border-brand-gold/20 px-3 py-1 text-sm outline-none focus:border-brand-gold"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[8px] uppercase tracking-widest text-brand-black/40 block mb-1">Deadline</label>
                            <input 
                              type="date"
                              value={editForm.deadline}
                              onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
                              className="w-full bg-brand-cream/30 border border-brand-gold/20 px-3 py-1 text-sm outline-none focus:border-brand-gold"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                              <h4 className={`font-serif text-lg transition-all ${completed ? 'line-through text-brand-black/40' : ''}`}>
                                {m.title}
                              </h4>
                              <button 
                                onClick={() => handleStartEdit(m)}
                                className="text-brand-black/20 hover:text-brand-gold transition-colors p-1"
                              >
                                <Edit2 size={12} />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] uppercase tracking-widest font-bold ${
                                m.category === 'Culinary' ? 'text-orange-400' :
                                m.category === 'Connection' ? 'text-blue-400' :
                                m.category === 'Fun' ? 'text-pink-400' :
                                'text-purple-400'
                              }`}>{t(`missions.filter.${m.category.toLowerCase()}`)}</span>
                              <span className="text-[9px] text-brand-black/20">•</span>
                              <span className="text-[9px] uppercase tracking-widest text-brand-black/40">{t('missions.medal_label')} {m.medal}</span>
                              {m.deadline && (
                                <>
                                  <span className="text-[9px] text-brand-black/20">•</span>
                                  <span className={`text-[9px] uppercase tracking-widest font-bold flex items-center gap-1 ${overdue ? 'text-red-500 animate-pulse' : 'text-brand-gold'}`}>
                                    <Calendar size={10} />
                                    {t('missions.due_date_label')} {m.deadline.toDate ? m.deadline.toDate().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US') : new Date(m.deadline).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                                    {overdue && ` (${t('missions.overdue')})`}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-brand-gold font-medium bg-brand-gold/5 px-2 py-1 rounded">💎 {m.points}</span>
                        </div>
                        <p className={`text-sm leading-relaxed transition-all ${completed ? 'text-brand-black/30' : 'text-brand-black/60'}`}>
                          {m.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {editing ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSaveEdit}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => setEditingMissionId(null)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-end gap-1 mr-4">
                        <span className="text-[8px] uppercase tracking-widest text-brand-black/30">{t('missions.set_due_date')}</span>
                        <input 
                          type="date" 
                          value={m.deadline ? (m.deadline.toDate ? m.deadline.toDate().toISOString().split('T')[0] : new Date(m.deadline).toISOString().split('T')[0]) : ''}
                          onChange={async (e) => {
                            const missionRef = doc(db, 'couple_missions', m.id);
                            await updateDoc(missionRef, {
                              deadline: e.target.value ? new Date(e.target.value) : null,
                              updatedAt: serverTimestamp()
                            });
                          }}
                          className="text-[10px] bg-brand-cream/50 border border-brand-gold/10 px-2 py-1 outline-none focus:border-brand-gold transition-colors cursor-pointer"
                        />
                      </div>
                      <div className="flex gap-2">
                        {m.type === 'cards' && (
                          <button 
                            onClick={() => setMissionView('kitchen-cards')}
                            className="px-4 py-2 border border-brand-gold/20 text-[10px] uppercase tracking-widest hover:bg-brand-gold/5 transition-all"
                          >
                            {t('missions.view_cards')}
                          </button>
                        )}
                        <button 
                          onClick={async () => {
                            if (completed) return;
                            const missionRef = doc(db, 'couple_missions', m.id);
                            await updateDoc(missionRef, {
                              completionStatus: 'completed',
                              completedAt: serverTimestamp()
                            });
                            setConfirmMission(m);
                          }}
                          disabled={completed}
                          className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                            completed 
                              ? 'bg-green-500 text-white cursor-default' 
                              : 'bg-brand-gold text-white hover:bg-brand-black'
                          }`}
                        >
                          <CheckCircle2 size={12} />
                          {completed ? t('missions.completed_status') : t('missions.complete_button')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

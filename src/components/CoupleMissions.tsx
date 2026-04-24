import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, CheckCircle, XCircle, Star, Heart, Zap, Search, Clock, Volume2, Square } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { useTTS } from '../hooks/useTTS';

interface CoupleMission {
  id: string;
  coupleId: string;
  title: string;
  description: string;
  points: number;
  category: string;
  completionStatus: 'pending' | 'completed';
  deadline?: any;
  createdAt?: any;
  completedAt?: any;
}

export const CoupleMissions = () => {
  const { user, profile } = useFirebase();
  const [missions, setMissions] = useState<CoupleMission[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMission, setEditingMission] = useState<CoupleMission | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 10,
    category: 'Connection',
    deadline: ''
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'deadline' | 'points'>('createdAt');
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

  const isAdmin = profile?.role === 'admin' || profile?.email === 'hen27e@gmail.com';
  const isPartner = profile?.role === 'partner';
  const canEdit = isAdmin || isPartner || profile?.role === 'user'; // Assuming users can create missions for their couple

  // For simplicity, we use the user's UID as the coupleId if they don't have one explicitly set
  const coupleId = profile?.coupleId || user?.uid;

  useEffect(() => {
    if (!coupleId) return;

    const q = query(
      collection(db, 'couple_missions'),
      where('coupleId', '==', coupleId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: CoupleMission[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as CoupleMission);
      });
      // Sort by status (pending first) and then by creation date
      list.sort((a, b) => {
        if (a.completionStatus !== b.completionStatus) {
          return a.completionStatus === 'pending' ? -1 : 1;
        }
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setMissions(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'couple_missions');
    });

    return () => unsubscribe();
  }, [coupleId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleId) return;

    try {
      if (editingMission) {
        await updateDoc(doc(db, 'couple_missions', editingMission.id), {
          ...formData,
          deadline: formData.deadline ? new Date(formData.deadline) : null
        });
      } else {
        await addDoc(collection(db, 'couple_missions'), {
          ...formData,
          coupleId,
          completionStatus: 'pending',
          deadline: formData.deadline ? new Date(formData.deadline) : null,
          createdAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      setEditingMission(null);
      setFormData({ title: '', description: '', points: 10, category: 'Connection', deadline: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'couple_missions');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, 'couple_missions', deleteConfirmId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `couple_missions/${deleteConfirmId}`);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const toggleStatus = async (mission: CoupleMission) => {
    try {
      const newStatus = mission.completionStatus === 'pending' ? 'completed' : 'pending';
      
      if (newStatus === 'completed') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C5A059', '#F3E5AB', '#1A1A1A']
        });
      }

      await updateDoc(doc(db, 'couple_missions', mission.id), {
        completionStatus: newStatus,
        completedAt: newStatus === 'completed' ? serverTimestamp() : null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `couple_missions/${mission.id}`);
    }
  };

  const openEdit = (mission: CoupleMission) => {
    setEditingMission(mission);
    setFormData({
      title: mission.title,
      description: mission.description,
      points: mission.points,
      category: mission.category,
      deadline: mission.deadline ? new Date(mission.deadline.seconds * 1000).toISOString().slice(0, 16) : ''
    });
    setIsEditing(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Culinary': return <Zap size={20} />;
      case 'Connection': return <Heart size={20} />;
      case 'Fun': return <Star size={20} />;
      case 'Discovery': return <Search size={20} />;
      default: return <Star size={20} />;
    }
  };

  const filteredAndSortedMissions = missions
    .filter(mission => {
      if (filter !== 'all' && mission.completionStatus !== filter) return false;
      if (categoryFilter !== 'all' && mission.category !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'createdAt') {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      } else if (sortBy === 'deadline') {
        const dateA = a.deadline?.toDate() || new Date(8640000000000000); // Max date if no deadline
        const dateB = b.deadline?.toDate() || new Date(8640000000000000);
        return dateA.getTime() - dateB.getTime();
      } else if (sortBy === 'points') {
        return b.points - a.points;
      }
      return 0;
    });

  const isPastDue = (deadline: any) => {
    if (!deadline) return false;
    const date = deadline.toDate ? deadline.toDate() : new Date(deadline);
    return date < new Date();
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-brand-black">משימות זוגיות</h2>
          <p className="text-brand-black/60 mt-2">צרו, נהלו והשלימו משימות משותפות.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-brand-gold/20 rounded-full px-4 py-2">
            <span className="text-xs text-brand-black/60 uppercase tracking-widest">סינון:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-transparent text-sm focus:outline-none text-brand-black font-medium"
            >
              <option value="all">הכל</option>
              <option value="pending">פעילות</option>
              <option value="completed">הושלמו</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-brand-gold/20 rounded-full px-4 py-2">
            <span className="text-xs text-brand-black/60 uppercase tracking-widest">קטגוריה:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-sm focus:outline-none text-brand-black font-medium"
            >
              <option value="all">הכל</option>
              <option value="Connection">חיבור</option>
              <option value="Fun">כיף</option>
              <option value="Culinary">קולינרי</option>
              <option value="Discovery">גילוי</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-brand-gold/20 rounded-full px-4 py-2">
            <span className="text-xs text-brand-black/60 uppercase tracking-widest">מיון לפי:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-sm focus:outline-none text-brand-black font-medium"
            >
              <option value="createdAt">תאריך יצירה</option>
              <option value="deadline">תאריך יעד</option>
              <option value="points">נקודות</option>
            </select>
          </div>
          {canEdit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingMission(null);
                setFormData({ title: '', description: '', points: 10, category: 'Connection', deadline: '' });
                setIsEditing(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-brand-black text-white rounded-full text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors"
            >
              <Plus size={16} />
              משימה חדשה
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isEditing && !editingMission && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-brand-gold/20 p-6 rounded-2xl overflow-hidden"
          >
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-brand-black/60 mb-1">כותרת</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-brand-cream/50 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm text-brand-black/60 mb-1">קטגוריה</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-brand-cream/50 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold"
                  >
                    <option value="Connection">חיבור</option>
                    <option value="Fun">כיף</option>
                    <option value="Culinary">קולינרי</option>
                    <option value="Discovery">גילוי</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-brand-black/60 mb-1">תיאור</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-brand-cream/50 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-brand-black/60 mb-1">נקודות</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    className="w-full bg-brand-cream/50 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm text-brand-black/60 mb-1">תאריך יעד (אופציונלי)</label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-brand-cream/50 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-brand-black/20 text-brand-black rounded-full hover:bg-brand-black/5 transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-gold text-black rounded-full hover:bg-brand-gold/80 transition-colors"
                >
                  יצירת משימה
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {filteredAndSortedMissions.length === 0 && !isEditing ? (
          <div className="text-center py-12 bg-white border border-brand-gold/10 rounded-2xl">
            <Star size={48} className="mx-auto text-brand-gold/30 mb-4" />
            <p className="text-brand-black/60">אין משימות תואמות לסינון. נסו לשנות את אפשרויות הסינון או צרו משימה חדשה!</p>
          </div>
        ) : (
          filteredAndSortedMissions.map((mission) => (
            <motion.div
              layout
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01, boxShadow: '0 10px 30px -10px rgba(197, 160, 89, 0.1)' }}
              className={`mission-task bg-white border p-6 rounded-2xl flex flex-col md:flex-row gap-6 transition-all ${
                mission.completionStatus === 'completed' 
                  ? 'border-green-500/30 bg-green-50/30 opacity-70' 
                  : 'border-brand-gold/20 hover:border-brand-gold/50'
              }`}
            >
              {isEditing && editingMission?.id === mission.id ? (
                <form onSubmit={handleSave} className="w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-brand-black/40 uppercase tracking-widest mb-1">כותרת</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-black/40 uppercase tracking-widest mb-1">קטגוריה</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold"
                      >
                        <option value="Connection">חיבור</option>
                        <option value="Fun">כיף</option>
                        <option value="Culinary">קולינרי</option>
                        <option value="Discovery">גילוי</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-brand-black/40 uppercase tracking-widest mb-1">תיאור</label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold min-h-[80px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-black/40 uppercase tracking-widest mb-1">נקודות</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-black/40 uppercase tracking-widest mb-1">תאריך יעד</label>
                      <input
                        type="datetime-local"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full bg-brand-cream/30 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditingMission(null);
                      }}
                      className="px-4 py-2 text-sm text-brand-black/60 hover:text-brand-black"
                    >
                      ביטול
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-brand-gold text-black rounded-full text-sm font-bold hover:bg-brand-gold/80 transition-colors"
                    >
                      שמירה
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        mission.completionStatus === 'completed' ? 'bg-green-100 text-green-600' : 'bg-brand-cream text-brand-gold'
                      }`}>
                        {getCategoryIcon(mission.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-serif text-xl ${mission.completionStatus === 'completed' ? 'line-through text-brand-black/50' : 'text-brand-black'}`}>
                            {mission.title}
                          </h3>
                          <button
                            onClick={() => handleTTS(`${mission.title}. ${mission.description}`, mission.id)}
                            className="p-1.5 rounded-full bg-brand-cream border border-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-white transition-colors"
                            title="הקרא משימה"
                          >
                            {isTTSPlaying && playingMissionId === mission.id ? <Square size={14} /> : <Volume2 size={14} />}
                          </button>
                          {canEdit && mission.completionStatus !== 'completed' && (
                            <button
                              onClick={() => openEdit(mission)}
                              className="p-1 text-brand-black/20 hover:text-brand-gold transition-colors"
                              title="ערוך"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-brand-black/50">
                          <span className="uppercase tracking-widest">{mission.category}</span>
                          <span>•</span>
                          <span className="font-bold text-brand-gold">{mission.points} נקודות</span>
                        </div>
                      </div>
                    </div>
                    <p className={`text-brand-black/70 mt-3 leading-relaxed ${mission.completionStatus === 'completed' ? 'opacity-50' : ''}`}>
                      {mission.description}
                    </p>
                    {mission.deadline && (
                      <div className={`flex items-center gap-1 mt-4 text-xs ${isPastDue(mission.deadline) && mission.completionStatus !== 'completed' ? 'text-red-500 font-bold' : 'text-brand-black/50'}`}>
                        <Clock size={14} />
                        <span>יעד: {new Date(mission.deadline.seconds * 1000).toLocaleString('he-IL')}</span>
                        {isPastDue(mission.deadline) && mission.completionStatus !== 'completed' && (
                          <span className="mr-1">(עבר הזמן!)</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col items-center justify-end gap-3 shrink-0 border-t md:border-t-0 md:border-r border-brand-gold/10 pt-4 md:pt-0 md:pr-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleStatus(mission)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        mission.completionStatus === 'completed' 
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                          : 'bg-brand-cream text-brand-black hover:bg-green-100 hover:text-green-600 border-2 border-transparent hover:border-green-500/20'
                      }`}
                      title={mission.completionStatus === 'completed' ? 'סמן כלא הושלם' : 'סמן כהושלם'}
                    >
                      {mission.completionStatus === 'completed' ? <CheckCircle size={24} /> : <div className="w-6 h-6 rounded-full border-2 border-brand-gold/30 group-hover:border-green-500/50" />}
                    </motion.button>
                    
                    {canEdit && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(mission.id)}
                          className="p-2 text-brand-black/40 hover:text-red-500 transition-colors"
                          title="מחק"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          ))
        )}
      </div>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-2xl font-serif mb-4 text-brand-black">מחיקת משימה</h3>
              <p className="text-brand-black/60 mb-8">האם אתם בטוחים שברצונכם למחוק משימה זו? פעולה זו אינה הפיכה.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 bg-brand-cream text-brand-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-gold/10 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
                >
                  מחיקה
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

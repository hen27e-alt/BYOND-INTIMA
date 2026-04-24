import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Plus, Heart, Star, Image as ImageIcon, Trash2, Loader2, Calendar } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  iconType: 'heart' | 'star' | 'image' | 'calendar';
}

const ICONS = {
  heart: Heart,
  star: Star,
  image: ImageIcon,
  calendar: Calendar
};

export const RelationshipTimeline = () => {
  const { profile } = useFirebase();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', iconType: 'heart' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.coupleId) return;

    const q = query(
      collection(db, 'relationship_timeline'),
      where('coupleId', '==', profile.coupleId)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list: TimelineEvent[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as TimelineEvent));
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(list);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.coupleId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.coupleId || !formData.title || !formData.date) return;

    try {
      await addDoc(collection(db, 'relationship_timeline'), {
        coupleId: profile.coupleId,
        ...formData,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({ title: '', description: '', date: '', iconType: 'heart' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, 'relationship_timeline', deleteConfirmId));
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            <Clock className="text-brand-gold" /> ציר הזמן שלנו
          </h2>
          <p className="text-white/40 italic">הרגעים הגדולים והקטנים שבנו אותנו.</p>
        </div>
        
        <button
          onClick={() => setIsAdding(true)}
          className="px-8 py-3 bg-brand-gold text-black rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-brand-gold/20"
        >
          <Plus size={20} /> הוספת אירוע
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl mb-12"
          >
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-white/60">כותרת האירוע</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 text-right"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/60">תאריך</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 text-right"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-white/60">תיאור (אופציונלי)</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 text-right min-h-[100px]"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-white/60">אייקון</label>
                  <div className="flex gap-4">
                    {Object.entries(ICONS).map(([key, Icon]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, iconType: key })}
                        className={`p-4 rounded-xl border transition-all ${
                          formData.iconType === key 
                            ? 'bg-brand-gold/20 border-brand-gold text-brand-gold' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                        }`}
                      >
                        <Icon size={24} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-white/40 hover:text-white">ביטול</button>
                <button type="submit" className="px-8 py-2 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all">שמירה</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative border-r-2 border-brand-gold/20 pr-8 space-y-12">
        {events.map((event, index) => {
          const Icon = ICONS[event.iconType as keyof typeof ICONS] || Heart;
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute -right-[43px] top-0 w-10 h-10 bg-brand-black border-2 border-brand-gold rounded-full flex items-center justify-center text-brand-gold z-10">
                <Icon size={18} />
              </div>
              
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-brand-gold/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-brand-gold text-sm font-bold tracking-widest uppercase bg-brand-gold/10 px-3 py-1 rounded-full">
                    {new Date(event.date).toLocaleDateString('he-IL')}
                  </span>
                  <button onClick={() => handleDelete(event.id)} className="text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="text-2xl font-serif text-white mb-2">{event.title}</h3>
                {event.description && <p className="text-white/60 leading-relaxed">{event.description}</p>}
              </div>
            </motion.div>
          );
        })}

        {events.length === 0 && !isAdding && (
          <div className="text-center py-20 text-white/40 italic">
            ציר הזמן שלכם עדיין ריק. הוסיפו את האירוע הראשון!
          </div>
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
              <h3 className="text-2xl font-serif mb-4 text-brand-black">מחיקת אירוע</h3>
              <p className="text-brand-black/60 mb-8">האם אתם בטוחים שברצונכם למחוק אירוע זה? פעולה זו אינה הפיכה.</p>
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

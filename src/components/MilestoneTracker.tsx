import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, Plus, Loader2, CalendarHeart, Trash2, Calendar } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { useAlert } from './AlertModal';

interface Milestone {
  id: string;
  title: string;
  date: string;
  createdAt: any;
}

export const MilestoneTracker = () => {
  const { user } = useFirebase();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', date: '' });
  const { showAlert } = useAlert();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'milestones'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Milestone[];
      setMilestones(data);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/milestones`);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMilestone.title || !newMilestone.date) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'milestones'), {
        title: newMilestone.title,
        date: newMilestone.date,
        createdAt: new Date()
      });
      setIsAdding(false);
      setNewMilestone({ title: '', date: '' });
      showAlert('התאריך החשוב נשמר בהצלחה.', 'אבן דרך נוספה');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/milestones`);
      showAlert('לא הצלחנו לשמור את אבן הדרך.', 'שגיאה');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!user || !deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'milestones', deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/milestones/${deleteConfirmId}`);
    }
  };

  const calculateTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `לפני ${diffDays} ימים`;
    if (diffDays < 365) return `לפני ${Math.floor(diffDays / 30)} חודשים`;
    
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    
    if (remainingMonths === 0) return `לפני ${years} שנים`;
    return `לפני ${years} שנים ו-${remainingMonths} חודשים`;
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" size={32} /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif text-brand-black flex items-center gap-3">
            <Flag className="text-brand-gold" /> אבני דרך בזוגיות
          </h2>
          <p className="text-brand-black/60 italic mt-2">התאריכים המיוחדים והרגעים שעיצבו את הסיפור שלכם.</p>
        </div>
        
        <button
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-brand-gold text-white rounded-full font-bold flex items-center gap-2 hover:bg-brand-black transition-all shadow-lg shadow-brand-gold/20"
        >
          <Plus size={20} /> הוספת אבן דרך
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-brand-gold/10 p-6 rounded-3xl shadow-sm"
        >
          <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="מה קרה? (למשל: הדייט הראשון, אימצנו כלב)"
              value={newMilestone.title}
              onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
              className="bg-brand-cream/50 border border-brand-gold/10 rounded-xl p-4 text-brand-black focus:outline-none focus:border-brand-gold/50 text-right"
              required
            />
            <input
              type="date"
              value={newMilestone.date}
              onChange={e => setNewMilestone({ ...newMilestone, date: e.target.value })}
              className="bg-brand-cream/50 border border-brand-gold/10 rounded-xl p-4 text-brand-black focus:outline-none focus:border-brand-gold/50 text-right"
              required
            />
            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-brand-black/40 hover:text-brand-black">ביטול</button>
              <button type="submit" className="px-8 py-2 bg-brand-gold text-white rounded-full font-bold hover:bg-brand-black transition-all">שמירה</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="relative border-r-2 border-brand-gold/20 pr-8 space-y-12">
        {milestones.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-brand-gold/20 border-dashed mr-8 shadow-sm">
            <CalendarHeart size={48} className="text-brand-gold/20 mx-auto mb-4" />
            <p className="text-brand-black/40">אין עדיין אבני דרך. הוסיפו את התאריך החשוב הראשון שלכם!</p>
          </div>
        ) : (
          milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute -right-[41px] top-6 w-5 h-5 rounded-full bg-brand-gold border-4 border-brand-cream shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
              
              <div className="bg-white border border-brand-gold/10 p-6 rounded-2xl hover:border-brand-gold/30 transition-colors flex justify-between items-start shadow-sm">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar size={16} className="text-brand-gold" />
                    <span className="text-brand-gold font-mono text-sm">
                      {new Date(milestone.date).toLocaleDateString('he-IL')}
                    </span>
                    <span className="text-brand-black/40 text-xs px-2 py-1 bg-brand-cream/50 rounded-full">
                      {calculateTimeAgo(milestone.date)}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif text-brand-black">{milestone.title}</h3>
                </div>
                
                <button
                  onClick={() => handleDelete(milestone.id)}
                  className="p-2 text-brand-black/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  title="מחק"
                >
                  <Trash2 size={18} />
                </button>
              </div>
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
              <h3 className="text-2xl font-serif mb-4 text-brand-black">מחיקת אבן דרך</h3>
              <p className="text-brand-black/60 mb-8">האם אתם בטוחים שברצונכם למחוק אבן דרך זו? פעולה זו אינה הפיכה.</p>
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

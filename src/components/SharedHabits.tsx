import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Plus, Activity, Trash2 } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAlert } from './AlertModal';

interface Habit {
  id: string;
  title: string;
  partner1Completed: boolean;
  partner2Completed: boolean;
  createdAt: any;
}

export const SharedHabits = () => {
  const { user } = useFirebase();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const { showAlert } = useAlert();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'habits'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Habit[];
      setHabits(habitsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/habits`);
    });
    return () => unsubscribe();
  }, [user]);

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim() || !user) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'habits'), {
        title: newHabit.trim(),
        partner1Completed: false,
        partner2Completed: false,
        createdAt: new Date()
      });
      setNewHabit('');
      showAlert('ההרגל החדש נוסף בהצלחה לרשימה שלכם.', 'הרגל נוסף');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/habits`);
      showAlert('לא הצלחנו להוסיף את ההרגל.', 'שגיאה');
    }
  };

  const toggleHabit = async (habitId: string, partner: 1 | 2, currentValue: boolean) => {
    if (!user) return;
    try {
      const habitRef = doc(db, 'users', user.uid, 'habits', habitId);
      await updateDoc(habitRef, {
        [`partner${partner}Completed`]: !currentValue
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/habits/${habitId}`);
    }
  };

  const deleteHabit = (habitId: string) => {
    setDeleteConfirmId(habitId);
  };

  const confirmDelete = async () => {
    if (!user || !deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'habits', deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/habits/${deleteConfirmId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif text-white flex items-center justify-center gap-3">
          <Activity className="text-brand-gold" /> מעקב הרגלים משותף
        </h2>
        <p className="text-white/40 mt-2">בנו שגרה זוגית בריאה. סמנו וי על ההרגלים היומיים שלכם יחד.</p>
      </div>

      <form onSubmit={addHabit} className="flex gap-4">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="הוסיפו הרגל חדש (למשל: 10 דקות שיחה בלי מסכים)"
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-gold/50"
          dir="rtl"
        />
        <button
          type="submit"
          disabled={!newHabit.trim()}
          className="px-6 bg-brand-gold text-black rounded-2xl font-bold hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Plus size={20} /> הוסף
        </button>
      </form>

      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10 border-dashed">
            <Activity size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40">אין לכם עדיין הרגלים משותפים. הוסיפו את ההרגל הראשון שלכם!</p>
          </div>
        ) : (
          habits.map((habit) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group"
            >
              <div className="flex-1">
                <h3 className="text-xl text-white font-medium mb-4">{habit.title}</h3>
                <div className="flex gap-8">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHabit(habit.id, 1, habit.partner1Completed)}
                      className={`transition-colors ${habit.partner1Completed ? 'text-brand-gold' : 'text-white/20 hover:text-white/40'}`}
                    >
                      {habit.partner1Completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                    </button>
                    <span className="text-sm text-white/60">אני</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHabit(habit.id, 2, habit.partner2Completed)}
                      className={`transition-colors ${habit.partner2Completed ? 'text-brand-gold' : 'text-white/20 hover:text-white/40'}`}
                    >
                      {habit.partner2Completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                    </button>
                    <span className="text-sm text-white/60">בן/בת הזוג</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="p-3 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={20} />
              </button>
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
              <h3 className="text-2xl font-serif mb-4 text-brand-black">מחיקת הרגל</h3>
              <p className="text-brand-black/60 mb-8">האם אתם בטוחים שברצונכם למחוק הרגל זה? פעולה זו אינה הפיכה.</p>
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

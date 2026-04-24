import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListTodo, Calendar, Plus, Check, Trash2, Loader2, Star, Sparkles, Target, ChevronRight, Clock } from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAlert } from '../AlertModal';
import { cn } from '../../lib/utils';

export const DatingGoals = () => {
  const { profile, user } = useFirebase();
  const { showAlert } = useAlert();
  const [goals, setGoals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newGoal, setNewGoal] = React.useState({ title: '', targetDate: '', frequency: 'once' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const fetchGoals = async () => {
      if (!profile?.coupleId) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'dating_goals'),
          where('coupleId', '==', profile.coupleId),
          orderBy('status', 'asc'),
          orderBy('targetDate', 'asc')
        );
        const snapshot = await getDocs(q);
        setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching dating goals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [profile?.coupleId]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !profile?.coupleId) return;
    setIsSubmitting(true);
    try {
      const goalData = {
        coupleId: profile.coupleId,
        title: newGoal.title,
        targetDate: newGoal.targetDate ? new Date(newGoal.targetDate).toISOString() : null,
        frequency: newGoal.frequency,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'dating_goals'), goalData);
      setGoals(prev => [{ id: docRef.id, ...goalData }, ...prev]);
      setShowAddModal(false);
      setNewGoal({ title: '', targetDate: '', frequency: 'once' });
      showAlert('היעד נוסף בהצלחה!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'dating_goals');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGoalStatus = async (goal: any) => {
    try {
      const newStatus = goal.status === 'pending' ? 'completed' : 'pending';
      await updateDoc(doc(db, 'dating_goals', goal.id), {
        status: newStatus,
        completedAt: newStatus === 'completed' ? serverTimestamp() : null
      });
      setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, status: newStatus } : g));
      if (newStatus === 'completed') {
        showAlert('כל הכבוד! יעד נוסף הושלם ✨');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'dating_goals');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'dating_goals', id));
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'dating_goals');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-gold/10 rounded-xl">
            <Target className="text-brand-gold" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-serif">יעדי דייטינג משותפים</h3>
            <p className="text-xs text-brand-black/40 uppercase tracking-widest font-bold">תכננו והגשימו חוויות יחד</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="p-3 bg-brand-black text-white rounded-full hover:bg-brand-gold transition-all shadow-lg"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {goals.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-brand-gold/10 text-center">
            <ListTodo className="text-brand-gold/20 mx-auto mb-4" size={48} />
            <p className="text-brand-black/60">אין לכם יעדים פעילים. הוסיפו את היעד הראשון שלכם!</p>
          </div>
        ) : (
          goals.map((goal) => (
            <motion.div
              key={goal.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "bg-white p-6 rounded-2xl shadow-sm border transition-all flex items-center justify-between group",
                goal.status === 'completed' ? "border-emerald-100 bg-emerald-50/30" : "border-brand-gold/10"
              )}
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleGoalStatus(goal)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                    goal.status === 'completed' 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "border-brand-gold/20 hover:border-brand-gold text-transparent"
                  )}
                >
                  <Check size={16} />
                </button>
                <div>
                  <h4 className={cn(
                    "text-lg font-serif transition-all",
                    goal.status === 'completed' ? "text-brand-black/40 line-through" : "text-brand-black"
                  )}>
                    {goal.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    {goal.targetDate && (
                      <div className="flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold text-brand-black/40">
                        <Calendar size={10} />
                        {new Date(goal.targetDate).toLocaleDateString('he-IL')}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold text-brand-gold">
                      <Clock size={10} />
                      {goal.frequency === 'weekly' ? 'שבועי' : goal.frequency === 'monthly' ? 'חודשי' : 'חד פעמי'}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleDeleteGoal(goal.id)}
                className="p-2 text-brand-black/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-brand-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white max-w-md w-full p-8 rounded-3xl shadow-2xl relative"
            >
              <h3 className="text-2xl font-serif mb-6 text-brand-black">הוספת יעד חדש</h3>
              <form onSubmit={handleAddGoal} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">שם היעד</label>
                  <input 
                    type="text" 
                    required
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="לדוגמה: לצאת לדייט פעם בשבוע"
                    className="w-full bg-brand-cream/30 border-b-2 border-brand-gold/20 py-3 px-4 outline-none focus:border-brand-gold transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">תאריך יעד</label>
                    <input 
                      type="date" 
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                      className="w-full bg-brand-cream/30 border-b-2 border-brand-gold/20 py-3 px-4 outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">תדירות</label>
                    <select 
                      value={newGoal.frequency}
                      onChange={(e) => setNewGoal({ ...newGoal, frequency: e.target.value })}
                      className="w-full bg-brand-cream/30 border-b-2 border-brand-gold/20 py-3 px-4 outline-none focus:border-brand-gold transition-colors"
                    >
                      <option value="once">חד פעמי</option>
                      <option value="weekly">שבועי</option>
                      <option value="monthly">חודשי</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-brand-black text-white py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'הוספת יעד'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 border border-brand-gold/20 py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold text-brand-black/60 hover:bg-brand-cream transition-all"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

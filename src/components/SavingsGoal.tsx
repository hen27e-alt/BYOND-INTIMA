import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PiggyBank, Target, TrendingUp, Plus, Loader2, Calendar, Sparkles, DollarSign } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, increment, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { ContentFeedback } from './ContentFeedback';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: any;
}

export const SavingsGoal = () => {
  const { profile } = useFirebase();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', targetAmount: 0, deadline: '' });
  const [depositAmount, setDepositAmount] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!profile?.coupleId) return;

    const q = query(collection(db, 'savings_goals'), where('coupleId', '==', profile.coupleId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list: Goal[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Goal));
      setGoals(list);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'savings_goals');
    });

    return () => unsubscribe();
  }, [profile?.coupleId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.coupleId || !newGoal.title) return;

    try {
      await addDoc(collection(db, 'savings_goals'), {
        coupleId: profile.coupleId,
        title: newGoal.title,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: 0,
        deadline: newGoal.deadline ? new Date(newGoal.deadline) : null,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewGoal({ title: '', targetAmount: 0, deadline: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'savings_goals');
    }
  };

  const handleDeposit = async (goalId: string) => {
    const amount = depositAmount[goalId];
    if (!amount || amount <= 0) return;

    try {
      await updateDoc(doc(db, 'savings_goals', goalId), {
        currentAmount: increment(amount)
      });
      setDepositAmount({ ...depositAmount, [goalId]: 0 });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `savings_goals/${goalId}`);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" /></div>;

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            <PiggyBank className="text-brand-gold" /> חיסכון למטרה משותפת
          </h2>
          <p className="text-white/40 italic">חוסכים יחד לחוויות הבאות שלנו.</p>
        </div>
        
        <button
          onClick={() => setIsAdding(true)}
          className="px-8 py-3 bg-brand-gold text-black rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-brand-gold/20"
        >
          <Plus size={20} /> יצירת יעד חדש
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
        >
          <form onSubmit={handleCreate} className="grid md:grid-cols-3 gap-6">
            <input
              type="text" placeholder="שם היעד (למשל: חופשה ביוון)"
              value={newGoal.title}
              onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
              className="bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 text-right"
              required
            />
            <input
              type="number" placeholder="סכום יעד (₪)"
              value={newGoal.targetAmount || ''}
              onChange={e => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
              className="bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 text-right"
              required
            />
            <input
              type="date"
              value={newGoal.deadline}
              onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
              className="bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 text-right"
            />
            <div className="md:col-span-3 flex justify-end gap-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-white/40 hover:text-white">ביטול</button>
              <button type="submit" className="px-8 py-2 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all">יצירה</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid gap-8">
        {goals.map((goal) => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          return (
            <motion.div
              key={goal.id}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className="text-2xl font-serif text-white mb-2">{goal.title}</h3>
                  <div className="flex items-center gap-4 text-white/40 text-xs uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Target size={14} /> יעד: ₪{goal.targetAmount}</span>
                    {goal.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> עד: {
                          goal.deadline.toDate 
                            ? goal.deadline.toDate?.()?.toLocaleDateString('he-IL') 
                            : new Date(goal.deadline).toLocaleDateString('he-IL')
                        }
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-serif text-brand-gold">₪{goal.currentAmount}</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">נחסכו עד כה</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-brand-gold">{Math.round(progress)}%</span>
                  <span className="text-white/40">התקדמות</span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-brand-gold/50 to-brand-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-white/5">
                <div className="relative flex-1 w-full">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="number"
                    placeholder="סכום להפקדה..."
                    value={depositAmount[goal.id] || ''}
                    onChange={e => setDepositAmount({ ...depositAmount, [goal.id]: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-brand-gold/50 text-right"
                  />
                </div>
                <button
                  onClick={() => handleDeposit(goal.id)}
                  className="w-full md:w-auto px-8 py-4 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp size={18} /> הפקדה לחיסכון
                </button>
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <ContentFeedback pageId="savings" sectionId={`goal-${goal.id}`} />
              </div>
            </motion.div>
          );
        })}

        {goals.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <PiggyBank size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/40 italic">עדיין לא הגדרתם יעדי חיסכון. מה החלום הגדול הבא?</p>
          </div>
        )}
      </div>
    </div>
  );
};

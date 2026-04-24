import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, HelpCircle, Star, Sparkles, ChevronRight, Gift, Trophy, Lock, Loader2, Check } from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAlert } from '../AlertModal';

export const TreasureHunt = () => {
  const { profile, user, updateProfile } = useFirebase();
  const { showAlert } = useAlert();
  const [hunts, setHunts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [answer, setAnswer] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  React.useEffect(() => {
    const fetchHunts = async () => {
      const coupleId = profile?.coupleId || user?.uid;
      if (!coupleId) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'treasure_hunts'),
          where('coupleId', '==', coupleId),
          where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);
        const huntData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHunts(huntData);
      } catch (error) {
        console.error("Error fetching treasure hunts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHunts();
  }, [profile?.coupleId]);

  const handleSubmit = async (hunt: any) => {
    if (!answer.trim()) return;
    setIsSubmitting(true);
    
    try {
      if (answer.trim().toLowerCase() === hunt.answer.toLowerCase()) {
        // Correct answer!
        await updateDoc(doc(db, 'treasure_hunts', hunt.id), {
          status: 'solved',
          solvedAt: serverTimestamp(),
          solvedBy: user?.uid
        });

        const currentPoints = profile?.progress?.totalPoints || 0;
        const newPoints = currentPoints + hunt.points;
        const solvedCount = (profile?.progress?.solvedRiddlesCount || 0) + 1;

        await updateProfile({
          progress: {
            ...profile?.progress,
            totalPoints: newPoints,
            solvedRiddlesCount: solvedCount
          }
        });

        setShowSuccess(true);
        setAnswer('');
        setHunts(prev => prev.filter(h => h.id !== hunt.id));
        
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        showAlert("אופס, תשובה לא נכונה. נסו שוב!");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'treasure_hunts');
    } finally {
      setIsSubmitting(false);
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
            <Map className="text-brand-gold" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-serif">חיפוש המטמון</h3>
            <p className="text-xs text-brand-black/40 uppercase tracking-widest font-bold">פתרו את החידות וזכו בפרסים</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-center mb-8"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-emerald-600" size={24} />
            </div>
            <h4 className="text-emerald-900 font-serif text-xl mb-2">כל הכבוד!</h4>
            <p className="text-emerald-700 text-sm">פתרתם את החידה וזכיתם בנקודות זהב!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {hunts.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-brand-gold/10 text-center">
          <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-brand-gold" size={32} />
          </div>
          <h4 className="text-xl font-serif mb-2">אין חידות פעילות כרגע</h4>
          <p className="text-brand-black/60 max-w-xs mx-auto">
            החידות מבוססות על הזיכרונות והיומן שלכם. המשיכו לכתוב ולחוות כדי לפתוח חידות חדשות!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {hunts.map((hunt) => (
            <motion.div
              key={hunt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-brand-gold/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <HelpCircle size={120} className="text-brand-gold" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 bg-brand-gold/10 px-3 py-1 rounded-full">
                    <Star size={12} className="text-brand-gold fill-brand-gold" />
                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">{hunt.points} GP</span>
                  </div>
                  <span className="text-[10px] font-bold text-brand-black/40 uppercase tracking-widest">חידה פעילה</span>
                </div>

                <h4 className="text-2xl font-serif mb-6 leading-relaxed text-brand-black">
                  "{hunt.riddle}"
                </h4>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="הזינו את התשובה שלכם..."
                      className="w-full bg-brand-cream/30 border-b-2 border-brand-gold/20 py-4 px-4 outline-none focus:border-brand-gold transition-colors text-lg font-serif"
                    />
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubmit(hunt)}
                      disabled={isSubmitting || !answer.trim()}
                      className="flex-1 bg-brand-black text-white py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'שלח תשובה'}
                    </motion.button>
                    
                    {hunt.hint && (
                      <button 
                        onClick={() => showAlert(`רמז: ${hunt.hint}`)}
                        className="px-6 border border-brand-gold/20 rounded-xl text-[10px] uppercase tracking-widest font-bold text-brand-black/60 hover:bg-brand-cream transition-all"
                      >
                        רמז
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Treasure Hunt History/Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-brand-cream/30 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Trophy size={20} className="text-brand-gold" />
          </div>
          <div>
            <p className="text-[8px] uppercase tracking-widest font-bold text-brand-black/40">חידות שנפתרו</p>
            <p className="text-xl font-serif text-brand-black">{profile?.progress?.solvedRiddlesCount || 0}</p>
          </div>
        </div>
        
        <div className="bg-brand-cream/30 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Gift size={20} className="text-brand-gold" />
          </div>
          <div>
            <p className="text-[8px] uppercase tracking-widest font-bold text-brand-black/40">פרסים שחולקו</p>
            <p className="text-xl font-serif text-brand-black">{(profile?.progress?.solvedRiddlesCount || 0) * 2}</p>
          </div>
        </div>

        <div className="bg-brand-cream/30 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Sparkles size={20} className="text-brand-gold" />
          </div>
          <div>
            <p className="text-[8px] uppercase tracking-widest font-bold text-brand-black/40">דירוג ציידים</p>
            <p className="text-xl font-serif text-brand-black">מאסטר</p>
          </div>
        </div>
      </div>
    </div>
  );
};

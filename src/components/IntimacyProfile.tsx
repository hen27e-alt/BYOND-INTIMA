import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Heart, Flame, Sparkles, EyeOff, Eye, ShieldCheck, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAlert } from './AlertModal';
import { LoveLanguageQuiz } from './LoveLanguageQuiz';

export const IntimacyProfile = () => {
  const { user, profile } = useFirebase();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [isAddingFantasy, setIsAddingFantasy] = useState(false);
  const [newFantasy, setNewFantasy] = useState('');
  const { showAlert } = useAlert();

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock PIN logic for demonstration. In a real app, this would be securely verified.
    if (pin === '1234' || pin === profile?.intimacyPin) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('קוד שגוי. נסו שוב.');
      setPin('');
    }
  };

  const setSecurePin = async () => {
    if (!user) return;
    if (pin.length < 4) {
      setError('הקוד חייב להכיל לפחות 4 ספרות.');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        intimacyPin: pin
      });
      setIsUnlocked(true);
      showAlert('הפרופיל האינטימי שלכם מאובטח כעת.', 'הקוד נשמר');
    } catch (err) {
      console.error("Error saving PIN:", err);
      setError('שגיאה בשמירת הקוד.');
    }
  };

  const handleAddFantasy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newFantasy.trim()) return;

    const fantasyObj = {
      id: Date.now().toString(),
      text: newFantasy.trim(),
      isRevealed: false,
      createdAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fantasies: arrayUnion(fantasyObj)
      });
      setNewFantasy('');
      setIsAddingFantasy(false);
      showAlert('הפנטזיה נשמרה בהצלחה ובאנונימיות.', 'פנטזיה נוספה');
    } catch (err) {
      console.error("Error adding fantasy:", err);
      showAlert('לא הצלחנו לשמור את הפנטזיה.', 'שגיאה');
    }
  };

  const handleDeleteFantasy = async (fantasy: any) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fantasies: arrayRemove(fantasy)
      });
    } catch (err) {
      console.error("Error deleting fantasy:", err);
    }
  };

  const toggleReveal = async (fantasy: any) => {
    if (!user || !profile?.fantasies) return;
    
    const updatedFantasies = profile.fantasies.map((f: any) => 
      f.id === fantasy.id ? { ...f, isRevealed: !f.isRevealed } : f
    );

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fantasies: updatedFantasies
      });
    } catch (err) {
      console.error("Error updating fantasy:", err);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white border border-brand-gold/20 p-8 md:p-12 rounded-[40px] text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 space-y-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-100">
              <Lock size={32} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-serif text-brand-black">אזור אינטימי מאובטח</h2>
              <p className="text-brand-black/60 text-sm">הכניסו קוד סודי כדי לגשת לפרופיל האינטימי, שפות האהבה והפנטזיות המשותפות שלכם. (ברירת מחדל: 1234)</p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="****"
                maxLength={4}
                className="w-full text-center text-3xl tracking-[1em] bg-brand-cream/30 border border-brand-gold/20 rounded-2xl p-4 text-brand-black focus:outline-none focus:border-red-400/50 transition-colors"
                dir="ltr"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <button
                type="submit"
                className="w-full py-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-full font-bold transition-all flex items-center justify-center gap-2 border border-red-200"
              >
                <Unlock size={18} /> פתח אזור מאובטח
              </button>
            </form>
            
            {!profile?.intimacyPin && (
              <button onClick={setSecurePin} className="text-xs text-brand-black/40 hover:text-brand-black underline underline-offset-4">
                הגדר קוד חדש (שמירה ראשונית)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showQuiz) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <button 
          onClick={() => setShowQuiz(false)}
          className="flex items-center gap-2 text-brand-black/60 hover:text-brand-black transition-colors"
        >
          <ArrowRight size={20} /> חזור לפרופיל
        </button>
        <LoveLanguageQuiz />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-black flex items-center gap-3">
            <Flame className="text-red-500" /> הפרופיל האינטימי
          </h2>
          <p className="text-brand-black/60 mt-2">מרחב בטוח לחקור, לשתף ולהעמיק את החיבור הפיזי והרגשי.</p>
        </div>
        <button 
          onClick={() => setIsUnlocked(false)}
          className="p-3 bg-brand-cream/50 hover:bg-brand-gold/10 rounded-full text-brand-black/60 hover:text-brand-black transition-colors"
          title="נעל אזור"
        >
          <ShieldCheck size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Love Languages Section */}
        <div className="bg-white border border-brand-gold/20 rounded-3xl p-8 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-gold/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-serif text-brand-black">שפות האהבה שלי</h3>
            </div>
            
            {profile?.loveLanguage ? (
              <div className="space-y-4">
                <div className="p-4 bg-brand-cream/30 rounded-2xl border border-brand-gold/10">
                  <p className="text-brand-gold font-bold mb-1">{profile.loveLanguage}</p>
                  <p className="text-sm text-brand-black/60">זוהי הדרך העיקרית שבה את/ה חווה ומקבל/ת אהבה.</p>
                </div>
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="w-full py-3 bg-brand-cream/50 hover:bg-brand-gold/10 text-brand-black rounded-xl text-sm transition-colors"
                >
                  עדכן שפת אהבה
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-brand-black/40 mb-4">טרם גיליתם מהי שפת האהבה שלכם.</p>
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="px-6 py-2 bg-brand-gold text-white rounded-full text-sm font-bold hover:bg-brand-black transition-colors"
                >
                  התחל שאלון
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Shared Fantasies Section */}
        <div className="bg-white border border-brand-gold/20 rounded-3xl p-8 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-50 rounded-xl text-red-500">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-serif text-brand-black">פנטזיות משותפות</h3>
            </div>
            
            <div className="space-y-3">
              {(!profile?.fantasies || profile.fantasies.length === 0) ? (
                <div className="text-center py-6 border border-dashed border-brand-gold/20 rounded-2xl bg-brand-cream/20">
                  <p className="text-brand-black/40 text-sm">אין עדיין פנטזיות. הוסיפו את הראשונה שלכם!</p>
                </div>
              ) : (
                profile.fantasies.map((fantasy: any) => (
                  <div key={fantasy.id} className="p-4 bg-brand-cream/30 rounded-2xl border border-brand-gold/10 flex items-center justify-between group/item opacity-80 hover:opacity-100 transition-opacity">
                    <span className={`text-brand-black/80 ${!fantasy.isRevealed ? 'blur-sm select-none' : ''}`}>
                      {fantasy.isRevealed ? fantasy.text : 'תוכן מוסתר עד התאמה'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleReveal(fantasy)}
                        className="p-2 text-brand-black/40 hover:text-brand-black transition-colors"
                        title={fantasy.isRevealed ? "הסתר" : "חשוף"}
                      >
                        {fantasy.isRevealed ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button 
                        onClick={() => handleDeleteFantasy(fantasy)}
                        className="p-2 text-brand-black/20 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                        title="מחק"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {isAddingFantasy ? (
              <form onSubmit={handleAddFantasy} className="mt-6 space-y-3">
                <input
                  type="text"
                  value={newFantasy}
                  onChange={(e) => setNewFantasy(e.target.value)}
                  placeholder="הפנטזיה שלך..."
                  className="w-full bg-brand-cream/30 border border-brand-gold/20 rounded-xl p-3 text-brand-black focus:outline-none focus:border-red-400/50"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors border border-red-200"
                  >
                    שמור
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsAddingFantasy(false)}
                    className="flex-1 py-2 bg-brand-cream/50 text-brand-black/60 hover:text-brand-black rounded-xl text-sm transition-colors"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setIsAddingFantasy(true)}
                className="w-full mt-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm transition-colors border border-red-200 flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={16} /> הוסף פנטזיה חדשה (אנונימי)
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

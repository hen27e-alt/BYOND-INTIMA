import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, CheckCircle2, MessageCircle, Share2 } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAlert } from './AlertModal';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import confetti from 'canvas-confetti';

const DAILY_SPARKS = [
  { id: 'spark-1', type: 'action', text: 'שלחו עכשיו הודעת פרגון לבן/בת הזוג. משהו קטן שיעשה להם את היום.' },
  { id: 'spark-2', type: 'question', text: 'מה הדבר שהכי הצחיק אתכם היום? שתפו אחד את השנייה.' },
  { id: 'spark-3', type: 'action', text: 'תנו חיבוק של 20 שניות כשאתם נפגשים היום.' },
  { id: 'spark-4', type: 'question', text: 'איזה זיכרון משותף שלנו תמיד גורם לך לחייך?' },
  { id: 'spark-5', type: 'action', text: 'הכינו כוס קפה/תה לבן/בת הזוג בהפתעה.' },
  { id: 'spark-6', type: 'question', text: 'מה הדבר שאתם הכי מעריכים אחד בשנייה השבוע?' },
  { id: 'spark-7', type: 'action', text: 'שימו שיר ששניכם אוהבים ותרקדו יחד בסלון למשך 3 דקות.' },
  { id: 'spark-8', type: 'question', text: 'אם הייתם יכולים לחזור ליום אחד בעבר שלכם יחד, לאיזה יום הייתם חוזרים ולמה?' },
  { id: 'spark-9', type: 'action', text: 'השאירו פתק אהבה קטן על המראה באמבטיה או על המקרר.' },
  { id: 'spark-10', type: 'question', text: 'מהו הדבר הקטן שבן/בת הזוג עושה וגורם לכם להרגיש נאהבים?' },
  { id: 'spark-11', type: 'action', text: 'החמיאו לבן/בת הזוג על משהו שהם עשו היום, אפילו הדבר הקטן ביותר.' },
  { id: 'spark-12', type: 'question', text: 'איזו תכונה של בן/בת הזוג הייתם רוצים לאמץ לעצמכם?' },
  { id: 'spark-13', type: 'action', text: 'תנו נשיקה ארוכה של 10 שניות לפחות כשאתם חוזרים הביתה.' },
  { id: 'spark-14', type: 'question', text: 'מה החלום המשותף הבא שאתם רוצים להגשים יחד?' },
  { id: 'spark-15', type: 'action', text: 'הציעו לעשות מטלה בבית שבן/בת הזוג בדרך כלל עושה במקומם.' }
];

export const DailySpark = () => {
  const { user, profile } = useFirebase();
  const { showAlert } = useAlert();
  const [currentSpark, setCurrentSpark] = useState(DAILY_SPARKS[0]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Select a spark based on the day of the year to keep it consistent for both partners
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const sparkIndex = dayOfYear % DAILY_SPARKS.length;
    const spark = DAILY_SPARKS[sparkIndex];
    setCurrentSpark(spark);

    // Check if already completed today
    if (profile?.completedSparks?.includes(spark.id)) {
      setIsCompleted(true);
    } else {
      setIsCompleted(false);
    }
  }, [profile]);

  const handleComplete = async () => {
    if (!user || isCompleted) return;

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C5A059', '#F3E5AB', '#1A1A1A']
    });

    setIsCompleted(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        completedSparks: arrayUnion(currentSpark.id),
        points: (profile?.points || 0) + 10
      });
    } catch (error) {
      console.error('Error completing daily spark:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ניצוץ יומי זוגי',
      text: `הניצוץ היומי שלנו: ${currentSpark.text}`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        showAlert('הניצוץ הועתק ללוח! שתפו אותו עם בן/בת הזוג.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-brand-black to-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl -ml-10 -mb-10" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center shrink-0">
            <Sparkles className="text-brand-gold" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-brand-gold mb-1 flex items-center gap-2">
              הניצוץ היומי
              <span className="text-xs font-sans bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded-full">
                +10 נק'
              </span>
            </h3>
            <p className="text-sm text-white/80 leading-relaxed">
              {currentSpark.text}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShare}
            className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center border border-white/10"
            title="שתף עם בן/בת הזוג"
          >
            <Share2 size={18} />
          </button>

          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 relative overflow-hidden group/btn ${
              isCompleted 
                ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                : 'bg-brand-gold text-brand-black hover:bg-brand-gold-light hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(197,160,89,0.3)]'
            }`}
          >
            {/* Ripple/Glow effect on active */}
            {!isCompleted && (
              <span className="absolute inset-0 bg-white/20 scale-0 group-active/btn:scale-150 transition-transform duration-500 rounded-full" />
            )}
            
            {isCompleted ? (
              <>
                <CheckCircle2 size={18} />
                הושלם להיום
              </>
            ) : (
              <>
                {currentSpark.type === 'action' ? <Heart size={18} className="group-hover/btn:animate-bounce" /> : <MessageCircle size={18} className="group-hover/btn:animate-pulse" />}
                עשינו את זה!
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

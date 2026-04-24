import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const questions = [
  { q: "מה המאכל שהכי מנחם אותי אחרי יום קשה?", a: "" },
  { q: "מה הדבר הראשון שאני עושה כשאני קם/ה בבוקר?", a: "" },
  { q: "איזה סרט או סדרה אני יכול/ה לראות שוב ושוב?", a: "" },
  { q: "מה הפחד הכי גדול שלי?", a: "" },
  { q: "מה הזיכרון הכי מתוק שלי מהילדות?", a: "" },
  { q: "אם הייתי יכול/ה לטוס עכשיו לכל מקום בעולם, לאן הייתי טס/ה?", a: "" },
  { q: "מה הדבר שהכי מעצבן אותי שאנשים עושים?", a: "" },
  { q: "מה המתנה הכי טובה שאי פעם קיבלתי?", a: "" },
  { q: "איזה שיר תמיד גורם לי לחייך?", a: "" },
  { q: "מה הדבר שאני הכי אוהב/ת בעצמי?", a: "" },
];

export const WhoKnowsBetter = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleNext = (correct: boolean) => {
    if (correct) setScore(s => s + 1);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowAnswer(false);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-3xl shadow-xl border border-brand-gold/20">
        <div className="w-24 h-24 bg-brand-gold/10 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-brand-gold" fill="currentColor" />
        </div>
        <h2 className="text-4xl font-serif mb-4 text-brand-black">סיימתם את המשחק!</h2>
        <p className="text-xl mb-8 text-brand-black/70">
          הציון שלכם: <span className="font-bold text-brand-gold">{score}</span> מתוך {questions.length}
        </p>
        <p className="text-brand-black/50 mb-8 italic">
          {score === questions.length ? 'מושלם! אתם מכירים אחד את השנייה בעיניים עצומות.' : 
           score >= questions.length / 2 ? 'לא רע בכלל! אבל תמיד יש עוד מה ללמוד.' : 
           'נראה שיש לכם עוד הרבה על מה לדבר הלילה...'}
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="flex items-center gap-2 px-8 py-4 bg-brand-black text-white rounded-full hover:bg-brand-gold transition-colors uppercase tracking-widest text-sm shadow-lg hover:shadow-brand-gold/30"
        >
          <RefreshCw size={18} />
          שחקו שוב
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 md:p-12 bg-white rounded-3xl shadow-xl border border-brand-gold/20 relative overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-brand-cream">
        <motion.div 
          className="h-full bg-brand-gold"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-8">
        שאלה {currentIndex + 1} מתוך {questions.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="text-center max-w-2xl w-full"
        >
          <h3 className="text-3xl md:text-5xl font-serif text-brand-black mb-12 leading-tight">
            {questions[currentIndex].q}
          </h3>

          {!showAnswer ? (
            <div className="space-y-6">
              <p className="text-brand-black/50 text-sm italic mb-8">
                בן/בת הזוג עונים בקול רם. לאחר מכן, לחצו כדי לחשוף אם צדקו.
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAnswer(true)}
                className="px-10 py-4 border-2 border-brand-gold text-brand-gold rounded-full hover:bg-brand-gold hover:text-white transition-all text-lg font-medium shadow-lg hover:shadow-brand-gold/30"
              >
                בדקו תשובה
              </motion.button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <p className="text-xl text-brand-black/80 font-medium">האם התשובה הייתה נכונה?</p>
              <div className="flex justify-center gap-6">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNext(true)}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-green-200 bg-green-50 hover:bg-green-100 transition-colors text-green-700 min-w-[120px] shadow-sm hover:shadow-md"
                >
                  <CheckCircle2 size={32} />
                  <span className="font-bold">כן, בול!</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNext(false)}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-red-700 min-w-[120px] shadow-sm hover:shadow-md"
                >
                  <AlertCircle size={32} />
                  <span className="font-bold">ממש לא</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

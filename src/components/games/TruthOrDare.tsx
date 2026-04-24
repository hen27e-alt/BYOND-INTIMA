import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Flame, RefreshCw } from 'lucide-react';

const truths = [
  "מה הדבר הכי מביך שקרה לך במיטה?",
  "איזה סוד שמרת ממני הכי הרבה זמן?",
  "מה הפנטזיה הכי פרועה שלך שעדיין לא הגשמנו?",
  "מתי בפעם האחרונה קינאת לי ולא אמרת?",
  "מה הדבר הראשון שחשבת עליי כשנפגשנו?",
  "איזה הרגל שלי הכי מעצבן אותך אבל אתה/את לא אומר/ת?",
  "מה החלום הכי מוזר שהיה לך עליי?",
  "אם היית יכול/ה לשנות בי דבר אחד, מה זה היה?",
  "מה הדבר שהכי מדליק אותך שאני עושה בלי לשים לב?",
  "מתי הרגשת הכי קרוב/ה אליי אי פעם?"
];

const dares = [
  "תעשה/י לי מסאז' בכתפיים במשך 2 דקות.",
  "תנשק/י אותי במקום שמעולם לא נישקת אותי בו.",
  "תלחש/י לי באוזן משהו סקסי שאת/ה רוצה שנעשה הלילה.",
  "תוריד/י פריט לבוש אחד עכשיו.",
  "תעשה/י לי ריקוד סקסי קצר (לפחות 30 שניות).",
  "תאכיל/י אותי במשהו מתוק בעיניים עצומות.",
  "תתאר/י את הגוף שלי ב-3 מילים בלבד.",
  "תנשק/י את הצוואר שלי במשך דקה שלמה בלי להפסיק.",
  "תשלח/י לי עכשיו הודעה סקסית שתישאר בטלפון שלי.",
  "תעצום/תעצמי עיניים ותן/י לי להוביל אותך במשך 3 דקות."
];

export const TruthOrDare = () => {
  const [currentPrompt, setCurrentPrompt] = useState<{ type: 'truth' | 'dare', text: string } | null>(null);
  const [player, setPlayer] = useState<1 | 2>(1);

  const handleChoice = (type: 'truth' | 'dare') => {
    const list = type === 'truth' ? truths : dares;
    const randomIndex = Math.floor(Math.random() * list.length);
    setCurrentPrompt({ type, text: list[randomIndex] });
  };

  const handleNextTurn = () => {
    setCurrentPrompt(null);
    setPlayer(p => p === 1 ? 2 : 1);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 md:p-12 bg-brand-black text-white rounded-3xl shadow-2xl border border-brand-gold/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-gold rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        <div className="inline-block px-6 py-2 rounded-full border border-brand-gold/50 text-brand-gold text-xs uppercase tracking-[0.3em] font-bold mb-12">
          תור שחקן {player}
        </div>

        <AnimatePresence mode="wait">
          {!currentPrompt ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-12"
            >
              <h2 className="text-4xl md:text-6xl font-serif mb-8">אמת או חובה?</h2>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice('truth')}
                  className="group relative px-12 py-6 bg-transparent border-2 border-blue-400 text-blue-400 rounded-2xl hover:bg-blue-400 hover:text-white transition-all overflow-hidden shadow-[0_0_15px_rgba(96,165,250,0.2)] hover:shadow-[0_0_30px_rgba(96,165,250,0.6)]"
                >
                  <div className="absolute inset-0 bg-blue-400/10 group-hover:bg-transparent transition-colors"></div>
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <HelpCircle size={32} />
                    <span className="text-2xl font-bold tracking-widest">אמת</span>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice('dare')}
                  className="group relative px-12 py-6 bg-transparent border-2 border-red-500 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                >
                  <div className="absolute inset-0 bg-red-500/10 group-hover:bg-transparent transition-colors"></div>
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <Flame size={32} />
                    <span className="text-2xl font-bold tracking-widest">חובה</span>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-12"
            >
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                currentPrompt.type === 'truth' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-500'
              }`}>
                {currentPrompt.type === 'truth' ? <HelpCircle size={40} /> : <Flame size={40} />}
              </div>
              
              <h3 className="text-3xl md:text-5xl font-serif leading-tight px-4">
                {currentPrompt.text}
              </h3>

              <div className="pt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextTurn}
                  className="flex items-center gap-3 mx-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors uppercase tracking-widest text-sm font-bold backdrop-blur-sm shadow-lg hover:shadow-white/10"
                >
                  <RefreshCw size={18} />
                  סיימתי, תור הבא
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

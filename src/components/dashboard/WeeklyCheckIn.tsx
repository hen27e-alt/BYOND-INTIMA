import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { ClipboardCheck, Heart, MessageCircle, Star, Sparkles, ChevronRight, Loader2, Check, Brain, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { useAlert } from '../AlertModal';

export const WeeklyCheckIn = () => {
  const { profile, user } = useFirebase();
  const { showAlert } = useAlert();
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [aiInsight, setAiInsight] = React.useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = React.useState(false);
  const [history, setHistory] = React.useState<any[]>([]);

  const questions = [
    { id: 'connection', text: 'עד כמה הרגשתם מחוברים השבוע?', icon: Heart },
    { id: 'communication', text: 'איך הייתם מדרגים את התקשורת ביניכם?', icon: MessageCircle },
    { id: 'intimacy', text: 'עד כמה הייתם מרוצים מרמת האינטימיות?', icon: Sparkles },
    { id: 'support', text: 'עד כמה הרגשתם נתמכים על ידי בן/בת הזוג?', icon: Star },
    { id: 'fun', text: 'כמה זמן איכות מהנה היה לכם יחד?', icon: TrendingUp },
  ];

  React.useEffect(() => {
    const fetchHistory = async () => {
      if (!profile?.coupleId) return;
      try {
        const q = query(
          collection(db, 'weekly_checkins'),
          where('coupleId', '==', profile.coupleId),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching check-in history:", error);
      }
    };
    fetchHistory();
  }, [profile?.coupleId]);

  const handleAnswer = (value: number) => {
    const currentQuestion = questions[step];
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      submitCheckIn();
    }
  };

  const submitCheckIn = async () => {
    setIsSubmitting(true);
    try {
      const checkInData = {
        coupleId: profile?.coupleId,
        userId: user?.uid,
        answers,
        weekNumber: getWeekNumber(new Date()),
        year: new Date().getFullYear(),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'weekly_checkins'), checkInData);
      setIsCompleted(true);
      generateAiInsight(answers);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'weekly_checkins');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAiInsight = async (currentAnswers: any) => {
    setIsGeneratingInsight(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze these relationship check-in scores (1-5 scale) for a couple and provide a warm, insightful summary in Hebrew. 
      Scores: ${JSON.stringify(currentAnswers)}. 
      Previous history trends: ${JSON.stringify(history.map(h => h.answers))}.
      Provide 3 actionable tips for the next week.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

      setAiInsight(response.text);
    } catch (error) {
      console.error("Error generating AI insight:", error);
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  if (isCompleted) {
    return (
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-3xl shadow-sm border border-brand-gold/10 text-center"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <Check className="text-emerald-600" size={40} />
          </div>
          <h3 className="text-3xl font-serif mb-4">הצ'ק-אין הושלם!</h3>
          <p className="text-brand-black/60 max-w-xs mx-auto mb-8">
            תודה ששיתפתם. המידע הזה עוזר לנו להתאים לכם את החוויה הטובה ביותר.
          </p>

          <AnimatePresence mode="wait">
            {isGeneratingInsight ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center gap-4"
              >
                <Loader2 className="animate-spin text-brand-gold" size={32} />
                <p className="text-xs text-brand-black/40 uppercase tracking-widest font-bold">הבינה המלאכותית מנתחת את התשובות שלכם...</p>
              </motion.div>
            ) : aiInsight ? (
              <motion.div 
                key="insight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-brand-cream/30 p-8 rounded-2xl text-right space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="text-brand-gold" size={20} />
                  <h4 className="text-lg font-serif">תובנות השבוע שלכם</h4>
                </div>
                <div className="prose prose-sm text-brand-black/80 leading-relaxed">
                  {aiInsight.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        {/* History Chart Placeholder */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-gold/10">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="text-brand-gold" size={24} />
            <h3 className="text-lg font-serif">מגמות לאורך זמן</h3>
          </div>
          <div className="h-48 flex items-end justify-around gap-2">
            {[60, 80, 45, 90, 75].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-brand-gold/20 rounded-t-lg relative group"
                >
                  <div className="absolute inset-0 bg-brand-gold opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                </motion.div>
                <span className="text-[8px] font-bold text-brand-black/40 uppercase">שבוע {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ClipboardCheck className="text-brand-gold" size={32} />
        </div>
        <h2 className="text-3xl font-serif mb-2">צ'ק-אין שבועי</h2>
        <p className="text-brand-black/60">בואו נראה איך עבר השבוע שלכם יחד</p>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-sm border border-brand-gold/10 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-cream">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
            className="h-full bg-brand-gold"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-brand-gold/5 rounded-2xl">
                {React.createElement(questions[step].icon, { size: 40, className: "text-brand-gold" })}
              </div>
              <h3 className="text-2xl font-serif text-brand-black">{questions[step].text}</h3>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((val) => (
                <motion.button
                  key={val}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(val)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-brand-cream/20 hover:bg-brand-gold/10 transition-all border border-transparent hover:border-brand-gold/20"
                >
                  <span className="text-2xl font-serif text-brand-black">{val}</span>
                  <span className="text-[8px] uppercase tracking-widest font-bold text-brand-black/40">
                    {val === 1 ? 'חלש' : val === 5 ? 'מדהים' : ''}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-brand-black/40">
          <span>שאלה {step + 1} מתוך {questions.length}</span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i === step ? "bg-brand-gold" : i < step ? "bg-brand-gold/40" : "bg-brand-cream"
              )} />
            ))}
          </div>
        </div>
      </div>

      {/* History Preview */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-brand-cream/30 p-6 rounded-2xl flex items-center gap-4">
          <Calendar size={20} className="text-brand-gold" />
          <div>
            <p className="text-[8px] uppercase tracking-widest font-bold text-brand-black/40">צ'ק-אין אחרון</p>
            <p className="text-sm font-serif text-brand-black">לפני 7 ימים</p>
          </div>
        </div>
        <div className="bg-brand-cream/30 p-6 rounded-2xl flex items-center gap-4">
          <TrendingUp size={20} className="text-brand-gold" />
          <div>
            <p className="text-[8px] uppercase tracking-widest font-bold text-brand-black/40">רצף נוכחי</p>
            <p className="text-sm font-serif text-brand-black">4 שבועות</p>
          </div>
        </div>
      </div>
    </div>
  );
};

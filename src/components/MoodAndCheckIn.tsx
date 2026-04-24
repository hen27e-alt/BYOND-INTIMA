import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Activity, Heart, ChevronRight, ChevronLeft, Loader2, ClipboardCheck, MessageCircle, Star, Send, Sparkles } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { ConnectionPulse } from './ConnectionPulse';

const MOODS = [
  { id: 1, label: 'מותש/ת', icon: '😫', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
  { id: 2, label: 'עייפ/ה', icon: '😴', color: 'bg-orange-500/20 text-orange-500 border-orange-500/30' },
  { id: 3, label: 'בסדר', icon: '😐', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  { id: 4, label: 'טוב', icon: '😊', color: 'bg-green-500/20 text-green-500 border-green-500/30' },
  { id: 5, label: 'מעולה!', icon: '🤩', color: 'bg-brand-gold/20 text-brand-gold border-brand-gold/30' }
];

const CHECKIN_QUESTIONS = [
  { id: 'appreciation', question: 'מה הדבר שאת/ה הכי מעריכ/ה בבן/בת הזוג מהשבוע האחרון?', icon: Heart },
  { id: 'challenge', question: 'מה היה הרגע המאתגר ביותר עבורך השבוע?', icon: Star },
  { id: 'need', question: 'מה הדבר שאת/ה הכי זקוק/ה לו ממני בשבוע הבא?', icon: MessageCircle },
  { id: 'goal', question: 'מה יעד אחד שתרצה/י שנגשים יחד בשבוע הקרוב?', icon: Sparkles }
];

const getWeekNumber = (d: Date) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
};

export const MoodAndCheckIn = () => {
  const { user, profile, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState<'mood' | 'checkin'>('mood');
  
  // Mood State
  const [pulses, setPulses] = useState<any[]>([]);
  const [isMoodLoading, setIsMoodLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // CheckIn State
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isCheckInLoading, setIsCheckInLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!profile?.coupleId) {
      setIsMoodLoading(false);
      setIsCheckInLoading(false);
      return;
    }

    // Fetch Moods
    const moodQuery = query(
      collection(db, 'connection_pulse'),
      where('coupleId', '==', profile.coupleId)
    );

    const unsubscribeMood = onSnapshot(moodQuery, (snap) => {
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setPulses(list);
      setIsMoodLoading(false);
    }, (error) => {
      console.error("Error fetching mood tracker data:", error);
      setIsMoodLoading(false);
      handleFirestoreError(error, OperationType.GET, 'connection_pulse');
    });

    // Fetch CheckIn
    const checkCompletion = async () => {
      const now = new Date();
      const weekNumber = getWeekNumber(now);
      const year = now.getFullYear();

      const checkInQuery = query(
        collection(db, 'weekly_checkins'),
        where('coupleId', '==', profile.coupleId)
      );

      try {
        const snap = await getDocs(checkInQuery);
        let completed = false;
        snap.forEach(doc => {
          const data = doc.data();
          if (data.userId === user?.uid && data.weekNumber === weekNumber && data.year === year) {
            completed = true;
          }
        });
        if (completed) {
          setHasCompleted(true);
        }
      } catch (error) {
        console.error("Error fetching weekly check-in:", error);
        handleFirestoreError(error, OperationType.GET, 'weekly_checkins');
      } finally {
        setIsCheckInLoading(false);
      }
    };

    checkCompletion();

    return () => unsubscribeMood();
  }, [profile?.coupleId, loading, user?.uid]);

  // Mood Functions
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  // CheckIn Functions
  const handleNext = () => {
    if (step < CHECKIN_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      submitCheckIn();
    }
  };

  const submitCheckIn = async () => {
    if (!user || !profile?.coupleId) return;
    setIsSubmitting(true);
    
    try {
      const now = new Date();
      await addDoc(collection(db, 'weekly_checkins'), {
        coupleId: profile.coupleId,
        userId: user.uid,
        answers,
        weekNumber: getWeekNumber(now),
        year: now.getFullYear(),
        createdAt: serverTimestamp()
      });
      setHasCompleted(true);
    } catch (error) {
      console.error("Error submitting check-in:", error);
      handleFirestoreError(error, OperationType.CREATE, 'weekly_checkins');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isMoodLoading || isCheckInLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Tabs */}
      <div className="flex justify-center gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('mood')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-serif transition-all ${
            activeTab === 'mood' 
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' 
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Activity size={20} /> מעקב מצב רוח
        </button>
        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-serif transition-all ${
            activeTab === 'checkin' 
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' 
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <ClipboardCheck size={20} /> צ'ק אין שבועי
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'mood' ? (
          <motion.div
            key="mood"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <ConnectionPulse />

            <div className="text-center mt-12">
              <h3 className="text-2xl font-serif text-white flex items-center justify-center gap-3">
                <CalendarIcon className="text-brand-gold" /> היסטוריית מצב רוח
              </h3>
              <p className="text-white/40 italic mt-2">הדופק הרגשי שלכם לאורך החודש.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-8">
                <button onClick={nextMonth} className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full">
                  <ChevronRight size={24} />
                </button>
                <h3 className="text-2xl font-serif text-white">
                  {currentMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={prevMonth} className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-full">
                  <ChevronLeft size={24} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
                  <div key={day} className="text-center text-white/40 text-sm font-bold">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-white/5 border border-white/5" />
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                  
                  const dayPulses = pulses.filter(p => {
                    if (!p.createdAt || !p.createdAt.toDate) return false;
                    const pDate = p.createdAt.toDate?.() || new Date(0);
                    return pDate.getFullYear() === currentMonth.getFullYear() &&
                           pDate.getMonth() === currentMonth.getMonth() &&
                           pDate.getDate() === day;
                  });

                  const myPulse = dayPulses.find(p => p.userId === user?.uid);
                  const partnerPulse = dayPulses.find(p => p.userId !== user?.uid);

                  return (
                    <div key={day} className="aspect-square rounded-2xl bg-white/5 border border-white/10 p-1 flex flex-col items-center justify-between group hover:bg-white/10 transition-colors relative">
                      <span className="text-xs text-white/40 font-mono">{day}</span>
                      <div className="flex gap-1">
                        {myPulse && (
                          <div className="text-sm" title={`שלי: ${MOODS.find(m => m.id === myPulse.moodId)?.label}`}>
                            {MOODS.find(m => m.id === myPulse.moodId)?.icon}
                          </div>
                        )}
                        {partnerPulse && (
                          <div className="text-sm opacity-60" title={`בן/בת הזוג: ${MOODS.find(m => m.id === partnerPulse.moodId)?.label}`}>
                            {MOODS.find(m => m.id === partnerPulse.moodId)?.icon}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="checkin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {hasCompleted ? (
              <div className="text-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClipboardCheck size={48} className="text-green-500" />
                </div>
                <h3 className="text-3xl font-serif text-white mb-4">הצ'ק אין הושלם!</h3>
                <p className="text-white/60">כל הכבוד על ההשקעה בזוגיות שלכם. נתראה בשבוע הבא!</p>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                <div className="flex">
                  {CHECKIN_QUESTIONS.map((q, idx) => (
                    <div key={q.id} className="flex-1 h-2 bg-white/10">
                      <motion.div 
                        className="h-full bg-brand-gold"
                        initial={{ width: 0 }}
                        animate={{ width: idx <= step ? '100%' : '0%' }}
                      />
                    </div>
                  ))}
                </div>

                <div className="p-12">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-center space-y-8"
                    >
                      <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold">
                        {React.createElement(CHECKIN_QUESTIONS[step].icon, { size: 40 })}
                      </div>
                      
                      <h3 className="text-3xl font-serif text-white leading-tight">
                        {CHECKIN_QUESTIONS[step].question}
                      </h3>

                      <textarea
                        value={answers[CHECKIN_QUESTIONS[step].id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [CHECKIN_QUESTIONS[step].id]: e.target.value })}
                        placeholder="כתבו כאן את התשובה שלכם..."
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white focus:outline-none focus:border-brand-gold/50 min-h-[150px] text-right text-lg"
                        autoFocus
                      />

                      <div className="flex justify-between items-center pt-8">
                        <button
                          onClick={() => setStep(Math.max(0, step - 1))}
                          className={`text-white/40 hover:text-white transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                        >
                          חזור
                        </button>
                        
                        <button
                          onClick={handleNext}
                          disabled={!answers[CHECKIN_QUESTIONS[step].id] || isSubmitting}
                          className="px-8 py-4 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg shadow-lg shadow-brand-gold/20"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                            <>
                              {step === CHECKIN_QUESTIONS.length - 1 ? 'סיום ושליחה' : 'המשך'}
                              <Send size={20} className="mr-2" />
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

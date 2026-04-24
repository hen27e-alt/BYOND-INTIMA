import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Gift, HandMetal, Clock, Sparkles, RefreshCw, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const QUESTIONS = [
  {
    id: 1,
    question: 'מה גורם לך להרגיש הכי אהוב/ה?',
    options: [
      { id: 'words', label: 'כשבן/בת הזוג אומרים לי כמה הם מעריכים אותי', icon: MessageCircle },
      { id: 'acts', label: 'כשבן/בת הזוג עושים עבורי משהו שעוזר לי (כמו לשטוף כלים)', icon: Award },
      { id: 'gifts', label: 'כשבן/בת הזוג מפתיעים אותי עם מתנה קטנה ומתחשבת', icon: Gift },
      { id: 'time', label: 'כשבן/בת הזוג מקדישים לי זמן איכות ללא הסחות דעת', icon: Clock },
      { id: 'touch', label: 'כשבן/בת הזוג מחבקים אותי או מחזיקים לי את היד', icon: HandMetal }
    ]
  },
  {
    id: 2,
    question: 'מה הכי חסר לך כשאת/ה מרגיש/ה מרוחק/ת?',
    options: [
      { id: 'words', label: 'מילים טובות וחיזוקים', icon: MessageCircle },
      { id: 'acts', label: 'עזרה ותמיכה במטלות היומיום', icon: Award },
      { id: 'gifts', label: 'תשומת לב חומרית קטנה', icon: Gift },
      { id: 'time', label: 'זמן שקט רק שנינו', icon: Clock },
      { id: 'touch', label: 'מגע פיזי וקרבה', icon: HandMetal }
    ]
  },
  {
    id: 3,
    question: 'איזו מחווה תגרום לך לחייך אחרי יום ארוך?',
    options: [
      { id: 'words', label: '"אני כל כך גאה בך על איך שהתמודדת היום"', icon: MessageCircle },
      { id: 'acts', label: '"אל תדאג/י, כבר טיפלתי בכל הסידורים להערב"', icon: Award },
      { id: 'gifts', label: '"ראיתי את זה וחשבתי עליך, אז קניתי לך"', icon: Gift },
      { id: 'time', label: '"בוא/י נשב רגע בשקט, רק שנינו, ונדבר"', icon: Clock },
      { id: 'touch', label: 'חיבוק ארוך וחם בלי לומר מילה', icon: HandMetal }
    ]
  },
  {
    id: 4,
    question: 'מה הכי חשוב לך ביום ההולדת שלך?',
    options: [
      { id: 'words', label: 'ברכה מרגשת ומושקעת מהלב', icon: MessageCircle },
      { id: 'acts', label: 'שבן/בת הזוג יארגנו הכל וידאגו לכל הפרטים', icon: Award },
      { id: 'gifts', label: 'מתנה מיוחדת שחיכיתי לה הרבה זמן', icon: Gift },
      { id: 'time', label: 'יום שלם שמוקדש רק לחגיגה המשותפת שלנו', icon: Clock },
      { id: 'touch', label: 'הרבה קרבה פיזית, נשיקות וחיבוקים לאורך היום', icon: HandMetal }
    ]
  },
  {
    id: 5,
    question: 'איך את/ה מעדיף/ה לקבל תמיכה בתקופה לחוצה?',
    options: [
      { id: 'words', label: 'שיגידו לי שאני חזק/ה ושנעבור את זה יחד', icon: MessageCircle },
      { id: 'acts', label: 'שיורידו ממני עומס ויעשו דברים במקומי', icon: Award },
      { id: 'gifts', label: 'שיביאו לי משהו קטן שיעשה לי טוב על הלב', icon: Gift },
      { id: 'time', label: 'שפשוט יהיו שם איתי, גם אם רק בשקט', icon: Clock },
      { id: 'touch', label: 'מגע מרגיע, עיסוי בכתפיים או ליטוף', icon: HandMetal }
    ]
  }
];

const LANGUAGES = {
  words: { title: 'מילות חיזוק (Words of Affirmation)', description: 'עבורך, מילים חזקות יותר ממעשים. מחמאות, הערכה ומילות אהבה הן הדרך המהירה ביותר ללב שלך.', tips: ['כתבו פתקי אהבה קטנים', 'החמיאו על דברים ספציפיים', 'אמרו "אני אוהב/ת אותך" לעיתים קרובות'] },
  acts: { title: 'מעשי שירות (Acts of Service)', description: 'עבורך, מעשים מדברים חזק יותר ממילים. כשבן/בת הזוג עוזרים לך במטלות או עושים משהו כדי להקל עליך, זה מרגיש כמו אהבה אמיתית.', tips: ['עזרו במטלות הבית ללא בקשה', 'הכינו ארוחת ערב בהפתעה', 'טפלו בסידור מעיק עבורם'] },
  gifts: { title: 'קבלת מתנות (Receiving Gifts)', description: 'עבורך, מתנה היא סמל למחשבה. זה לא קשור למחיר, אלא לעובדה שמישהו חשב עליך ובחר משהו במיוחד עבורך.', tips: ['הביאו פרח בדרך הביתה', 'קנו משהו קטן שהם הזכירו שחסר להם', 'הכינו מתנה בעבודת יד'] },
  time: { title: 'זמן איכות (Quality Time)', description: 'עבורך, תשומת לב מלאה היא המפתח. זמן שבו הטלפונים בצד ואתם פשוט נוכחים אחד עבור השנייה הוא הזמן היקר ביותר.', tips: ['צאו לטיול ללא טלפונים', 'קבעו דייט שבועי קבוע', 'הקשיבו באמת למה שעבר עליהם היום'] },
  touch: { title: 'מגע פיזי (Physical Touch)', description: 'עבורך, קרבה פיזית היא הדרך העיקרית לתקשר אהבה. חיבוק, נשיקה או סתם ישיבה קרובה על הספה גורמים לך להרגיש בטוח/ה ואהוב/ה.', tips: ['החזיקו ידיים בזמן הליכה', 'תנו חיבוק ארוך כשנפגשים', 'שבו קרוב אחד לשנייה בזמן צפייה בסרט'] }
};

export const LoveLanguageQuiz = () => {
  const { user, profile } = useFirebase();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    words: 0, acts: 0, gifts: 0, time: 0, touch: 0
  });
  const [result, setResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOptionSelect = (langId: string) => {
    const newScores = { ...scores, [langId]: scores[langId] + 1 };
    setScores(newScores);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = async (finalScores: Record<string, number>) => {
    const topLang = Object.entries(finalScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const langInfo = LANGUAGES[topLang as keyof typeof LANGUAGES];
    setResult(langInfo);

    if (user) {
      setIsSaving(true);
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          loveLanguage: langInfo.title
        });
      } catch (error) {
        console.error("Error saving love language:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const reset = () => {
    setStep(0);
    setScores({ words: 0, acts: 0, gifts: 0, time: 0, touch: 0 });
    setResult(null);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 max-w-2xl mx-auto shadow-2xl">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <span className="text-brand-gold text-xs tracking-[0.3em] uppercase mb-2 block">שאלה {step + 1} מתוך {QUESTIONS.length}</span>
              <h2 className="text-3xl font-serif text-white">{QUESTIONS[step].question}</h2>
            </div>

            <div className="grid gap-4">
              {QUESTIONS[step].options.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-brand-gold hover:text-black transition-all group text-right rtl"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center group-hover:bg-black/10">
                      <Icon size={24} />
                    </div>
                    <span className="text-lg font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="text-center">
              <div className="inline-flex p-4 bg-brand-gold/10 rounded-full text-brand-gold mb-6">
                <Heart size={48} fill="currentColor" />
              </div>
              <h2 className="text-xs tracking-[0.4em] uppercase text-brand-gold mb-2">שפת האהבה שלך היא:</h2>
              <h3 className="text-4xl font-serif text-white mb-6">{result.title}</h3>
              <p className="text-white/60 leading-relaxed text-lg italic">
                "{result.description}"
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6">
              <div className="flex items-center gap-3 text-brand-gold">
                <Sparkles size={20} />
                <h4 className="font-bold uppercase tracking-wider text-sm">טיפים לבן/בת הזוג</h4>
              </div>
              <ul className="grid gap-4">
                {result.tips.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-4 text-white/80">
                    <div className="w-6 h-6 rounded-full bg-brand-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-brand-gold text-xs font-bold">{i + 1}</span>
                    </div>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={reset}
                className="flex-1 py-4 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> בצעו שוב
              </button>
              <button
                className="flex-1 py-4 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={18} /> שתפו עם הפרטנר
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

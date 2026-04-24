import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, MapPin, Zap, Sparkles, RefreshCw, Heart, MessageCircle, Film, Utensils, Video } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';

const QUESTIONS = [
  {
    id: 'time',
    question: 'date.generator.q.time',
    options: [
      { id: 'quick', label: 'date.generator.opt.quick', icon: Clock },
      { id: 'standard', label: 'date.generator.opt.standard', icon: Calendar },
      { id: 'marathon', label: 'date.generator.opt.marathon', icon: Zap }
    ]
  },
  {
    id: 'location',
    question: 'date.generator.q.location',
    options: [
      { id: 'home', label: 'date.generator.opt.home', icon: MapPin },
      { id: 'out', label: 'date.generator.opt.out', icon: MapPin }
    ]
  },
  {
    id: 'energy',
    question: 'date.generator.q.energy',
    options: [
      { id: 'chill', label: 'date.generator.opt.chill', icon: Heart },
      { id: 'active', label: 'date.generator.opt.active', icon: Zap }
    ]
  },
  {
    id: 'mood',
    question: 'date.generator.q.mood',
    options: [
      { id: 'romantic', label: 'date.generator.opt.romantic', icon: Heart },
      { id: 'playful', label: 'date.generator.opt.playful', icon: Sparkles },
      { id: 'deep', label: 'date.generator.opt.deep', icon: MessageCircle }
    ]
  }
];

export const DateGenerator = () => {
  const { profile } = useFirebase();
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleOptionSelect = (optionId: string) => {
    const currentQuestionId = QUESTIONS[step].id;
    const newAnswers = { ...answers, [currentQuestionId]: optionId };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      generatePlan(newAnswers);
    }
  };

  const languageNames: Record<string, string> = {
    he: 'Hebrew',
    en: 'English',
    ru: 'Russian',
    ar: 'Arabic',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian'
  };

  const generatePlan = async (finalAnswers: Record<string, string>) => {
    setIsGenerating(true);
    
    try {
      let pastPlansContext = "";
      if (profile?.coupleId) {
        const q = query(
          collection(db, 'date_plans'),
          where('coupleId', '==', profile.coupleId),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const pastPlans = querySnapshot.docs.map(doc => doc.data().title);
        if (pastPlans.length > 0) {
          pastPlansContext = `Past date plans we've done: ${pastPlans.join(', ')}. Please suggest something different and unique.`;
        }
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const targetLang = languageNames[language] || 'English';

      const locationContext = profile?.location 
        ? (typeof profile.location === 'object' 
            ? `User Location: Latitude ${profile.location.lat}, Longitude ${profile.location.lng}.`
            : `User Location: ${profile.location}.`)
        : "";
      const timezoneContext = profile?.timezone ? `User Timezone: ${profile.timezone}.` : "";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Plan a romantic date for a couple. 
        Time: ${finalAnswers.time}, 
        Location: ${finalAnswers.location}, 
        Energy: ${finalAnswers.energy}, 
        Mood: ${finalAnswers.mood}.
        Language: ${targetLang}.
        ${locationContext}
        ${timezoneContext}
        ${pastPlansContext}`,
        config: {
          systemInstruction: `You are a luxury romantic date planner. Create a unique, creative, and romantic date plan in ${targetLang} based on the user's constraints and location. If location is provided, suggest activities or places that would be relevant to that area (e.g. if they are in a city, suggest city-based activities). Return ONLY a valid JSON object.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A catchy title for the date" },
              activities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 specific activities for the date" },
              movie: { type: Type.STRING, description: "A movie or show recommendation" },
              questions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2 deep conversation starter questions" }
            },
            required: ["title", "activities", "movie", "questions"]
          }
        }
      });

      const plan = JSON.parse(response.text?.trim() || "{}");
      setResult(plan);

      // Save to Firestore if user is logged in
      if (profile?.coupleId) {
        try {
          await addDoc(collection(db, 'date_plans'), {
            coupleId: profile.coupleId,
            ...plan,
            answers: finalAnswers,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.error("Error saving date plan:", error);
        }
      }
    } catch (error) {
      console.error("Error generating date plan:", error);
      // Fallback
      setResult({
        title: 'ערב של חיבור ספונטני',
        activities: ['טיול קצר מתחת לבית', 'שיחה עמוקה לאור נרות'],
        movie: 'סרט דרמה מרגש',
        questions: ['מה הרגע שהכי זכור לך מהדייט הראשון שלנו?', 'איך אנחנו יכולים להפוך את השבוע הבא ליותר טוב עבורנו?']
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setVideoUrl(null);
  };

  const generateVideoTeaser = async () => {
    if (!result || !window.aistudio) return;
    
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
      return;
    }

    setIsVideoGenerating(true);
    try {
      const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      let operation = await veoAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A cinematic, romantic, and exciting teaser trailer for a couple's date night. Theme: ${result.title}. Activities: ${result.activities.join(', ')}. High quality, 4k, beautiful lighting.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await veoAi.operations.getVideosOperation({operation: operation});
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setVideoUrl(downloadLink);
      }
    } catch (error) {
      console.error("Error generating video:", error);
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const addToCalendar = () => {
    if (!result) return;
    
    const startDate = new Date();
    startDate.setHours(20, 0, 0, 0); // Default to 8 PM today
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours later

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${result.title}
DESCRIPTION:פעילויות:\\n${result.activities.join('\\n')}\\n\\nסרט:\\n${result.movie}\\n\\nשאלות לשיח:\\n${result.questions.join('\\n')}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'date-night.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 max-w-2xl mx-auto shadow-2xl">
      <AnimatePresence mode="wait">
        {!result && !isGenerating ? (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <span className="text-brand-gold text-xs tracking-[0.3em] uppercase mb-2 block">{t('date.generator.step')} {step + 1} {t('date.generator.of')} {QUESTIONS.length}</span>
              <h2 className="text-3xl font-serif text-white">{t(QUESTIONS[step].question)}</h2>
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
                    <span className="text-lg font-medium">{t(option.label)}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            <div className="relative">
              <Loader2 size={64} className="text-brand-gold animate-spin" />
              <Sparkles size={24} className="text-brand-gold absolute -top-2 -right-2 animate-pulse" />
            </div>
            <p className="text-brand-gold/60 font-serif italic text-lg tracking-wide">{t('date.generator.generating')}</p>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="text-center">
              <div className="inline-flex p-3 bg-brand-gold/10 rounded-full text-brand-gold mb-4">
                <Sparkles size={32} />
              </div>
              <h2 className="text-4xl font-serif text-white mb-2">{result.title}</h2>
              <p className="text-white/40 italic">{language === 'he' ? 'הנה התוכנית שלכם להערב:' : 'Here is your plan for tonight:'}</p>
            </div>

            <div className="grid gap-6">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-brand-gold">
                  <Utensils size={20} />
                  <h3 className="font-bold uppercase tracking-wider text-sm">{language === 'he' ? 'פעילויות' : 'Activities'}</h3>
                </div>
                <ul className="space-y-2">
                  {result.activities.map((act: string, i: number) => (
                    <li key={i} className="text-white/80 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                      {act}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-brand-gold">
                  <Film size={20} />
                  <h3 className="font-bold uppercase tracking-wider text-sm">{language === 'he' ? 'המלצת צפייה' : 'Watch Recommendation'}</h3>
                </div>
                <p className="text-white/80">{result.movie}</p>
              </div>

              <div className="bg-brand-gold/10 border border-brand-gold/20 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-brand-gold">
                  <MessageCircle size={20} />
                  <h3 className="font-bold uppercase tracking-wider text-sm">{language === 'he' ? 'שאלות לשיח' : 'Conversation Starters'}</h3>
                </div>
                <div className="space-y-3">
                  {result.questions.map((q: string, i: number) => (
                    <p key={i} className="text-white/90 italic font-serif">"{q}"</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={reset}
                className="flex-1 py-4 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> {t('date.generator.reset')}
              </button>
              <button
                onClick={addToCalendar}
                className="flex-1 py-4 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all flex items-center justify-center gap-2"
              >
                <Calendar size={18} /> {t('date.generator.calendar')}
              </button>
            </div>
            
            {!videoUrl ? (
              <button
                onClick={generateVideoTeaser}
                disabled={isVideoGenerating}
                className="w-full py-4 bg-brand-black border border-brand-gold/30 text-brand-gold rounded-full font-bold hover:bg-brand-gold/10 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isVideoGenerating ? (
                  <><Loader2 size={18} className="animate-spin" /> מייצר טיזר וידאו לדייט...</>
                ) : (
                  <><Video size={18} /> צור טיזר וידאו לדייט (Veo)</>
                )}
              </button>
            ) : (
              <div className="mt-6 rounded-2xl overflow-hidden border border-brand-gold/30 aspect-video bg-black">
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Loader2 = ({ size, className }: { size: number, className?: string }) => (
  <RefreshCw size={size} className={className} />
);

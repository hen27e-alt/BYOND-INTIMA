import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Heart, Star, Calendar, Loader2, TrendingUp, Award, MessageCircle, Camera, Sparkles, Music, Play, ChevronRight, ChevronLeft } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAlert } from './AlertModal';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';

export const MonthlyStats = () => {
  const { profile } = useFirebase();
  const { showAlert } = useAlert();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.coupleId) return;

      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch counts for current month
        const collections = ['memories', 'date_plans', 'weekly_checkins', 'bucket_list'];
        const results: any = {};

        for (const col of collections) {
          const q = query(
            collection(db, col),
            where('coupleId', '==', profile.coupleId)
          );
          const snap = await getDocs(q);
          let count = 0;
          snap.forEach(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate();
            if (createdAt && createdAt >= startOfMonth) {
              count++;
            }
          });
          results[col] = count;
        }

        setStats(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [profile?.coupleId]);

  const generateInsights = async () => {
    if (!stats) return;
    setIsGeneratingInsights(true);
    setCurrentSlide(0);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
      You are an AI creating a "Spotify Wrapped" style relationship summary for a couple.
      Here are their stats for this month:
      - New Memories Created: ${stats.memories}
      - Date Plans Made: ${stats.date_plans}
      - Deep Conversations (Check-ins): ${stats.weekly_checkins}
      - Bucket List Items Achieved: ${stats.bucket_list}
      - Total Gold Points: ${profile?.points || 0}

      Create a fun, engaging, and romantic 4-slide presentation in Hebrew.
      Return ONLY a JSON array of 4 objects. Each object should have:
      - "title": A catchy title for the slide (e.g., "חודש של הרפתקאות")
      - "subtitle": A short, punchy subtitle
      - "description": A 2-3 sentence romantic and fun description of their activity.
      - "award": A funny or sweet title/award for them this month (e.g., "אלופי הדייטים", "הרומנטיקנים של השנה")
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text || '[]');
      setAiInsights(result);
    } catch (error) {
      console.error("Failed to generate insights", error);
      showAlert("אירעה שגיאה ביצירת הסיכום. נסו שוב.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const nextSlide = () => {
    if (aiInsights && currentSlide < aiInsights.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" /></div>;

  const cards = [
    { title: 'זכרונות חדשים', value: stats?.memories || 0, icon: Camera, color: 'text-blue-400' },
    { title: 'דייטים שתוכננו', value: stats?.date_plans || 0, icon: Calendar, color: 'text-brand-gold' },
    { title: 'שיחות עומק', value: stats?.weekly_checkins || 0, icon: MessageCircle, color: 'text-pink-400' },
    { title: 'יעדים שהוגשמו', value: stats?.bucket_list || 0, icon: Star, color: 'text-emerald-400' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center flex flex-col items-center justify-center">
        <h2 className="text-3xl font-serif text-white flex items-center justify-center gap-3">
          <BarChart3 className="text-brand-gold" /> סיכום הפעילות החודשי
        </h2>
        <p className="text-white/40 italic mt-2">מבט על כל מה שבנינו יחד החודש.</p>
        
        {!aiInsights && (
          <button
            onClick={generateInsights}
            disabled={isGeneratingInsights}
            className="mt-6 px-8 py-3 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all shadow-lg shadow-brand-gold/20 flex items-center gap-2"
          >
            {isGeneratingInsights ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            צור חוויית "Wrapped" אישית
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {aiInsights && aiInsights.length > 0 ? (
          <motion.div
            key="wrapped-view"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-gradient-to-br from-brand-gold/20 to-black/80 border border-brand-gold/30 rounded-[40px] overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-12 text-center"
          >
            {/* Progress Bars */}
            <div className="absolute top-6 left-12 right-12 flex gap-2">
              {aiInsights.map((_: any, idx: number) => (
                <div key={idx} className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-gold"
                    initial={{ width: 0 }}
                    animate={{ width: idx <= currentSlide ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              ))}
            </div>

            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 max-w-2xl"
            >
              <div className="inline-block px-4 py-1 bg-brand-gold/20 text-brand-gold rounded-full text-sm font-bold tracking-widest uppercase mb-4">
                {aiInsights[currentSlide].award}
              </div>
              <h3 className="text-5xl font-serif text-white leading-tight">
                {aiInsights[currentSlide].title}
              </h3>
              <p className="text-2xl text-brand-gold font-medium">
                {aiInsights[currentSlide].subtitle}
              </p>
              <p className="text-xl text-white/80 leading-relaxed">
                {aiInsights[currentSlide].description}
              </p>
            </motion.div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
              
              <button
                onClick={() => setAiInsights(null)}
                className="text-white/40 hover:text-white text-sm uppercase tracking-widest"
              >
                סגור מצגת
              </button>

              <button
                onClick={nextSlide}
                disabled={currentSlide === aiInsights.length - 1}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stats-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] text-center space-y-4 hover:bg-white/10 transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto ${card.color}`}>
                    <card.icon size={24} />
                  </div>
                  <p className="text-4xl font-serif text-white">{card.value}</p>
                  <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{card.title}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] space-y-8">
                <h3 className="text-2xl font-serif text-white flex items-center gap-3 justify-end">
                  מדד החיבור <TrendingUp className="text-brand-gold" />
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/40 uppercase tracking-widest">
                      <span>{Math.min((profile?.points || 0) / 10, 100)}%</span>
                      <span>רמת אינטימיות</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((profile?.points || 0) / 10, 100)}%` }}
                        className="h-full bg-brand-gold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/40 uppercase tracking-widest">
                      <span>{Math.min((Array.isArray(profile?.missionsCompleted) ? profile.missionsCompleted.length : 0) * 10, 100)}%</span>
                      <span>עשייה משותפת</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((Array.isArray(profile?.missionsCompleted) ? profile.missionsCompleted.length : 0) * 10, 100)}%` }}
                        className="h-full bg-brand-gold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brand-gold/10 border border-brand-gold/20 p-10 rounded-[40px] flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-brand-gold rounded-full flex items-center justify-center text-black shadow-2xl shadow-brand-gold/40">
                  <Award size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-brand-gold mb-2">זוג החודש!</h3>
                  <p className="text-black/60 italic text-sm">המשכתם להשקיע, להקשיב ולצמוח. כל הכבוד לכם!</p>
                </div>
                <div className="flex items-center gap-2 text-brand-gold font-bold">
                  <Heart size={20} fill="currentColor" />
                  <span>{profile?.points || 0} נקודות שנצברו</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

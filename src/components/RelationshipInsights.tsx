import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Heart, Zap, Loader2, RefreshCw, ChevronRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useFirebase } from '../contexts/FirebaseContext';

export const RelationshipInsights = () => {
  const { profile } = useFirebase();
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState<number>(85);

  const generateInsight = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        You are a relationship expert for "Beyond Together", a premium platform for couples.
        Analyze the following couple's progress and provide a short, sophisticated, and inspiring insight in Hebrew.
        
        Couple Stats:
        - Points: ${profile?.progress?.totalPoints || 0}
        - Cooked Recipes: ${profile?.progress?.cookedCount || 0}
        - Movies Watched: ${profile?.progress?.watchedMoviesCount || 0}
        - Riddles Solved: ${profile?.progress?.solvedRiddlesCount || 0}
        
        The insight should:
        1. Be poetic yet practical.
        2. Focus on emotional connection and shared growth.
        3. Be about 2-3 sentences.
        4. Include a "Relationship Score" (0-100) based on their activity.
        
        Format the response as JSON:
        {
          "text": "The insight text in Hebrew",
          "score": 85,
          "category": "אינטימיות רגשית"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || '{}');
      setInsight(data.text);
      setScore(data.score || 85);
    } catch (error) {
      console.error("Error generating insight:", error);
      setInsight("הקשר שלכם הוא יצירת אמנות בתהליך. כל רגע משותף מוסיף צבע ועומק לסיפור המיוחד שלכם.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!insight && !isLoading) {
      generateInsight();
    }
  }, []);

  return (
    <div className="glass-card p-8 rounded-[40px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-brand-gold/10 transition-colors duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-black text-brand-gold flex items-center justify-center shadow-lg">
              <Brain size={24} />
            </div>
            <div>
              <h3 className="text-xl font-serif text-brand-black">תובנות בינה מלאכותית</h3>
              <p className="text-[10px] uppercase tracking-widest text-brand-black/40 font-bold">ניתוח דינמיקת הקשר</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-3xl font-serif text-brand-gold">{score}%</span>
            <span className="text-[10px] uppercase tracking-widest text-brand-black/40 font-bold">מדד קרבה</span>
          </div>
        </div>

        <div className="min-h-[100px] flex flex-col justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-4 gap-3">
              <Loader2 className="animate-spin text-brand-gold" size={32} />
              <p className="text-sm font-light italic text-brand-black/40 animate-pulse">מנתח את המסע שלכם...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <p className="text-lg font-light leading-relaxed text-brand-black/80 italic text-balance">
                "{insight}"
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-brand-gold/10">
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-brand-gold/10 rounded-full text-[10px] font-bold text-brand-gold uppercase tracking-wider">
                    צמיחה משותפת
                  </div>
                  <div className="px-3 py-1 bg-brand-black/5 rounded-full text-[10px] font-bold text-brand-black/60 uppercase tracking-wider">
                    רמה 3
                  </div>
                </div>
                
                <button 
                  onClick={generateInsight}
                  className="p-2 hover:bg-brand-gold/10 rounded-full transition-colors text-brand-gold"
                  title="רענון תובנה"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

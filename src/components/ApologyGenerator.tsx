import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Heart, RefreshCw, Send, Sparkles, Loader2, Smile, Flag } from 'lucide-react';
import { useAlert } from './AlertModal';
import { GoogleGenAI } from "@google/genai";

export const ApologyGenerator = () => {
  const [currentApology, setCurrentApology] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fightTopic, setFightTopic] = useState('');
  const { showAlert } = useAlert();

  const generateApology = async () => {
    if (!fightTopic.trim()) {
      showAlert('אנא תארו בקצרה על מה רבתם כדי שנוכל לנסח התנצלות מדויקת.', 'חסר מידע');
      return;
    }

    setIsGenerating(true);
    setCurrentApology(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `כתוב הודעת פיוס והתנצלות קצרה, חמודה ומרגשת לבן/בת הזוג שלי. רבנו על: ${fightTopic}. ההודעה צריכה להיות כנה, עם קצת הומור אם מתאים, ולא ארוכה מדי. כתוב בעברית, בגוף ראשון.`,
        config: {
          systemInstruction: "You are an expert relationship mediator and copywriter. Write a sweet, empathetic, and slightly playful apology message in Hebrew. Keep it under 3 sentences. Do not include quotes around the message.",
          temperature: 0.7,
        }
      });
      
      setCurrentApology(response.text?.trim() || "סליחה...");
    } catch (error) {
      console.error("Error generating apology:", error);
      setCurrentApology("אני יודע/ת שטעיתי, אבל תראי/ה איזה חמוד/ה אני כשאני מתנצל/ת 🥺");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!currentApology) return;
    
    const shareData = {
      title: 'הודעת פיוס',
      text: currentApology,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(currentApology);
        showAlert('ההתנצלות הועתקה ללוח! אפשר לשלוח בוואטסאפ.', 'הועתק!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-white flex items-center justify-center gap-3">
          <Flag className="text-brand-gold" /> דגל לבן (מחולל פיוס)
        </h2>
        <p className="text-white/40 italic">רבתם? הכל בסדר. ה-AI שלנו יעזור לכם לשבור את הקרח.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[40px] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 space-y-8">
          <div className="w-24 h-24 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold border border-brand-gold/20">
            <Heart size={40} fill="currentColor" className="animate-pulse" />
          </div>

          <AnimatePresence mode="wait">
            {!currentApology && !isGenerating ? (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-serif text-white">על מה היה הוויכוח?</h3>
                <p className="text-white/60 text-sm">ספרו לנו בקצרה (למשל: "שכחתי לקנות חלב", "הייתי בטלפון בארוחה"), וננסח עבורכם הודעת פיוס מושלמת.</p>
                
                <textarea
                  value={fightTopic}
                  onChange={(e) => setFightTopic(e.target.value)}
                  placeholder="רבנו על..."
                  className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-gold/50 resize-none h-24 text-right"
                  dir="rtl"
                />

                <button
                  onClick={generateApology}
                  className="px-8 py-4 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all shadow-lg shadow-brand-gold/20 flex items-center gap-2 mx-auto"
                >
                  <Sparkles size={20} /> נסח התנצלות
                </button>
              </motion.div>
            ) : isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12"
              >
                <Loader2 size={48} className="text-brand-gold animate-spin mx-auto mb-4" />
                <p className="text-brand-gold/60 font-serif italic">מנסח את המילים הנכונות...</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="p-8 bg-brand-gold/10 border border-brand-gold/20 rounded-3xl relative">
                  <span className="absolute -top-4 -right-4 text-4xl">🕊️</span>
                  <p className="text-2xl font-serif text-brand-gold leading-relaxed italic">
                    "{currentApology}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleSend}
                    className="w-full sm:w-auto px-8 py-4 bg-brand-gold text-black rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg shadow-brand-gold/20"
                  >
                    <Send size={20} /> שלח/י עכשיו
                  </button>
                  <button
                    onClick={() => setCurrentApology(null)}
                    className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/10"
                  >
                    <RefreshCw size={20} /> נסח מחדש
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

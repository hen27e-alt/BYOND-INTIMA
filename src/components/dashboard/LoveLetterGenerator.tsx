import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Send, Sparkles, Loader2, RefreshCw, PenTool } from 'lucide-react';
import { useAlert } from '../AlertModal';
import { GoogleGenAI } from "@google/genai";

const OCCASIONS = [
  { id: 'anniversary', label: 'יום נישואין/חברות' },
  { id: 'birthday', label: 'יום הולדת' },
  { id: 'just_because', label: 'סתם כי בא לי' },
  { id: 'apology', label: 'התנצלות / פיוס' },
];

const TONES = [
  { id: 'romantic', label: 'רומנטי ומרגש' },
  { id: 'funny', label: 'מצחיק וקליל' },
  { id: 'deep', label: 'עמוק ופיוטי' },
  { id: 'short', label: 'קצר וקולע' },
];

export const LoveLetterGenerator = () => {
  const [occasion, setOccasion] = useState(OCCASIONS[0].id);
  const [tone, setTone] = useState(TONES[0].id);
  const [details, setDetails] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { showAlert } = useAlert();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedLetter(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const selectedOccasion = OCCASIONS.find(o => o.id === occasion)?.label;
      const selectedTone = TONES.find(t => t.id === tone)?.label;
      
      const prompt = `כתוב ברכה או מכתב אהבה לבן/בת הזוג שלי. 
      אירוע: ${selectedOccasion}. 
      סגנון/טון: ${selectedTone}. 
      פרטים נוספים שחשוב לשלב: ${details || 'אין פרטים מיוחדים, תהיה יצירתי'}.
      הברכה צריכה להיות בעברית, מרגשת, אישית ולא רובוטית.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert romantic writer and poet. Write a beautiful, personalized love letter or greeting in Hebrew based on the user's inputs. Do not include quotes around the message. Use emojis where appropriate.",
          temperature: 0.8,
        }
      });
      
      setGeneratedLetter(response.text?.trim() || "אוהב/ת אותך המון! ❤️");
    } catch (error) {
      console.error("Error generating letter:", error);
      showAlert('שגיאה', 'לא הצלחנו לכתוב את הברכה, נסו שוב מאוחר יותר.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLetter) return;
    try {
      await navigator.clipboard.writeText(generatedLetter);
      showAlert('הועתק!', 'הברכה הועתקה ללוח, אפשר לשלוח בוואטסאפ.');
    } catch (err) {
      console.error('Error copying:', err);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-2xl mx-auto text-right rtl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-white flex items-center justify-center gap-3 mb-2">
          <PenTool className="text-brand-gold" /> כותב הברכות הווירטואלי
        </h2>
        <p className="text-white/60">צריכים לכתוב ברכה מרגשת ולא מוצאים את המילים? ה-AI שלנו כאן לעזור.</p>
      </div>

      <AnimatePresence mode="wait">
        {!generatedLetter && !isGenerating ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-white/80 mb-3 font-medium">מה חוגגים?</label>
              <div className="grid grid-cols-2 gap-3">
                {OCCASIONS.map(occ => (
                  <button
                    key={occ.id}
                    onClick={() => setOccasion(occ.id)}
                    className={`p-3 rounded-xl border transition-all ${
                      occasion === occ.id 
                        ? 'bg-brand-gold/20 border-brand-gold text-brand-gold' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {occ.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 mb-3 font-medium">איזה סגנון?</label>
              <div className="grid grid-cols-2 gap-3">
                {TONES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`p-3 rounded-xl border transition-all ${
                      tone === t.id 
                        ? 'bg-brand-gold/20 border-brand-gold text-brand-gold' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/80 mb-3 font-medium">פרטים שכדאי להזכיר (אופציונלי)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="למשל: הטיול שלנו לפריז, העובדה שהיא תמיד מכינה לי קפה בבוקר..."
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-gold/50 resize-none h-24"
              />
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-4 bg-brand-gold text-black rounded-xl font-bold hover:bg-white transition-all shadow-lg shadow-brand-gold/20 flex items-center justify-center gap-2"
            >
              <Sparkles size={20} /> צור ברכה
            </button>
          </motion.div>
        ) : isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 size={48} className="text-brand-gold animate-spin" />
            <p className="text-brand-gold/60 font-serif italic text-lg">שולף מילים מהלב...</p>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl relative">
              <Heart className="absolute -top-3 -right-3 text-brand-gold fill-brand-gold" size={24} />
              <p className="text-lg text-white/90 leading-relaxed whitespace-pre-wrap font-serif">
                {generatedLetter}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCopy}
                className="flex-1 py-4 bg-brand-gold text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg shadow-brand-gold/20"
              >
                <Send size={20} /> העתק ושליחה
              </button>
              <button
                onClick={() => setGeneratedLetter(null)}
                className="flex-1 py-4 bg-white/5 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/10"
              >
                <RefreshCw size={20} /> נסה שוב
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

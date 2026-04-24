import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, Loader2, Moon } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const ZODIAC_SIGNS = [
  { id: 'aries', name: 'טלה', icon: '♈' },
  { id: 'taurus', name: 'שור', icon: '♉' },
  { id: 'gemini', name: 'תאומים', icon: '♊' },
  { id: 'cancer', name: 'סרטן', icon: '♋' },
  { id: 'leo', name: 'אריה', icon: '♌' },
  { id: 'virgo', name: 'בתולה', icon: '♍' },
  { id: 'libra', name: 'מאזניים', icon: '♎' },
  { id: 'scorpio', name: 'עקרב', icon: '♏' },
  { id: 'sagittarius', name: 'קשת', icon: '♐' },
  { id: 'capricorn', name: 'גדי', icon: '♑' },
  { id: 'aquarius', name: 'דלי', icon: '♒' },
  { id: 'pisces', name: 'דגים', icon: '♓' },
];

export const AstrologyInsights = () => {
  const [sign1, setSign1] = useState('');
  const [sign2, setSign2] = useState('');
  const [insight, setInsight] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInsight = async () => {
    if (!sign1 || !sign2) return;

    setIsGenerating(true);
    setInsight(null);

    const name1 = ZODIAC_SIGNS.find(s => s.id === sign1)?.name;
    const name2 = ZODIAC_SIGNS.find(s => s.id === sign2)?.name;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `כתוב תחזית זוגית ותובנות התאמה בין מזל ${name1} למזל ${name2}. 
          התמקד בדינמיקה הרומנטית, אתגרים אפשריים, וטיפ שבועי לזוגיות.`,
        config: {
          systemInstruction: "You are an expert relationship astrologer. Provide fun, insightful, and positive relationship astrology readings in Hebrew. Return ONLY a valid JSON object.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              compatibilityScore: { type: Type.NUMBER, description: "Compatibility score from 1 to 100" },
              dynamic: { type: Type.STRING, description: "Description of their romantic dynamic" },
              challenge: { type: Type.STRING, description: "A potential challenge and how to overcome it" },
              weeklyTip: { type: Type.STRING, description: "A specific tip for this week based on their signs" }
            },
            required: ["compatibilityScore", "dynamic", "challenge", "weeklyTip"]
          }
        }
      });

      const data = JSON.parse(response.text?.trim() || "{}");
      setInsight(data);
    } catch (error) {
      console.error("Error generating astrology insight:", error);
      setInsight({
        compatibilityScore: 85,
        dynamic: 'חיבור קוסמי מיוחד של אש ומים.',
        challenge: 'לפעמים יש קצרים בתקשורת, נסו להקשיב יותר.',
        weeklyTip: 'צאו לדייט ספונטני מחוץ לעיר.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-white flex items-center justify-center gap-3">
          <Moon className="text-brand-gold" /> תובנות אסטרולוגיות
        </h2>
        <p className="text-white/40 mt-2">גלו מה הכוכבים מספרים על הדינמיקה הזוגית שלכם השבוע.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm text-white/60 mb-4">המזל שלי</label>
            <div className="grid grid-cols-3 gap-2">
              {ZODIAC_SIGNS.map(sign => (
                <button
                  key={`1-${sign.id}`}
                  onClick={() => setSign1(sign.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    sign1 === sign.id 
                      ? 'bg-brand-gold/20 border-brand-gold text-brand-gold' 
                      : 'bg-black/20 border-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl mb-1">{sign.icon}</div>
                  <div className="text-xs">{sign.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-4">המזל של בן/בת הזוג</label>
            <div className="grid grid-cols-3 gap-2">
              {ZODIAC_SIGNS.map(sign => (
                <button
                  key={`2-${sign.id}`}
                  onClick={() => setSign2(sign.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    sign2 === sign.id 
                      ? 'bg-brand-gold/20 border-brand-gold text-brand-gold' 
                      : 'bg-black/20 border-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl mb-1">{sign.icon}</div>
                  <div className="text-xs">{sign.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center relative z-10">
          <button
            onClick={generateInsight}
            disabled={!sign1 || !sign2 || isGenerating}
            className="px-8 py-4 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all shadow-lg shadow-brand-gold/20 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {isGenerating ? 'קורא בכוכבים...' : 'גלה את התחזית שלנו'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {insight && (
          <motion.div
            key="insight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-1 bg-brand-gold/10 border border-brand-gold/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
              <div className="text-5xl font-serif text-brand-gold mb-2">{insight.compatibilityScore}%</div>
              <div className="text-white/60 text-sm uppercase tracking-widest">התאמה קוסמית</div>
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h4 className="text-brand-gold font-medium mb-2 flex items-center gap-2">
                  <Star size={16} /> הדינמיקה שלכם
                </h4>
                <p className="text-white/80 leading-relaxed text-sm">{insight.dynamic}</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h4 className="text-brand-gold font-medium mb-2 flex items-center gap-2">
                  <Star size={16} /> אתגר וצמיחה
                </h4>
                <p className="text-white/80 leading-relaxed text-sm">{insight.challenge}</p>
              </div>
              
              <div className="bg-brand-gold/5 border border-brand-gold/10 rounded-2xl p-6">
                <h4 className="text-brand-gold font-medium mb-2 flex items-center gap-2">
                  <Sparkles size={16} /> טיפ שבועי
                </h4>
                <p className="text-white/80 leading-relaxed text-sm font-medium">{insight.weeklyTip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

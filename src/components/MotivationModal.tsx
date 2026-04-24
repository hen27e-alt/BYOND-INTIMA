import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, X, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';

export const MotivationModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { language } = useLanguage();
  const [quote, setQuote] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
      const targetLang = languageNames[language] || 'English';
      
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `Generate a short, inspiring daily motivation quote for a couple in ${targetLang}. Just the quote, no extra text.` }] }]
      });
      setQuote(result.text || (language === 'he' ? 'אהבה היא לא רק להסתכל אחד על השני, אלא להסתכל יחד באותו כיוון.' : 'Love is not just looking at each other, but looking together in the same direction.'));
    } catch (error) {
      setQuote(language === 'he' ? 'אהבה היא הכוח היחיד המסוגל להפוך אויב לידיד.' : 'Love is the only force capable of turning an enemy into a friend.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) fetchQuote();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-brand-black/90 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-lg bg-white border border-brand-gold/20 rounded-3xl p-8 md:p-12 relative overflow-hidden text-center"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-20" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-brand-black/20 hover:text-brand-gold transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                <Quote size={32} />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
                <p className="text-xs uppercase tracking-widest text-brand-black/40">מייצר השראה...</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <p className="text-2xl md:text-3xl font-serif leading-relaxed text-brand-black italic">
                  "{quote}"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-8 bg-brand-gold/20" />
                  <Sparkles className="w-4 h-4 text-brand-gold/40" />
                  <div className="h-px w-8 bg-brand-gold/20" />
                </div>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-brand-black/90 transition-colors"
                >
                  תודה על ההשראה
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const DailyMotivationCard = () => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <div className="bg-brand-black border border-brand-gold/10 p-6 rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => setShowModal(true)}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Quote size={64} className="text-brand-gold" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-brand-gold animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-brand-gold">השראה יומית</span>
          </div>
          <h4 className="text-white font-serif text-lg mb-2">זמן למוטיבציה זוגית</h4>
          <p className="text-white/60 text-sm mb-4">קבלו ציטוט מעורר השראה שיחזק את החיבור שלכם היום.</p>
          <button className="text-[10px] uppercase tracking-widest font-bold text-brand-gold hover:text-white transition-colors">
            לחצו כאן להשראה &larr;
          </button>
        </div>
      </div>
      <MotivationModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

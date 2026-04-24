import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Sparkles, Loader2, Download, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const keySelected = await window.aistudio.hasSelectedApiKey();
        setHasKey(keySelected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !hasKey) return;

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            { text: prompt }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      });

      let foundImage = false;
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
            setGeneratedImage(imageUrl);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        setError("לא הצלחנו ליצור תמונה. נסו שוב עם תיאור אחר.");
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      if (err.message && err.message.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("מפתח ה-API פג תוקף או שגוי. אנא בחרו מפתח מחדש.");
      } else {
        setError("אירעה שגיאה בעת יצירת התמונה. אנא נסו שוב.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="bg-white border border-brand-gold/10 p-8 rounded-2xl text-center">
        <ImageIcon size={48} className="mx-auto text-brand-gold/30 mb-4" />
        <h3 className="text-xl font-serif mb-2">מחולל הזיכרונות (Nano Banana 2)</h3>
        <p className="text-brand-black/60 mb-6">
          כדי ליצור תמונות מרהיבות בעזרת בינה מלאכותית, עליכם לבחור מפתח API של Google Cloud.
        </p>
        <button
          onClick={handleSelectKey}
          className="px-6 py-3 bg-brand-black text-white rounded-full text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors"
        >
          בחירת מפתח API
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-gold/10 p-6 md:p-8 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-brand-cream rounded-full flex items-center justify-center text-brand-gold">
          <Sparkles size={24} />
        </div>
        <div>
          <h3 className="text-xl font-serif">מחולל הזיכרונות</h3>
          <p className="text-sm text-brand-black/60">תארו רגע זוגי חלומי וניתן לבינה המלאכותית לצייר אותו עבורכם.</p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="לדוגמה: זוג יושב על חוף הים בשקיעה, סגנון ציור שמן רומנטי..."
            className="w-full bg-brand-cream/30 border border-brand-gold/20 px-6 py-4 pr-12 rounded-xl focus:outline-none focus:border-brand-gold text-brand-black placeholder:text-brand-black/30"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-gold text-white rounded-lg flex items-center justify-center hover:bg-brand-black transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>

      {generatedImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden border border-brand-gold/10 group"
        >
          <img src={generatedImage} alt="Generated memory" className="w-full h-auto object-cover aspect-square" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <a
              href={generatedImage}
              download="couple-memory.png"
              className="w-12 h-12 bg-white text-brand-black rounded-full flex items-center justify-center hover:bg-brand-gold hover:text-white transition-colors"
              title="הורד תמונה"
            >
              <Download size={20} />
            </a>
            <button
              onClick={() => setGeneratedImage(null)}
              className="w-12 h-12 bg-white text-brand-black rounded-full flex items-center justify-center hover:bg-brand-gold hover:text-white transition-colors"
              title="צור חדש"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

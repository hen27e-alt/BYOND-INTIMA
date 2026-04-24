import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Utensils, 
  Film, 
  Music, 
  Heart, 
  MessageCircle, 
  Gift, 
  Loader2, 
  RefreshCw, 
  ChevronRight, 
  Star,
  Zap,
  Coffee,
  Trees,
  Search,
  Plus
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useFirebase } from '../../contexts/FirebaseContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Suggestion {
  id: string;
  type: 'date' | 'movie' | 'recipe' | 'conversation' | 'gift';
  title: string;
  description: string;
  details?: string[];
  icon: any;
  color: string;
}

export const SuggestionsTab = () => {
  const { user, profile } = useFirebase();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate a set of 5 unique and creative suggestions for a couple to enhance their connection. 
      Include:
      1. A unique date night idea.
      2. A movie recommendation with a reason why it's good for couples.
      3. A simple but special recipe to cook together.
      4. A deep conversation starter or question.
      5. A thoughtful small gift or gesture idea.

      Context: The couple values intimacy, quality time, and growth.
      Return the results in Hebrew as a JSON array of objects with fields: type (one of: date, movie, recipe, conversation, gift), title, description, and details (array of strings).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                details: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                }
              },
              required: ["type", "title", "description"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || "[]");
      const mapped = data.map((s: any, i: number) => ({
        ...s,
        id: `${s.type}-${Date.now()}-${i}`,
        icon: getIcon(s.type),
        color: getColor(s.type)
      }));
      setSuggestions(mapped);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'date': return Sparkles;
      case 'movie': return Film;
      case 'recipe': return Utensils;
      case 'conversation': return MessageCircle;
      case 'gift': return Gift;
      default: return Heart;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'date': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'movie': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'recipe': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'conversation': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'gift': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-brand-cream/50 text-brand-black/60 border-brand-gold/10';
    }
  };

  useEffect(() => {
    generateSuggestions();
  }, []);

  const handleAddToCalendar = async (suggestion: Suggestion) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'calendar_events'), {
        title: suggestion.title,
        description: suggestion.description,
        type: suggestion.type === 'date' ? 'date' : 'goal',
        date: new Date().toISOString().split('T')[0], // Default to today
        completed: false,
        createdAt: serverTimestamp()
      });
      alert('נוסף ליומן בהצלחה!');
    } catch (error) {
      console.error("Error adding to calendar:", error);
    }
  };

  const filteredSuggestions = activeFilter === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.type === activeFilter);

  return (
    <div className="space-y-12" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-serif italic text-brand-black">הצעות והשראה</h2>
          <p className="text-brand-black/50 text-lg">רעיונות מותאמים אישית כדי להעמיק את החיבור שלכם.</p>
        </div>
        <button 
          onClick={generateSuggestions}
          disabled={isGenerating}
          className="flex items-center gap-3 px-8 py-4 bg-brand-black text-brand-gold rounded-2xl font-bold hover:bg-brand-gold hover:text-white transition-all shadow-xl disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
          רענן הצעות
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { id: 'all', label: 'הכל', icon: Zap },
          { id: 'date', label: 'דייטים', icon: Sparkles },
          { id: 'movie', label: 'סרטים', icon: Film },
          { id: 'recipe', label: 'מתכונים', icon: Utensils },
          { id: 'conversation', label: 'שיח', icon: MessageCircle },
          { id: 'gift', label: 'מחוות', icon: Gift },
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
              activeFilter === filter.id 
                ? 'bg-brand-black text-brand-gold shadow-lg scale-105' 
                : 'bg-white text-brand-black/40 hover:bg-brand-cream border border-brand-gold/10'
            }`}
          >
            <filter.icon size={16} />
            {filter.label}
          </button>
        ))}
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {isGenerating ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/50 border border-brand-gold/10 rounded-[2.5rem] p-10 animate-pulse space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-brand-cream rounded-2xl" />
                  <div className="h-8 bg-brand-cream rounded-lg w-1/2" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-brand-cream rounded-lg w-full" />
                  <div className="h-4 bg-brand-cream rounded-lg w-3/4" />
                </div>
              </div>
            ))
          ) : (
            filteredSuggestions.map((suggestion, i) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-brand-gold/10 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${suggestion.color.split(' ')[0]} opacity-20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`} />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 ${suggestion.color} rounded-2xl flex items-center justify-center border shadow-sm`}>
                      <suggestion.icon size={28} />
                    </div>
                    <h3 className="text-2xl font-serif text-brand-black">{suggestion.title}</h3>
                  </div>

                  <p className="text-brand-black/60 leading-relaxed text-lg">
                    {suggestion.description}
                  </p>

                  {suggestion.details && suggestion.details.length > 0 && (
                    <ul className="space-y-3">
                      {suggestion.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-brand-black/50">
                          <div className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="pt-6 flex gap-4">
                    <button 
                      onClick={() => handleAddToCalendar(suggestion)}
                      className="flex-1 py-4 bg-brand-black text-brand-gold rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      הוסף ליומן
                    </button>
                    <button className="p-4 bg-brand-cream text-brand-black/40 rounded-xl hover:text-brand-gold transition-colors">
                      <Heart size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Daily Inspiration Quote */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="bg-brand-black text-white p-12 md:p-20 rounded-[4rem] text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/stars/1200/800')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <Sparkles className="text-brand-gold mx-auto" size={48} />
          <h3 className="text-3xl md:text-4xl font-serif italic">"האהבה אינה מורכבת מלהביט זה בזה, אלא מלהביט יחד באותו כיוון."</h3>
          <p className="text-brand-gold font-bold uppercase tracking-[0.3em] text-sm">- אנטואן דה סנט-אכזופרי</p>
        </div>
      </motion.div>
    </div>
  );
};

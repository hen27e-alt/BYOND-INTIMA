import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, Loader2, Heart, Search, BookmarkPlus, Bookmark, Trash2, ExternalLink } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface SavedGift {
  id: string;
  name: string;
  description: string;
  estimatedPrice: string;
  coupleId: string;
  createdAt: any;
}

export const GiftRecommender = () => {
  const { profile } = useFirebase();
  const [activeTab, setActiveTab] = useState<'generator' | 'vault'>('generator');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [interests, setInterests] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedGifts, setSavedGifts] = useState<SavedGift[]>([]);

  useEffect(() => {
    if (!profile?.coupleId) return;

    const q = query(
      collection(db, 'gift_vault'),
      where('coupleId', '==', profile.coupleId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gifts: SavedGift[] = [];
      snapshot.forEach((doc) => {
        gifts.push({ id: doc.id, ...doc.data() } as SavedGift);
      });
      setSavedGifts(gifts);
    });

    return () => unsubscribe();
  }, [profile?.coupleId]);

  const saveToVault = async (gift: any) => {
    if (!profile?.coupleId) return;
    try {
      await addDoc(collection(db, 'gift_vault'), {
        ...gift,
        coupleId: profile.coupleId,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving gift:", error);
    }
  };

  const removeFromVault = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gift_vault', id));
    } catch (error) {
      console.error("Error removing gift:", error);
    }
  };

  const isGiftSaved = (name: string) => {
    return savedGifts.some(g => g.name === name);
  };

  const generateGifts = async () => {
    if (!occasion || !budget || !interests) return;

    setIsGenerating(true);
    setRecommendations([]);

    try {
      const partnerLoveLanguage = profile?.partnerLoveLanguage || 'לא ידוע';
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `הצע 3 רעיונות למתנות עבור בן/בת הזוג שלי. 
          אירוע: ${occasion}. 
          תקציב: ${budget}. 
          תחומי עניין: ${interests}. 
          שפת האהבה שלהם: ${partnerLoveLanguage}.`,
        config: {
          systemInstruction: "You are an expert luxury gift concierge. Suggest 3 highly personalized, creative, and thoughtful gift ideas in Hebrew. Return ONLY a valid JSON array of objects.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the gift" },
                description: { type: Type.STRING, description: "Why this is a great gift and how it connects to their interests/love language" },
                estimatedPrice: { type: Type.STRING, description: "Estimated price range" }
              },
              required: ["name", "description", "estimatedPrice"]
            }
          }
        }
      });

      const gifts = JSON.parse(response.text?.trim() || "[]");
      setRecommendations(gifts);
    } catch (error) {
      console.error("Error generating gifts:", error);
      // Fallback
      setRecommendations([
        {
          name: 'מארז ספא זוגי יוקרתי',
          description: 'ערב של פינוק ורוגע בבית, מושלם לזמן איכות משותף.',
          estimatedPrice: '₪300 - ₪500'
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif text-white flex items-center justify-center gap-3">
          <Gift className="text-brand-gold" /> קונסיירז' וכספת מתנות
        </h2>
        <p className="text-white/40 mt-2">ה-AI שלנו ימצא את המתנה המושלמת, ואתם תוכלו לשמור אותה לכספת.</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('generator')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
            activeTab === 'generator' ? 'bg-brand-gold text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          מחולל מתנות
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'vault' ? 'bg-brand-gold text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Bookmark size={16} />
          כספת המתנות שלנו ({savedGifts.length})
        </button>
      </div>

      {activeTab === 'generator' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10">
          <div>
            <label className="block text-sm text-white/60 mb-2">לאיזה אירוע?</label>
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="יום הולדת, יום נישואין, סתם כי בא לי..."
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-gold/50"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">תקציב משוער</label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="עד 500 ש״ח, ללא הגבלה..."
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-gold/50"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">תחומי עניין / תחביבים</label>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="אוהב/ת לבשל, קריאה, ספורט אקסטרים..."
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-gold/50 resize-none h-24"
              dir="rtl"
            />
          </div>
          
          <button
            onClick={generateGifts}
            disabled={!occasion || !budget || !interests || isGenerating}
            className="w-full py-4 bg-brand-gold text-black rounded-xl font-bold hover:bg-white transition-all shadow-lg shadow-brand-gold/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            {isGenerating ? 'מחפש רעיונות...' : 'מצא מתנה מושלמת'}
          </button>
        </div>

        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {recommendations.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {recommendations.map((gift, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-brand-gold/30 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-serif text-brand-gold">{gift.name}</h3>
                      <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/60">{gift.estimatedPrice}</span>
                    </div>
                    <p className="text-white/70 leading-relaxed text-sm">{gift.description}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <button 
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(gift.name + ' לקנות')}`, '_blank')}
                        className="text-sm text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        <Search size={14} /> חפש ברשת
                      </button>
                      <button 
                        onClick={() => saveToVault(gift)}
                        disabled={isGiftSaved(gift.name)}
                        className={`text-sm flex items-center gap-1 transition-opacity ${isGiftSaved(gift.name) ? 'text-green-400 opacity-100' : 'text-white/40 hover:text-white opacity-0 group-hover:opacity-100'}`}
                      >
                        {isGiftSaved(gift.name) ? <Bookmark size={14} className="fill-green-400" /> : <BookmarkPlus size={14} />}
                        {isGiftSaved(gift.name) ? 'נשמר בכספת' : 'שמור לכספת'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : !isGenerating ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/10 rounded-3xl"
              >
                <Gift size={48} className="text-white/20 mb-4" />
                <p className="text-white/40">מלאו את הפרטים וה-AI שלנו יציע לכם את המתנות המדויקות ביותר.</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedGifts.length > 0 ? (
            savedGifts.map((gift) => (
              <motion.div
                key={gift.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl relative group"
              >
                <button
                  onClick={() => removeFromVault(gift.id)}
                  className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
                <div className="mb-2 pr-8">
                  <h3 className="text-xl font-serif text-brand-gold">{gift.name}</h3>
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/60 inline-block mt-2">{gift.estimatedPrice}</span>
                </div>
                <p className="text-white/70 leading-relaxed text-sm mt-4">{gift.description}</p>
                <button 
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(gift.name + ' לקנות')}`, '_blank')}
                  className="mt-6 w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} /> חפש לקנייה
                </button>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
              <Bookmark size={48} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/40 italic">הכספת ריקה. חזרו למחולל כדי לשמור רעיונות למתנות!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Music, Lock, Unlock, Ticket, Sparkles, Loader2, Star, Gift, CheckCircle2 } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const REWARDS = [
  {
    id: 'premium_escape_room',
    title: 'חדר בריחה פרימיום',
    description: 'פתיחת חדר בריחה מתקדם ומאתגר במיוחד לזוגות מנוסים.',
    cost: 500,
    icon: Lock,
    color: 'bg-purple-50 text-purple-600',
    type: 'feature'
  },
  {
    id: 'ai_love_song',
    title: 'שיר אהבה בהתאמה אישית',
    description: 'ה-AI שלנו יכתוב עבורכם שיר אהבה מקורי המבוסס על הסיפור הזוגי שלכם.',
    cost: 300,
    icon: Music,
    color: 'bg-pink-50 text-pink-600',
    type: 'ai_content'
  },
  {
    id: 'discount_code_15',
    title: 'קופון 15% הנחה לקופסה הבאה',
    description: 'קוד קופון בלעדי לרכישת קופסת Byond Intima הבאה שלכם.',
    cost: 1000,
    icon: Ticket,
    color: 'bg-amber-50 text-amber-600',
    type: 'coupon'
  }
];

export const RewardsBoutique = () => {
  const { user, profile } = useFirebase();
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [showSongGenerator, setShowSongGenerator] = useState(false);
  const [songLyrics, setSongLyrics] = useState<string | null>(null);
  const [isGeneratingSong, setIsGeneratingSong] = useState(false);
  const [songPrompt, setSongPrompt] = useState('');

  const totalPoints = profile?.progress?.totalPoints || 0;
  const unlockedRewards = profile?.unlockedRewards || [];

  const handlePurchase = async (rewardId: string, cost: number) => {
    if (!user || totalPoints < cost || unlockedRewards.includes(rewardId)) return;
    
    setIsPurchasing(rewardId);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        'progress.totalPoints': increment(-cost),
        unlockedRewards: arrayUnion(rewardId)
      });
      
      if (rewardId === 'ai_love_song') {
        setShowSongGenerator(true);
      }
    } catch (error) {
      console.error("Error purchasing reward:", error);
    } finally {
      setIsPurchasing(null);
    }
  };

  const generateLoveSong = async () => {
    if (!songPrompt) return;
    setIsGeneratingSong(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `כתוב שיר אהבה רומנטי ומרגש בעברית, המבוסס על הפרטים הבאים: ${songPrompt}.
        השיר צריך להיות בנוי מבתים ופזמון, בסגנון מודרני ומרגש.
        החזר רק את מילות השיר.`,
      });
      setSongLyrics(response.text || "לא הצלחנו לייצר את השיר כרגע. נסו שוב מאוחר יותר.");
    } catch (error) {
      console.error("Error generating song:", error);
      setSongLyrics("אירעה שגיאה ביצירת השיר.");
    } finally {
      setIsGeneratingSong(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag size={40} className="text-brand-gold" />
        </div>
        <h2 className="text-4xl font-serif text-brand-black">בוטיק ההטבות</h2>
        <p className="text-brand-black/60 max-w-xl mx-auto text-lg">
          המקום בו נקודות הזהב שלכם הופכות לחוויות. פדו נקודות תמורת משחקים, תוכן AI מותאם אישית והטבות בלעדיות.
        </p>
        
        <div className="inline-flex items-center gap-3 bg-brand-black text-white px-6 py-3 rounded-full shadow-lg mt-4">
          <Star size={20} className="text-brand-gold" />
          <span className="font-bold tracking-widest uppercase text-sm">היתרה שלכם:</span>
          <span className="text-2xl font-serif text-brand-gold">{totalPoints}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {REWARDS.map(reward => {
          const isUnlocked = unlockedRewards.includes(reward.id);
          const canAfford = totalPoints >= reward.cost;
          
          return (
            <motion.div 
              key={reward.id}
              whileHover={{ y: -5 }}
              className={`relative bg-white rounded-3xl p-8 border-2 transition-all overflow-hidden ${isUnlocked ? 'border-brand-gold shadow-lg shadow-brand-gold/20' : 'border-brand-gold/10 shadow-sm'}`}
            >
              {isUnlocked && (
                <div className="absolute top-4 left-4 bg-brand-gold text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> נרכש
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${reward.color}`}>
                <reward.icon size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-brand-black mb-3">{reward.title}</h3>
              <p className="text-brand-black/60 text-sm mb-8 leading-relaxed min-h-[60px]">
                {reward.description}
              </p>
              
              <div className="mt-auto">
                {isUnlocked ? (
                  reward.type === 'coupon' ? (
                    <div className="w-full py-3 bg-brand-cream border border-brand-gold/30 text-brand-black text-center rounded-xl font-mono font-bold tracking-widest">
                      BYOND15LOVE
                    </div>
                  ) : reward.type === 'ai_content' ? (
                    <button 
                      onClick={() => setShowSongGenerator(true)}
                      className="w-full py-3 bg-brand-gold text-black rounded-xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles size={18} /> צור שיר עכשיו
                    </button>
                  ) : (
                    <button className="w-full py-3 bg-brand-black text-brand-gold rounded-xl font-bold flex items-center justify-center gap-2">
                      <Unlock size={18} /> פתוח למשחק
                    </button>
                  )
                ) : (
                  <button 
                    onClick={() => handlePurchase(reward.id, reward.cost)}
                    disabled={!canAfford || isPurchasing === reward.id}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                      canAfford 
                        ? 'bg-brand-black text-white hover:bg-brand-gold hover:text-black' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isPurchasing === reward.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Star size={18} className={canAfford ? 'text-brand-gold' : ''} />
                        פדה תמורת {reward.cost} נק'
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* AI Song Generator Modal/Section */}
      <AnimatePresence>
        {showSongGenerator && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-brand-black text-white rounded-3xl p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
              <Sparkles size={48} className="text-brand-gold mx-auto mb-4" />
              <h3 className="text-3xl font-serif text-brand-gold">מחולל שירי האהבה</h3>
              <p className="text-white/70">
                ספרו לנו קצת עליכם - איך נפגשתם, בדיחות פרטיות, או רגעים מיוחדים, וה-AI שלנו יכתוב עבורכם שיר אהבה מקורי.
              </p>
              
              {!songLyrics ? (
                <div className="space-y-4 text-right">
                  <textarea 
                    value={songPrompt}
                    onChange={(e) => setSongPrompt(e.target.value)}
                    placeholder="למשל: נפגשנו בים לפני 5 שנים, אנחנו אוהבים לאכול פיצה בשישי בערב, ויש לנו כלב בשם רקסי..."
                    className="w-full h-32 p-4 bg-white/10 border border-brand-gold/30 rounded-xl text-white placeholder:text-white/30 focus:ring-1 focus:ring-brand-gold resize-none"
                  ></textarea>
                  <button 
                    onClick={generateLoveSong}
                    disabled={isGeneratingSong || !songPrompt}
                    className="w-full py-4 bg-brand-gold text-black rounded-xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2"
                  >
                    {isGeneratingSong ? <Loader2 size={20} className="animate-spin" /> : 'כתוב לנו שיר'}
                  </button>
                </div>
              ) : (
                <div className="bg-white/5 p-8 rounded-2xl border border-brand-gold/20 text-right">
                  <div className="whitespace-pre-wrap font-serif text-lg leading-loose text-white/90">
                    {songLyrics}
                  </div>
                  <button 
                    onClick={() => setSongLyrics(null)}
                    className="mt-8 text-brand-gold text-sm hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Music size={16} /> כתוב שיר חדש
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

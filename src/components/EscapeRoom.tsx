import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Lock, Unlock, ArrowRight, CheckCircle2, AlertCircle, Send, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { useFirebase } from '../contexts/FirebaseContext';

const ESCAPE_ROOMS = [
  {
    id: 'paris',
    title: 'הבריחה מפריז',
    description: 'אתם נעולים בחדר מלון בפריז, הטיסה שלכם יוצאת בעוד שעה ויש לכם רק רמזים בודדים כדי למצוא את הדרכונים.',
    difficulty: 'קל',
    stages: [
      {
        riddle: 'אני עולה למעלה אבל אף פעם לא יורד. מה אני?',
        answer: 'גיל',
        hint: 'זה קשור למספר השנים שאתם חיים.'
      },
      {
        riddle: 'יש לי מפתחות אבל אין לי מנעולים. יש לי חלל אבל אין לי חדרים. אפשר להיכנס אבל אי אפשר לצאת. מה אני?',
        answer: 'מקלדת',
        hint: 'אתם משתמשים בזה כדי לכתוב במחשב.'
      },
      {
        riddle: 'ככל שתיקח ממני יותר, כך אשאיר מאחור יותר. מה אני?',
        answer: 'צעדים',
        hint: 'אתם עושים את זה כשאתם הולכים.'
      }
    ]
  }
];

export const EscapeRoom = () => {
  const { profile } = useFirebase();
  const [selectedRoom, setSelectedRoom] = useState<typeof ESCAPE_ROOMS[0] | null>(null);
  const [isGeneratingGame, setIsGeneratingGame] = useState(false);
  const [gameContext, setGameContext] = useState<any>(null);
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string, imageUrl?: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStart = async (room: typeof ESCAPE_ROOMS[0]) => {
    setSelectedRoom(room);
    setIsGeneratingGame(true);
    setMessages([]);
    setIsCompleted(false);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Generate initial scenario and image
      const prompt = `You are an AI Game Master for a couple's text-based escape room. 
      The theme is: ${room.title} - ${room.description}.
      The couple's names are ${profile?.name || 'Player 1'} and their partner.
      
      Start the game by setting the scene vividly. Give them their first puzzle or clue.
      Keep it romantic, slightly thrilling, and encourage teamwork.
      Respond in Hebrew.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const initialText = response.text || "ברוכים הבאים לחדר הבריחה. המנעול סגור. מה תעשו?";
      
      // Generate an image for the setting
      let imageUrl = '';
      try {
        const imageResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: `A cinematic, mysterious, and romantic escape room setting. Theme: ${room.title}. High quality, photorealistic.`,
          config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
        });
        
        for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            imageUrl = `data:image/jpeg;base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (imgErr) {
        console.error("Failed to generate room image", imgErr);
      }

      setMessages([{ role: 'model', text: initialText, imageUrl }]);
      setGameContext({ theme: room.title, step: 1 });
      
    } catch (error) {
      console.error("Failed to start game", error);
      setMessages([{ role: 'model', text: "מצטער, חלה שגיאה בטעינת החדר. נסו שוב מאוחר יותר." }]);
    } finally {
      setIsGeneratingGame(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Build chat history
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      history.push({ role: 'user', parts: [{ text: userMsg }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: history,
        config: {
          systemInstruction: `You are an AI Game Master for a couple's text-based escape room. 
          Theme: ${gameContext?.theme}.
          Evaluate the user's input. If they solve the current puzzle, congratulate them and give the next puzzle.
          If they are stuck, provide a subtle hint.
          If they solve the final puzzle (usually after 3-4 steps), explicitly say the exact phrase "[ESCAPE_SUCCESS]" at the end of your message.
          Keep the tone romantic, immersive, and encouraging. Respond in Hebrew.`
        }
      });

      let aiText = response.text || "אני לא בטוח מה קרה. נסו שוב.";
      
      if (aiText.includes('[ESCAPE_SUCCESS]')) {
        aiText = aiText.replace('[ESCAPE_SUCCESS]', '').trim();
        setIsCompleted(true);
      }

      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
      
    } catch (error) {
      console.error("Game error", error);
      setMessages(prev => [...prev, { role: 'model', text: "הייתה בעיה בתקשורת. נסו שוב." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif text-white flex items-center justify-center gap-3">
          <Key className="text-brand-gold" /> חדר בריחה וירטואלי
        </h2>
        <p className="text-white/40 mt-2">שתפו פעולה, פתרו חידות וברחו יחד. עבודת צוות היא המפתח.</p>
      </div>

      <AnimatePresence mode="wait">
        {!selectedRoom ? (
          <motion.div
            key="rooms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-6"
          >
            {ESCAPE_ROOMS.map(room => (
              <div key={room.id} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-brand-gold/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-serif text-white">{room.title}</h3>
                  <span className="text-xs bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full">{room.difficulty}</span>
                </div>
                <p className="text-white/60 mb-6">{room.description}</p>
                <button
                  onClick={() => handleStart(room)}
                  className="px-6 py-3 bg-brand-gold text-black rounded-xl font-bold hover:bg-white transition-all flex items-center gap-2"
                >
                  <Lock size={18} /> התחל משחק
                </button>
              </div>
            ))}
          </motion.div>
        ) : isGeneratingGame ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 space-y-6 bg-white/5 border border-white/10 rounded-3xl"
          >
            <div className="relative">
              <Loader2 size={64} className="text-brand-gold animate-spin" />
              <Sparkles size={24} className="text-brand-gold absolute -top-2 -right-2 animate-pulse" />
            </div>
            <p className="text-brand-gold/60 font-serif italic text-lg tracking-wide">ה-AI בונה עבורכם חדר בריחה ייחודי...</p>
          </motion.div>
        ) : isCompleted ? (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-brand-gold/30 p-12 rounded-3xl text-center space-y-6"
          >
            <div className="w-24 h-24 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Unlock size={48} className="text-brand-gold" />
            </div>
            <h3 className="text-3xl font-serif text-brand-gold">הצלחתם לברוח!</h3>
            <p className="text-white/60">עבודת הצוות שלכם מושלמת. פתרתם את כל החידות יחד.</p>
            <button
              onClick={() => setSelectedRoom(null)}
              className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all mx-auto block mt-8"
            >
              חזור לחדרים
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 p-4 md:p-8 rounded-3xl flex flex-col h-[600px]"
          >
            <div className="flex justify-between items-center mb-6 text-sm text-white/40 pb-4 border-b border-white/10">
              <span className="font-bold text-brand-gold">{selectedRoom.title}</span>
              <button onClick={() => setSelectedRoom(null)} className="hover:text-white transition-colors">יציאה מהחדר</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-brand-gold text-black rounded-tr-none' 
                      : 'bg-white/10 text-white rounded-tl-none border border-white/10'
                  }`}>
                    {msg.imageUrl && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-white/20">
                        <img src={msg.imageUrl} alt="Room scene" className="w-full h-auto" />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-end">
                  <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-white/60">
                    <Loader2 size={16} className="animate-spin" />
                    <span>הגיימסטר חושב...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="relative mt-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="מה תעשו עכשיו? (למשל: 'אני בודק מתחת למיטה')"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-14 text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                dir="rtl"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-gold text-black rounded-lg flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

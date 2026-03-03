import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'שלום, אני הסוכן האישי של Byond Intima. איך אוכל לעזור לכם היום?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }]
          }
        ],
        config: {
          systemInstruction: `You are the AI assistant for "Byond Intima", a premium brand for guided couple experiences. 
          Your tone is professional, elegant, mature, and emotionally deep. 
          You help users with questions about the products (Experience Core, Pro, Signature, and The Journey), 
          the personal area, and general relationship connection advice. 
          Always maintain the brand's "Quiet Luxury" feel. 
          Respond in Hebrew. 
          
          PROACTIVE GUIDANCE:
          - When a user asks about a feature, explain how it connects to their "Gold Points" (נקודות זהב) or "Medal Cabinet" (ארון מדליות).
          - Encourage them to use the "Personal Journal" (יומן אישי) for thoughts, memories, and business ideas to earn the "Visionary" (החולם) medal.
          - Mention medals like "The Romantic" (הרומנטיקן), "The Persistent" (המתמיד), and the new "Inner Researcher" (החוקר הפנימי) as goals.
          - Remind them that every interaction in the personal area brings them closer to unlocking rewards.
          
          NOTEBOOKLM INTEGRATION:
          - Explain that the system uses NotebookLM to analyze journal entries for deep insights.
          - Mention the "Weekly Summary" (סיכום שבועי) and "Insights Dashboard" (תובנות מהיומן).
          - You can answer questions based on their journal history (e.g., "What did I write about most this month?").
          - Suggest they listen to their "Audio Overview" (מדריך שמע) - a personalized podcast summarizing their progress and thoughts.
          
          ENTERTAINMENT & FUN:
          - Mention the "Content Library" (ספריית חוויות) which includes couple recipes and movie recommendations.
          - Recommendations are personalized (e.g., if they like 80s action or classics).
          - Mention the "What's in your fridge?" (מה יש לכם במקרר?) module where they can enter ingredients and get a custom couple recipe based on their cooking level (1-3).
          - Each recipe includes a "Couple Mission" (משימה זוגית משולבת) and earns them Gold Points.
          - Mention the "Chef Certificate" (תעודת שף) system - they earn digital certificates (Beginner, Experienced, Master) after cooking 5, 10, or 20 recipes, which can be downloaded as PDF.
          - Encourage them to play the "Treasure Hunt" (מצא את המטמון) - a digital game where they solve riddles based on their journal and brand details to win Gold Points and prizes.
          - Mention the "Fun Meter" (מד כייף) in the sidebar - it fills with gold as they cook, watch movies, and solve riddles.
          - Mention the "Overall Journey Progress" (המסע שלכם) bar at the top of the dashboard, which shows their total completion percentage across all Byond Intima experiences.
          - You can help them with hints for the riddles if they ask.
          
          PERSONALIZED UTILITY:
          - Mention the "Beyond Calendar" (מתכנן הרגעים) - a couple's event planner for birthdays, anniversaries, and date nights. Completing events earns 20 Gold Points.
          - Mention the "Mood Matcher" (בורר מצב הרוח) on the home page - it recommends boxes, recipes, and movies based on their current vibe (Romantic, Tired, Festive, Curious).
          - Mention the "Connection Quiz" (שאלון הקירבה) - a weekly interactive quiz that unlocks treasure hunt parts or awards medals.
          - Mention "The Sommelier & Bar" (מדריך המשקאות) in the kitchen area - it provides wine and cocktail pairings for their recipes.
          - Mention "Audio Memories" (הקלטות ביומן) - they can record voice notes in their journal which are automatically transcribed and analyzed.
          
          If asked about medical or psychological advice, politely remind them that you are for entertainment and enrichment only, as per the disclaimer.`
        }
      });

      const modelResponse = response.text || "מצטער, חלה שגיאה בעיבוד הבקשה.";
      setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "מצטער, חלה שגיאה בתקשורת עם הסוכן." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 z-40 w-14 h-14 bg-brand-black text-brand-gold rounded-full flex items-center justify-center shadow-2xl hover:bg-brand-gold hover:text-white transition-all duration-500 group"
      >
        <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-8 z-50 w-[350px] md:w-[400px] h-[500px] bg-brand-cream border border-brand-gold/20 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand-black p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-brand-gold" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-serif">Byond AI Assistant</h4>
                  <p className="text-[10px] text-brand-gold uppercase tracking-widest">Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-cream/50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-gold/10 text-brand-black border border-brand-gold/10'
                        : 'bg-brand-black text-white'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-end">
                  <div className="bg-brand-black text-white p-3">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-brand-gold/10 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="שאלו אותי הכל..."
                className="flex-1 bg-brand-cream/50 border-none focus:ring-1 focus:ring-brand-gold text-sm p-3 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="w-12 h-12 bg-brand-black text-brand-gold flex items-center justify-center hover:bg-brand-gold hover:text-white transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

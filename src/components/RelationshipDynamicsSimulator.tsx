import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquareWarning, Send, Loader2, User, Bot, RefreshCw, Sparkles, Brain } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const RelationshipDynamicsSimulator = () => {
  const [scenario, setScenario] = useState('');
  const [personalityA, setPersonalityA] = useState('');
  const [personalityB, setPersonalityB] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const startSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario.trim()) return;

    setIsStarted(true);
    setIsLoading(true);

    try {
      chatRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `אתה סימולטור דינמיקה זוגית מתקדם. המשתמש מתאמן על הבנת אינטראקציות זוגיות.
          תרחיש: "${scenario}".
          טיפוס אישיות א': "${personalityA || 'רגיל'}".
          טיפוס אישיות ב': "${personalityB || 'רגיל'}".
          
          שחק את התפקיד של בן/בת הזוג (טיפוס ב'). הגב בצורה מציאותית בהתאם לטיפוס האישיות שהוגדר.
          אם המשתמש תוקפני, הגב בהתאם לטיפוס (למשל: נסיגה אם נמנע, או התקפה חזרה אם דומיננטי).
          
          אחרי 5-6 חילופי דברים, או אם המשתמש אומר "סיום", תן תובנות AI עמוקות על:
          1. סגנונות תקשורת שבאו לידי ביטוי.
          2. אסטרטגיות לפתרון קונפליקטים שמתאימות לטיפוסים האלו.
          3. הצעות לשיפור הדינמיקה.
          
          דבר בעברית בלבד. התחל את השיחה במשפט קצר שפותח את התרחיש.`
        }
      });

      const response = await chatRef.current.sendMessage({ message: "התחל את הסימולציה." });
      
      setMessages([
        { id: Date.now().toString(), role: 'model', text: response.text }
      ]);
    } catch (error) {
      console.error("Error starting simulation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatRef.current || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      
      const modelText = response.text;
      
      if (modelText.includes('תובנות') || modelText.includes('פידבק') || modelText.includes('משוב') || userMsg.toLowerCase() === 'סיום') {
        setFeedback(modelText);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: modelText }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSimulation = () => {
    setIsStarted(false);
    setScenario('');
    setPersonalityA('');
    setPersonalityB('');
    setMessages([]);
    setFeedback(null);
    chatRef.current = null;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif text-brand-black flex items-center justify-center gap-3">
          <MessageSquareWarning className="text-brand-gold" /> סימולטור דינמיקה זוגית
        </h2>
        <p className="text-brand-black/60 mt-2">נתחו סיטואציות וטיפוסי אישיות כדי להבין טוב יותר את התקשורת שלכם.</p>
      </div>

      {!isStarted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-brand-gold/10 p-8 rounded-3xl text-center max-w-xl mx-auto shadow-sm"
        >
          <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain size={32} className="text-brand-gold" />
          </div>
          <h3 className="text-xl font-serif text-brand-black mb-4">הגדרת הסימולציה</h3>
          
          <form onSubmit={startSimulation} className="space-y-6">
            <div className="space-y-2 text-right">
              <label className="text-xs font-bold text-brand-black/40 uppercase tracking-widest">תרחיש או נושא</label>
              <input
                type="text"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="למשל: ויכוח על כסף, תכנון חופשה..."
                className="w-full bg-brand-cream/50 border border-brand-gold/10 rounded-xl p-4 text-brand-black text-right focus:outline-none focus:border-brand-gold/50"
                dir="rtl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-brand-black/40 uppercase tracking-widest">אישיות א' (אתם)</label>
                <input
                  type="text"
                  value={personalityA}
                  onChange={(e) => setPersonalityA(e.target.value)}
                  placeholder="למשל: רגיש, דומיננטי..."
                  className="w-full bg-brand-cream/50 border border-brand-gold/10 rounded-xl p-4 text-brand-black text-right focus:outline-none focus:border-brand-gold/50"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-brand-black/40 uppercase tracking-widest">אישיות ב' (ה-AI)</label>
                <input
                  type="text"
                  value={personalityB}
                  onChange={(e) => setPersonalityB(e.target.value)}
                  placeholder="למשל: נמנע, ביקורתי..."
                  className="w-full bg-brand-cream/50 border border-brand-gold/10 rounded-xl p-4 text-brand-black text-right focus:outline-none focus:border-brand-gold/50"
                  dir="rtl"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!scenario.trim() || isLoading}
              className="w-full py-4 bg-brand-gold text-white rounded-xl font-bold hover:bg-brand-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'התחל סימולציה'}
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-brand-gold/10 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-sm"
        >
          <div className="p-4 bg-brand-cream/50 border-b border-brand-gold/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
                <Bot size={20} className="text-brand-gold" />
              </div>
              <div>
                <h3 className="text-brand-black font-medium">סימולטור בן/בת זוג</h3>
                <p className="text-brand-black/40 text-xs">נושא: {scenario}</p>
              </div>
            </div>
            <button
              onClick={resetSimulation}
              className="p-2 text-brand-black/40 hover:text-brand-black transition-colors"
              title="התחל מחדש"
              aria-label="התחל סימולציה מחדש"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-brand-gold/10 text-brand-gold'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-brand-gold text-white rounded-tl-none' 
                    : 'bg-brand-cream/50 text-brand-black rounded-tr-none border border-brand-gold/5'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-brand-cream/50 p-4 rounded-2xl rounded-tr-none flex items-center gap-2 border border-brand-gold/5">
                  <Loader2 size={16} className="animate-spin text-brand-gold" />
                  <span className="text-brand-black/40 text-sm">מקליד...</span>
                </div>
              </div>
            )}

            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-brand-gold/5 border border-brand-gold/20 p-6 rounded-2xl mt-8"
              >
                <h4 className="text-brand-gold font-serif text-lg mb-4 flex items-center gap-2">
                  <Sparkles size={20} /> פידבק על התקשורת שלכם
                </h4>
                <div className="text-brand-black/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {feedback}
                </div>
                <button
                  onClick={resetSimulation}
                  className="mt-6 px-6 py-2 bg-brand-gold text-white rounded-full text-sm font-bold hover:bg-brand-black transition-colors"
                >
                  סימולציה חדשה
                </button>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {!feedback && (
            <div className="p-4 bg-brand-cream/50 border-t border-brand-gold/10">
              <form onSubmit={sendMessage} className="flex gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="הקלידו את התגובה שלכם... (הקלידו 'סיום' לקבלת פידבק)"
                  className="flex-1 bg-white border border-brand-gold/10 rounded-xl p-4 text-brand-black focus:outline-none focus:border-brand-gold/50"
                  dir="rtl"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-14 h-14 bg-brand-gold text-white rounded-xl flex items-center justify-center hover:bg-brand-black transition-colors disabled:opacity-50 flex-shrink-0"
                  aria-label="שלח הודעה"
                >
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, Loader2, Heart, ThumbsUp, ThumbsDown, Volume2, VolumeX } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'up' | 'down' | null;
  audioUrl?: string | null;
}

export const AIAssistant = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'היי! אני היועץ הזוגי הווירטואלי שלכם. איך אפשר לעזור היום? (רעיונות לדייטים, פתרון קונפליקטים, או סתם טיפים לזוגיות)',
      feedback: null
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Keep the chat session in a ref so it maintains history
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize chat session on mount
    chatSessionRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'You are a friendly, empathetic, and creative relationship counselor and date planner for couples. Speak in Hebrew. Keep your answers concise, practical, and romantic. Use emojis. Do not use markdown formatting like bold or italics, just plain text with emojis.',
      }
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMsg.content });
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.text || 'מצטער, לא הצלחתי לחשוב על תשובה כרגע. נסו שוב.',
        feedback: null
      }]);
    } catch (error) {
      console.error('Error calling AI:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'אופס, הייתה לי תקלה קטנה. אפשר לנסות שוב?',
        feedback: null
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = async (id: string, text: string) => {
    if (isSpeaking === id) {
      audioRef.current?.pause();
      setIsSpeaking(null);
      return;
    }

    setIsSpeaking(id);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say in Hebrew: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBlob = new Blob([Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          audioRef.current.onended = () => setIsSpeaking(null);
        }
      }
    } catch (error) {
      console.error('Error with TTS:', error);
      setIsSpeaking(null);
    }
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, feedback: msg.feedback === type ? null : type } : msg
    ));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-white flex items-center justify-center gap-3">
          <Bot className="text-brand-gold" /> יועץ זוגי AI
        </h2>
        <p className="text-white/40 italic">רעיונות לדייטים, עצות לזוגיות, ואוזן קשבת.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-brand-gold text-black' : 'bg-white/10 text-brand-gold'
                }`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-brand-gold/20 text-white rounded-tr-sm' 
                      : 'bg-white/10 text-white/90 rounded-tl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === 'assistant' && (
                    <div className="flex gap-2 px-2 opacity-50 hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => speakMessage(msg.id, msg.content)}
                        className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${isSpeaking === msg.id ? 'text-brand-gold bg-brand-gold/10' : 'text-white/60'}`}
                        title="הקרא הודעה"
                      >
                        {isSpeaking === msg.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                      <button 
                        onClick={() => handleFeedback(msg.id, 'up')}
                        className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${msg.feedback === 'up' ? 'text-green-400 bg-green-400/10' : 'text-white/60'}`}
                        title="תשובה מועילה"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button 
                        onClick={() => handleFeedback(msg.id, 'down')}
                        className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${msg.feedback === 'down' ? 'text-red-400 bg-red-400/10' : 'text-white/60'}`}
                        title="תשובה לא מועילה"
                      >
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 text-brand-gold flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-brand-gold" size={20} />
                <span className="text-white/60 text-sm">מקליד...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
          <audio ref={audioRef} className="hidden" />
        </div>

        <div className="p-4 bg-black/40 border-t border-white/10">
          <form onSubmit={handleSend} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="שאלו אותי משהו... (למשל: מה לעשות בדייט גשום?)"
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-brand-gold/50 text-right"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-14 h-14 bg-brand-gold text-black rounded-full flex items-center justify-center hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={20} className="mr-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Loader2, Video, Film, Maximize, Minimize, Phone, Volume2, Square, HeartHandshake, Download, Terminal, Image as ImageIcon, ChevronLeft, ChevronRight, Share2, History, Trash2, HelpCircle, Search, PlusCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { BRANDING } from '../constants/branding';
import { useFirebase } from '../contexts/FirebaseContext';
import { useSiteConfig } from '../contexts/SiteConfigContext';
import { useAlert } from './AlertModal';
import { LiveAudioCall } from './LiveAudioCall';
import { useTTS } from '../hooks/useTTS';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, setDoc, doc, getDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
  videoUrl?: string;
  imageUrls?: string[];
  isTensionDetected?: boolean;
  type?: 'text' | 'terminal' | 'recommendation';
  status?: 'sent' | 'read';
  timestamp?: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';
import ReactMarkdown from 'react-markdown';

const TypingIndicator = () => (
  <div className="flex gap-1 p-2 bg-white border border-brand-gold/20 rounded-2xl rounded-tl-sm w-fit shadow-sm">
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.6, repeat: Infinity }}
      className="w-1.5 h-1.5 bg-brand-gold rounded-full"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      className="w-1.5 h-1.5 bg-brand-gold rounded-full"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      className="w-1.5 h-1.5 bg-brand-gold rounded-full"
    />
  </div>
);

export const AIChat = () => {
  const { profile, user, updateProfile } = useFirebase();
  const { config } = useSiteConfig();
  const { isAIChatOpen: isOpen, setIsAIChatOpen: setIsOpen, isPurchaseMode, setIsPurchaseMode } = useUI();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Byond Intima AI Terminal v1.0.0', 'Type "help" for a list of commands.']);
  const { playText, stop: stopTTS, isPlaying: isTTSPlaying, isLoading: isTTSLoading } = useTTS();
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('byond_chat_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    return localStorage.getItem('byond_current_session_id');
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        setMessages(session.messages);
      }
    } else if (sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
      setMessages(sessions[0].messages);
    } else {
      // Create initial session
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId,
        title: 'שיחה חדשה',
        messages: [],
        lastUpdated: Date.now()
      };
      setSessions([newSession]);
      setCurrentSessionId(newId);
      setMessages([]);
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      const updatedSessions = sessions.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages, lastUpdated: Date.now(), title: messages[0].text.slice(0, 30) + (messages[0].text.length > 30 ? '...' : '') } 
          : s
      );
      setSessions(updatedSessions);
      localStorage.setItem('byond_chat_sessions', JSON.stringify(updatedSessions));
      localStorage.setItem('byond_current_session_id', currentSessionId);
      
      // Sync to Firestore if logged in
      if (user) {
        const syncChat = async () => {
          try {
            await setDoc(doc(db, 'users', user.uid, 'settings', 'chat_sessions'), {
              sessions: updatedSessions,
              currentSessionId,
              lastUpdated: serverTimestamp()
            });
          } catch (error) {
            console.error("Error syncing chat to Firestore:", error);
          }
        };
        syncChat();
      }
    }
  }, [messages, user]);

  useEffect(() => {
    if (user) {
      const loadChat = async () => {
        try {
          const chatDoc = await getDoc(doc(db, 'users', user.uid, 'settings', 'chat_sessions'));
          if (chatDoc.exists()) {
            const data = chatDoc.data();
            if (data.sessions && data.sessions.length > sessions.length) {
              setSessions(data.sessions);
              if (data.currentSessionId) setCurrentSessionId(data.currentSessionId);
            }
          }
        } catch (error) {
          console.error("Error loading chat from Firestore:", error);
        }
      };
      loadChat();
    }
  }, [user]);

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'שיחה חדשה',
      messages: [],
      lastUpdated: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([]);
    setQuizStep(0);
    setQuizAnswers([]);
    setShowHistory(false);
  };

  const exportChat = (sessionMessages?: Message[]) => {
    const messagesToExport = sessionMessages || messages;
    const chatText = messagesToExport.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `byond-intima-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('byond_chat_history', JSON.stringify(updatedSessions));
    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSessionId(updatedSessions[0].id);
        setMessages(updatedSessions[0].messages);
      } else {
        createNewSession();
      }
    }
    setSessionToDelete(null);
    setShowDeleteConfirm(false);
  };

  const deleteAllHistory = () => {
    setSessions([]);
    localStorage.removeItem('byond_chat_history');
    createNewSession();
    setShowDeleteConfirm(false);
    setShowHistory(false);
  };

  const generateImages = async (prompt: string) => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        return;
      }
    }

    setIsImageGenerating(true);
    try {
      const imageAi = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      const response = await imageAi.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      });

      const imageUrls: string[] = [];
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrls.push(`data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`);
          }
        }
      }

      if (imageUrls.length > 0) {
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: `הנה התמונות שביקשתם עבור: "${prompt}"`,
          imageUrls 
        }]);
      }
    } catch (error) {
      console.error("Image Gen Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "מצטער, חלה שגיאה ביצירת התמונות." }]);
    } finally {
      setIsImageGenerating(false);
    }
  };

  const handleTerminalCommand = async (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    if (!command) return;

    setTerminalOutput(prev => [...prev, `> ${cmd}`]);
    setTerminalInput('');

    if (command === 'clear') {
      setTerminalOutput(['Byond Intima AI Terminal v1.0.0']);
      return;
    }

    if (command === 'help') {
      setTerminalOutput(prev => [...prev, 'Available commands:', '- clear: Clear terminal', '- help: Show this help', '- status: System status', '- export: Export chat history', '- any other text: Ask the AI developer assistant']);
      return;
    }

    if (command === 'status') {
      setTerminalOutput(prev => [...prev, 'System: Online', 'AI Model: Gemini 3.1 Flash', 'User: Authenticated', 'Gold Points: ' + (profile?.goldPoints || 0)]);
      return;
    }

    if (command === 'export') {
      exportChat();
      setTerminalOutput(prev => [...prev, 'Chat history exported successfully.']);
      return;
    }

    // AI Terminal Response
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: `Terminal Command/Question: ${cmd}` }] }],
        config: {
          systemInstruction: "You are the Byond Intima System Terminal AI. Respond concisely and technically. If asked about code, provide snippets. Keep it in a terminal style."
        }
      });
      setTerminalOutput(prev => [...prev, response.text || 'No output.']);
    } catch (error) {
      setTerminalOutput(prev => [...prev, 'Error: Failed to communicate with AI.']);
    }
  };

  const quizQuestions = [
    {
      text: "שלום! אני הסוכן האישי של Byond Intima. כדי שאוכל לעזור לכם בצורה הטובה ביותר, נתחיל בשאלון קצר. איך אתם מרגישים היום כזוג?",
      options: ["מעולה ומחוברים", "קצת עמוסים", "זקוקים לזמן איכות", "דלג לצ'אט חופשי"]
    },
    {
      text: "מה המטרה העיקרית שלכם לשיחה הזו?",
      options: ["חיזוק הקשר", "רעיון לדייט", "פתרון קונפליקט", "סתם שיתוף"]
    },
    {
      text: "איך הייתם מתארים את הדינמיקה הזוגית שלכם בתקופה האחרונה?",
      options: ["הרמונית ותומכת", "שגרתית ורגועה", "מאתגרת אך מלמדת", "זקוקה לריענון"]
    },
    {
      text: "מהי המטרה הזוגית המרכזית שלכם לשנה הקרובה?",
      options: ["לבלות יותר זמן איכות", "לשפר את התקשורת", "להגשים חלום משותף", "לשמור על הקיים"]
    },
    {
      text: "האם תרצו שאציע לכם משימה זוגית קצרה או סרטון השראה מותאם אישית?",
      options: ["משימה זוגית", "סרטון השראה", "גם וגם", "לא כרגע"]
    }
  ];

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getDriveId = (url: string) => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessages: { role: 'user' | 'model'; text: string; videoUrl?: string }[] = [];
      
      if (config.greetingVideoUrl) {
        initialMessages.push({
          role: 'model',
          text: 'ברוכים הבאים! צפו בסרטון הברכה שהכנתי עבורכם:',
          videoUrl: config.greetingVideoUrl
        });
      }
      
      initialMessages.push({ role: 'model', text: quizQuestions[0].text });
      
      setMessages(initialMessages);
    }
  }, [isOpen, config.greetingVideoUrl, messages.length]);

  const handleTTS = async (text: string, index: number) => {
    if (isTTSPlaying && playingMessageIndex === index) {
      stopTTS();
      setPlayingMessageIndex(null);
    } else {
      if (isTTSPlaying) stopTTS();
      setPlayingMessageIndex(index);
      await playText(text);
      setPlayingMessageIndex(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuizAnswer = async (answer: string) => {
    if (answer === "דלג לצ'אט חופשי") {
      setQuizStep(-1);
      setMessages(prev => [...prev, { role: 'user', text: answer }, { role: 'model', text: "הבנתי, אני כאן לכל שאלה או שיתוף. איך אוכל לעזור?" }]);
      return;
    }
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);
    setMessages(prev => [...prev, { role: 'user', text: answer }]);
    
    if (quizStep < quizQuestions.length - 1) {
      const nextStep = quizStep + 1;
      setQuizStep(nextStep);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'model', text: quizQuestions[nextStep].text }]);
      }, 500);
    } else {
      // End of quiz, process with AI
      setIsLoading(true);
      try {
        const prompt = `המשתמשים ענו על שאלון פתיחה:
        1. הרגשה זוגית: ${newAnswers[0]}
        2. מטרה: ${newAnswers[1]}
        3. דינמיקה זוגית: ${newAnswers[2]}
        4. מטרה לשנה הקרובה: ${newAnswers[3]}
        5. העדפה: ${newAnswers[4]}
        
        בהתבסס על התשובות האלו, תן להם פתיחה מותאמת אישית, עצה קצרה והצעה לפעילות מתוך המותג Byond Intima.
        אם הם ביקשו משימה, תן משימה מפורטת. אם ביקשו סרטון, תציע ליצור סרטון השראה רומנטי.
        חובה להזכיר באופן יזום את האפשרות לצבור "נקודות זהב" (Gold Points) ואת "ארון המדליות" (Medal Cabinet) כחלק מההצעה שלך.
        הסבר להם שכל משימה שהם משלימים מזכה אותם בנקודות ובמדליות ייחודיות.`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            systemInstruction: `You are ${BRANDING.conciergeName}, the AI assistant for "${BRANDING.name}". 
            Your tone is professional, elegant, and emotionally deep. 
            Maintain the brand's "Quiet Luxury" feel. Respond in Hebrew.
            Focus on providing a personalized experience based on the initial questionnaire answers.`
          }
        });

        const modelResponse = response.text || "תודה על השיתוף. איך אוכל להמשיך לעזור?";
        setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);
        setQuizStep(-1); // Mark quiz as finished
      } catch (error) {
        console.error("AI Error:", error);
        setMessages(prev => [...prev, { role: 'model', text: "מצטער, חלה שגיאה בעיבוד השאלון." }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const generateVideo = async (prompt: string) => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        return;
      }
    }

    setIsVideoGenerating(true);
    try {
      const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      let operation = await veoAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await veoAi.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.API_KEY || process.env.GEMINI_API_KEY || '',
          },
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: `הנה הסרטון שביקשתם: "${prompt}"`,
          videoUrl: url 
        }]);
      }
    } catch (error) {
      console.error("Veo Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "מצטער, חלה שגיאה ביצירת הסרטון." }]);
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || isLoading) return;

    const userMessage = messageToSend;
    setInput('');

    if (quizStep !== -1) {
      handleQuizAnswer(userMessage);
      return;
    }

    if (userMessage.toLowerCase().includes('הפעל מצב רכישה') || userMessage.toLowerCase().includes('activate purchase mode')) {
      setIsPurchaseMode(true);
      setMessages(prev => [...prev, { role: 'user', text: userMessage }, { 
        role: 'model', 
        text: "מצב רכישה הופעל בהצלחה! ✨ כעת יש לכם גישה לכל התכונות המיוחדות, המוצרים הבלעדיים בבוטיק, ויכולות ה-AI המתקדמות ביותר שלנו. איך אוכל לעזור לכם לחגוג את הרגע הזה?",
        timestamp: Date.now()
      }]);
      setIsLoading(false);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: userMessage, status: 'sent', timestamp: Date.now() }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.concat([{ role: 'user', text: userMessage }]).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: `You are ${BRANDING.conciergeName}, the AI assistant for "${BRANDING.name}", a premium brand for guided couple experiences. 
          Your tone is professional, elegant, mature, and emotionally deep. 
          
          USER CONTEXT (From Initial Questionnaire):
          - Mood: ${quizAnswers[0] || 'Not shared'}
          - Goal: ${quizAnswers[1] || 'General connection'}
          - Dynamics: ${quizAnswers[2] || 'Exploration'}
          - Yearly Goal: ${quizAnswers[3] || 'Growth'}
          - Preference: ${quizAnswers[4] || 'Balanced'}
          
          MISSION:
          1. Provide personalized activity or content recommendations based on their mood and goals.
          2. If they are stressed, suggest a calming ritual or a "Mood Matcher" activity.
          3. If they are adventurous, suggest a "Treasure Hunt" or a new card deck.
          4. Proactively mention rewards like Gold Points and Medals when they share positive updates.
          5. If you detect tension (Hebrew: מתח, מריבה, כעס), offer a "Tension Detection" intervention.
          6. Use the user's past interactions to tailor your advice.
          
          VIDEO & IMAGE GENERATION:
          - If a user asks for a romantic scene, a visual atmosphere, or a short clip, offer to generate a video using Veo or images using Gemini.
          - Explain that you can create high-quality cinematic content for them.
          - If they agree, tell them to click the "Generate Video" or "Generate Images" button that will appear.
          
          PROACTIVE GUIDANCE:
          - Mention "Gold Points" (נקודות זהב) and the "Medal Cabinet" (ארון מדליות) to encourage engagement.
          - Suggest specific activities from the platform (Journal, Content Library, Mood Matcher, Beyond Calendar).
          - Mention medals like "The Romantic", "The Persistent", and "Inner Researcher".
          
          PURCHASE MODE:
          - Current Status: ${isPurchaseMode ? 'ACTIVE (Premium User)' : 'INACTIVE (Standard User)'}
          - If ACTIVE: You can offer exclusive boutique items, high-quality personalized video/image generation, and deeper relationship insights.
          - If INACTIVE: Gently suggest that upgrading to "Purchase Mode" unlocks even more magical experiences.
          
          Always respond in Hebrew. Maintain the brand's "Quiet Luxury" feel.
          
          IMPORTANT: If you detect tension, anger, sadness, or stress, you MUST append the exact tag [TENSION_DETECTED] at the very end of your response.`
        }
      });

      let modelResponse = response.text || "מצטער, חלה שגיאה בעיבוד הבקשה.";
      let isTensionDetected = false;

      if (modelResponse.includes('[TENSION_DETECTED]')) {
        isTensionDetected = true;
        modelResponse = modelResponse.replace('[TENSION_DETECTED]', '').trim();
      }

      const newAiMessage: Message = { role: 'model', text: modelResponse, timestamp: Date.now() };
      if (isTensionDetected) {
        newAiMessage.isTensionDetected = true;
      }

      setMessages(prev => {
        const updated = prev.map(m => m.role === 'user' ? { ...m, status: 'read' as const } : m);
        return [...updated, newAiMessage];
      });
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "מצטער, חלה שגיאה בתקשורת עם הסוכן." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      await updateProfile({
        preferences: {
          ...profile?.preferences,
          customAvatar: url
        }
      });
      
      showAlert('התמונה עודכנה בהצלחה!');
    } catch (error) {
      console.error("Avatar Upload Error:", error);
      showAlert('שגיאה בהעלאת התמונה.');
    }
  };

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {isFocusMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 z-[90] backdrop-blur-md"
                onClick={() => setIsFocusMode(false)}
              />
            )}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                ...(isFocusMode ? {
                  width: '90vw',
                  height: '85vh',
                  maxWidth: '1200px',
                  maxHeight: '900px',
                  left: '50%',
                  top: '50%',
                  x: '-50%',
                  y: '-50%',
                  borderRadius: '40px',
                  boxShadow: '0 0 100px rgba(212, 175, 55, 0.2), 0 0 0 2px rgba(212, 175, 55, 0.3)'
                } : {})
              }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={cn(
                "fixed z-[100] bg-brand-cream border border-brand-gold/20 shadow-2xl flex flex-col overflow-hidden transition-all duration-500",
                isFocusMode 
                  ? "" 
                  : "bottom-28 lg:bottom-24 left-4 lg:left-8 w-[calc(100vw-2rem)] sm:w-[350px] md:w-[400px] h-[60vh] md:h-[600px] rounded-2xl lg:rounded-none"
              )}
            >
              {/* Header */}
              <div className={cn(
                "bg-brand-black p-4 flex items-center justify-between transition-all duration-500",
                isFocusMode ? "py-8 px-12" : "p-4"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "rounded-full overflow-hidden border border-brand-gold/30 relative group transition-all duration-500",
                    isFocusMode ? "w-16 h-16" : "w-10 h-10"
                  )}>
                    <img 
                      src={profile?.preferences?.customAvatar || config.globalAvatar || BRANDING.avatarUrl} 
                      alt={config.conciergeName || BRANDING.conciergeName} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {user && !isFocusMode && (
                      <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <PlusCircle size={14} className="text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                    )}
                  </div>
                  <div>
                    <h4 className={cn("text-white font-serif transition-all", isFocusMode ? "text-2xl" : "text-sm")}>
                      {config.conciergeName || BRANDING.conciergeName}
                    </h4>
                    <p className="text-[10px] text-brand-gold uppercase tracking-widest">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isFocusMode ? (
                    <>
                      {profile && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/ai-consultant');
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30 transition-colors"
                          title="וידאו קונסיירז'"
                        >
                          <Video size={16} />
                        </button>
                      )}
                      {profile && (
                        <button
                          onClick={() => setIsLiveCallOpen(true)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30 transition-colors"
                          title="שיחה קולית חיה"
                        >
                          <Phone size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-tutorial'))}
                        className="text-white/50 hover:text-brand-gold transition-colors p-2"
                        title="Tutorial"
                      >
                        <HelpCircle size={18} />
                      </button>
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={cn("text-white/50 hover:text-brand-gold transition-colors p-2", showHistory ? "text-brand-gold" : "")}
                        title="Chat History"
                      >
                        <History size={18} />
                      </button>
                      <button
                        onClick={() => exportChat()}
                        className="text-white/50 hover:text-brand-gold transition-colors p-2"
                        title="Export Chat"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                        className={`text-white/50 hover:text-brand-gold transition-colors p-2 ${isTerminalOpen ? 'text-brand-gold' : ''}`}
                        title="AI Terminal"
                      >
                        <Terminal size={18} />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-4 mr-4">
                      <span className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">Focus Mode Active</span>
                    </div>
                  )}
                  <button 
                    onClick={() => setIsFocusMode(!isFocusMode)} 
                    className="text-white/50 hover:text-brand-gold transition-colors p-2"
                    title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
                  >
                    {isFocusMode ? <Minimize size={24} /> : <Maximize size={18} />}
                  </button>
                  <button onClick={() => { setIsOpen(false); setIsFocusMode(false); }} className="text-white/50 hover:text-white transition-colors p-2">
                    <X size={isFocusMode ? 28 : 20} />
                  </button>
                </div>
              </div>

            {/* History Overlay */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="absolute inset-0 z-[110] bg-brand-cream p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-serif">היסטוריית שיחות</h4>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={createNewSession}
                        className="p-2 bg-brand-gold/20 text-brand-gold rounded-full hover:bg-brand-gold/30 transition-colors"
                        title="שיחה חדשה"
                      >
                        <Sparkles size={18} />
                      </button>
                      <button onClick={() => setShowHistory(false)} className="text-brand-black/40 hover:text-brand-black">
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gold/40" size={16} />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="חפש בשיחות או במידע ספציפי..."
                      className="w-full bg-white border border-brand-gold/10 rounded-xl py-2 pr-10 pl-4 text-xs outline-none focus:border-brand-gold transition-colors"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4">
                    {filteredSessions.length > 0 ? filteredSessions.map((session) => (
                      <div 
                        key={session.id}
                        onClick={() => {
                          setCurrentSessionId(session.id);
                          setShowHistory(false);
                        }}
                        className={cn(
                          "p-4 rounded-2xl border transition-all cursor-pointer group",
                          currentSessionId === session.id 
                            ? "bg-brand-gold/10 border-brand-gold shadow-sm" 
                            : "bg-white border-brand-gold/10 hover:border-brand-gold/30"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">
                            {new Date(session.lastUpdated).toLocaleDateString('he-IL')}
                          </p>
                          {currentSessionId === session.id && (
                            <span className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs font-medium text-brand-black truncate">{session.title}</p>
                        <p className="text-[10px] text-brand-black/40 mt-1">{session.messages.length} הודעות</p>
                        
                        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              exportChat(session.messages);
                            }}
                            className="flex-1 py-2 bg-brand-black text-white text-[8px] font-bold uppercase tracking-widest rounded-lg"
                          >
                            ייצוא
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionToDelete(session.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="flex-1 py-2 bg-red-500/10 text-red-500 text-[8px] font-bold uppercase tracking-widest rounded-lg"
                          >
                            מחיקה
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-12">
                        <Search size={32} className="mb-4" />
                        <p className="text-xs font-serif italic">לא נמצאו שיחות תואמות...</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-brand-gold/10">
                    <button 
                      onClick={() => {
                        setSessionToDelete(null);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full py-3 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      מחק את כל ההיסטוריה
                    </button>
                  </div>

                  {/* Delete Confirmation Modal */}
                  <AnimatePresence>
                    {showDeleteConfirm && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-[120] bg-brand-black/90 backdrop-blur-sm flex items-center justify-center p-6"
                      >
                        <div className="bg-brand-cream p-6 rounded-2xl border border-brand-gold/20 text-center">
                          <Trash2 className="mx-auto mb-4 text-red-500" size={32} />
                          <h5 className="text-lg font-serif mb-2">
                            {sessionToDelete ? 'מחיקת שיחה?' : 'מחיקת כל ההיסטוריה?'}
                          </h5>
                          <p className="text-xs text-brand-black/60 mb-6">
                            {sessionToDelete 
                              ? 'פעולה זו תמחק את השיחה שנבחרה לצמיתות.' 
                              : 'פעולה זו תמחק את כל היסטוריית הצ\'אט שלכם לצמיתות.'}
                          </p>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => {
                                setShowDeleteConfirm(false);
                                setSessionToDelete(null);
                              }}
                              className="flex-1 py-2 bg-brand-black/5 text-brand-black text-[10px] font-bold uppercase tracking-widest rounded-lg"
                            >
                              ביטול
                            </button>
                            <button 
                              onClick={() => {
                                if (sessionToDelete) {
                                  deleteSession(sessionToDelete);
                                } else {
                                  deleteAllHistory();
                                }
                              }}
                              className="flex-1 py-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg"
                            >
                              {sessionToDelete ? 'מחק שיחה' : 'מחק הכל'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Terminal Overlay */}
            <AnimatePresence>
              {isTerminalOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-[110] bg-black p-4 font-mono text-green-500 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-green-900 pb-2">
                    <div className="flex items-center gap-2">
                      <Terminal size={16} />
                      <span className="text-xs uppercase tracking-widest">AI System Terminal</span>
                    </div>
                    <button onClick={() => setIsTerminalOpen(false)} className="text-green-900 hover:text-green-500">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto text-xs space-y-1 mb-4">
                    {terminalOutput.map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <span className="text-green-900">$</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTerminalCommand(terminalInput)}
                      className="flex-1 bg-transparent border-none outline-none text-green-500 text-xs"
                      autoFocus
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className={cn(
              "flex-1 overflow-y-auto p-4 space-y-6 transition-all duration-500",
              isFocusMode ? "bg-brand-cream max-w-5xl mx-auto w-full px-8 md:px-24 py-12" : "bg-brand-cream/50 p-4"
            )}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col transition-all duration-500",
                    msg.role === 'user' ? 'items-start' : 'items-end',
                    isFocusMode ? "mb-12" : "mb-0"
                  )}
                >
                  <div className={cn(
                    "flex gap-4 transition-all duration-500",
                    msg.role === 'user' ? 'flex-row' : 'flex-row-reverse',
                    isFocusMode ? "max-w-[80%]" : "max-w-[85%]"
                  )}>
                    {msg.role === 'model' && (
                      <div className={cn(
                        "rounded-full overflow-hidden border border-brand-gold/30 shrink-0 mt-1 transition-all duration-500",
                        isFocusMode ? "w-12 h-12" : "w-8 h-8"
                      )}>
                        <img 
                          src={profile?.preferences?.customAvatar || config.globalAvatar || BRANDING.avatarUrl} 
                          alt="AI Avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div
                      className={cn(
                        "p-4 text-sm leading-relaxed relative group rounded-2xl transition-all duration-500",
                        msg.role === 'user'
                          ? 'bg-brand-gold/20 text-brand-black rounded-tr-sm'
                          : 'bg-white text-brand-black border border-brand-gold/20 shadow-sm rounded-tl-sm',
                        isFocusMode ? "p-8 text-lg shadow-xl border-brand-gold/10" : "p-3"
                      )}
                    >
                      {msg.role === 'model' && (
                        <button
                          onClick={() => handleTTS(msg.text, i)}
                          className={cn(
                            "absolute rounded-full bg-brand-cream border border-brand-gold/20 text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-gold/10",
                            isFocusMode ? "-right-14 top-4 p-3" : "-right-8 top-2 p-1.5"
                          )}
                          title="הקרא הודעה"
                        >
                          {isTTSPlaying && playingMessageIndex === i ? <Square size={isFocusMode ? 20 : 14} /> : <Volume2 size={isFocusMode ? 20 : 14} />}
                        </button>
                      )}
                      
                      <div className={cn(
                        "prose max-w-none transition-all duration-500",
                        isFocusMode ? "prose-lg prose-stone" : "prose-sm prose-stone"
                      )}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>

                      {msg.role === 'user' && (
                        <div className="flex justify-end mt-1">
                          <span className="text-[8px] text-brand-black/40 uppercase tracking-widest">
                            {msg.status === 'read' ? 'נצפה' : 'נשלח'}
                          </span>
                        </div>
                      )}
                      {msg.imageUrls && msg.imageUrls.length > 0 && (
                        <div className={cn("mt-3 relative group/carousel", isFocusMode ? "mt-6" : "mt-3")}>
                          <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide pb-4">
                            {msg.imageUrls.map((url, idx) => (
                              <div key={idx} className={cn(
                                "snap-center shrink-0 rounded-xl overflow-hidden border border-brand-gold/10 shadow-lg transition-all duration-500",
                                isFocusMode ? "w-[400px] aspect-[4/3]" : "w-full aspect-square"
                              )}>
                                <img src={url} alt={`Generated ${idx}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col items-end">
                  <div className="flex gap-2 max-w-[85%] flex-row-reverse">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-gold/30 shrink-0 mt-1">
                      <img 
                        src={profile?.preferences?.customAvatar || config.globalAvatar || BRANDING.avatarUrl} 
                        alt="AI Avatar" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={cn(
              "p-4 bg-white border-t border-brand-gold/10 flex gap-2 transition-all duration-500",
              isFocusMode ? "py-12 px-8 md:px-24 bg-brand-cream/30" : "p-4"
            )}>
              <div className={cn(
                "flex-1 flex gap-2 transition-all duration-500",
                isFocusMode ? "max-w-4xl mx-auto w-full bg-white p-4 rounded-[40px] shadow-2xl border border-brand-gold/20" : ""
              )}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isFocusMode ? "מה תרצו לדעת היום?..." : "שאלו אותי הכל..."}
                  className={cn(
                    "flex-1 bg-brand-cream/50 border-none focus:ring-1 focus:ring-brand-gold text-sm p-3 outline-none transition-all duration-500",
                    isFocusMode ? "bg-transparent text-xl px-8 py-4" : "bg-brand-cream/50"
                  )}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                      if (lastUserMsg) {
                        generateImages(lastUserMsg.text);
                      }
                    }}
                    disabled={isImageGenerating || messages.filter(m => m.role === 'user').length === 0}
                    className={cn(
                      "bg-white border border-brand-gold/20 text-brand-gold flex items-center justify-center hover:bg-brand-gold hover:text-white transition-all disabled:opacity-50",
                      isFocusMode ? "w-16 h-16 rounded-full" : "w-12 h-12"
                    )}
                    title="צור תמונה מההודעה האחרונה"
                  >
                    <ImageIcon size={isFocusMode ? 24 : 18} />
                  </button>
                  <button
                    onClick={() => handleSend()}
                    disabled={isLoading || isVideoGenerating}
                    className={cn(
                      "bg-brand-black text-brand-gold flex items-center justify-center hover:bg-brand-gold hover:text-white transition-all disabled:opacity-50",
                      isFocusMode ? "w-16 h-16 rounded-full" : "w-12 h-12"
                    )}
                  >
                    <Send size={isFocusMode ? 24 : 18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <LiveAudioCall 
        isOpen={isLiveCallOpen} 
        onClose={() => setIsLiveCallOpen(false)} 
        conciergeName={config.conciergeName || BRANDING.conciergeName}
      />
    </>
  );
};

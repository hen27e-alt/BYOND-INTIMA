import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  MessageSquare, 
  Upload, 
  Send, 
  User, 
  Bot, 
  Loader2, 
  Sparkles, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Settings,
  AlertCircle,
  Check
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { useSiteConfig } from '../contexts/SiteConfigContext';
import { BRANDING } from '../constants/branding';
import { storage } from '../firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

// Extend window for AI Studio API key selection
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  videoUrl?: string;
  isGeneratingVideo?: boolean;
}

export default function AIConsultant() {
  const { t, language } = useLanguage();
  const { profile, updateProfile, user, loading } = useFirebase();
  const { config } = useSiteConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: language === 'he' 
        ? `שלום! אני ${config.conciergeName || BRANDING.conciergeName}, המדריכה האישית שלכם ב-${config.siteName || BRANDING.name}. איך אוכל לעזור לכם להעמיק את החיבור הזוגי היום?` 
        : `Hello! I am ${config.conciergeName || BRANDING.conciergeName}, your personal ${config.siteName || BRANDING.name} guide. How can I help you deepen your connection today?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [avatarImage, setAvatarImage] = useState<string | null>(profile?.preferences?.customAvatar || config.globalAvatar || BRANDING.avatarUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isInitialMount = useRef(true);

  const latestVideoMessage = [...messages].reverse().find(m => m.videoUrl);
  const currentVideoUrl = latestVideoMessage?.videoUrl;
  const isGeneratingAnyVideo = messages.some(m => m.isGeneratingVideo);

  // Update avatar if profile changes
  useEffect(() => {
    if (profile?.preferences?.customAvatar) {
      setAvatarImage(profile.preferences.customAvatar);
    } else if (config.globalAvatar) {
      setAvatarImage(config.globalAvatar);
    }
  }, [profile, config.globalAvatar]);

  const getBase64Data = async (url: string): Promise<{ data: string, mimeType: string }> => {
    if (url.startsWith('data:')) {
      const [header, data] = url.split(',');
      const mimeType = header.split(';')[0].split(':')[1];
      return { data, mimeType };
    }
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({ data: base64, mimeType: blob.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Error fetching image for base64 conversion:', err);
      throw new Error('Could not process the avatar image. Please try uploading a new one.');
    }
  };

  useEffect(() => {
    checkApiKey();
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      scrollToBottom();
    }
  }, [messages]);

  const checkApiKey = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    }
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      setIsUploading(true);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          
          // Upload to Firebase Storage to avoid Firestore size limits
          const storageRef = ref(storage, `avatars/${profile.uid}_${Date.now()}`);
          await uploadString(storageRef, base64, 'data_url');
          const downloadURL = await getDownloadURL(storageRef);
          
          setAvatarImage(downloadURL);
          
          // Persist URL to profile
          await updateProfile({
            preferences: {
              ...profile.preferences,
              customAvatar: downloadURL
            }
          });
        } catch (err) {
          console.error('Error uploading avatar:', err);
          setError(language === 'he' ? 'שגיאה בהעלאת התמונה' : 'Error uploading image');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateTTS = async (text: string, messageId: string) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly and warmly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Warm female voice
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
        // We'll play this when the video is ready or immediately
        return audioUrl;
      }
    } catch (err) {
      console.error('TTS error:', err);
    }
    return null;
  };

  const generateVideo = async (text: string, messageId: string, audioUrl?: string | null) => {
    if (!avatarImage) return;

    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      if (!selected) {
        await window.aistudio.openSelectKey();
        return;
      }
    }

    try {
      // Use the paid API key for Veo
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      
      // Get base64 data correctly
      const { data: base64Data, mimeType } = await getBase64Data(avatarImage);

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A cinematic high-quality video of the person in this image. The person should be speaking directly to the camera with high clarity. They should have expressive facial movements, blinking naturally, and subtle head tilts. The lighting should be soft and professional. Ensure the person's features are sharp and the movement is fluid and realistic. 4k resolution, professional studio quality.`,
        image: {
          // @ts-ignore
          imageBytes: base64Data,
          mimeType: mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': apiKey || '',
          },
        });
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);

        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, videoUrl, isGeneratingVideo: false } 
            : msg
        ));

        // Play audio if available
        if (audioUrl && !isMuted) {
          const audio = new Audio(audioUrl);
          audio.play().catch(e => console.error('Audio playback failed:', e));
        }
      }
    } catch (err: any) {
      console.error('Video generation error:', err);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isGeneratingVideo: false } 
          : msg
      ));
      if (err.message?.includes('Requested entity was not found')) {
        setHasApiKey(false);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: input,
        config: {
          systemInstruction: `You are ${BRANDING.conciergeName}, the elite concierge and relationship guide for ${BRANDING.name}. 
          Your tone is sophisticated, wise, emotionally intelligent, and "Quiet Luxury". 
          You help couples deepen their connection through meaningful conversation, guided experiences, and personalized advice. 
          Always maintain a premium, supportive, and mature persona. 
          Respond in the user's language (${language === 'he' ? 'Hebrew' : 'English'}).
          Keep responses concise (under 50 words) so they work well for video generation.
          
          IMPORTANT: If the user asks how to see their uploaded image or why "nothing is moving", explain that they need to:
          1. Use the "Change Image" (החלפת תמונה) button on the video screen to upload their photo.
          2. Once uploaded, they can click "Test Video" (בדיקת וידאו) or just send a message to see the AI speak using their image.`,
        }
      });

      const responseText = response.text || '';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        isGeneratingVideo: !!avatarImage
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (avatarImage) {
        // Generate TTS and Video in parallel
        const audioPromise = generateTTS(responseText, assistantMessage.id);
        generateVideo(responseText, assistantMessage.id, await audioPromise);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(language === 'he' ? 'שגיאה בתקשורת עם ה-AI' : 'Error communicating with AI');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-cream font-sans overflow-hidden flex flex-col pt-20">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-gold/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-brand-gold/5 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 flex-grow flex flex-col lg:flex-row gap-8 relative z-10 py-8">
        
        {/* Left Side: Video Preview & Controls */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div className="text-center mb-2">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold font-bold mb-1">
              {language === 'he' ? 'המדריך האישי שלך' : 'Your Personal Guide'}
            </p>
            <p className="text-[10px] opacity-50 uppercase tracking-widest">
              {language === 'he' ? 'העלו תמונה והתחילו בשיחה' : 'Upload a photo & start chatting'}
            </p>
          </div>
          <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 overflow-hidden relative group shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center bg-brand-black">
              {currentVideoUrl ? (
                <video 
                  ref={videoRef}
                  src={currentVideoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  controls
                />
              ) : avatarImage ? (
                <img 
                  src={avatarImage} 
                  className={`w-full h-full object-cover transition-all duration-700 ${isGeneratingAnyVideo ? 'opacity-40 blur-md scale-110' : 'opacity-100 blur-0 scale-100'}`} 
                  alt="Avatar" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-brand-gold/10 flex items-center justify-center mb-4">
                    <User className="w-10 h-10 text-brand-gold/40" />
                  </div>
                  <p className="text-sm opacity-60">
                    {language === 'he' ? 'אין תמונה זמינה' : 'No image available'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Overlay for generating state */}
            {isGeneratingAnyVideo && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-8 z-20">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-brand-gold animate-spin mb-4" />
                  <Sparkles className="absolute top-0 right-0 w-6 h-6 text-brand-gold animate-pulse" />
                </div>
                <h3 className="text-xl font-serif mb-2 text-white drop-shadow-lg">
                  {language === 'he' ? 'המדריך שלך מתכונן לדבר...' : 'Your guide is preparing to speak...'}
                </h3>
                <p className="text-sm text-white/80 max-w-xs drop-shadow-md">
                  {language === 'he' ? 'אנחנו יוצרים וידאו חי מהתמונה שלך. זה עשוי לקחת כדקה.' : 'We are creating a live video from your image. This may take about a minute.'}
                </p>
              </div>
            )}

            {/* Floating Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-2 z-30 opacity-100 transition-opacity">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-bold flex items-center gap-2 hover:bg-brand-gold hover:text-brand-black transition-all disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {language === 'he' ? 'החלפת תמונה' : 'Change Image'}
              </button>

              {avatarImage && !isGeneratingAnyVideo && (
                <button 
                  onClick={async () => {
                    const testMsg = language === 'he' ? 'שלום! אני מוכנה לעזור.' : 'Hello! I am ready to help.';
                    const id = Date.now().toString();
                    setMessages(prev => [...prev, { id, role: 'assistant', content: testMsg, isGeneratingVideo: true }]);
                    const audioPromise = generateTTS(testMsg, id);
                    generateVideo(testMsg, id, await audioPromise);
                  }}
                  className="px-4 py-2 bg-brand-gold text-brand-black rounded-full text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
                >
                  <Play size={14} fill="currentColor" />
                  {language === 'he' ? 'בדיקת וידאו' : 'Test Video'}
                </button>
              )}
              
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {avatarImage !== BRANDING.avatarUrl && (
                <button 
                  onClick={async () => {
                    setAvatarImage(BRANDING.avatarUrl);
                    if (profile) {
                      await updateProfile({
                        preferences: { ...profile.preferences, customAvatar: null }
                      });
                    }
                  }}
                  className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-bold hover:bg-red-500/80 transition-all"
                >
                  {language === 'he' ? 'איפוס' : 'Reset'}
                </button>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>

          {/* API Key Selection Warning */}
          {!hasApiKey && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl flex items-start gap-4"
            >
              <AlertCircle className="text-brand-gold shrink-0" />
              <div>
                <h4 className="font-bold text-brand-gold mb-1">
                  {language === 'he' ? 'נדרש מפתח API' : 'API Key Required'}
                </h4>
                <p className="text-sm opacity-70 mb-4">
                  {language === 'he' 
                    ? 'כדי להשתמש ביכולות הוידאו המתקדמות, עליך לבחור מפתח API של Google Cloud (בתשלום).' 
                    : 'To use advanced video capabilities, you must select a Google Cloud API key (paid).'}
                </p>
                <button 
                  onClick={handleOpenKeySelector}
                  className="text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-brand-gold pb-1 hover:opacity-80 transition-opacity"
                >
                  {language === 'he' ? 'בחירת מפתח כעת' : 'Select Key Now'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Guide Info */}
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center">
                <Bot className="text-brand-gold" />
              </div>
              <div>
                <h4 className="font-serif text-xl">Byond Concierge</h4>
                <p className="text-xs opacity-50 uppercase tracking-widest">AI Guide • Beta</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-70">
              {language === 'he' 
                ? 'המדריך האנושי שלנו כאן כדי להפוך את החוויה שלכם לאישית יותר. הוא יכול להסביר על המארזים שלנו, לעזור לכם לבחור את החוויה המתאימה, או פשוט לשוחח על זוגיות ואינטימיות.' 
                : 'Our human guide is here to make your experience more personal. They can explain our kits, help you choose the right experience, or simply chat about relationships and intimacy.'}
            </p>
          </div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="w-full lg:w-1/2 flex flex-col h-[600px] lg:h-[700px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Chat Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-bold opacity-60">
                {language === 'he' ? 'שיחה פעילה' : 'Active Session'}
              </span>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Settings size={18} className="opacity-40" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-brand-gold text-brand-black rounded-tr-none' 
                    : 'bg-white/10 text-brand-cream rounded-tl-none border border-white/10'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  {msg.videoUrl && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] opacity-60 uppercase tracking-widest">
                      <Video size={12} />
                      {language === 'he' ? 'וידאו זמין' : 'Video Available'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none border border-white/10">
                  <Loader2 className="w-5 h-5 animate-spin opacity-40" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white/5 border-t border-white/10">
            {error && (
              <div className="mb-4 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            <div className="relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'he' ? 'שאלו את המדריך...' : 'Ask the guide...'}
                className="w-full bg-white/10 border border-white/10 rounded-full py-4 px-6 pr-14 text-sm focus:outline-none focus:border-brand-gold/50 transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={isProcessing || !input.trim()}
                className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-brand-gold text-brand-black rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-center mt-4 opacity-40 uppercase tracking-widest">
              Powered by Byond AI • Immersive Experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

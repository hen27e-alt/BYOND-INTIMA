import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Send, Loader2, Calendar, Clock, MessageSquare, Sparkles, History, Mic, Square, Play, Pause, Video, Image as ImageIcon } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAlert } from './AlertModal';
import { db, storage } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleGenAI } from '@google/genai';

interface Capsule {
  id: string;
  userId: string;
  content: string;
  unlockDate: any;
  isUnlocked: boolean;
  createdAt: any;
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  aiSummary?: string;
}

export const TimeCapsule = () => {
  const { user, profile } = useFirebase();
  const { showAlert } = useAlert();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ content: '', unlockDate: '' });
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // AI Generation State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<{imageUrl?: string, videoUrl?: string, summary?: string}>({});

  // Media Upload State
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (!profile?.coupleId) return;

    const q = query(
      collection(db, 'time_capsules'),
      where('coupleId', '==', profile.coupleId)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list: Capsule[] = [];
      const now = new Date();
      snap.forEach(doc => {
        const data = doc.data();
        const unlockDate = data.unlockDate?.toDate();
        list.push({ 
          id: doc.id, 
          ...data, 
          isUnlocked: unlockDate <= now 
        } as Capsule);
      });
      list.sort((a, b) => {
        const dateA = (a as any).createdAt?.toDate() || new Date(0);
        const dateB = (b as any).createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setCapsules(list);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.coupleId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      showAlert("לא ניתן לגשת למיקרופון. אנא בדקו הרשאות.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateAIContent = async () => {
    if (!formData.content && !audioBlob) return;
    setIsGeneratingAI(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let promptText = formData.content;

      // If we have audio but no text, we'd ideally transcribe it first.
      // For this prototype, we'll rely on the text input if available, or a generic prompt.
      if (!promptText) {
        promptText = "זיכרון קולי מרגש שנשמר לעתיד.";
      }

      // 1. Generate Summary/Poem
      const summaryResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on this memory/message: "${promptText}", write a short, poetic 2-sentence summary in Hebrew that captures the emotion. Do not include quotes.`
      });
      const summary = summaryResponse.text;

      // 2. Generate Image
      let imageUrl = '';
      try {
        const imageResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: `A dreamy, nostalgic, cinematic representation of this memory: ${promptText}. High quality, emotional.`,
          config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
        });
        
        for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            imageUrl = `data:image/jpeg;base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (imgErr) {
        console.error("Failed to generate capsule image", imgErr);
      }

      setAiGeneratedContent({ summary, imageUrl });

    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile?.coupleId || !formData.unlockDate) return;
    if (!formData.content && !audioBlob && !mediaFile) {
      showAlert("אנא הוסיפו טקסט, הקלטה קולית, תמונה או סרטון.");
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedAudioUrl = '';
      
      // Upload audio if exists
      if (audioBlob) {
        const audioRef = ref(storage, `time_capsules/${profile.coupleId}/${Date.now()}.webm`);
        await uploadBytes(audioRef, audioBlob);
        uploadedAudioUrl = await getDownloadURL(audioRef);
      }

      let uploadedImageUrl = aiGeneratedContent.imageUrl || null;
      let uploadedVideoUrl = null;
      
      // Upload media if exists
      if (mediaFile) {
        const mediaRef = ref(storage, `time_capsules/${profile.coupleId}/media_${Date.now()}_${mediaFile.name}`);
        await uploadBytes(mediaRef, mediaFile);
        const url = await getDownloadURL(mediaRef);
        if (mediaFile.type.startsWith('image/')) {
          uploadedImageUrl = url;
        } else if (mediaFile.type.startsWith('video/')) {
          uploadedVideoUrl = url;
        }
      }

      await addDoc(collection(db, 'time_capsules'), {
        coupleId: profile.coupleId,
        userId: user.uid,
        content: formData.content,
        audioUrl: uploadedAudioUrl,
        imageUrl: uploadedImageUrl,
        videoUrl: uploadedVideoUrl,
        aiSummary: aiGeneratedContent.summary || null,
        unlockDate: new Date(formData.unlockDate),
        createdAt: serverTimestamp()
      });
      
      setIsCreating(false);
      setFormData({ content: '', unlockDate: '' });
      setAudioBlob(null);
      setAudioUrl(null);
      setAiGeneratedContent({});
      setMediaFile(null);
      setMediaPreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            <Clock className="text-brand-gold" /> כמוסת זמן דיגיטלית
          </h2>
          <p className="text-white/40 italic">מסרים לעתיד שלכם.</p>
        </div>
        
        <button
          onClick={() => setIsCreating(true)}
          className="px-8 py-3 bg-brand-gold text-black rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-brand-gold/20"
        >
          <Lock size={20} /> הטמנת מסר חדש
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm text-white/60">המסר שלכם לעתיד (טקסט או הקלטה)</label>
                
                {/* Audio Recording UI */}
                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                  {!isRecording && !audioUrl ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-12 h-12 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center hover:bg-brand-gold hover:text-black transition-colors"
                    >
                      <Mic size={20} />
                    </button>
                  ) : isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors animate-pulse"
                    >
                      <Square size={20} className="fill-current" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 w-full">
                      <audio src={audioUrl!} controls className="h-10 flex-1" />
                      <button
                        type="button"
                        onClick={() => { setAudioBlob(null); setAudioUrl(null); }}
                        className="text-white/40 hover:text-red-400 p-2"
                      >
                        מחק
                      </button>
                    </div>
                  )}
                  
                  {isRecording && (
                    <div className="flex items-center gap-2 text-red-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      {formatTime(recordingTime)}
                    </div>
                  )}
                  {!isRecording && !audioUrl && (
                    <span className="text-sm text-white/40">הקליטו הודעה קולית...</span>
                  )}
                </div>

                {/* Media Upload UI */}
                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                  <label className="w-12 h-12 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center hover:bg-brand-gold hover:text-black transition-colors cursor-pointer">
                    <ImageIcon size={20} />
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                  </label>
                  {mediaPreview ? (
                    <div className="flex items-center gap-3 w-full">
                      {mediaFile?.type.startsWith('video/') ? (
                        <video src={mediaPreview} className="h-10 rounded" />
                      ) : (
                        <img src={mediaPreview} alt="Preview" className="h-10 rounded object-cover" />
                      )}
                      <span className="text-sm text-white/80 truncate flex-1">{mediaFile?.name}</span>
                      <button
                        type="button"
                        onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                        className="text-white/40 hover:text-red-400 p-2"
                      >
                        מחק
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-white/40">העלו תמונה או סרטון...</span>
                  )}
                </div>

                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="או כתבו כאן את המסר שלכם..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white focus:outline-none focus:border-brand-gold/50 min-h-[120px] text-right"
                />
              </div>
              
              {/* AI Generation Trigger */}
              {(formData.content || audioBlob) && !aiGeneratedContent.imageUrl && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={generateAIContent}
                    disabled={isGeneratingAI}
                    className="px-6 py-3 bg-brand-gold/10 text-brand-gold rounded-xl text-sm font-medium hover:bg-brand-gold/20 transition-colors flex items-center gap-2"
                  >
                    {isGeneratingAI ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    העשירו את הכמוסה עם AI (תמונה ותקציר)
                  </button>
                </div>
              )}

              {/* AI Generated Preview */}
              {aiGeneratedContent.imageUrl && (
                <div className="bg-black/20 rounded-2xl p-4 border border-brand-gold/20 space-y-4">
                  <div className="flex items-center gap-2 text-brand-gold text-sm mb-2">
                    <Sparkles size={14} /> נוצר ע"י AI
                  </div>
                  <img src={aiGeneratedContent.imageUrl} alt="AI Generated Memory" className="w-full h-48 object-cover rounded-xl" />
                  {aiGeneratedContent.summary && (
                    <p className="text-white/80 italic text-center font-serif">"{aiGeneratedContent.summary}"</p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm text-white/60">מתי הכמוסה תיפתח?</label>
                <input
                  type="date"
                  value={formData.unlockDate}
                  onChange={e => setFormData({ ...formData, unlockDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 text-right"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 text-white/40 hover:text-white">ביטול</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
                  הטמנה
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-6">
        {capsules.map((capsule) => (
          <motion.div
            key={capsule.id}
            className={`relative overflow-hidden rounded-3xl border p-8 transition-all ${
              capsule.isUnlocked 
                ? 'bg-white/10 border-brand-gold/30' 
                : 'bg-white/5 border-white/10 grayscale'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${capsule.isUnlocked ? 'bg-brand-gold/20 text-brand-gold' : 'bg-white/10 text-white/40'}`}>
                {capsule.isUnlocked ? <Unlock size={24} /> : <Lock size={24} />}
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">תאריך פתיחה</p>
                <p className="text-sm font-bold text-white">{capsule.unlockDate?.toDate?.()?.toLocaleDateString('he-IL')}</p>
              </div>
            </div>

            {capsule.isUnlocked ? (
              <div className="space-y-6">
                {capsule.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden mb-4 border border-white/10">
                    <img src={capsule.imageUrl} alt="Capsule Memory" className="w-full h-48 object-cover" />
                    {capsule.aiSummary && (
                      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-brand-gold flex items-center gap-1">
                        <Sparkles size={10} /> AI
                      </div>
                    )}
                  </div>
                )}
                
                {capsule.videoUrl && (
                  <div className="relative rounded-xl overflow-hidden mb-4 border border-white/10">
                    <video src={capsule.videoUrl} controls className="w-full h-48 object-cover" />
                  </div>
                )}
                
                {capsule.aiSummary && (
                  <div className="bg-brand-gold/5 border border-brand-gold/20 p-4 rounded-xl text-center">
                    <p className="text-brand-gold font-serif italic">"{capsule.aiSummary}"</p>
                  </div>
                )}

                {capsule.audioUrl && (
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <audio src={capsule.audioUrl} controls className="w-full h-8" />
                  </div>
                )}

                {capsule.content && (
                  <p className="text-white leading-relaxed text-right bg-white/5 p-4 rounded-xl border border-white/5">
                    {capsule.content}
                  </p>
                )}
                
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest">
                  <span>נכתב ב: {capsule.createdAt?.toDate?.()?.toLocaleDateString('he-IL')}</span>
                  <History size={14} />
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-8 text-center">
                <p className="text-white/20 italic">המסר הזה עדיין נעול...</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-[10px] text-white/40 uppercase tracking-widest">
                  <Clock size={12} /> עוד {Math.ceil(((capsule.unlockDate?.toDate?.()?.getTime() || 0) - new Date().getTime()) / (1000 * 60 * 60 * 24))} ימים
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {capsules.length === 0 && !isCreating && (
          <div className="md:col-span-2 text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <Clock size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/40 italic">אין עדיין כמוסות זמן. מה תרצו להגיד לעצמכם בעתיד?</p>
          </div>
        )}
      </div>
    </div>
  );
};

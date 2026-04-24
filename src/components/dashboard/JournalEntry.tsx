import React, { useState, useEffect, useRef } from 'react';
import { Mic, ExternalLink, Volume2, Save, Loader2, ImageIcon, RefreshCw, Sparkles, StopCircle, Bell, Play, Pause, X, Bold, Italic, List, ListOrdered, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useAlert } from '../AlertModal';
import { cn } from '../../lib/utils';
import { doc, updateDoc, arrayUnion, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { GoogleGenAI } from '@google/genai';

export const JournalEntry = ({ existingTags = [] }: { existingTags?: string[] }) => {
  const { user, profile } = useFirebase();
  const { showAlert } = useAlert();
  const [isRecording, setIsRecording] = useState(false);
  const [audioTranscription, setAudioTranscription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [dailyPrompt, setDailyPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  
  const [isShared, setIsShared] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reminderDate, setReminderDate] = useState<string>('');
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setIsUploadingImage(true);
      try {
        const imageRef = ref(storage, `journal_images/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        setImageUrl(url);
      } catch (error) {
        console.error('Error uploading image:', error);
        showAlert('שגיאה בהעלאת התמונה');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };
  const audioChunksRef = useRef<Blob[]>([]);
  
  const recognitionRef = useRef<any>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = audioTranscription;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    setAudioTranscription(`${before}${prefix}${selected}${suffix}${after}`);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  useEffect(() => {
    // Initialize Speech Recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'he-IL'; // Hebrew

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setAudioTranscription(prev => {
          const newText = prev + (prev.endsWith(' ') ? '' : ' ') + currentTranscript;
          return newText;
        });
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      recognitionRef.current?.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      showAlert('לא ניתן לגשת למיקרופון.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false);
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const generateDailyPrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const recentEntries = profile?.journalEntries?.slice(-3).map((e: any) => e.text).join('\n') || '';
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on these recent journal entries (if any): "${recentEntries}". Generate a unique, deep, and thought-provoking daily journal prompt for a couple to answer together or individually. It should be in Hebrew, romantic or reflective, and encourage meaningful conversation. Return ONLY the prompt text.`,
        config: {
          systemInstruction: 'You are a relationship coach. Generate a single, inspiring daily prompt in Hebrew.'
        }
      });
      
      const prompt = response.text || 'על מה אתם הכי אסירי תודה בזוגיות שלכם היום?';
      setDailyPrompt(prompt);
      setAudioTranscription(prev => prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`);
    } catch (error) {
      console.error('Error generating prompt:', error);
      showAlert('שגיאה ביצירת שאלת היום');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    if (value.startsWith('#')) {
      const query = value.slice(1).toLowerCase();
      const allTags = existingTags.length > 0 ? existingTags : ['אהבה', 'זיכרון', 'תאריך', 'הרגשה', 'טיול', 'משפחה'];
      setSuggestedTags(allTags.filter(t => t.toLowerCase().includes(query) && !tags.includes(t)));
    } else {
      setSuggestedTags([]);
    }
  };

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.replace('#', '').trim();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
    setSuggestedTags([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput) {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSaveJournal = async () => {
    if (!audioTranscription.trim() || !user) return;
    setIsSaving(true);
    try {
      let finalAudioUrl = null;
      if (audioBlob) {
        const audioRef = ref(storage, `journal_audio/${user.uid}/${Date.now()}.webm`);
        await uploadBytes(audioRef, audioBlob);
        finalAudioUrl = await getDownloadURL(audioRef);
      }

      const entryData = {
        content: audioTranscription,
        timestamp: new Date().toISOString(),
        type: isShared ? 'shared' : 'thoughts',
        isShared,
        aiSummary: '',
        userId: user.uid,
        reminderDate: reminderDate || null,
        voiceUrl: finalAudioUrl,
        imageUrl: imageUrl,
        tags: tags
      };

      if (isShared && profile?.coupleId) {
        await addDoc(collection(db, 'couples', profile.coupleId, 'shared_journal'), entryData);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'journal'), entryData);
      }

      showAlert(isShared ? 'היומן המשותף עודכן!' : 'היומן האישי נשמר בהצלחה!');
      setAudioTranscription('');
      setDailyPrompt('');
      setIsShared(false);
      setReminderDate('');
      setAudioBlob(null);
      setAudioUrl(null);
      setImageUrl(null);
      setTags([]);
    } catch (error) {
      console.error("Error saving journal:", error);
      showAlert('שגיאה בשמירת היומן');
    } finally {
      setIsSaving(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white border border-brand-gold/10 p-8 rounded-3xl shadow-sm">
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={generateDailyPrompt}
          disabled={isGeneratingPrompt}
          className="text-[10px] uppercase tracking-widest px-4 py-2 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 flex items-center gap-2 transition-all disabled:opacity-50 rounded-lg"
        >
          {isGeneratingPrompt ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          שאלת היום (AI)
        </button>
        
        <button 
          onClick={toggleRecording}
          className={`text-[10px] uppercase tracking-widest px-4 py-2 flex items-center gap-2 border transition-all rounded-lg ${
            isRecording ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'text-brand-black/40 border-brand-gold/20 hover:text-brand-gold'
          }`}
        >
          {isRecording ? <StopCircle size={12} /> : <Mic size={12} />} 
          {isRecording ? 'עצור הקלטה' : 'הקלטה קולית'}
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] uppercase tracking-widest text-brand-black/40">פרטי</span>
          <button 
            onClick={() => setIsShared(!isShared)}
            className={`w-12 h-6 rounded-full transition-all relative ${isShared ? 'bg-brand-gold' : 'bg-brand-cream'}`}
          >
            <motion.div 
              animate={{ x: isShared ? 24 : 4 }}
              className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </button>
          <span className="text-[10px] uppercase tracking-widest text-brand-black/40">משותף</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-2 p-2 bg-brand-cream/50 rounded-lg">
        <button onClick={() => insertMarkdown('**', '**')} className="p-1.5 hover:bg-white rounded text-brand-black/60 hover:text-brand-black transition-colors" title="Bold"><Bold size={16} /></button>
        <button onClick={() => insertMarkdown('*', '*')} className="p-1.5 hover:bg-white rounded text-brand-black/60 hover:text-brand-black transition-colors" title="Italic"><Italic size={16} /></button>
        <button onClick={() => insertMarkdown('- ', '')} className="p-1.5 hover:bg-white rounded text-brand-black/60 hover:text-brand-black transition-colors" title="Bullet List"><List size={16} /></button>
        <button onClick={() => insertMarkdown('1. ', '')} className="p-1.5 hover:bg-white rounded text-brand-black/60 hover:text-brand-black transition-colors" title="Numbered List"><ListOrdered size={16} /></button>
        <button onClick={() => insertMarkdown('> ', '')} className="p-1.5 hover:bg-white rounded text-brand-black/60 hover:text-brand-black transition-colors" title="Quote"><Quote size={16} /></button>
      </div>

      <textarea 
        ref={textareaRef}
        placeholder={isShared ? "כתבו משהו לשניכם..." : "זהו המרחב הבטוח שלכם. כתבו כאן הכל..."}
        className="w-full h-48 bg-brand-cream/30 border-none focus:ring-0 font-serif text-lg resize-none p-4 leading-relaxed outline-none rounded-2xl"
        aria-label="תוכן היומן"
        value={audioTranscription}
        onChange={(e) => setAudioTranscription(e.target.value)}
      ></textarea>
      
      {isRecording && (
        <div className="mb-6 p-4 bg-red-500/10 border-l-2 border-red-500 flex items-start gap-3 rounded-r-lg">
          <Mic size={16} className="text-red-500 shrink-0 mt-1 animate-pulse" />
          <p className="text-xs text-red-500/80 italic">מקשיב... דברו עכשיו והטקסט יתווסף אוטומטית.</p>
        </div>
      )}

      {isAnalyzing && (
        <div className="mb-6 p-4 bg-brand-gold/5 border-l-2 border-brand-gold flex items-center gap-3 rounded-r-lg">
          <Loader2 size={16} className="text-brand-gold animate-spin" />
          <p className="text-xs text-brand-gold font-bold uppercase tracking-widest">הבינה המלאכותית מנתחת את התובנות שלכם...</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-brand-gold/10 text-brand-gold rounded-full text-[10px] font-bold uppercase tracking-widest">
              #{tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleKeyDown}
            placeholder="הוספת תגיות (לדוגמה: #אהבה, #טיול)... לחצו Enter להוספה"
            className="w-full bg-transparent border-b border-brand-gold/20 pb-2 text-sm focus:outline-none focus:border-brand-gold transition-colors placeholder:text-brand-black/20"
            dir="rtl"
          />
          <AnimatePresence>
            {suggestedTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-full bg-white border border-brand-gold/10 rounded-xl shadow-lg z-10 p-2 flex flex-wrap gap-2"
              >
                {suggestedTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="px-3 py-1 bg-brand-cream/30 hover:bg-brand-gold/10 text-brand-black/60 hover:text-brand-gold rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
        <div className="flex items-center gap-4">
          <label className="cursor-pointer flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-black/40 hover:text-brand-gold transition-colors">
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
            {isUploadingImage ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />} 
            {imageUrl ? 'תמונה הועלתה' : 'הוספת תמונה'}
          </label>

          <div className="relative">
            <button 
              onClick={() => setShowReminderPicker(!showReminderPicker)}
              className={cn(
                "flex items-center gap-2 text-[10px] uppercase tracking-widest transition-colors",
                reminderDate ? "text-brand-gold" : "text-brand-black/40 hover:text-brand-gold"
              )}
            >
              <Bell size={16} /> {reminderDate ? 'תזכורת הוגדרה' : 'הגדרת תזכורת'}
            </button>
            <AnimatePresence>
              {showReminderPicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-4 p-4 bg-white rounded-2xl shadow-xl border border-brand-gold/10 z-50 w-64"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-3">מתי להזכיר לך?</p>
                  <input 
                    type="datetime-local" 
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full p-2 bg-brand-cream/30 border border-brand-gold/10 rounded-lg text-xs focus:outline-none"
                  />
                  <button 
                    onClick={() => setShowReminderPicker(false)}
                    className="w-full mt-3 py-2 bg-brand-black text-white text-[8px] font-bold uppercase tracking-widest rounded-lg"
                  >
                    אישור
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {audioUrl && (
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-gold/10 rounded-full">
              <Volume2 size={14} className="text-brand-gold" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-brand-gold">הקלטה מוכנה</span>
              <button onClick={() => setAudioUrl(null)} className="text-brand-gold/40 hover:text-red-500">
                <StopCircle size={12} />
              </button>
            </div>
          )}
        </div>
        <button 
          onClick={handleSaveJournal}
          disabled={!audioTranscription.trim() || isSaving}
          className="px-10 py-4 bg-brand-black text-white text-[10px] font-bold tracking-widest uppercase hover:bg-brand-gold transition-all disabled:opacity-50 flex items-center gap-2 rounded-xl"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
          {isShared ? 'שמירה ביומן המשותף' : 'שמירה במרחב הבטוח'}
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Play, Pause, Trash2, Send, Loader2, Volume2, Clock } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAlert } from './AlertModal';

interface VoiceNote {
  id: string;
  audioUrl: string; // Base64 string for this simple implementation
  createdAt: any;
  userId: string;
  duration: number;
}

export const VoiceNotes = () => {
  const { user, profile } = useFirebase();
  const { showAlert } = useAlert();
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!profile?.coupleId) return;

    const q = query(
      collection(db, 'voice_notes'),
      where('coupleId', '==', profile.coupleId)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list: VoiceNote[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as VoiceNote));
      list.sort((a, b) => {
        const dateA = (a as any).createdAt?.toDate() || new Date(0);
        const dateB = (b as any).createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setNotes(list);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.coupleId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      showAlert('לא ניתן לגשת למיקרופון. ודאו שהרשאות מאופשרות.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const saveRecording = async () => {
    if (!audioBlob || !user || !profile?.coupleId) return;
    setIsSubmitting(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        await addDoc(collection(db, 'voice_notes'), {
          coupleId: profile.coupleId,
          userId: user.uid,
          audioUrl: base64Audio,
          duration: recordingTime,
          createdAt: serverTimestamp()
        });
        
        setAudioBlob(null);
        setRecordingTime(0);
        setIsSubmitting(false);
      };
    } catch (err) {
      console.error('Error saving voice note:', err);
      setIsSubmitting(false);
    }
  };

  const playAudio = (id: string, url: string) => {
    if (playingId === id) {
      audioPlayerRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const audio = new Audio(url);
    audioPlayerRef.current = audio;
    
    audio.onended = () => setPlayingId(null);
    audio.play();
    setPlayingId(id);
  };

  const deleteNote = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      if (playingId === deleteConfirmId) {
        audioPlayerRef.current?.pause();
        setPlayingId(null);
      }
      await deleteDoc(doc(db, 'voice_notes', deleteConfirmId));
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-white flex items-center justify-center gap-3">
          <Volume2 className="text-brand-gold" /> הודעות קוליות
        </h2>
        <p className="text-white/40 italic">לפעמים עדיף לשמוע את הקול שלך.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 w-full max-w-md">
          {!audioBlob ? (
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-red-500/20 text-red-500 border-2 border-red-500 animate-pulse' 
                    : 'bg-brand-gold/10 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold hover:text-black'
                }`}
              >
                {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={32} />}
              </button>
              
              {isRecording ? (
                <div className="text-red-500 font-mono text-xl font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {formatTime(recordingTime)}
                </div>
              ) : (
                <p className="text-white/40 text-sm">לחצו כדי להקליט הודעה</p>
              )}
            </div>
          ) : (
            <div className="bg-black/40 border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">הקלטה מוכנה ({formatTime(recordingTime)})</span>
                <div className="flex gap-2">
                  <button onClick={cancelRecording} className="p-2 text-white/40 hover:text-white transition-colors">
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={saveRecording}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    שליחה
                  </button>
                </div>
              </div>
              
              {/* Audio preview */}
              <audio controls src={URL.createObjectURL(audioBlob)} className="w-full h-10" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-serif text-white mb-6">הודעות אחרונות</h3>
        
        {notes.map((note) => {
          const isMine = note.userId === user?.uid;
          const isPlaying = playingId === note.id;
          
          return (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex items-center gap-4 p-4 rounded-3xl ${
                isMine 
                  ? 'bg-brand-gold/10 border border-brand-gold/20 rounded-tr-sm' 
                  : 'bg-white/5 border border-white/10 rounded-tl-sm'
              }`}>
                <button
                  onClick={() => playAudio(note.id, note.audioUrl)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isPlaying 
                      ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' 
                      : 'bg-black/40 text-brand-gold hover:bg-brand-gold/20'
                  }`}
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
                
                <div className="flex-1 min-w-[150px]">
                  <div className="h-1 bg-black/40 rounded-full overflow-hidden relative">
                    {isPlaying && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: note.duration, ease: "linear" }}
                        className="absolute inset-y-0 left-0 bg-brand-gold"
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-white/40">
                    <span>{formatTime(note.duration)}</span>
                    <span>{note.createdAt?.toDate?.()?.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {isMine && (
                  <button onClick={() => deleteNote(note.id)} className="text-white/20 hover:text-red-500 transition-colors p-2">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {notes.length === 0 && (
          <div className="text-center py-12 text-white/20 italic">
            אין הודעות קוליות. היו הראשונים לשלוח!
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-2xl font-serif mb-4 text-brand-black">מחיקת הודעה קולית</h3>
              <p className="text-brand-black/60 mb-8">האם אתם בטוחים שברצונכם למחוק הודעה זו? פעולה זו אינה הפיכה.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 bg-brand-cream text-brand-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-gold/10 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
                >
                  מחיקה
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

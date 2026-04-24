import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Lock, Users, Calendar, Search, Filter, Sparkles, Brain, MessageCircle, Clock, ChevronDown, Trash2, Loader2, Palette, Bell, Volume2, Tag, Share2, X } from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useUI } from '../../contexts/UIContext';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { JournalEntry as NewJournalEntry } from './JournalEntry';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

import { useAlert } from '../AlertModal';

const THEMES = {
  classic: {
    bg: 'bg-white',
    accent: 'text-brand-gold',
    button: 'bg-brand-gold',
    border: 'border-brand-gold/10',
    cream: 'bg-brand-cream',
    name: 'קלאסי'
  },
  midnight: {
    bg: 'bg-slate-900',
    accent: 'text-blue-400',
    button: 'bg-blue-600',
    border: 'border-blue-500/20',
    cream: 'bg-slate-800',
    name: 'חצות'
  },
  rose: {
    bg: 'bg-rose-50',
    accent: 'text-rose-500',
    button: 'bg-rose-500',
    border: 'border-rose-200',
    cream: 'bg-rose-100/50',
    name: 'ורד'
  },
  emerald: {
    bg: 'bg-emerald-50',
    accent: 'text-emerald-600',
    button: 'bg-emerald-600',
    border: 'border-emerald-200',
    cream: 'bg-emerald-100/50',
    name: 'אזמרגד'
  }
};

export const Journal = () => {
  const { profile, user } = useFirebase();
  const { isAccessibilityMenuOpen, accessibilitySettings } = useUI();
  const { showAlert } = useAlert();
  const [view, setView] = React.useState<'private' | 'shared'>('private');
  const [entries, setEntries] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [filterType, setFilterType] = React.useState<'all' | 'text' | 'image' | 'voice'>('all');
  const [dateFilter, setDateFilter] = React.useState<'all' | 'today' | 'week' | 'month' | 'last7days' | 'lastmonth' | 'lastyear' | 'custom'>('all');
  const [customDateRange, setCustomDateRange] = React.useState({ start: '', end: '' });
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [theme, setTheme] = React.useState<keyof typeof THEMES>('classic');
  const [showThemePicker, setShowThemePicker] = React.useState(false);
  const [generatingSummaryId, setGeneratingSummaryId] = React.useState<string | null>(null);
  const [generatingImageId, setGeneratingImageId] = React.useState<string | null>(null);
  const [activeCommentEntryId, setActiveCommentEntryId] = React.useState<string | null>(null);
  const [commentText, setCommentText] = React.useState('');

  const currentTheme = THEMES[theme];

  const filteredEntries = entries.filter(entry => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = entry.content.toLowerCase().includes(searchLower) || 
                         (entry.aiSummary && entry.aiSummary.toLowerCase().includes(searchLower)) ||
                         (entry.tags && entry.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)));
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'image' && entry.imageUrl) || 
                       (filterType === 'voice' && entry.voiceUrl) ||
                       (filterType === 'text' && !entry.imageUrl && !entry.voiceUrl);

    const entryDate = new Date(entry.timestamp);
    const now = new Date();
    const matchesDate = dateFilter === 'all' ||
                       (dateFilter === 'today' && entryDate.toDateString() === now.toDateString()) ||
                       (dateFilter === 'week' && (now.getTime() - entryDate.getTime()) < 7 * 24 * 60 * 60 * 1000) ||
                       (dateFilter === 'month' && (now.getTime() - entryDate.getTime()) < 30 * 24 * 60 * 60 * 1000) ||
                       (dateFilter === 'last7days' && (now.getTime() - entryDate.getTime()) < 7 * 24 * 60 * 60 * 1000) ||
                       (dateFilter === 'lastmonth' && (now.getTime() - entryDate.getTime()) < 30 * 24 * 60 * 60 * 1000) ||
                       (dateFilter === 'lastyear' && (now.getTime() - entryDate.getTime()) < 365 * 24 * 60 * 60 * 1000) ||
                       (dateFilter === 'custom' && (!customDateRange.start || entryDate >= new Date(customDateRange.start)) && (!customDateRange.end || entryDate <= new Date(customDateRange.end)));

    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => entry.tags?.includes(tag));

    return matchesSearch && matchesType && matchesDate && matchesTags;
  });

  React.useEffect(() => {
    const fetchEntries = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let q;
        if (view === 'private') {
          q = query(
            collection(db, 'users', user.uid, 'journal'),
            orderBy('timestamp', 'desc')
          );
        } else if (profile?.coupleId) {
          q = query(
            collection(db, 'couples', profile.coupleId, 'shared_journal'),
            orderBy('timestamp', 'desc')
          );
        } else {
          setEntries([]);
          setLoading(false);
          return;
        }

        const snapshot = await getDocs(q);
        setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })));
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [view, user, profile?.coupleId]);

  const handleDelete = async (id: string) => {
    try {
      if (view === 'private') {
        await deleteDoc(doc(db, 'users', user!.uid, 'journal', id));
      } else {
        await deleteDoc(doc(db, 'couples', profile!.coupleId!, 'shared_journal', id));
      }
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'journal');
    }
  };

  const handleDismissReminder = async (id: string) => {
    try {
      if (view === 'private') {
        await updateDoc(doc(db, 'users', user!.uid, 'journal', id), { reminderDate: null });
      } else {
        await updateDoc(doc(db, 'couples', profile!.coupleId!, 'shared_journal', id), { reminderDate: null });
      }
      setEntries(prev => prev.map(e => e.id === id ? { ...e, reminderDate: null } : e));
    } catch (error) {
      console.error("Error dismissing reminder:", error);
    }
  };

  const generateSummary = async (entryId: string, content: string) => {
    if (!process.env.GEMINI_API_KEY) return;
    
    setGeneratingSummaryId(entryId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `צור סיכום קצר ותובנה רגשית (עד 2 משפטים) עבור קטע היומן הבא. כתוב בעברית, בגוף שני (אתה/את), ובנימה אמפתית ומכילה:\n\n${content}`
      });
      
      const summary = response.text;
      if (summary) {
        if (view === 'private') {
          await updateDoc(doc(db, 'users', user!.uid, 'journal', entryId), { aiSummary: summary });
        } else {
          await updateDoc(doc(db, 'couples', profile!.coupleId!, 'shared_journal', entryId), { aiSummary: summary });
        }
        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, aiSummary: summary } : e));
      }
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setGeneratingSummaryId(null);
    }
  };

  const generateImage = async (entryId: string, content: string) => {
    if (!process.env.GEMINI_API_KEY) return;
    
    setGeneratingImageId(entryId);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: `צור תמונה שמתארת את הזיכרון הבא: ${content}`,
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      });
      
      let imageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }

      if (imageUrl) {
        if (view === 'private') {
          await updateDoc(doc(db, 'users', user!.uid, 'journal', entryId), { imageUrl: imageUrl });
        } else {
          await updateDoc(doc(db, 'couples', profile!.coupleId!, 'shared_journal', entryId), { imageUrl: imageUrl });
        }
        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, imageUrl: imageUrl } : e));
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setGeneratingImageId(null);
    }
  };

  const handleShare = async (entry: any) => {
    if (!profile?.coupleId || !user) return;
    
    try {
      const sharedEntry = {
        ...entry,
        sharedBy: user.uid,
        sharedAt: new Date().toISOString()
      };
      delete sharedEntry.id; // Remove the old ID so Firestore generates a new one
      
      await addDoc(collection(db, 'couples', profile.coupleId, 'shared_journal'), sharedEntry);
      
      // Optionally, we could delete the private entry, but copying is safer.
      // For now, we'll just alert the user or show a success state.
      showAlert('הזיכרון שותף בהצלחה עם בן/בת הזוג!');
    } catch (error) {
      console.error("Error sharing entry:", error);
      showAlert('שגיאה בשיתוף הזיכרון');
    }
  };

  const handleAddComment = async (entryId: string) => {
    if (!commentText.trim() || !user) return;
    
    try {
      const newComment = {
        id: Date.now().toString(),
        text: commentText,
        userId: user.uid,
        userName: profile?.name || 'משתמש',
        timestamp: new Date().toISOString()
      };

      const entryRef = view === 'private' 
        ? doc(db, 'users', user.uid, 'journal', entryId)
        : doc(db, 'couples', profile!.coupleId!, 'shared_journal', entryId);

      const entry = entries.find(e => e.id === entryId);
      const updatedComments = [...(entry?.comments || []), newComment];

      await updateDoc(entryRef, { comments: updatedComments });
      
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, comments: updatedComments } : e));
      setCommentText('');
      setActiveCommentEntryId(null);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleGeneralShare = (entry: any) => {
    if (navigator.share) {
      navigator.share({
        title: 'זיכרון מהיומן הזוגי',
        text: entry.content,
        url: window.location.href,
      }).catch(console.error);
    } else {
      showAlert('השיתוף אינו נתמך בדפדפן זה');
    }
  };

  const handleQuickReminder = async (entryId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const reminderDate = tomorrow.toISOString();

    try {
      const entryRef = view === 'private' 
        ? doc(db, 'users', user!.uid, 'journal', entryId)
        : doc(db, 'couples', profile!.coupleId!, 'shared_journal', entryId);

      await updateDoc(entryRef, { reminderDate });
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, reminderDate } : e));
      showAlert('תזכורת הוגדרה למחר ב-10:00');
    } catch (error) {
      console.error("Error setting quick reminder:", error);
    }
  };

  const accessibilityClasses = isAccessibilityMenuOpen ? cn(
    accessibilitySettings.fontSize === 'large' && 'text-lg',
    accessibilitySettings.fontSize === 'xlarge' && 'text-xl',
    accessibilitySettings.highContrast && 'contrast-150',
    accessibilitySettings.grayscale && 'grayscale',
    accessibilitySettings.readableFont && 'font-sans',
  ) : '';

  return (
    <div className={cn("space-y-8 p-8 rounded-[40px] transition-all duration-500", currentTheme.bg, accessibilityClasses)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl", currentTheme.cream)}>
            <Book className={currentTheme.accent} size={24} />
          </div>
          <div>
            <h3 className={cn("text-lg font-serif", theme === 'midnight' ? 'text-white' : 'text-brand-black')}>יומן הזוגיות</h3>
            <p className={cn("text-xs uppercase tracking-widest font-bold", theme === 'midnight' ? 'text-white/40' : 'text-brand-black/40')}>המרחב הבטוח למחשבות וזכרונות</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowThemePicker(!showThemePicker)}
              className={cn("p-2 rounded-xl transition-all", theme === 'midnight' ? 'text-white/40 hover:text-blue-400' : 'text-brand-black/40 hover:text-brand-gold')}
            >
              <Palette size={20} />
            </button>
            <AnimatePresence>
              {showThemePicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-brand-gold/10 z-50 w-48"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-3">בחירת עיצוב</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(THEMES).map(([key, t]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setTheme(key as keyof typeof THEMES);
                          setShowThemePicker(false);
                        }}
                        className={cn(
                          "px-3 py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all border",
                          theme === key ? "border-brand-gold bg-brand-gold/5 text-brand-gold" : "border-transparent bg-brand-cream/30 text-brand-black/40 hover:bg-brand-cream"
                        )}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={cn("flex p-1 rounded-2xl border", theme === 'midnight' ? 'bg-slate-800 border-white/10' : 'bg-brand-cream/30 border-brand-gold/10')}>
            <button 
              onClick={() => setView('private')}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all",
                view === 'private' 
                  ? (theme === 'midnight' ? "bg-blue-600 text-white shadow-sm" : "bg-white text-brand-black shadow-sm") 
                  : (theme === 'midnight' ? "text-white/40 hover:text-white" : "text-brand-black/40 hover:text-brand-black")
              )}
            >
              <Lock size={12} />
              יומן אישי
            </button>
            <button 
              onClick={() => setView('shared')}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all",
                view === 'shared' 
                  ? (theme === 'midnight' ? "bg-blue-600 text-white shadow-sm" : "bg-white text-brand-black shadow-sm") 
                  : (theme === 'midnight' ? "text-white/40 hover:text-white" : "text-brand-black/40 hover:text-brand-black")
              )}
            >
              <Users size={12} />
              יומן משותף
            </button>
          </div>
        </div>
      </div>

      <NewJournalEntry existingTags={Array.from(new Set(entries.flatMap(e => e.tags || [])))} />

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/50 p-4 rounded-2xl border border-brand-gold/10 shadow-sm">
          <div className="relative w-full md:flex-1">
            <input 
              type="text" 
              placeholder="חיפוש ביומן לפי מילות מפתח, תגיות, או תוכן..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-12 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all shadow-inner",
                theme === 'midnight' 
                  ? "bg-slate-800 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-400" 
                  : "bg-brand-cream/30 border-brand-gold/20 text-brand-black focus:ring-brand-gold"
              )}
            />
            <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2", theme === 'midnight' ? 'text-white/40' : 'text-brand-black/40')} size={18} />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-bold transition-all whitespace-nowrap",
              showFilters 
                ? (theme === 'midnight' ? "bg-blue-600 text-white shadow-md" : "bg-brand-gold text-white shadow-md") 
                : (theme === 'midnight' ? "bg-slate-800 text-white/60 hover:text-white border border-white/10" : "bg-white text-brand-black/60 hover:text-brand-black border border-brand-gold/20")
            )}
          >
            <Filter size={16} />
            סינון מתקדם
          </button>
        </div>

        <div className="flex items-center justify-between mt-8">
          <h4 className={cn("text-sm font-black uppercase tracking-widest", theme === 'midnight' ? 'text-white/40' : 'text-brand-black/40')}>
            {view === 'private' ? 'הערכים האישיים שלך' : 'הזיכרונות המשותפים שלכם'}
          </h4>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-brand-cream/20 p-6 rounded-3xl border border-brand-gold/10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-3">סוג תוכן</p>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'text', 'image', 'voice'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                          filterType === type ? "bg-brand-gold text-white" : "bg-white text-brand-black/40 hover:bg-brand-gold/10"
                        )}
                      >
                        {type === 'all' ? 'הכל' : type === 'text' ? 'טקסט' : type === 'image' ? 'תמונות' : 'הקלטות'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-3">תגיות</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(entries.flatMap(e => e.tags || []))).map((tag: string) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                          selectedTags.includes(tag) ? "bg-brand-gold text-white" : "bg-white text-brand-black/40 hover:bg-brand-gold/10"
                        )}
                      >
                        #{tag}
                      </button>
                    ))}
                    {entries.flatMap(e => e.tags || []).length === 0 && (
                      <span className="text-xs text-brand-black/40">אין תגיות עדיין</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/40 mb-3">זמן</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(['all', 'today', 'week', 'month', 'last7days', 'lastmonth', 'lastyear', 'custom'] as const).map((date) => (
                      <button
                        key={date}
                        onClick={() => setDateFilter(date)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                          dateFilter === date ? "bg-brand-gold text-white" : "bg-white text-brand-black/40 hover:bg-brand-gold/10"
                        )}
                      >
                        {date === 'all' ? 'הכל' : date === 'today' ? 'היום' : date === 'week' ? 'השבוע' : date === 'month' ? 'החודש' : date === 'last7days' ? '7 ימים אחרונים' : date === 'lastmonth' ? 'חודש אחרון' : date === 'lastyear' ? 'שנה אחרונה' : 'מותאם אישית'}
                      </button>
                    ))}
                  </div>
                  {dateFilter === 'custom' && (
                    <div className="flex items-center gap-4 mt-2">
                      <input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="p-2 border rounded-lg text-xs bg-white text-brand-black border-brand-gold/10 focus:ring-brand-gold"
                      />
                      <span className="text-brand-black/40">-</span>
                      <input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="p-2 border rounded-lg text-xs bg-white text-brand-black border-brand-gold/10 focus:ring-brand-gold"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-gold" size={32} />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-brand-gold/10 text-center">
            <Book className="text-brand-gold/20 mx-auto mb-4" size={48} />
            <p className="text-brand-black/60">לא נמצאו ערכים התואמים את החיפוש שלך.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-8 rounded-3xl shadow-sm border group transition-all",
                  theme === 'midnight' ? "bg-slate-800 border-white/10" : "bg-white border-brand-gold/10"
                )}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", currentTheme.cream)}>
                      <Calendar size={18} className={currentTheme.accent} />
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold uppercase tracking-widest", theme === 'midnight' ? 'text-white/40' : 'text-brand-black/40')}>
                        {new Date(entry.timestamp).toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest", currentTheme.accent)}>
                        {new Date(entry.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.reminderDate && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-brand-gold/10 rounded-lg group/reminder">
                        <Bell size={10} className="text-brand-gold" />
                        <span className="text-[8px] font-bold text-brand-gold uppercase tracking-widest">תזכורת</span>
                        <button 
                          onClick={() => handleDismissReminder(entry.id)}
                          className="ml-1 text-brand-gold/50 hover:text-brand-gold opacity-0 group-hover/reminder:opacity-100 transition-opacity"
                          title="הסר תזכורת"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-brand-black/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className={cn("prose prose-lg font-serif leading-relaxed mb-8", theme === 'midnight' ? 'text-white/80' : 'text-brand-black')}>
                  <div className="markdown-body">
                    <Markdown>{entry.content}</Markdown>
                  </div>
                </div>

                {entry.imageUrl && (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-brand-gold/10">
                    <img src={entry.imageUrl} alt="Journal Attachment" className="w-full h-auto object-cover max-h-96" />
                  </div>
                )}

                {entry.voiceUrl && (
                  <div className={cn("mb-6 p-4 rounded-2xl flex items-center gap-4", currentTheme.cream)}>
                    <button 
                      onClick={() => {
                        const audio = new Audio(entry.voiceUrl);
                        audio.play();
                      }}
                      className={cn("p-3 rounded-full text-white hover:opacity-80 transition-opacity", currentTheme.button)}
                    >
                      <Volume2 size={20} />
                    </button>
                    <div className="flex-1">
                      <div className={cn("h-1 w-full rounded-full", theme === 'midnight' ? 'bg-white/10' : 'bg-brand-black/10')}>
                        <div className={cn("h-full w-1/3 rounded-full", currentTheme.button)}></div>
                      </div>
                      <p className={cn("text-[8px] font-bold uppercase tracking-widest mt-2", theme === 'midnight' ? 'text-white/40' : 'text-brand-black/40')}>הודעה קולית מצורפת</p>
                    </div>
                  </div>
                )}

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {entry.tags.map((tag: string) => (
                      <span key={tag} className={cn("px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest", currentTheme.cream, currentTheme.accent)}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {entry.aiSummary ? (
                  <div className={cn("p-6 rounded-2xl border-r-4", currentTheme.cream, theme === 'midnight' ? 'border-blue-400' : 'border-brand-gold')}>
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className={currentTheme.accent} size={16} />
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", currentTheme.accent)}>תובנת AI</span>
                    </div>
                    <p className={cn("text-sm italic leading-relaxed", theme === 'midnight' ? 'text-white/60' : 'text-brand-black/70')}>
                      {entry.aiSummary}
                    </p>
                  </div>
                ) : entry.content.split(/\s+/).length > 50 && (
                  <button
                    onClick={() => generateSummary(entry.id, entry.content)}
                    disabled={generatingSummaryId === entry.id}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all border",
                      theme === 'midnight' ? "border-white/10 text-white/60 hover:text-white hover:bg-white/5" : "border-brand-gold/20 text-brand-black/60 hover:text-brand-gold hover:bg-brand-gold/5"
                    )}
                  >
                    {generatingSummaryId === entry.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    {generatingSummaryId === entry.id ? 'מייצר תובנה...' : 'יצירת תובנת AI'}
                  </button>
                )}

                <div className={cn("mt-8 pt-6 border-t flex flex-col gap-4", theme === 'midnight' ? 'border-white/10' : 'border-brand-cream')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setActiveCommentEntryId(activeCommentEntryId === entry.id ? null : entry.id)}
                        className={cn("flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors", theme === 'midnight' ? 'text-white/40 hover:text-blue-400' : 'text-brand-black/40 hover:text-brand-gold')}
                      >
                        <MessageCircle size={14} /> {entry.comments?.length > 0 ? `תגובות (${entry.comments.length})` : 'הוספת תגובה'}
                      </button>
                      <button 
                        onClick={() => generateImage(entry.id, entry.content)}
                        disabled={generatingImageId === entry.id}
                        className={cn("flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors disabled:opacity-50", theme === 'midnight' ? 'text-white/40 hover:text-blue-400' : 'text-brand-black/40 hover:text-brand-gold')}
                      >
                        {generatingImageId === entry.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                        {generatingImageId === entry.id ? 'מייצר תמונה...' : 'יצירת תמונה מהזיכרון'}
                      </button>
                      <button 
                        onClick={() => handleGeneralShare(entry)}
                        className={cn("flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors", theme === 'midnight' ? 'text-white/40 hover:text-blue-400' : 'text-brand-black/40 hover:text-brand-gold')}
                        title="שיתוף כללי"
                      >
                        <Share2 size={14} /> שיתוף
                      </button>
                      <button 
                        onClick={() => handleQuickReminder(entry.id)}
                        className={cn("flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors", theme === 'midnight' ? 'text-white/40 hover:text-blue-400' : 'text-brand-black/40 hover:text-brand-gold')}
                        title="תזכורת למחר ב-10:00"
                      >
                        <Bell size={14} /> תזכורת למחר
                      </button>
                      {view === 'private' && profile?.coupleId && (
                        <button 
                          onClick={() => handleShare(entry)}
                          className={cn("flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors", theme === 'midnight' ? 'text-white/40 hover:text-blue-400' : 'text-brand-black/40 hover:text-brand-gold')}
                        >
                          <Users size={14} /> שתף עם בן/בת הזוג
                        </button>
                      )}
                    </div>
                    <div className={cn("flex items-center gap-2 text-[8px] uppercase tracking-widest font-bold", theme === 'midnight' ? 'text-white/20' : 'text-brand-black/20')}>
                      <Clock size={10} />
                      עודכן לאחרונה לפני שעתיים
                    </div>
                  </div>

                  <AnimatePresence>
                    {activeCommentEntryId === entry.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={cn("mt-4 p-4 rounded-2xl border", theme === 'midnight' ? 'bg-slate-800 border-white/10' : 'bg-brand-cream/30 border-brand-gold/10')}>
                          {entry.comments && entry.comments.length > 0 && (
                            <div className="space-y-4 mb-4">
                              {entry.comments.map((comment: any) => (
                                <div key={comment.id} className={cn("p-3 rounded-xl", theme === 'midnight' ? 'bg-slate-700' : 'bg-white')}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme === 'midnight' ? 'text-white/60' : 'text-brand-black/60')}>{comment.userName}</span>
                                    <span className={cn("text-[8px] uppercase tracking-widest", theme === 'midnight' ? 'text-white/40' : 'text-brand-black/40')}>
                                      {new Date(comment.timestamp).toLocaleDateString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className={cn("text-xs", theme === 'midnight' ? 'text-white/80' : 'text-brand-black/80')}>{comment.text}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddComment(entry.id);
                                }
                              }}
                              placeholder="כתבו תגובה..."
                              className={cn(
                                "flex-1 px-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1",
                                theme === 'midnight' 
                                  ? "bg-slate-700 border-white/10 text-white placeholder:text-white/40 focus:ring-blue-400" 
                                  : "bg-white border-brand-gold/10 text-brand-black focus:ring-brand-gold"
                              )}
                            />
                            <button
                              onClick={() => handleAddComment(entry.id)}
                              disabled={!commentText.trim()}
                              className={cn(
                                "px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-50",
                                currentTheme.button,
                                "text-white"
                              )}
                            >
                              שליחה
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

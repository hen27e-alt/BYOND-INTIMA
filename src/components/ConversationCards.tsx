import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, RefreshCw, MessageCircle, ChevronRight, ChevronLeft, Zap, Star, Shield, Filter, CheckCircle, Share2, Edit3, X } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAlert } from './AlertModal';

type Mood = 'romantic' | 'funny' | 'deep' | 'adventurous';
type InteractionType = 'conversation' | 'action' | 'game';
type Depth = 'light' | 'medium' | 'intimate';

interface Card {
  id: string;
  text: string;
  mood: Mood;
  interactionType: InteractionType;
  depth: Depth;
}

const ALL_CARDS: Card[] = [
  { id: '1', text: "מה הדבר הכי מצחיק שקרה לנו יחד החודש?", mood: 'funny', interactionType: 'conversation', depth: 'light' },
  { id: '2', text: "אם היינו יכולים לטוס מחר לכל מקום בעולם, לאן היינו טסים?", mood: 'adventurous', interactionType: 'conversation', depth: 'light' },
  { id: '3', text: "מה התכונה שאת/ה הכי אוהב/ת אצל בן/בת הזוג?", mood: 'romantic', interactionType: 'conversation', depth: 'light' },
  { id: '4', text: "איזה שיר תמיד מזכיר לך אותנו?", mood: 'romantic', interactionType: 'conversation', depth: 'light' },
  { id: '5', text: "מה היה הרגע שבו ידעת שאת/ה רוצה לצאת איתי לדייט שני?", mood: 'romantic', interactionType: 'conversation', depth: 'light' },
  { id: '6', text: "מה הדבר שהכי מפחיד אותך בעתיד שלנו?", mood: 'deep', interactionType: 'conversation', depth: 'medium' },
  { id: '7', text: "איך השתניתי מאז שהכרנו לדעתך?", mood: 'deep', interactionType: 'conversation', depth: 'medium' },
  { id: '8', text: "מה הדבר שאת/ה הכי גאה בו במערכת היחסים שלנו?", mood: 'deep', interactionType: 'conversation', depth: 'medium' },
  { id: '9', text: "אם היית יכול/ה לשנות דבר אחד בעבר שלנו, מה זה היה?", mood: 'deep', interactionType: 'conversation', depth: 'medium' },
  { id: '10', text: "מהו ה'בית' עבורך?", mood: 'deep', interactionType: 'conversation', depth: 'medium' },
  { id: '11', text: "מה הדבר הכי נועז שאי פעם רצית לנסות איתי?", mood: 'adventurous', interactionType: 'action', depth: 'intimate' },
  { id: '12', text: "איזה מגע שלי גורם לך להרגיש הכי אהוב/ה?", mood: 'romantic', interactionType: 'action', depth: 'intimate' },
  { id: '13', text: "מה הפנטזיה הכי פרועה שלך?", mood: 'adventurous', interactionType: 'conversation', depth: 'intimate' },
  { id: '14', text: "איך אני יכול/ה לגרום לך להרגיש יותר בטוח/ה במיטה?", mood: 'deep', interactionType: 'conversation', depth: 'intimate' },
  { id: '15', text: "מה הדבר הכי מושך בי בעיניך כרגע?", mood: 'romantic', interactionType: 'conversation', depth: 'intimate' },
  { id: '16', text: "תאר/י אותי ב-3 מילים.", mood: 'funny', interactionType: 'game', depth: 'light' },
  { id: '17', text: "מי מאיתנו יותר סביר שיירדם בסרט?", mood: 'funny', interactionType: 'game', depth: 'light' },
  { id: '18', text: "בואו נשחק 20 שאלות! אני חושב/ת על משהו שקשור אלינו.", mood: 'funny', interactionType: 'game', depth: 'medium' },
  { id: '19', text: "מה החלום הכי גדול שלך שעדיין לא הגשמת?", mood: 'deep', interactionType: 'conversation', depth: 'medium' },
  { id: '20', text: "איזו תכונה שלי הכי מאתגרת אותך לפעמים, ואיך אפשר לשפר את זה?", mood: 'deep', interactionType: 'conversation', depth: 'intimate' },
  { id: '21', text: "מה הזיכרון הכי מתוק שלך מהילדות?", mood: 'romantic', interactionType: 'conversation', depth: 'light' },
  { id: '22', text: "אם היינו צריכים להשתתף בתוכנית ריאליטי יחד, לאיזו תוכנית היינו הולכים?", mood: 'funny', interactionType: 'conversation', depth: 'light' },
  { id: '23', text: "מה הדבר שהכי מרגיע אותך אחרי יום ארוך?", mood: 'deep', interactionType: 'conversation', depth: 'medium' },
  { id: '24', text: "ספר/י לי על פעם אחת שהרגשת ממש גאה בי.", mood: 'romantic', interactionType: 'conversation', depth: 'medium' },
  { id: '25', text: "אם היינו חיות, איזה חיות היינו ולמה?", mood: 'funny', interactionType: 'game', depth: 'light' },
  { id: '26', text: "מה הפחד הכי גדול שלך שלא סיפרת לי עליו?", mood: 'deep', interactionType: 'conversation', depth: 'intimate' },
  { id: '27', text: "איזה הרגל קטן שלי גורם לך לחייך?", mood: 'romantic', interactionType: 'conversation', depth: 'light' },
  { id: '28', text: "תעשו תחרות מבטים של דקה בלי לצחוק.", mood: 'funny', interactionType: 'action', depth: 'light' }
];

const DEPTHS = [
  { id: 'all', label: 'הכל', icon: Sparkles, color: 'text-white', bg: 'bg-white/10', border: 'border-white/20' },
  { id: 'light', label: 'קליל', icon: Sparkles, color: 'text-brand-gold', bg: 'bg-brand-gold/10', border: 'border-brand-gold/20' },
  { id: 'medium', label: 'עמוק', icon: Heart, color: 'text-brand-pink', bg: 'bg-brand-pink/10', border: 'border-brand-pink/20' },
  { id: 'intimate', label: 'אינטימי', icon: Zap, color: 'text-brand-purple', bg: 'bg-brand-purple/10', border: 'border-brand-purple/20' }
];

const MOODS: { id: Mood | 'all', label: string }[] = [
  { id: 'all', label: 'כל מצבי הרוח' },
  { id: 'romantic', label: 'רומנטי' },
  { id: 'funny', label: 'מצחיק' },
  { id: 'deep', label: 'עמוק' },
  { id: 'adventurous', label: 'הרפתקני' }
];

const INTERACTION_TYPES: { id: InteractionType | 'all', label: string }[] = [
  { id: 'all', label: 'כל סוגי האינטראקציה' },
  { id: 'conversation', label: 'שיחה' },
  { id: 'action', label: 'פעולה' },
  { id: 'game', label: 'משחק' }
];

export const ConversationCards = () => {
  const { user } = useFirebase();
  const { showAlert } = useAlert();
  const [activeDepth, setActiveDepth] = useState<Depth | 'all'>('all');
  const [activeMood, setActiveMood] = useState<Mood | 'all'>('all');
  const [activeInteractionType, setActiveInteractionType] = useState<InteractionType | 'all'>('all');
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Interactivity state
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [currentNote, setCurrentNote] = useState('');

  useEffect(() => {
    const fetchInteractions = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'app_data', 'card_interactions');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFavorites(data.favorites || {});
          setCompleted(data.completed || {});
          setNotes(data.notes || {});
        }
      } catch (error) {
        console.error("Error fetching card interactions:", error);
      }
    };
    fetchInteractions();
  }, [user]);

  const saveInteractions = async (updates: any) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'app_data', 'card_interactions');
      await setDoc(docRef, updates, { merge: true });
    } catch (error) {
      console.error("Error saving card interactions:", error);
    }
  };

  const toggleFavorite = (cardId: string) => {
    const newFavorites = { ...favorites, [cardId]: !favorites[cardId] };
    setFavorites(newFavorites);
    saveInteractions({ favorites: newFavorites });
  };

  const toggleCompleted = (cardId: string) => {
    const newCompleted = { ...completed, [cardId]: !completed[cardId] };
    setCompleted(newCompleted);
    saveInteractions({ completed: newCompleted });
  };

  const saveNote = (cardId: string) => {
    const newNotes = { ...notes, [cardId]: currentNote };
    setNotes(newNotes);
    saveInteractions({ notes: newNotes });
    setIsEditingNote(false);
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Byond Intima - קלף שיחה',
          text: text,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(text);
      showAlert('הטקסט הועתק ללוח!');
    }
  };

  const resetFilters = () => {
    setActiveDepth('all');
    setActiveMood('all');
    setActiveInteractionType('all');
    setCurrentCardIndex(0);
  };

  const filteredCards = useMemo(() => {
    return ALL_CARDS.filter(card => {
      const matchDepth = activeDepth === 'all' || card.depth === activeDepth;
      const matchMood = activeMood === 'all' || card.mood === activeMood;
      const matchInteraction = activeInteractionType === 'all' || card.interactionType === activeInteractionType;
      return matchDepth && matchMood && matchInteraction;
    });
  }, [activeDepth, activeMood, activeInteractionType]);

  const currentCard = filteredCards[currentCardIndex];
  const depthInfo = currentCard ? DEPTHS.find(d => d.id === currentCard.depth) || DEPTHS[0] : DEPTHS[0];

  const handleNext = () => {
    if (filteredCards.length <= 1) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
      setIsFlipping(false);
    }, 300);
  };

  const handlePrev = () => {
    if (filteredCards.length <= 1) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
      setIsFlipping(false);
    }, 300);
  };

  const handleShuffle = () => {
    if (filteredCards.length <= 1) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentCardIndex(Math.floor(Math.random() * filteredCards.length));
      setIsFlipping(false);
    }, 300);
  };

  // Reset index when filters change
  useEffect(() => {
    setCurrentCardIndex(0);
  }, [activeDepth, activeMood, activeInteractionType]);

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-white">קלפי שיחה</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={resetFilters}
            className="p-3 bg-white/5 text-white/60 border border-white/10 rounded-full hover:bg-white/10 transition-all"
            title="איפוס פילטרים"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${showFilters ? 'bg-brand-gold text-black border-brand-gold' : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}`}
          >
            <Filter size={16} /> סינון מתקדם
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm text-white/60 font-bold">עומק השיחה</label>
                <div className="flex flex-wrap gap-2">
                  {DEPTHS.map(depth => (
                    <button
                      key={depth.id}
                      onClick={() => setActiveDepth(depth.id as Depth | 'all')}
                      className={`px-4 py-2 rounded-full text-sm transition-all border ${
                        activeDepth === depth.id 
                          ? `${depth.bg} ${depth.border} ${depth.color}` 
                          : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {depth.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-white/60 font-bold">מצב רוח</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(mood => (
                    <button
                      key={mood.id}
                      onClick={() => setActiveMood(mood.id as Mood | 'all')}
                      className={`px-4 py-2 rounded-full text-sm transition-all border ${
                        activeMood === mood.id 
                          ? 'bg-brand-gold/20 border-brand-gold/50 text-brand-gold' 
                          : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-white/60 font-bold">סוג אינטראקציה</label>
                <div className="flex flex-wrap gap-2">
                  {INTERACTION_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setActiveInteractionType(type.id as InteractionType | 'all')}
                      className={`px-4 py-2 rounded-full text-sm transition-all border ${
                        activeInteractionType === type.id 
                          ? 'bg-brand-gold/20 border-brand-gold/50 text-brand-gold' 
                          : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative aspect-[4/3] perspective-1000">
        <AnimatePresence mode="wait">
          {filteredCards.length > 0 ? (
            <motion.div
              key={currentCard?.id || 'empty'}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`w-full h-full rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-2xl border-2 ${depthInfo.bg} ${depthInfo.border} relative overflow-hidden group`}
            >
              <div className="absolute top-0 left-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <depthInfo.icon size={120} className={depthInfo.color} />
              </div>
              
              <div className="mb-8 p-3 bg-white/10 rounded-full">
                <MessageCircle size={32} className={depthInfo.color} />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-serif text-white leading-relaxed italic">
                "{currentCard.text}"
              </h3>

              <div className="flex items-center gap-4 mt-8 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(currentCard.id); }}
                  className={`p-3 rounded-full transition-colors ${favorites[currentCard.id] ? 'bg-brand-gold text-black' : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'}`}
                  title="מועדפים"
                >
                  <Heart size={20} className={favorites[currentCard.id] ? 'fill-current' : ''} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleCompleted(currentCard.id); }}
                  className={`p-3 rounded-full transition-colors ${completed[currentCard.id] ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'}`}
                  title="סומן כהושלם"
                >
                  <CheckCircle size={20} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setCurrentNote(notes[currentCard.id] || '');
                    setIsEditingNote(true);
                  }}
                  className={`p-3 rounded-full transition-colors ${notes[currentCard.id] ? 'bg-brand-gold/50 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'}`}
                  title="הערה אישית"
                >
                  <Edit3 size={20} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleShare(currentCard.text); }}
                  className="p-3 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                  title="שתף"
                >
                  <Share2 size={20} />
                </button>
              </div>

              {isEditingNote && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
                  <div className="w-full max-w-sm bg-brand-black border border-brand-gold/20 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-white font-serif">הערה אישית</h4>
                      <button onClick={() => setIsEditingNote(false)} className="text-white/60 hover:text-white">
                        <X size={20} />
                      </button>
                    </div>
                    <textarea 
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-gold min-h-[100px] mb-4"
                      placeholder="הוסיפו הערה אישית או זיכרון מהשיחה..."
                    />
                    <button 
                      onClick={() => saveNote(currentCard.id)}
                      className="w-full py-3 bg-brand-gold text-black rounded-xl font-bold hover:bg-brand-gold/80 transition-colors"
                    >
                      שמור הערה
                    </button>
                  </div>
                </div>
              )}

              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
                <span className="text-white/40 text-sm">{currentCardIndex + 1} / {filteredCards.length}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-2xl border-2 border-white/10 bg-white/5"
            >
              <MessageCircle size={48} className="text-white/20 mb-4" />
              <h3 className="text-xl font-serif text-white/60">לא נמצאו קלפים התואמים לסינון</h3>
              <button 
                onClick={() => {
                  setActiveDepth('all');
                  setActiveMood('all');
                  setActiveInteractionType('all');
                }}
                className="mt-4 text-brand-gold hover:underline"
              >
                נקה סינונים
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={filteredCards.length <= 1}
          className="p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={24} />
        </button>

        <button
          onClick={handleShuffle}
          disabled={filteredCards.length <= 1}
          className="flex-1 py-4 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} /> ערבבו קלפים
        </button>

        <button
          onClick={handleNext}
          disabled={filteredCards.length <= 1}
          className="p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="text-center">
        <p className="text-white/40 text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          <Shield size={12} /> מרחב בטוח ונטול שיפוטיות
        </p>
      </div>
    </div>
  );
};

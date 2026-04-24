import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Plus, Sparkles, CheckCircle2, Loader2, Clock, MapPin, Heart } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, increment } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const BeyondCalendar = () => {
  const { user, profile } = useFirebase();
  const [events, setEvents] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'date' });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'calendar_events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const generateDateIdea = async () => {
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `הצע רעיון לדייט זוגי רומנטי ומיוחד שאפשר להוסיף ליומן. 
        החזר אובייקט JSON עם השדות: title (שם הדייט), description (תיאור קצר).`,
        config: {
          responseMimeType: "application/json",
        }
      });
      const data = JSON.parse(response.text || "{}");
      setAiSuggestion(data);
    } catch (error) {
      console.error("Error generating date:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEvent.title || !newEvent.date) return;
    
    await addDoc(collection(db, 'users', user.uid, 'calendar_events'), {
      ...newEvent,
      completed: false,
      createdAt: new Date().toISOString()
    });
    setShowForm(false);
    setNewEvent({ title: '', date: '', type: 'date' });
  };

  const completeEvent = async (eventId: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'calendar_events', eventId), {
      completed: true
    });
    // Award Gold Points
    await updateDoc(doc(db, 'users', user.uid), {
      'progress.totalPoints': increment(20)
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto">
          <CalendarIcon size={32} className="text-brand-gold" />
        </div>
        <h2 className="text-3xl font-serif text-brand-black">יומן זוגי חכם</h2>
        <p className="text-brand-black/60 max-w-xl mx-auto">
          תכננו את הרגעים המשותפים שלכם. השלימו דייטים ויעדים כדי להרוויח נקודות זהב.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif">האירועים הקרובים</h3>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 text-sm text-brand-gold hover:text-brand-black transition-colors"
            >
              <Plus size={16} /> הוסף אירוע
            </button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddEvent}
                className="bg-white p-6 rounded-2xl shadow-sm border border-brand-gold/20 mb-6 space-y-4 overflow-hidden"
              >
                <input 
                  type="text" 
                  placeholder="כותרת האירוע (למשל: דייט סושי, יום נישואין)" 
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full p-3 bg-brand-cream/50 rounded-xl border-none focus:ring-1 focus:ring-brand-gold"
                  required
                />
                <div className="flex gap-4">
                  <input 
                    type="date" 
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                    className="flex-1 p-3 bg-brand-cream/50 rounded-xl border-none focus:ring-1 focus:ring-brand-gold"
                    required
                  />
                  <select 
                    value={newEvent.type}
                    onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                    className="flex-1 p-3 bg-brand-cream/50 rounded-xl border-none focus:ring-1 focus:ring-brand-gold"
                  >
                    <option value="date">דייט</option>
                    <option value="anniversary">יום נישואין</option>
                    <option value="goal">יעד משותף</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-3 bg-brand-black text-brand-gold rounded-xl font-bold hover:bg-brand-gold hover:text-white transition-colors">
                  שמור אירוע
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-brand-gold/30">
                <p className="text-brand-black/50">אין אירועים קרובים. זה הזמן לתכנן משהו כיף!</p>
              </div>
            ) : (
              events.map(event => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${event.completed ? 'bg-brand-cream/50 border-brand-gold/10 opacity-70' : 'bg-white border-brand-gold/30 shadow-sm'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${event.completed ? 'bg-green-100 text-green-600' : 'bg-brand-gold/10 text-brand-gold'}`}>
                      {event.completed ? <CheckCircle2 size={24} /> : (event.type === 'date' ? <Heart size={24} /> : <CalendarIcon size={24} />)}
                    </div>
                    <div>
                      <h4 className={`font-bold ${event.completed ? 'line-through text-brand-black/50' : 'text-brand-black'}`}>{event.title}</h4>
                      <p className="text-xs text-brand-black/60 flex items-center gap-1 mt-1">
                        <Clock size={12} /> {new Date(event.date).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>
                  {!event.completed && (
                    <button 
                      onClick={() => completeEvent(event.id)}
                      className="px-4 py-2 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-white rounded-full text-xs font-bold transition-colors"
                    >
                      השלמנו! (+20 נק')
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-black text-white p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h3 className="text-xl font-serif mb-2 flex items-center gap-2">
              <Sparkles size={20} className="text-brand-gold" />
              הצעת AI לדייט
            </h3>
            <p className="text-white/70 text-sm mb-6">
              תנו ל-AI שלנו לתכנן עבורכם את הדייט המושלם הבא בהתבסס על העדפותיכם.
            </p>
            
            {aiSuggestion ? (
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm mb-4">
                <h4 className="font-bold text-brand-gold mb-2">{aiSuggestion.title}</h4>
                <p className="text-sm text-white/80 leading-relaxed">{aiSuggestion.description}</p>
                <button 
                  onClick={() => {
                    setNewEvent({ title: aiSuggestion.title, date: '', type: 'date' });
                    setShowForm(true);
                    setAiSuggestion(null);
                  }}
                  className="mt-4 w-full py-2 bg-brand-gold text-black rounded-lg text-sm font-bold hover:bg-white transition-colors"
                >
                  הוסף ליומן
                </button>
              </div>
            ) : (
              <button 
                onClick={generateDateIdea}
                disabled={isGenerating}
                className="w-full py-3 bg-brand-gold text-black rounded-xl font-bold hover:bg-white transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : 'צור רעיון לדייט'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

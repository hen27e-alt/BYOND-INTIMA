import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Heart, Star, Trophy, Calendar, Loader2, Download } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';

interface TimelineEvent {
  id: string;
  coupleId: string;
  title: string;
  description?: string;
  date: string;
  imageUrl?: string;
  type: 'milestone' | 'memory' | 'achievement';
  createdAt?: any;
}

const EVENT_TYPES = {
  milestone: { label: 'אבן דרך', icon: Star, color: 'text-brand-gold bg-brand-gold/10 border-brand-gold/30' },
  memory: { label: 'זיכרון מתוק', icon: Heart, color: 'text-pink-500 bg-pink-500/10 border-pink-500/30' },
  achievement: { label: 'הישג משותף', icon: Trophy, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' }
};

export const OurStory = () => {
  const { user, profile } = useFirebase();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    type: 'memory' as 'milestone' | 'memory' | 'achievement'
  });

  const coupleId = profile?.coupleId || user?.uid;

  useEffect(() => {
    if (!coupleId) return;

    const q = query(
      collection(db, 'timeline_events'),
      where('coupleId', '==', coupleId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents: TimelineEvent[] = [];
      snapshot.forEach((doc) => {
        fetchedEvents.push({ id: doc.id, ...doc.data() } as TimelineEvent);
      });
      fetchedEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(fetchedEvents);
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
      handleFirestoreError(error, OperationType.GET, 'timeline_events');
    });

    return () => unsubscribe();
  }, [coupleId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleId || !formData.title || !formData.date) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'timeline_events'), {
        coupleId,
        title: formData.title,
        description: formData.description || null,
        date: formData.date,
        imageUrl: formData.imageUrl || null,
        type: formData.type,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        imageUrl: '',
        type: 'memory'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'timeline_events');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, 'timeline_events', deleteConfirmId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `timeline_events/${deleteConfirmId}`);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-serif text-brand-black flex items-center gap-3">
            <Calendar className="text-brand-gold" /> הסיפור שלנו
          </h2>
          <p className="text-brand-black/60 italic mt-2">ציר הזמן של האהבה והחוויות המשותפות שלכם.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-white border border-brand-gold/20 text-brand-gold rounded-full font-bold flex items-center gap-2 hover:bg-brand-gold/5 transition-all shadow-sm"
            title="ייצוא ל-PDF"
          >
            <Download size={20} /> ייצוא ל-PDF
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="px-8 py-3 bg-brand-gold text-white rounded-full font-bold flex items-center gap-2 hover:bg-brand-gold-light transition-all shadow-lg shadow-brand-gold/20"
          >
            <Plus size={20} /> הוספת אירוע
          </button>
        </div>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block text-center mb-12">
        <h1 className="text-4xl font-serif text-brand-black mb-4">הסיפור שלנו</h1>
        <p className="text-xl text-brand-black/60 italic">יומן זוגיות - Byond Intima</p>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="bg-white border border-brand-gold/20 p-8 rounded-3xl mb-12 shadow-sm overflow-hidden"
          >
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-black/80">כותרת האירוע</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="למשל: הדייט הראשון שלנו, עברנו לגור יחד..."
                    className="w-full bg-transparent border border-brand-gold/20 rounded-xl p-4 text-brand-black focus:outline-none focus:border-brand-gold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-black/80">תאריך</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-transparent border border-brand-gold/20 rounded-xl p-4 text-brand-black focus:outline-none focus:border-brand-gold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-black/80">סוג האירוע</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-transparent border border-brand-gold/20 rounded-xl p-4 text-brand-black focus:outline-none focus:border-brand-gold appearance-none"
                  >
                    {Object.entries(EVENT_TYPES).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-black/80">קישור לתמונה (אופציונלי)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-transparent border border-brand-gold/20 rounded-xl p-4 text-brand-black focus:outline-none focus:border-brand-gold text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-brand-black/80">תיאור (אופציונלי)</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="ספרו קצת על מה שהיה..."
                    className="w-full bg-transparent border border-brand-gold/20 rounded-xl p-4 text-brand-black focus:outline-none focus:border-brand-gold"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-brand-black/60 hover:text-brand-black">ביטול</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-brand-gold text-white rounded-full font-bold hover:bg-brand-gold-light transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  הוספה לסיפור
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* Vertical Line */}
        {events.length > 0 && (
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-brand-gold/20 -translate-x-1/2" />
        )}

        <div className="space-y-12">
          {events.map((event, index) => {
            const typeInfo = EVENT_TYPES[event.type];
            const Icon = typeInfo.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row gap-8 items-start ${isEven ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 w-10 h-10 rounded-full bg-white border-4 border-brand-cream flex items-center justify-center -translate-x-1/2 z-10 shadow-sm">
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${typeInfo.color} border`}>
                    <Icon size={16} />
                  </div>
                </div>

                {/* Content Card */}
                <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-12 text-right' : 'md:pl-12 text-right'}`}>
                  <div className="bg-white p-6 rounded-2xl border border-brand-gold/10 shadow-sm group relative">
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="absolute top-4 left-4 p-2 text-brand-black/20 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm font-medium text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full">
                        {new Date(event.date).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <span className="text-xs text-brand-black/40">{typeInfo.label}</span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-brand-black mb-2">{event.title}</h3>
                    
                    {event.description && (
                      <p className="text-brand-black/70 mb-4 whitespace-pre-wrap">{event.description}</p>
                    )}

                    {event.imageUrl && (
                      <div className="rounded-xl overflow-hidden mt-4 border border-brand-gold/10">
                        <img 
                          src={event.imageUrl} 
                          alt={event.title} 
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {events.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-white/50 border border-dashed border-brand-gold/30 rounded-3xl">
            <Heart size={48} className="mx-auto text-brand-gold/30 mb-4" />
            <h3 className="text-xl font-serif text-brand-black mb-2">הסיפור שלכם מתחיל כאן</h3>
            <p className="text-brand-black/60 mb-6">הוסיפו את הרגעים המיוחדים, הדייטים וההישגים המשותפים שלכם.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="text-brand-gold font-medium hover:underline"
            >
              הוסף אירוע ראשון
            </button>
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
              <h3 className="text-2xl font-serif mb-4 text-brand-black">מחיקת אירוע</h3>
              <p className="text-brand-black/60 mb-8">האם אתם בטוחים שברצונכם למחוק אירוע זה? פעולה זו אינה הפיכה.</p>
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

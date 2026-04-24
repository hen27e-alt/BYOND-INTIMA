import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Smile, Zap, Heart, Send, Loader2, Sparkles, User } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

const MOODS = [
  { id: 1, label: 'מותש/ת', icon: '😫', color: 'bg-red-500/20 text-red-500' },
  { id: 2, label: 'עייפ/ה', icon: '😴', color: 'bg-orange-500/20 text-orange-500' },
  { id: 3, label: 'בסדר', icon: '😐', color: 'bg-yellow-500/20 text-yellow-500' },
  { id: 4, label: 'טוב', icon: '😊', color: 'bg-green-500/20 text-green-500' },
  { id: 5, label: 'מעולה!', icon: '🤩', color: 'bg-brand-gold/20 text-brand-gold' }
];

export const ConnectionPulse = () => {
  const { user, profile } = useFirebase();
  const [pulse, setPulse] = useState<any>(null);
  const [partnerPulse, setPartnerPulse] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({ mood: 3, energy: 3, need: '' });

  useEffect(() => {
    if (!profile?.coupleId || !user) return;

    // My last pulse
    const qMy = query(
      collection(db, 'connection_pulse'),
      where('userId', '==', user.uid)
    );
    const unsubMy = onSnapshot(qMy, (snap) => {
      if (!snap.empty) {
        let docs = snap.docs.map(d => d.data());
        docs.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        const data = docs[0];
        setPulse(data);
        // If last pulse was today, hide form
        const today = new Date().toDateString();
        if (data.createdAt?.toDate?.()?.toDateString() === today) {
          setShowForm(false);
        }
      }
    });

    // Partner's last pulse
    const qPartner = query(
      collection(db, 'connection_pulse'),
      where('coupleId', '==', profile.coupleId)
    );
    const unsubPartner = onSnapshot(qPartner, (snap) => {
      if (!snap.empty) {
        let docs = snap.docs.map(d => d.data()).filter(d => d.userId !== user.uid);
        docs.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        if (docs.length > 0) {
          setPartnerPulse(docs[0]);
        }
      }
    });

    return () => { unsubMy(); unsubPartner(); };
  }, [user, profile?.coupleId]);

  const handleSubmit = async () => {
    if (!user || !profile?.coupleId) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'connection_pulse'), {
        userId: user.uid,
        coupleId: profile.coupleId,
        ...formData,
        createdAt: serverTimestamp()
      });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-white flex items-center justify-center gap-3">
          <Activity className="text-brand-gold" /> דופק רגשי זוגי
        </h2>
        <p className="text-white/40 italic">איך אנחנו מרגישים היום?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Partner Status */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-4 text-white/40 uppercase tracking-widest text-xs">
            <User size={16} /> הסטטוס של הפרטנר
          </div>
          {partnerPulse ? (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="text-6xl">{MOODS.find(m => m.id === partnerPulse.mood)?.icon}</div>
                <div>
                  <h3 className="text-2xl font-serif text-white">{MOODS.find(m => m.id === partnerPulse.mood)?.label}</h3>
                  <p className="text-white/40 text-sm">עודכן ב: {partnerPulse.createdAt?.toDate?.()?.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) || 'עכשיו'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/40">
                  <span>אנרגיה</span>
                  <span>{partnerPulse.energy}/5</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(partnerPulse.energy / 5) * 100}%` }}
                    className="h-full bg-brand-gold"
                  />
                </div>
              </div>
              {partnerPulse.need && (
                <div className="bg-brand-gold/10 border border-brand-gold/20 p-4 rounded-xl">
                  <p className="text-brand-gold text-sm italic">"אני הכי זקוק/ה ל: {partnerPulse.need}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-white/20 italic">הפרטנר עדיין לא עדכן היום...</div>
          )}
        </div>

        {/* My Status / Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-4 text-white/40 uppercase tracking-widest text-xs">
            <User size={16} /> הסטטוס שלי
          </div>
          
          {showForm ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="block text-sm text-white/60">איך המצב רוח?</label>
                <div className="flex justify-between gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setFormData({ ...formData, mood: m.id })}
                      className={`flex-1 aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                        formData.mood === m.id ? m.color + ' scale-110 shadow-lg' : 'bg-white/5 text-white/20 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <span className="text-[10px] font-bold">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm text-white/60">רמת אנרגיה</label>
                <input 
                  type="range" min="1" max="5" step="1"
                  value={formData.energy}
                  onChange={e => setFormData({ ...formData, energy: parseInt(e.target.value) })}
                  className="w-full accent-brand-gold"
                />
                <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-widest">
                  <span>גמורה</span>
                  <span>בשיא</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm text-white/60">מה אני הכי צריך/ה היום?</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['חיבוק', 'שקט', 'זמן איכות', 'עזרה בבית', 'אוזן קשבת', 'מרחב', 'פינוק'].map(need => (
                    <button
                      key={need}
                      onClick={() => setFormData({ ...formData, need })}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        formData.need === need ? 'bg-brand-gold text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {need}
                    </button>
                  ))}
                </div>
                <input 
                  type="text"
                  value={formData.need}
                  onChange={e => setFormData({ ...formData, need: e.target.value })}
                  placeholder="או לכתוב משהו אחר..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 text-right"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-gold text-black rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg shadow-brand-gold/20"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                עדכון סטטוס
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="text-6xl">{MOODS.find(m => m.id === pulse?.mood)?.icon}</div>
                <div>
                  <h3 className="text-2xl font-serif text-white">{MOODS.find(m => m.id === pulse?.mood)?.label}</h3>
                  <p className="text-white/40 text-sm">עודכן היום</p>
                </div>
              </div>
              <button 
                onClick={() => setShowForm(true)}
                className="text-brand-gold text-xs uppercase tracking-widest hover:underline"
              >
                עדכון מחדש
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

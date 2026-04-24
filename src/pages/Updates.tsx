import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { EditableText } from '../components/EditableText';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Calendar, Rocket, Sparkles, Wrench, ArrowRight } from 'lucide-react';

interface SiteUpdate {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'feature' | 'improvement' | 'fix' | 'roadmap';
}

const Updates = () => {
  const [updates, setUpdates] = useState<SiteUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'site_updates'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SiteUpdate[];
      setUpdates(updatesData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getTypeIcon = (type: SiteUpdate['type']) => {
    switch (type) {
      case 'feature': return <Rocket className="text-emerald-400" size={20} />;
      case 'improvement': return <Sparkles className="text-brand-gold" size={20} />;
      case 'fix': return <Wrench className="text-blue-400" size={20} />;
      case 'roadmap': return <ArrowRight className="text-purple-400" size={20} />;
      default: return <Rocket size={20} />;
    }
  };

  const getTypeText = (type: SiteUpdate['type']) => {
    switch (type) {
      case 'feature': return 'תכונה חדשה';
      case 'improvement': return 'שיפור';
      case 'fix': return 'תיקון';
      case 'roadmap': return 'בתכנון';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EditableText 
              contentId="updates_title"
              defaultText="מה התחדש?"
              as="h1"
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-brand-gold to-white bg-clip-text text-transparent"
            />
          </motion.div>
          <p className="text-white/60 max-w-xl mx-auto">
            אנחנו עובדים כל הזמן כדי לשפר את החוויה שלכם. כאן תוכלו לראות את כל העדכונים האחרונים ומה מחכה לנו בהמשך.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-gold"></div>
          </div>
        ) : (
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {updates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
              >
                {/* Dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  {getTypeIcon(update.type)}
                </div>

                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-gold/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <time className="text-xs font-mono text-white/40 flex items-center gap-2">
                      <Calendar size={12} />
                      {update.date}
                    </time>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-white/5 border border-white/10`}>
                      {getTypeText(update.type)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-brand-gold">{update.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                    {update.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && updates.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <Rocket className="mx-auto text-white/20 mb-4" size={48} />
            <p className="text-white/40">עדיין אין עדכונים רשומים. הישארו מעודכנים!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Updates;

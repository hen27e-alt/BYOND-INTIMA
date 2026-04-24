import React from 'react';
import { motion } from 'motion/react';
import { Star, MessageCircle, MapPin, Calendar, Trash2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export const PlaceInteractionsFeed = () => {
  const { user, profile } = useFirebase();
  const [interactions, setInteractions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'place_interactions'),
      where('coupleId', '==', profile?.coupleId || user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInteractions(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching interactions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, profile]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את העדכון הזה?')) return;
    try {
      await deleteDoc(doc(db, 'place_interactions', id));
    } catch (error) {
      console.error("Error deleting interaction:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-brand-gold/10 rounded-2xl">
        <MapPin size={48} className="mx-auto text-brand-gold/20 mb-4" />
        <p className="text-brand-black/40">עדיין אין המלצות או חוויות ששמרתם.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {interactions.map((interaction) => (
        <motion.div
          key={interaction.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-brand-gold/10 overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-brand-black">{interaction.placeName}</h3>
                  <div className="flex items-center gap-2 text-xs text-brand-black/40">
                    <Calendar size={12} />
                    <span>{interaction.createdAt?.toDate ? format(interaction.createdAt.toDate?.() || new Date(), 'd MMMM yyyy', { locale: he }) : 'עכשיו'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-brand-gold/10 px-2 py-1 rounded-full">
                <Star size={12} className="text-brand-gold fill-brand-gold" />
                <span className="text-xs font-bold text-brand-gold">{interaction.rating}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-brand-black/70 text-sm leading-relaxed italic">
                "{interaction.review}"
              </p>
            </div>

            {interaction.photos && interaction.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {interaction.photos.map((photo: string, idx: number) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-brand-gold/5">
              <div className="flex items-center gap-2">
                <img 
                  src={interaction.userPhoto || 'https://via.placeholder.com/32'} 
                  alt={interaction.userName} 
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-[10px] font-bold text-brand-black/40 uppercase tracking-widest">
                  {interaction.userName}
                </span>
              </div>
              <button
                onClick={() => handleDelete(interaction.id)}
                className="p-2 text-brand-black/20 hover:text-red-500 transition-colors"
                title="מחק"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

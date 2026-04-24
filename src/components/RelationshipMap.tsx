import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Plus, X, Loader2, Calendar, MessageCircle, Sparkles, Trash2, Heart, Star, Navigation } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapLocation {
  id: string;
  coupleId: string;
  title: string;
  description: string;
  type: 'first_date' | 'kiss' | 'trip' | 'favorite' | 'future';
  date: string;
  lat: number;
  lng: number;
  createdAt: any;
}

const LocationMarker = ({ location, onDelete }: { location: MapLocation, onDelete: (id: string) => void, key?: string }) => {
  return (
    <Marker position={[location.lat, location.lng]} icon={customIcon}>
      <Popup className="custom-popup">
        <div className="p-4 space-y-3 min-w-[200px] text-right">
          <div className="flex justify-between items-start">
            <span className="px-2 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-bold rounded-full uppercase tracking-widest">
              {location.type === 'first_date' ? 'דייט ראשון' : location.type === 'kiss' ? 'נשיקה ראשונה' : location.type === 'trip' ? 'טיול' : location.type === 'favorite' ? 'מקום אהוב' : 'חלום עתידי'}
            </span>
            <button onClick={() => onDelete(location.id)} className="text-rose-500 hover:text-rose-700">
              <Trash2 size={14} />
            </button>
          </div>
          <h4 className="font-serif text-lg text-brand-black">{location.title}</h4>
          <p className="text-sm text-brand-black/60 italic">"{location.description}"</p>
          <div className="flex items-center gap-2 text-[10px] text-brand-black/40 font-bold uppercase tracking-widest pt-2 border-t border-brand-gold/10">
            <Calendar size={12} />
            {location.date}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const RelationshipMap = () => {
  const { profile } = useFirebase();
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLocation, setNewLocation] = useState({
    title: '',
    description: '',
    type: 'first_date' as MapLocation['type'],
    date: new Date().toISOString().split('T')[0],
    lat: 0,
    lng: 0
  });

  useEffect(() => {
    if (!profile?.coupleId) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'relationship_map'),
      where('coupleId', '==', profile.coupleId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const locList: MapLocation[] = [];
      snapshot.forEach((doc) => {
        locList.push({ id: doc.id, ...doc.data() } as MapLocation);
      });
      setLocations(locList);
      setIsLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'relationship_map');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.coupleId]);

  const handleMapClick = (lat: number, lng: number) => {
    setNewLocation(prev => ({ ...prev, lat, lng }));
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.coupleId) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'relationship_map'), {
        ...newLocation,
        coupleId: profile.coupleId,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewLocation({
        title: '',
        description: '',
        type: 'first_date',
        date: new Date().toISOString().split('T')[0],
        lat: 0,
        lng: 0
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'relationship_map');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'relationship_map', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `relationship_map/${id}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 h-[calc(100vh-200px)] flex flex-col">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-4xl font-serif text-brand-black">מפת הזוגיות</h2>
          <p className="text-brand-black/60">סמנו את המקומות המיוחדים שלכם על המפה - מהדייט הראשון ועד לחופשה הבאה.</p>
        </div>
        <div className="bg-brand-gold/10 px-6 py-3 rounded-full flex items-center gap-3 text-brand-gold font-bold text-sm">
          <Navigation size={18} />
          לחצו על המפה להוספת נקודה
        </div>
      </div>

      <div className="flex-1 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white relative">
        {isLoading ? (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-brand-gold" size={48} />
            <p className="text-brand-black/40 font-serif italic">טוען את המפה שלכם...</p>
          </div>
        ) : (
          <MapContainer 
            center={[31.0461, 34.8516]} 
            zoom={8} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapEvents onMapClick={handleMapClick} />
            {locations.map((loc) => (
              <LocationMarker key={loc.id} location={loc} onDelete={handleDelete} />
            ))}
          </MapContainer>
        )}
      </div>

      {/* Add Location Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                      <MapPin size={20} />
                    </div>
                    <h3 className="text-2xl font-serif text-brand-black">הוספת נקודה במפה</h3>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-brand-gold/10 rounded-full transition-colors">
                    <X size={24} className="text-brand-black/40" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">שם המקום / האירוע</label>
                      <input
                        required
                        type="text"
                        value={newLocation.title}
                        onChange={(e) => setNewLocation({ ...newLocation, title: e.target.value })}
                        placeholder="למשל: הדייט הראשון שלנו"
                        className="w-full p-4 bg-brand-cream/30 rounded-xl border border-brand-gold/10 focus:border-brand-gold outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">תיאור קצר</label>
                      <textarea
                        value={newLocation.description}
                        onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                        placeholder="מה קרה כאן? מה אתם זוכרים?"
                        className="w-full p-4 bg-brand-cream/30 rounded-xl border border-brand-gold/10 focus:border-brand-gold outline-none min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">תאריך</label>
                        <input
                          type="date"
                          value={newLocation.date}
                          onChange={(e) => setNewLocation({ ...newLocation, date: e.target.value })}
                          className="w-full p-4 bg-brand-cream/30 rounded-xl border border-brand-gold/10 focus:border-brand-gold outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">סוג המקום</label>
                        <select
                          value={newLocation.type}
                          onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value as any })}
                          className="w-full p-4 bg-brand-cream/30 rounded-xl border border-brand-gold/10 focus:border-brand-gold outline-none"
                        >
                          <option value="first_date">דייט ראשון</option>
                          <option value="kiss">נשיקה ראשונה</option>
                          <option value="trip">טיול</option>
                          <option value="favorite">מקום אהוב</option>
                          <option value="future">חלום עתידי</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !newLocation.title}
                    className="w-full py-5 bg-brand-gold text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-black transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" />
                        שומר נקודה...
                      </>
                    ) : (
                      <>
                        <Sparkles />
                        נעץ במפה
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

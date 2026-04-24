import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Search, 
  Utensils, 
  Coffee, 
  Beer, 
  Music, 
  Film, 
  Trees, 
  Star, 
  Share2, 
  Camera, 
  MessageCircle,
  Navigation,
  Loader2,
  Heart,
  ExternalLink,
  X,
  Send,
  Zap,
  PiggyBank,
  Flame,
  Compass,
  Layers,
  Map as MapIcon,
  LayoutGrid,
  Info,
  Save
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
import { useFirebase } from '../contexts/FirebaseContext';
import { EditableText } from '../components/EditableText';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

interface Place {
  name: string;
  address: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  place_id: string;
  description?: string;
  maps_url?: string;
  image_url?: string;
  image_attribution?: string;
  lat?: number;
  lng?: number;
  category?: string;
}

interface Interaction {
  id: string;
  placeId: string;
  userId: string;
  coupleId: string;
  rating: number;
  review: string;
  photos: string[];
  timestamp: any;
  placeName: string;
  category: string;
  userName?: string;
}

const CATEGORIES = [
  { id: 'romantic', label: 'רומנטי', icon: Heart, query: 'most romantic date spots, viewpoints and hidden gems' },
  { id: 'adventurous', label: 'הרפתקני', icon: Zap, query: 'adventurous date ideas, extreme sports, and unique active experiences' },
  { id: 'budget', label: 'חסכוני', icon: PiggyBank, query: 'budget-friendly date ideas, free activities, and cheap but great eats' },
  { id: 'restaurant', label: 'מסעדות', icon: Utensils, query: 'recommended romantic restaurants' },
  { id: 'cafe', label: 'בתי קפה', icon: Coffee, query: 'cozy cafes for dates' },
  { id: 'pub', label: 'פאבים', icon: Beer, query: 'romantic bars and pubs' },
  { id: 'nature', label: 'טבע וטיולים', icon: Trees, query: 'nature trails, parks and streams for couples' },
];

const ISRAELI_CITIES = [
  'תל אביב-יפו', 'ירושלים', 'חיפה', 'ראשון לציון', 'פתח תקווה', 'אשדוד', 'נתניה', 'באר שבע', 'בני ברק', 'חולון', 
  'רמת גן', 'רחובות', 'אשקלון', 'בת ים', 'בית שמש', 'כפר סבא', 'הרצליה', 'חדרה', 'מודיעין-מכבים-רעות', 'רעננה', 
  'לוד', 'רמלה', 'נצרת', 'הוד השרון', 'ראש העין', 'קריית גת', 'גבעתיים', 'נהריה', 'עפולה', 'אילת', 
  'קריית אתא', 'קריית מוצקין', 'עכו', 'כרמיאל', 'רמת השרון', 'יבנה', 'טבריה', 'קריית ים', 'אור יהודה', 'מעלה אדומים', 
  'צפת', 'נתיבות', 'דימונה', 'יהוד-מונוסון', 'שדרות', 'אופקים', 'נשר', 'קריית ביאליק', 'קריית שמונה', 'ערד', 
  'מגדל העמק', 'טירת כרמל', 'בית שאן', 'כפר יונה', 'קריית מלאכי', 'אריאל', 'גבעת שמואל', 'מעלות-תרשיחא', 'נוף הגליל', 
  'סח\'נין', 'טייבה', 'שפרעם', 'באקה אל-גרבייה', 'טירה', 'תמרה', 'קלנסווה', 'רהט', 'אום אל-פחם', 'כפר קאסם', 
  'מודיעין עילית', 'ביתר עילית', 'אלעד', 'חריש', 'זכרון יעקב', 'מבשרת ציון', 'גדרה', 'גן יבנה', 'פרדס חנה-כרכור', 
  'קצרין', 'מצפה רמון', 'ירוחם', 'קריית ארבע', 'מעלה אפרים', 'שלומי', 'כפר ורדים', 'רמת ישי', 'צור הדסה', 'כוכב יאיר', 
  'אלפי מנשה', 'אפרת', 'בית אל', 'קרני שומרון', 'קדומים', 'גבעת זאב', 'הר אדר', 'צור יצחק', 'קיסריה', 'עתלית'
];

const DateRecommendations = () => {
  const { user, profile } = useFirebase();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set([CATEGORIES[0].id]));
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesByLayer, setPlacesByLayer] = useState<Record<string, Place[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, text: '', photoUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingPlace, setIsSavingPlace] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Geolocation temporarily disabled
    // setError('לא הצלחנו לגשת למיקום שלך. תוכל להזין עיר ידנית.');
  }, []);

  useEffect(() => {
    if (selectedPlace) {
      const q = query(
        collection(db, 'place_interactions'),
        where('placeId', '==', selectedPlace.place_id),
        orderBy('timestamp', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Interaction[];
        setInteractions(data);
      });
      return () => unsubscribe();
    }
  }, [selectedPlace]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.search-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRecommendations = async (searchArea?: string, layerId?: string) => {
    const targetLayer = layerId ? CATEGORIES.find(c => c.id === layerId) : activeCategory;
    if (!targetLayer) return;

    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `מצא 5 המלצות ל${targetLayer.label} באזור ${searchArea || (location ? 'המיקום הנוכחי שלי' : 'ישראל')}. 
      התמקד במקומות רומנטיים ומתאימים לדייטים. 
      עבור כל מקום ציין: שם, כתובת, דירוג (אם ידוע), תיאור קצר למה הוא מומלץ, וקישור ל-Google Maps.
      בנוסף, עבור כל מקום, מצא כתובת URL של תמונה אמיתית ומייצגת של המקום וציין את מקור התמונה (זכויות יוצרים).
      חשוב מאוד: כלול גם קואורדינטות (קו רוחב וקו אורך) עבור המיקום.
      החזר את התוצאות בפורמט JSON כרשימה של אובייקטים עם השדות: name, address, rating, description, maps_url, place_id, image_url, image_attribution, lat, lng.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: location ? { latitude: location.lat, longitude: location.lng } : undefined
            }
          }
        },
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]).map((p: any) => ({ ...p, category: targetLayer.id }));
        
        if (layerId) {
          setPlacesByLayer(prev => ({ ...prev, [layerId]: data }));
          // Also update the flat places list for grid view if it's the only active one
          if (activeLayers.size === 1) {
            setPlaces(data);
          }
        } else {
          setPlaces(data);
          setPlacesByLayer(prev => ({ ...prev, [targetLayer.id]: data }));
        }
      } else {
        setError('לא הצלחנו לקבל המלצות מדויקות כרגע. נסה שוב בעוד רגע.');
      }
    } catch (err) {
      console.error(err);
      setError('אירעה שגיאה בחיפוש ההמלצות.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLayer = (layerId: string) => {
    const newLayers = new Set(activeLayers);
    if (newLayers.has(layerId)) {
      if (newLayers.size > 1) {
        newLayers.delete(layerId);
      }
    } else {
      newLayers.add(layerId);
      // Fetch if we don't have results for this layer yet
      if (!placesByLayer[layerId]) {
        fetchRecommendations(address, layerId);
      }
    }
    setActiveLayers(newLayers);
    
    // Update activeCategory to the last added or first available
    const lastLayerId = Array.from(newLayers).pop();
    const lastLayer = CATEGORIES.find(c => c.id === lastLayerId);
    if (lastLayer) setActiveCategory(lastLayer);
  };

  // Combine all active places for map view
  const allActivePlaces = Object.entries(placesByLayer)
    .filter(([id]) => activeLayers.has(id))
    .flatMap(([_, places]) => places);

  const refreshAllLayers = async (searchArea?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch for all active layers in parallel
      const fetchPromises = Array.from(activeLayers).map(layerId => 
        fetchRecommendations(searchArea, layerId)
      );
      await Promise.all(fetchPromises);
    } catch (err) {
      console.error(err);
      setError('אירעה שגיאה בעדכון ההמלצות.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInteraction = async () => {
    if (!user || !profile || !selectedPlace) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'place_interactions'), {
        placeId: selectedPlace.place_id,
        userId: user.uid,
        coupleId: profile.coupleId,
        userName: profile.displayName || 'משתמש Byond',
        rating: newReview.rating,
        review: newReview.text,
        photos: newReview.photoUrl ? [newReview.photoUrl] : [],
        timestamp: serverTimestamp(),
        placeName: selectedPlace.name,
        category: activeCategory.id
      });
      setNewReview({ rating: 5, text: '', photoUrl: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'place_interactions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePlace = async (place: Place) => {
    if (!user) return;
    setIsSavingPlace(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'saved_places'), {
        ...place,
        savedAt: serverTimestamp()
      });
      setSaveSuccess(place.place_id);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/saved_places`);
    } finally {
      setIsSavingPlace(false);
    }
  };

  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (val.length >= 2) {
      const filtered = ISRAELI_CITIES.filter(city => 
        city.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (city: string) => {
    setAddress(city);
    setSuggestions([]);
    setShowSuggestions(false);
    fetchRecommendations(city);
  };

  return (
    <div className="min-h-screen bg-brand-cream/30 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EditableText 
              contentId="date_recommendations_title"
              defaultText="המלצות לדייטים מושלמים"
              as="h1"
              className="text-4xl md:text-5xl font-serif text-brand-black"
            />
          </motion.div>
          <p className="text-brand-black/60 max-w-2xl mx-auto">
            גלו מקומות קסומים באזורכם או בכל מקום אחר בארץ. מסעדות, טבע, תרבות וכל מה שביניהם.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-gold/10 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 search-container">
            <div className="relative flex-1">
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gold" size={20} />
              <input 
                type="text"
                placeholder="הזינו עיר או אזור (למשל: תל אביב, הגליל העליון...)"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => address.length >= 2 && setShowSuggestions(true)}
                className="w-full pr-12 pl-4 py-4 bg-brand-cream/20 border border-brand-gold/20 rounded-2xl focus:outline-none focus:border-brand-gold transition-all text-right"
              />
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-brand-gold/10 rounded-2xl shadow-xl z-40 overflow-hidden"
                  >
                    {suggestions.map((city, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSuggestion(city)}
                        className="w-full px-6 py-3 text-right hover:bg-brand-cream/50 transition-colors text-brand-black border-b border-brand-gold/5 last:border-0 flex items-center justify-between"
                      >
                        <MapPin size={14} className="text-brand-gold/40" />
                        <span>{city}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={() => refreshAllLayers(address)}
              disabled={isLoading}
              className="px-8 py-4 bg-brand-gold text-white rounded-2xl font-bold hover:bg-brand-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
              חפשו המלצות
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap justify-center md:justify-start gap-3 flex-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleLayer(cat.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                    activeLayers.has(cat.id) 
                      ? 'bg-brand-black text-white shadow-lg scale-105' 
                      : 'bg-brand-cream/50 text-brand-black/60 hover:bg-brand-gold/10'
                  }`}
                >
                  <cat.icon size={18} />
                  {cat.label}
                </button>
              ))}
            </div>
            
            <div className="flex bg-brand-cream/50 p-1 rounded-2xl border border-brand-gold/10 shrink-0">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-brand-gold shadow-sm' : 'text-brand-black/40 hover:text-brand-black'}`}
                title="תצוגת גריד"
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'map' ? 'bg-white text-brand-gold shadow-sm' : 'text-brand-black/40 hover:text-brand-black'}`}
                title="תצוגת מפה"
              >
                <MapIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center border border-red-100">
            {error}
          </div>
        )}

        {viewMode === 'map' ? (
          <div className="h-[600px] rounded-[40px] overflow-hidden shadow-xl border-8 border-white relative z-0">
            <MapContainer 
              center={location ? [location.lat, location.lng] : [32.0853, 34.7818]} 
              zoom={12} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {allActivePlaces.map((place, idx) => (
                place.lat && place.lng && (
                  <Marker key={place.place_id || idx} position={[place.lat, place.lng]} icon={customIcon}>
                    <Popup className="custom-popup">
                      <div className="p-3 space-y-2 min-w-[200px] text-right">
                        <img 
                          src={place.image_url || `https://picsum.photos/seed/${place.name}/300/200`} 
                          alt={place.name}
                          className="w-full h-24 object-cover rounded-xl mb-2"
                          referrerPolicy="no-referrer"
                        />
                        <h4 className="font-serif text-lg text-brand-black">{place.name}</h4>
                        <p className="text-xs text-brand-black/60 line-clamp-2">{place.description}</p>
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => setSelectedPlace(place)}
                            className="flex-1 py-2 bg-brand-gold/10 text-brand-gold rounded-lg text-[10px] font-bold"
                          >
                            פרטים נוספים
                          </button>
                          <button 
                            onClick={() => handleSavePlace(place)}
                            disabled={isSavingPlace || saveSuccess === place.place_id}
                            className={`p-2 rounded-lg transition-all ${saveSuccess === place.place_id ? 'bg-emerald-500 text-white' : 'bg-brand-black text-white hover:bg-brand-gold'}`}
                          >
                            <Save size={14} />
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {allActivePlaces.map((place, idx) => (
                <motion.div
                  key={place.place_id || idx}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-gold/10 group hover:shadow-xl transition-all"
                >
                  <div className="h-48 bg-brand-cream/50 relative overflow-hidden">
                    <img 
                      src={place.image_url || `https://picsum.photos/seed/${place.name}/600/400`} 
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-brand-gold">
                      <Star size={12} fill="currentColor" />
                      {place.rating || 'חדש'}
                    </div>
                    {place.image_attribution && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm text-[8px] text-white px-2 py-0.5 text-left ltr">
                        © {place.image_attribution}
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-brand-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-white font-bold uppercase tracking-widest">
                      {CATEGORIES.find(c => c.id === place.category)?.label}
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-serif text-brand-black mb-1">{place.name}</h3>
                      <p className="text-xs text-brand-black/40 flex items-center gap-1">
                        <MapPin size={12} />
                        {place.address}
                      </p>
                    </div>
                    <p className="text-sm text-brand-black/60 line-clamp-2">
                      {place.description}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setSelectedPlace(place)}
                        className="flex-1 py-3 bg-brand-cream text-brand-black rounded-xl text-xs font-bold hover:bg-brand-gold hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={14} />
                        חוות דעת
                      </button>
                      <button 
                        onClick={() => handleSavePlace(place)}
                        disabled={isSavingPlace || saveSuccess === place.place_id}
                        className={`p-3 rounded-xl transition-all ${saveSuccess === place.place_id ? 'bg-emerald-500 text-white' : 'bg-brand-black text-white hover:bg-brand-gold'}`}
                        title="שמור לפרופיל"
                      >
                        <Save size={18} />
                      </button>
                      <a 
                        href={place.maps_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 bg-brand-gold/10 text-brand-gold rounded-xl hover:bg-brand-gold hover:text-white transition-all"
                      >
                        <Navigation size={18} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && allActivePlaces.length === 0 && !error && (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold">
              <Heart size={40} />
            </div>
            <h3 className="text-xl font-serif text-brand-black">מחפשים את הדייט הבא שלכם?</h3>
            <p className="text-brand-black/40">בחרו קטגוריה ואזור ולחצו על חיפוש כדי לקבל המלצות חמות.</p>
          </div>
        )}
      </div>

      {/* Place Details & Interactions Modal */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-brand-gold/10 flex items-center justify-between bg-brand-cream/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-gold rounded-2xl flex items-center justify-center text-white">
                    <activeCategory.icon size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif text-brand-black">{selectedPlace.name}</h2>
                    <p className="text-xs text-brand-black/40">{selectedPlace.address}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPlace(null)}
                  className="p-2 hover:bg-brand-gold/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Add Review Form */}
                <div className="bg-brand-cream/20 rounded-2xl p-6 space-y-4 border border-brand-gold/10">
                  <h3 className="font-bold text-brand-black flex items-center gap-2">
                    <Camera size={18} className="text-brand-gold" />
                    שתפו את החוויה שלכם
                  </h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNewReview({ ...newReview, rating: num })}
                        className={`p-1 transition-all ${newReview.rating >= num ? 'text-brand-gold' : 'text-brand-black/20'}`}
                      >
                        <Star size={24} fill={newReview.rating >= num ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    placeholder="איך היה? ספרו לזוגות אחרים..."
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    className="w-full p-4 bg-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-gold min-h-[100px] text-right"
                  />
                  <div className="flex gap-4">
                    <input 
                      type="text"
                      placeholder="קישור לתמונה (אופציונלי)"
                      value={newReview.photoUrl}
                      onChange={(e) => setNewReview({ ...newReview, photoUrl: e.target.value })}
                      className="flex-1 p-3 bg-white border border-brand-gold/20 rounded-xl focus:outline-none focus:border-brand-gold text-right text-sm"
                    />
                    <button 
                      onClick={handleAddInteraction}
                      disabled={isSubmitting || !newReview.text}
                      className="px-6 py-3 bg-brand-black text-white rounded-xl font-bold hover:bg-brand-gold transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      שלחו
                    </button>
                  </div>
                </div>

                {/* Interactions List */}
                <div className="space-y-6">
                  <h3 className="font-bold text-brand-black border-b border-brand-gold/10 pb-2">מה הזוגות שלנו אומרים</h3>
                  {interactions.length === 0 ? (
                    <div className="text-center py-8 text-brand-black/40 italic">
                      תהיו הראשונים לשתף חוויות מהמקום הזה!
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {interactions.map((interaction) => (
                        <div key={interaction.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-brand-cream rounded-full flex items-center justify-center text-[10px] font-bold">
                                {interaction.userName?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold">{interaction.userName}</p>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <Star 
                                      key={num} 
                                      size={10} 
                                      className={interaction.rating >= num ? 'text-brand-gold' : 'text-brand-black/10'} 
                                      fill={interaction.rating >= num ? 'currentColor' : 'none'}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] text-brand-black/30">
                              {interaction.timestamp?.toDate?.()?.toLocaleDateString('he-IL')}
                            </span>
                          </div>
                          <p className="text-sm text-brand-black/70 pr-10">{interaction.review}</p>
                          {interaction.photos && interaction.photos.length > 0 && (
                            <div className="flex gap-2 pr-10 overflow-x-auto pb-2">
                              {interaction.photos.map((photo, i) => (
                                <img 
                                  key={i} 
                                  src={photo} 
                                  alt="User review" 
                                  className="w-24 h-24 object-cover rounded-xl border border-brand-gold/10"
                                  referrerPolicy="no-referrer"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateRecommendations;

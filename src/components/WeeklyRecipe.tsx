import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Utensils, Clock, Users, ChefHat, Heart, Loader2, ExternalLink, Flame, Sparkles, Share2, Wand2, Camera, ImagePlus, Play, Video, Volume2, Square, Star } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, getDocs, where } from 'firebase/firestore';
import { useAlert } from './AlertModal';
import { GoogleGenAI, Type } from '@google/genai';
import { useTTS } from '../hooks/useTTS';
import { ContentFeedback } from './ContentFeedback';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: string;
  imageUrl: string;
  videoUrl?: string;
}

interface CulinaryMoment {
  id: string;
  imageUrl: string;
  recipeTitle: string;
  createdAt: any;
}

export const WeeklyRecipe = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeRecipeIndex, setActiveRecipeIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dietaryPreference, setDietaryPreference] = useState('הכל');
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [moments, setMoments] = useState<CulinaryMoment[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert } = useAlert();
  const { playText, stop: stopTTS, isPlaying: isTTSPlaying } = useTTS();

  const recipe = recipes[activeRecipeIndex] || null;

  useEffect(() => {
    if (dietaryPreference !== 'הכל') {
      setShowAiPrompt(true);
      return;
    }

    setIsLoading(true);
    setShowAiPrompt(false);
    const q = query(collection(db, 'weekly_recipes'), orderBy('createdAt', 'desc'), limit(3));
    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const fetchedRecipes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
        setRecipes(fetchedRecipes);
      } else {
        setRecipes([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [dietaryPreference]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'favorite_recipes'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setFavorites(snap.docs.map(doc => doc.data().recipeId));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'culinary_moments'), orderBy('createdAt', 'desc'), limit(12));
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetchedMoments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CulinaryMoment));
      setMoments(fetchedMoments);
    });
    return () => unsubscribe();
  }, []);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !recipe) return;

    setIsUploading(true);
    try {
      const base64Image = await resizeImage(file);
      await addDoc(collection(db, 'culinary_moments'), {
        imageUrl: base64Image,
        recipeTitle: recipe.title,
        createdAt: serverTimestamp()
      });
      showAlert('התמונה הועלתה בהצלחה לקיר הקולינרי שלכם!');
    } catch (error) {
      console.error('Error uploading image:', error);
      showAlert('אירעה שגיאה בהעלאת התמונה. נסו שוב.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleFavorite = async (recipeToFav: Recipe) => {
    if (!auth.currentUser) {
      showAlert('יש להתחבר כדי לשמור מתכונים');
      return;
    }

    const isFav = favorites.includes(recipeToFav.id);
    try {
      if (isFav) {
        const q = query(
          collection(db, 'favorite_recipes'), 
          where('userId', '==', auth.currentUser.uid),
          where('recipeId', '==', recipeToFav.id)
        );
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
          await deleteDoc(doc(db, 'favorite_recipes', d.id));
        });
        showAlert('המתכון הוסר מהמועדפים');
      } else {
        await addDoc(collection(db, 'favorite_recipes'), {
          userId: auth.currentUser.uid,
          recipeId: recipeToFav.id,
          recipeTitle: recipeToFav.title,
          createdAt: serverTimestamp()
        });
        showAlert('המתכון נשמר במועדפים!');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const generateSmartRecipe = async (preference: string) => {
    setDietaryPreference(preference);
    setShowAiPrompt(false);
    if (preference === 'הכל') {
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Create 3 romantic recipe suggestions for a couple to cook together. 
      The dietary preference is: ${preference}.
      The recipes MUST be written entirely in Hebrew.
      Keep them concise and easy to follow.
      Return the response in JSON format as an array of recipes.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "שם המתכון בעברית" },
                description: { type: Type.STRING, description: "תיאור קצר ורומנטי בעברית" },
                ingredients: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "רשימת מצרכים בעברית"
                },
                instructions: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "שלבי הכנה בעברית"
                },
                prepTime: { type: Type.STRING, description: "זמן הכנה בעברית" },
                difficulty: { type: Type.STRING, description: "רמת קושי בעברית" }
              },
              required: ["title", "description", "ingredients", "instructions", "prepTime", "difficulty"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || '[]');
      const generatedRecipes = data.map((r: any, idx: number) => ({
        id: `ai-gen-${idx}-${Date.now()}`,
        ...r,
        imageUrl: preference === 'קינוחים' 
          ? 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80' 
          : 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80'
      }));
      setRecipes(generatedRecipes);
      setActiveRecipeIndex(0);
    } catch (error) {
      console.error('Error generating recipe:', error);
      showAlert('אירעה שגיאה ביצירת המתכונים החכמים. נסו שוב.');
      setDietaryPreference('הכל');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!recipe) return;
    
    const shareData = {
      title: recipe.title,
      text: `המתכון השבועי שלנו: ${recipe.title}\n${recipe.description}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        showAlert('הקישור הועתק ללוח!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <Loader2 size={48} className="animate-spin text-brand-gold" />
      <p className="text-brand-black/60 font-serif animate-pulse">טוען נתונים...</p>
    </div>
  );

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-brand-black flex items-center justify-center gap-3 mb-2">
          <Utensils className="text-brand-gold" /> אתגר הבישול השבועי
        </h2>
        <p className="text-brand-black/60 italic mb-8">מבשלים יחד, נהנים יחד.</p>
        
        <div className="flex flex-wrap justify-center gap-3">
          {['הכל', 'צמחוני', 'טבעוני', 'בשרי', 'חלבי', 'קינוחים'].map((pref) => (
            <button
              key={pref}
              onClick={() => {
                setDietaryPreference(pref);
                if (pref !== 'הכל') {
                  setRecipes([]);
                }
              }}
              disabled={isGenerating}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                dietaryPreference === pref
                  ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/20 border border-brand-gold'
                  : 'bg-white text-brand-black/70 hover:bg-brand-gold/10 hover:text-brand-black border border-brand-gold/20'
              } ${isGenerating && dietaryPreference !== pref ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {pref !== 'הכל' && <Wand2 size={14} className={dietaryPreference === pref ? 'text-white' : 'text-brand-gold'} />}
              {isGenerating && dietaryPreference === pref ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> מכין...
                </>
              ) : (
                pref
              )}
            </button>
          ))}
        </div>
      </div>

      {recipes.length > 1 && (
        <div className="flex justify-center gap-4 mb-8">
          {recipes.map((r, idx) => (
            <button
              key={r.id}
              onClick={() => setActiveRecipeIndex(idx)}
              className={`w-12 h-12 rounded-full font-serif text-lg transition-all ${
                activeRecipeIndex === idx 
                  ? 'bg-brand-gold text-white scale-110 shadow-lg' 
                  : 'bg-white text-brand-black/40 border border-brand-gold/20 hover:border-brand-gold'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {isGenerating ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 bg-white border border-dashed border-brand-gold/30 rounded-[40px] max-w-2xl mx-auto text-center px-6 shadow-xl shadow-brand-gold/5"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Wand2 size={48} className="text-brand-gold mb-6" />
          </motion.div>
          <h3 className="text-2xl font-serif text-brand-black mb-4">השף החכם עובד...</h3>
          <div className="flex flex-col gap-2 items-center">
            <p className="text-brand-black/60 italic">מרכיב עבורכם מתכון {dietaryPreference} מושלם לזוגיות</p>
            <div className="flex gap-1 mt-2">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-brand-gold" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-brand-gold" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-brand-gold" />
            </div>
          </div>
        </motion.div>
      ) : showAiPrompt ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-brand-gold/5 border border-brand-gold/20 rounded-[40px] max-w-2xl mx-auto px-6 shadow-xl shadow-brand-gold/5"
        >
          <Wand2 size={48} className="mx-auto text-brand-gold mb-6" />
          <h3 className="text-2xl font-serif text-brand-black mb-4">מתכון {dietaryPreference} בהתאמה אישית</h3>
          <p className="text-brand-black/60 italic mb-8">תנו לבינה המלאכותית שלנו להרכיב עבורכם מתכון מושלם שמתאים בדיוק להעדפות שלכם.</p>
          <button 
            onClick={() => generateSmartRecipe(dietaryPreference)}
            className="px-8 py-3 bg-brand-gold text-white rounded-full font-bold hover:bg-brand-black transition-colors shadow-lg flex items-center gap-2 mx-auto"
          >
            <Sparkles size={18} /> צור מתכון עכשיו
          </button>
        </motion.div>
      ) : !recipe ? (
        <div className="text-center py-32 bg-white border border-dashed border-brand-gold/30 rounded-[40px] max-w-2xl mx-auto px-6 shadow-xl shadow-brand-gold/5">
          <ChefHat size={48} className="mx-auto text-brand-gold/40 mb-6" />
          <h3 className="text-2xl font-serif text-brand-black mb-2">אין מתכון כרגע</h3>
          <p className="text-brand-black/60 italic">השף שלנו בחופשה... חזרו בקרוב למתכון השבועי!</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-12 bg-white border border-brand-gold/20 rounded-[40px] overflow-hidden shadow-2xl shadow-brand-gold/5">
          <div className="relative h-[400px] lg:h-auto">
            <img 
              src={recipe.imageUrl || "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80"} 
              alt={recipe.title}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-8 right-8 left-8 text-right">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-brand-gold text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                  {recipe.difficulty}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12} /> {recipe.prepTime}
                </span>
              </div>
              <h3 className="text-4xl font-serif text-white mb-2">{recipe.title}</h3>
              <p className="text-white/80 italic text-sm">{recipe.description}</p>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-12 text-right">
            <section className="space-y-6">
              <h4 className="text-xl font-serif text-brand-gold flex items-center justify-end gap-2">
                מצרכים <Sparkles size={18} />
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipe.ingredients.map((item, i) => (
                  <li key={i} className="flex items-center justify-end gap-3 text-brand-black/80 group">
                    <span className="text-sm">{item}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold/40 group-hover:bg-brand-gold transition-colors" />
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (isTTSPlaying) {
                      stopTTS();
                    } else {
                      playText(`אופן ההכנה: ${recipe.instructions.join('. ')}`);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-cream border border-brand-gold/30 rounded-full text-brand-gold hover:bg-brand-gold hover:text-white transition-colors text-sm font-medium"
                >
                  {isTTSPlaying ? <Square size={16} /> : <Volume2 size={16} />}
                  {isTTSPlaying ? 'עצור הקראה' : 'הקרא לי'}
                </button>
                <h4 className="text-xl font-serif text-brand-gold flex items-center justify-end gap-2">
                  אופן ההכנה <ChefHat size={18} />
                </h4>
              </div>
              <div className="space-y-6">
                {recipe.instructions.map((step, i) => (
                  <div key={i} className="flex gap-6 items-start justify-end">
                    <div className="flex-1">
                      <p className="text-brand-black/80 leading-relaxed text-sm">{step}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-brand-cream border border-brand-gold/20 flex items-center justify-center text-brand-gold font-serif shrink-0">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
              
              {recipe.videoUrl && (
                <a 
                  href={recipe.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-8 block relative group rounded-2xl overflow-hidden border border-brand-gold/20 shadow-lg"
                >
                  {getYouTubeId(recipe.videoUrl) ? (
                    <>
                      <img 
                        src={`https://img.youtube.com/vi/${getYouTubeId(recipe.videoUrl)}/hqdefault.jpg`} 
                        alt="Video Thumbnail" 
                        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="w-16 h-16 bg-brand-gold rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                          <Play size={24} className="ml-1" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full aspect-video bg-brand-cream flex items-center justify-center group-hover:bg-brand-gold/10 transition-colors">
                      <div className="text-brand-gold flex flex-col items-center gap-2">
                        <Video size={32} />
                        <span className="font-bold">צפו בסרטון ההדרכה</span>
                      </div>
                    </div>
                  )}
                </a>
              )}
            </section>

            <div className="pt-8 border-t border-brand-gold/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-black/40 text-xs">
                <Users size={16} /> מתאים לזוג
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 text-brand-black/60 hover:text-brand-gold transition-colors font-bold"
                  title="שתף מתכון"
                >
                  <Share2 size={20} /> שתף
                </button>
                <button 
                  onClick={() => toggleFavorite(recipe)}
                  className={`flex items-center gap-2 transition-colors font-bold ${
                    favorites.includes(recipe.id) ? 'text-red-500' : 'text-brand-gold hover:text-brand-gold/80'
                  }`}
                >
                  <Heart size={20} fill={favorites.includes(recipe.id) ? 'currentColor' : 'none'} /> 
                  {favorites.includes(recipe.id) ? 'נשמר במועדפים' : 'אהבנו את המתכון'}
                </button>
              </div>
            </div>
            
            <div className="pt-8 border-t border-brand-gold/10">
              <ContentFeedback pageId="recipes" sectionId={`recipe-${recipe.id}`} />
            </div>
          </div>
        </div>
      )}

      {/* Culinary Wall Section */}
      <div className="mt-24 pt-16 border-t border-brand-gold/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="text-right">
            <h3 className="text-3xl font-serif text-brand-black mb-2 flex items-center justify-end gap-3">
              הקיר הקולינרי שלנו <Camera className="text-brand-gold" />
            </h3>
            <p className="text-brand-black/60 italic">הכנתם את המתכון? שתפו תמונה של היצירה שלכם!</p>
          </div>
          
          <label className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all cursor-pointer shadow-lg
            ${isUploading 
              ? 'bg-brand-cream text-brand-black/50 cursor-not-allowed' 
              : 'bg-brand-gold text-white hover:bg-brand-black hover:text-brand-gold shadow-brand-gold/20'
            }
          `}>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              onChange={handleImageUpload}
              disabled={isUploading || !recipe}
              ref={fileInputRef}
            />
            {isUploading ? (
              <><Loader2 size={18} className="animate-spin" /> מעלה תמונה...</>
            ) : (
              <><ImagePlus size={18} /> העלאת תמונה</>
            )}
          </label>
        </div>

        {moments.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {moments.map((moment, index) => (
              <motion.div 
                key={moment.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="aspect-square relative group rounded-2xl overflow-hidden shadow-md"
              >
                <img 
                  src={moment.imageUrl} 
                  alt={moment.recipeTitle} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-right">
                  <p className="text-white font-serif text-sm line-clamp-2">{moment.recipeTitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/50 border border-dashed border-brand-gold/30 rounded-3xl">
            <Camera size={48} className="mx-auto text-brand-gold/30 mb-4" />
            <p className="text-brand-black/60 italic">עדיין אין תמונות בקיר הקולינרי.<br/>היו הראשונים להעלות תמונה של המנה שלכם!</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wine, Camera, Sparkles, Loader2, Coffee, GlassWater, ChevronRight, Info, IceCream } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const COCKTAILS = [
  {
    name: 'Midnight Kiss',
    vibe: 'רומנטי ומסתורי',
    ingredients: ['60ml ג\'ין', '30ml מיץ אוכמניות', '15ml מיץ לימון טרי', '15ml סירופ סוכר', 'ענף רוזמרין לעישון'],
    instructions: ['הדליקו את ענף הרוזמרין וכסו אותו עם הכוס כדי ללכוד את העשן.', 'בשייקר עם קרח, שקשקו את כל שאר המרכיבים.', 'סננו לכוס המעושנת והגישו מיד.'],
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Golden Hour Spritz',
    vibe: 'קליל ומרענן',
    ingredients: ['90ml פרוסקו', '60ml אפרול', '30ml סודה', 'פלח תפוז', 'הרבה קרח'],
    instructions: ['מלאו כוס יין גדולה בקרח.', 'מזגו את האפרול והפרוסקו.', 'הוסיפו סודה וערבבו בעדינות.', 'קשטו בפלח תפוז.'],
    image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Spicy Lovers Margarita',
    vibe: 'נועז ופיקנטי',
    ingredients: ['60ml טקילה רפוסאדו', '30ml מיץ ליים', '15ml ליקר תפוזים', '2 פרוסות חלפיניו', 'כתר מלח צ\'ילי'],
    instructions: ['העבירו פלח ליים על שפת הכוס וטבלו במלח צ\'ילי.', 'כתשו את החלפיניו בשייקר.', 'הוסיפו את שאר המרכיבים וקרח, ושקשקו היטב.', 'סננו לכוס עם קרח חדש.'],
    image: 'https://images.unsplash.com/photo-1587223075055-82e9a937ddff?auto=format&fit=crop&q=80&w=800'
  }
];

const ICED_COFFEES = [
  {
    name: 'Affogato Martini',
    vibe: 'קינוח אלכוהולי מושחת',
    ingredients: ['1 מנת אספרסו כפולה', 'כדור גלידת וניל איכותית', '30ml ליקר קפה (קלואה)', '30ml וודקה וניל'],
    instructions: ['שימו את כדור הגלידה בכוס מרטיני רחבה.', 'בשייקר עם קרח, שקשקו את האספרסו, ליקר הקפה והוודקה.', 'סננו בעדינות מעל הגלידה והגישו מיד עם כפית.'],
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Irish Iced Latte',
    vibe: 'מנחם ועשיר',
    ingredients: ['2 מנות אספרסו', '45ml אייריש קרים (בייליס)', '150ml חלב קר', 'קרח', 'קצפת וקינמון'],
    instructions: ['מלאו כוס גבוהה בקרח.', 'מזגו את החלב והאייריש קרים.', 'מזגו את האספרסו בעדינות מעל כדי ליצור שכבות.', 'קשטו בקצפת ומעט קינמון.'],
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Caramel Macchiato Float',
    vibe: 'מתוק ומרענן',
    ingredients: ['קפה קר מבושל מראש', 'כדור גלידת קרמל מלוח', 'רוטב קרמל', 'קצפת'],
    instructions: ['זלפו רוטב קרמל על דפנות הכוס.', 'הניחו את כדור הגלידה בתחתית.', 'מזגו את הקפה הקר מעל.', 'סיימו עם הר של קצפת ועוד קצת קרמל.'],
    image: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?auto=format&fit=crop&q=80&w=800'
  }
];

export const SommelierBar = () => {
  const [activeTab, setActiveTab] = useState<'cocktails' | 'coffee' | 'ai'>('cocktails');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        analyzeIngredients(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeIngredients = async (base64Image: string) => {
    setIsAnalyzing(true);
    setRecipe(null);
    try {
      const base64Data = base64Image.split(',')[1];
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg"
            }
          },
          {
            text: `זהה את בקבוקי האלכוהול והמרכיבים בתמונה. 
            הצע מתכון לקוקטייל רומנטי ויוקרתי לזוג שאפשר להכין מהם.
            החזר אובייקט JSON עם השדות:
            - name: שם הקוקטייל
            - vibe: אווירה (למשל: "רומנטי ומעושן")
            - ingredients: מערך של מחרוזות (מרכיבים)
            - instructions: מערך של מחרוזות (שלבי הכנה)`
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              vibe: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "vibe", "ingredients", "instructions"]
          }
        }
      });
      
      const data = JSON.parse(response.text || "{}");
      setRecipe(data);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setRecipe({
        name: "קוקטייל האהבה הסודי",
        vibe: "רומנטי ומרענן",
        ingredients: ["2 מנות ג'ין", "1 מנה מיץ לימון טרי", "0.5 מנה סירופ סוכר", "פירות יער לקישוט"],
        instructions: ["הכניסו את כל המרכיבים לשייקר עם קרח.", "נערו היטב במשך 15 שניות.", "סננו לכוס מרטיני מקוררת.", "קשטו בפירות יער והגישו באהבה."]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderRecipeCard = (item: any, index: number) => (
    <motion.div 
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl overflow-hidden shadow-xl border border-brand-gold/20 group hover:shadow-2xl transition-all duration-500"
    >
      <div className="h-48 overflow-hidden relative">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 right-4 text-white">
          <h3 className="text-2xl font-serif">{item.name}</h3>
          <p className="text-sm opacity-80 italic">{item.vibe}</p>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-2">
            <GlassWater size={16} /> מרכיבים
          </h4>
          <ul className="space-y-2">
            {item.ingredients.map((ing: string, i: number) => (
              <li key={i} className="text-sm text-brand-black/70 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-gold/50" />
                {ing}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-brand-gold uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles size={16} /> אופן ההכנה
          </h4>
          <ol className="space-y-3">
            {item.instructions.map((inst: string, i: number) => (
              <li key={i} className="text-sm text-brand-black/70 flex items-start gap-3">
                <span className="text-brand-gold font-bold">{i + 1}.</span>
                <span className="leading-relaxed">{inst}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto">
          <Wine size={40} className="text-brand-gold" />
        </div>
        <h2 className="text-4xl md:text-5xl font-serif text-brand-black">הבר והסומלייה האישי</h2>
        <p className="text-brand-black/60 max-w-2xl mx-auto text-lg">
          גלו מתכונים מיוחדים לערב רומנטי, מקוקטיילים קלאסיים ועד קפה קר מושחת עם אלכוהול וגלידה.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 border-b border-brand-gold/20 pb-4">
        <button
          onClick={() => setActiveTab('cocktails')}
          className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
            activeTab === 'cocktails' ? 'bg-brand-gold text-white shadow-lg' : 'text-brand-black/60 hover:bg-brand-gold/10'
          }`}
        >
          קוקטיילים
        </button>
        <button
          onClick={() => setActiveTab('coffee')}
          className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
            activeTab === 'coffee' ? 'bg-brand-gold text-white shadow-lg' : 'text-brand-black/60 hover:bg-brand-gold/10'
          }`}
        >
          קפה קר ופינוקים
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
            activeTab === 'ai' ? 'bg-brand-gold text-white shadow-lg' : 'text-brand-black/60 hover:bg-brand-gold/10'
          }`}
        >
          מיקסולוג AI
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'cocktails' && (
          <motion.div
            key="cocktails"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {COCKTAILS.map((item, index) => renderRecipeCard(item, index))}
          </motion.div>
        )}

        {activeTab === 'coffee' && (
          <motion.div
            key="coffee"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {ICED_COFFEES.map((item, index) => renderRecipeCard(item, index))}
          </motion.div>
        )}

        {activeTab === 'ai' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <div 
                className="border-2 border-dashed border-brand-gold/30 rounded-3xl p-8 text-center bg-white hover:bg-brand-cream/50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[300px]"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {image ? (
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white font-bold">החלף תמונה</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mb-4 text-brand-gold">
                      <Camera size={32} />
                    </div>
                    <h3 className="text-xl font-serif text-brand-black mb-2">צלמו את הבר שלכם</h3>
                    <p className="text-sm text-brand-black/60">
                      העלו תמונה של בקבוקי האלכוהול והמרכיבים שיש לכם בבית
                    </p>
                  </>
                )}
              </div>

              <div className="bg-brand-gold/5 rounded-3xl p-6 border border-brand-gold/20 flex items-start gap-4">
                <Info className="text-brand-gold shrink-0" />
                <p className="text-sm text-brand-black/70 leading-relaxed">
                  הבינה המלאכותית שלנו תזהה את המרכיבים בתמונה ותציע לכם מתכון לקוקטייל רומנטי שאפשר להכין ממה שיש.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-brand-gold/10 min-h-[400px] flex flex-col">
              {isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-brand-gold/20 rounded-full animate-spin"></div>
                    <div className="w-24 h-24 border-4 border-brand-gold rounded-full animate-spin absolute inset-0 border-t-transparent"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-gold" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-brand-gold mb-2">מנתח את המרכיבים...</h3>
                    <p className="text-brand-black/40 text-sm">המיקסולוג שלנו רוקח עבורכם קסם</p>
                  </div>
                </div>
              ) : recipe ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="text-center border-b border-brand-gold/20 pb-6">
                    <h3 className="text-3xl font-serif text-brand-black mb-2">{recipe.name}</h3>
                    <p className="text-brand-gold italic">{recipe.vibe}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-brand-black mb-4 flex items-center gap-2">
                      <GlassWater size={18} className="text-brand-gold" />
                      מרכיבים
                    </h4>
                    <ul className="space-y-3">
                      {recipe.ingredients.map((ing: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-brand-black/70 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-brand-black mb-4 flex items-center gap-2">
                      <Sparkles size={18} className="text-brand-gold" />
                      אופן ההכנה
                    </h4>
                    <ol className="space-y-4">
                      {recipe.instructions.map((inst: string, i: number) => (
                        <li key={i} className="flex gap-4 text-brand-black/70 text-sm leading-relaxed">
                          <span className="font-bold text-brand-gold shrink-0">{i + 1}.</span>
                          {inst}
                        </li>
                      ))}
                    </ol>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                  <Wine size={64} className="mb-4 text-brand-gold" />
                  <p className="text-lg font-serif">המתכון שלכם יופיע כאן</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

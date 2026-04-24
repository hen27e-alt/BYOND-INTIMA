import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Loader2, MessageCircle, ShoppingCart, ExternalLink } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GENRES = [
  { id: 'relationships', label: 'שיפור הזוגיות', icon: '💑' },
  { id: 'psychology', label: 'פסיכולוגיה והתפתחות', icon: '🧠' },
  { id: 'communication', label: 'תקשורת בין-אישית', icon: '🗣️' },
  { id: 'romance', label: 'רומן אהבה', icon: '❤️' },
  { id: 'parenting', label: 'הורות וזוגיות', icon: '👨‍👩‍👧‍👦' },
];

const FEATURED_BOOKS = [
  {
    title: 'שבעת העקרונות לנישואים מאושרים',
    author: 'ג\'ון גוטמן',
    summary: 'הספר המבוסס על מחקר של עשרות שנים, המציג את העקרונות המדעיים להצלחה בזוגיות.',
    tags: ['מחקר', 'פרקטי', 'חובה']
  },
  {
    title: 'חמש שפות לאהבה',
    author: 'גארי צ\'פמן',
    summary: 'גלו איך אתם ובני הזוג שלכם מבטאים ומקבלים אהבה כדי להעמיק את החיבור.',
    tags: ['תקשורת', 'רגש', 'פופולרי']
  },
  {
    title: 'לאחוז חזק',
    author: 'סו ג\'ונסון',
    summary: 'גישת ה-EFT לשיפור הקשר הרגשי והביטחון בתוך הזוגיות.',
    tags: ['טיפול', 'היקשרות', 'עומק']
  }
];

export const CoupleBookClub = () => {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRecommendation = async (genreId: string) => {
    setSelectedGenre(genreId);
    setIsGenerating(true);
    setRecommendation(null);

    const genreLabel = GENRES.find(g => g.id === genreId)?.label || genreId;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `המלץ על ספר אחד שמומלץ לזוגות לקרוא יחד בז'אנר: ${genreLabel}. 
          הספר צריך להיות מתורגם לעברית או במקור בעברית.
          החזר את שם הספר, הסופר, תקציר קצר, ו-3 שאלות לדיון זוגי על כוס יין אחרי שקוראים אותו.`,
        config: {
          systemInstruction: "You are a literary expert and couples counselor. Recommend a book and provide discussion questions. Return ONLY a valid JSON object.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Book title in Hebrew" },
              author: { type: Type.STRING, description: "Author name in Hebrew" },
              summary: { type: Type.STRING, description: "Short summary of the book" },
              questions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "3 discussion questions for the couple"
              }
            },
            required: ["title", "author", "summary", "questions"]
          }
        }
      });

      const data = JSON.parse(response.text?.trim() || "{}");
      setRecommendation(data);
    } catch (error) {
      console.error("Error generating book recommendation:", error);
      setRecommendation({
        title: 'שבעת העקרונות לנישואים מאושרים',
        author: 'ג\'ון גוטמן',
        summary: 'ספר חובה לכל זוג שמבוסס על מחקרים מדעיים ומציג עקרונות מעשיים לחיזוק החברות והאינטימיות בזוגיות.',
        questions: [
          'איזה עקרון מהספר הרגשתם שאנחנו כבר מיישמים טוב?',
          'איפה אנחנו יכולים להשתפר לפי המחקר של גוטמן?',
          'איך אנחנו יכולים להכניס יותר "מפות אהבה" ליומיום שלנו?'
        ]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getPurchaseLinks = (title: string, author: string) => {
    const query = encodeURIComponent(`${title} ${author}`);
    return [
      { name: 'סטימצקי', url: `https://www.steimatzky.co.il/catalogsearch/result/?q=${query}` },
      { name: 'צומת ספרים', url: `https://www.booknet.co.il/חיפוש?q=${query}` },
      { name: 'עברית (דיגיטלי)', url: `https://www.e-vrit.co.il/Search/${query}` }
    ];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-brand-black flex items-center justify-center gap-3">
          <BookOpen className="text-brand-gold" /> מועדון קריאה ושיפור הזוגיות
        </h2>
        <p className="text-brand-black/60 mt-2">בחרו תחום לשיפור, קבלו המלצה לספר מעשיר, ורכשו אותו ישירות מהחנויות המובילות.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {GENRES.map((genre) => (
          <button
            key={genre.id}
            onClick={() => generateRecommendation(genre.id)}
            disabled={isGenerating}
            className={`p-4 rounded-3xl border transition-all flex flex-col items-center justify-center gap-2 ${
              selectedGenre === genre.id 
                ? 'bg-brand-gold/10 border-brand-gold text-brand-gold shadow-sm' 
                : 'bg-white border-brand-gold/10 text-brand-black hover:bg-brand-cream shadow-sm'
            }`}
          >
            <span className="text-3xl">{genre.icon}</span>
            <span className="font-medium text-sm text-center">{genre.label}</span>
          </button>
        ))}
      </div>

      {!recommendation && !isGenerating && (
        <div className="space-y-6">
          <h3 className="text-xl font-serif text-brand-black border-b border-brand-gold/10 pb-4">ספרים מומלצים לשיפור הזוגיות</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURED_BOOKS.map((book, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-brand-gold/10 p-6 rounded-2xl hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <BookOpen className="text-brand-gold/40 group-hover:text-brand-gold transition-colors" size={20} />
                  <div className="flex gap-1">
                    {book.tags.map((tag, j) => (
                      <span key={j} className="text-[8px] uppercase tracking-widest bg-brand-gold/5 text-brand-gold px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h4 className="font-serif text-brand-black mb-1">{book.title}</h4>
                <p className="text-xs text-brand-black/40 mb-3">מאת: {book.author}</p>
                <p className="text-[11px] text-brand-black/60 leading-relaxed mb-4 line-clamp-3">{book.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {getPurchaseLinks(book.title, book.author).slice(0, 2).map((link, k) => (
                    <a
                      key={k}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-black flex items-center gap-1"
                    >
                      {link.name} <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center"
          >
            <Loader2 size={48} className="text-brand-gold animate-spin mx-auto mb-4" />
            <p className="text-brand-black/60 font-serif italic">מחפש את הספר המושלם עבורכם...</p>
          </motion.div>
        ) : recommendation ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-brand-gold/10 shadow-sm rounded-3xl p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-serif text-brand-gold mb-2">{recommendation.title}</h3>
                  <p className="text-brand-black/60 text-lg">מאת: {recommendation.author}</p>
                </div>
                
                <div className="bg-brand-cream/50 rounded-2xl p-6 border border-brand-gold/10">
                  <h4 className="text-brand-black font-medium mb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-brand-gold" /> על מה הספר?
                  </h4>
                  <p className="text-brand-black/80 leading-relaxed text-sm">{recommendation.summary}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-brand-black font-medium flex items-center gap-2">
                    <ShoppingCart size={18} className="text-brand-gold" /> איפה קונים?
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {getPurchaseLinks(recommendation.title, recommendation.author).map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white border border-brand-gold/20 rounded-xl text-xs font-bold text-brand-black hover:bg-brand-gold hover:text-white transition-all flex items-center gap-2 shadow-sm"
                      >
                        {link.name} <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xl font-serif text-brand-black flex items-center gap-2 border-b border-brand-gold/10 pb-4">
                  <MessageCircle size={20} className="text-brand-gold" /> שאלות לדיון זוגי
                </h4>
                <ul className="space-y-4">
                  {recommendation.questions.map((q: string, idx: number) => (
                    <motion.li 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.2 }}
                      className="flex gap-4 items-start bg-brand-cream/50 p-4 rounded-xl border border-brand-gold/5"
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-bold font-serif">
                        {idx + 1}
                      </span>
                      <p className="text-brand-black/90 text-sm pt-1 leading-relaxed">{q}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

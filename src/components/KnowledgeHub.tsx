import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Play, Headphones, ExternalLink, Loader2, Sparkles, Bookmark, Search, Share2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { useAlert } from './AlertModal';

interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'podcast';
  url: string;
  category: string;
  thumbnailUrl?: string;
}

const TYPE_ICONS = {
  article: BookOpen,
  video: Play,
  podcast: Headphones
};

const DEFAULT_ITEMS: KnowledgeItem[] = [
  {
    id: 'default-1',
    title: 'איך לנהל ריב בצורה בריאה?',
    description: 'כלים פרקטיים לתקשורת מקרבת בזמן קונפליקט. למדו איך להקשיב באמת ולהביע את עצמכם בלי להאשים.',
    type: 'article',
    url: '#',
    category: 'תקשורת',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'default-2',
    title: '5 שפות האהבה - מדריך מעשי',
    description: 'גלו מהי שפת האהבה שלכם ושל בן/בת הזוג, ואיך להשתמש בידע הזה כדי לחזק את הקשר ביומיום.',
    type: 'video',
    url: '#',
    category: 'הבנה הדדית',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'default-3',
    title: 'לשמור על הניצוץ בשגרת החיים',
    description: 'פודקאסט מרתק על דרכים יצירתיות לשמור על האינטימיות וההתרגשות גם אחרי שנים של זוגיות.',
    type: 'podcast',
    url: '#',
    category: 'אינטימיות',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'default-4',
    title: 'חלוקת מטלות בית בלי תסכול',
    description: 'שיטות מוכחות ליצירת שותפות אמיתית בניהול משק הבית, מניעת שחיקה וחלוקת עומס הוגנת.',
    type: 'article',
    url: '#',
    category: 'חיי יומיום',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584820927498-cafe4c147776?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'default-5',
    title: 'ניהול תקציב זוגי',
    description: 'איך לדבר על כסף בלי לריב? טיפים לניהול פיננסי משותף, תיאום ציפיות ובניית עתיד כלכלי יחד.',
    type: 'video',
    url: '#',
    category: 'פיננסים',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'default-6',
    title: 'התמודדות עם שחיקה בעבודה והשפעתה על הזוגיות',
    description: 'כיצד לתמוך בבן/בת הזוג בתקופות עמוסות, ואיך להפריד בין הלחץ בעבודה לזמן האיכות המשותף.',
    type: 'podcast',
    url: '#',
    category: 'תמיכה',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop'
  }
];

export const KnowledgeHub = () => {
  const [items, setItems] = useState<KnowledgeItem[]>(DEFAULT_ITEMS);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { showAlert } = useAlert();

  useEffect(() => {
    const q = query(collection(db, 'knowledge_hub'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list: KnowledgeItem[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as KnowledgeItem));
      
      // Combine fetched items with default items, avoiding duplicates by ID if any
      const combined = [...list, ...DEFAULT_ITEMS.filter(di => !list.some(li => li.id === di.id))];
      setItems(combined);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching knowledge hub items:", error);
      setIsLoading(false); // Still show default items if fetch fails
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

  const handleShare = async (item: KnowledgeItem) => {
    const shareData = {
      title: item.title,
      text: `ממליץ/ה על התוכן הזה ממרכז הידע: ${item.title}\n${item.description}`,
      url: item.url || window.location.href
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

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-right">
          <h2 className="text-3xl font-serif text-white flex items-center justify-end gap-3">
            מרכז הידע הזוגי <BookOpen className="text-brand-gold" />
          </h2>
          <p className="text-white/40 italic">תוכן נבחר להעמקת הקשר והחיבור.</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
          {['all', 'article', 'video', 'podcast'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all uppercase tracking-widest ${
                filter === t ? 'bg-brand-gold text-black' : 'text-white/40 hover:text-white'
              }`}
            >
              {t === 'all' ? 'הכל' : t === 'article' ? 'מאמרים' : t === 'video' ? 'וידאו' : 'פודקאסטים'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden hover:border-brand-gold/30 transition-all flex flex-col"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={item.thumbnailUrl || `https://picsum.photos/seed/${item.id}/800/600`} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-xl text-brand-gold border border-white/10">
                {React.createElement(TYPE_ICONS[item.type], { size: 20 })}
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col text-right">
              <div className="flex items-center justify-end gap-2 mb-3">
                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest px-2 py-0.5 bg-brand-gold/10 rounded-full">
                  {item.category}
                </span>
              </div>
              <h3 className="text-xl font-serif text-white mb-3 leading-tight">{item.title}</h3>
              <p className="text-white/40 text-sm italic mb-6 line-clamp-2">{item.description}</p>
              
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleShare(item)}
                    className="text-white/20 hover:text-brand-gold transition-colors"
                    title="שתף"
                  >
                    <Share2 size={20} />
                  </button>
                  <button className="text-white/20 hover:text-brand-gold transition-colors">
                    <Bookmark size={20} />
                  </button>
                </div>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-gold font-bold text-sm hover:text-white transition-colors"
                >
                  לצפייה בתוכן <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
          <Search size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/40 italic">לא נמצאו תכנים בקטגוריה זו...</p>
        </div>
      )}
    </div>
  );
};

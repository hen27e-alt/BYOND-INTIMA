import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { EditableText } from '../components/EditableText';
import { Carousel } from '../components/Carousel';
import { SITE_IMAGES } from '../constants/assets';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const Home = () => {
  const { language } = useLanguage();
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const q = query(collection(db, 'products'), where('category', '==', 'experience'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pkgList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      if (pkgList.length > 0) {
        // Sort by price to maintain order
        setPackages(pkgList.sort((a, b) => a.price - b.price));
      } else {
        // Fallback to default packages if DB is empty
        setPackages([
          {
            id: 'exp_spark',
            name: 'מארז הניצוץ',
            description: 'הציתו מחדש את הסקרנות וההתרגשות הראשונית. מארז קליל ומפתיע הכולל קלפי משחק, נר אווירה ופינוקים קטנים.',
            image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=800',
            price: 290,
            tier: 'PLAYFUL',
            category: 'experience'
          },
          {
            id: 'exp_velvet',
            name: 'מארז הקטיפה',
            description: 'התמסרו למגע רך ועומק רגשי חסר פשרות. מארז יוקרתי הכולל חלוקי סאטן, שמן עיסוי וערכת אינטימיות.',
            image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800',
            price: 580,
            tier: 'ROMANTIC',
            category: 'experience'
          },
          {
            id: 'exp_ecstasy',
            name: 'מארז האקסטזה',
            description: 'שחררו כל רסן והגיעו לשיאים חדשים. החוויה האולטימטיבית למי שמעז לחקור את קצוות התשוקה עם מוצרים נועזים ומרגשים.',
            image: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&q=80&w=800',
            price: 850,
            tier: 'ADVENTUROUS',
            category: 'experience'
          }
        ]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching packages:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const carouselImages = [
    { 
      url: SITE_IMAGES.hero_romantic,
      title: '',
      subtitle: ''
    },
    { 
      url: SITE_IMAGES.the_journey,
      title: '',
      subtitle: ''
    },
    { 
      url: SITE_IMAGES.kitchen_cards,
      title: '',
      subtitle: ''
    }
  ];

  return (
    <div className="min-h-screen bg-brand-black overflow-hidden">
      {/* Hero Section - Simplified */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-brand-black">
        <div className="absolute inset-0 opacity-40">
          <Carousel images={carouselImages} />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="space-y-6"
          >
            <EditableText 
              contentId="home_hero_title" 
              defaultText="BYOND INTIMA" 
              as="h1"
              className="text-4xl md:text-7xl font-serif font-light tracking-[0.2em] text-white leading-tight"
            />
            <EditableText 
              contentId="home_hero_subtitle" 
              defaultText={language === 'he' ? 'המסע שלכם לאינטימיות עמוקה מתחיל כאן' : 'Your journey to deep intimacy begins here'} 
              as="p"
              className="text-xl md:text-2xl font-serif italic text-white/80 tracking-wide"
            />
          </motion.div>
        </div>
      </section>

      {/* Packages Section - The Core Focus */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <span className="text-xs tracking-[0.5em] uppercase text-brand-gold font-bold">{language === 'he' ? 'הקולקציה שלנו' : 'Our Collection'}</span>
            <h2 className="text-4xl md:text-6xl font-serif text-brand-black">{language === 'he' ? 'מארזי החוויה של BYOND' : 'BYOND Experience Kits'}</h2>
            <p className="text-brand-black/60 max-w-2xl mx-auto italic text-lg">
              {language === 'he' 
                ? '3 מארזים שנוצרו בקפידה כדי לקחת אתכם למסע של קרבה, תשוקה וגילוי.' 
                : '3 carefully crafted kits designed to take you on a journey of closeness, passion, and discovery.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-brand-gold mb-4" size={48} />
                <p className="text-brand-black/40 font-serif italic">טוען את המארזים...</p>
              </div>
            ) : (
              packages.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative flex flex-col h-full"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lg mb-6">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-transparent to-transparent opacity-60" />
                    
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold mb-1 block">{pkg.tier}</span>
                      <h3 className="text-2xl font-serif">{pkg.name}</h3>
                    </div>
                  </div>

                  <div className="flex-grow space-y-4 px-2">
                    <p className="text-brand-black/60 text-sm italic leading-relaxed line-clamp-2">{pkg.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-brand-gold/10">
                      <span className="text-xl font-serif text-brand-gold">₪{pkg.price}</span>
                      <Link 
                        to="/experience" 
                        className="text-xs uppercase tracking-widest font-bold text-brand-black hover:text-brand-gold transition-colors flex items-center gap-2"
                      >
                        {language === 'he' ? 'לפרטים ורכישה' : 'Details'}
                        <ArrowLeft size={14} className="rotate-180 md:rotate-0" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Simple Footer Teaser */}
      <section className="py-20 bg-brand-black text-center">
        <div className="max-w-2xl mx-auto px-6 space-y-8">
          <Sparkles className="text-brand-gold mx-auto" size={32} />
          <h2 className="text-3xl font-serif text-white tracking-widest uppercase">
            {language === 'he' ? 'מעבר לכל דמיון' : 'Beyond Imagination'}
          </h2>
          <p className="text-white/40 italic font-light">
            {language === 'he' 
              ? 'אנחנו כאן כדי להפוך את הזוגיות שלכם להרפתקה יומיומית.' 
              : 'We are here to turn your relationship into an everyday adventure.'}
          </p>
        </div>
      </section>
    </div>
  );
};

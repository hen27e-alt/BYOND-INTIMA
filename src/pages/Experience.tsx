import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Star, Shield, Award, Loader2, Gauge, Tag } from 'lucide-react';
import { useAlert } from '../components/AlertModal';
import { EditableText } from '../components/EditableText';
import { EditableImage } from '../components/EditableImage';
import { useLanguage } from '../contexts/LanguageContext';
import { SITE_IMAGES } from '../constants/assets';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const ExperienceCard = ({ tier, title, description, features, focus, img, delay, priceId, id, price }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isHovered, setIsHovered] = useState(false);
  const { showAlert } = useAlert();
  const { language } = useLanguage();

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          packageName: title,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showAlert(language === 'he' ? "שגיאה בחיבור למערכת התשלומים. אנא נסו שוב מאוחר יותר." : "Error connecting to payment system. Please try again later.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showAlert(language === 'he' ? "שגיאה בחיבור למערכת התשלומים." : "Error connecting to payment system.");
    } finally {
      setIsLoading(false);
    }
  };

  const difficultyLabels = {
    easy: language === 'he' ? 'קליל וזורם' : 'Light and Flowing',
    medium: language === 'he' ? 'מעמיק ומאתגר' : 'Deep and Challenging',
    hard: language === 'he' ? 'נועז וחסר מעצורים' : 'Bold and Unrestrained'
  };

  const getDifficultyFeatures = () => {
    if (difficulty === 'easy') return features.map((f: string) => `${f} (${language === 'he' ? 'גרסה קלילה' : 'Light version'})`);
    if (difficulty === 'hard') return features.map((f: string) => `${f} (${language === 'he' ? 'גרסת אקסטרים' : 'Extreme version'})`);
    return features;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="bg-white border border-brand-gold/10 p-8 md:p-12 flex flex-col h-full hover-glow hover-lift relative overflow-hidden"
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-brand-black/90 z-10 flex flex-col items-center justify-center p-8 text-center text-white"
          >
            <Star className="text-brand-gold mb-4" size={32} />
            <EditableText 
              contentId={`exp_card_${id}_hover_title_${language}`}
              defaultText={title}
              as="h4"
              className="text-2xl font-serif mb-4"
            />
            <EditableText 
              contentId={`exp_card_${id}_hover_desc_${language}`}
              defaultText={language === 'he' ? 'חוויה זוגית בלתי נשכחת שתקח אתכם למסע של גילוי מחדש. בחרו את רמת הקושי שמתאימה לכם והתחילו את ההרפתקה.' : 'An unforgettable couple experience that will take you on a journey of rediscovery. Choose the difficulty level that suits you and start the adventure.'}
              as="p"
              multiline
              className="text-sm text-white/80 leading-relaxed"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="aspect-[16/9] overflow-hidden mb-10 -mx-8 md:-mx-12 -mt-8 md:-mt-12">
        <EditableImage 
          contentId={`exp_card_${id}_image`}
          defaultSrc={img} 
          alt={title} 
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
        />
      </div>
      <div className="mb-auto">
        <EditableText 
          contentId={`exp_card_${id}_tier_${language}`}
          defaultText={tier}
          as="span"
          className="text-xs tracking-[0.3em] uppercase text-brand-gold mb-4 block"
        />
        <EditableText 
          contentId={`exp_card_${id}_title_${language}`}
          defaultText={title}
          as="h3"
          className="text-3xl font-serif mb-4"
        />
        <EditableText 
          contentId={`exp_card_${id}_desc_${language}`}
          defaultText={description}
          as="p"
          multiline
          className={`text-brand-black/60 mb-4 leading-relaxed font-light text-sm ${isExpanded ? '' : 'line-clamp-2'} article-content`}
        />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-brand-gold text-xs tracking-widest uppercase hover:underline mb-8 flex items-center gap-2"
        >
          <EditableText 
            contentId={`exp_card_read_more_${language}`}
            defaultText={isExpanded ? (language === 'he' ? 'סגור' : 'Close') : (language === 'he' ? 'קראו עוד' : 'Read more')}
            as="span"
          />
        </motion.button>
        
        <div className="mb-8 p-4 bg-brand-cream/50 border border-brand-gold/20 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Gauge size={16} className="text-brand-gold" />
            <EditableText 
              contentId={`exp_card_difficulty_label_${language}`}
              defaultText={language === 'he' ? 'רמת קושי:' : 'Difficulty Level:'}
              as="span"
              className="text-xs font-bold uppercase tracking-widest"
            />
          </div>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 py-2 text-[10px] uppercase tracking-wider transition-all border ${
                  difficulty === level 
                    ? 'bg-brand-gold text-white border-brand-gold' 
                    : 'bg-white text-brand-black/60 border-brand-gold/20 hover:border-brand-gold/50'
                }`}
              >
                <EditableText 
                  contentId={`exp_card_diff_${level}_${language}`}
                  defaultText={level === 'easy' ? (language === 'he' ? 'קלה' : 'Easy') : level === 'medium' ? (language === 'he' ? 'בינונית' : 'Medium') : (language === 'he' ? 'קשה' : 'Hard')}
                  as="span"
                />
              </button>
            ))}
          </div>
          <p className="text-[10px] text-brand-black/50 mt-2 text-center italic">
            {difficultyLabels[difficulty]}
          </p>
        </div>

        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-3xl font-serif text-brand-gold">₪{price}</span>
        </div>
        <div className="space-y-4 mb-12">
          {getDifficultyFeatures().map((feature: string, i: number) => (
            <div key={i} className="flex items-start gap-3 text-sm text-brand-black/80">
              <Check size={16} className="text-brand-gold mt-0.5 shrink-0" />
              <EditableText 
                contentId={`exp_card_${id}_feature_${i}_${language}`}
                defaultText={feature}
                as="span"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-8 border-t border-brand-gold/10 space-y-4">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-brand-black/40 mb-2">
          <EditableText 
            contentId={`exp_card_focus_label_${language}`}
            defaultText={language === 'he' ? 'פוקוס:' : 'Focus:'}
            as="span"
          />
          <EditableText 
            contentId={`exp_card_${id}_focus_${language}`}
            defaultText={focus}
            as="span"
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCheckout}
          disabled={isLoading}
          className="btn-premium w-full flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : null}
          <EditableText 
            contentId={`exp_card_order_now_${language}`}
            defaultText={isLoading ? (language === 'he' ? 'מעבד...' : 'Processing...') : (language === 'he' ? 'הזמינו עכשיו' : 'Order Now')}
            as="span"
          />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-outline-premium w-full !border-brand-gold !text-brand-gold hover:!bg-brand-gold hover:!text-white"
        >
          <EditableText 
            contentId={`exp_card_add_to_cart_${language}`}
            defaultText={language === 'he' ? 'הוספה לסל' : 'Add to Cart'}
            as="span"
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export const Experience = () => {
  const { language } = useLanguage();
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), where('category', '==', 'experience'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pkgList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      if (pkgList.length > 0) {
        // Sort by price to keep Spark, Velvet, Ecstasy order
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
            category: 'experience',
            focus: 'Curiosity & Play',
            features: ['52 קלפי משימה', 'נר ריחני מעורר', 'ערכת חטיפים זוגית', 'גישה למשחקי AI'],
            avgTime: '1-2 שעות',
            hasIntimateTasks: true,
            hasCookingKit: false,
            hasCinemaAccess: true,
            atmosphereLevel: 'Light',
            hasAiGuide: true
          },
          {
            id: 'exp_velvet',
            name: 'מארז הקטיפה',
            description: 'התמסרו למגע רך ועומק רגשי חסר פשרות. מארז יוקרתי הכולל חלוקי סאטן, שמן עיסוי וערכת אינטימיות.',
            image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800',
            price: 580,
            tier: 'ROMANTIC',
            category: 'experience',
            focus: 'Intimacy & Touch',
            features: ['חלוקי סאטן זוגיים', 'שמן עיסוי אורגני', 'ערכת קלפי אינטימיות', 'נר אווירה יוקרתי'],
            avgTime: '2-4 שעות',
            hasIntimateTasks: true,
            hasCookingKit: true,
            hasCinemaAccess: true,
            atmosphereLevel: 'Deep',
            hasAiGuide: true
          },
          {
            id: 'exp_ecstasy',
            name: 'מארז האקסטזה',
            description: 'שחררו כל רסן והגיעו לשיאים חדשים. החוויה האולטימטיבית למי שמעז לחקור את קצוות התשוקה עם מוצרים נועזים ומרגשים.',
            image: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&q=80&w=800',
            price: 850,
            tier: 'ADVENTUROUS',
            category: 'experience',
            focus: 'Passion & Exploration',
            features: ['ערכת חקירה נועזת', 'אביזרי אווירה מתקדמים', 'משימות אקסטזה בלעדיות', 'ליווי צמוד של הלאב-בוט'],
            avgTime: 'לילה שלם',
            hasIntimateTasks: true,
            hasCookingKit: true,
            hasCinemaAccess: true,
            atmosphereLevel: 'Intense',
            hasAiGuide: true
          }
        ]);
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-32 pb-32 bg-brand-cream min-h-screen" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <EditableText 
            contentId={`experience_title_${language}`} 
            defaultText={language === 'he' ? 'קולקציית EXPERIENCE' : 'EXPERIENCE Collection'} 
            as="h1"
            className="text-5xl md:text-6xl font-serif mb-8"
          />
          <EditableText 
            contentId={`experience_subtitle_${language}`} 
            defaultText={language === 'he' ? 'שלוש רמות של חוויית ערב זוגית מובנית: בישול, קולנוע, משימות וחיבור עמוק.' : 'Three levels of structured couple evening experiences: cooking, cinema, tasks, and deep connection.'} 
            as="p"
            multiline
            className="text-lg text-brand-black/50 max-w-2xl mx-auto italic"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-32">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-brand-gold mb-4" size={48} />
              <p className="text-brand-black/40 font-serif italic">טוען את הקולקציה...</p>
            </div>
          ) : (
            packages.map((pkg, index) => (
              <ExperienceCard 
                key={pkg.id}
                id={pkg.id}
                tier={pkg.tier}
                title={pkg.name}
                img={pkg.image}
                description={pkg.description}
                focus={pkg.focus}
                delay={index * 0.2}
                priceId={pkg.id}
                price={pkg.price}
                features={pkg.features}
              />
            ))
          )}
        </div>

        {/* Comparison Table */}
        <div className="mt-32 bg-white border border-brand-gold/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-8 md:p-12 border-b border-brand-gold/10 bg-brand-cream/30">
            <h2 className="text-3xl font-serif text-center mb-4">השוואת מארזים</h2>
            <p className="text-center text-brand-black/50 italic">מצאו את החיבור המדויק עבורכם</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-brand-black text-white">
                  <th className="p-6 font-serif border-l border-white/10">תכונה</th>
                  {packages.map(pkg => (
                    <th key={pkg.id} className="p-6 font-serif text-center border-l border-white/10">
                      {pkg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'רמת אינטנסיביות', key: 'difficulty' },
                  { label: 'זמן חוויה ממוצע', key: 'avgTime' },
                  { label: 'משימות אינטימיות', key: 'hasIntimateTasks' },
                  { label: 'ערכת בישול זוגית', key: 'hasCookingKit' },
                  { label: 'גישה לספריית קולנוע', key: 'hasCinemaAccess' },
                  { label: 'אביזרי אווירה', key: 'atmosphereLevel' },
                  { label: 'ליווי AI אישי', key: 'hasAiGuide' },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-brand-cream/20'}>
                    <td className="p-6 font-medium border-l border-brand-gold/10">{row.label}</td>
                    {packages.map((pkg, j) => {
                      const val = pkg[row.key];
                      return (
                        <td key={j} className="p-6 text-center border-l border-brand-gold/10">
                          {typeof val === 'boolean' ? (
                            val ? <Check className="mx-auto text-brand-gold" size={20} /> : <span className="text-brand-black/20">-</span>
                          ) : (
                            <span className="text-sm">{val || '-'}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-32 pt-32 border-t border-brand-gold/10">
          <div className="text-center mb-16">
            <EditableText 
              contentId={`experience_benefits_title_${language}`} 
              defaultText={language === 'he' ? 'למה לבחור ב-BYOND INTIMA?' : 'Why choose BYOND INTIMA?'} 
              as="h2"
              className="text-4xl font-serif mb-4"
            />
            <EditableText 
              contentId={`experience_benefits_subtitle_${language}`} 
              defaultText={language === 'he' ? 'הערך המוסף של החוויה שלנו' : 'The added value of our experience'} 
              as="p"
              className="text-brand-black/40 uppercase tracking-[0.2em] text-xs"
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold">
                <Shield size={32} />
              </div>
              <EditableText 
                contentId={`experience_benefit_1_title_${language}`} 
                defaultText={language === 'he' ? 'חיזוק הקשר הזוגי' : 'Strengthening the Couple Connection'} 
                as="h4"
                className="text-xl font-serif"
              />
              <EditableText 
                contentId={`experience_benefit_1_desc_${language}`} 
                defaultText={language === 'he' ? 'הכלים שלנו מתוכננים לעורר שיח עמוק, צחוק משותף וחיבור רגשי שמעבר לשגרה היומיומית.' : 'Our tools are designed to evoke deep discourse, shared laughter, and emotional connection beyond the daily routine.'} 
                as="p"
                multiline
                className="text-brand-black/60 text-sm leading-relaxed"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold">
                <Star size={32} />
              </div>
              <EditableText 
                contentId={`experience_benefit_2_title_${language}`} 
                defaultText={language === 'he' ? 'גילוי מחדש של אינטימיות' : 'Rediscovering Intimacy'} 
                as="h4"
                className="text-xl font-serif"
              />
              <EditableText 
                contentId={`experience_benefit_2_desc_${language}`} 
                defaultText={language === 'he' ? 'אנחנו יוצרים מרחב בטוח ומשחקי לחקור תשוקות, מגע וקרבה פיזית בצורה מכבדת ומעוררת.' : 'We create a safe and playful space to explore passions, touch, and physical closeness in a respectful and stimulating way.'} 
                as="p"
                multiline
                className="text-brand-black/60 text-sm leading-relaxed"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold">
                <Award size={32} />
              </div>
              <EditableText 
                contentId={`experience_benefit_3_title_${language}`} 
                defaultText={language === 'he' ? 'יצירת זיכרונות בלתי נשכחים' : 'Creating Unforgettable Memories'} 
                as="h4"
                className="text-xl font-serif"
              />
              <EditableText 
                contentId={`experience_benefit_3_desc_${language}`} 
                defaultText={language === 'he' ? 'כל מארז הוא סיפור חדש שאתם כותבים יחד, עם חוויות שישארו איתכם הרבה אחרי שהערב יסתיים.' : 'Each package is a new story you write together, with experiences that will stay with you long after the evening ends.'} 
                as="p"
                multiline
                className="text-brand-black/60 text-sm leading-relaxed"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

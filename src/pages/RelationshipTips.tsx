import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Zap, Users, ShieldCheck, ArrowLeft, BookOpen, Quote, Calendar, MessageCircle, ExternalLink, Info, X, Share2, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditableText } from '../components/EditableText';

interface Tip {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  content: React.ReactNode;
  image: string;
  icon: React.ElementType;
  color: string;
}

const tips: Tip[] = [
  {
    id: 'foundations',
    title: 'למה מערכות יחסים חשובות',
    category: 'יסודות',
    shortDesc: 'הבנת הצורך העמוק בחיבור אנושי ואיך הוא מעצב אותנו.',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd785320155?auto=format&fit=crop&q=80&w=800',
    icon: Heart,
    color: 'bg-rose-500',
    content: (
      <div className="space-y-6 text-brand-black/70 leading-relaxed">
        <p>אהבה היא אחד הרגשות העמוקים ביותר המוכרים לבני אדם. ישנם סוגים רבים של אהבה, אך אנשים רבים מחפשים את ביטויה במערכת יחסים רומנטית עם בן או בת זוג מתאימים.</p>
        <p>עבור אנשים אלו, מערכות יחסים רומנטית מהוות את אחד ההיבטים המשמעותיים ביותר בחיים והן מקור לסיפוק עמוק.</p>
        <div className="bg-brand-cream p-6 rounded-2xl italic border-r-4 border-brand-gold">
          "בעוד שהצורך בחיבור אנושי נראה מולד, היכולת ליצור מערכות יחסים בריאות ואוהבות היא נלמדת."
        </div>
        <p>עדויות מסוימות מצביעות על כך שהיכולת ליצור מערכת יחסים יציבה מתחילה להתגבש בינקות, בחוויות המוקדמות ביותר של הילד עם מטפל שנותן מענה אמין לצרכי התינוק.</p>
      </div>
    )
  },
  {
    id: 'building',
    title: 'איך לבנות קשר בריא',
    category: 'בנייה',
    shortDesc: 'עקרונות המפתח ליצירת בסיס חזק ואמין לאורך זמן.',
    image: 'https://images.unsplash.com/photo-1518599904199-0ca897819ddb?auto=format&fit=crop&q=80&w=800',
    icon: ShieldCheck,
    color: 'bg-blue-500',
    content: (
      <div className="space-y-6 text-brand-black/70 leading-relaxed">
        <p>שמירה על מערכת יחסים חזקה דורשת טיפול ותקשורת מתמידים. תכונות מסוימות הוכחו כחשובות במיוחד לטיפוח מערכות יחסים בריאות.</p>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-brand-gold rounded-full mt-2 shrink-0" />
            <span><strong>תקשורת פתוחה:</strong> אל תתנו לבן הזוג לנחש מה אתם צריכים.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-brand-gold rounded-full mt-2 shrink-0" />
            <span><strong>הקשבה אקטיבית:</strong> להבין את הרגש שמאחורי המילים.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-brand-gold rounded-full mt-2 shrink-0" />
            <span><strong>שפה לא מילולית:</strong> שימת לב לקשר עין, טון דיבור ושפת גוף.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-brand-gold rounded-full mt-2 shrink-0" />
            <span><strong>זמן איכות:</strong> הקדשת זמן פנים אל פנים ללא מסכים.</span>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'michelangelo',
    title: 'אפקט מיכלאנג\'לו',
    category: 'צמיחה',
    shortDesc: 'איך בן הזוג שלכם עוזר לכם להפוך לגרסה הטובה ביותר של עצמכם.',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800',
    icon: Sparkles,
    color: 'bg-amber-500',
    content: (
      <div className="space-y-6 text-brand-black/70 leading-relaxed">
        <p>בדיוק כפי שהפסל הגדול יכול היה להסתכל על גוש אבן ולראות צורה אנושית אידיאלית חבויה, המסרים החיוביים ואותות התמיכה של בן הזוג שלנו יכולים לעזור לנו לפרוח.</p>
        <p>במערכות היחסים המצליחות ביותר, בני הזוג לא רק נותנים זה לזה את הספק לטובה; הם נוקטים בצעדים תומכים פעילים המטפחים תחושה עוצמתית של להיות באותו צוות.</p>
        <p>בן זוג טוב עוזר לנו להתקרב ל"עצמי האידיאלי" שלנו דרך עידוד, תמיכה והכרה ביכולות שלנו.</p>
      </div>
    )
  },
  {
    id: 'challenges',
    title: 'התמודדות עם אתגרים',
    category: 'חוסן',
    shortDesc: 'איך לצלוח משברים ולצאת מהם מחוזקים יותר.',
    image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=800',
    icon: Zap,
    color: 'bg-purple-500',
    content: (
      <div className="space-y-6 text-brand-black/70 leading-relaxed">
        <p>הגורם החשוב ביותר הקובע אם זוג יכול לשרוד אתגרים הוא פשוט האם הם מאמינים שהם יכולים. בני זוג שבטוחים שהם יישארו יחד נוטים להצליח יותר.</p>
        <h4 className="text-xl font-serif italic text-brand-black">נקודות משבר נפוצות:</h4>
        <ul className="grid grid-cols-2 gap-4">
          <li className="bg-white p-4 rounded-xl border border-brand-gold/10 text-sm">השנה הראשונה יחד</li>
          <li className="bg-white p-4 rounded-xl border border-brand-gold/10 text-sm">הגעת ילדים</li>
          <li className="bg-white p-4 rounded-xl border border-brand-gold/10 text-sm">ירידה בבריאות</li>
          <li className="bg-white p-4 rounded-xl border border-brand-gold/10 text-sm">פערים כלכליים</li>
        </ul>
        <p>זיהוי מוקדם של "מערבולת היחסים" (קנאה, חסימת מטרות, הימנעות) ושיח פתוח הם המפתח לפתרון.</p>
      </div>
    )
  },
  {
    id: 'rituals',
    title: 'חשיבות הריטואל',
    category: 'תחזוקה',
    shortDesc: 'למה פגישות שבועיות הן הסוד לקשר יציב ומאושר.',
    image: 'https://images.unsplash.com/photo-1522673607200-1648832cee98?auto=format&fit=crop&q=80&w=800',
    icon: Calendar,
    color: 'bg-emerald-500',
    content: (
      <div className="space-y-6 text-brand-black/70 leading-relaxed">
        <p>פגישות יומן שבועיות עוזרות להפחית מתח, למנוע טינה שקטה וליצור חזון משותף. זהו זמן המוקדש ל"אנחנו" מעבר ללוגיסטיקה.</p>
        <p>במהלך הריטואל, כדאי לשאול:</p>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 italic">"מה עבד לנו טוב השבוע?"</li>
          <li className="flex items-center gap-3 italic">"איפה הרגשת פחות מחובר/ת?"</li>
          <li className="flex items-center gap-3 italic">"איך אני יכול/ה לתמוך בך יותר בשבוע הבא?"</li>
        </ul>
      </div>
    )
  },
  {
    id: 'listening',
    title: 'הקשבה אקטיבית',
    category: 'תקשורת',
    shortDesc: 'איך לשמוע לא רק את המילים, אלא גם את הלב.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800',
    icon: MessageCircle,
    color: 'bg-indigo-500',
    content: (
      <div className="space-y-6 text-brand-black/70 leading-relaxed">
        <p>הקשבה אקטיבית היא היכולת להבין את הרגש שמאחורי המילים. זה דורש נוכחות מלאה וביטול הסחות דעת.</p>
        <div className="bg-indigo-50 p-6 rounded-2xl space-y-4">
          <h5 className="font-bold text-indigo-900">טיפים להקשבה אקטיבית:</h5>
          <ul className="space-y-2 text-sm text-indigo-800">
            <li>• שמרו על קשר עין</li>
            <li>• אל תקטעו את דברי בן הזוג</li>
            <li>• שקפו את מה ששמעתם</li>
            <li>• שאלו שאלות הבהרה במקום להציע פתרונות מיד</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'love-languages',
    title: 'שפת האהבה',
    category: 'תקשורת',
    shortDesc: 'גלו איך בן הזוג שלכם באמת מרגיש אהוב.',
    image: 'https://images.unsplash.com/photo-1516589174184-c685266e487c?auto=format&fit=crop&q=80&w=800',
    icon: MessageCircle,
    color: 'bg-blue-500',
    content: (
      <div className="space-y-4">
        <p>הבנת שפת האהבה של בן הזוג היא המפתח לחיבור עמוק. ישנן 5 שפות עיקריות:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>מילים בונות (Affirmations)</li>
          <li>זמן איכות (Quality Time)</li>
          <li>מתנות (Gifts)</li>
          <li>מעשי שירות (Acts of Service)</li>
          <li>מגע פיזי (Physical Touch)</li>
        </ul>
        <p>נסו לזהות מהי השפה הדומיננטית שלכם ושל בני הזוג שלכם.</p>
      </div>
    )
  },
  {
    id: 'emotional-intimacy',
    title: 'אינטימיות רגשית',
    category: 'חיבור',
    shortDesc: 'איך ליצור מרחב בטוח לפגיעות ושיתוף.',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800',
    icon: Sparkles,
    color: 'bg-purple-500',
    content: (
      <div className="space-y-4">
        <p>אינטימיות רגשית היא היכולת להיות חשוף ופגיע מול בן הזוג. זה דורש אמון וביטחון.</p>
        <p>כדי לחזק אותה, הקדישו זמן לשיחות עומק ללא הסחות דעת. שאלו שאלות פתוחות והקשיבו ללא שיפוטיות.</p>
      </div>
    )
  }
];

const RelationshipTips = () => {
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);

  const handleShare = async (tip: Tip) => {
    const shareData = {
      title: `BYOND INTIMA - ${tip.title}`,
      text: tip.shortDesc,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      const mailtoLink = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`;
      window.location.href = mailtoLink;
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link 
              to="/knowledge-hub" 
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brand-gold mb-8 hover:text-brand-black transition-colors"
            >
              <ArrowLeft size={14} />
              חזרה לספריית הידע
            </Link>
          </motion.div>
          <EditableText 
            contentId="relationship_tips_title"
            defaultText="טיפים לזוגיות בריאה"
            as="h1"
            className="text-5xl md:text-6xl font-serif text-brand-black mb-6 leading-tight"
          />
          <p className="text-brand-black/60 text-lg max-w-2xl mx-auto leading-relaxed">
            תובנות קצרות ומעשיות לשיפור הקשר, מוצגות בצורה קלילה ואינטראקטיבית.
          </p>
        </motion.div>

        {/* Instagram-style Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                y: -8,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              className="tip-card group relative aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Image Background */}
              <img 
                src={tip.image} 
                alt={tip.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              
              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 ${tip.color} rounded-lg`}>
                    <tip.icon size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                    {tip.category}
                  </span>
                </div>
                <motion.h3 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="tip-card-title text-2xl font-serif mb-2 leading-tight group-hover:text-brand-gold transition-colors"
                >
                  {tip.title}
                </motion.h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="tip-card-content"
                >
                  <p className="text-xs text-white/60 line-clamp-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    {tip.shortDesc}
                  </p>
                </motion.div>
                
                {/* Buttons */}
                <div className="mt-4 flex flex-col gap-2 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedTip(tip); }}
                    className="w-full py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-brand-black transition-all flex items-center justify-center gap-2"
                  >
                    קרא עוד <BookOpen size={12} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleShare(tip); }}
                    className="w-full py-2 bg-brand-gold/20 backdrop-blur-md border border-brand-gold/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-gold hover:text-brand-black transition-all flex items-center justify-center gap-2"
                  >
                    שתף <Share2 size={12} />
                  </button>
                </div>
              </div>

              {/* Icon Indicator (Hidden on hover since we have buttons) */}
              <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-0 transition-opacity">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <BookOpen size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal Overlay */}
        <AnimatePresence>
          {selectedTip && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTip(null)}
                className="absolute inset-0 bg-brand-black/90 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
              >
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedTip(null)}
                  className="absolute top-6 left-6 z-20 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-brand-black hover:bg-brand-gold hover:text-white transition-all"
                >
                  <X size={20} />
                </button>

                {/* Left Side: Image (Instagram Post Style) */}
                <div className="w-full md:w-1/2 relative aspect-square md:aspect-auto">
                  <img 
                    src={selectedTip.image} 
                    alt={selectedTip.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                  <div className="absolute bottom-8 right-8 text-white md:hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 ${selectedTip.color} rounded-lg`}>
                        <selectedTip.icon size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                        {selectedTip.category}
                      </span>
                    </div>
                    <h3 className="text-3xl font-serif">{selectedTip.title}</h3>
                  </div>
                </div>

                {/* Right Side: Content (Comments/Details Style) */}
                <div className="w-full md:w-1/2 flex flex-col bg-white overflow-y-auto custom-scrollbar">
                  {/* Post Header */}
                  <div className="p-6 border-b border-brand-cream flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${selectedTip.color} rounded-full flex items-center justify-center text-white shadow-md`}>
                        <selectedTip.icon size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-brand-black">byond_intima</h4>
                        <span className="text-[10px] text-brand-black/40">{selectedTip.category} • מקורי</span>
                      </div>
                    </div>
                    <button className="text-brand-gold font-bold text-xs">עקוב</button>
                  </div>

                  {/* Post Content */}
                  <div className="p-8 flex-grow">
                    <div className="mb-6">
                      <span className="font-bold text-sm text-brand-black ml-2">byond_intima</span>
                      <span className="text-sm text-brand-black/80">{selectedTip.shortDesc}</span>
                    </div>
                    <div className="prose prose-brand max-w-none text-sm">
                      {selectedTip.content}
                    </div>
                  </div>

                  {/* Post Footer (Interactions) */}
                  <div className="p-6 border-t border-brand-cream bg-white sticky bottom-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <button className="text-brand-black hover:text-brand-gold transition-colors">
                          <Heart size={24} />
                        </button>
                        <button className="text-brand-black hover:text-brand-gold transition-colors">
                          <MessageCircle size={24} />
                        </button>
                        <button 
                          onClick={() => handleShare(selectedTip)}
                          className="text-brand-black hover:text-brand-gold transition-colors"
                        >
                          <Share2 size={24} />
                        </button>
                      </div>
                      <button className="text-brand-black hover:text-brand-gold transition-colors">
                        <Bookmark size={24} />
                      </button>
                    </div>
                    <div className="font-bold text-sm text-brand-black mb-1">
                      אהוב על ידי 1,234 אחרים
                    </div>
                    <div className="text-[10px] text-brand-black/40 uppercase tracking-widest">
                      לפני יומיים
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 p-12 bg-brand-black text-white rounded-[4rem] text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-brand-gold/5 pointer-events-none" />
          <div className="relative z-10">
            <Info className="text-brand-gold mx-auto mb-6" size={32} />
            <h3 className="text-3xl font-serif mb-6 italic">רוצים להעמיק עוד?</h3>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              ספריית הידע שלנו מכילה עשרות מאמרים, מדריכים וכלים שיעזרו לכם לבנות את הזוגיות שתמיד חלמתם עליה.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/emotional-intelligence"
                  className="px-8 py-4 bg-brand-gold text-brand-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-white transition-all inline-block"
                >
                  אינטליגנציה רגשית
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/intimacy-guide"
                  className="px-8 py-4 border border-white/20 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-brand-black transition-all inline-block"
                >
                  מדריך האינטימיות
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RelationshipTips;

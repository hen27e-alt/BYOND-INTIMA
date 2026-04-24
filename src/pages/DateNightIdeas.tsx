import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, Zap, Users, ShieldCheck, ArrowLeft, Calendar, MessageCircle, ExternalLink, Info, Home, Map, Utensils, Camera, Music, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditableText } from '../components/EditableText';

const DateNightIdeas = () => {
  const categories = [
    {
      title: 'דייט ביתי וחמים',
      icon: Home,
      color: 'bg-orange-50 text-orange-600',
      ideas: [
        { title: 'ערב בישול משותף', desc: 'בחרו מתכון מאתגר שמעולם לא ניסיתם והכינו אותו יחד מאפס.' },
        { title: 'מרתון סרטים נוסטלגי', desc: 'צפו בסרטים שאהבתם כשהייתם ילדים או בסרטים מהדייטים הראשונים שלכם.' },
        { title: 'פיקניק על השטיח', desc: 'פרסו שמיכה בסלון, הדליקו נרות והגישו ארוחת ערב בסגנון פיקניק.' },
        { title: 'ערב ספא ביתי', desc: 'מסאז׳ים, מסיכות פנים ואמבטיה חמה עם שמנים אתריים.' },
        { title: 'פרויקט DIY משותף', desc: 'בנו משהו לבית, צבעו רהיט ישן או צרו אלבום תמונות פיזי.' }
      ]
    },
    {
      title: 'הרפתקאות בחוץ',
      icon: Map,
      color: 'bg-emerald-50 text-emerald-600',
      ideas: [
        { title: 'צפייה בכוכבים', desc: 'סעו למקום חשוך עם שמיכה ותרמוס תה, והורידו אפליקציה לזיהוי קבוצות כוכבים.' },
        { title: 'טיול זריחה/שקיעה', desc: 'מצאו נקודת תצפית יפה ופשוט תהיו שם יחד ברגע המעבר.' },
        { title: 'ביקור בגן בוטני', desc: 'הליכה רגועה בין פרחים וצמחייה היא רקע מושלם לשיחות עומק.' },
        { title: 'קולנוע באוויר הפתוח', desc: 'חפשו הקרנות תחת כיפת השמיים או צרו אחת כזו עם מקרן בחצר.' },
        { title: 'סיור "תיירים בעיר שלכם"', desc: 'לכו למקומות התיירותיים שאתם תמיד מתעלמים מהם.' }
      ]
    },
    {
      title: 'דייטים אקטיביים',
      icon: Zap,
      color: 'bg-blue-50 text-blue-600',
      ideas: [
        { title: 'שיעור ריקוד', desc: 'סלסה, טנגו או אפילו היפ-הופ - ללמוד תנועה חדשה יחד זה מחבר ומצחיק.' },
        { title: 'באולינג או מיני-גולף', desc: 'קצת תחרותיות בריאה תמיד מוסיפה פלפל לקשר.' },
        { title: 'קיר טיפוס', desc: 'ספורט שדורש אמון ותמיכה הדדית.' },
        { title: 'טיול אופניים', desc: 'שכרו אופניים וצאו למסלול עירוני או בטבע.' },
        { title: 'סדנת יצירה', desc: 'קרמיקה, ציור או נגרות - ליצור משהו פיזי יחד.' }
      ]
    },
    {
      title: 'דייטים בתקציב נמוך',
      icon: Star,
      color: 'bg-purple-50 text-purple-600',
      ideas: [
        { title: 'ביקור בספרייה או חנות ספרים', desc: 'בחרו ספר אחד לשני וקראו קטעים נבחרים.' },
        { title: 'התנדבות משותפת', desc: 'לתת לאחרים יחד זה אחד הדברים הכי מחברים שיש.' },
        { title: 'סשן צילומים בחוץ', desc: 'צאו עם המצלמה (או הטלפון) וצלמו אחד את השני במקומות יפים.' },
        { title: 'טעימות גלידה', desc: 'לכו לגלידרייה ונסו את הטעמים הכי מוזרים שיש להם.' },
        { title: 'משחקי קופסה', desc: 'ערב של משחקי קופסה קלאסיים עם חטיפים אהובים.' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
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
            contentId="date_night_ideas_title"
            defaultText="רעיונות לערב דייט"
            as="h1"
            className="text-6xl md:text-7xl font-serif text-brand-black mb-8 leading-tight"
          />
          <p className="text-brand-black/60 text-xl max-w-2xl mx-auto leading-relaxed">
            לפעמים כל מה שצריך זה קצת השראה כדי לשבור את השגרה ולהחזיר את הניצוץ. אספנו עבורכם רעיונות מכל הסוגים - מהבית ועד להרפתקאות בחוץ.
          </p>
        </motion.div>

        {/* Ideas Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[3rem] border border-brand-gold/10 shadow-sm"
            >
              <div className="flex items-center gap-6 mb-10">
                <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center`}>
                  <cat.icon size={28} />
                </div>
                <h3 className="text-3xl font-serif">{cat.title}</h3>
              </div>
              
              <div className="space-y-8">
                {cat.ideas.map((idea, idx) => (
                  <div key={idx} className="group">
                    <h4 className="text-lg font-bold text-brand-black mb-2 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                      {idea.title}
                    </h4>
                    <p className="text-brand-black/50 text-sm leading-relaxed pr-4 border-r-2 border-transparent group-hover:border-brand-gold transition-all">
                      {idea.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Double Date Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-brand-black text-white p-12 md:p-20 rounded-[4rem] mb-24 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
            <Users size={300} className="text-brand-gold" />
          </div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif mb-8 italic">
                מה עם <span className="text-brand-gold">דאבל דייט</span>?
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-10">
                לפעמים כיף לצרף עוד זוג חברים. זה משנה את הדינמיקה, מאפשר שיחות אחרות ויוצר זיכרונות משותפים עם אנשים שאתם אוהבים.
              </p>
              <ul className="space-y-4">
                {[
                  'חדר בריחה מאתגר',
                  'ערב טריוויה בפאב השכונתי',
                  'ארוחת "פוטלאק" (כל אחד מביא מנה)',
                  'ערב משחקי קופסה קבוצתי'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-brand-gold font-bold">
                    <Sparkles size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 p-10 rounded-3xl border border-white/10 backdrop-blur-sm">
              <h4 className="text-xl font-serif mb-6 italic text-brand-gold">טיפ לדאבל דייט מוצלח:</h4>
              <p className="text-white/70 leading-relaxed italic">
                "בחרו זוג שאתם מרגישים איתו בנוח להיות עצמכם. המטרה היא לא להרשים, אלא פשוט ליהנות מהחברה ומהזמן המשותף."
              </p>
            </div>
          </div>
        </motion.div>

        {/* Attribution Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="p-12 bg-white border border-brand-gold/10 rounded-[3rem] text-center"
        >
          <Info className="text-brand-gold mx-auto mb-6" size={32} />
          <h3 className="text-xl font-serif mb-4">מקורות ורעיונות</h3>
          <p className="text-brand-black/50 text-sm max-w-2xl mx-auto leading-relaxed mb-10">
            הרעיונות במדריך זה לוקטו ונערכו מתוך מקורות מובילים בתחום הלייף-סטייל והזוגיות. אנו מודים ליוצרים על ההשראה הבלתי פוסקת.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { name: 'The Everygirl', url: 'https://theeverygirl.com/date-ideas/' },
              { name: 'Sarah Hoyle', url: 'https://www.sarahhoylephotography.co.uk/blog/date-night-ideas/' },
              { name: 'Boundless', url: 'https://www.boundless.org/relationships/11-double-date-ideas-for-couples/' },
              { name: 'Chelsey Explores', url: 'https://www.chelseyexplores.com/cheap-date-night-ideas-at-home/' },
              { name: 'The Cut', url: 'https://www.thecut.com/article/at-home-date-night-ideas.html' }
            ].map(source => (
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={source.name}
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-black transition-colors uppercase tracking-widest text-[10px] font-black"
              >
                {source.name} <ExternalLink size={14} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DateNightIdeas;

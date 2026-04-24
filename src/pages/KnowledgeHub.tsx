import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Heart, Zap, ShieldCheck, MessageCircle, Flame, Users, ArrowLeft, ExternalLink, Info, Sparkles, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { EditableText } from '../components/EditableText';

const categories = [
  {
    id: 'emotional',
    title: 'אינטליגנציה רגשית',
    desc: 'הבנת רגשות, אמפתיה, כבוד הדדי ואיך לבנות חיבור רגשי עמוק ובלתי שביר.',
    icon: Heart,
    color: 'bg-rose-50 text-rose-600',
    link: '/emotional-intelligence'
  },
  {
    id: 'marriage',
    title: 'חיי נישואין',
    desc: 'תובנות לטווח ארוך: איך לצמוח יחד, להתמודד עם שינויים ולשמור על החברות בתוך הנישואין.',
    icon: Users,
    color: 'bg-amber-50 text-amber-600',
    link: '/marriage-guide'
  },
  {
    id: 'intimacy',
    title: 'אינטימיות ומיניות',
    desc: 'הבנת החשק, הכימיה של העונג ואיך לשמור על חיבור מיני עמוק לאורך השנים.',
    icon: Flame,
    color: 'bg-red-50 text-red-600',
    link: '/intimacy-guide'
  },
  {
    id: 'wedding',
    title: 'תכנון חתונה וזוגיות',
    desc: 'המעבר מ"זוג" ל"נשואים": איך לצלוח את תקופת התכנון ולבנות חזון משותף לעתיד.',
    icon: Sparkles,
    color: 'bg-indigo-50 text-indigo-600',
    link: '/wedding-planning'
  },
  {
    id: 'date-ideas',
    title: 'רעיונות לערב דייט',
    desc: 'השראה לשבירת השגרה: דייטים ביתיים, הרפתקאות בחוץ ורעיונות יצירתיים לכל תקציב.',
    icon: Calendar,
    color: 'bg-orange-50 text-orange-600',
    link: '/date-night-ideas'
  },
  {
    id: 'therapy',
    title: 'הכוח שבטיפול זוגי',
    desc: 'למה טיפול הוא השקעה ולא כישלון: יתרונות מוכחים, מיתוסים ואיך זה מחזק גם זוגות מאושרים.',
    icon: ShieldCheck,
    color: 'bg-emerald-50 text-emerald-600',
    link: '/couples-therapy'
  }
];

const KnowledgeHub = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const categories = [
    {
      id: 'emotional',
      title: t('hub.cat.emotional.title'),
      desc: t('hub.cat.emotional.desc'),
      icon: Heart,
      color: 'bg-rose-50 text-rose-600',
      link: '/emotional-intelligence'
    },
    {
      id: 'marriage',
      title: t('hub.cat.marriage.title'),
      desc: t('hub.cat.marriage.desc'),
      icon: Users,
      color: 'bg-amber-50 text-amber-600',
      link: '/marriage-guide'
    },
    {
      id: 'intimacy',
      title: t('hub.cat.intimacy.title'),
      desc: t('hub.cat.intimacy.desc'),
      icon: Flame,
      color: 'bg-red-50 text-red-600',
      link: '/intimacy-guide'
    },
    {
      id: 'wedding',
      title: t('hub.cat.wedding.title'),
      desc: t('hub.cat.wedding.desc'),
      icon: Sparkles,
      color: 'bg-indigo-50 text-indigo-600',
      link: '/wedding-planning'
    },
    {
      id: 'date-ideas',
      title: t('hub.cat.date.title'),
      desc: t('hub.cat.date.desc'),
      icon: Calendar,
      color: 'bg-orange-50 text-orange-600',
      link: '/date-night-ideas'
    },
    {
      id: 'therapy',
      title: t('hub.cat.therapy.title'),
      desc: t('hub.cat.therapy.desc'),
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600',
      link: '/couples-therapy'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brand-gold mb-8 hover:text-brand-black transition-colors"
            >
              <ArrowLeft size={14} className={language === 'he' || language === 'ar' ? '' : 'rotate-180'} />
              {t('hub.back')}
            </Link>
          </motion.div>
          <EditableText 
            contentId={`hub_title_${language}`}
            defaultText={language === 'he' ? 'ספריית הידע הזוגית' : t('hub.title')}
            as="h1"
            className="text-6xl md:text-7xl font-serif text-brand-black mb-8 leading-tight"
          />
          <EditableText 
            contentId={`hub_subtitle_${language}`}
            defaultText={t('hub.subtitle')}
            as="p"
            className="text-brand-black/60 text-xl max-w-2xl mx-auto leading-relaxed"
          />
        </motion.div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(cat.link)}
              className="bg-white p-10 rounded-[3rem] border border-brand-gold/10 hover:border-brand-gold transition-all group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-brand-gold/5"
            >
              <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <cat.icon size={32} />
              </div>
              <EditableText 
                contentId={`hub_cat_title_${cat.id}_${language}`}
                defaultText={cat.title}
                as="h3"
                className="text-3xl font-serif mb-4 group-hover:text-brand-gold transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
              <EditableText 
                contentId={`hub_cat_desc_${cat.id}_${language}`}
                defaultText={cat.desc}
                as="p"
                multiline
                className="text-brand-black/50 leading-relaxed mb-8"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-gold">
                {t('hub.read_more')} <ExternalLink size={14} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Attribution & Copyright Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-brand-black text-white p-12 rounded-[4rem] text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-brand-gold/5 pointer-events-none" />
          <div className="relative z-10 space-y-8">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold">
              <Info size={32} />
            </div>
            <EditableText 
              contentId={`hub_sources_title_${language}`}
              defaultText={t('hub.sources.title')}
              as="h3"
              className="text-3xl font-serif italic"
            />
            <div className="max-w-2xl mx-auto space-y-6 text-white/60 leading-relaxed text-sm">
              <EditableText 
                contentId={`hub_sources_desc1_${language}`}
                defaultText={t('hub.sources.desc1')}
                as="p"
                multiline
              />
              <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-brand-gold">
                <span>Psychology Today</span>
                <span>HelpGuide.org</span>
                <span>The Everygirl</span>
                <span>The Cut</span>
                <span>Verywell Mind</span>
                <span>PMC (NIH)</span>
                <span>The Guardian</span>
                <span>Mark Manson</span>
                <span>The New York Times</span>
              </div>
              <EditableText 
                contentId={`hub_sources_desc2_${language}`}
                defaultText={t('hub.sources.desc2')}
                as="p"
                multiline
              />
              <EditableText 
                contentId={`hub_sources_copyright_${language}`}
                defaultText={t('hub.sources.copyright')}
                as="p"
                className="italic"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KnowledgeHub;

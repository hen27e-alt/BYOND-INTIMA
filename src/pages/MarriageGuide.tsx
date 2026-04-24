import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, Zap, Users, ShieldCheck, ArrowLeft, BookOpen, Quote, Calendar, MessageCircle, ExternalLink, Info, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { EditableText } from '../components/EditableText';

const MarriageGuide = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'he' || language === 'ar';

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
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
              <ArrowLeft size={14} className={isRtl ? '' : 'rotate-180'} />
              {t('art.marriage.back')}
            </Link>
          </motion.div>
          <EditableText 
            contentId={`marriage_title_${language}`}
            defaultText={language === 'he' ? 'חיי נישואין ארוכי טווח' : language === 'ar' ? 'حياة زوجية طويلة الأمد' : 'Long-term Marriage'}
            as="h1"
            className="text-6xl md:text-7xl font-serif text-brand-black mb-8 leading-tight"
          />
          <div className="flex items-center justify-center gap-4 text-brand-black/40 text-xs uppercase tracking-widest">
            <EditableText 
              contentId={`marriage_subtitle_${language}`}
              defaultText={t('art.marriage.subtitle')}
              as="span"
            />
            <div className="w-1 h-1 bg-brand-gold rounded-full" />
            <EditableText 
              contentId={`marriage_reading_time_${language}`}
              defaultText={t('art.marriage.reading_time')}
              as="span"
            />
          </div>
        </motion.div>

        {/* Article Content */}
        <div className="space-y-32">
          {/* Section 1: Realistic Expectations */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className={`absolute ${isRtl ? '-right-12' : '-left-12'} top-0 text-brand-gold/10 pointer-events-none`}>
              <Home size={120} />
            </div>
            <h2 className="text-4xl font-serif mb-10 flex items-center gap-4">
              <span className="text-brand-gold text-sm font-sans font-black">01</span>
              <EditableText 
                contentId={`marriage_sec1_title_${language}`}
                defaultText={t('art.marriage.sec1.title')}
                as="span"
              />
            </h2>
            <div className="prose prose-lg prose-brand max-w-none text-brand-black/70 leading-relaxed space-y-8">
              <EditableText 
                contentId={`marriage_sec1_p1_${language}`}
                defaultText={t('art.marriage.sec1.p1')}
                as="p"
                multiline
              />
              <div className={`bg-white p-10 border-brand-gold my-12 italic text-2xl text-brand-black/80 font-serif shadow-sm ${isRtl ? 'border-r-4 rounded-l-2xl' : 'border-l-4 rounded-r-2xl'}`}>
                <Quote className="text-brand-gold/20 mb-6" size={40} />
                <EditableText 
                  contentId={`marriage_sec1_quote_${language}`}
                  defaultText={t('art.marriage.sec1.quote')}
                  as="span"
                  multiline
                />
              </div>
              <EditableText 
                contentId={`marriage_sec1_p2_${language}`}
                defaultText={t('art.marriage.sec1.p2')}
                as="p"
                multiline
              />
            </div>
          </motion.section>

          {/* Section 2: Space & Growth */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[4rem] p-12 md:p-20 border border-brand-gold/10 shadow-sm"
          >
            <h2 className="text-4xl font-serif mb-10 flex items-center gap-4">
              <span className="text-brand-gold text-sm font-sans font-black">02</span>
              <EditableText 
                contentId={`marriage_sec2_title_${language}`}
                defaultText={t('art.marriage.sec2.title')}
                as="span"
              />
            </h2>
            <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-8 text-brand-black/70 leading-relaxed text-lg">
                <EditableText 
                  contentId={`marriage_sec2_p1_${language}`}
                  defaultText={t('art.marriage.sec2.p1')}
                  as="p"
                  multiline
                />
                <EditableText 
                  contentId={`marriage_sec2_p2_${language}`}
                  defaultText={t('art.marriage.sec2.p2')}
                  as="p"
                  multiline
                />
              </div>
              <div className="bg-brand-cream p-10 rounded-3xl space-y-6">
                <EditableText 
                  contentId={`marriage_sec2_list_title_${language}`}
                  defaultText={t('art.marriage.sec2.list_title')}
                  as="h4"
                  className="text-xs font-black uppercase tracking-widest text-brand-gold mb-6"
                />
                <ul className="space-y-4">
                  {[
                    { id: 'item1', name: t('art.marriage.sec2.item1.name'), desc: t('art.marriage.sec2.item1.desc') },
                    { id: 'item2', name: t('art.marriage.sec2.item2.name'), desc: t('art.marriage.sec2.item2.desc') },
                    { id: 'item3', name: t('art.marriage.sec2.item3.name'), desc: t('art.marriage.sec2.item3.desc') },
                    { id: 'item4', name: t('art.marriage.sec2.item4.name'), desc: t('art.marriage.sec2.item4.desc') }
                  ].map((item, i) => (
                    <li key={i} className="flex flex-col gap-1">
                      <EditableText 
                        contentId={`marriage_sec2_${item.id}_name_${language}`}
                        defaultText={item.name}
                        as="span"
                        className="text-base font-bold text-brand-black/80"
                      />
                      <EditableText 
                        contentId={`marriage_sec2_${item.id}_desc_${language}`}
                        defaultText={item.desc}
                        as="span"
                        className="text-xs text-brand-black/40 italic"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Section 3: Fighting & Forgiveness */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-serif mb-10 flex items-center gap-4">
              <span className="text-brand-gold text-sm font-sans font-black">03</span>
              <EditableText 
                contentId={`marriage_sec3_title_${language}`}
                defaultText={t('art.marriage.sec3.title')}
                as="span"
              />
            </h2>
            <div className="prose prose-lg prose-brand max-w-none text-brand-black/70 leading-relaxed space-y-10">
              <EditableText 
                contentId={`marriage_sec3_p1_${language}`}
                defaultText={t('art.marriage.sec3.p1')}
                as="p"
                multiline
              />
              
              <div className="bg-brand-black text-white p-12 rounded-[3rem] my-12">
                <EditableText 
                  contentId={`marriage_sec3_rule_title_${language}`}
                  defaultText={t('art.marriage.sec3.rule.title')}
                  as="h3"
                  className="text-2xl font-serif mb-6 text-brand-gold italic"
                />
                <EditableText 
                  contentId={`marriage_sec3_rule_desc_${language}`}
                  defaultText={t('art.marriage.sec3.rule.desc')}
                  as="p"
                  multiline
                  className="text-white/70 leading-relaxed italic text-lg"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-8 my-16">
                <div className="bg-white p-10 rounded-[2rem] border border-brand-gold/10">
                  <EditableText 
                    contentId={`marriage_sec3_box1_title_${language}`}
                    defaultText={t('art.marriage.sec3.box1.title')}
                    as="h4"
                    className="text-xl font-serif mb-4 italic"
                  />
                  <EditableText 
                    contentId={`marriage_sec3_box1_desc_${language}`}
                    defaultText={t('art.marriage.sec3.box1.desc')}
                    as="p"
                    multiline
                    className="text-sm leading-relaxed"
                  />
                </div>
                <div className="bg-white p-10 rounded-[2rem] border border-brand-gold/10">
                  <EditableText 
                    contentId={`marriage_sec3_box2_title_${language}`}
                    defaultText={t('art.marriage.sec3.box2.title')}
                    as="h4"
                    className="text-xl font-serif mb-4 italic"
                  />
                  <EditableText 
                    contentId={`marriage_sec3_box2_desc_${language}`}
                    defaultText={t('art.marriage.sec3.box2.desc')}
                    as="p"
                    multiline
                    className="text-sm leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Attribution Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-32 p-12 bg-white border border-brand-gold/10 rounded-[3rem] text-center"
          >
            <Info className="text-brand-gold mx-auto mb-6" size={32} />
            <EditableText 
              contentId={`marriage_sources_title_${language}`}
              defaultText={t('art.marriage.sources.title')}
              as="h3"
              className="text-xl font-serif mb-4"
            />
            <EditableText 
              contentId={`marriage_sources_desc_${language}`}
              defaultText={t('art.marriage.sources.desc')}
              as="p"
              multiline
              className="text-brand-black/50 text-sm max-w-2xl mx-auto leading-relaxed"
            />
            <div className="mt-8 flex justify-center gap-8">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://markmanson.net/relationship-advice" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-black transition-colors uppercase tracking-widest text-[10px] font-black"
              >
                Mark Manson <ExternalLink size={14} />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://www.helpguide.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-black transition-colors uppercase tracking-widest text-[10px] font-black"
              >
                HelpGuide <ExternalLink size={14} />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MarriageGuide;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShieldAlert, Lock, ArrowLeft, Sparkles, Zap, Flame, Info, CheckCircle2, Quote, ExternalLink, MessageSquare, Compass, Eye, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ContentFeedback } from '../components/ContentFeedback';
import { EditableText } from '../components/EditableText';
import { useLanguage } from '../contexts/LanguageContext';

const InteractiveGuide = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { t, language } = useLanguage();
  
  const handleShare = async (title: string, text: string) => {
    const shareData = {
      title: `BYOND INTIMA - ${title}`,
      text: text,
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

  const sections = [
    {
      id: 'desire',
      title: 'הבנת החשק',
      subtitle: 'ספונטני לעומת תגובתי',
      icon: Flame,
      content: 'חשוב להבין שחשק מיני לא תמיד מופיע "משום מקום". בעוד שחשק ספונטני נפוץ בתחילת קשר, חשק תגובתי מתעורר מתוך המגע והקרבה עצמם. אל תחכו שהחשק יגיע – צרו את התנאים שיאפשרו לו להתעורר.',
      tips: ['זהו את "הבלמים" שלכם (סטרס, עייפות)', 'זהו את "המאיצים" שלכם (מוזיקה, שיחה עמוקה)', 'תנו לגיטימציה לחשק תגובתי']
    },
    {
      id: 'communication',
      title: 'טכניקות תקשורת',
      subtitle: 'לדבר על מה שמרגיש טוב',
      icon: MessageSquare,
      content: 'תקשורת אינטימית דורשת פגיעות. השתמשו במשפטי "אני" במקום "את/ה". במקום להגיד "את/ה אף פעם לא...", נסו "אני מרגיש/ה מאוד קרוב/ה אליך כש...".',
      tips: ['שתפו פנטזיה אחת קטנה', 'תנו משוב חיובי בזמן אמת', 'קבעו זמן לשיחה אינטימית ללא הסחות דעת']
    },
    {
      id: 'boundaries',
      title: 'חקירת גבולות',
      subtitle: 'יצירת מרחב בטוח',
      icon: Compass,
      content: 'גבולות הם לא מגבלה, הם המפה שמאפשרת לכם לנוע בחופשיות. יצירת רשימת "כן/לא/אולי" משותפת עוזרת להבין מה מחוץ לתחום ומה מעורר סקרנות.',
      tips: ['כבדו כל "לא" ללא הסברים', 'חגגו את ה"כן" המשותף', 'השאירו מקום לשינוי דעה']
    }
  ];

  return (
    <div className="bg-zinc-900/50 border border-brand-gold/10 rounded-[3rem] overflow-hidden">
      <div className="flex border-b border-white/10">
        {sections.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-6 px-4 flex flex-col items-center gap-2 transition-all ${activeTab === i ? 'bg-brand-gold/10 text-brand-gold' : 'text-white/40 hover:text-white/60'}`}
          >
            <s.icon size={20} />
            <EditableText 
              contentId={`intimacy_interactive_${s.id}_tab_title_${language}`}
              defaultText={s.title}
              as="span"
              className="text-[10px] font-black uppercase tracking-widest"
            />
          </button>
        ))}
      </div>
      
      <div className="p-10 md:p-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-start">
              <div>
                <EditableText 
                  contentId={`intimacy_interactive_${sections[activeTab].id}_subtitle_${language}`}
                  defaultText={sections[activeTab].subtitle}
                  as="h4"
                  className="text-brand-gold text-xs font-black uppercase tracking-widest mb-2"
                />
                <EditableText 
                  contentId={`intimacy_interactive_${sections[activeTab].id}_title_${language}`}
                  defaultText={sections[activeTab].title}
                  as="h3"
                  className="text-3xl font-serif italic"
                />
              </div>
              <button 
                onClick={() => handleShare(sections[activeTab].title, sections[activeTab].content)}
                className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-brand-gold"
                title="שתף פסקה זו"
              >
                <Share2 size={18} />
              </button>
            </div>
            
            <EditableText 
              contentId={`intimacy_interactive_${sections[activeTab].id}_content_${language}`}
              defaultText={sections[activeTab].content}
              as="p"
              multiline
              className="text-white/70 leading-relaxed text-lg"
            />
            
            <div className="grid sm:grid-cols-3 gap-4">
              {sections[activeTab].tips.map((tip, i) => (
                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-brand-gold shrink-0 mt-1" />
                  <EditableText 
                    contentId={`intimacy_interactive_${sections[activeTab].id}_tip_${i}_${language}`}
                    defaultText={tip}
                    as="span"
                    className="text-sm text-white/80"
                  />
                </div>
              ))}
            </div>

            <ContentFeedback 
              pageId="intimacy-guide" 
              sectionId={`interactive-${activeTab}`} 
              title={`Interactive: ${sections[activeTab].title}`} 
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const IntimacyGuide = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const handleShare = async (title: string, text: string) => {
    const shareData = {
      title: `BYOND INTIMA - ${title}`,
      text: text,
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

  useEffect(() => {
    const verified = localStorage.getItem('age-verified');
    if (verified === 'true') {
      setIsVerified(true);
      setShowWarning(false);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem('age-verified', 'true');
    setIsVerified(true);
    setShowWarning(false);
  };

  if (showWarning) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center p-6 text-center" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-900 border border-brand-gold/20 p-12 rounded-[3rem] shadow-2xl"
        >
          <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-gold">
            <ShieldAlert size={40} />
          </div>
          <EditableText 
            contentId={`intimacy_warning_title_${language}`}
            defaultText={language === 'he' ? 'תוכן למבוגרים בלבד' : 'Adults Only Content'}
            as="h1"
            className="text-3xl font-serif text-white mb-6 italic"
          />
          <EditableText 
            contentId={`intimacy_warning_desc_${language}`}
            defaultText={language === 'he' ? 'העמוד הבא מכיל תכנים בנושא אינטימיות ומיניות המיועדים לבני 18 ומעלה. האם את/ה מעל גיל 18?' : 'The following page contains content on intimacy and sexuality intended for those aged 18 and over. Are you over 18?'}
            as="p"
            multiline
            className="text-zinc-400 mb-10 leading-relaxed"
          />
          <div className="space-y-4">
            <button 
              onClick={handleVerify}
              className="w-full py-5 bg-brand-gold text-brand-black font-black uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white transition-all duration-500"
            >
              <EditableText 
                contentId={`intimacy_warning_btn_yes_${language}`}
                defaultText={language === 'he' ? 'אני בן/בת 18 ומעלה - כניסה' : 'I am 18 or older - Enter'}
                as="span"
              />
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-5 bg-transparent text-zinc-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
            >
              <EditableText 
                contentId={`intimacy_warning_btn_no_${language}`}
                defaultText={language === 'he' ? 'חזרה לאזור האישי' : 'Back to Dashboard'}
                as="span"
              />
            </button>
          </div>
          <p className="mt-8 text-[10px] text-zinc-600 uppercase tracking-widest">
            BYOND INTIMA &copy; 2026
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 overflow-hidden" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-gold/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link 
              to="/knowledge-hub" 
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brand-gold mb-8 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} className={language === 'he' || language === 'ar' ? '' : 'rotate-180'} />
              <EditableText 
                contentId={`intimacy_back_btn_${language}`}
                defaultText={language === 'he' ? 'חזרה לספריית הידע' : 'Back to Knowledge Hub'}
                as="span"
              />
            </Link>
          </motion.div>
          <EditableText 
            contentId={`intimacy_title_${language}`}
            defaultText={language === 'he' ? 'מדריך האינטימיות' : 'Intimacy Guide'}
            as="h1"
            className="text-6xl md:text-8xl font-serif text-white mb-8 leading-tight"
          />
          <div className="flex items-center justify-center gap-4 text-white/40 text-xs uppercase tracking-widest">
            <EditableText 
              contentId={`intimacy_partnership_${language}`}
              defaultText={language === 'he' ? 'בשיתוף Psychology Today' : 'In partnership with Psychology Today'}
              as="span"
            />
            <div className="w-1 h-1 bg-brand-gold rounded-full" />
            <EditableText 
              contentId={`intimacy_reading_time_${language}`}
              defaultText={language === 'he' ? '15 דקות קריאה' : '15 min read'}
              as="span"
            />
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-32">
          {/* Section 1: Fundamentals */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -right-20 top-0 text-brand-gold/5 pointer-events-none">
              <Flame size={200} />
            </div>
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-serif flex items-center gap-6">
                <span className="text-brand-gold text-sm font-sans font-black">01</span>
                <EditableText 
                  contentId={`intimacy_sec1_title_${language}`}
                  defaultText={language === 'he' ? 'יסודות המיניות והחשק' : 'Fundamentals of Sexuality and Desire'}
                  as="span"
                />
              </h2>
              <button 
                onClick={() => handleShare('יסודות המיניות והחשק', 'מיניות היא חלק בלתי נפרד מהחוויה האנושית...')}
                className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-brand-gold"
              >
                <Share2 size={18} />
              </button>
            </div>
            <div className="prose prose-invert prose-lg max-w-none text-white/70 leading-relaxed space-y-8">
              <EditableText 
                contentId={`intimacy_sec1_p1_${language}`}
                defaultText={language === 'he' ? 'מיניות היא חלק בלתי נפרד מהחוויה האנושית, אך היא גם אחד ההיבטים המורכבים ביותר שלה. הבנת המנגנונים של חשק, עוררות ועונג היא המפתח לחיים אינטימיים מספקים.' : 'Sexuality is an integral part of the human experience, but it is also one of its most complex aspects. Understanding the mechanisms of desire, arousal, and pleasure is the key to a satisfying intimate life.'}
                as="p"
                multiline
              />
              <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 my-16 italic text-2xl text-white/90 font-serif leading-relaxed">
                <Quote className="text-brand-gold/20 mb-6" size={40} />
                <EditableText 
                  contentId={`intimacy_sec1_quote_${language}`}
                  defaultText={language === 'he' ? '"חשק מיני אינו רק דחף ביולוגי; הוא מושפע עמוקות מהקשר הרגשי, מהסביבה וממצבנו הנפשי."' : '"Sexual desire is not just a biological drive; it is deeply influenced by emotional connection, environment, and mental state."'}
                  as="span"
                  multiline
                />
              </div>
              <EditableText 
                contentId={`intimacy_sec1_p2_${language}`}
                defaultText={language === 'he' ? 'מחקרים מראים כי חשק מיני בקרב נשים וגברים פועל לעיתים קרובות בצורה שונה. בעוד שחשק "ספונטני" נפוץ יותר בתחילת הקשר, חשק "תגובתי" (המתעורר בתגובה למגע או גירוי) הוא נורמלי לחלוטין במערכות יחסים ארוכות טווח.' : 'Studies show that sexual desire in women and men often operates differently. While "spontaneous" desire is more common at the beginning of a relationship, "responsive" desire (aroused in response to touch or stimulation) is completely normal in long-term relationships.'}
                as="p"
                multiline
              />
              <ContentFeedback 
                pageId="intimacy-guide" 
                sectionId="fundamentals" 
                title="יסודות המיניות והחשק" 
              />
            </div>
          </motion.section>

          {/* Section 2: Pleasure & Connection */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white/5 rounded-[4rem] p-12 md:p-20 border border-white/10"
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-serif flex items-center gap-6">
                <span className="text-brand-gold text-sm font-sans font-black">02</span>
                <EditableText 
                  contentId={`intimacy_sec2_title_${language}`}
                  defaultText={language === 'he' ? 'הכימיה של העונג והחיבור' : 'The Chemistry of Pleasure and Connection'}
                  as="span"
                />
              </h2>
              <button 
                onClick={() => handleShare('הכימיה של העונג והחיבור', 'עונג מיני הוא לא רק פיזי. המוח הוא איבר המין הגדול ביותר שלנו...')}
                className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-brand-gold"
              >
                <Share2 size={18} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-8 text-white/70 leading-relaxed text-lg">
                <EditableText 
                  contentId={`intimacy_sec2_p1_${language}`}
                  defaultText={language === 'he' ? 'עונג מיני הוא לא רק פיזי. המוח הוא איבר המין הגדול ביותר שלנו. שחרור של אוקסיטוצין ("הורמון האהבה") במהלך אינטימיות מחזק את הקשר הרגשי ויוצר תחושת ביטחון וקרבה.' : 'Sexual pleasure is not just physical. The brain is our largest sex organ. The release of oxytocin (the "love hormone") during intimacy strengthens the emotional bond and creates a sense of security and closeness.'}
                  as="p"
                  multiline
                />
                <EditableText 
                  contentId={`intimacy_sec2_p2_${language}`}
                  defaultText={language === 'he' ? 'תקשורת על רצונות ופנטזיות יכולה להיות מאתגרת, אך היא הדרך הבטוחה ביותר להעמקת הסיפוק. למידה של "שפת העונג" של בן/בת הזוג היא תהליך מתמשך של גילוי.' : 'Communicating about desires and fantasies can be challenging, but it is the surest way to deepen satisfaction. Learning your partner\'s "language of pleasure" is an ongoing process of discovery.'}
                  as="p"
                  multiline
                />
              </div>
              <div className="bg-brand-black p-10 rounded-3xl space-y-6 border border-brand-gold/10">
                <EditableText 
                  contentId={`intimacy_sec2_list_title_${language}`}
                  defaultText={language === 'he' ? 'מרכיבי האינטימיות:' : 'Components of Intimacy:'}
                  as="h4"
                  className="text-xs font-black uppercase tracking-widest text-brand-gold mb-6"
                />
                <ul className="space-y-6">
                  {[
                    { id: 'safety', text: language === 'he' ? 'ביטחון רגשי ופגיעות' : 'Emotional safety and vulnerability' },
                    { id: 'discovery', text: language === 'he' ? 'סקרנות וגילוי משותף' : 'Curiosity and shared discovery' },
                    { id: 'mindfulness', text: language === 'he' ? 'נוכחות מלאה (Mindfulness)' : 'Full presence (Mindfulness)' },
                    { id: 'communication', text: language === 'he' ? 'תקשורת כנה על צרכים' : 'Honest communication about needs' },
                    { id: 'playfulness', text: language === 'he' ? 'גיוון ומשחקיות' : 'Variety and playfulness' }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-base font-bold text-white/80">
                      <div className="w-2 h-2 bg-brand-gold rounded-full shadow-[0_0_10px_rgba(242,125,38,0.5)]" />
                      <EditableText 
                        contentId={`intimacy_sec2_item_${item.id}_${language}`}
                        defaultText={item.text}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <ContentFeedback 
              pageId="intimacy-guide" 
              sectionId="pleasure-connection" 
              title="הכימיה של העונג והחיבור" 
            />
          </motion.section>

          {/* Section 3: Lifespan & Changes */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-serif flex items-center gap-6">
                <span className="text-brand-gold text-sm font-sans font-black">03</span>
                <EditableText 
                  contentId={`intimacy_sec3_title_${language}`}
                  defaultText={language === 'he' ? 'מיניות לאורך מעגל החיים' : 'Sexuality Across the Life Cycle'}
                  as="span"
                />
              </h2>
              <button 
                onClick={() => handleShare('מיניות לאורך מעגל החיים', 'המיניות שלנו משתנה עם השנים. שינויים הורמונליים, לידות...')}
                className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-brand-gold"
              >
                <Share2 size={18} />
              </button>
            </div>
            <div className="prose prose-invert prose-lg max-w-none text-white/70 leading-relaxed space-y-10">
              <EditableText 
                contentId={`intimacy_sec3_p1_${language}`}
                defaultText={language === 'he' ? 'המיניות שלנו משתנה עם השנים. שינויים הורמונליים, לידות, לחצי קריירה והזדקנות משפיעים על האופן שבו אנו חווים אינטימיות.' : 'Our sexuality changes over the years. Hormonal changes, births, career pressures, and aging affect how we experience intimacy.'}
                as="p"
                multiline
              />
              
              <div className="grid sm:grid-cols-2 gap-8 my-16">
                <div className="bg-white/5 p-10 rounded-[2rem] border border-white/10">
                  <EditableText 
                    contentId={`intimacy_sec3_box1_title_${language}`}
                    defaultText={language === 'he' ? 'התאמה לשינויים' : 'Adapting to Changes'}
                    as="h4"
                    className="text-xl font-serif mb-4 italic text-brand-gold"
                  />
                  <EditableText 
                    contentId={`intimacy_sec3_box1_desc_${language}`}
                    defaultText={language === 'he' ? 'חשוב להבין ששינויים בחשק הם חלק טבעי מהחיים. המפתח הוא לא להילחם בהם, אלא למצוא דרכים חדשות להתחבר.' : 'It is important to understand that changes in desire are a natural part of life. The key is not to fight them, but to find new ways to connect.'}
                    as="p"
                    multiline
                    className="text-sm leading-relaxed"
                  />
                </div>
                <div className="bg-white/5 p-10 rounded-[2rem] border border-white/10">
                  <EditableText 
                    contentId={`intimacy_sec3_box2_title_${language}`}
                    defaultText={language === 'he' ? 'אינטימיות מעבר למין' : 'Intimacy Beyond Sex'}
                    as="h4"
                    className="text-xl font-serif mb-4 italic text-brand-gold"
                  />
                  <EditableText 
                    contentId={`intimacy_sec3_box2_desc_${language}`}
                    defaultText={language === 'he' ? 'מגע לא מיני, חיבוקים ושיחות עומק הם הבסיס שעליו נבנית התשוקה המינית. אל תזניחו את ה"לפני" וה"אחרי".' : 'Non-sexual touch, hugs, and deep conversations are the foundation upon which sexual desire is built. Don\'t neglect the "before" and "after".'}
                    as="p"
                    multiline
                    className="text-sm leading-relaxed"
                  />
                </div>
              </div>

              <EditableText 
                contentId={`intimacy_sec3_p2_${language}`}
                defaultText={language === 'he' ? 'זוגות שמצליחים לשמור על חיי מין מספקים לאורך עשורים הם אלו שרואים במיניות "פרויקט משותף" – משהו שדורש השקעה, יצירתיות ובעיקר המון חמלה עצמית וזוגית.' : 'Couples who manage to maintain a satisfying sex life over decades are those who see sexuality as a "joint project" – something that requires investment, creativity, and above all, a lot of self and couple compassion.'}
                as="p"
                multiline
              />
              <ContentFeedback 
                pageId="intimacy-guide" 
                sectionId="lifespan-changes" 
                title="מיניות לאורך מעגל החיים" 
              />
            </div>
          </motion.section>

          {/* Section 4: Science of Well-being */}
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="border-t border-white/10 pt-20"
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-serif flex items-center gap-6">
                <span className="text-brand-gold text-sm font-sans font-black">04</span>
                <EditableText 
                  contentId={`intimacy_sec4_title_${language}`}
                  defaultText={language === 'he' ? 'מדע החיבור והרווחה האישית' : 'The Science of Connection and Well-being'}
                  as="span"
                />
              </h2>
              <button 
                onClick={() => handleShare('מדע החיבור והרווחה האישית', 'מחקרים עדכניים מראים קשר ישיר בין איכות הקשר הרומנטי לבין הרווחה הנפשית...')}
                className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-brand-gold"
              >
                <Share2 size={18} />
              </button>
            </div>
            <div className="prose prose-invert prose-lg max-w-none text-white/70 leading-relaxed space-y-10">
              <EditableText 
                contentId={`intimacy_sec4_p1_${language}`}
                defaultText={language === 'he' ? 'מחקרים עדכניים (כמו אלו שפורסמו ב-PMC) מראים קשר ישיר בין איכות הקשר הרומנטי לבין הרווחה הנפשית והפיזית של בני הזוג. קשר בריא פועל כ"בולם זעזועים" מול לחצי החיים.' : 'Recent studies (such as those published in PMC) show a direct link between the quality of a romantic relationship and the mental and physical well-being of the partners. A healthy relationship acts as a "shock absorber" against life\'s pressures.'}
                as="p"
                multiline
              />
              
              <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <EditableText 
                    contentId={`intimacy_sec4_list_title_${language}`}
                    defaultText={language === 'he' ? 'יתרונות החיבור העמוק:' : 'Benefits of Deep Connection:'}
                    as="h4"
                    className="text-2xl font-serif italic text-brand-gold"
                  />
                  <ul className="space-y-4 text-sm">
                    {[
                      { id: 'cortisol', text: language === 'he' ? 'הפחתת רמות הקורטיזול (הורמון הסטרס)' : 'Reducing cortisol levels (stress hormone)' },
                      { id: 'immune', text: language === 'he' ? 'שיפור במערכת החיסון' : 'Improving the immune system' },
                      { id: 'lifespan', text: language === 'he' ? 'תוחלת חיים ארוכה יותר' : 'Longer life expectancy' },
                      { id: 'resilience', text: language === 'he' ? 'חוסן רגשי גבוה יותר מול משברים' : 'Higher emotional resilience in the face of crises' }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="text-brand-gold" size={16} />
                        <EditableText 
                          contentId={`intimacy_sec4_item_${item.id}_${language}`}
                          defaultText={item.text}
                          as="span"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/5 p-10 rounded-[2rem] border border-white/10">
                  <EditableText 
                    contentId={`intimacy_sec4_box_title_${language}`}
                    defaultText={language === 'he' ? 'הקשר בין רגש למיניות' : 'The Connection Between Emotion and Sexuality'}
                    as="h4"
                    className="text-xl font-serif mb-4 italic text-brand-gold"
                  />
                  <EditableText 
                    contentId={`intimacy_sec4_box_desc_${language}`}
                    defaultText={language === 'he' ? 'עבור זוגות רבים, ובמיוחד בטווח הארוך, הביטחון הרגשי הוא התנאי המקדים לחופש מיני. כשאנחנו מרגישים בטוחים ומוערכים, קל לנו יותר להיפתח ולחקור את העונג.' : 'For many couples, especially in the long term, emotional security is the prerequisite for sexual freedom. When we feel safe and valued, it is easier for us to open up and explore pleasure.'}
                    as="p"
                    multiline
                    className="text-sm leading-relaxed"
                  />
                </div>
              </div>
              <ContentFeedback 
                pageId="intimacy-guide" 
                sectionId="science-wellbeing" 
                title="מדע החיבור והרווחה האישית" 
              />
            </div>
          </motion.section>

          {/* Interactive Guide Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-t border-white/10 pt-20"
          >
            <div className="text-center mb-16">
              <EditableText 
                contentId={`intimacy_interactive_label_${language}`}
                defaultText={language === 'he' ? 'כלי לחקירה משותפת' : 'Tool for shared exploration'}
                as="h4"
                className="text-brand-gold text-xs font-black uppercase tracking-widest mb-4"
              />
              <EditableText 
                contentId={`intimacy_interactive_title_${language}`}
                defaultText={language === 'he' ? 'מדריך אינטראקטיבי' : 'Interactive Guide'}
                as="h2"
                className="text-5xl font-serif italic"
              />
            </div>
            <InteractiveGuide />
          </motion.section>

          {/* Attribution Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-32 p-12 bg-white/5 border border-white/10 rounded-[3rem] text-center"
          >
            <Info className="text-brand-gold mx-auto mb-6" size={32} />
            <EditableText 
              contentId={`intimacy_sources_title_${language}`}
              defaultText={language === 'he' ? 'מקור המאמר וזכויות יוצרים' : 'Article Source and Copyright'}
              as="h3"
              className="text-xl font-serif mb-4 text-white"
            />
            <EditableText 
              contentId={`intimacy_sources_desc_${language}`}
              defaultText={language === 'he' ? 'התוכן במדריך זה מבוסס על סדרת מאמרים מקצועיים בנושאי מיניות ואינטימיות מאתר Psychology Today ועל מחקרים שפורסמו ב- PMC (NIH). אנו מודים למומחים ולחוקרים על הנגשת הידע המדעי בנושאים כה רגישים וחשובים. כל הזכויות על התוכן המקורי שמורות לכותבי המאמרים ולגופי המחקר.' : 'The content in this guide is based on a series of professional articles on sexuality and intimacy from Psychology Today and on studies published in PMC (NIH). We thank the experts and researchers for making scientific knowledge accessible on such sensitive and important topics. All rights to the original content are reserved to the article writers and research bodies.'}
              as="p"
              multiline
              className="text-white/50 text-sm max-w-2xl mx-auto leading-relaxed"
            />
            <div className="mt-8 flex justify-center gap-8">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://www.psychologytoday.com/us/basics/sex" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-gold hover:text-white transition-colors uppercase tracking-widest text-[10px] font-black"
              >
                Psychology Today <ExternalLink size={14} />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://pmc.ncbi.nlm.nih.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-gold hover:text-white transition-colors uppercase tracking-widest text-[10px] font-black"
              >
                PMC (NIH) <ExternalLink size={14} />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default IntimacyGuide;

import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, Zap, Users, ShieldCheck, ArrowLeft, MessageCircle, ExternalLink, Info, Quote, CheckCircle2, HelpCircle, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditableText } from '../components/EditableText';
import { useLanguage } from '../contexts/LanguageContext';

const CouplesTherapyGuide = () => {
  const { t, language } = useLanguage();

  const benefits = [
    {
      id: 'communication',
      title: language === 'he' ? 'שיפור התקשורת וההבנה' : 'Improving Communication and Understanding',
      desc: language === 'he' ? 'למידה של שפת תקשורת חדשה – איך להקשיב באמת ואיך לבטא צרכים בלי להאשים.' : 'Learning a new communication language – how to truly listen and how to express needs without blaming.',
      icon: MessageCircle,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'conflict',
      title: language === 'he' ? 'פתרון קונפליקטים בונה' : 'Constructive Conflict Resolution',
      desc: language === 'he' ? 'קבלת כלים מעשיים לניהול ויכוחים בצורה שלא פוגעת בקשר, אלא מצמיחה אותו.' : 'Getting practical tools for managing arguments in a way that doesn\'t hurt the relationship, but grows it.',
      icon: Zap,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'intimacy',
      title: language === 'he' ? 'חיזוק האינטימיות והחיבור' : 'Strengthening Intimacy and Connection',
      desc: language === 'he' ? 'גילוי מחדש של הניצוץ והעמקת הקשר הרגשי והפיזי דרך פגיעות וביטחון.' : 'Rediscovering the spark and deepening the emotional and physical connection through vulnerability and security.',
      icon: Heart,
      color: 'bg-rose-50 text-rose-600'
    },
    {
      id: 'patterns',
      title: language === 'he' ? 'זיהוי דפוסים מעכבים' : 'Identifying Inhibiting Patterns',
      desc: language === 'he' ? 'הבנה של הדינמיקות הלא מודעות והמטענים שאנחנו מביאים איתנו מהעבר.' : 'Understanding the unconscious dynamics and baggage we bring with us from the past.',
      icon: Activity,
      color: 'bg-indigo-50 text-indigo-600'
    }
  ];

  const reasons = [
    { id: 'safe_space', text: language === 'he' ? 'יצירת מרחב בטוח ונייטרלי לשיחות קשות' : 'Creating a safe and neutral space for difficult conversations' },
    { id: 'prevention', text: language === 'he' ? 'מניעה של משברים עתידיים (טיפול מונע)' : 'Prevention of future crises (preventive therapy)' },
    { id: 'wellbeing', text: language === 'he' ? 'שיפור הרווחה הנפשית של כל אחד מבני הזוג' : 'Improving the mental well-being of each partner' },
    { id: 'trust', text: language === 'he' ? 'חיזוק האמון והביטחון בקשר' : 'Strengthening trust and security in the relationship' },
    { id: 'changes', text: language === 'he' ? 'התמודדות עם שינויי חיים משמעותיים' : 'Dealing with significant life changes' },
    { id: 'forgiveness', text: language === 'he' ? 'למידה של "סליחה" ושחרור משקעים' : 'Learning "forgiveness" and releasing baggage' }
  ];

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link 
              to="/knowledge-hub" 
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-brand-gold mb-8 hover:text-brand-black transition-colors"
            >
              <ArrowLeft size={14} className={language === 'he' || language === 'ar' ? '' : 'rotate-180'} />
              <EditableText 
                contentId={`therapy_back_btn_${language}`}
                defaultText={language === 'he' ? 'חזרה לספריית הידע' : 'Back to Knowledge Hub'}
                as="span"
              />
            </Link>
          </motion.div>
          <EditableText 
            contentId={`therapy_title_${language}`}
            defaultText={language === 'he' ? 'הכוח שבטיפול זוגי' : 'The Power of Couples Therapy'}
            as="h1"
            className="text-6xl md:text-7xl font-serif text-brand-black mb-8 leading-tight"
          />
          <EditableText 
            contentId={`therapy_subtitle_${language}`}
            defaultText={language === 'he' ? 'טיפול זוגי הוא לא "מוצא אחרון" לקשרים גוססים, אלא השקעה חכמה ומעמיקה בנכס היקר ביותר שלכם. גלו למה המדע והניסיון מוכיחים שזה עובד.' : 'Couples therapy is not a "last resort" for dying relationships, but a smart and deep investment in your most precious asset. Discover why science and experience prove it works.'}
            as="p"
            multiline
            className="text-brand-black/60 text-xl max-w-2xl mx-auto leading-relaxed"
          />
        </motion.div>

        {/* Section 1: The Shift in Perspective */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-sm border border-brand-gold/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <ShieldCheck size={200} className="text-brand-gold" />
            </div>
            <h2 className="text-4xl font-serif mb-8 italic">
              <EditableText 
                contentId={`therapy_sec1_title_${language}`}
                defaultText={language === 'he' ? 'זה לא אתם נגד העולם, זה שניכם יחד' : 'It\'s not you against the world, it\'s both of you together'}
                as="span"
              />
            </h2>
            <div className="prose prose-lg text-brand-black/70 leading-relaxed space-y-6">
              <EditableText 
                contentId={`therapy_sec1_p1_${language}`}
                defaultText={language === 'he' ? 'רבים תופסים טיפול זוגי כסימן לכישלון, אך המציאות הפוכה לחלוטין. מחקרים מראים כי זוגות שפונים לטיפול בשלבים מוקדמים, או אפילו כשהקשר "טוב", מצליחים לבנות חוסן רגשי גבוה משמעותית.' : 'Many perceive couples therapy as a sign of failure, but the reality is quite the opposite. Studies show that couples who turn to therapy in early stages, or even when the relationship is "good," manage to build significantly higher emotional resilience.'}
                as="p"
                multiline
              />
              <EditableText 
                contentId={`therapy_sec1_p2_${language}`}
                defaultText={language === 'he' ? 'לפי סקר של Verywell Mind, מעל 90% מהאנשים שהתנסו בטיפול זוגי דיווחו על שיפור משמעותי באיכות הקשר שלהם. הטיפול מעניק "ארגז כלים" שלא קיבלנו בשום בית ספר.' : 'According to a survey by Verywell Mind, over 90% of people who experienced couples therapy reported a significant improvement in the quality of their relationship. Therapy provides a "toolbox" we didn\'t get in any school.'}
                as="p"
                multiline
              />
            </div>
          </div>
        </motion.section>

        {/* Section 2: Core Benefits Grid */}
        <section className="mb-32">
          <EditableText 
            contentId={`therapy_sec2_title_${language}`}
            defaultText={language === 'he' ? 'היתרונות המוכחים של התהליך' : 'Proven Benefits of the Process'}
            as="h2"
            className="text-4xl font-serif mb-16 text-center"
          />
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 rounded-[3rem] border border-brand-gold/5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-14 h-14 ${benefit.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <benefit.icon size={28} />
                </div>
                <EditableText 
                  contentId={`therapy_benefit_${benefit.id}_title_${language}`}
                  defaultText={benefit.title}
                  as="h3"
                  className="text-2xl font-serif mb-4"
                />
                <EditableText 
                  contentId={`therapy_benefit_${benefit.id}_desc_${language}`}
                  defaultText={benefit.desc}
                  as="p"
                  multiline
                  className="text-brand-black/50 leading-relaxed"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 3: Why Healthy Couples Go To Therapy */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-brand-black text-white p-12 md:p-24 rounded-[4rem] mb-32 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif mb-12 italic">
              <EditableText 
                contentId={`therapy_sec3_title_${language}`}
                defaultText={language === 'he' ? 'למה גם זוגות מאושרים הולכים לטיפול?' : 'Why do even happy couples go to therapy?'}
                as="span"
              />
            </h2>
            <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-6">
                {reasons.map((reason, i) => (
                  <div key={i} className="flex items-center gap-4 text-lg font-medium">
                    <CheckCircle2 className="text-brand-gold shrink-0" size={24} />
                    <EditableText 
                      contentId={`therapy_reason_${reason.id}_${language}`}
                      defaultText={reason.text}
                      as="span"
                    />
                  </div>
                ))}
              </div>
              <div className="bg-white/5 p-10 rounded-3xl border border-white/10 backdrop-blur-sm flex flex-col justify-center">
                <Quote className="text-brand-gold/20 mb-6" size={40} />
                <EditableText 
                  contentId={`therapy_quote_${language}`}
                  defaultText={language === 'he' ? '"טיפול זוגי הוא כמו אימון כושר לזוגיות. אתם לא הולכים לחדר כושר רק כשאתם חולים, אתם הולכים כדי להיות חזקים, גמישים ובריאים יותר."' : '"Couples therapy is like a fitness workout for the relationship. You don\'t go to the gym only when you\'re sick, you go to be stronger, more flexible, and healthier."'}
                  as="p"
                  multiline
                  className="text-xl leading-relaxed italic text-white/80"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 4: The Science Behind It */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <h2 className="text-4xl font-serif mb-10 flex items-center gap-4">
            <span className="text-brand-gold text-sm font-sans font-black">04</span>
            <EditableText 
              contentId={`therapy_sec4_title_${language}`}
              defaultText={language === 'he' ? 'מה אומר המדע?' : 'What does science say?'}
              as="span"
            />
          </h2>
          <div className="prose prose-lg text-brand-black/70 leading-relaxed space-y-8">
            <EditableText 
              contentId={`therapy_sec4_p1_${language}`}
              defaultText={language === 'he' ? 'מחקרים שפורסמו ב-PMC (NIH) מדגישים כי טיפול זוגי מבוסס ראיות (כמו EFT או שיטת גוטמן) מוביל לשינויים נוירולוגיים ורגשיים עמוקים. התהליך עוזר להפחית את רמות הסטרס הפיזיולוגי בזמן קונפליקט ומגביר את רמות האוקסיטוצין והביטחון.' : 'Studies published in PMC (NIH) emphasize that evidence-based couples therapy (such as EFT or the Gottman method) leads to profound neurological and emotional changes. The process helps reduce physiological stress levels during conflict and increases oxytocin and security levels.'}
              as="p"
              multiline
            />
            <div className="bg-brand-gold/5 p-10 rounded-[2rem] border border-brand-gold/10">
              <h4 className="text-xl font-serif mb-4 italic flex items-center gap-3">
                <HelpCircle size={20} className="text-brand-gold" />
                <EditableText 
                  contentId={`therapy_myth_title_${language}`}
                  defaultText={language === 'he' ? 'מיתוס מול מציאות' : 'Myth vs. Reality'}
                  as="span"
                />
              </h4>
              <EditableText 
                contentId={`therapy_myth_desc_${language}`}
                defaultText={language === 'he' ? 'רבים חוששים שהמטפל "ייקח צד". במציאות, המטפל הזוגי רואה ב"קשר" את המטופל שלו. המטרה היא לא לקבוע מי צודק, אלא להבין איך שניכם יכולים להרגיש בטוחים ואהובים יותר.' : 'Many fear the therapist will "take sides." In reality, the couples therapist sees the "relationship" as their patient. The goal is not to determine who is right, but to understand how both of you can feel safer and more loved.'}
                as="p"
                multiline
                className="text-sm italic"
              />
            </div>
          </div>
        </motion.section>

        {/* Attribution Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="p-12 bg-white border border-brand-gold/10 rounded-[3rem] text-center"
        >
          <Info className="text-brand-gold mx-auto mb-6" size={32} />
          <EditableText 
            contentId={`therapy_sources_title_${language}`}
            defaultText={language === 'he' ? 'מקורות מחקריים ומאמרים' : 'Research Sources and Articles'}
            as="h3"
            className="text-xl font-serif mb-4"
          />
          <EditableText 
            contentId={`therapy_sources_desc_${language}`}
            defaultText={language === 'he' ? 'התוכן במדריך זה מבוסס על מחקרים קליניים ומאמרים מקצועיים מהגופים המובילים בעולם בתחום בריאות הנפש והזוגיות.' : 'The content in this guide is based on clinical studies and professional articles from the world\'s leading bodies in the field of mental health and relationships.'}
            as="p"
            multiline
            className="text-brand-black/50 text-sm max-w-2xl mx-auto leading-relaxed mb-10"
          />
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { name: 'PMC (NIH) Research', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10087549/' },
              { name: 'Advanced Psychiatry', url: 'https://advancedpsychiatryassociates.com/resources/blog/benefits-of-couples-therapy' },
              { name: 'Verywell Mind Survey', url: 'https://www.verywellmind.com/relationships-survey-7104667' },
              { name: 'Utah State University', url: 'https://cehs.usu.edu/hdfs/blog/6-reasons-why-healthy-couples-go-to-therapy-and-why-you-should-too' },
              { name: 'Kind Soul Psychology', url: 'https://kindsoulpsych.co.uk/blog/evidence-based-benefits-of-couples-therapy/' }
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

export default CouplesTherapyGuide;

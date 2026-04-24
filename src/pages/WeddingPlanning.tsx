import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, Zap, Users, ShieldCheck, ArrowLeft, BookOpen, Quote, Calendar, MessageCircle, ExternalLink, Info, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditableText } from '../components/EditableText';
import { useLanguage } from '../contexts/LanguageContext';

const WeddingPlanning = () => {
  const { t, language } = useLanguage();

  const planningTips = [
    { id: 'vision', name: language === 'he' ? 'חזון משותף' : 'Shared Vision', desc: language === 'he' ? 'הגדירו 3 דברים שחשובים לשניכם' : 'Define 3 things that are important to both of you' },
    { id: 'budget', name: language === 'he' ? 'ניהול תקציב' : 'Budget Management', desc: language === 'he' ? 'שיח פתוח על כסף ומגבלות' : 'Open discourse about money and limitations' },
    { id: 'no_wedding', name: language === 'he' ? 'ערבי "ללא חתונה"' : '"No Wedding" Evenings', desc: language === 'he' ? 'זמן איכות ללא שיחות לוגיסטיות' : 'Quality time without logistical conversations' },
    { id: 'roles', name: language === 'he' ? 'חלוקת תפקידים' : 'Division of Roles', desc: language === 'he' ? 'שכל אחד ייקח אחריות על תחום אחר' : 'Let each one take responsibility for a different area' }
  ];

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
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
              <ArrowLeft size={14} className={language === 'he' || language === 'ar' ? '' : 'rotate-180'} />
              <EditableText 
                contentId={`wedding_back_btn_${language}`}
                defaultText={language === 'he' ? 'חזרה לספריית הידע' : 'Back to Knowledge Hub'}
                as="span"
              />
            </Link>
          </motion.div>
          <EditableText 
            contentId={`wedding_planning_title_${language}`}
            defaultText={language === 'he' ? 'תכנון חתונה וזוגיות' : 'Wedding Planning and Relationships'}
            as="h1"
            className="text-6xl md:text-7xl font-serif text-brand-black mb-8 leading-tight"
          />
          <div className="flex items-center justify-center gap-4 text-brand-black/40 text-xs uppercase tracking-widest">
            <EditableText 
              contentId={`wedding_sources_label_${language}`}
              defaultText={language === 'he' ? 'מקורות: NYT Modern Love, Vogue' : 'Sources: NYT Modern Love, Vogue'}
              as="span"
            />
            <div className="w-1 h-1 bg-brand-gold rounded-full" />
            <EditableText 
              contentId={`wedding_read_time_${language}`}
              defaultText={language === 'he' ? '10 דקות קריאה' : '10 min read'}
              as="span"
            />
          </div>
        </motion.div>

        {/* Article Content */}
        <div className="space-y-32">
          {/* Section 1: The Transition */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -right-12 top-0 text-brand-gold/10 pointer-events-none">
              <Gift size={120} />
            </div>
            <h2 className="text-4xl font-serif mb-10 flex items-center gap-4">
              <span className="text-brand-gold text-sm font-sans font-black">01</span>
              <EditableText 
                contentId={`wedding_sec1_title_${language}`}
                defaultText={language === 'he' ? 'המעבר מ"זוג" ל"נשואים"' : 'The Transition from "Couple" to "Married"'}
                as="span"
              />
            </h2>
            <div className="prose prose-lg prose-brand max-w-none text-brand-black/70 leading-relaxed space-y-8">
              <EditableText 
                contentId={`wedding_sec1_p1_${language}`}
                defaultText={language === 'he' ? 'תקופת האירוסין ותכנון החתונה היא אחת המרגשות אך גם המלחיצות ביותר בחיי זוג. זהו המבחן הראשון שלכם כצוות בניהול פרויקט מורכב, תקציב וציפיות משפחתיות.' : 'The engagement period and wedding planning is one of the most exciting but also stressful in a couple\'s life. This is your first test as a team in managing a complex project, budget, and family expectations.'}
                as="p"
                multiline
              />
              <div className="bg-white p-10 border-r-4 border-brand-gold my-12 italic text-2xl text-brand-black/80 font-serif shadow-sm rounded-l-2xl">
                <Quote className="text-brand-gold/20 mb-6" size={40} />
                <EditableText 
                  contentId={`wedding_quote_${language}`}
                  defaultText={language === 'he' ? '"החתונה היא יום אחד, הנישואין הם לכל החיים. אל תתנו לפרטים הקטנים של היום להאפיל על המטרה הגדולה שלכם."' : '"The wedding is one day, the marriage is for life. Don\'t let the small details of the day overshadow your big goal."'}
                  as="p"
                  multiline
                />
              </div>
              <EditableText 
                contentId={`wedding_sec1_p2_${language}`}
                defaultText={language === 'he' ? 'לפי טורי "Modern Love" בניו יורק טיימס, זוגות רבים מגלים שדווקא בתקופה זו עולים פערים בערכים או בציפיות. זהו זמן מצוין לתרגל תקשורת פתוחה ופשרה.' : 'According to "Modern Love" columns in the New York Times, many couples discover that specifically during this period, gaps in values or expectations arise. This is an excellent time to practice open communication and compromise.'}
                as="p"
                multiline
              />
            </div>
          </motion.section>

          {/* Section 2: Managing Stress */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[4rem] p-12 md:p-20 border border-brand-gold/10 shadow-sm"
          >
            <h2 className="text-4xl font-serif mb-10 flex items-center gap-4">
              <span className="text-brand-gold text-sm font-sans font-black">02</span>
              <EditableText 
                contentId={`wedding_sec2_title_${language}`}
                defaultText={language === 'he' ? 'ניהול סטרס וציפיות' : 'Managing Stress and Expectations'}
                as="span"
              />
            </h2>
            <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-8 text-brand-black/70 leading-relaxed text-lg">
                <EditableText 
                  contentId={`wedding_sec2_p1_${language}`}
                  defaultText={language === 'he' ? 'תכנון חתונה יכול להפוך למקור למתח רב. חשוב להגדיר מראש מהם הדברים שבאמת חשובים לכם כזוג, ועל מה אתם מוכנים להתפשר.' : 'Wedding planning can become a source of much tension. It is important to define in advance what things are truly important to you as a couple, and what you are willing to compromise on.'}
                  as="p"
                  multiline
                />
                <EditableText 
                  contentId={`wedding_sec2_p2_${language}`}
                  defaultText={language === 'he' ? 'זכרו שהחתונה היא חגיגה של האהבה שלכם, לא מופע עבור אחרים. שמרו על זמן איכות שבו אסור לדבר על החתונה.' : 'Remember that the wedding is a celebration of your love, not a show for others. Keep quality time where it is forbidden to talk about the wedding.'}
                  as="p"
                  multiline
                />
              </div>
              <div className="bg-brand-cream p-10 rounded-3xl space-y-6">
                <EditableText 
                  contentId={`wedding_tips_title_${language}`}
                  defaultText={language === 'he' ? 'טיפים לתקופת התכנון:' : 'Tips for the Planning Period:'}
                  as="h4"
                  className="text-xs font-black uppercase tracking-widest text-brand-gold mb-6"
                />
                <ul className="space-y-4">
                  {planningTips.map((item, i) => (
                    <li key={i} className="flex flex-col gap-1">
                      <EditableText 
                        contentId={`wedding_tip_${item.id}_name_${language}`}
                        defaultText={item.name}
                        as="span"
                        className="text-base font-bold text-brand-black/80"
                      />
                      <EditableText 
                        contentId={`wedding_tip_${item.id}_desc_${language}`}
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

          {/* Section 3: Building the Future */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-serif mb-10 flex items-center gap-4">
              <span className="text-brand-gold text-sm font-sans font-black">03</span>
              <EditableText 
                contentId={`wedding_sec3_title_${language}`}
                defaultText={language === 'he' ? 'לבנות את העתיד יחד' : 'Building the Future Together'}
                as="span"
              />
            </h2>
            <div className="prose prose-lg prose-brand max-w-none text-brand-black/70 leading-relaxed space-y-10">
              <EditableText 
                contentId={`wedding_sec3_p1_${language}`}
                defaultText={language === 'he' ? 'השתמשו בתקופת התכנון כדי לדבר על החיים שאחרי. איפה תגורו? איך תנהלו את משק הבית? מהן המטרות המשותפות שלכם ל-5 השנים הקרובות?' : 'Use the planning period to talk about the life after. Where will you live? How will you manage the household? What are your shared goals for the next 5 years?'}
                as="p"
                multiline
              />
              
              <div className="bg-brand-black text-white p-12 rounded-[3rem] my-12">
                <EditableText 
                  contentId={`wedding_after_title_${language}`}
                  defaultText={language === 'he' ? 'היום שאחרי' : 'The Day After'}
                  as="h3"
                  className="text-2xl font-serif mb-6 text-brand-gold italic"
                />
                <EditableText 
                  contentId={`wedding_after_desc_${language}`}
                  defaultText={language === 'he' ? 'זוגות רבים חווים "דיכאון שאחרי חתונה" בגלל ירידת המתח. הכינו לעצמכם תוכניות מרגשות לחודשים שאחרי החתונה כדי להמשיך את המומנטום החיובי.' : 'Many couples experience "post-wedding depression" because of the drop in tension. Prepare exciting plans for the months after the wedding to continue the positive momentum.'}
                  as="p"
                  multiline
                  className="text-white/70 leading-relaxed italic text-lg"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-8 my-16">
                <div className="bg-white p-10 rounded-[2rem] border border-brand-gold/10">
                  <EditableText 
                    contentId={`wedding_flexibility_title_${language}`}
                    defaultText={language === 'he' ? 'גמישות מחשבתית' : 'Mental Flexibility'}
                    as="h4"
                    className="text-xl font-serif mb-4 italic"
                  />
                  <EditableText 
                    contentId={`wedding_flexibility_desc_${language}`}
                    defaultText={language === 'he' ? 'דברים ישתבשו ביום החתונה. קבלו את זה בחיוך. אלו יהיו הסיפורים הכי טובים שלכם אחר כך.' : 'Things will go wrong on the wedding day. Accept it with a smile. These will be your best stories later.'}
                    as="p"
                    multiline
                    className="text-sm leading-relaxed"
                  />
                </div>
                <div className="bg-white p-10 rounded-[2rem] border border-brand-gold/10">
                  <EditableText 
                    contentId={`wedding_gratitude_title_${language}`}
                    defaultText={language === 'he' ? 'הוקרת תודה' : 'Gratitude'}
                    as="h4"
                    className="text-xl font-serif mb-4 italic"
                  />
                  <EditableText 
                    contentId={`wedding_gratitude_desc_${language}`}
                    defaultText={language === 'he' ? 'הודו זה לזה על המאמץ בתקופה הזו. זה מחזק את תחושת ה"אנחנו".' : 'Thank each other for the effort during this period. It strengthens the sense of "us".'}
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
              contentId={`wedding_sources_title_sec_${language}`}
              defaultText={language === 'he' ? 'מקורות וקרדיטים' : 'Sources and Credits'}
              as="h3"
              className="text-xl font-serif mb-4"
            />
            <EditableText 
              contentId={`wedding_sources_desc_sec_${language}`}
              defaultText={language === 'he' ? 'התוכן במאמר זה מבוסס על סיפורים ותובנות מטורי Modern Love של הניו יורק טיימס ומאמרי סגנון חיים של Vogue.' : 'The content in this article is based on stories and insights from Modern Love columns of the New York Times and lifestyle articles of Vogue.'}
              as="p"
              multiline
              className="text-brand-black/50 text-sm max-w-2xl mx-auto leading-relaxed"
            />
            <div className="mt-8 flex justify-center gap-8">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://www.nytimes.com/column/modern-love" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-black transition-colors uppercase tracking-widest text-[10px] font-black"
              >
                NYT Modern Love <ExternalLink size={14} />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://www.vogue.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-black transition-colors uppercase tracking-widest text-[10px] font-black"
              >
                Vogue <ExternalLink size={14} />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WeddingPlanning;

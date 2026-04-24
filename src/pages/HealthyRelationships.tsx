import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, Zap, Users, ShieldCheck, ArrowLeft, BookOpen, Quote, Calendar, MessageCircle, ExternalLink, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { EditableText } from '../components/EditableText';

const HealthyRelationships = () => {
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
              <EditableText 
                contentId={`healthy_back_${language}`}
                defaultText={language === 'he' ? 'חזרה לספריית הידע' : 'Back to Knowledge Hub'}
                as="span"
              />
            </Link>
          </motion.div>
          <EditableText 
            contentId={`healthy_relationships_title_${language}`}
            defaultText={language === 'he' ? 'יסודות ותחזוקת הקשר' : 'Foundations and Relationship Maintenance'}
            as="h1"
            className="text-6xl md:text-7xl font-serif text-brand-black mb-8 leading-tight"
          />
          <div className="flex items-center justify-center gap-4 text-brand-black/40 text-xs uppercase tracking-widest">
            <EditableText 
              contentId={`healthy_subtitle_${language}`}
              defaultText={language === 'he' ? 'מאמר מאת Psychology Today' : 'Article by Psychology Today'}
              as="span"
            />
            <div className="w-1 h-1 bg-brand-gold rounded-full" />
            <EditableText 
              contentId={`healthy_reading_time_${language}`}
              defaultText={language === 'he' ? '10 דקות קריאה' : '10 min read'}
              as="span"
            />
          </div>
        </motion.div>

        {/* Article Content */}
        <div className="space-y-32">
          {/* Section 1: Foundations */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className={`absolute ${isRtl ? '-right-12' : '-left-12'} top-0 text-brand-gold/10 pointer-events-none`}>
              <Heart size={120} />
            </div>
            <h2 className="text-4xl font-serif mb-10 flex items-center gap-4">
              <span className="text-brand-gold text-sm font-sans font-black">01</span>
              <EditableText 
                contentId={`healthy_sec1_title_${language}`}
                defaultText={language === 'he' ? 'למה מערכות יחסים חשובות' : 'Why Relationships Matter'}
                as="span"
              />
            </h2>
            <div className="prose prose-lg prose-brand max-w-none text-brand-black/70 leading-relaxed space-y-8">
              <EditableText 
                contentId={`healthy_sec1_p1_${language}`}
                defaultText={language === 'he' ? 'אהבה היא אחד הרגשות העמוקים ביותר המוכרים לבני אדם. ישנם סוגים רבים של אהבה, אך אנשים רבים מחפשים את ביטויה במערכת יחסים רומנטית עם בן או בת זוג מתאימים. עבור אנשים אלו, מערכות יחסים רומנטית מהוות את אחד ההיבטים המשמעותיים ביותר בחיים והן מקור לסיפוק עמוק.' : 'Love is one of the most profound emotions known to human beings. There are many kinds of love, but many people seek its expression in a romantic relationship with a compatible partner. For these individuals, romantic relationships constitute one of the most meaningful aspects of life and are a source of deep fulfillment.'}
                as="p"
                multiline
              />
              <div className={`bg-white p-10 border-brand-gold my-12 italic text-2xl text-brand-black/80 font-serif shadow-sm ${isRtl ? 'border-r-4 rounded-l-2xl' : 'border-l-4 rounded-r-2xl'}`}>
                <Quote className="text-brand-gold/20 mb-6" size={40} />
                <EditableText 
                  contentId={`healthy_sec1_quote_${language}`}
                  defaultText={language === 'he' ? '"בעוד שהצורך בחיבור אנושי נראה מולד, היכולת ליצור מערכות יחסים בריאות ואוהבות היא נלמדת."' : '"While the need for human connection appears to be innate, the ability to form healthy, loving relationships is learned."'}
                  as="span"
                  multiline
                />
              </div>
              <EditableText 
                contentId={`healthy_sec1_p2_${language}`}
                defaultText={language === 'he' ? 'עדויות מסוימות מצביעות על כך שהיכולת ליצור מערכת יחסים יציבה מתחילה להתגבש בינקות, בחוויות המוקדמות ביותר של הילד עם מטפל שנותן מענה אמין לצרכי התינוק למזון, טיפול, חום, הגנה, גירוי ומגע חברתי. מערכות יחסים כאלה אינן גורל, אך הן נחשבות כמעצבות דפוסים מושרשים עמוק של התייחסות לאחרים.' : 'Some evidence suggests that the ability to form a stable relationship begins to take shape in infancy, in a child\'s earliest experiences with a caregiver who reliably meets the infant\'s needs for food, care, warmth, protection, stimulation, and social contact. Such relationships are not destiny, but they are thought to establish deeply ingrained patterns of relating to others.'}
                as="p"
                multiline
              />
            </div>
          </motion.section>

          {/* Section 2: Building */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[4rem] p-12 md:p-20 border border-brand-gold/10 shadow-sm"
          >
            <h2 className="text-4xl font-serif mb-10 flex items-center gap-4">
              <span className="text-brand-gold text-sm font-sans font-black">02</span>
              <EditableText 
                contentId={`healthy_sec2_title_${language}`}
                defaultText={language === 'he' ? 'איך לבנות מערכת יחסים בריאה' : 'How to Build a Healthy Relationship'}
                as="span"
              />
            </h2>
            <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-8 text-brand-black/70 leading-relaxed text-lg">
                <EditableText 
                  contentId={`healthy_sec2_p1_${language}`}
                  defaultText={language === 'he' ? 'שמירה על מערכת יחסים חזקה דורשת טיפול ותקשורת מתמידים. תכונות מסוימות הוכחו כחשובות במיוחד לטיפוח מערכות יחסים בריאות.' : 'Maintaining a strong relationship requires constant care and communication. Certain traits have been shown to be especially important for fostering healthy relationships.'}
                  as="p"
                  multiline
                />
                <EditableText 
                  contentId={`healthy_sec2_p2_${language}`}
                  defaultText={language === 'he' ? 'במאה ה-21, מערכות יחסים טובות מתאפיינות בדרך כלל בהגינות רגשית ופיזית, במיוחד בחלוקת המטלות הנחוצות לתחזוקת משק הבית. בני זוג במערכות יחסים חזקות מרגישים גם אסירי תודה זה לזה.' : 'In the 21st century, good relationships are typically characterized by emotional and physical fairness, particularly in the distribution of chores necessary for household maintenance. Partners in strong relationships also feel grateful to one another.'}
                  as="p"
                  multiline
                />
              </div>
              <div className="bg-brand-cream p-10 rounded-3xl space-y-6">
                <EditableText 
                  contentId={`healthy_sec2_list_title_${language}`}
                  defaultText={language === 'he' ? 'עקרונות המפתח לבנייה:' : 'Key Principles for Building:'}
                  as="h4"
                  className="text-xs font-black uppercase tracking-widest text-brand-gold mb-6"
                />
                <ul className="space-y-6">
                  {[
                    { id: 'item1', text: language === 'he' ? 'תקשורת פתוחה: אל תתנו לבן הזוג לנחש מה אתם צריכים' : 'Open communication: Don\'t make your partner guess what you need' },
                    { id: 'item2', text: language === 'he' ? 'הקשבה אקטיבית: להבין את הרגש שמאחורי המילים' : 'Active listening: Understand the emotion behind the words' },
                    { id: 'item3', text: language === 'he' ? 'שימת לב לשפה לא מילולית: קשר עין, טון דיבור ושפת גוף' : 'Attention to nonverbal language: Eye contact, tone of voice, and body language' },
                    { id: 'item4', text: language === 'he' ? 'הקדשת זמן איכות פנים אל פנים ללא מסכים' : 'Dedicate quality face-to-face time without screens' },
                    { id: 'item5', text: language === 'he' ? 'הגינות בחלוקת מטלות הבית' : 'Fairness in the distribution of household chores' },
                    { id: 'item6', text: language === 'he' ? 'מתן "ספק לטובת בן הזוג"' : 'Giving the "benefit of the doubt" to your partner' }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-base font-bold text-brand-black/80">
                      <div className="w-2 h-2 bg-brand-gold rounded-full shrink-0" />
                      <EditableText 
                        contentId={`healthy_sec2_${item.id}_${language}`}
                        defaultText={item.text}
                        as="span"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Section 3: Maintenance & Growth */}
          <motion.section 
            id="maintenance"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-serif mb-10 flex items-center gap-4">
              <span className="text-brand-gold text-sm font-sans font-black">03</span>
              <EditableText 
                contentId={`healthy_sec3_title_${language}`}
                defaultText={language === 'he' ? 'תחזוקה וצמיחה משותפת' : 'Maintenance and Shared Growth'}
                as="span"
              />
            </h2>
            <div className="prose prose-lg prose-brand max-w-none text-brand-black/70 leading-relaxed space-y-10">
              <EditableText 
                contentId={`healthy_sec3_p1_${language}`}
                defaultText={language === 'he' ? 'במערכות היחסים המצליחות ביותר, בני הזוג לא רק נותנים זה לזה את הספק לטובה; הם נוקטים בצעדים תומכים פעילים המטפחים תחושה עוצמתית של להיות באותו צוות.' : 'In the most successful relationships, partners don\'t just give each other the benefit of the doubt; they take active supportive steps that foster a powerful sense of being on the same team.'}
                as="p"
                multiline
              />
              
              <div className="bg-brand-black text-white p-12 rounded-[3rem] my-12">
                <EditableText 
                  contentId={`healthy_sec3_rule_title_${language}`}
                  defaultText={language === 'he' ? 'אפקט מיכלאנג\'לו' : 'The Michelangelo Effect'}
                  as="h3"
                  className="text-2xl font-serif mb-6 text-brand-gold italic"
                />
                <EditableText 
                  contentId={`healthy_sec3_rule_desc_${language}`}
                  defaultText={language === 'he' ? 'בדיוק כפי שהפסל הגדול יכול היה להסתכל על גוש אבן ולראות צורה אנושית אידיאלית חבויה, המסרים החיוביים ואותות התמיכה של בן הזוג שלנו יכולים לעזור לנו לפרוח. בן זוג טוב עוזר לנו להתקרב ל"עצמי האידיאלי" שלנו.' : 'Just as the great sculptor could look at a block of stone and see a hidden ideal human form, our partner\'s positive messages and signals of support can help us flourish. A good partner helps us move closer to our "ideal self."'}
                  as="p"
                  multiline
                  className="text-white/70 leading-relaxed italic text-lg"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-8 my-16">
                <div className="bg-white p-10 rounded-[2rem] border border-brand-gold/10">
                  <EditableText 
                    contentId={`healthy_sec3_box1_title_${language}`}
                    defaultText={language === 'he' ? 'חשיבות הריטואל' : 'Importance of Ritual'}
                    as="h4"
                    className="text-xl font-serif mb-4 italic"
                  />
                  <EditableText 
                    contentId={`healthy_sec3_box1_desc_${language}`}
                    defaultText={language === 'he' ? 'פגישות יומן שבועיות עוזרות להפחית מתח, למנוע טינה שקטה וליצור חזון משותף. זהו זמן המוקדש ל"אנחנו" מעבר ללוגיסטיקה.' : 'Weekly calendar meetings help reduce stress, prevent quiet resentment, and create a shared vision. This is time dedicated to "us" beyond logistics.'}
                    as="p"
                    multiline
                    className="text-sm leading-relaxed"
                  />
                </div>
                <div className="bg-white p-10 rounded-[2rem] border border-brand-gold/10">
                  <EditableText 
                    contentId={`healthy_sec3_box2_title_${language}`}
                    defaultText={language === 'he' ? 'צמיחה אישית' : 'Personal Growth'}
                    as="h4"
                    className="text-xl font-serif mb-4 italic"
                  />
                  <EditableText 
                    contentId={`healthy_sec3_box2_desc_${language}`}
                    defaultText={language === 'he' ? 'מערכת יחסים בריאה צריכה להוביל לצמיחה אישית (Eudaimonia). עם תמיכה מחויבת, אנשים מתאוששים טוב יותר מלחץ או טראומה.' : 'A healthy relationship should lead to personal growth (Eudaimonia). With committed support, individuals recover better from stress or trauma.'}
                    as="p"
                    multiline
                    className="text-sm leading-relaxed"
                  />
                </div>
              </div>

              <div className="bg-brand-gold/10 p-12 rounded-[3rem] border border-brand-gold/20 text-center">
                <EditableText 
                  contentId={`healthy_sec3_cta_title_${language}`}
                  defaultText={language === 'he' ? 'זקוקים להשראה לשבירת השגרה?' : 'Need Inspiration to Break the Routine?'}
                  as="h4"
                  className="text-2xl font-serif mb-6 italic"
                />
                <EditableText 
                  contentId={`healthy_sec3_cta_desc_${language}`}
                  defaultText={language === 'he' ? 'הקדשת זמן איכות היא אחד היסודות החשובים ביותר לתחזוקת הקשר. אספנו עבורכם עשרות רעיונות לדייטים מכל הסוגים.' : 'Dedicating quality time is one of the most important foundations for relationship maintenance. We\'ve collected dozens of date ideas of all kinds for you.'}
                  as="p"
                  multiline
                  className="text-brand-black/60 mb-8"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                  <Link 
                    to="/date-night-ideas"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-brand-black text-white text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-brand-gold transition-all"
                  >
                    <EditableText 
                      contentId={`healthy_sec3_cta_btn_${language}`}
                      defaultText={language === 'he' ? 'לכל הרעיונות לערב דייט' : 'All Date Night Ideas'}
                      as="span"
                    />
                    <Calendar size={18} />
                  </Link>
                </motion.div>
              </div>

              <div className="mt-16 p-10 bg-white border border-brand-gold/10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck size={40} />
                </div>
                <div className={`text-center ${isRtl ? 'md:text-right' : 'md:text-left'}`}>
                  <EditableText 
                    contentId={`healthy_sec3_therapy_title_${language}`}
                    defaultText={language === 'he' ? 'האם טיפול זוגי מתאים לנו?' : 'Is Couples Therapy Right for Us?'}
                    as="h4"
                    className="text-xl font-serif mb-2 italic"
                  />
                  <EditableText 
                    contentId={`healthy_sec3_therapy_desc_${language}`}
                    defaultText={language === 'he' ? 'גלו למה טיפול זוגי הוא אחד הכלים העוצמתיים ביותר לצמיחה, גם עבור זוגות שנמצאים במקום טוב.' : 'Discover why couples therapy is one of the most powerful tools for growth, even for couples in a good place.'}
                    as="p"
                    multiline
                    className="text-brand-black/50 text-sm mb-4"
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                    <Link 
                      to="/couples-therapy"
                      className="text-brand-gold font-black uppercase tracking-widest text-[10px] hover:text-brand-black transition-colors flex items-center justify-center md:justify-start gap-2"
                    >
                      <EditableText 
                        contentId={`healthy_sec3_therapy_btn_${language}`}
                        defaultText={language === 'he' ? 'למדריך המלא על טיפול זוגי' : 'To the Full Couples Therapy Guide'}
                        as="span"
                      />
                      <ArrowLeft size={14} className={isRtl ? 'rotate-180' : ''} />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 4: Challenges */}
          <motion.section 
            id="challenges"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-t border-brand-gold/20 pt-20"
          >
            <h2 className="text-4xl font-serif mb-10 flex items-center gap-4">
              <span className="text-brand-gold text-sm font-sans font-black">04</span>
              <EditableText 
                contentId={`healthy_sec4_title_${language}`}
                defaultText={language === 'he' ? 'התמודדות עם אתגרים וחוסן' : 'Coping with Challenges and Resilience'}
                as="span"
              />
            </h2>
            <div className="prose prose-lg prose-brand max-w-none text-brand-black/70 leading-relaxed space-y-10">
              <EditableText 
                contentId={`healthy_sec4_p1_${language}`}
                defaultText={language === 'he' ? 'הגורם החשוב ביותר הקובע אם זוג יכול לשרוד אתגרים, כך עולה מהמחקר, הוא פשוט האם הם מאמינים שהם יכולים. בני זוג שבטוחים שהם יישארו יחד לא משנה אילו קונפליקטים יתעוררו, נוטים להצליח יותר.' : 'The most important factor determining whether a couple can survive challenges, research suggests, is simply whether they believe they can. Partners who are confident they will stay together no matter what conflicts arise tend to be more successful.'}
                as="p"
                multiline
              />
              
              <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <EditableText 
                    contentId={`healthy_sec4_list_title_${language}`}
                    defaultText={language === 'he' ? 'נקודות משבר נפוצות:' : 'Common Crisis Points:'}
                    as="h4"
                    className="text-2xl font-serif italic"
                  />
                  <ul className="space-y-4 text-sm">
                    {[
                      { id: 'item1', text: language === 'he' ? 'השנה הראשונה יחד' : 'The first year together' },
                      { id: 'item2', text: language === 'he' ? 'הגעת ילדים (ועזיבתם)' : 'Arrival of children (and their departure)' },
                      { id: 'item3', text: language === 'he' ? 'ירידה בבריאות או זקנה' : 'Decline in health or old age' },
                      { id: 'item4', text: language === 'he' ? 'פערים בהצלחה כלכלית או קהילתית' : 'Gaps in financial or community success' }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-brand-gold rounded-full shrink-0" />
                        <EditableText 
                          contentId={`healthy_sec4_${item.id}_${language}`}
                          defaultText={item.text}
                          as="span"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-brand-gold/5 p-10 rounded-[2rem] border border-brand-gold/10">
                  <EditableText 
                    contentId={`healthy_sec4_box_title_${language}`}
                    defaultText={language === 'he' ? 'תיאוריית מערבולת היחסים' : 'The Relationship Vortex Theory'}
                    as="h4"
                    className="text-xl font-serif mb-4 italic"
                  />
                  <EditableText 
                    contentId={`healthy_sec4_box_desc_${language}`}
                    defaultText={language === 'he' ? 'חשיפה מתמשכת לחוויות מקטבות כמו קנאה, חסימת מטרות, תקשורת סגורה והימנעות מנושאים קשים עלולה לגרום לקשר להתדרדר. זיהוי מוקדם ושיח פתוח הם המפתח.' : 'Continuous exposure to polarizing experiences such as jealousy, goal blocking, closed communication, and avoidance of difficult topics can cause a relationship to deteriorate. Early identification and open dialogue are key.'}
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
              contentId={`healthy_sources_title_${language}`}
              defaultText={language === 'he' ? 'מקור המאמר וזכויות יוצרים' : 'Article Source and Copyright'}
              as="h3"
              className="text-xl font-serif mb-4"
            />
            <EditableText 
              contentId={`healthy_sources_desc_${language}`}
              defaultText={language === 'he' ? 'התוכן במאמר זה מבוסס על מחקרים ותובנות מאתר Psychology Today. אנו מודים לכותבי המאמרים ולחוקרים על הידע המעמיק שהם חולקים עם העולם. כל הזכויות על התוכן המקורי שמורות ל-Psychology Today.' : 'The content in this article is based on research and insights from Psychology Today. We thank the article writers and researchers for the deep knowledge they share with the world. All rights to the original content are reserved by Psychology Today.'}
              as="p"
              multiline
              className="text-brand-black/50 text-sm max-w-2xl mx-auto leading-relaxed"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-8 inline-block">
              <a 
                href="https://www.psychologytoday.com/us/basics/relationships" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-black transition-colors uppercase tracking-widest text-[10px] font-black"
              >
                <EditableText 
                  contentId={`healthy_sources_btn_${language}`}
                  defaultText={language === 'he' ? 'למאמר המקור באנגלית' : 'To the Original Article in English'}
                  as="span"
                />
                <ExternalLink size={14} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HealthyRelationships;

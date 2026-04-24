import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Heart, Sparkles, Compass, Share2, Users, TrendingUp, Link as LinkIcon, Mail } from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { EditableImage } from '../components/EditableImage';
import { useUI } from '../contexts/UIContext';
import { useAlert } from '../components/AlertModal';
import { cn } from '../lib/utils';

export const About = () => {
  const { accessibilitySettings, isAccessibilityMenuOpen } = useUI();
  const { showAlert } = useAlert();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const accessibilityClasses = isAccessibilityMenuOpen ? cn(
    accessibilitySettings.fontSize === 'large' && 'text-lg',
    accessibilitySettings.fontSize === 'xlarge' && 'text-xl',
    accessibilitySettings.highContrast && 'contrast-150',
    accessibilitySettings.grayscale && 'grayscale',
    accessibilitySettings.readableFont && 'font-sans'
  ) : '';

  const handleShare = (method: 'link' | 'email') => {
    const url = window.location.href;
    const title = 'Byond Intima - Our Story';
    const text = 'Discover the story behind Byond Intima.';
    
    if (method === 'link') {
      navigator.clipboard.writeText(url);
      showAlert('הקישור הועתק ללוח!');
    } else if (method === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`;
    }
  };

  return (
    <div ref={containerRef} className={cn("pt-32 pb-32 bg-brand-cream min-h-screen relative overflow-hidden", accessibilityClasses)}>
      {/* Parallax Background */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 pointer-events-none z-0 opacity-10"
      >
        <EditableImage 
          contentId="about_background_image"
          defaultSrc="https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=2000" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-24 relative"
        >
          <div className="absolute top-0 right-0 flex gap-2">
            <button 
              onClick={() => handleShare('link')}
              className="p-2 rounded-full bg-white/50 hover:bg-white text-brand-gold transition-colors shadow-sm"
              title="Copy Link"
              aria-label="Share via link"
            >
              <LinkIcon size={18} />
            </button>
            <button 
              onClick={() => handleShare('email')}
              className="p-2 rounded-full bg-white/50 hover:bg-white text-brand-gold transition-colors shadow-sm"
              title="Share via Email"
              aria-label="Share via email"
            >
              <Mail size={18} />
            </button>
          </div>

          <EditableText 
            contentId="about_subtitle" 
            defaultText="Our Story" 
            as="span"
            className="text-xs tracking-[0.5em] text-brand-gold uppercase mb-8 block"
          />
          <EditableText 
            contentId="about_title" 
            defaultText="BYOND INTIMA" 
            as="h1"
            className="text-5xl md:text-7xl font-serif mb-12"
          />
          <div className="w-24 h-px bg-brand-gold mx-auto"></div>
        </motion.div>

        <div className="space-y-24 text-lg text-brand-black/70 leading-relaxed font-light text-center">
          <section className="relative">
            <div className="absolute -left-12 top-0 text-[120px] font-serif font-black text-brand-gold/5 leading-none select-none">01</div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <EditableText 
                contentId="about_genesis_title" 
                defaultText="The Genesis" 
                as="h2"
                className="text-sm tracking-[0.3em] uppercase text-brand-gold mb-8 font-bold"
              />
            </motion.div>
            <EditableText 
              contentId="about_genesis_text" 
              defaultText="Byond Intima נולדה מתוך ההבנה שהדבר היקר ביותר שיש לנו הוא הזמן שאנחנו מקדישים לאנשים שאנחנו אוהבים. בעולם מהיר, דיגיטלי ורועש, החיבור הזוגי הוא לעיתים הראשון להישחק."
              as="p"
              multiline
              className="max-w-2xl mx-auto"
            />
          </section>

          <section className="relative">
            <div className="absolute -right-12 top-0 text-[120px] font-serif font-black text-brand-gold/5 leading-none select-none">02</div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <EditableText 
                contentId="about_why_title" 
                defaultText="The 'Why'" 
                as="h2"
                className="text-sm tracking-[0.3em] uppercase text-brand-gold mb-8 font-bold"
              />
            </motion.div>
            <EditableText 
              contentId="about_why_text" 
              defaultText="המותג הוקם על ידי זוג שחיפש דרך להחזיר את ה'קסם' לשגרה. הם גילו שמה שבאמת חסר הוא לא 'זמן', אלא 'נוכחות'. הם רצו ליצור משהו שיהיה יותר מסתם מוצר - הם רצו ליצור שפה חדשה של אינטימיות, כזו שמשלבת בין משחקיות בוגרת, עומק רגשי וחיבור פיזי."
              as="p"
              multiline
              className="max-w-2xl mx-auto"
            />
          </section>
          
          <div className="py-20 border-y border-brand-gold/10 bg-white/30 backdrop-blur-sm -mx-6 px-6">
            <EditableText 
              contentId="about_vision_title" 
              defaultText="החזון והמשימה שלנו" 
              as="h3"
              className="text-4xl font-serif text-brand-black mb-8 italic"
            />
            <EditableText 
              contentId="about_vision_text" 
              defaultText="אנחנו לא מוכרים מוצרים. אנחנו יוצרים מרחבים. סטודיו לחוויות זוגיות מודרכות שנועד לעזור לכם להאט, להסתכל בעיניים, ולגלות מחדש את העומק שנמצא מתחת לפני השטח. המשימה שלנו היא להפוך כל רגע זוגי להזדמנות לצמיחה, גילוי וחיבור עמוק יותר."
              as="p"
              multiline
              className="max-w-3xl mx-auto text-xl"
            />
          </div>

          <section className="grid md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold">
                <Users size={32} />
              </div>
              <EditableText 
                contentId="about_value_1_title" 
                defaultText="כבוד (Respect)" 
                as="h4"
                className="font-serif text-xl"
              />
              <EditableText 
                contentId="about_value_1_desc" 
                defaultText="כבוד הדדי הוא הבסיס לכל מערכת יחסים בריאה ומעצימה." 
                as="p"
                className="text-sm text-brand-black/50"
              />
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold">
                <TrendingUp size={32} />
              </div>
              <EditableText 
                contentId="about_value_2_title" 
                defaultText="צמיחה (Growth)" 
                as="h4"
                className="font-serif text-xl"
              />
              <EditableText 
                contentId="about_value_2_desc" 
                defaultText="אנו מעודדים התפתחות אישית וזוגית מתמדת, יחד ולחוד." 
                as="p"
                className="text-sm text-brand-black/50"
              />
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto text-brand-gold">
                <Heart size={32} />
              </div>
              <EditableText 
                contentId="about_value_3_title" 
                defaultText="חיבור (Connection)" 
                as="h4"
                className="font-serif text-xl"
              />
              <EditableText 
                contentId="about_value_3_desc" 
                defaultText="יצירת מרחב בטוח ועמוק לאינטימיות רגשית ופיזית." 
                as="p"
                className="text-sm text-brand-black/50"
              />
            </div>
          </section>

          <section className="relative">
            <div className="absolute -left-12 top-0 text-[120px] font-serif font-black text-brand-gold/5 leading-none select-none">03</div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <EditableText 
                contentId="about_craft_title" 
                defaultText="The Craft" 
                as="h2"
                className="text-sm tracking-[0.3em] uppercase text-brand-gold mb-8 font-bold"
              />
            </motion.div>
            <EditableText 
              contentId="about_craft_text" 
              defaultText="כל מארז, כל משימה וכל פרק במסע שלנו עוצבו בקפידה כדי לשלב בין הנאה פיזית, עומק רגשי ומשחקיות בוגרת. אנחנו מאמינים שאינטימיות היא לא יעד, אלא תרגול יומיומי של נוכחות."
              as="p"
              multiline
              className="max-w-2xl mx-auto"
            />
          </section>

          <div className="pt-12">
            <EditableText 
              contentId="about_footer_text" 
              defaultText="בואו נלך מעבר." 
              as="p"
              className="font-serif text-3xl italic text-brand-gold tracking-widest"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

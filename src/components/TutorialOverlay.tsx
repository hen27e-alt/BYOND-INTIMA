import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Sparkles, Video, MessageCircle, Book, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { BRANDING } from '../constants/branding';

const TUTORIAL_STEPS = [
  {
    title: `ברוכים הבאים ל-${BRANDING.name}`,
    description: 'המרחב הבטוח והיוקרתי שלכם לטיפוח הזוגיות. בואו נכיר את הכלים שיעזרו לכם להעמיק את הקשר.',
    icon: Sparkles
  },
  {
    title: 'הסוכן האישי שלכם',
    description: 'שוחחו עם הסוכן החכם שלנו, קבלו עצות מותאמות אישית, צרו תמונות וסרטונים, ואפילו התחילו שיחת וידאו חיה.',
    icon: MessageCircle
  },
  {
    title: 'שיחת וידאו חיה',
    description: 'לחצו על סמל הטלפון בצ\'אט כדי להתחיל שיחת וידאו או אודיו חיה עם הסוכן שלנו, ממש כמו בשיחת ייעוץ אמיתית.',
    icon: Video
  },
  {
    title: 'יומן זוגיות',
    description: 'תעדו רגעים מיוחדים, שתפו מחשבות, וקבלו תובנות AI על הרישומים שלכם. תוכלו גם ליצור תמונות מהזיכרונות שלכם.',
    icon: Book
  },
  {
    title: 'לוח שנה ודייטים',
    description: 'תכננו את הדייט הבא שלכם, קבלו המלצות לפעילויות, ועקבו אחר אירועים חשובים בזוגיות שלכם.',
    icon: Calendar
  }
];

export const TutorialOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const isLoginPage = window.location.pathname === '/login';
    if (isLoginPage) return;

    const hasSeenTutorial = localStorage.getItem('byond_has_seen_tutorial');
    if (!hasSeenTutorial) {
      setIsOpen(true);
    }

    const handleOpenTutorial = () => {
      setIsOpen(true);
      setCurrentStep(0);
    };

    window.addEventListener('open-tutorial', handleOpenTutorial);
    return () => window.removeEventListener('open-tutorial', handleOpenTutorial);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('byond_has_seen_tutorial', 'true');
  };

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  const StepIcon = TUTORIAL_STEPS[currentStep].icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 z-[999] bg-brand-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-brand-cream w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-brand-gold/20 relative cursor-default"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-brand-black/40 hover:text-brand-black transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mb-6 text-brand-gold">
              <StepIcon size={32} />
            </div>
            
            <h2 className="text-2xl font-serif text-brand-black mb-4">
              {TUTORIAL_STEPS[currentStep].title}
            </h2>
            
            <p className="text-brand-black/70 text-sm leading-relaxed mb-8 min-h-[60px]">
              {TUTORIAL_STEPS[currentStep].description}
            </p>

            <div className="flex items-center gap-2 mb-8">
              {TUTORIAL_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === currentStep ? "w-6 bg-brand-gold" : "w-1.5 bg-brand-gold/20"
                  )}
                />
              ))}
            </div>

            <div className="flex w-full gap-4">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all disabled:opacity-30 bg-white text-brand-black border border-brand-gold/20 hover:bg-brand-gold/5"
              >
                הקודם
              </button>
              <button
                onClick={nextStep}
                className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all bg-brand-gold text-white hover:bg-brand-black shadow-lg"
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'התחל' : 'הבא'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

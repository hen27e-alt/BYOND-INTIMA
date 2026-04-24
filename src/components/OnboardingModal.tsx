import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Calendar, Bell, ChevronRight, CheckCircle, User, MessageCircle, Users, Copy, Loader2 } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';

export const OnboardingModal = () => {
  const { profile, updateProfile } = useFirebase();
  const [step, setStep] = useState(0);
  const [partnerName, setPartnerName] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // If profile is loading or onboarding is already completed, don't show
  if (!profile || profile?.preferences?.onboardingCompleted || !isVisible) {
    return null;
  }

  const steps = [
    {
      title: 'ברוכים הבאים ל-Byond Intima',
      description: 'המרחב שלכם לצמיחה זוגית, חיבור עמוק וחוויות בלתי נשכחות. בואו נכיר את האפליקציה.',
      icon: <Heart size={48} className="text-brand-gold mb-4" />
    },
    {
      title: 'הפרופיל הזוגי שלכם',
      description: 'ספרו לנו קצת עליכם כדי שנוכל להתאים את החוויה במיוחד עבורכם.',
      icon: <User size={48} className="text-brand-gold mb-4" />,
      content: (
        <div className="space-y-4 w-full text-right">
          <div>
            <label className="block text-sm text-brand-black/60 mb-1">שם בן/בת הזוג</label>
            <input 
              type="text" 
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="w-full bg-brand-cream/50 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold"
              placeholder="לדוגמה: דניאל"
            />
          </div>
          <div>
            <label className="block text-sm text-brand-black/60 mb-1">תאריך יום נישואין / היכרות</label>
            <input 
              type="date" 
              value={anniversary}
              onChange={(e) => setAnniversary(e.target.value)}
              className="w-full bg-brand-cream/50 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>
      )
    },
    {
      title: 'חיבור בן/בת זוג',
      description: 'כדי לחוות את האפליקציה יחד, עליכם לקשר את החשבונות שלכם. תוכלו לעשות זאת גם מאוחר יותר בלוח הבקרה.',
      icon: <Users size={48} className="text-brand-gold mb-4" />,
      content: (
        <div className="space-y-4 w-full text-right">
          <div className="bg-brand-cream/50 p-4 rounded-xl border border-brand-gold/10">
            <label className="block text-xs font-bold text-brand-black/40 mb-2 uppercase tracking-wider">הקוד האישי שלכם</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-3 py-2 rounded border border-brand-gold/20 text-[10px] font-mono break-all">
                {profile.uid}
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(profile.uid);
                }}
                className="p-2 hover:bg-brand-gold/10 rounded-lg transition-colors text-brand-gold"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-brand-black/50 text-center italic">
            שתפו את הקוד הזה עם בן/בת הזוג שלכם כדי שיוכלו להתחבר אליכם.
          </p>
        </div>
      )
    },
    {
      title: 'שפת האהבה שלכם',
      description: 'האם אתם יודעים מה שפת האהבה שלכם? באפליקציה תוכלו למלא שאלון קצר שיעזור לכם להבין איך אתם ובן/בת הזוג אוהבים לקבל אהבה.',
      icon: <MessageCircle size={48} className="text-brand-gold mb-4" />
    },
    {
      title: 'משימות שבועיות',
      description: 'כל שבוע תקבלו משימות זוגיות חדשות שיעזרו לכם להתחבר, לצחוק ולגלות דברים חדשים אחד על השנייה.',
      icon: <Sparkles size={48} className="text-brand-gold mb-4" />
    },
    {
      title: 'תכנון דייטים',
      description: 'השתמשו בבינה המלאכותית שלנו כדי לתכנן את הדייט המושלם, מותאם אישית להעדפות שלכם.',
      icon: <Calendar size={48} className="text-brand-gold mb-4" />
    },
    {
      title: 'התראות ותזכורות',
      description: 'אשרו קבלת התראות כדי שלא תפספסו משימות חדשות, אתגרים שבועיים ותזכורות חשובות.',
      icon: <Bell size={48} className="text-brand-gold mb-4" />
    }
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // Close modal locally immediately to provide feedback
      setIsVisible(false);

      await updateProfile({
        preferences: {
          ...profile?.preferences,
          onboardingCompleted: true
        },
        partnerName: partnerName || profile?.partnerName,
        anniversary: anniversary || profile?.anniversary
      });
      
      // Request notification permissions (async, don't wait for it to finish before closing)
      if ('Notification' in window && profile?.preferences?.notificationsEnabled !== false) {
        Notification.requestPermission().catch(e => {
          console.warn('Notification permission request failed:', e);
        });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2rem] p-8 md:p-12 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            {/* Skip Button */}
            <button 
              onClick={handleSkip}
              disabled={isLoading}
              className="absolute top-6 left-6 text-[10px] uppercase tracking-widest text-brand-black/40 hover:text-brand-black font-bold z-10 disabled:opacity-50"
            >
              דלג
            </button>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-cream">
              <motion.div 
                className="h-full bg-brand-gold"
                initial={{ width: '0%' }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="text-center">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center w-full"
              >
                {steps[step].icon}
                <h2 className="text-2xl font-serif text-brand-black mb-4">{steps[step].title}</h2>
                <p className="text-brand-black/70 leading-relaxed mb-8">
                  {steps[step].description}
                </p>
                {steps[step].content && (
                  <div className="w-full mb-8">
                    {steps[step].content}
                  </div>
                )}
              </motion.div>

              <div className="flex justify-between items-center mt-8">
                <div className="flex gap-2">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-brand-gold' : 'bg-brand-gold/20'}`}
                    />
                  ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-black text-white rounded-full text-sm uppercase tracking-widest hover:bg-brand-gold transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : step === steps.length - 1 ? (
                    <>בואו נתחיל <CheckCircle size={16} /></>
                  ) : (
                    <>הבא <ChevronRight size={16} className="rotate-180" /></>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

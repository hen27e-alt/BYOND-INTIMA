import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, ShieldCheck } from 'lucide-react';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('cookie-consent', 'dismissed');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-24 lg:bottom-8 left-4 right-4 lg:left-8 lg:right-auto lg:max-w-md z-[100]"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-brand-gold/20 p-6 rounded-3xl shadow-2xl shadow-black/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center shrink-0">
                <Cookie className="text-brand-gold" size={24} />
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-lg text-brand-black">פרטיות וקוקיז</h3>
                  <button 
                    onClick={handleDismiss}
                    className="text-brand-black/40 hover:text-brand-black transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-brand-black/60 text-sm leading-relaxed mb-6">
                  אנחנו משתמשים בעוגיות כדי לשפר את חווית הגלישה שלך, להציג תוכן מותאם אישית ולנתח את התנועה באתר שלנו.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAccept}
                    className="flex-grow bg-brand-black text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-gold transition-all duration-300 shadow-lg shadow-black/5"
                  >
                    אישור הכל
                  </button>
                  <button
                    onClick={handleDecline}
                    className="px-6 py-3 text-brand-black/60 font-medium hover:text-brand-black transition-colors"
                  >
                    דחייה
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-gold/10 flex items-center justify-center gap-2 text-[10px] text-brand-black/40 uppercase tracking-widest font-bold">
              <ShieldCheck size={12} />
              מאובטח על ידי Byond Intima
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

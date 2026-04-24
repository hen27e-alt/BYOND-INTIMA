import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, Sparkles, Loader2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { SITE_IMAGES } from '../constants/assets';
import { useAlert } from './AlertModal';

export const PackagePromoModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { language } = useLanguage();
  const { showAlert } = useAlert();

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenModal = sessionStorage.getItem('hasSeenPromoModal');
      if (!hasSeenModal) {
        setIsOpen(true);
        sessionStorage.setItem('hasSeenPromoModal', 'true');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const closeModal = () => setIsOpen(false);

  const handlePurchase = async (priceId: string, packageName: string) => {
    setLoadingId(priceId);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          packageName,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showAlert(language === 'he' ? "שגיאה בחיבור למערכת התשלומים. אנא נסו שוב מאוחר יותר." : "Error connecting to payment system. Please try again later.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showAlert(language === 'he' ? "שגיאה בחיבור למערכת התשלומים." : "Error connecting to payment system.");
    } finally {
      setLoadingId(null);
    }
  };

  const packages = [
    { 
      id: 'spark', 
      name: language === 'he' ? 'THE SPARK' : 'THE SPARK',
      subtitle: language === 'he' ? 'הניצוץ' : 'The Spark',
      img: SITE_IMAGES.spark_package,
      price: '₪249'
    },
    { 
      id: 'velvet', 
      name: language === 'he' ? 'THE VELVET' : 'THE VELVET',
      subtitle: language === 'he' ? 'הקטיפה' : 'The Velvet',
      img: SITE_IMAGES.velvet_package,
      price: '₪399'
    },
    { 
      id: 'ecstasy', 
      name: language === 'he' ? 'THE ECSTASY' : 'THE ECSTASY',
      subtitle: language === 'he' ? 'האקסטזה' : 'The Ecstasy',
      img: SITE_IMAGES.ecstasy_package,
      price: '₪549'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-brand-black/95 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-6xl bg-brand-black rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(198,167,111,0.25)] border border-brand-gold/20 flex flex-col max-h-[95vh]"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 z-30 p-2 bg-black/40 hover:bg-brand-gold hover:text-brand-black backdrop-blur-md rounded-full text-brand-gold transition-all duration-300"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden">
              {/* Left Side: Branding & Info */}
              <div className="w-full lg:w-1/3 p-8 md:p-12 bg-gradient-to-b from-brand-black to-brand-black/90 flex flex-col justify-center border-b lg:border-b-0 lg:border-l border-brand-gold/10">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="text-brand-gold" size={20} />
                      <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-brand-gold">
                        {language === 'he' ? 'השקה בלעדית' : 'Exclusive Launch'}
                      </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight tracking-tight">
                      {language === 'he' ? 'המארזים החדשים של BYOND' : 'The New BYOND Packages'}
                    </h2>
                    <p className="text-white/60 italic font-light leading-relaxed">
                      {language === 'he' 
                        ? 'חוויה זוגית של פעם בחיים המשלבת תוכן עמוק, משימות מודרכות ומוצרי פרימיום.'
                        : 'A once-in-a-lifetime couple experience combining deep content, guided missions, and premium products.'}
                    </p>
                  </div>

                  <div className="pt-4">
                    <Link
                      to="/experience"
                      onClick={closeModal}
                      className="inline-flex items-center gap-2 text-brand-gold text-sm tracking-widest uppercase hover:underline group"
                    >
                      {language === 'he' ? 'לפרטים המלאים על כל מארז' : 'Full details for each package'}
                      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Side: Direct Purchase Grid */}
              <div className="w-full lg:w-2/3 p-8 md:p-12 bg-brand-black/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                  {packages.map((pkg) => (
                    <motion.div
                      key={pkg.id}
                      whileHover={{ y: -10 }}
                      className="bg-white/5 border border-brand-gold/10 rounded-3xl overflow-hidden flex flex-col group hover:border-brand-gold/40 transition-all duration-500"
                    >
                      <div className="aspect-[4/5] relative overflow-hidden">
                        <img 
                          src={pkg.img} 
                          alt={pkg.name} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <span className="text-[8px] tracking-[0.3em] uppercase text-brand-gold block mb-1">{pkg.subtitle}</span>
                          <h4 className="text-xl font-serif">{pkg.name}</h4>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-4 mt-auto">
                        <div className="flex justify-between items-center">
                          <span className="text-brand-gold font-serif text-xl">{pkg.price}</span>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">
                            {language === 'he' ? 'מארז פרימיום' : 'Premium Kit'}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handlePurchase(pkg.id, pkg.name)}
                          disabled={loadingId !== null}
                          className="w-full py-3 bg-brand-gold text-brand-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {loadingId === pkg.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <>
                              <ShoppingCart size={14} />
                              {language === 'he' ? 'רכישה מהירה' : 'Quick Buy'}
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <button
                    onClick={closeModal}
                    className="text-white/30 hover:text-white transition-colors text-[10px] tracking-[0.2em] uppercase font-bold"
                  >
                    {language === 'he' ? 'אולי אחר כך, אני רוצה להמשיך באתר' : 'Maybe later, I want to continue browsing'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

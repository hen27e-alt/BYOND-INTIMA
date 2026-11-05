import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('beyond_intima_disclaimer_accepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('beyond_intima_disclaimer_accepted', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/90 backdrop-blur-sm p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-brand-cream max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12 border border-brand-gold/20 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="text-brand-gold" size={32} />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif mb-2">כתב ויתור והגבלת אחריות</h2>
              <p className="text-brand-gold tracking-widest uppercase text-xs">Beyond Intima</p>
            </div>

            <div className="space-y-6 text-sm text-brand-black/70 leading-relaxed text-right font-light mb-10">
              <p>
                <strong>1. כללי ומהות השירות:</strong> התכנים, המשימות, המשחקים והמוצרים המוצעים באתר Beyond Intima (להלן: "האתר") ובמארזים הפיזיים נועדו למטרות בידור, פנאי והעשרה חווייתית בלבד. מפעיל האתר אינו איש מקצוע בתחומי בריאות הנפש, טיפול זוגי או ייעוץ מיני מוסמך, ואין לראות בתכנים המועברים משום ייעוץ מקצועי, טיפולי או אבחנתי מכל סוג שהוא.
              </p>
              <p>
                <strong>2. העדר אחריות מקצועית:</strong> השימוש באתר ובמארזים אינו מהווה תחליף לייעוץ זוגי, פסיכולוגי, רפואי או סקסולוגי פרטני המותאם לצרכי המשתמש. למען הסר ספק, מפעיל האתר לא יישא באחריות לכל תוצאה, ישירה או עקיפה, הנובעת מהסתמכות על המידע או על המשימות המוצעים, ואלו מבוצעים על דעת המשתמשים בלבד.
              </p>
              <p>
                <strong>3. אחריות המשתמש ובטיחות:</strong> ההחלטה לבצע משימה כלשהי או להשתמש במוצר כלשהו היא באחריותם הבלעדית והמלאה של המשתמשים. המשתמשים מתחייבים להפעיל שיקול דעת, לכבד את גבולות הנוחות של בני זוגם ולהפסיק כל פעילות הגורמת לאי-נוחות פיזית או רגשית. מפעיל האתר לא יהיה אחראי לכל נזק גופני, רגשי או נפשי שייגרם, ככל שייגרם, כתוצאה משימוש לא סביר, חריגה מגבולות הנוחות או אי-הבנה של הוראות המשחק.
              </p>
              <p>
                <strong>4. מוצרים ואביזרים:</strong> האחריות על איכות האביזרים הפיזיים ובטיחותם חלה על יצרני המוצרים המצורפים למארז. יש לקרוא בעיון את הוראות היצרן לפני השימוש. מפעיל האתר אינו אחראי לנזקים הנובעים משימוש לקוי או רשלני במוצרים.
              </p>
              <p>
                <strong>5. סמכות שיפוט:</strong> על תנאים אלו יחולו דיני מדינת ישראל, וסמכות השיפוט הבלעדית תהא לבתי המשפט המוסמכים במחוז הצפון/חיפה.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleAccept}
                className="w-full py-4 bg-brand-black text-white text-sm tracking-[0.2em] uppercase hover:bg-brand-gold transition-colors duration-500 font-medium"
              >
                אני מאשר/ת כי אני מעל גיל 18 ומסכים/ה לתנאים
              </button>
              <button
                onClick={() => window.location.href = 'https://google.com'}
                className="w-full py-4 border border-brand-black/10 text-brand-black/40 text-xs tracking-widest uppercase hover:text-brand-black transition-colors"
              >
                יציאה מהאתר
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

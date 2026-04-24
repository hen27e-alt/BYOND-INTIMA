import React from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';

import { Facebook, Instagram, MessageCircle, Phone, Gamepad2, Film, Bell, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAlert } from './AlertModal';

import { BRANDING } from '../constants/branding';

export const Footer = () => {
  const [isSubscribeOpen, setIsSubscribeOpen] = React.useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = React.useState(false);
  const { profile } = useFirebase();
  const { showAlert } = useAlert();
  const isAdmin = profile?.role === 'admin' || profile?.email === 'hen27e@gmail.com';

  return (
    <footer className="bg-brand-cream border-t border-brand-gold/10 py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-right">
        {/* Column 1: About */}
        <div className="space-y-6">
          <Link to="/" className="text-2xl font-serif tracking-[0.2em] font-light block">
            BYOND <span className="text-brand-gold">INTIMA</span>
          </Link>
          <p className="text-sm text-brand-black/50 max-w-xs leading-relaxed">
            סטודיו לחוויות זוגיות מודרכות. <br />
            יוקרה שקטה, עומק רגשי ובגרות.
          </p>
        </div>
        
        {/* Column 2: Navigation */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] mb-6 font-bold text-brand-gold">ניווט</h4>
          <ul className="space-y-4 text-sm text-brand-black/60">
            <li><Link to="/experience" className="hover:text-brand-gold transition-colors">קולקציית Experience</Link></li>
            <li><Link to="/boutique" className="hover:text-brand-gold transition-colors">הבוטיק שלנו</Link></li>
            <li><Link to="/dashboard" className="hover:text-brand-gold transition-colors">אזור אישי</Link></li>
            <li><Link to="/about" className="hover:text-brand-gold transition-colors">אודות</Link></li>
            <li><Link to="/contact" className="hover:text-brand-gold transition-colors">צור קשר</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact & Social */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] mb-6 font-bold text-brand-gold">צור קשר</h4>
          <ul className="space-y-4 text-sm text-brand-black/60 mb-8">
            <li className="text-xs opacity-70">
              <a href={`mailto:${BRANDING.email}`} className="hover:text-brand-gold transition-colors">
                {BRANDING.email}
              </a>
            </li>
            <li><button onClick={() => setIsDisclaimerOpen(true)} className="hover:text-brand-gold transition-colors">דיסקליימר</button></li>
            <li><Link to="/legal" className="hover:text-brand-gold transition-colors">תקנון ותנאי שימוש</Link></li>
          </ul>
          <div className="flex gap-3 justify-start flex-row-reverse">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-brand-gold/5 rounded-full flex items-center justify-center text-brand-black/40 hover:text-brand-gold hover:bg-brand-gold/10 transition-all"><Facebook size={14} /></a>
            <a href={BRANDING.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-brand-gold/5 rounded-full flex items-center justify-center text-brand-black/40 hover:text-brand-gold hover:bg-brand-gold/10 transition-all"><Instagram size={14} /></a>
            <a href={`https://wa.me/${BRANDING.whatsapp.replace(/-/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-brand-gold/5 rounded-full flex items-center justify-center text-brand-black/40 hover:text-brand-gold hover:bg-brand-gold/10 transition-all"><MessageCircle size={14} /></a>
            <a href="tel:+" className="w-8 h-8 bg-brand-gold/5 rounded-full flex items-center justify-center text-brand-black/40 hover:text-brand-gold hover:bg-brand-gold/10 transition-all"><Phone size={14} /></a>
          </div>
        </div>

        {/* Column 4: Newsletter */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] mb-6 font-bold text-brand-gold">Newsletter</h4>
          <p className="text-xs text-brand-black/50 mb-4">הצטרפו לקהילה שלנו וקבלו עדכונים בלעדיים.</p>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); showAlert('תודה על ההרשמה!'); }}>
            <input 
              type="email" 
              placeholder="אימייל" 
              className="w-full bg-white border border-brand-gold/10 px-4 py-2 text-xs focus:outline-none focus:border-brand-gold rounded-xl"
              required
            />
            <button className="w-full btn-premium !py-2 text-[10px]">
              הרשמה
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {isDisclaimerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDisclaimerOpen(false)}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-brand-cream p-12 shadow-2xl border border-brand-gold/20 max-h-[80vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsDisclaimerOpen(false)}
                className="absolute top-6 right-6 text-brand-black/40 hover:text-brand-black transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="text-right">
                <h3 className="text-2xl font-serif mb-8">כתב ויתור והגבלת אחריות (Disclaimer) – Beyond Intima</h3>
                <div className="space-y-6 text-sm text-brand-black/70 leading-relaxed">
                  <p>
                    1. כללי ומהות השירות: התכנים, המשימות, המשחקים והמוצרים המוצעים באתר Beyond Intima ובמארזים הפיזיים נועדו למטרות בידור, פנאי והעשרה חווייתית בלבד. מפעיל האתר אינו איש מקצוע בתחומי בריאות הנפש, טיפול זוגי או ייעוץ מיני מוסמך, ואין לראות בתכנים המועברים משום ייעוץ מקצועי, טיפולי או אבחנתי מכל סוג שהוא.
                  </p>
                  <p>
                    2. העדר אחריות מקצועית: השימוש באתר ובמארזים אינו מהווה תחליף לייעוץ זוגי, פסיכולוגי, רפואי או סקסולוגי פרטני המותאם לצרכי המשתמש. למען הסר ספק, מפעיל האתר לא יישא באחריות לכל תוצאה, ישירה או עקיפה, הנובעת מהסתמכות על המידע או על המשימות המוצעים, ואלו מבוצעים על דעת המשתמשים בלבד.
                  </p>
                  <p>
                    3. אחריות המשתמש ובטיחות: ההחלטה לבצע משימה כלשהי או להשתמש במוצר כלשהו היא באחריותם הבלעדית והמלאה של המשתמשים. המשתמשים מתחייבים להפעיל שיקול דעת, לכבד את גבולות הנוחות של בני זוגם ולהפסיק כל פעילות הגורמת לאי-נוחות פיזית או רגשית. מפעיל האתר לא יהיה אחראי לכל נזק גופני, רגשי או נפשי שייגרם, ככל שייגרם, כתוצאה משימוש לא סביר, חריגה מגבולות הנוחות או אי-הבנה של הוראות המשחק.
                  </p>
                  <p>
                    4. מוצרים ואביזרים: האחריות על איכות האביזרים הפיזיים ובטיחותם חלה על יצרני המוצרים המצורפים למארז. יש לקרוא בעיון את הוראות היצרן לפני השימוש. מפעיל האתר אינו אחראי לנזקים הנובעים משימוש לקוי או רשלני במוצרים.
                  </p>
                  <p>
                    5. סמכות שיפוט: על תנאים אלו יחולו דיני מדינת ישראל, וסמכות השיפוט הבלעדית תהא לבתי המשפט המוסמכים במחוז הצפון/חיפה.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-brand-gold/5 flex flex-col items-center gap-6">
        <p className="text-[10px] uppercase tracking-widest text-brand-black/30 text-center">
          © 2026 BYOND INTIMA. ALL RIGHTS RESERVED.
        </p>
        {isAdmin && (
          <Link 
            to="/admin" 
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-gold hover:text-brand-black transition-colors"
          >
            <ShieldCheck size={14} />
            פאנל ניהול
          </Link>
        )}
      </div>
    </footer>
  );
};

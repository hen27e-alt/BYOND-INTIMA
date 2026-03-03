import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-brand-cream border-t border-brand-gold/10 py-20 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <Link to="/" className="text-2xl font-serif tracking-[0.2em] font-light mb-6 block">
            BYOND <span className="text-brand-gold">INTIMA</span>
          </Link>
          <p className="text-sm text-brand-black/50 max-w-xs leading-relaxed">
            סטודיו לחוויות זוגיות מודרכות. <br />
            יוקרה שקטה, עומק רגשי ובגרות.
          </p>
        </div>
        
        <div>
          <h4 className="text-xs tracking-widest uppercase mb-6 font-medium">ניווט</h4>
          <ul className="space-y-4 text-sm text-brand-black/60">
            <li><Link to="/experience" className="hover:text-brand-gold transition-colors">קולקציית Experience</Link></li>
            <li><Link to="/journey" className="hover:text-brand-gold transition-colors">The Journey</Link></li>
            <li><Link to="/dashboard" className="hover:text-brand-gold transition-colors">אזור אישי</Link></li>
            <li><Link to="/about" className="hover:text-brand-gold transition-colors">אודות</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-widest uppercase mb-6 font-medium">צור קשר</h4>
          <ul className="space-y-4 text-sm text-brand-black/60">
            <li>hello@byondintima.com</li>
            <li>Instagram</li>
            <li>WhatsApp</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-12 border-t border-brand-gold/10">
        <div className="bg-brand-gold/5 p-8 text-[11px] text-brand-black/50 leading-relaxed text-right space-y-4">
          <h5 className="font-serif text-sm text-brand-black mb-4">כתב ויתור והגבלת אחריות (Disclaimer) – Beyond Intima</h5>
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
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-brand-gold/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] uppercase tracking-widest text-brand-black/30">
          © 2026 BYOND INTIMA. ALL RIGHTS RESERVED.
        </p>
        <div className="flex gap-8 text-[10px] uppercase tracking-widest text-brand-black/30">
          <a href="#" className="hover:text-brand-gold">Privacy Policy</a>
          <a href="#" className="hover:text-brand-gold">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

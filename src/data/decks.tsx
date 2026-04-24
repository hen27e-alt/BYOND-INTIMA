import React from 'react';
import { HelpCircle, Zap, Heart, Moon, Sun, Map } from 'lucide-react';

export interface Deck {
  id: string;
  name: string;
  description: string;
  perfectFor: string[];
  contents: string;
  color: string;
  icon: React.ReactNode;
  category: string;
  price: number;
  longDescription?: string;
  features?: string[];
}

export const cardDecks: Deck[] = [
  {
    id: 'true',
    name: 'אמת',
    description: 'מסע אל עומק הכנות. מרחב בטוח לחשיפת האמת הפנימית וליצירת חיבורים משמעותיים דרך שיח בוגר ומעמיק.',
    longDescription: 'חפיסת "אמת" נוצרה כדי לשבור את הקרח בצורה משמעותית. היא לא רק משחק, אלא כלי ליצירת אינטימיות רגשית. דרך שאלות שנבחרו בקפידה, החפיסה מזמינה אתכם לחקור נושאים של פגיעות, חלומות, וערכים אישיים.',
    features: ['40 קלפי שאלה מעוררי מחשבה', '10 קלפי מסתורין עם תפניות מפתיעות', 'מתאים לזוגות חדשים וותיקים כאחד', 'עיצוב פרימיום מינימליסטי'],
    perfectFor: ['חברים', 'דייטים', 'היכרות'],
    contents: '40 קלפי שאלה + 10 קלפי מסתורין',
    color: '#3B82F6',
    icon: <HelpCircle size={32} />,
    category: 'חברים',
    price: 119
  },
  {
    id: 'nasty',
    name: 'נועז',
    description: 'חקירה נועזת של גבולות ותשוקה. שיח בוגר, ישיר ונטול עכבות המזמין אתכם לגלות רבדים חדשים של אינטימיות.',
    longDescription: 'חפיסת "נועז" מיועדת לאלו שלא מפחדים לשאול את השאלות הקשות ולחקור את הגבולות שלהם. היא משלבת אתגרים פיזיים ורגשיים שנועדו להצית את התשוקה ולחזק את האמון ההדדי.',
    features: ['40 קלפי אתגר נועזים', '10 קלפי מסתורין משני משחק', 'שיח פתוח על מיניות ותשוקה', 'חוויה אינטנסיבית ובלתי נשכחת'],
    perfectFor: ['מסיבות', 'ראש פתוח'],
    contents: '40 קלפי אתגר + 10 קלפי מסתורין',
    color: '#EF4444',
    icon: <Zap size={32} />,
    category: 'מסיבות',
    price: 129
  },
  {
    id: 'quick',
    name: 'מהיר',
    description: 'רגעים של קלילות איכותית. אתגרים מהירים שנועדו לעורר את החושים ולהכניס אנרגיה תוססת לכל מפגש חברתי.',
    perfectFor: ['מסיבות', 'כיף מהיר'],
    contents: '40 אתגרים מהירים + 10 קלפי מסתורין',
    color: '#F59E0B',
    icon: <Zap size={32} />,
    category: 'מסיבות',
    price: 99
  },
  {
    id: 'quickie',
    name: 'קליק',
    description: 'לחישה של קרבה. מחוות קטנות ואינטימיות שנועדו להצית את הניצוץ הזוגי בתוך השגרה היומיומית.',
    perfectFor: ['זוגות', 'ערבי דייט'],
    contents: '40 אתגרי זוגות + 10 קלפי מסתורין',
    color: '#EC4899',
    icon: <Heart size={32} />,
    category: 'זוגות',
    price: 139,
    longDescription: 'חפיסת "קליק" נועדה להחזיר את הניצוץ לשגרה היומיומית. היא כוללת משימות קטנות, מחוות מרגשות ושאלות קלילות שניתן לשלב בכל רגע ביום כדי להזכיר אחד לשנייה כמה אתם אוהבים.',
    features: ['40 אתגרי זוגות מהירים', '10 קלפי מסתורין מפתיעים', 'מתאים לביצוע תוך כדי שגרה', 'חיזוק החיבור היומיומי']
  },
  {
    id: 'night',
    name: 'לילה',
    description: 'שיח לילי מהדהד. הזמנה לצלילה אל תוך עולמות הרגש והמחשבה תחת מעטה הלילה השקט.',
    perfectFor: ['זוגות', 'שיחות עומק'],
    contents: '40 קלפי לילה + 10 קלפי מסתורין',
    color: '#4338CA',
    icon: <Moon size={32} />,
    category: 'זוגות',
    price: 149,
    longDescription: 'חפיסת "לילה" היא ההזמנה שלכם לשיחות הכי עמוקות וכנות בסוף היום. כשהעולם נרגע, זה הזמן לצלול פנימה ולגלות רבדים חדשים בנפש של בן/בת הזוג.',
    features: ['40 קלפי שיח מעמיקים', '10 קלפי מסתורין לאווירה לילית', 'שאלות על חלומות ופחדים', 'יצירת מרחב בטוח ואינטימי']
  },
  {
    id: 'morning',
    name: 'בוקר',
    description: 'התעוררות של רכות ושמחה. פתיחת יום משותפת המשלבת הומור עדין וחיבור רגשי עמוק.',
    perfectFor: ['זוגות', 'סופי שבוע'],
    contents: '40 קלפי בוקר + 10 קלפי מסתורין',
    color: '#F97316',
    icon: <Sun size={32} />,
    category: 'זוגות',
    price: 119
  },
  {
    id: 'outside',
    name: 'בחוץ',
    description: 'הרפתקה של גילוי משותף. יציאה אל המרחב הפתוח לחקירה פנימית וחיצונית המרחיבה את אופקי הקשר.',
    perfectFor: ['טיולים', 'דייטים בחוץ'],
    contents: '40 אתגרי חוץ + 10 קלפי מסתורין',
    color: '#10B981',
    icon: <Map size={32} />,
    category: 'חברים',
    price: 129
  },
  { 
    id: 'kitchen-1', 
    name: 'סימפוניית טעמים', 
    description: 'הרמוניה קולינרית זוגית. יצירה משותפת במטבח שהופכת כל ארוחה לטקס של חיבור וטעם.', 
    perfectFor: ['זוגות', 'בישול'],
    contents: 'משימת מטבח: רמה בינונית / 45 דקות', 
    color: '#10B981', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
        <path d="M12 2v20M2 12h20M7 7l10 10M17 7L7 10" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ), 
    category: 'משימות מטבח',
    price: 49
  },
  { 
    id: 'kitchen-2', 
    name: 'טעימה עיוורת', 
    description: 'התמסרות לחושים. חוויה חושית מעמיקה המזמינה אתכם לסמוך, להרגיש ולגלות מחדש אחד את השנייה.', 
    perfectFor: ['זוגות', 'חושים'],
    contents: 'משימת מטבח: רמה קלה / 20 דקות', 
    color: '#F59E0B', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
        <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8Z" />
        <path d="M6 12h12M10 9l4 6M14 9l-4 6" strokeLinecap="round" />
      </svg>
    ), 
    category: 'משימות מטבח',
    price: 39
  },
  { 
    id: 'kitchen-3', 
    name: 'סודות השף', 
    description: 'גילוי רבדים נסתרים דרך יצירה קולינרית. אתגר המשלב יצירתיות, שיתוף פעולה ושיח מעמיק.', 
    perfectFor: ['זוגות', 'יצירתיות'],
    contents: 'משימת מטבח: רמה גבוהה / 60 דקות', 
    color: '#4338CA', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
        <path d="M6 13.8V4a2 2 0 1 1 4 0v9.8a3 3 0 1 1-4 0Z" />
        <path d="M9 17h.01" />
      </svg>
    ), 
    category: 'משימות מטבח',
    price: 59
  },
  { 
    id: 'kitchen-4', 
    name: 'קינוח אינטימי', 
    description: 'סיום מתוק ליום משותף. משימה המוקדשת כולה לפינוק, רכות וחיבור רגשי דרך טעמים מתוקים.', 
    perfectFor: ['זוגות', 'פינוק'],
    contents: 'משימת מטבח: רמה קלה / 30 דקות', 
    color: '#EC4899', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path d="M12 7v5l3 3" />
      </svg>
    ), 
    category: 'משימות מטבח',
    price: 45
  },
  { 
    id: 'kitchen-5', 
    name: 'בוקר של טעמים', 
    description: 'התחלה רעננה ומזינה. יצירת ארוחת בוקר משותפת המעוררת את החושים ומכינה את הקרקע ליום של קרבה.', 
    perfectFor: ['זוגות', 'בוקר'],
    contents: 'משימת מטבח: רמה בינונית / 40 דקות', 
    color: '#F97316', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z" />
        <path d="M12 8v4l3 3" />
      </svg>
    ), 
    category: 'משימות מטבח',
    price: 49
  }
];

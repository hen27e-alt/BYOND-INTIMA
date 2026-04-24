import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RotateCw, Sparkles, Heart, Home, Bed, Utensils, Sofa, Bath } from 'lucide-react';

interface Zone {
  id: string;
  he: string;
  color: string;
  icon: React.ReactNode;
}

const ZONES: Record<string, Zone> = {
  bedroom: { id: 'bedroom', he: 'חדר שינה', color: '#8B3058', icon: <Bed size={20} /> },
  kitchen: { id: 'kitchen', he: 'מטבח', color: '#A0522D', icon: <Utensils size={20} /> },
  salon: { id: 'salon', he: 'סלון', color: '#2C4888', icon: <Sofa size={20} /> },
  spa: { id: 'spa', he: 'ספא', color: '#5B3A7E', icon: <Bath size={20} /> },
};

interface Property {
  id: string;
  name: string;
  zone: string;
  price: number;
  gold: string;
  missions: string[];
}

const PROPERTIES: Property[] = [
  { id:'lachishat-layla',   name:'לחישת לילה',   zone:'bedroom', price:60,
    gold:'בקנייה: לחשו משהו לאוזן המוכר',
    missions:['לחשו שם חיבה שאף אחד אחר לא קורא לכם','ספרו בלחישה מה הרגע הכי טוב שהיה לכם השבוע','לחשו דבר שמפחיד אתכם — ורק הם ישמעו','אמרו בלחישה מה אתם הכי אוהבים בשני','ספרו סוד קטן שלא סיפרתם לאף אחד','לחשו מה אתם חולמים לעשות ביחד'] },
  { id:'mega-rishon',       name:'מגע ראשון',     zone:'bedroom', price:60,
    gold:'בקנייה: עצמו עיניים 10 שניות ביחד',
    missions:['מגע על היד — האצבעות בלבד, 30 שניות','הניחו יד על הלחי, עיניים עצומות','מגע על הכתף — לאט, מודע, שקט','החזיקו את שתי ידי השני — בלי לזוז','מגע על המצח — כמו ברכה','שלשו אצבעות — שקט מוחלט, דקה שלמה'] },
  { id:'mega-adeen',        name:'מגע עדין',      zone:'bedroom', price:300,
    gold:'בקנייה: תנו מגע קצר על היד',
    missions:['עיסוי כתפיים 3 דקות — לאט, בלי לדבר','עיסוי קרקפת 2 דקות — עיניים עצומות','עיסוי כפות הרגליים — דקה לכל כף','עיסוי גב עליון עם קצות האצבעות, 3 דקות','עיסוי ידיים וציפורניים, 2 דקות לכל יד','עיסוי עדין על הפנים — ללא מילים, 2 דקות'] },
  { id:'kareet-ushmicha',   name:'כרית ושמיכה',   zone:'bedroom', price:300,
    gold:'בקנייה: 30 שניות שקט מוחלט ביחד',
    missions:['5 דקות בלי טלפון — כל אחד שוכב בנוח','שכבו ביחד, ראש על כתף, דקה שקטה','ספרו לשני על החלום הכי מוזר שחלמתם','כל אחד אומר מה הוא צריך כרגע — בלי לשפוט','הדליקו מוזיקה שקטה, עצמו עיניים 3 דקות','ספרו על רגע שהרגשתם הכי בטוחים בחיים'] },
  { id:'sod-bachoshech',    name:'סוד בחושך',      zone:'bedroom', price:320,
    gold:'בקנייה: ספרו מה אתם הכי מפחדים לאבד',
    missions:['כבו אורות — ספרו מה אתם רוצים שיהיה אחרת','בחושך: אמרו דבר שאתם מתביישים בו לבד','בחושך: ספרו על רגע שרציתם לברוח','בחושך: אמרו מה אתם מסתירים אפילו מעצמכם','בחושך: ספרו מה הייתם עושים אם לא הייתם פוחדים','בחושך: אמרו דבר שאף אחד לא יודע שאתם צריכים'] },
  { id:'chibuk-aroch',      name:'חיבוק ארוך',    zone:'bedroom', price:350,
    gold:'בקנייה: חיבוק קצר — 10 שניות',
    missions:['חיבוק עד שאחד מכם נושם לאט יותר','חיבוק מאחור — מי שמחבק מוסר בשקט','חיבוק עמידה, ראש על כתף, עיניים עצומות','חיבוק על הרצפה — בלי כיסאות, 2 דקות','חיבוק עם נשיקה על המצח בסוף','חיבוק בשקט — לא מפסיקים לפני 90 שניות'] },
  { id:'layla-kasoom',      name:'לילה קסום',     zone:'bedroom', price:400,
    gold:'בקנייה: אמרו "תודה" על דבר ספציפי',
    missions:['תכננו יחד ערב שלם — מה, איפה, איך','כל אחד אומר דבר אחד שרוצה שיקרה הלילה','תארו ביחד ארוחת ערב חלומית מהחל ועד כלה','כל אחד כותב על נייר רצון אחד ומחליפים','תכננו יום הולדת מפתיע לשני — בקול','ספרו מה הלילה הכי קסום שחוויתם ביחד'] },
  { id:'cheder-hadimyon',   name:'חדר הדמיון',    zone:'bedroom', price:400,
    gold:'בקנייה: כל אחד מציע בריחה אחת',
    missions:['תארו בית חלומות מהחל ועד כלה — כל חדר','תכננו חופשה שאין לכם תקציב אליה','תארו את הגרסה הטובה ביותר של חייכם','תכננו שנת שבתון — לאן, מה, עם מי','תארו יום שלם מושלם מהבוקר לערב','המציאו כפר נופש משלכם — שם, חוקים, מה יש שם'] },
  { id:'aruchat-boker',     name:'ארוחת בוקר',    zone:'kitchen', price:100,
    gold:'בקנייה: המוכר מציע שתייה לקונה',
    missions:['אחד מכין קפה, השני לא קם עד שמגישים','ארוחת בוקר במיטה — מי שנוחת קודם מגיש','כל אחד מכין הפתעה מתוקה לשני','שתפו תמונה של ארוחת הבוקר האהובה עליכם','בשלו ביצים ביחד — בלי להסכים על איך','הכינו ארוחת בוקר בשקט מוחלט — רק מוזיקה'] },
  { id:'chef-veshafeet',    name:'שף ושפית',      zone:'kitchen', price:100,
    gold:'בקנייה: הקונה מכתיב פינוק קטן עכשיו',
    missions:['אחד מכתיב — כפית דבש מהיד שלי','כל אחד מכין מנה עם עיניים עצומות בשלב אחד','טעמו ביחד משהו חדש שמעולם לא ניסיתם','אחד מכתיב, השני מבצע — בלי לערער ולא לשאול','בשלו מנה ובכל ערבוב — נשיקה קצרה','ענו ביחד: מה הייתם מגישים אם היה לכם מסעדה?'] },
  { id:'arucha-beyayin',    name:'ארוחה ביין',    zone:'kitchen', price:120,
    gold:'בקנייה: לחיים עם סיבה אחת אמיתית',
    missions:['מזגו, שתו רק אחרי שאמרתם לחיים עם סיבה','ספרו על הארוחה הכי רומנטית שהייתה לכם','כל אחד בוחר שיר לרקע — מוזיקה לאורך הארוחה','ארוחה בנרות — טלפונים בחדר אחר','כל ביס — מחמאה אחת לשני על הבישול','אם הייתם פותחים מסעדה — מה הייתה קוראת?'] },
  { id:'bishul-romantee',   name:'בישול רומנטי',  zone:'kitchen', price:140,
    gold:'בקנייה: האכילו את השני בנשנוש קטן',
    missions:['בשלו ביחד בלי לדבר — רק מחוות','כל אחד מוסיף מרכיב מפתיע — הסכימו בסוף','חובה לטעום מהיד של השני לפחות פעמיים','כל אחד בוחר מוזיקה לחצי מהבישול','בשלו משהו שאחד מהשניים לא אהב בילדות','כל ערבוב — ספרו דבר שאתם אסירי תודה עליו'] },
  { id:'seehat-lev',        name:'שיחת לב',       zone:'salon', price:220,
    gold:'בקנייה: שאלו שאלה שמסקרנת אתכם',
    missions:['שאלה שתמיד רציתם לשאול — עכשיו','ספרו על חוויה שצמחתם ממנה הכי הרבה','מה הדבר שאתם הכי מפחדים שהשני לא יודע?','ספרו על אדם שהשפיע עליכם שהשני לא מכיר','מה הייתם עושים אחרת אם יכולתם לחזור 5 שנים?','ספרו על רגע שהשני הפתיע אתכם לחלוטין'] },
  { id:'emet-o-haaza',      name:'אמת או העזה',   zone:'salon', price:240,
    gold:'בקנייה: אמרו דבר שמעריצים בשני',
    missions:['אמת: מה הדבר שהכי קשה לכם לומר?','העזה: הציעו דבר שמעולם לא העזתם להציע','אמת: מתי הרגשתם הכי לבד — גם בזוגיות?','העזה: ספרו פנטזיה שיש לכם לגבי השני','אמת: מה הייתם רוצים שיהיה שונה בינינו?','קחו את השני ליד ואמרו משפט שמאיר אותו'] },
  { id:'sheloshim-shniyor', name:'30 שניות',       zone:'salon', price:260,
    gold:'בקנייה: 5 שניות מבט עיניים',
    missions:['30 שניות מבט — מי שמחייך ראשון משלם ♥20','30 שניות ידיים מחוברות, עיניים פקוחות','30 שניות: כל אחד אומר מה הוא רואה בעיני השני','30 שניות: אחד מדבר, השני לא מפסיק להסתכל','30 שניות שקט מוחלט — ואז נשיקה','30 שניות: ספרו לשני מה הוא מקרין כרגע'] },
  { id:'mishak-klafeem',    name:'משחק קלפים',    zone:'salon', price:260,
    gold:'בקנייה: המוכר בוחר אתגר לקונה',
    missions:['יד אחת — המפסיד מציע פינוק לזוכה','שחקו עם הימור: המפסיד מספר סוד','כל יד שמפסידים — עונה על שאלה אישית','שחקו ב-"מי אני" — כל אחד מנחש דמות של השני','יד אחת: הזוכה קובע את הערב','שחקו ב-war — כל קלף שנוצח, נשיקה אחת'] },
  { id:'rikud-basalon',     name:'ריקוד בסלון',   zone:'salon', price:300,
    gold:'בקנייה: הניחו יד על הכתף 10 שניות',
    missions:['שיר שלם — ריקוד, אין בריחה לאמצע','כל אחד בוחר שיר — ריקוד לשניהם ביחד','רקדו עם עיניים עצומות — שלא ייפגשו','ריקוד איטי, ראש על כתף, בלי מילים','כל אחד מלמד את השני תנועה אחת','רקדו כמו שרקדתם בפעם הראשונה'] },
  { id:'seret-beyachad',    name:'סרט ביחד',      zone:'salon', price:320,
    gold:'בקנייה: כל אחד מציע סרט אחד',
    missions:['כל אחד מציע ז\'אנר — מטילים מטבע','נשיקה בכל פרסומת','כל אחד מנחש מה יקרה בסוף הסרט','שתו שוט בכל פעם שמישהו בסרט בוכה','אחרי הסרט: כל אחד אומר מה הזכיר לו משניהם','ספרו על הסרט שהכי השפיע עליכם — למה'] },
  { id:'isuy-yadaim',       name:'עיסוי ידיים',   zone:'spa', price:140,
    gold:'בקנייה: עיסוי קצר בכפות הידיים',
    missions:['2 דקות לכל יד — שקט מוחלט','עיסוי ידיים עם שמן — קצות האצבעות בלבד','כל אצבע לחוד — לאט, מודע, 3 שניות כל אחת','ידיים מחוברות — אחד מעסה, השני עיניים עצומות','עיסוי פרק כף היד — ספרו מה אתם מרגישים','2 דקות לכל יד ואחר כך שתו תה ביחד'] },
  { id:'ambatyat-prachim',  name:'אמבטיית פרחים', zone:'spa', price:140,
    gold:'בקנייה: תארו ריח שמזכיר לכם את השני',
    missions:['מלאו אמבטיה — מי שנכנס ראשון בוחר מוזיקה','הוסיפו מלח ים ושמן — שכבו 10 דקות בשקט','ספרו באמבטיה על ילדות — רגע מים','כל אחד מביא נר אחד — ומדליק','אמבטיה בשקט — טלפונים בחוץ, 15 דקות','אחרי האמבטיה: עטיפה בשמיכה וסיפור קצר'] },
  { id:'nerot-veisuy',      name:'נרות ועיסוי',   zone:'spa', price:160,
    gold:'בקנייה: ספרו דבר שעשה לכם טוב השבוע',
    missions:['הדליקו נר — ספרו מה מאיר אתכם כרגע','נר + עיסוי גב קצר — 5 דקות, שקט','כל אחד בוחר ריח — מה הוא מרגיש?','עיסוי ידיים לאור נר — בלי אורות אחרים','הדליקו נר — כל אחד אומר רצון אחד בקול','לאור נר: כל אחד כותב משפט על השני ומחליפים'] },
  { id:'masket-panim',      name:'מסכת פנים',     zone:'spa', price:180,
    gold:'בקנייה: עצמו עיניים — השני אומר מה הוא רואה',
    missions:['מסכה על הפנים — 10 דקות שקט, עיניים עצומות','מסכה ביחד — מי שמצחיק ראשון משלם ♥20','תוך כדי המסכה: ספרו על חלום שיש לכם','מסכה + מוזיקה — כל אחד בוחר שיר','מסכה בחושך מוחלט — 10 דקות בשקט','אחרי המסכה: אחד מורח קרם לשני'] },
  { id:'shemen-nichuchot',  name:'שמן ניחוחות',   zone:'spa', price:200,
    gold:'בקנייה: המוכר מעסה כתף הקונה דקה',
    missions:['עיסוי גב 5 דקות — אסור להפסיק לפני הזמן','שמן על הידיים — עיסוי ראש 3 דקות','כל אחד בוחר ריח — מה זה מעלה בזיכרון?','עיסוי כתפיים עמוק — 5 דקות, בלי מילים','שמן על הרגליים — עיסוי כפות, 2 דקות לכל כף','עיסוי פנים עדין — קצות אצבעות, 3 דקות, עיניים עצומות'] },
  { id:'jacuzzi-prati',     name:"ג'קוזי פרטי",   zone:'spa', price:220,
    gold:'בקנייה: כל אחד מחליט פינוק שרוצה לקבל',
    missions:['תארו ביחד ספא חלומי מהחל ועד כלה','כל אחד מתכנן טיפול מלא לשני — ומגיש','ספרו מהו הרגע הכי מפנק שחוויתם ביחד','המציאו שם לספא משלכם — מה יש שם?','כתבו יחד תפריט טיפולים — אחד לכל אחד','ההזמנה: מי מפסיד ב"דגל" — מממן'] },
];

const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

export const MissionGame = () => {
  const [view, setView] = useState<'home' | 'zone' | 'property'>('home');
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);
  const [currentProp, setCurrentProp] = useState<Property | null>(null);
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  const rollMission = () => {
    if (!currentProp) return;
    setIsRolling(true);
    
    // Simulate rolling animation
    setTimeout(() => {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * currentProp.missions.length);
      } while (nextIdx === currentMissionIdx && currentProp.missions.length > 1);
      
      setCurrentMissionIdx(nextIdx);
      setIsRolling(false);
    }, 400);
  };

  const handleZoneSelect = (zoneId: string) => {
    setCurrentZone(ZONES[zoneId]);
    setView('zone');
  };

  const handlePropSelect = (prop: Property) => {
    setCurrentProp(prop);
    setCurrentMissionIdx(Math.floor(Math.random() * prop.missions.length));
    setView('property');
  };

  const goBack = () => {
    if (view === 'property') setView('zone');
    else if (view === 'zone') setView('home');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-brand-black text-white rounded-3xl shadow-2xl border border-brand-gold/30 relative overflow-hidden" dir="rtl">
      {/* Particles Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ 
              y: '-20px', 
              opacity: [0, 0.2, 0.1, 0],
              rotate: 360 
            }}
            transition={{ 
              duration: 8 + Math.random() * 12, 
              repeat: Infinity, 
              delay: Math.random() * 10,
              ease: "linear"
            }}
            className="absolute text-brand-gold text-[10px]"
            style={{ left: `${Math.random() * 100}%` }}
          >
            {['♥','✦','◈','♡','✧'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center gap-6 w-full"
            >
              <div className="flex flex-col items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], opacity: [1, 0.8, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-4xl text-brand-gold"
                >
                  ♥
                </motion.div>
                <h2 className="text-4xl font-serif font-bold tracking-[0.3em] text-brand-gold">BYOND</h2>
                <p className="text-xs tracking-[0.6em] text-brand-gold/50">INTIMA</p>
              </div>
              
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
              
              <p className="font-serif italic text-brand-gold/80">בחרו זון ואחר כך נכס</p>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                {Object.values(ZONES).map(zone => (
                  <motion.button
                    key={zone.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleZoneSelect(zone.id)}
                    className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-brand-gold/20 rounded-2xl hover:bg-white/10 hover:border-brand-gold transition-all group shadow-sm hover:shadow-brand-gold/20"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                    <span className="text-sm font-bold text-brand-gold/90">{zone.he}</span>
                    <small className="text-[10px] text-brand-gold/40">
                      {PROPERTIES.filter(p => p.zone === zone.id).length} נכסים
                    </small>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'zone' && currentZone && (
            <motion.div
              key="zone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <button onClick={goBack} className="p-2 border border-brand-gold/20 rounded-full text-brand-gold/50 hover:text-brand-gold hover:border-brand-gold transition-all">
                  <ChevronLeft size={20} className="rotate-180" />
                </button>
                <h3 className="text-2xl font-serif" style={{ color: currentZone.color }}>{currentZone.he}</h3>
              </div>

              <div className="flex flex-col gap-2">
                {PROPERTIES.filter(p => p.zone === currentZone.id).map(prop => (
                  <motion.button
                    key={prop.id}
                    whileHover={{ scale: 1.02, x: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePropSelect(prop)}
                    className="flex items-center justify-between p-4 bg-white/5 border border-brand-gold/20 rounded-xl hover:bg-white/10 transition-all group shadow-sm hover:shadow-brand-gold/10"
                    style={{ borderColor: `${currentZone.color}33` }}
                  >
                    <span className="text-xl font-serif font-semibold text-brand-gold/90 group-hover:text-white">{prop.name}</span>
                    <span className="text-sm font-serif" style={{ color: currentZone.color }}>♥{prop.price}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'property' && currentProp && currentZone && (
            <motion.div
              key="property"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
                {/* Card Header */}
                <div className="p-6 pb-4 relative" style={{ backgroundColor: currentZone.color }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60 mb-1">{currentZone.he}</p>
                  <h4 className="text-3xl font-serif font-bold text-white leading-none">{currentProp.name}</h4>
                  <p className="mt-2 text-sm font-serif text-white/60">♥{currentProp.price}</p>
                  <div className="absolute bottom-0 left-4 right-4 h-px bg-white/10" />
                </div>

                {/* Mission Area */}
                <div className="bg-brand-cream p-8 min-h-[220px] flex flex-col items-center justify-center gap-6 text-center relative">
                  <div className="absolute top-4 right-6 text-[10px] font-serif text-brand-black/20 tracking-widest">
                    {currentMissionIdx + 1} / {currentProp.missions.length}
                  </div>
                  
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentMissionIdx}
                      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      className="text-xl font-serif italic text-brand-black leading-relaxed"
                    >
                      {currentProp.missions[currentMissionIdx]}
                    </motion.p>
                  </AnimatePresence>

                  <button 
                    onClick={rollMission}
                    disabled={isRolling}
                    className="flex flex-col items-center gap-1 p-3 px-6 rounded-full border border-brand-black/10 hover:bg-brand-black/5 transition-all group"
                  >
                    <motion.div
                      animate={isRolling ? { rotate: 360, scale: 1.2 } : {}}
                      className="text-2xl text-brand-black"
                    >
                      {DICE_FACES[currentMissionIdx % 6]}
                    </motion.div>
                    <span className="text-[10px] font-bold text-brand-black/40 tracking-widest">משימה חדשה</span>
                  </button>
                </div>

                {/* Gold Condition */}
                <div className="bg-gradient-to-br from-[#1E1408] to-[#2E1E08] p-4 px-6 border-t border-brand-gold/40 flex items-center gap-3">
                  <Sparkles size={14} className="text-brand-gold shrink-0" />
                  <p className="text-[11px] text-brand-gold/80 leading-relaxed">{currentProp.gold}</p>
                </div>

                {/* Card Footer */}
                <div className="p-3 text-center">
                  <span className="text-[8px] tracking-[0.4em] text-brand-black/20 uppercase">BYOND · INTIMA</span>
                </div>
              </div>

              <button onClick={goBack} className="mt-6 px-6 py-2 border border-brand-gold/20 rounded-full text-brand-gold/50 hover:text-brand-gold hover:border-brand-gold transition-all text-xs tracking-widest">
                ← חזרה לנכסים
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

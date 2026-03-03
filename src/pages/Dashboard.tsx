import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Book, Trophy, Star, Lock, ChevronRight, PlusCircle, Download, Heart, Zap, Lightbulb, Image as ImageIcon, ExternalLink, LogIn, RefreshCw, Mic, Play, Search, Sparkles, Film, Utensils, Map, HelpCircle, Calendar, Wine, Volume2 } from 'lucide-react';
import { MovieLibrary } from '../components/MovieLibrary';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('progress');
  const [libraryView, setLibraryView] = React.useState<'main' | 'recipes' | 'movies' | 'fridge' | 'sommelier'>('main');
  const [isRecording, setIsRecording] = React.useState(false);
  const [audioTranscription, setAudioTranscription] = React.useState('');
  const [fridgeIngredients, setFridgeIngredients] = React.useState('');
  const [cookingLevel, setCookingLevel] = React.useState(1);
  const [generatedRecipe, setGeneratedRecipe] = React.useState<any>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [cookedCount, setCookedCount] = React.useState(() => {
    return parseInt(localStorage.getItem('cookedCount') || '3');
  });
  const [watchedMoviesCount, setWatchedMoviesCount] = React.useState(() => {
    return parseInt(localStorage.getItem('watchedMoviesCount') || '0');
  });
  const [solvedRiddlesCount, setSolvedRiddlesCount] = React.useState(() => {
    return parseInt(localStorage.getItem('solvedRiddlesCount') || '1');
  });

  React.useEffect(() => {
    const handleStorageChange = () => {
      setCookedCount(parseInt(localStorage.getItem('cookedCount') || '3'));
      setWatchedMoviesCount(parseInt(localStorage.getItem('watchedMoviesCount') || '0'));
      setSolvedRiddlesCount(parseInt(localStorage.getItem('solvedRiddlesCount') || '1'));
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const funLevel = Math.min(
    (cookedCount * 5) + (watchedMoviesCount * 5) + (solvedRiddlesCount * 10),
    100
  );

  const medals = [
    { id: 'bronze', name: 'מדליית ארד (המתחיל)', icon: Award, desc: 'הוענקה על השלמת 3 משימות ראשונות', unlocked: true },
    { id: 'silver', name: 'מדליית כסף (המנוסה)', icon: Trophy, desc: 'הוענקה על צבירת 500 נקודות זהב', unlocked: true },
    { id: 'gold', name: 'מדליית זהב (מאסטר)', icon: Star, desc: 'הוענקה על פתיחת כל סוגי המארזים (כולל הפלטינום)', unlocked: false },
    { id: 'romantic', name: 'הרומנטיקן', icon: Heart, desc: 'הוענקה על ביצוע מחוות קטנות ומפתיעות', unlocked: true },
    { id: 'researcher', name: 'החוקר הפנימי', icon: Search, desc: 'הוענקה על ניתוח תובנות עמוק מהיומן האישי', unlocked: false },
  ];

  const allMissions = [
    { title: 'מילים של זהב', desc: 'כתבו ביומן האישי דבר אחד טוב שקרה לכם היום.', points: 10, medal: 'המתמיד' },
    { title: 'זמן ללא מסכים', desc: 'הקדישו 30 דקות הערב לשיחה זוגית ללא טלפונים בצד.', points: 25, medal: 'שומר הקשר' },
    { title: 'מחווה קטנה', desc: 'הפתיעו את בן/בת הזוג עם פתק אהבה קטן במקום לא צפוי.', points: 15, medal: 'הרומנטיקן' },
    { title: 'דייט בקופסה', desc: 'פתחו פחית של המארז ותכננו את הערב לפי המשימות שבפנים.', points: 50, medal: 'חוקר המארזים' },
    { title: 'השראה עסקית', desc: 'כתבו ביומן רעיון אחד לשיפור או פרויקט שתרצו לקדם.', points: 20, medal: 'היזם' },
    { title: 'למידה עצמית', desc: 'העלו 5 רשומות יומן וקבלו סיכום תובנות מה-AI.', points: 40, medal: 'החוקר הפנימי' },
    { title: 'נשימת בוקר', desc: 'התחילו את הבוקר ב-5 דקות של שקט משותף לפני המרוץ.', points: 10, medal: 'השלווה' },
    { title: 'תכנון עתידי', desc: 'שבו יחד וקבעו תאריך לחופשה או בילוי משותף בחודש הקרוב.', points: 30, medal: 'המתכנן' },
    { title: 'מרתון כתיבה', desc: 'כתבו ביומן במשך 7 ימים רצופים (משימה מצטברת).', points: 100, medal: 'סופר המותג' },
    { title: 'ערב ספא ביתי', desc: 'השתמשו במוצרים ממארז ה-Bloom לערב מפנק במיוחד.', points: 40, medal: 'המטפח' },
    { title: 'סוד הפרימיום', desc: 'השלימו 5 משימות בשבוע כדי לקבל רמז על תוכן מארז ה-Platinum.', points: 60, medal: 'שומר הסוד' },
  ];

  if (!isLoggedIn) {
    return (
      <div className="pt-32 pb-32 bg-brand-cream min-h-screen flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-brand-gold/10 p-12 max-w-md w-full text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <LogIn className="text-brand-gold" size={32} />
          </div>
          <h1 className="text-3xl font-serif mb-4">כניסה לאזור האישי</h1>
          <p className="text-brand-black/50 mb-12 leading-relaxed">
            התחברו כדי לצבור נקודות זהב, לנהל את היומן האישי ולפתוח מדליות יוקרתיות.
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="w-full py-4 border border-brand-black/10 flex items-center justify-center gap-4 hover:bg-brand-cream transition-colors group"
              aria-label="התחברות באמצעות גוגל"
            >
              <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" />
              <span className="text-sm tracking-widest uppercase">התחברות באמצעות Google</span>
            </button>
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="w-full py-4 bg-brand-black text-white flex items-center justify-center gap-4 hover:bg-brand-gold transition-colors"
              aria-label="התחברות באמצעות אפל"
            >
              <img src="https://www.apple.com/favicon.ico" alt="" className="w-5 h-5 invert" />
              <span className="text-sm tracking-widest uppercase">התחברות באמצעות Apple</span>
            </button>
          </div>
          
          <p className="mt-12 text-[10px] text-brand-black/30 uppercase tracking-widest">
            Byond Intima &copy; 2026
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-brand-cream min-h-screen" role="main">
      <div className="max-w-7xl mx-auto px-6">
        {/* Profile Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-full border-2 border-brand-gold p-1" aria-hidden="true">
              <div className="w-full h-full rounded-full bg-brand-black flex items-center justify-center text-brand-gold text-3xl font-serif">
                JD
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-serif mb-2">שלום, יונתן ודנה</h1>
              <p className="text-brand-black/50 tracking-widest uppercase text-xs">Level 02 – PRO Experience</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white border border-brand-gold/10 p-4 text-center min-w-[140px]" role="status">
              <p className="text-[10px] uppercase tracking-widest text-brand-black/40 mb-1">נקודות זהב</p>
              <p className="text-2xl font-serif text-brand-gold">2,450</p>
            </div>
            <div className="bg-white border border-brand-gold/10 p-4 text-center min-w-[140px]" role="status">
              <p className="text-[10px] uppercase tracking-widest text-brand-black/40 mb-1">מדליות</p>
              <p className="text-2xl font-serif text-brand-gold">4/15</p>
            </div>
          </div>
        </header>

        {/* Overall Journey Progress Bar */}
        <div className="mb-12 bg-white border border-brand-gold/10 p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                <Trophy size={24} />
              </div>
              <div>
                <h2 className="text-xl font-serif">המסע שלכם</h2>
                <p className="text-[10px] uppercase tracking-widest text-brand-black/40">התקדמות כוללת בחוויית Byond Intima</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-serif text-brand-gold">72%</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-black/40">הושלם</p>
            </div>
          </div>
          <div className="relative h-4 bg-brand-cream rounded-full overflow-hidden p-1 border border-brand-gold/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              transition={{ duration: 2, ease: "circOut" }}
              className="h-full bg-brand-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            ></motion.div>
          </div>
          <div className="flex justify-between mt-4">
            <span className="text-[9px] uppercase tracking-widest text-brand-black/30">התחלה</span>
            <span className="text-[9px] uppercase tracking-widest text-brand-black/30">היעד הבא: Master Experience</span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex border-b border-brand-gold/10 mb-12 overflow-x-auto no-scrollbar" aria-label="תפריט אזור אישי">
          {[
            { id: 'progress', name: 'התקדמות', icon: Trophy },
            { id: 'medals', name: 'ארון מדליות', icon: Award },
            { id: 'missions', name: 'משימות', icon: Star },
            { id: 'calendar', name: 'יומן אירועים', icon: Calendar },
            { id: 'quiz', name: 'שאלון קירבה', icon: HelpCircle },
            { id: 'journal', name: 'יומן אישי', icon: Book },
            { id: 'library', name: 'ספרייה', icon: Film },
            { id: 'hunt', name: 'מטמון', icon: Map },
            { id: 'unlock', name: 'פתיחת עונה 2', icon: Lock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
              role="tab"
              className={`flex items-center gap-3 px-8 py-4 text-sm tracking-widest uppercase transition-all shrink-0 ${
                activeTab === tab.id 
                  ? 'text-brand-gold border-b-2 border-brand-gold' 
                  : 'text-brand-black/40 hover:text-brand-black'
              }`}
            >
              <tab.icon size={16} aria-hidden="true" />
              {tab.name}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <section className="lg:col-span-2 space-y-8" aria-live="polite">
            {activeTab === 'progress' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="bg-white border border-brand-gold/10 p-8">
                  <div className="flex justify-between items-end mb-6">
                    <h3 className="text-xl font-serif">התקדמות החוויה</h3>
                    <span className="text-brand-gold font-serif">72%</span>
                  </div>
                  <div className="relative h-3 bg-brand-cream rounded-full mb-4 overflow-hidden" aria-hidden="true">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '72%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute top-0 left-0 h-full bg-brand-gold"
                    ></motion.div>
                  </div>
                  <p className="text-sm text-brand-black/50">עוד 350 נקודות זהב לפתיחת הפרס הבא: <strong>מארז תבלינים דיגיטלי</strong>.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-brand-gold/10 p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-cream flex items-center justify-center text-brand-gold" aria-hidden="true">
                      <Star size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">משימת "שיח של חצות"</h4>
                      <p className="text-xs text-brand-black/40">הושלמה בהצלחה</p>
                    </div>
                  </div>
                  <div className="bg-white border border-brand-gold/10 p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-cream flex items-center justify-center text-brand-gold" aria-hidden="true">
                      <Heart size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">מדליית "הרומנטיקן"</h4>
                      <p className="text-xs text-brand-black/40">נוספה לארון</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'medals' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
                {medals.map((medal) => (
                  <div 
                    key={medal.id} 
                    className={`bg-white border p-8 text-center transition-all duration-500 ${
                      medal.unlocked ? 'border-brand-gold/20' : 'border-brand-black/5 opacity-40 grayscale'
                    }`}
                  >
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
                      medal.unlocked ? 'bg-brand-gold/10 text-brand-gold' : 'bg-brand-black/5 text-brand-black/20'
                    }`} aria-hidden="true">
                      <medal.icon size={32} />
                    </div>
                    <h4 className="font-serif text-xl mb-2">{medal.name}</h4>
                    <p className="text-xs text-brand-black/40 uppercase tracking-widest leading-relaxed">
                      {medal.unlocked ? medal.desc : 'נעול - המשיכו במסע כדי לפתוח'}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'missions' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <div>
                   <h3 className="text-sm tracking-[0.3em] uppercase text-brand-black/40 mb-6">רשימת משימות</h3>
                   {allMissions.map((m, i) => (
                     <button 
                        key={i} 
                        className="w-full text-right bg-white border border-brand-gold/10 p-6 flex items-center justify-between group cursor-pointer hover:border-brand-gold/40 transition-all mb-4"
                        aria-label={`משימה: ${m.title}, נקודות: ${m.points}`}
                      >
                        <div className="flex items-center gap-6 flex-1">
                          <div className="w-10 h-10 rounded-full border border-brand-gold/20 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all" aria-hidden="true">
                            <ChevronRight size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-serif text-lg">{m.title}</h4>
                              <span className="text-xs text-brand-gold font-medium">💎 {m.points}</span>
                            </div>
                            <p className="text-sm text-brand-black/60 mb-2">{m.desc}</p>
                            <p className="text-[10px] text-brand-black/40 uppercase tracking-widest">מדליה קשורה: {m.medal}</p>
                          </div>
                        </div>
                        <PlusCircle size={20} className="text-brand-gold/40 mr-4" aria-hidden="true" />
                     </button>
                   ))}
                 </div>
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="bg-white border border-brand-gold/10 p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-serif">Beyond Calendar</h3>
                    <button className="text-[10px] uppercase tracking-widest px-4 py-2 bg-brand-black text-white hover:bg-brand-gold transition-colors">הוספת אירוע +</button>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { id: 1, title: 'ערב דייט - פיקניק בסלון', date: '10 במרץ, 2026', type: 'Date Night', points: 20, completed: false },
                      { id: 2, title: 'יום נישואין 3 שנים', date: '20 במרץ, 2026', type: 'Anniversary', points: 20, completed: false, reminder: true },
                      { id: 3, title: 'יום הולדת לדנה', date: '12 באפריל, 2026', type: 'Birthday', points: 20, completed: false, reminder: true },
                    ].map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-6 border border-brand-gold/5 bg-brand-cream/20">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white border border-brand-gold/10 flex flex-col items-center justify-center text-brand-gold">
                            <span className="text-xs font-bold">{event.date.split(' ')[0]}</span>
                            <span className="text-[8px] uppercase">{event.date.split(' ')[1]}</span>
                          </div>
                          <div>
                            <h4 className="font-serif text-lg">{event.title}</h4>
                            <p className="text-[10px] text-brand-black/40 uppercase tracking-widest">{event.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {event.reminder && (
                            <div className="text-[9px] text-brand-gold bg-brand-gold/10 px-2 py-1 uppercase tracking-tighter">
                              מומלץ להזמין מארז שבועיים לפני
                            </div>
                          )}
                          <button className="px-4 py-2 border border-brand-gold/20 text-[10px] uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all">
                            סיום משימה (+{event.points})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="bg-white border border-brand-gold/10 p-8 text-center max-w-2xl mx-auto">
                  <HelpCircle size={48} className="mx-auto text-brand-gold mb-6" />
                  <h3 className="text-2xl font-serif mb-2">The Connection Quiz</h3>
                  <p className="text-[10px] text-brand-black/40 uppercase tracking-[0.3em] mb-8">שאלון הקירבה השבועי</p>
                  
                  <div className="bg-brand-cream/30 p-12 border border-brand-gold/5 mb-8">
                    <p className="text-xl font-serif italic mb-8">"מה המאכל שהצד השני הכי אוהב להזמין כשיש לכם 'Cheat Day'?"</p>
                    <input 
                      type="text" 
                      placeholder="התשובה שלך..."
                      className="w-full bg-white border border-brand-gold/20 p-4 text-center focus:border-brand-gold outline-none mb-4"
                    />
                    <p className="text-[10px] text-brand-black/40 italic">התשובה תחשף רק לאחר ששניכם תענו</p>
                  </div>

                  <button className="w-full py-4 bg-brand-black text-white uppercase tracking-[0.2em] text-sm hover:bg-brand-gold transition-colors">
                    שלח תשובה וצבור נקודות
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'journal' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Journal Entry Area */}
                <div className="bg-white border border-brand-gold/10 p-8">
                  <div className="flex flex-wrap gap-4 mb-6">
                    <button className="text-[10px] uppercase tracking-widest px-4 py-2 bg-brand-gold/10 text-brand-gold">מחשבות</button>
                    <button className="text-[10px] uppercase tracking-widest px-4 py-2 text-brand-black/40 hover:text-brand-black">זכרונות</button>
                    <button className="text-[10px] uppercase tracking-widest px-4 py-2 text-brand-black/40 hover:text-brand-black">רעיונות עסקיים</button>
                    <button 
                      onClick={() => {
                        setIsRecording(!isRecording);
                        if (!isRecording) {
                          setTimeout(() => {
                            setAudioTranscription('היום היה יום מדהים, בישלנו יחד את הפסטה כמהין וזה הרגיש כמו במסעדה באיטליה. דנה אמרה שזה המתכון הכי טוב שהכנו עד היום. אני חושב שזה רעיון מעולה להוסיף את זה ליומן הזוגי שלנו.');
                            setIsRecording(false);
                          }, 3000);
                        }
                      }}
                      className={`text-[10px] uppercase tracking-widest px-4 py-2 flex items-center gap-2 border transition-all ${
                        isRecording ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'text-brand-black/40 border-brand-gold/20 hover:text-brand-gold'
                      }`}
                    >
                      <Mic size={12} /> {isRecording ? 'מקליט...' : 'הקלטה קולית'}
                    </button>
                    <a 
                      href="https://notebooklm.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] uppercase tracking-widest px-4 py-2 text-brand-gold hover:bg-brand-gold/5 flex items-center gap-2 border border-brand-gold/20"
                    >
                      Notebook LM <ExternalLink size={12} />
                    </a>
                  </div>
                  <textarea 
                    placeholder="זהו המרחב הבטוח שלכם. כתבו כאן הכל..."
                    className="w-full h-48 bg-brand-cream/30 border-none focus:ring-0 font-serif text-lg resize-none p-4 leading-relaxed outline-none"
                    aria-label="תוכן היומן"
                    value={audioTranscription}
                    onChange={(e) => setAudioTranscription(e.target.value)}
                  ></textarea>
                  {audioTranscription && (
                    <div className="mb-6 p-4 bg-brand-gold/5 border-l-2 border-brand-gold flex items-start gap-3">
                      <Volume2 size={16} className="text-brand-gold shrink-0 mt-1" />
                      <p className="text-xs text-brand-black/60 italic">תמלול אוטומטי של ההקלטה האחרונה נוסף לטקסט למעלה.</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-black/40 hover:text-brand-gold transition-colors">
                        <input type="file" className="hidden" accept="image/*" />
                        <ImageIcon size={16} /> הוספת תמונה
                      </label>
                      <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-gold hover:text-brand-black transition-colors">
                        <RefreshCw size={14} /> סנכרון ידע (Sync to Knowledge)
                      </button>
                    </div>
                    <button className="px-10 py-4 bg-brand-black text-white text-xs tracking-widest uppercase hover:bg-brand-gold transition-all">
                      שמירה במרחב הבטוח
                    </button>
                  </div>
                </div>

                {/* Insights Dashboard */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm tracking-[0.3em] uppercase text-brand-black/40">תובנות מהיומן (Insights)</h3>
                    <Sparkles size={16} className="text-brand-gold" />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white border border-brand-gold/10 p-6">
                      <p className="text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">הנושא החם שלך השבוע</p>
                      <h4 className="font-serif text-lg text-brand-gold">זוגיות וקריירה</h4>
                    </div>
                    <div className="bg-white border border-brand-gold/10 p-6">
                      <p className="text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">נקודות אור</p>
                      <p className="text-xs leading-relaxed text-brand-black/70">סיכום של כל הדברים החיוביים שכתבתם השבוע.</p>
                    </div>
                    <div className="bg-white border border-brand-gold/10 p-6">
                      <p className="text-[10px] uppercase tracking-widest text-brand-black/40 mb-2">שאלות למחשבה</p>
                      <p className="text-xs leading-relaxed text-brand-black/70 italic">"כתבת שאתה מרגיש עמוס, אולי כדאי לתכנן ערב רגיעה?"</p>
                    </div>
                  </div>

                  {/* Audio Brief Player */}
                  <div className="bg-brand-black p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button className="w-12 h-12 rounded-full bg-brand-gold text-brand-black flex items-center justify-center hover:scale-105 transition-transform">
                        <Play size={20} fill="currentColor" />
                      </button>
                      <div>
                        <h4 className="text-white font-serif text-lg">Audio Overview</h4>
                        <p className="text-[10px] text-brand-gold uppercase tracking-widest">האזינו לסיכום השבועי שלכם</p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                       {[1,2,3,4,5,6,7,8].map(i => (
                         <div key={i} className="w-1 bg-brand-gold/30 rounded-full" style={{ height: `${Math.random() * 24 + 4}px` }}></div>
                       ))}
                    </div>
                  </div>
                </div>
                
                {/* Past Entries */}
                <div className="space-y-6">
                   <div className="p-8 border-r-2 border-brand-gold bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] uppercase tracking-widest text-brand-gold">רעיונות עסקיים</span>
                        <p className="text-[10px] text-brand-black/30 uppercase tracking-widest">12 בפברואר, 2026</p>
                      </div>
                      <p className="font-serif italic text-brand-black/70 text-lg leading-relaxed">
                        "חשבנו על פיתוח ליין של מוצרי טקסטיל לבית שמשלימים את חוויית ה-Byond. משהו שמרגיש כמו המלונות הכי טובים בעולם."
                      </p>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h3 className="text-2xl font-serif">ספריית חוויות</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setLibraryView('main')}
                      className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all ${libraryView === 'main' ? 'bg-brand-gold text-black' : 'border border-brand-gold/20 hover:bg-brand-gold/5'}`}
                    >הכל</button>
                    <button 
                      onClick={() => setLibraryView('recipes')}
                      className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all ${libraryView === 'recipes' ? 'bg-brand-gold text-black' : 'border border-brand-gold/20 hover:bg-brand-gold/5'}`}
                    >מתכונים</button>
                    <button 
                      onClick={() => setLibraryView('movies')}
                      className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all ${libraryView === 'movies' ? 'bg-brand-gold text-black' : 'border border-brand-gold/20 hover:bg-brand-gold/5'}`}
                    >סרטים</button>
                    <button 
                      onClick={() => setLibraryView('sommelier')}
                      className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all ${libraryView === 'sommelier' ? 'bg-brand-gold text-black' : 'border border-brand-gold/20 hover:bg-brand-gold/5'}`}
                    >Sommelier</button>
                    <button 
                      onClick={() => setLibraryView('fridge')}
                      className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all ${libraryView === 'fridge' ? 'bg-brand-gold text-black' : 'border border-brand-gold/20 hover:bg-brand-gold/5'}`}
                    >מה במקרר?</button>
                  </div>
                </div>

                {(libraryView === 'main' || libraryView === 'recipes') && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-brand-gold">
                      <Utensils size={20} />
                      <h4 className="text-sm tracking-[0.3em] uppercase">מתכונים זוגיים</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        { title: 'פסטה כמהין ויין לבן', time: '30 דק', level: 'קל', img: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&q=80&w=400', desc: 'פסטה עשירה בטעמי כמהין ויין לבן, מושלמת לערב רומנטי.', ingredients: ['פסטה', 'שמן כמהין', 'יין לבן', 'פרמזן'], steps: ['מבשלים פסטה', 'מכינים רוטב', 'מערבבים'], mission: 'ספרו אחד לשני על רגע מצחיק שקרה לכם השבוע.' },
                        { title: 'פילה סלמון בזיגוג דבש', time: '45 דק', level: 'בינוני', img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400', desc: 'סלמון עסיסי בזיגוג מתקתק של דבש וסויה.', ingredients: ['סלמון', 'דבש', 'סויה', 'שום'], steps: ['משרים סלמון', 'צולים בתנור', 'מגישים'], mission: 'תכננו יחד את החופשה הבאה שלכם.' }
                      ].map((recipe, i) => (
                        <div 
                          key={i} 
                          onClick={() => navigate('/recipe', { state: { recipe } })}
                          className="bg-white border border-brand-gold/10 overflow-hidden group cursor-pointer"
                        >
                          <div className="aspect-video overflow-hidden">
                            <img src={recipe.img} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale hover:grayscale-0" referrerPolicy="no-referrer" />
                          </div>
                          <div className="p-6">
                            <h5 className="font-serif text-lg mb-2">{recipe.title}</h5>
                            <div className="flex gap-4 text-[10px] uppercase tracking-widest text-brand-black/40">
                              <span>{recipe.time}</span>
                              <span>•</span>
                              <span>{recipe.level}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(libraryView === 'main' || libraryView === 'movies') && (
                  <div className="mt-8 -mx-6 md:-mx-12">
                    <MovieLibrary />
                  </div>
                )}

                {libraryView === 'sommelier' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="bg-brand-black text-white p-12 text-center">
                      <Wine size={48} className="mx-auto text-brand-gold mb-6" />
                      <h3 className="text-3xl font-serif mb-4">The Sommelier & Bar</h3>
                      <p className="text-white/60 max-w-xl mx-auto font-light leading-relaxed">
                        התאמת משקאות מושלמת למנות שלכם. גלו את עולם היין והקוקטיילים שישדרגו כל ארוחה.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-white border border-brand-gold/10 p-8">
                        <h4 className="text-sm tracking-[0.3em] uppercase text-brand-gold mb-8">התאמת יין למנות</h4>
                        <div className="space-y-6">
                          {[
                            { dish: 'סטייק בקר ברוטב יין', wine: 'קברנה סוביניון עשיר', tip: 'הטאנינים ביין מדגישים את טעמי הבשר.' },
                            { dish: 'פסטה רוזה עם כמהין', wine: 'שרדונה מיושן או רוזה יבש', tip: 'החמיצות מאזנת את עשירות השמנת.' },
                            { dish: 'סושי ודגים נאים', wine: 'גוורצטרמינר או סאקה קר', tip: 'טעמים פרחוניים משלימים את עדינות הדג.' },
                          ].map((item, i) => (
                            <div key={i} className="pb-6 border-b border-brand-gold/5 last:border-0">
                              <h5 className="font-serif text-lg mb-1">{item.dish}</h5>
                              <p className="text-brand-gold text-sm mb-2">🍷 {item.wine}</p>
                              <p className="text-xs text-brand-black/40 italic">{item.tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-brand-gold/10 p-8">
                        <h4 className="text-sm tracking-[0.3em] uppercase text-brand-gold mb-8">סדנת קוקטיילים ביתית</h4>
                        <div className="aspect-video bg-brand-cream border border-brand-gold/10 flex items-center justify-center mb-6 group cursor-pointer overflow-hidden relative">
                          <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800" alt="Cocktail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                          <div className="relative z-10 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-brand-gold shadow-xl group-hover:bg-brand-gold group-hover:text-white transition-all">
                            <Play size={24} fill="currentColor" />
                          </div>
                        </div>
                        <h5 className="font-serif text-xl mb-2">איך להכין את ה-Old Fashioned המושלם</h5>
                        <p className="text-xs text-brand-black/60 leading-relaxed mb-4">
                          3 דקות של הדרכה שתהפוך אתכם לברמנים של הבית. כל מה שצריך זה וויסקי, אנגוסטורה וקצת סבלנות.
                        </p>
                        <button className="text-[10px] uppercase tracking-widest text-brand-gold font-bold border-b border-brand-gold pb-1">לצפייה במתכון המלא</button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {libraryView === 'fridge' && (
                  <div className="space-y-12">
                    <div className="bg-white border border-brand-gold/10 p-8">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                          <RefreshCw size={24} />
                        </div>
                        <div>
                          <h4 className="text-xl font-serif">מה יש לכם במקרר?</h4>
                          <p className="text-xs text-brand-black/40 uppercase tracking-widest">צרו מתכון זוגי ממה שיש בבית</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-black/40 mb-3">מרכיבים שיש לכם (מופרדים בפסיק)</label>
                          <textarea 
                            value={fridgeIngredients}
                            onChange={(e) => setFridgeIngredients(e.target.value)}
                            placeholder="למשל: עגבניות, ביצים, גבינה צהובה, בצל..."
                            className="w-full h-32 bg-brand-cream/30 border border-brand-gold/10 p-4 font-serif text-lg outline-none focus:border-brand-gold transition-all"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {['עוף', 'פסטה', 'אורז', 'תפוחי אדמה', 'שמנת', 'פטריות'].map(item => (
                            <button 
                              key={item}
                              onClick={() => setFridgeIngredients(prev => prev ? `${prev}, ${item}` : item)}
                              className="px-3 py-1 border border-brand-gold/10 text-[10px] uppercase tracking-widest hover:bg-brand-gold/5"
                            >+ {item}</button>
                          ))}
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-black/40 mb-4">רמת ניסיון בבישול</label>
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { level: 1, name: 'קל ומהיר', desc: 'רמה 1' },
                              { level: 2, name: 'מושקע', desc: 'רמה 2' },
                              { level: 3, name: 'אתגר זוגי', desc: 'רמה 3' }
                            ].map(l => (
                              <button 
                                key={l.level}
                                onClick={() => setCookingLevel(l.level)}
                                className={`p-4 border transition-all text-center ${cookingLevel === l.level ? 'border-brand-gold bg-brand-gold/5' : 'border-brand-gold/10 hover:border-brand-gold/30'}`}
                              >
                                <p className="text-xs font-serif mb-1">{l.name}</p>
                                <p className="text-[9px] uppercase tracking-widest text-brand-black/30">{l.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            setIsGenerating(true);
                            // Simulate AI generation
                            setTimeout(() => {
                              setGeneratedRecipe({
                                name: 'שקשוקה Signature זוגית',
                                desc: 'גרסה יוקרתית ומפתיעה למנה הקלאסית, מותאמת בדיוק למרכיבים שלכם.',
                                time: '25 דק',
                                difficulty: cookingLevel === 1 ? 'קל' : cookingLevel === 2 ? 'בינוני' : 'אתגר',
                                ingredients: fridgeIngredients.split(',').map(i => i.trim()),
                                steps: [
                                  'קוצצים את הבצל והעגבניות דק דק.',
                                  'מטגנים במחבת רחבה עם מעט שמן זית עד לריכוך.',
                                  'מוסיפים את התבלינים הסודיים שלכם.',
                                  'יוצרים גומחות ומוסיפים את הביצים.'
                                ],
                                mission: cookingLevel === 3 ? 'בישול ביד אחת: עליכם להכין את כל המנה כשכל אחד מכם משתמש ביד אחת בלבד.' : 'שיח של טעמים: תוך כדי הבישול, ספרו אחד לשני על טעם ילדות שאתם מתגעגעים אליו.',
                                upgrade: 'בפעם הבאה נסו להוסיף מעט פפריקה מעושנת וגבינת פטה מעל.'
                              });
                              setIsGenerating(false);
                            }, 2000);
                          }}
                          disabled={!fridgeIngredients || isGenerating}
                          className="w-full py-5 bg-brand-black text-white uppercase tracking-[0.3em] text-xs hover:bg-brand-gold transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                          צרו לנו מתכון
                        </button>
                      </div>
                    </div>

                    {generatedRecipe && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="bg-white border border-brand-gold/20 overflow-hidden cursor-pointer hover:border-brand-gold transition-all"
                        onClick={() => navigate('/recipe', { state: { recipe: generatedRecipe } })}
                      >
                        <div className="bg-brand-gold/5 p-8 border-b border-brand-gold/10 text-center">
                          <h4 className="text-3xl font-serif mb-2">{generatedRecipe.name}</h4>
                          <p className="text-brand-black/60 italic max-w-lg mx-auto leading-relaxed">{generatedRecipe.desc}</p>
                        </div>
                        
                        <div className="p-8 grid md:grid-cols-3 gap-8 border-b border-brand-gold/10">
                          <div className="text-center">
                            <p className="text-[10px] uppercase tracking-widest text-brand-black/40 mb-1">זמן הכנה</p>
                            <p className="font-serif text-lg">{generatedRecipe.time}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] uppercase tracking-widest text-brand-black/40 mb-1">רמת קושי</p>
                            <p className="font-serif text-lg">{generatedRecipe.difficulty}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] uppercase tracking-widest text-brand-black/40 mb-1">ניקוד</p>
                            <p className="font-serif text-lg text-brand-gold">+50💎</p>
                          </div>
                        </div>

                        <div className="p-8 grid md:grid-cols-2 gap-12">
                          <div>
                            <h5 className="text-sm tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
                              <Utensils size={14} className="text-brand-gold" /> מצרכים
                            </h5>
                            <ul className="space-y-3">
                              {generatedRecipe.ingredients.map((ing: string, i: number) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-brand-black/70">
                                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold/30" /> {ing}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
                              <ChevronRight size={14} className="text-brand-gold" /> שלבי הכנה
                            </h5>
                            <div className="space-y-6">
                              {generatedRecipe.steps.map((step: string, i: number) => (
                                <div key={i} className="flex gap-4">
                                  <span className="text-brand-gold font-serif text-lg leading-none">{i + 1}.</span>
                                  <p className="text-sm leading-relaxed text-brand-black/70">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-8 bg-brand-cream/30 border-t border-brand-gold/10">
                          <div className="flex items-center gap-4 mb-4 text-brand-gold">
                            <Heart size={20} />
                            <h5 className="text-sm tracking-[0.2em] uppercase">משימה זוגית משולבת</h5>
                          </div>
                          <p className="text-brand-black/70 leading-relaxed italic">{generatedRecipe.mission}</p>
                        </div>

                        <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-brand-gold mb-1">שדרוג לפעם הבאה</p>
                            <p className="text-xs text-brand-black/50">{generatedRecipe.upgrade}</p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextCount = cookedCount + 1;
                              setCookedCount(nextCount);
                              localStorage.setItem('cookedCount', nextCount.toString());
                              alert('כל הכבוד! צברתם 50 נקודות זהב והתקדמתם לעבר תעודת השף שלכם.');
                            }}
                            className="px-12 py-4 bg-brand-black text-white uppercase tracking-widest text-xs hover:bg-brand-gold transition-all"
                          >
                            בישלנו
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Chef Certificate Section */}
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm tracking-[0.3em] uppercase text-brand-black/40">התקדמות שף זוגי</h3>
                        <span className="text-xs text-brand-gold">{cookedCount}/5 מתכונים לתעודה הראשונה</span>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-6">
                        {[5, 10, 20].map(goal => (
                          <div key={goal} className={`bg-white border p-8 text-center relative overflow-hidden ${cookedCount >= goal ? 'border-brand-gold' : 'border-brand-gold/10 opacity-50'}`}>
                            {cookedCount >= goal && <div className="absolute top-0 right-0 bg-brand-gold text-black text-[8px] px-2 py-1 uppercase tracking-widest">הושלם</div>}
                            <Award size={32} className={`mx-auto mb-4 ${cookedCount >= goal ? 'text-brand-gold' : 'text-brand-black/20'}`} />
                            <h5 className="font-serif text-lg mb-1">תעודת שף {goal === 5 ? 'מתחיל' : goal === 10 ? 'מנוסה' : 'מאסטר'}</h5>
                            <p className="text-[10px] text-brand-black/40 uppercase tracking-widest mb-4">השלמת {goal} מתכונים</p>
                            {cookedCount >= goal && (
                              <button className="text-[10px] text-brand-gold uppercase tracking-widest flex items-center gap-2 mx-auto hover:text-brand-black transition-colors">
                                <Download size={12} /> הורדת תעודה (PDF)
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {cookedCount >= 5 && (
                        <motion.div 
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="max-w-2xl mx-auto bg-white border-8 border-brand-gold/20 p-12 text-center shadow-2xl relative"
                        >
                          <div className="absolute inset-4 border border-brand-gold/10 pointer-events-none" />
                          <Utensils className="mx-auto text-brand-gold mb-8" size={48} />
                          <h2 className="text-4xl font-serif mb-4 uppercase tracking-widest">תעודת שף זוגי</h2>
                          <p className="text-brand-black/40 uppercase tracking-[0.4em] text-xs mb-12">Byond Intima Culinary Arts</p>
                          
                          <div className="mb-12">
                            <p className="text-brand-black/60 font-serif italic text-lg mb-2">מוענקת בגאווה ל-</p>
                            <h3 className="text-3xl font-serif text-brand-gold border-b border-brand-gold/20 inline-block px-8 py-2">יונתן ודנה</h3>
                          </div>

                          <p className="max-w-md mx-auto text-sm leading-relaxed text-brand-black/50 mb-12">
                            על הפגנת יצירתיות, שיתוף פעולה וחיבור עמוק דרך עולם הקולינריה הזוגית. 
                            הוכחתם שגם מהמרכיבים הפשוטים ביותר אפשר ליצור חוויית Signature בלתי נשכחת.
                          </p>

                          <div className="flex justify-between items-end">
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-widest text-brand-black/30">תאריך הנפקה</p>
                              <p className="font-serif text-sm">03.03.2026</p>
                            </div>
                            <div className="w-24 h-24 border border-brand-gold/20 rounded-full flex items-center justify-center">
                              <Star className="text-brand-gold/20" size={40} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'hunt' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <div className="text-center max-w-xl mx-auto">
                  <Map size={48} className="mx-auto text-brand-gold mb-6" />
                  <h3 className="text-3xl font-serif mb-4">מצא את המטמון הדיגיטלי</h3>
                  <p className="text-brand-black/50 leading-relaxed">
                    פתרו את החידות המבוססות על היומן האישי שלכם ועל עולם המותג כדי לצבור נקודות זהב ולפתוח פרסים בלעדיים.
                  </p>
                </div>

                <div className="bg-brand-black text-white p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                  
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-brand-gold flex items-center justify-center text-brand-gold font-serif text-xl">1</div>
                      <h4 className="text-xl font-serif">החידה הראשונה</h4>
                    </div>
                    
                    <p className="text-lg font-light italic leading-relaxed text-white/80">
                      "במקום בו רשמתם על 'המלונות הכי טובים בעולם', מסתתרת מילה שמתחילה ב-T. מהי המילה שמשלימה את החזון שלכם?"
                    </p>

                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="הזינו את התשובה כאן..."
                        className="flex-1 bg-white/5 border border-white/10 p-4 outline-none focus:border-brand-gold transition-colors text-white"
                      />
                      <button 
                        onClick={() => {
                          const newCount = solvedRiddlesCount + 1;
                          setSolvedRiddlesCount(newCount);
                          localStorage.setItem('solvedRiddlesCount', newCount.toString());
                          window.dispatchEvent(new Event('storage'));
                          alert('כל הכבוד! פתרתם חידה וצברתם נקודות זהב למד הכייף!');
                        }}
                        className="px-8 bg-brand-gold text-black uppercase tracking-widest text-xs font-bold hover:bg-white transition-all"
                      >
                        בדיקה
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-brand-gold/60 text-[10px] uppercase tracking-widest">
                      <HelpCircle size={14} />
                      <span>רמז: חזרו ליומן האישי לתאריך ה-12 בפברואר</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white border border-brand-gold/10 p-6 opacity-50">
                    <Lock size={20} className="mb-4 text-brand-black/20" />
                    <h5 className="font-serif text-lg mb-2">חידה 2</h5>
                    <p className="text-xs text-brand-black/40 uppercase tracking-widest">נפתח לאחר פתרון חידה 1</p>
                  </div>
                  <div className="bg-white border border-brand-gold/10 p-6 opacity-50">
                    <Lock size={20} className="mb-4 text-brand-black/20" />
                    <h5 className="font-serif text-lg mb-2">חידה 3</h5>
                    <p className="text-xs text-brand-black/40 uppercase tracking-widest">נפתח לאחר פתרון חידה 2</p>
                  </div>
                  <div className="bg-white border border-brand-gold/10 p-6 flex flex-col justify-center items-center text-center">
                    <Trophy size={32} className="mb-4 text-brand-gold" />
                    <h5 className="font-serif text-lg mb-2">הפרס הגדול</h5>
                    <p className="text-[10px] text-brand-black/40 uppercase tracking-widest">מארז Signature בהנחה של 50%</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'unlock' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto text-center py-12">
                <Lock size={48} className="mx-auto text-brand-gold mb-8" aria-hidden="true" />
                <h3 className="text-2xl font-serif mb-4">פתיחת עונה 2</h3>
                <p className="text-brand-black/50 mb-8 leading-relaxed">
                  הזינו את הקוד הייחודי המופיע על המפתח הפיזי שקיבלתם במארז ה-Signature שלכם.
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="XXXX-XXXX-XXXX"
                    className="flex-1 bg-white border border-brand-gold/20 p-4 text-center tracking-[0.3em] uppercase focus:border-brand-gold outline-none"
                    aria-label="קוד פתיחה"
                  />
                  <button className="px-8 bg-brand-black text-white uppercase tracking-widest text-xs hover:bg-brand-gold transition-all">
                    פתיחה
                  </button>
                </div>
              </motion.div>
            )}
          </section>

          {/* Sidebar / Stats */}
          <aside className="space-y-8">
            <div className="bg-brand-black text-white p-8">
              <h4 className="text-brand-gold text-xs tracking-[0.3em] uppercase mb-6">הישגים קרובים</h4>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-light">מדליית "המתמיד"</span>
                    <span className="text-brand-gold">6/7 ימים</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden" aria-hidden="true">
                    <div className="h-full bg-brand-gold w-[85%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-light">מדליית "הרומנטיקן"</span>
                    <span className="text-brand-gold">הושלם</span>
                  </div>
                  <div className="h-1 bg-brand-gold rounded-full" aria-hidden="true"></div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-brand-gold/10 p-8">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-brand-black/40 text-[10px] tracking-[0.3em] uppercase">מד כייף (Fun Meter)</h4>
                <Zap size={14} className="text-brand-gold" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] uppercase tracking-widest mb-1">
                  <span className="text-brand-black/60">רמת הנאה זוגית</span>
                  <span className="text-brand-gold">{funLevel}%</span>
                </div>
                <div className="h-4 bg-brand-cream rounded-full overflow-hidden p-1 border border-brand-gold/5" aria-hidden="true">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${funLevel}%` }}
                    transition={{ duration: 2, ease: "circOut" }}
                    className="h-full bg-brand-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                  ></motion.div>
                </div>
                <p className="text-[9px] text-brand-black/30 leading-relaxed text-center uppercase tracking-tighter">
                  המשיכו לבשל, לראות סרטים ולפתור חידות כדי למלא את המד בזהב
                </p>
              </div>
            </div>

            <div className="bg-white border border-brand-gold/10 p-8">
              <h4 className="text-brand-black/40 text-[10px] tracking-[0.3em] uppercase mb-6">תיעוד רגעים</h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="aspect-square bg-brand-cream border border-brand-gold/5 flex items-center justify-center cursor-pointer hover:bg-brand-gold/5 transition-colors" aria-label="הוספת רגע">
                  <PlusCircle size={24} className="text-brand-gold/20" />
                </button>
                <div className="aspect-square bg-brand-cream border border-brand-gold/5 overflow-hidden">
                   <img src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=200" alt="Moment" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

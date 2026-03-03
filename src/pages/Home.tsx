import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Heart, Moon, Sparkles, Search, Music, Utensils, Film, Package, Flame, Leaf, Wine, Lock, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const MoodMatcher = () => {
  const [selectedMood, setSelectedMood] = React.useState<string | null>(null);

  const moods = [
    { id: 'ignite', name: 'Ignite', icon: Flame, desc: 'מחפשים ריגוש ותשוקה' },
    { id: 'spark', name: 'Spark', icon: Sparkles, desc: 'רוצים משהו חדש ומפתיע' },
    { id: 'bloom', name: 'Bloom', icon: Leaf, desc: 'זקוקים לרוגע ופינוק' },
    { id: 'classic', name: 'Classic', icon: Wine, desc: 'ערב איכותי ונינוח' },
    { id: 'secret', name: 'Secret', icon: Lock, desc: 'משהו מיוחד (VIP)' },
  ];

  const recommendations: Record<string, any> = {
    ignite: {
      box: 'Beyond Ignite. חוויה חושנית ומעוררת חושים.',
      recipe: 'פסטה אליו אוליו עם צ\'ילי חריף ושרימפס',
      movie: "Mr. & Mrs. Smith (מר וגברת סמית')",
      mission: 'כתבו אחד לשני פתק עם פנטזיה קטנה לערב הזה. זכייה ב-20 נקודות זהב.',
      img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800'
    },
    spark: {
      box: 'Beyond Spark. מארז של משחקים וגילויים חדשים.',
      recipe: 'טאקו מקסיקני עם מגוון תוספות צבעוניות',
      movie: 'Everything Everywhere All at Once',
      mission: 'נסו ללמוד יחד ריקוד חדש מיוטיוב במשך 10 דקות. זכייה ב-25 נקודות זהב.',
      img: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=800'
    },
    bloom: {
      box: 'Beyond Bloom. קרטון יוקרתי מלא במוצרי ספא וריטואלים של גוף ונפש.',
      recipe: 'מרק כתום קטיפתי 🥣 (מתוך קלף המרקים). מושלם לערב רגוע.',
      movie: 'The Shawshank Redemption (חומות של תקווה). דרמה עמוקה ומעוררת השראה.',
      mission: 'הקדישו 15 דקות לעיסוי כפות רגליים הדדי. זכייה ב-15 נקודות זהב.',
      img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800'
    },
    classic: {
      box: 'Beyond Classic. ערב יין וגבינות בסטייל אירופאי.',
      recipe: 'ריזוטו פטריות וכמהין עם פרמזן מיושן',
      movie: 'Casablanca (קזבלנקה) - קלאסיקה נצחית.',
      mission: 'שתפו אחד את השני בזיכרון הכי טוב שלכם מהשנה האחרונה. זכייה ב-10 נקודות זהב.',
      img: 'https://images.unsplash.com/photo-1516589174184-c685266e430c?auto=format&fit=crop&q=80&w=800'
    },
    secret: {
      box: 'Beyond Secret. המארז המסתורי שלנו לזוגות VIP.',
      recipe: 'ביף וולינגטון - אתגר קולינרי למתקדמים',
      movie: 'Eyes Wide Shut (עיניים עצומות לרווחה)',
      mission: 'גלו את הקוד הסודי בתוך המארז ופתחו את הפרק החסוי באפליקציה. זכייה ב-50 נקודות זהב.',
      img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800'
    }
  };

  return (
    <div className="space-y-16">
      <div className="flex flex-wrap justify-center gap-6 md:gap-12">
        {moods.map((mood) => (
          <div key={mood.id} className="flex flex-col items-center gap-4 group">
            <button
              onClick={() => setSelectedMood(mood.id)}
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full border flex items-center justify-center transition-all duration-700 relative ${
                selectedMood === mood.id 
                  ? 'border-brand-gold bg-brand-gold/10 shadow-[0_0_30px_rgba(212,175,55,0.4)]' 
                  : 'border-brand-gold/20 bg-transparent hover:border-brand-gold/60'
              }`}
            >
              <mood.icon 
                size={32} 
                className={`${selectedMood === mood.id ? 'text-brand-gold' : 'text-brand-gold/40 group-hover:text-brand-gold'} transition-colors duration-500`} 
              />
            </button>
            <div className="text-center">
              <span className={`block text-xs uppercase tracking-[0.2em] mb-1 ${selectedMood === mood.id ? 'text-brand-gold font-bold' : 'text-white/40'}`}>
                {mood.name}
              </span>
              <span className="text-[10px] text-white/20 italic hidden md:block">{mood.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedMood && (
          <motion.div 
            key={selectedMood}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid md:grid-cols-2 gap-12 bg-white/5 backdrop-blur-sm p-10 border border-brand-gold/10 rounded-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
               <div className="flex items-center gap-2 text-[10px] text-brand-gold uppercase tracking-widest">
                 <Trophy size={12} /> מדליית החוקר זמינה
               </div>
            </div>

            <div className="aspect-square md:aspect-video overflow-hidden rounded-xl border border-brand-gold/10">
              <img 
                src={recommendations[selectedMood].img} 
                alt={selectedMood} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col justify-center space-y-8 text-right">
              <h4 className="text-3xl font-serif italic text-brand-gold">ההמלצה שלנו לאווירה הזו:</h4>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-brand-gold uppercase tracking-widest">
                    <Package size={16} />
                    <span>המארז שלכם</span>
                  </div>
                  <p className="text-white/80 font-serif text-lg">{recommendations[selectedMood].box}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-brand-gold uppercase tracking-widest">
                    <Utensils size={16} />
                    <span>המתכון מהמטבח</span>
                  </div>
                  <p className="text-white/80 font-serif text-lg">{recommendations[selectedMood].recipe}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-brand-gold uppercase tracking-widest">
                    <Film size={16} />
                    <span>ההמלצה לצפייה</span>
                  </div>
                  <p className="text-white/80 font-serif text-lg">{recommendations[selectedMood].movie}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-brand-gold uppercase tracking-widest">
                    <Sparkles size={16} />
                    <span>משימת BEYOND QUEST</span>
                  </div>
                  <p className="text-brand-gold/90 font-serif text-lg italic">{recommendations[selectedMood].mission}</p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/dashboard" 
                  className="flex-1 text-center py-4 bg-brand-gold text-brand-black text-xs uppercase tracking-[0.2em] font-bold hover:bg-white transition-colors"
                >
                  עברו לאזור האישי ליישום
                </Link>
                <button className="flex-1 text-center py-4 border border-brand-gold text-brand-gold text-xs uppercase tracking-[0.2em] hover:bg-brand-gold/10 transition-colors">
                  הזמינו את המארז עכשיו
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Home = () => {
  const [showMoodMatcher, setShowMoodMatcher] = React.useState(false);
  const [heroBackdrop, setHeroBackdrop] = React.useState('https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=2000');

  React.useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch('/api/movies/popular');
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const randomMovie = data.results[Math.floor(Math.random() * 5)];
          if (randomMovie.backdrop_path) {
            setHeroBackdrop(`https://image.tmdb.org/t/p/original${randomMovie.backdrop_path}`);
          }
        }
      } catch (e) {
        console.log("Using default hero backdrop");
      }
    };
    fetchHero();
  }, []);

  return (
    <div className="pt-20">
      {/* Floating Mood Matcher Trigger */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end">
        <button 
          onClick={() => setShowMoodMatcher(true)}
          className="bg-brand-black border-l border-y border-brand-gold text-brand-gold px-4 py-8 rounded-l-2xl shadow-2xl hover:bg-brand-gold hover:text-brand-black transition-all duration-500 group flex flex-col items-center gap-4"
        >
          <Sparkles size={20} className="animate-pulse" />
          <span className="[writing-mode:vertical-rl] text-[10px] uppercase tracking-[0.3em] font-bold">Mood Matcher</span>
        </button>
      </div>

      {/* Mood Matcher Overlay */}
      <AnimatePresence>
        {showMoodMatcher && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-brand-black/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto"
          >
            <div className="w-full max-w-6xl relative">
              <button 
                onClick={() => setShowMoodMatcher(false)}
                className="absolute -top-12 right-0 text-white/40 hover:text-brand-gold transition-colors text-xs uppercase tracking-widest flex items-center gap-2"
              >
                סגירה [X]
              </button>
              
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-serif text-brand-gold mb-4">איך נראה הרגע שלכם עכשיו?</h2>
                <p className="text-white/40 font-serif italic">בחרו אווירה, ואנחנו נתאים לכם את החוויה המושלמת.</p>
              </div>

              <MoodMatcher />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Original */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-brand-black">
        <div className="absolute inset-0 opacity-40">
          <motion.img 
            key={heroBackdrop}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 2 }}
            src={heroBackdrop} 
            alt="Atmosphere" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/60 via-transparent to-brand-black" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-serif font-light tracking-[0.15em] mb-6 text-white">
              BYOND <span className="italic text-brand-gold">INTIMA</span>
            </h1>
            <p className="text-xl md:text-2xl font-serif italic text-white/60 mb-12 tracking-wide">
              חוויות זוגיות מודרכות
            </p>
            <Link 
              to="/experience"
              className="inline-flex items-center gap-3 px-10 py-4 border border-brand-gold text-brand-gold uppercase tracking-[0.2em] text-sm hover:bg-brand-gold hover:text-white transition-all duration-500 group"
            >
              גלו את החוויה
              <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-12 leading-relaxed">
              זוגות חיים בשגרה עמוסה. <br />
              <span className="text-brand-black/40 italic">סטרס, עייפות, שחיקה רגשית.</span>
            </h2>
            <p className="text-lg text-brand-black/70 leading-loose tracking-wide">
              החיבור נחלש בלי ששמים לב. אנחנו כאן כדי להחזיר את תשומת הלב לרגעים שבאמת משנים, 
              ליצור מרחב של נוכחות, קרבה וגילוי מחדש.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Experience Collection Preview */}
      <section className="py-32 px-6 bg-brand-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-serif mb-4">קולקציית החוויות</h2>
            <div className="w-20 h-px bg-brand-gold mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: 'CORE', focus: 'כיף. צחוק. חיבור מחדש.', img: 'https://images.unsplash.com/photo-1516589174184-c685266e430c?auto=format&fit=crop&q=80&w=800' },
              { title: 'PRO', focus: 'תחרות בריאה + קרבה רגשית.', img: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=800' },
              { title: 'SIGNATURE', focus: 'חוויה מתנה. ערב בלתי נשכח.', img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="group cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden mb-6 border border-brand-gold/10">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-xl font-serif tracking-widest mb-2">EXPERIENCE – {item.title}</h3>
                <p className="text-sm text-brand-black/50 italic">{item.focus}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Journey Teaser */}
      <section className="py-40 px-6 bg-brand-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=2000" 
            alt="Journey" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-sm tracking-[0.4em] uppercase text-brand-gold mb-8">למי שמחפש יותר</h2>
          <h3 className="text-5xl md:text-7xl font-serif font-light mb-12 leading-tight">THE JOURNEY</h3>
          <p className="text-lg text-white/60 mb-16 max-w-2xl mx-auto font-light leading-relaxed">
            זה לא משחק. זה לא ערב קליל. <br />
            זהו מסע עמוק ופרטי בן 7 פרקים אל תוך הלב שלכם.
          </p>
          <Link 
            to="/journey"
            className="inline-block px-12 py-5 border border-white/20 text-white uppercase tracking-[0.3em] text-xs hover:border-brand-gold hover:text-brand-gold transition-all duration-500"
          >
            כניסה למסע
          </Link>
        </div>
      </section>

      {/* Personal Area Explanation */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-serif mb-8 leading-tight">המרחב הדיגיטלי הפרטי שלכם</h2>
            <p className="text-lg text-brand-black/70 mb-8 leading-relaxed">
              כל מארז פיזי הוא רק ההתחלה. בתוך האזור האישי תמצאו עולם שלם של תוכן מודרך, משימות אינטראקטיביות, 
              יומן זוגי דיגיטלי ומערכת התקדמות שתלווה אתכם לאורך כל הדרך.
            </p>
            <Link to="/dashboard" className="text-brand-gold border-b border-brand-gold pb-1 tracking-widest uppercase text-sm font-medium">
              גלו את האזור האישי
            </Link>
          </div>
          <div className="aspect-square bg-brand-cream p-12 flex items-center justify-center border border-brand-gold/5">
             <div className="w-full h-full border border-brand-gold/20 flex items-center justify-center">
                <span className="text-brand-gold/20 font-serif text-8xl">BI</span>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

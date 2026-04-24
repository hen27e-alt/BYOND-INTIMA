import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Gamepad2, ChevronLeft, Play, Heart, HelpCircle, RotateCw, Layers, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditableText } from '../components/EditableText';
import { EditableImage } from '../components/EditableImage';
import { useLanguage } from '../contexts/LanguageContext';
import { CoupleTrivia } from '../components/CoupleTrivia';
import { TruthOrDare } from '../components/games/TruthOrDare';
import { SpinTheWheel } from '../components/games/SpinTheWheel';
import { UnoGame } from '../components/games/UnoGame';
import { MissionGame } from '../components/games/MissionGame';

export const Games = () => {
  const [code, setCode] = React.useState('');
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [error, setError] = React.useState(false);
  const { t, language } = useLanguage();

  const correctCode = '2026'; // A thematic code

  const [selectedGame, setSelectedGame] = React.useState<string | null>(null);

  const games = [
    {
      id: 'mission-game',
      title: language === 'he' ? 'משימת נכסים' : 'Asset Mission',
      category: language === 'he' ? 'משחק אסטרטגיה וחיבור' : 'Strategy & Connection',
      desc: language === 'he' ? 'בחרו זונים, רכשו נכסים ובצעו משימות זוגיות מרגשות ומקרבות.' : 'Choose zones, purchase assets, and perform exciting and bonding couple missions.',
      icon: <Sparkles size={24} />,
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800',
      component: <MissionGame />
    },
    {
      id: 'who-knows',
      title: language === 'he' ? 'טריוויה זוגית' : 'Couple Trivia',
      category: language === 'he' ? 'היכרות עמוקה' : 'Deep Connection',
      desc: language === 'he' ? 'מי מכיר את מי טוב יותר? ענו על שאלות וגלו עד כמה אתם באמת מסונכרנים.' : 'Who knows whom better? Answer questions and discover how synchronized you really are.',
      icon: <Heart size={24} />,
      image: 'https://images.unsplash.com/photo-1516589178581-6cd785320155?auto=format&fit=crop&q=80&w=800',
      component: <CoupleTrivia />
    },
    {
      id: 'truth-or-dare',
      title: language === 'he' ? 'אמת או חובה' : 'Truth or Dare',
      category: language === 'he' ? 'משחק נועז' : 'Bold Game',
      desc: language === 'he' ? 'גרסת הזוגות למשחק הקלאסי. שאלות חודרניות ומשימות שיעלו את הדופק.' : 'The couples version of the classic game. Penetrating questions and heart-pounding missions.',
      icon: <HelpCircle size={24} />,
      image: 'https://images.unsplash.com/photo-1518599904199-0ca897819ddb?auto=format&fit=crop&q=80&w=800',
      component: <TruthOrDare />
    },
    {
      id: 'spin-wheel',
      title: language === 'he' ? 'רולטת האהבה' : 'Love Roulette',
      category: language === 'he' ? 'ספונטניות' : 'Spontaneity',
      desc: language === 'he' ? 'תנו לגורל להחליט מה תהיה המשימה הבאה שלכם. סובבו את הגלגל וגלו.' : 'Let fate decide what your next mission will be. Spin the wheel and find out.',
      icon: <RotateCw size={24} />,
      image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800',
      component: <SpinTheWheel />
    },
    {
      id: 'uno-game',
      title: language === 'he' ? 'טאקי זוגי' : 'Couple Taki',
      category: language === 'he' ? 'משחק קלפים' : 'Card Game',
      desc: language === 'he' ? 'גרסה זוגית ויוקרתית למשחק הקלפים הקלאסי. שחקו אחד מול השנייה על מסך אחד.' : 'A luxurious couple version of the classic card game. Play against each other on one screen.',
      icon: <Layers size={24} />,
      image: 'https://images.unsplash.com/photo-1589802829985-817e51181b92?auto=format&fit=crop&q=80&w=800',
      component: <UnoGame />
    },
    {
      id: 'main',
      title: language === 'he' ? 'המשחק המקורי' : 'Original Game',
      category: language === 'he' ? 'חוויה זוגית' : 'Couple Experience',
      desc: language === 'he' ? 'החוויה המקורית של Byond Intima לחיבור עמוק (קישור חיצוני).' : 'The original Byond Intima experience for deep connection (external link).',
      url: 'https://hen27e-alt.github.io/bi/',
      icon: <Gamepad2 size={24} />,
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === correctCode) {
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setCode('');
      setTimeout(() => setError(false), 2000);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center p-6 pt-32 relative overflow-hidden" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-brand-gold/5 to-transparent rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              rotate: -360,
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-brand-gold/5 to-transparent rounded-full blur-3xl"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-brand-gold/20 p-12 rounded-[40px] text-center relative z-10 shadow-2xl shadow-brand-gold/5"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-24 h-24 bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-gold border border-brand-gold/30 shadow-lg shadow-brand-gold/20"
          >
            <Lock size={40} className="drop-shadow-lg" />
          </motion.div>
          <EditableText 
            contentId={`games_locked_title_${language}`}
            defaultText={language === 'he' ? 'אזור המשחקים' : 'Games Area'}
            as="h1"
            className="text-4xl font-serif text-white mb-4"
          />
          <EditableText 
            contentId={`games_locked_desc_${language}`}
            defaultText={language === 'he' ? 'הזינו את הקוד הסודי שקיבלתם במארז כדי לפתוח את המשחקים למנויים.' : 'Enter the secret code you received in the kit to unlock games for subscribers.'}
            as="p"
            className="text-white/60 mb-10 font-light leading-relaxed"
            multiline
          />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative">
              <input 
                type="password" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={language === 'he' ? 'הזינו קוד' : 'Enter code'}
                className={`w-full bg-black/20 border-2 rounded-2xl py-5 text-center text-2xl tracking-[0.5em] text-white focus:outline-none transition-all duration-300 ${
                  error ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-brand-gold/20 focus:border-brand-gold/60 focus:shadow-[0_0_20px_rgba(197,160,89,0.2)] focus:bg-black/40'
                }`}
              />
              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -bottom-6 left-0 right-0 text-red-400 text-xs uppercase tracking-widest"
                  >
                    <EditableText 
                      contentId={`games_locked_error_${language}`}
                      defaultText={language === 'he' ? 'קוד שגוי. נסו שוב.' : 'Incorrect code. Try again.'}
                      as="span"
                    />
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-brand-gold to-[#e5c687] text-brand-black font-black uppercase tracking-[0.3em] text-xs rounded-2xl hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] transition-all duration-300"
            >
              <EditableText 
                contentId={`games_locked_unlock_btn_${language}`}
                defaultText={language === 'he' ? 'פתיחת האזור' : 'Unlock Area'}
                as="span"
              />
            </motion.button>
          </form>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block mt-10">
            <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-brand-gold transition-colors text-[10px] uppercase tracking-widest group">
              <ChevronLeft size={14} className={`${language === 'he' || language === 'ar' ? 'group-hover:-translate-x-1' : 'rotate-180 group-hover:translate-x-1'} transition-transform`} />
              <EditableText 
                contentId={`games_locked_back_home_${language}`}
                defaultText={language === 'he' ? 'חזרה לדף הבית' : 'Back to Home'}
                as="span"
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    return (
      <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)] min-h-[600px] flex flex-col">
          <motion.button 
            whileHover={{ scale: 1.05, x: language === 'he' || language === 'ar' ? 5 : -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedGame(null)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-black/40 hover:text-brand-gold transition-colors mb-8 shrink-0 self-start"
          >
            <ChevronLeft size={14} className={language === 'he' || language === 'ar' ? '' : 'rotate-180'} />
            <EditableText 
              contentId={`games_detail_back_btn_${language}`}
              defaultText={language === 'he' ? 'חזרה לרשימת המשחקים' : 'Back to Games List'}
              as="span"
            />
          </motion.button>

          <div className="flex-grow relative">
            {game?.component ? (
              <div className="absolute inset-0">
                {game.component}
              </div>
            ) : (
              <div className="bg-white border border-brand-gold/10 rounded-3xl overflow-hidden shadow-2xl shadow-brand-gold/5 h-full flex flex-col">
                <div className="flex-grow relative bg-brand-black">
                  <iframe 
                    src={game?.url}
                    width="100%" 
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    style={{ borderRadius: '12px', overflow: 'hidden' }}
                    title={game?.title}
                  />
                </div>
                <div className="p-8 text-center shrink-0">
                  <EditableText 
                    contentId={`game_detail_title_${game?.id}_${language}`}
                    defaultText={language === 'he' ? 'תהנו מהחוויה!' : 'Enjoy the Experience!'}
                    as="h2"
                    className="text-2xl font-serif mb-2"
                  />
                  <EditableText 
                    contentId={`game_detail_desc_${game?.id}_${language}`}
                    defaultText={game?.desc || ''}
                    as="p"
                    className="text-brand-black/60 max-w-2xl mx-auto leading-relaxed text-sm"
                    multiline
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 text-brand-gold mb-4">
              <Gamepad2 size={24} />
              <EditableText 
                contentId={`games_unlocked_badge_${language}`}
                defaultText={language === 'he' ? 'משחקים למנויים' : 'Subscriber Games'}
                as="span"
                className="text-xs uppercase tracking-[0.3em] font-bold"
              />
            </div>
            <EditableText 
              contentId={`games_unlocked_title_${language}`}
              defaultText={language === 'he' ? 'ספריית המשחקים' : 'Games Library'}
              as="h1"
              className="text-5xl font-serif"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, x: language === 'he' || language === 'ar' ? 5 : -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsUnlocked(false)}
            className="text-xs uppercase tracking-widest text-brand-black/40 hover:text-brand-gold transition-colors"
          >
            <EditableText 
              contentId={`games_unlocked_lock_btn_${language}`}
              defaultText={language === 'he' ? 'נעילת אזור [X]' : 'Lock Area [X]'}
              as="span"
            />
          </motion.button>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {games.map((game, idx) => (
            <motion.div 
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedGame(game.id)}
              className="bg-white border border-brand-gold/10 rounded-3xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl hover:shadow-brand-gold/20 hover:border-brand-gold/40 transition-all flex flex-col h-full relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />
              <div className="aspect-video relative overflow-hidden z-10">
                <EditableImage 
                  contentId={`game_image_${game.id}`}
                  defaultSrc={game.image} 
                  alt={game.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-brand-black/40 group-hover:bg-brand-black/10 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                  <div className="w-16 h-16 bg-brand-gold/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-xl shadow-brand-gold/30">
                    <Play size={28} className={language === 'he' || language === 'ar' ? 'mr-1' : 'ml-1'} />
                  </div>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <EditableText 
                      contentId={`game_category_${game.id}_${language}`}
                      defaultText={game.category}
                      as="p"
                      className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mb-1"
                    />
                    <EditableText 
                      contentId={`game_title_${game.id}_${language}`}
                      defaultText={game.title}
                      as="h3"
                      className="text-2xl font-serif group-hover:text-brand-gold transition-colors"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border border-brand-gold/20 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all shrink-0 shadow-sm">
                    {game.icon || <Gamepad2 size={18} fill="currentColor" />}
                  </div>
                </div>
                <EditableText 
                  contentId={`game_desc_${game.id}_${language}`}
                  defaultText={game.desc}
                  as="p"
                  className="text-sm text-brand-black/60 leading-relaxed mt-auto"
                  multiline
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Layers, Sparkles, Heart, Users, Zap, Moon, Sun, Map, HelpCircle, ShoppingCart, Check, Plus, Minus, Trash2, ArrowRight, ArrowLeft, Info, Loader2, Eye, X, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { cardDecks } from '../data/decks';
import { EditableText } from '../components/EditableText';
import { useLanguage } from '../contexts/LanguageContext';

interface Notification {
  id: string;
  message: string;
  type: 'add' | 'remove';
}

export const CardDecks = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity: globalUpdateQuantity, cartCount } = useCart();
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('הכל');
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [flippedDecks, setFlippedDecks] = useState<Record<string, boolean>>({});
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const categories = [
    { id: 'all', name: language === 'he' ? 'הכל' : 'All' },
    { id: 'couples', name: language === 'he' ? 'זוגות' : 'Couples' },
    { id: 'parties', name: language === 'he' ? 'מסיבות' : 'Parties' },
    { id: 'friends', name: language === 'he' ? 'חברים' : 'Friends' },
    { id: 'kitchen', name: language === 'he' ? 'משימות מטבח' : 'Kitchen Missions' }
  ];

  const addNotification = (message: string, type: 'add' | 'remove') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleFlip = (id: string) => {
    setFlippedDecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = async (e: React.MouseEvent, deck: any) => {
    e.stopPropagation();
    const shareData = {
      title: `BYOND INTIMA - ${deck.name}`,
      text: deck.description,
      url: `${window.location.origin}/decks/${deck.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      const mailtoLink = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`;
      window.location.href = mailtoLink;
    }
  };

  const updateQuantity = async (e: React.MouseEvent, id: string, delta: number) => {
    e.stopPropagation();
    setLoadingActions(prev => ({ ...prev, [id]: true }));
    
    // Simulate processing time for visual feedback
    await new Promise(resolve => setTimeout(resolve, 600));

    globalUpdateQuantity(id, delta);

    const deck = cardDecks.find(d => d.id === id);
    if (delta > 0) {
      setLastAdded(id);
      addNotification(`BYOND ${deck?.name} נוסף לסל`, 'add');
      setTimeout(() => setLastAdded(null), 2000);
    } else {
      addNotification(`BYOND ${deck?.name} הוסר מהסל`, 'remove');
    }
    setLoadingActions(prev => ({ ...prev, [id]: false }));
  };

  const handleBuyNow = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLoadingActions(prev => ({ ...prev, [id]: true }));
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    globalUpdateQuantity(id, 1);
    setLoadingActions(prev => ({ ...prev, [id]: false }));
    navigate('/checkout');
  };

  const filteredDecks = cardDecks.filter(deck => {
    const matchesSearch = deck.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          deck.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'הכל' || activeCategory === 'All' || deck.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#1A1A1A] pt-32 pb-20 px-6 overflow-hidden" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Background Accent */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-gold rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-block px-4 py-1 border-2 border-brand-black text-brand-black text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <EditableText 
              contentId={`card_decks_badge_${language}`} 
              defaultText={language === 'he' ? 'קלפי חוויה' : 'Experience Cards'} 
              as="span"
            />
          </div>
          <EditableText 
            contentId={`card_decks_title_${language}`} 
            defaultText={language === 'he' ? 'BYOND קלפי חוויה' : 'BYOND Experience Cards'} 
            as="h1"
            className="text-5xl md:text-9xl font-serif font-black mb-8 tracking-tighter leading-none"
          />
          <EditableText 
            contentId={`card_decks_subtitle_${language}`} 
            defaultText={language === 'he' ? 'אוסף של משחקי קלפים בגודל כיס שנועדו לאינטראקציה חברתית, זוגות, חברים ורגעים בלתי נשכחים.' : 'A collection of pocket-sized card games designed for social interaction, couples, friends and unforgettable moments.'} 
            as="p"
            className="text-xl md:text-2xl text-brand-black/60 max-w-3xl mx-auto leading-relaxed font-medium"
          />
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-20 bg-white p-6 rounded-[2.5rem] shadow-sm border border-brand-black/5">
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-6 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-full border-2 ${
                  activeCategory === cat.name 
                    ? 'bg-brand-black text-white border-brand-black shadow-lg' 
                    : 'bg-transparent text-brand-black/40 border-brand-black/5 hover:border-brand-gold hover:text-brand-gold'
                }`}
              >
                <EditableText 
                  contentId={`card_decks_cat_${cat.id}_${language}`}
                  defaultText={cat.name}
                  as="span"
                />
              </motion.button>
            ))}
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-black/20" size={18} />
            <input 
              type="text"
              placeholder={language === 'he' ? 'חפשו חפיסה או משימה...' : 'Search for a deck or mission...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8F8F8] border-2 border-transparent py-4 pr-14 pl-6 text-sm font-bold outline-none focus:border-brand-gold transition-all rounded-2xl"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-32">
          {filteredDecks.map((deck, idx) => {
            const isInCart = (cart[deck.id]?.quantity || 0) > 0;
            const [showSample, setShowSample] = useState(false);
            
            return (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative group"
              >
                {/* Row Container with Black Background */}
                <motion.div 
                  animate={lastAdded === deck.id ? { scale: [1, 1.02, 1], borderColor: ['rgba(242, 125, 38, 0.1)', 'rgba(242, 125, 38, 0.5)', 'rgba(242, 125, 38, 0.1)'] } : {}}
                  transition={{ duration: 0.5 }}
                  whileHover={{ 
                    y: -5,
                    borderColor: 'rgba(242, 125, 38, 0.2)',
                    transition: { duration: 0.4 }
                  }}
                  className="bg-brand-black rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl flex flex-col lg:flex-row items-center min-h-[500px] relative transition-colors duration-500"
                >
                  {/* Subtle Background Texture */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                  
                  {/* Left Side: Visual Area (Gold Card) */}
                  <div className="w-full lg:w-1/2 h-[400px] lg:h-full relative flex items-center justify-center p-12 overflow-visible">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-brand-gold/5 blur-[100px] rounded-full group-hover:bg-brand-gold/10 transition-colors duration-700" />
                    
                    {/* The Main Deck Box (Gold/Premium) */}
                    <motion.div
                      whileHover={{ scale: 1.05, rotateY: -15, rotateX: 5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/decks/${deck.id}`)}
                      className="relative w-64 h-96 bg-gradient-to-br from-brand-gold via-brand-gold/80 to-brand-gold rounded-3xl shadow-[0_20px_50px_rgba(242,125,38,0.3)] cursor-pointer border border-white/20 flex flex-col items-center justify-center p-8 z-10 transition-shadow duration-500 hover:shadow-[0_30px_70px_rgba(242,125,38,0.5)]"
                    >
                      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] rounded-3xl" />
                      <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(e, deck.id);
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${wishlist.has(deck.id) ? 'bg-brand-gold text-brand-black shadow-[0_0_15px_rgba(242,125,38,0.4)]' : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'}`}
                        >
                          <Heart size={18} fill={wishlist.has(deck.id) ? 'currentColor' : 'none'} />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleShare(e, deck)}
                          className="w-10 h-10 rounded-full bg-white/10 text-white/40 hover:bg-white/20 hover:text-white flex items-center justify-center transition-all"
                        >
                          <Share2 size={18} />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSample(!showSample);
                          }}
                          className="w-10 h-10 rounded-full bg-white/10 text-white/40 flex items-center justify-center hover:bg-brand-gold hover:text-brand-black transition-all"
                          title={language === 'he' ? 'הצגת קלף לדוגמה' : 'Show sample card'}
                        >
                          <Eye size={18} />
                        </motion.button>
                      </div>

                      <div className="relative z-10 text-brand-black/80">
                        {React.cloneElement(deck.icon as React.ReactElement<any>, { size: 100, strokeWidth: 1 })}
                      </div>
                      <div className="absolute bottom-10 text-center z-10">
                        <EditableText 
                          contentId={`deck_${deck.id}_name_${language}`}
                          defaultText={deck.name}
                          as="h3"
                          className="text-3xl font-serif text-brand-black font-black italic tracking-tighter"
                        />
                        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-black/40 mt-2">
                          <EditableText 
                            contentId={`deck_click_details_${language}`}
                            defaultText={language === 'he' ? 'לחצו לפרטים המלאים' : 'Click for full details'}
                            as="span"
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Sample Card Pop-out Animation */}
                    <AnimatePresence>
                      {showSample && (
                        <motion.div
                          initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.8 }}
                          animate={{ opacity: 1, x: language === 'he' || language === 'ar' ? 140 : -140, y: -60, rotate: language === 'he' || language === 'ar' ? 12 : -12, scale: 1 }}
                          exit={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.8 }}
                          className="absolute z-20 w-60 h-84 bg-white rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.4)] border border-brand-gold/20 p-10 flex flex-col justify-between cursor-pointer"
                          onClick={() => setShowSample(false)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="text-brand-gold">
                              <Sparkles size={24} />
                            </div>
                            <div className="text-[10px] font-black text-brand-gold/40">#01</div>
                          </div>
                          
                          <div className="text-center space-y-6">
                            <EditableText 
                              contentId={`deck_${deck.id}_sample_text_${language}`}
                              defaultText={language === 'he' ? '"מהו הרגע שבו הרגשת הכי קרוב/ה אליי בשבוע האחרון?"' : '"What was the moment you felt closest to me in the last week?"'}
                              as="p"
                              className="text-brand-black font-serif italic text-xl leading-relaxed"
                              multiline
                            />
                            <div className="h-px w-12 bg-brand-gold/30 mx-auto" />
                          </div>

                          <div className="space-y-4">
                            <div className="text-[8px] font-black uppercase tracking-widest text-brand-black/20 text-center">
                              BYOND <EditableText contentId={`deck_${deck.id}_name_${language}`} defaultText={deck.name} as="span" />
                            </div>
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-brand-gold/20" />)}
                            </div>
                          </div>
                          
                          {/* Close button */}
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-4 right-4 text-brand-black/10 hover:text-brand-gold transition-colors"
                          >
                            <X size={16} />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right Side: Details Area */}
                  <div className="w-full lg:w-1/2 p-12 lg:p-20 text-right">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 justify-end">
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">
                            <EditableText 
                              contentId={`deck_${deck.id}_category_${language}`}
                              defaultText={deck.category}
                              as="span"
                            />
                          </span>
                          <div className="h-px w-12 bg-brand-gold/20" />
                        </div>
                        <Link to={`/decks/${deck.id}`} className="block group/title">
                          <h2 className="text-5xl md:text-7xl font-serif text-white leading-none group-hover/title:text-brand-gold transition-colors">
                            BYOND <EditableText contentId={`deck_${deck.id}_name_${language}`} defaultText={deck.name} as="span" className="italic text-brand-gold group-hover/title:text-white transition-colors" />
                          </h2>
                        </Link>
                        <EditableText 
                          contentId={`deck_${deck.id}_description_${language}`}
                          defaultText={deck.description}
                          as="p"
                          className="text-xl text-white/60 max-w-xl leading-relaxed font-medium"
                          multiline
                        />
                      </div>

                      <div className="flex flex-wrap gap-3 justify-end">
                        {deck.perfectFor.map((tag, i) => (
                          <span key={i} className="px-4 py-1.5 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 rounded-full">
                            <EditableText 
                              contentId={`deck_${deck.id}_tag_${i}_${language}`}
                              defaultText={tag}
                              as="span"
                            />
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-8 justify-end pt-4">
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-white/20 line-through">
                            <EditableText contentId={`deck_${deck.id}_old_price_${language}`} defaultText="₪149" as="span" />
                          </span>
                          <span className="text-4xl font-serif font-bold text-brand-gold">
                            <EditableText contentId={`deck_${deck.id}_price_${language}`} defaultText="₪119" as="span" />
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {isInCart ? (
                            <div className="flex items-center bg-white/5 rounded-2xl p-2 border border-white/10 shadow-sm">
                              <button 
                                disabled={loadingActions[deck.id]}
                                onClick={(e) => updateQuantity(e, deck.id, -1)}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-brand-gold hover:text-brand-black transition-all disabled:opacity-50"
                              >
                                {loadingActions[deck.id] ? <Loader2 size={18} className="animate-spin" /> : <Minus size={18} />}
                              </button>
                              <span className="w-12 text-center text-xl font-bold text-white tabular-nums">{cart[deck.id]?.quantity || 0}</span>
                              <button 
                                disabled={loadingActions[deck.id]}
                                onClick={(e) => updateQuantity(e, deck.id, 1)}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-gold text-brand-black hover:bg-white transition-all disabled:opacity-50"
                              >
                                {loadingActions[deck.id] ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-4">
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={loadingActions[deck.id]}
                                onClick={(e) => updateQuantity(e, deck.id, 1)}
                                className="btn-outline-premium !border-white/20 !text-white hover:!bg-brand-gold hover:!text-brand-black flex items-center gap-3"
                              >
                                {loadingActions[deck.id] ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <ShoppingCart size={16} />
                                )}
                                <EditableText 
                                  contentId={`deck_add_to_cart_${language}`}
                                  defaultText={language === 'he' ? 'הוספה לסל' : 'Add to Cart'}
                                  as="span"
                                />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={loadingActions[deck.id]}
                                onClick={(e) => handleBuyNow(e, deck.id)}
                                className="btn-premium !bg-brand-gold !text-brand-black hover:!bg-white flex items-center gap-3"
                              >
                                {loadingActions[deck.id] ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Zap size={16} />
                                )}
                                <EditableText 
                                  contentId={`deck_buy_now_${language}`}
                                  defaultText={language === 'he' ? 'קנייה מהירה' : 'Buy Now'}
                                  as="span"
                                />
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-6">
                        <Link 
                          to={`/decks/${deck.id}`}
                          className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold hover:text-white transition-colors flex items-center justify-end gap-3 group/link"
                        >
                          <EditableText 
                            contentId={`deck_full_details_btn_${language}`}
                            defaultText={language === 'he' ? 'לפרטים המלאים על החפיסה' : 'Full details about the deck'}
                            as="span"
                          />
                          <ArrowLeft size={14} className={language === 'he' || language === 'ar' ? '' : 'rotate-180'} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Mystery Cards Highlight */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-40 bg-white rounded-[4rem] p-12 md:p-24 relative overflow-hidden border border-brand-gold/10 shadow-sm"
        >
          <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
            <Sparkles size={400} className="text-brand-gold" />
          </div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-4 mb-8 text-brand-gold">
                <Layers size={32} />
                <EditableText 
                  contentId={`mystery_badge_${language}`}
                  defaultText={language === 'he' ? 'גורם המסתורין' : 'The Mystery Factor'}
                  as="span"
                  className="text-xs font-black uppercase tracking-[0.4em]"
                />
              </div>
              <EditableText 
                contentId={`mystery_title_${language}`}
                defaultText={language === 'he' ? '10 קלפי מסתורין בכל חפיסה' : '10 Mystery Cards in every deck'}
                as="h2"
                className="text-5xl md:text-7xl font-serif mb-8 leading-tight italic text-brand-black"
                multiline
              />
              <EditableText 
                contentId={`mystery_description_${language}`}
                defaultText={language === 'he' ? 'האלמנט שמשנה את הכל. קלפי המסתורין מציגים תפניות לא צפויות, הפתעות ושינויי חוקים שיוצרים רגעים של צחוק ומתח שאי אפשר לצפות מראש.' : 'The element that changes everything. Mystery cards present unexpected twists, surprises and rule changes that create moments of laughter and tension that cannot be anticipated.'}
                as="p"
                className="text-xl text-brand-black/40 mb-12 leading-relaxed font-medium"
                multiline
              />
              
              <div className="grid gap-6">
                {[
                  { id: 'swap', text: language === 'he' ? 'החלפת קלפים עם שחקן אחר' : 'Swap cards with another player', icon: <Sparkles size={20} />, delay: 0.1 },
                  { id: 'skip', text: language === 'he' ? 'דילוג על אתגר' : 'Skip a challenge', icon: <Zap size={20} />, delay: 0.2 },
                  { id: 'double', text: language === 'he' ? 'הכפלת המשימה' : 'Double the mission', icon: <Layers size={20} />, delay: 0.3 },
                  { id: 'choose', text: language === 'he' ? 'בחירת שחקן אחר לביצוע האתגר' : 'Choose another player to perform the challenge', icon: <Users size={20} />, delay: 0.4 },
                  { id: 'chaos', text: language === 'he' ? 'קלפי כאוס שמשנים את חוקי הסיבוב' : 'Chaos cards that change the round rules', icon: <Zap size={20} />, delay: 0.5 }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: item.delay }}
                    whileHover={{ x: language === 'he' || language === 'ar' ? -15 : 15, backgroundColor: 'rgba(242, 125, 38, 0.02)' }}
                    className="flex items-center gap-6 bg-brand-cream/30 p-6 rounded-[2rem] border border-brand-gold/5 hover:border-brand-gold/20 transition-all duration-500 shadow-sm"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-gold shadow-sm">
                      {item.icon}
                    </div>
                    <EditableText 
                      contentId={`mystery_item_${item.id}_${language}`}
                      defaultText={item.text}
                      as="span"
                      className="text-lg font-bold text-brand-black/80"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative aspect-square">
              <div className="absolute inset-0 bg-brand-gold/5 rounded-full blur-[100px]" />
              <div className="relative h-full flex items-center justify-center">
                <motion.div 
                  animate={{ 
                    rotateY: [0, 180, 360],
                    y: [0, -20, 0]
                  }}
                  transition={{ 
                    duration: 10, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="w-64 h-96 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-brand-gold/20"
                >
                  <div className="text-brand-gold text-6xl font-serif font-black">?</div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <div className="fixed top-24 left-6 z-[60] space-y-4 pointer-events-none">
          <AnimatePresence>
            {notifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.8 }}
                className="pointer-events-auto"
              >
                <div className={`
                  flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl
                  ${notification.type === 'add' 
                    ? 'bg-brand-black/90 border-brand-gold/20 text-white' 
                    : 'bg-white/90 border-brand-black/10 text-brand-black'}
                `}>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${notification.type === 'add' ? 'bg-brand-gold text-brand-black' : 'bg-brand-black text-white'}
                  `}>
                    {notification.type === 'add' ? <Check size={16} /> : <Trash2 size={16} />}
                  </div>
                  <p className="text-sm font-bold">{notification.message}</p>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeNotification(notification.id)}
                    className="p-1 hover:opacity-60 transition-opacity"
                  >
                    <X size={14} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Floating Cart Badge */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: 20 }}
              className="fixed bottom-8 right-8 z-50"
            >
              <Link 
                to="/checkout"
                className="bg-brand-black text-white p-6 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 border-2 border-brand-gold relative"
              >
                <ShoppingCart size={24} />
                <motion.span 
                  key={cartCount}
                  initial={{ scale: 1.5, backgroundColor: '#fff' }}
                  animate={{ scale: 1, backgroundColor: '#F27D26' }}
                  className="absolute -top-2 -right-2 bg-brand-gold text-brand-black text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                >
                  {cartCount}
                </motion.span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

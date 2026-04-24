import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShoppingCart, Check, Star, Shield, Truck, Zap, Plus, Minus, Loader2 } from 'lucide-react';
import { cardDecks } from '../data/decks';
import { useCart } from '../contexts/CartContext';
import { EditableText } from '../components/EditableText';
import { useLanguage } from '../contexts/LanguageContext';

export const DeckDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cart, updateQuantity } = useCart();
  const { t, language } = useLanguage();
  const [loading, setLoading] = React.useState(false);
  
  const deck = cardDecks.find(d => d.id === id);

  if (!deck) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-6" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
        <EditableText 
          contentId={`deck_not_found_title_${language}`}
          defaultText={language === 'he' ? 'החפיסה לא נמצאה' : 'Deck not found'}
          as="h1"
          className="text-4xl font-serif font-black mb-4"
        />
        <Link to="/decks" className="text-brand-gold hover:underline">
          <EditableText 
            contentId={`deck_not_found_back_link_${language}`}
            defaultText={language === 'he' ? 'חזרה לכל החפיסות' : 'Back to all decks'}
            as="span"
          />
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    updateQuantity(deck.id, 1);
    setLoading(false);
  };

  const handleBuyNow = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    updateQuantity(deck.id, 1);
    setLoading(false);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#F8F8F8]" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6">
        <Link 
          to="/decks" 
          className="inline-flex items-center gap-2 text-brand-black/40 hover:text-brand-gold transition-colors mb-12 group"
        >
          <ArrowRight size={20} className={`${language === 'he' || language === 'ar' ? 'group-hover:translate-x-1' : 'rotate-180 group-hover:-translate-x-1'} transition-transform`} />
          <EditableText 
            contentId={`deck_detail_back_btn_${language}`}
            defaultText={language === 'he' ? 'חזרה לכל החפיסות' : 'Back to all decks'}
            as="span"
            className="text-[10px] font-black uppercase tracking-widest"
          />
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Image/Visual Section */}
          <motion.div 
            initial={{ opacity: 0, x: language === 'he' || language === 'ar' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div 
              className="aspect-[3/4] rounded-[3rem] shadow-2xl bg-white flex items-center justify-center text-brand-black relative overflow-hidden group border border-brand-gold/10"
            >
              <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              <motion.div 
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 2, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10 text-brand-gold/60"
              >
                {React.cloneElement(deck.icon as React.ReactElement<any>, { size: 200, strokeWidth: 1 })}
              </motion.div>
              
              <div className="absolute bottom-12 left-0 right-0 text-center">
                <h2 className="text-6xl font-serif font-black tracking-tighter italic text-brand-black">
                  BYOND <EditableText contentId={`deck_${deck.id}_name_${language}`} defaultText={deck.name} as="span" />
                </h2>
              </div>
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div 
            initial={{ opacity: 0, x: language === 'he' || language === 'ar' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-gold/20">
                  <EditableText 
                    contentId={`deck_${deck.id}_category_${language}`}
                    defaultText={deck.category}
                    as="span"
                  />
                </span>
                <div className="flex items-center gap-1 text-brand-gold">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
              </div>
              
              <EditableText 
                contentId={`deck_detail_title_${deck.id}_${language}`}
                defaultText={`BYOND ${deck.name}`}
                as="h1"
                className="text-5xl md:text-7xl font-serif font-black tracking-tighter leading-none"
              />
              
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-serif font-bold text-brand-black">
                  <EditableText contentId={`deck_${deck.id}_price_${language}`} defaultText="₪119" as="span" />
                </span>
                <span className="text-xl text-brand-black/20 line-through">
                  <EditableText contentId={`deck_${deck.id}_old_price_${language}`} defaultText="₪149" as="span" />
                </span>
              </div>

              <EditableText 
                contentId={`deck_${deck.id}_long_description_${language}`}
                defaultText={deck.longDescription || deck.description}
                as="p"
                className="text-xl text-brand-black/60 leading-relaxed font-medium"
                multiline
              />
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-6">
              {(deck.features || [
                language === 'he' ? '40 קלפי חוויה' : '40 Experience Cards',
                language === 'he' ? '10 קלפי מסתורין' : '10 Mystery Cards',
                language === 'he' ? 'עיצוב פרימיום' : 'Premium Design',
                language === 'he' ? 'משלוח מהיר' : 'Fast Shipping'
              ]).map((feature, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-brand-black/5">
                  <div className="w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold shrink-0">
                    <Check size={16} />
                  </div>
                  <EditableText 
                    contentId={`deck_${deck.id}_feature_${i}_${language}`}
                    defaultText={feature}
                    as="span"
                    className="text-sm font-bold text-brand-black/80"
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-6 pt-8 border-t border-brand-black/5">
              {cart[deck.id]?.quantity ? (
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-white rounded-2xl p-2 border border-brand-black/10 shadow-sm">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(deck.id, -1)}
                      className="w-12 h-12 flex items-center justify-center hover:text-brand-gold transition-colors"
                    >
                      <Minus size={20} />
                    </motion.button>
                    <span className="w-12 text-center text-xl font-black tabular-nums">{cart[deck.id].quantity}</span>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(deck.id, 1)}
                      className="w-12 h-12 flex items-center justify-center hover:text-brand-gold transition-colors"
                    >
                      <Plus size={20} />
                    </motion.button>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-grow">
                    <Link 
                      to="/checkout"
                      className="w-full py-5 bg-brand-black text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-gold transition-all shadow-xl flex items-center justify-center gap-3"
                    >
                      <EditableText 
                        contentId={`deck_detail_go_to_cart_${language}`}
                        defaultText={language === 'he' ? 'מעבר לסל הקניות' : 'Go to Cart'}
                        as="span"
                      />
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    onClick={handleAddToCart}
                    className="flex-grow py-6 bg-white text-brand-black border-2 border-brand-black text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-black hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                    <EditableText 
                      contentId={`deck_detail_add_to_cart_${language}`}
                      defaultText={language === 'he' ? 'הוספה לסל' : 'Add to Cart'}
                      as="span"
                    />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    onClick={handleBuyNow}
                    className="flex-grow py-6 bg-brand-gold text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-black transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                    <EditableText 
                      contentId={`deck_detail_buy_now_${language}`}
                      defaultText={language === 'he' ? 'קנו עכשיו' : 'Buy Now'}
                      as="span"
                    />
                  </motion.button>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-brand-black/5">
              <div className="flex flex-col items-center text-center gap-2">
                <Shield size={24} className="text-brand-black/20" />
                <EditableText 
                  contentId={`trust_badge_secure_${language}`}
                  defaultText={language === 'he' ? 'רכישה מאובטחת' : 'Secure Purchase'}
                  as="span"
                  className="text-[9px] font-black uppercase tracking-widest text-brand-black/40"
                />
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Truck size={24} className="text-brand-black/20" />
                <EditableText 
                  contentId={`trust_badge_shipping_${language}`}
                  defaultText={language === 'he' ? 'משלוח מהיר' : 'Fast Shipping'}
                  as="span"
                  className="text-[9px] font-black uppercase tracking-widest text-brand-black/40"
                />
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Star size={24} className="text-brand-black/20" />
                <EditableText 
                  contentId={`trust_badge_premium_${language}`}
                  defaultText={language === 'he' ? 'איכות פרימיום' : 'Premium Quality'}
                  as="span"
                  className="text-[9px] font-black uppercase tracking-widest text-brand-black/40"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

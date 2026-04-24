import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ShoppingCart, Star, Sparkles, Info, Ruler, Droplets, ChevronDown, ChevronUp, Filter, Tag, Gift, PenTool, X, Trash2, Plus, Minus, ArrowRight, Loader2, Heart } from 'lucide-react';
import { EditableText } from '../components/EditableText';
import { EditableImage } from '../components/EditableImage';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useUI } from '../contexts/UIContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAlert } from '../components/AlertModal';
import { cn } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Checkout } from '../components/Checkout';
import { SITE_IMAGES } from '../constants/assets';

const CATEGORIES = [
  { id: 'all', name: { he: 'הכל', en: 'All' } },
  { id: 'experience', name: { he: 'מארזי חוויה', en: 'Experience Kits' } },
  { id: 'premium', name: { he: 'בלעדי ל-Premium', en: 'Premium Exclusive' } },
  { id: 'lifestyle', name: { he: 'לייף סטייל', en: 'Lifestyle' } },
  { id: 'bedroom', name: { he: 'חדר שינה', en: 'Bedroom' } },
  { id: 'atmosphere', name: { he: 'אווירה', en: 'Atmosphere' } },
  { id: 'personalization', name: { he: 'פרסונליזציה', en: 'Personalization' } },
  { id: 'smart', name: { he: 'מוצרים חכמים', en: 'Smart' } },
];

export const Boutique = () => {
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, promoCode, applyPromoCode, discountAmount } = useCart();
  const { language } = useLanguage();
  const { isPurchaseMode } = useUI();
  const { showAlert } = useAlert();
  const { updateProfile, profile } = useFirebase();
  const favoriteProducts = profile?.favoriteProducts || [];
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [personalization, setPersonalization] = useState<Record<string, { name: string; dedication: string }>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  React.useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const cartItems = Object.entries(cart).map(([id, data]) => ({ id, ...data }));
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => {
    const product = products.find(p => p.id === item.id);
    return acc + (product?.price || 0) * item.quantity;
  }, 0);
  const totalPrice = subtotal - discountAmount;

  const handleApplyPromo = () => {
    showAlert(
      language === 'he' ? 'קוד קופון זה אינו תקף כרגע.' : 'This promo code is not valid at the moment.',
      language === 'he' ? 'קוד לא תקין' : 'Invalid Code'
    );
  };

  const toggleFavoriteProduct = async (productId: string) => {
    if (!profile) return;
    const isFavorite = favoriteProducts.includes(productId);
    const newFavorites = isFavorite
      ? favoriteProducts.filter((id: string) => id !== productId)
      : [...favoriteProducts, productId];
    
    try {
      await updateProfile({ favoriteProducts: newFavorites });
      showAlert(
        isFavorite 
          ? (language === 'he' ? 'המוצר הוסר מהמועדפים' : 'Product removed from favorites')
          : (language === 'he' ? 'המוצר נוסף למובחרים שלך' : 'Product added to your favorites'),
        language === 'he' ? 'מועדפים' : 'Favorites'
      );
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const filteredProducts = useMemo(() => {
    console.log("Boutique - Profile:", profile);
    console.log("Boutique - Active Category:", activeCategory);
    console.log("Boutique - Total Products in Data:", products.length);
    
    // If not in purchase mode, hide premium products unless they are in the 'all' view
    // Actually, let's show them but with a lock if not in purchase mode
    if (activeCategory === 'premium') {
      const filtered = products.filter(p => p.isPremium);
      console.log("Boutique - Filtered (premium):", filtered.length);
      return filtered;
    }
    
    if (activeCategory === 'all') {
      console.log("Boutique - Returning all products:", products.length);
      return products;
    }
    
    const filtered = products.filter(p => p.category === activeCategory);
    console.log(`Boutique - Filtered (${activeCategory}):`, filtered.length);
    return filtered;
  }, [activeCategory, profile, products]);

  const toggleDetails = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const handlePersonalizationChange = (productId: string, field: 'name' | 'dedication', value: string) => {
    setPersonalization(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-brand-black text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center gap-2 mb-6"
          >
            <Sparkles className="text-brand-gold" size={24} />
            <span className="text-brand-gold tracking-[0.3em] uppercase text-sm font-medium">
              Premium Collection
            </span>
            <Sparkles className="text-brand-gold" size={24} />
          </motion.div>
          
          <EditableText
            contentId="boutique_title"
            defaultText="BYOND BOUTIQUE"
            as="h1"
            className="text-5xl md:text-7xl font-serif mb-6 tracking-wider"
          />
          
          <EditableText
            contentId="boutique_subtitle"
            defaultText="מוצרים נלווים באיכות פרימיום, המעוצבים בקפידה כדי להשלים את החוויה הזוגית שלכם."
            as="p"
            className="text-xl text-white/60 max-w-2xl mx-auto font-light"
            multiline
          />

          {isPurchaseMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-brand-gold/10 border border-brand-gold rounded-full"
            >
              <div className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
              <span className="text-brand-gold text-sm font-bold uppercase tracking-widest">
                {language === 'he' ? 'חבר פרימיום פעיל' : 'Premium Member Active'}
              </span>
            </motion.div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2 text-white/40 mr-4">
            <Filter size={18} />
            <span className="text-sm uppercase tracking-widest">{language === 'he' ? 'סינון:' : 'Filter:'}</span>
          </div>
          {CATEGORIES.map(cat => {
            if (cat.id === 'premium' && !isPurchaseMode) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-6 py-2 rounded-full border transition-all duration-300 text-sm font-medium",
                  activeCategory === cat.id
                    ? "bg-brand-gold border-brand-gold text-brand-black"
                    : "bg-white/5 border-white/10 text-white/60 hover:border-brand-gold/50 hover:text-white"
                )}
              >
                {cat.name[language as 'he' | 'en']}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-brand-gold mb-4" size={48} />
              <p className="text-white/40 font-serif italic">טוען את הקולקציה...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => {
              const cartItem = cart[product.id];
              const quantity = cartItem?.quantity || 0;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onHoverStart={() => setHoveredProductId(product.id)}
                  onHoverEnd={() => setHoveredProductId(null)}
                  whileHover={{ 
                    y: -10, 
                    boxShadow: "0 20px 25px -5px rgba(212, 175, 55, 0.1), 0 10px 10px -5px rgba(212, 175, 55, 0.04)" 
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-brand-gold/30 transition-all flex flex-col"
                >
                  <div className="aspect-square overflow-hidden relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={hoveredProductId === product.id && product.hoverImage ? 'hover' : 'default'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full"
                      >
                        <EditableImage
                          contentId={`boutique_product_${product.id}_image`}
                          defaultSrc={hoveredProductId === product.id && product.hoverImage ? product.hoverImage : product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Live Personalization Preview */}
                    {product.personalizable && personalization[product.id]?.name && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        <div className="bg-white/10 backdrop-blur-[2px] px-4 py-2 rounded border border-white/20 transform -rotate-12">
                          <span className="text-white font-serif text-lg tracking-widest opacity-80 drop-shadow-lg">
                            {personalization[product.id].name}
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Logo Overlay for specific products */}
                    {(product.id === 'boutique_wine_glasses' || product.id === 'boutique_cocktail_set') && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-40 pointer-events-none">
                        <span className="text-[10px] font-serif tracking-[0.5em] text-white uppercase">BYOND</span>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                      <div className="bg-brand-black/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                        <span className="text-brand-gold font-serif">₪{product.price}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteProduct(product.id);
                        }}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all bg-brand-black/80 backdrop-blur-sm border border-white/10 group/fav",
                          favoriteProducts.includes(product.id) ? "text-red-500 border-red-500/30" : "text-white/40 hover:text-brand-gold"
                        )}
                      >
                        <Heart size={18} fill={favoriteProducts.includes(product.id) ? "currentColor" : "none"} className={cn("transition-transform group-hover/fav:scale-110")} />
                      </button>
                    </div>
                    {product.isPremium && (
                      <div className="absolute top-4 left-4 bg-brand-gold text-brand-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg">
                        <Sparkles size={10} />
                        Premium
                      </div>
                    )}
                    {product.category === 'personalization' && !product.isPremium && (
                      <div className="absolute top-4 left-4 bg-brand-gold text-brand-black p-2 rounded-full shadow-lg">
                        <PenTool size={16} />
                      </div>
                    )}
                  </div>

                  <div className="p-8 flex-grow flex flex-col">
                    <div className="flex-grow">
                      <EditableText
                        contentId={`${product.id}_name`}
                        defaultText={product.name}
                        as="h3"
                        className="text-2xl font-serif mb-3"
                      />
                      
                      <p className="text-white/60 text-sm mb-4 italic leading-relaxed">
                        {product.description}
                      </p>

                      {/* Reviews */}
                      <div className="flex items-center gap-2 mb-6">
                        <div className="flex items-center text-brand-gold">
                          <Star size={14} className="fill-current" />
                          <span className="ml-1 text-sm font-medium">{product.reviews.rating}</span>
                        </div>
                        <span className="text-white/40 text-xs">({product.reviews.count} {language === 'he' ? 'ביקורות' : 'reviews'})</span>
                      </div>

                      {/* Personalization Section */}
                      {product.personalizable && (
                        <div className="mb-6 space-y-3 p-4 bg-brand-gold/5 rounded-xl border border-brand-gold/20">
                          <div className="flex items-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-widest mb-2">
                            <Sparkles size={12} />
                            {language === 'he' ? 'התאמה אישית' : 'Personalization'}
                          </div>
                          <input
                            type="text"
                            placeholder={language === 'he' ? 'שם לחריטה' : 'Name to engrave'}
                            value={personalization[product.id]?.name || ''}
                            onChange={(e) => handlePersonalizationChange(product.id, 'name', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-brand-gold outline-none transition-colors"
                          />
                          <textarea
                            placeholder={language === 'he' ? 'הקדשה אישית' : 'Personal dedication'}
                            value={personalization[product.id]?.dedication || ''}
                            onChange={(e) => handlePersonalizationChange(product.id, 'dedication', e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-brand-gold outline-none transition-colors h-20 resize-none"
                          />
                        </div>
                      )}

                      {/* Details Toggle */}
                      <button 
                        onClick={() => toggleDetails(product.id)}
                        className="flex items-center justify-between w-full py-3 border-t border-white/10 text-sm text-white/80 hover:text-brand-gold transition-colors mb-6"
                      >
                        <span>{language === 'he' ? 'פרטים נוספים ומפרט' : 'Details & Specs'}</span>
                        {expandedProduct === product.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      <AnimatePresence>
                        {expandedProduct === product.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-6"
                          >
                            <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5 text-sm">
                              <div className="flex items-start gap-3">
                                <Info size={16} className="text-brand-gold shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-white/40 block text-xs mb-0.5">{language === 'he' ? 'חומרים' : 'Material'}</span>
                                  <span className="text-white/90">{product.material}</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <Ruler size={16} className="text-brand-gold shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-white/40 block text-xs mb-0.5">{language === 'he' ? 'מידות' : 'Dimensions'}</span>
                                  <span className="text-white/90">{product.dimensions}</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <Droplets size={16} className="text-brand-gold shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-white/40 block text-xs mb-0.5">{language === 'he' ? 'הוראות טיפול' : 'Care'}</span>
                                  <span className="text-white/90">{product.care}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {quantity > 0 ? (
                      <div className="flex items-center justify-between bg-white/5 rounded-full p-2 border border-brand-gold/30">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-brand-gold"
                        >
                          -
                        </button>
                        <span className="font-serif text-lg w-12 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-brand-gold"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product.id, personalization[product.id])}
                        disabled={product.isPremium && !isPurchaseMode}
                        className={cn(
                          "w-full py-4 rounded-full border border-white/20 transition-all duration-300 flex items-center justify-center gap-2 group/btn",
                          product.isPremium && !isPurchaseMode
                            ? "opacity-50 cursor-not-allowed bg-white/5"
                            : "hover:border-brand-gold hover:bg-brand-gold hover:text-brand-black"
                        )}
                      >
                        {product.isPremium && !isPurchaseMode ? (
                          <>
                            <ShoppingCart size={18} />
                            <span>{language === 'he' ? 'בלעדי למנויי פרימיום' : 'Premium Exclusive'}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={18} className="group-hover/btn:scale-110 transition-transform" />
                            <span>{language === 'he' ? 'הוספה לסל' : 'Add to Cart'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>

      {/* Floating Cart Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-24 left-6 z-50 w-16 h-16 bg-brand-gold text-brand-black rounded-full shadow-2xl flex items-center justify-center group hover:scale-110 transition-transform"
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-brand-black text-brand-gold text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-brand-gold">
            {totalItems}
          </span>
        )}
      </motion.button>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[150]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-full max-w-md bg-brand-cream z-[160] shadow-2xl flex flex-col"
              dir="rtl"
            >
              <div className="p-6 bg-brand-black text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="text-brand-gold" size={20} />
                  <h3 className="text-xl font-serif">סל הקניות</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <ShoppingBag size={48} />
                    <p className="font-serif italic">הסל שלכם ריק...</p>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const product = products.find(p => p.id === item.id);
                    if (!product) return null;
                    return (
                      <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-brand-gold/10 group">
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-brand-black truncate">{product.name}</h4>
                          <p className="text-xs text-brand-gold font-bold mb-2">₪{product.price}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 bg-brand-gold/5 rounded-full px-3 py-1 border border-brand-gold/10">
                              <button onClick={() => updateQuantity(item.id, -1)} className="text-brand-gold hover:text-brand-black transition-colors">
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="text-brand-gold hover:text-brand-black transition-colors">
                                <Plus size={12} />
                              </button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-brand-black/20 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 bg-white border-t border-brand-gold/10 space-y-4">
                  {/* Promo Code Section */}
                  {!promoCode ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={language === 'he' ? 'קוד קופון' : 'Promo Code'}
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="flex-1 bg-brand-gold/5 border border-brand-gold/20 rounded-xl px-4 py-2 text-sm focus:border-brand-gold outline-none text-brand-black"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="bg-brand-black text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-black transition-colors"
                      >
                        {language === 'he' ? 'החל' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                      <div className="flex items-center gap-2 text-green-700 text-xs font-bold">
                        <Tag size={14} />
                        <span>{promoCode} {language === 'he' ? 'הופעל' : 'Applied'}</span>
                      </div>
                      <button 
                        onClick={() => applyPromoCode(null)}
                        className="text-green-700/40 hover:text-green-700 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 border-b border-brand-gold/10 pb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-brand-black/60">{language === 'he' ? 'סיכום ביניים:' : 'Subtotal:'}</span>
                      <span className="text-brand-black font-medium">₪{subtotal}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          {language === 'he' ? 'הנחה:' : 'Discount:'}
                        </span>
                        <span>-₪{discountAmount}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-brand-black/60 font-serif">{language === 'he' ? 'סה"כ לתשלום:' : 'Total:'}</span>
                    <span className="text-2xl font-serif text-brand-gold">₪{totalPrice}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-4 bg-brand-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-gold hover:text-brand-black transition-all duration-500 flex items-center justify-center gap-3 group"
                  >
                    {language === 'he' ? 'המשך לתשלום' : 'Checkout'}
                    <ArrowRight size={14} className="group-hover:translate-x-[-4px] transition-transform" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Checkout 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        total={totalPrice} 
      />
    </div>
  );
};

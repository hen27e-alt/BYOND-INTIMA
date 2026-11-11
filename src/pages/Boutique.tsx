import { E } from '../components/EditableText';
import { isBoxArt } from '../data/season';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ShoppingBag, X, Trash2, Plus, Minus, Heart, ChevronDown } from 'lucide-react';
import { EditableImage } from '../components/EditableImage';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useUI } from '../contexts/UIContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAlert } from '../components/AlertModal';
import { Ticket } from '../components/season/Ticket';
import { cn } from '../lib/utils';
import { type Product, memberPriceFor, useCatalogue, useSeasonSettings, visible } from '../lib/catalogue';

const CATEGORIES = [
  { id: 'all', he: 'הכל', en: 'All' },
  { id: 'experience', he: 'מארזים', en: 'Boxes' },
  { id: 'cards', he: 'קלפים בלבד', en: 'Cards only' },
  { id: 'gifts', he: 'מתנות', en: 'Gifts' },
  { id: 'atmosphere', he: 'אווירה', en: 'Atmosphere' },
  { id: 'lifestyle', he: 'אירוח ולייף סטייל', en: 'Hosting & lifestyle' },
  { id: 'bedroom', he: 'חדר שינה', en: 'Bedroom' },
  { id: 'personalization', he: 'בהתאמה אישית', en: 'Personalised' },
  { id: 'smart', he: 'מוצרים חכמים', en: 'Smart' },
  { id: 'premium', he: 'למנויים בלבד', en: 'Members only' },
] as const;

export const Boutique = () => {
  const { cart, addToCart, updateQuantity, openCart } = useCart();
  const { language } = useLanguage();
  const { isPurchaseMode } = useUI();
  const { showAlert } = useAlert();
  const { updateProfile, profile, user } = useFirebase();
  const reduce = useReducedMotion();
  const he = language === 'he';
  const tx = (h: string, e: string) => (he ? h : e);

  const { products: catalogue } = useCatalogue();
  const { memberDiscountPercent } = useSeasonSettings();
  // Gift cards have their own page (/gift-card); the boutique is for things that ship.
  const products = useMemo(() => catalogue.filter((p) => visible(p) && !p.giftCard), [catalogue]);
  const memberPrice = (price: number) => memberPriceFor(price, memberDiscountPercent);
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]['id']>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [personalization, setPersonalization] = useState<Record<string, { name: string; dedication: string }>>({});

  const favoriteProducts: string[] = profile?.favoriteProducts || [];


  const cartItems = Object.entries(cart).map(([id, data]) => ({ id, ...data, product: products.find((p) => p.id === id) }));
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products;
    if (activeCategory === 'premium') return products.filter((p) => p.isPremium);
    if (activeCategory === 'gifts') return products.filter((p) => p.personalizable || p.category === 'experience');
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      c[cat.id] =
        cat.id === 'all'
          ? products.length
          : cat.id === 'premium'
            ? products.filter((p) => p.isPremium).length
            : cat.id === 'gifts'
              ? products.filter((p) => p.personalizable || p.category === 'experience').length
              : products.filter((p) => p.category === cat.id).length;
    }
    return c;
  }, [products]);

  const toggleFavorite = async (productId: string) => {
    if (!profile) return;
    const isFav = favoriteProducts.includes(productId);
    try {
      await updateProfile({ favoriteProducts: isFav ? favoriteProducts.filter((id) => id !== productId) : [...favoriteProducts, productId] });
    } catch (error) {
      console.error('Error updating favorites:', error);
      showAlert(tx('לא הצלחנו לשמור את המועדפים. נסו שוב.', 'Could not save your favourites. Please try again.'));
    }
  };

  const setField = (id: string, field: 'name' | 'dedication', value: string) =>
    setPersonalization((prev) => ({ ...prev, [id]: { name: '', dedication: '', ...prev[id], [field]: value } }));

  const add = (p: Product) => {
    addToCart(p.id, personalization[p.id]);
    openCart();
  };

  return (
    <div className="min-h-screen bg-paper pt-16 text-ink md:pt-20">
      {/* Masthead of the boutique: its own section of the site */}
      <header className="border-b-[3px] border-ink">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-10 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:py-14">
          <div>
            <h1 className="font-display text-[clamp(5rem,16vw,11rem)] font-bold leading-[0.8]"><E id="bq_title">{tx('הבוטיק', 'The boutique')}</E></h1>
            <p className="mt-4 max-w-[52ch] text-lg leading-relaxed md:text-xl">
              <E id="bq_lede" multiline>{tx(
                'החנות של Byond Intima: המארזים, מתנות, ודברים שמשלימים את הערב. מנויים מקבלים הנחה קבועה על כל פריט.',
                'The Byond Intima shop: the boxes, gifts and things that complete the evening. Members get a standing discount on every item.'
              )}</E>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {user && (
              <Link to="/orders" className="border-[3px] border-ink px-5 py-2.5 font-bold hover:bg-ink hover:text-paper">
                {tx('ההזמנות שלי', 'My orders')}
              </Link>
            )}
            <button onClick={() => openCart()} className="flex items-center gap-2 bg-ink px-5 py-3 font-bold text-paper hover:bg-spot">
              <ShoppingBag size={18} />
              {tx('הסל', 'Cart')}
              <span className="bg-paper px-1.5 text-sm text-ink tabular-nums">{totalItems}</span>
            </button>
          </div>
        </div>

        {/* Category index */}
        <nav aria-label={tx('קטגוריות', 'Categories')} className="mx-auto max-w-[1440px] overflow-x-auto px-4 md:px-8 lg:px-14">
          <ul className="flex min-w-max border-t border-ink">
            {CATEGORIES.map((cat) =>
              counts[cat.id] > 0 ? (
                <li key={cat.id}>
                  <button
                    onClick={() => setActiveCategory(cat.id)}
                    aria-pressed={activeCategory === cat.id}
                    className={cn(
                      'flex items-baseline gap-2 border-b-[5px] px-4 py-3 text-base font-bold transition-colors',
                      activeCategory === cat.id ? 'border-spot text-spot' : 'border-transparent hover:text-spot'
                    )}
                  >
                    {he ? cat.he : cat.en}
                    <span className="text-xs font-medium tabular-nums opacity-70">{counts[cat.id]}</span>
                  </button>
                </li>
              ) : null
            )}
          </ul>
        </nav>
      </header>

      {/* Catalogue: a ruled page, not a grid of floating cards */}
      <section className="mx-auto max-w-[1440px] px-4 pb-24 md:px-8 lg:px-14">
        <ul className="grid grid-cols-1 border-ink sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((product) => {
              const qty = cart[product.id]?.quantity || 0;
              const locked = product.isPremium && !isPurchaseMode;
              const mPrice = memberPrice(product.price);
              const isFav = favoriteProducts.includes(product.id);
              const open = expanded === product.id;
              return (
                <motion.li
                  key={product.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col border-b border-ink py-8 sm:px-5 sm:odd:border-e lg:odd:border-e-0 lg:[&:not(:nth-child(3n))]:border-e"
                >
                  <div className="group relative aspect-[4/5] overflow-hidden bg-surface">
                    <EditableImage
                      contentId={`boutique_product_${product.id}_image`}
                      defaultSrc={product.image}
                      alt={product.name}
                      className={isBoxArt(product.image) ? "h-full w-full object-cover" : "h-full w-full object-cover grayscale contrast-110 brightness-90 transition-[filter] duration-500 group-hover:grayscale-0 group-hover:brightness-100"}
                    />
                    {!isBoxArt(product.image) && <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(17,14,13,.7)),radial-gradient(80%_60%_at_100%_0%,rgba(217,54,31,.18),transparent_70%)] transition-opacity duration-500 group-hover:opacity-40" />}
                    {product.personalizable && personalization[product.id]?.name && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-paper/90 px-3 py-2 text-center font-display text-3xl font-bold">
                        {personalization[product.id].name}
                      </div>
                    )}
                    <div className="absolute start-0 top-0 flex gap-1">
                      {product.category === 'experience' && <span className="bg-spot px-2 py-1 text-xs font-bold text-paper">{tx('מארז', 'Box')}</span>}
                      {product.shippingIncluded && <span className="bg-[#0B0909]/80 px-2 py-1 text-xs font-bold text-gold">{tx('משלוח כלול', 'Shipping included')}</span>}
                      {product.isPremium && <span className="bg-ink px-2 py-1 text-xs font-bold text-paper">{tx('למנויים', 'Members')}</span>}
                      {product.soldOut && <span className="bg-paper px-2 py-1 text-xs font-bold text-ink">{tx('אזל', 'Sold out')}</span>}
                    </div>
                    {user && (
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        aria-pressed={isFav}
                        aria-label={isFav ? tx('הסרה מהמועדפים', 'Remove from favourites') : tx('הוספה למועדפים', 'Add to favourites')}
                        className={cn('absolute end-2 top-2 bg-paper p-2', isFav ? 'text-spot' : 'text-ink hover:text-spot')}
                      >
                        <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    )}
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-4">
                    <h2 className="text-xl font-bold leading-snug md:text-2xl">{product.name}</h2>
                    <div className="text-end">
                      <p className="font-display text-4xl font-bold leading-none tabular-nums">₪{product.price}</p>
                      {mPrice !== null && <p className="mt-1 text-sm font-bold text-spot">{tx(`למנויים ₪${mPrice}`, `Members ₪${mPrice}`)}</p>}
                    </div>
                  </div>
                  {product.category === 'experience' && product.avgTime && <p className="mt-1 text-sm font-bold text-spot">{product.avgTime}</p>}
                  <p className="mt-3 text-base leading-relaxed text-ink/80">{product.description}</p>

                  {product.personalizable && !locked && (
                    <fieldset className="mt-4 grid gap-2">
                      <legend className="mb-1 text-sm font-bold">{tx('התאמה אישית', 'Personalise')}</legend>
                      <label className="sr-only" htmlFor={`pn-${product.id}`}>{tx('שם לחריטה', 'Name to engrave')}</label>
                      <input
                        id={`pn-${product.id}`}
                        value={personalization[product.id]?.name || ''}
                        onChange={(e) => setField(product.id, 'name', e.target.value)}
                        placeholder={tx('שם לחריטה', 'Name to engrave')}
                        maxLength={24}
                        className="border-2 border-ink bg-paper px-3 py-2 text-base placeholder:text-ink/60 focus:border-spot focus:outline-none"
                      />
                      <label className="sr-only" htmlFor={`pd-${product.id}`}>{tx('הקדשה', 'Dedication')}</label>
                      <input
                        id={`pd-${product.id}`}
                        value={personalization[product.id]?.dedication || ''}
                        onChange={(e) => setField(product.id, 'dedication', e.target.value)}
                        placeholder={tx('הקדשה (לא חובה)', 'Dedication (optional)')}
                        maxLength={80}
                        className="border-2 border-ink bg-paper px-3 py-2 text-base placeholder:text-ink/60 focus:border-spot focus:outline-none"
                      />
                    </fieldset>
                  )}

                  {(product.material || product.dimensions || product.care || product.features) && (
                    <div className="mt-4 border-t border-ink">
                      <button
                        onClick={() => setExpanded(open ? null : product.id)}
                        aria-expanded={open}
                        className="flex w-full items-center justify-between py-3 text-sm font-bold hover:text-spot"
                      >
                        {product.category === 'experience' ? tx('מה בפנים', "What's inside") : tx('פרטים ומפרט', 'Details')}
                        <ChevronDown size={16} className={cn('transition-transform', open && 'rotate-180')} />
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.dl
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden text-sm"
                          >
                            {product.features && (
                              <ul className="pb-3">
                                {product.features.map((f: string) => (
                                  <li key={f} className="border-b border-rule py-1.5">{f}</li>
                                ))}
                              </ul>
                            )}
                            {[
                              [tx('חומר', 'Material'), product.material],
                              [tx('מידות', 'Dimensions'), product.dimensions],
                              [tx('טיפול', 'Care'), product.care],
                            ]
                              .filter(([, v]) => v)
                              .map(([k, v]) => (
                                <div key={k as string} className="grid grid-cols-[90px_1fr] gap-2 border-b border-rule py-1.5">
                                  <dt className="font-bold">{k}</dt>
                                  <dd dir="auto">{v}</dd>
                                </div>
                              ))}
                          </motion.dl>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="mt-auto pt-6">
                    {locked ? (
                      <div className="flex flex-wrap items-center justify-between gap-3 border-[3px] border-dashed border-ink px-4 py-3">
                        <span className="font-bold">{tx('זמין למנויים בלבד', 'Members only')}</span>
                        <Link to="/#membership" className="text-sm font-bold underline underline-offset-4 hover:text-spot">
                          {tx('על המנוי', 'About membership')}
                        </Link>
                      </div>
                    ) : product.soldOut ? (
                      <p className="border-[3px] border-dashed border-ink px-4 py-3 text-center font-bold">{tx('אזל מהמלאי', 'Sold out')}</p>
                    ) : qty > 0 ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center border-[3px] border-ink">
                          <button onClick={() => updateQuantity(product.id, 1)} className="p-3 hover:bg-ink hover:text-paper" aria-label={tx('הוספת יחידה', 'Add one')}>
                            <Plus size={16} />
                          </button>
                          <span className="min-w-10 text-center font-display text-3xl font-bold tabular-nums" aria-live="polite">{qty}</span>
                          <button onClick={() => updateQuantity(product.id, -1)} className="p-3 hover:bg-ink hover:text-paper" aria-label={tx('הורדת יחידה', 'Remove one')}>
                            <Minus size={16} />
                          </button>
                        </div>
                        <button onClick={() => openCart()} className="text-sm font-bold underline underline-offset-4 hover:text-spot">
                          {tx('לסל', 'View cart')}
                        </button>
                      </div>
                    ) : (
                      <Ticket label={tx('להוסיף לסל', 'Add to cart')} stub={`₪${product.price}`} size="md" onClick={() => add(product)} className="w-full" />
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
        {filtered.length === 0 && <p className="py-20 text-center text-lg">{tx('אין כרגע מוצרים בקטגוריה הזו.', 'Nothing in this category right now.')}</p>}
      </section>


    </div>
  );
};

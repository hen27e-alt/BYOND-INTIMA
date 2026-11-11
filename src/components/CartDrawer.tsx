import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { X, Trash2, Plus, Minus, Package, Gift } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAlert } from './AlertModal';
import { Ticket } from './season/Ticket';
import { cardDecks } from '../data/decks';
import { isBoxArt } from '../data/season';
import { useCatalogue, shippingFor, FREE_SHIPPING_FROM } from '../lib/catalogue';

/**
 * The site-wide cart. Opens from the navbar and after every "add to cart",
 * so the visitor sees what they chose without leaving the page.
 */
export const CartDrawer = () => {
  const { cart, updateQuantity, removeFromCart, promoCode, applyPromoCode, discountAmount, isCartOpen, closeCart } = useCart();
  const { language } = useLanguage();
  const { showAlert } = useAlert();
  const { products } = useCatalogue();
  const reduce = useReducedMotion();
  const location = useLocation();
  const he = language === 'he';
  const tx = (h: string, e: string) => (he ? h : e);
  const [promoInput, setPromoInput] = useState('');

  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isCartOpen, closeCart]);

  // Navigating away (e.g. to checkout) closes it.
  useEffect(() => {
    closeCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const lines = Object.entries(cart)
    .map(([id, data]) => {
      const p = products.find((x) => x.id === id && !x.hidden);
      const deck = p ? null : cardDecks.find((d) => d.id === id);
      const product = p ?? (deck ? { name: `BYOND ${deck.name}`, price: deck.price ?? 119, image: undefined, shippingIncluded: false } : null);
      return product ? { id, ...data, product } : null;
    })
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  const items = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const shipLines = lines.map((l) => ({ price: l.product.price, quantity: l.quantity, shippingIncluded: l.product.shippingIncluded }));
  const shipping = shippingFor(shipLines);
  const needsShipping = shipLines.some((l) => !l.shippingIncluded);
  const missing = Math.max(0, FREE_SHIPPING_FROM - subtotal);
  const progress = Math.min(1, subtotal / FREE_SHIPPING_FROM);
  const total = subtotal + shipping - discountAmount;

  const from = he ? '-100%' : '100%';

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={tx('סל הקניות', 'Shopping cart')}
            initial={reduce ? { opacity: 0 } : { x: from }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: from }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="glow-oxblood fixed inset-y-0 end-0 z-[90] flex w-full max-w-md flex-col border-s border-ink/40 bg-[var(--color-surface)] text-ink"
          >
            <div className="flex items-end justify-between border-b border-ink/30 px-6 pb-4 pt-6">
              <div>
                <p className={he ? 'text-sm font-bold text-gold' : 'text-xs font-bold uppercase tracking-[0.3em] text-gold'}>{tx('הבחירה שלכם', 'Your selection')}</p>
                <h2 className="mt-1 font-display text-6xl font-bold leading-[0.85]">{tx('הסל', 'Cart')}</h2>
              </div>
              <button onClick={closeCart} className="grid h-11 w-11 place-items-center hover:text-spot" aria-label={tx('סגירת הסל', 'Close cart')} autoFocus>
                <X size={22} />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-start justify-center gap-5 px-6">
                <p className="font-display text-4xl font-bold">{tx('הסל ריק.', 'Your cart is empty.')}</p>
                <p className="text-ink/70">{tx('ערב טוב מתחיל במארז אחד.', 'A good evening starts with one box.')}</p>
                <Ticket label={tx('למארזים', 'The boxes')} stub="03" stubCaption={tx('ערבים', 'evenings')} to="/experience" size="md" />
              </div>
            ) : (
              <>
                {needsShipping && (
                  <div className="border-b border-ink/30 px-6 py-4" aria-live="polite">
                    <p className="text-sm">
                      {missing > 0 ? (
                        <>
                          {tx('עוד ', 'Add ')}
                          <strong className="text-gold tabular-nums">₪{missing}</strong>
                          {tx(' למשלוח חינם', ' for free shipping')}
                        </>
                      ) : (
                        <strong className="text-gold">{tx('המשלוח עלינו', 'Shipping is on us')}</strong>
                      )}
                    </p>
                    <div className="mt-2 h-px w-full bg-ink/20">
                      <motion.div
                        className="h-px origin-[inline-start] bg-gradient-to-l from-[#E8C98A] via-[#C9A66B] to-[#D9361F]"
                        initial={false}
                        animate={{ scaleX: progress }}
                        transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                        style={{ transformOrigin: he ? 'right' : 'left' }}
                      />
                    </div>
                  </div>
                )}

                <ul className="flex-1 overflow-y-auto overscroll-contain px-6">
                  <AnimatePresence initial={false}>
                    {lines.map((item) => (
                      <motion.li
                        key={item.id}
                        layout={!reduce}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b border-ink/20 py-4"
                      >
                        {item.product.image ? (
                          <img src={item.product.image} alt="" className={isBoxArt(item.product.image) ? 'aspect-square w-full object-cover' : 'aspect-square w-full object-cover grayscale'} />
                        ) : (
                          <span className="aspect-square w-full bg-ink/10" />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold leading-snug">{item.product.name}</p>
                          {item.personalization?.name && <p className="text-sm text-ink/70">{tx('חריטה:', 'Engraving:')} {item.personalization.name}</p>}
                          <div className="mt-2 flex items-center gap-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="grid h-9 w-9 place-items-center border border-ink/40 hover:border-gold hover:text-gold" aria-label={tx('הורדת יחידה', 'Remove one')}>
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center font-bold tabular-nums">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="grid h-9 w-9 place-items-center border border-ink/40 hover:border-gold hover:text-gold" aria-label={tx('הוספת יחידה', 'Add one')}>
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-display text-3xl font-bold tabular-nums">₪{item.product.price * item.quantity}</span>
                          <button onClick={() => removeFromCart(item.id)} className="grid h-9 w-9 place-items-center text-ink/60 hover:text-spot" aria-label={tx(`להסיר את ${item.product.name}`, `Remove ${item.product.name}`)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="border-t border-ink/30 px-6 pb-6 pt-4">
                  {!promoCode ? (
                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!promoInput.trim()) return;
                        showAlert(tx('קוד הקופון הזה לא תקף כרגע.', 'This promo code is not valid right now.'), tx('קוד לא תקין', 'Invalid code'));
                      }}
                    >
                      <label htmlFor="cart-promo" className="sr-only">{tx('קוד קופון', 'Promo code')}</label>
                      <input
                        id="cart-promo"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder={tx('קוד קופון', 'Promo code')}
                        className="min-w-0 flex-1 border-0 border-b border-ink/40 bg-transparent px-0 py-2 text-base placeholder:text-ink/50 focus:border-gold focus:outline-none"
                      />
                      <button type="submit" className="px-3 text-sm font-bold hover:text-gold">{tx('הפעלה', 'Apply')}</button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>{promoCode} · {tx('הופעל', 'applied')}</span>
                      <button onClick={() => applyPromoCode(null)} className="underline hover:text-spot">{tx('הסרה', 'Remove')}</button>
                    </div>
                  )}

                  <dl className="mt-4 space-y-1 text-base">
                    <div className="flex justify-between">
                      <dt>{tx('סכום ביניים', 'Subtotal')}</dt>
                      <dd className="tabular-nums">₪{subtotal}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>{tx('משלוח', 'Shipping')}</dt>
                      <dd className="tabular-nums">{shipping === 0 ? tx('חינם', 'Free') : `₪${shipping}`}</dd>
                    </div>
                    <div className="flex items-end justify-between border-t border-ink/30 pt-2">
                      <dt className="font-bold">{tx('לתשלום', 'Total')}</dt>
                      <dd className="text-sheen font-display text-5xl font-bold leading-none tabular-nums">₪{total}</dd>
                    </div>
                  </dl>

                  <ul className="mt-4 space-y-1.5 text-sm text-ink/70">
                    <li className="flex items-center gap-2"><Package size={14} className="shrink-0 text-gold" aria-hidden />{tx('אריזה דיסקרטית, בלי שם המוצר על החבילה', 'Discreet packaging, nothing on the parcel says what is inside')}</li>
                    <li className="flex items-center gap-2"><Gift size={14} className="shrink-0 text-gold" aria-hidden />{tx('אריזת מתנה וכרטיס ברכה ללא עלות, בקופה', 'Free gift wrap and a card, at checkout')}</li>
                  </ul>

                  <Ticket
                    label={tx('המשך לתשלום', 'Checkout')}
                    stub={String(items)}
                    stubCaption={tx('פריטים', 'items')}
                    size="md"
                    tone="spot"
                    className="mt-5 w-full"
                    to="/checkout"
                    onClick={closeCart}
                  />
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

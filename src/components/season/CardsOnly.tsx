import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAlert } from '../AlertModal';
import { CARDS_FOR, type Product } from '../../lib/catalogue';

/**
 * The quieter second option under a box: the same mission cards without the accessories,
 * shipping included. Renders nothing if the pack is hidden or missing from the catalogue.
 */
export const CardsOnly = ({ boxId, products, he = true }: { boxId: string; products: Product[]; he?: boolean }) => {
  const { addToCart } = useCart();
  const { showAlert } = useAlert();
  const pack = products.find((p) => p.id === CARDS_FOR[boxId]);
  if (!pack || pack.hidden) return null;

  if (pack.soldOut) {
    return <p className="text-sm text-ink/60">{he ? 'חפיסת הקלפים לבד אזלה זמנית' : 'Cards-only pack is sold out'}</p>;
  }

  return (
    <button
      type="button"
      onClick={() => {
        addToCart(pack.id);
        showAlert(he ? `${pack.name} נוספו לסל` : `${pack.name} added to your cart`);
      }}
      className="group inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-gold/40 pb-1.5 text-start transition-colors hover:border-gold"
    >
      <span className="text-base font-bold group-hover:text-gold">{he ? 'רק הקלפים, בלי האביזרים' : 'Just the cards'}</span>
      <span className="text-sheen font-display text-3xl leading-none tabular-nums">₪{pack.price}</span>
      <span className="text-sm text-ink/60">{he ? 'משלוח כלול' : 'shipping included'}</span>
    </button>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { boutiqueProducts } from '../data/boutique';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartItemData {
  quantity: number;
  personalization?: {
    name?: string;
    dedication?: string;
  };
}

interface CartContextType {
  cart: Record<string, CartItemData>;
  addToCart: (id: string, personalization?: CartItemData['personalization']) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  promoCode: string | null;
  applyPromoCode: (code: string | null) => void;
  discountAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Record<string, CartItemData>>(() => {
    const savedCart = localStorage.getItem('byond_cart');
    return savedCart ? JSON.parse(savedCart) : {};
  });
  const [promoCode, setPromoCode] = useState<string | null>(() => localStorage.getItem('byond_promo'));

  useEffect(() => {
    localStorage.setItem('byond_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (promoCode) {
      localStorage.setItem('byond_promo', promoCode);
    } else {
      localStorage.removeItem('byond_promo');
    }
  }, [promoCode]);

  const addToCart = (id: string, personalization?: CartItemData['personalization']) => {
    setCart(prev => ({
      ...prev,
      [id]: {
        quantity: (prev[id]?.quantity || 0) + 1,
        personalization: personalization || prev[id]?.personalization
      }
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const currentItem = prev[id] || { quantity: 0 };
      const newQty = Math.max(0, currentItem.quantity + delta);
      if (newQty === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: { ...currentItem, quantity: newQty } };
    });
  };

  const clearCart = () => {
    setCart({});
    setPromoCode(null);
  };

  const applyPromoCode = (code: string | null) => {
    setPromoCode(code);
  };

  const cartCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  const discountAmount = 0;

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount,
      promoCode,
      applyPromoCode,
      discountAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

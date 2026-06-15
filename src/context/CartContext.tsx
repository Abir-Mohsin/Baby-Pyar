import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { trackPixelEvent } from '../utils/tracking';

export interface CartItem {
  id: string; // The firestore ID
  name: string;
  price: number;
  image: string;
  qty: number;
  variation?: string;
  freeDelivery?: boolean;
  customBkashDiscount?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'qty'>, quantity?: number) => void;
  updateQuantity: (id: string, qty: number, variation?: string) => void;
  removeFromCart: (id: string, variation?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  cartTotal: 0,
  cartCount: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'qty'>, quantity = 1) => {
    trackPixelEvent('AddToCart', {
      content_name: item.name,
      content_ids: [item.id],
      content_type: 'product',
      value: item.price * quantity,
      currency: 'BDT'
    });

    setCart((prev) => {
      const existingKey = item.variation ? `${item.id}-${item.variation}` : item.id;
      const existing = prev.find((p) => {
        const pKey = p.variation ? `${p.id}-${p.variation}` : p.id;
        return pKey === existingKey;
      });

      if (existing) {
        return prev.map((p) => {
          const pKey = p.variation ? `${p.id}-${p.variation}` : p.id;
          return pKey === existingKey ? { ...p, qty: p.qty + quantity } : p;
        });
      }
      return [...prev, { ...item, qty: quantity }];
    });
    toast.success('কার্টে যোগ করা হয়েছে!');
  };

  const updateQuantity = (id: string, qty: number, variation?: string) => {
    setCart((prev) => {
      const targetKey = variation ? `${id}-${variation}` : id;
      if (qty <= 0) {
        return prev.filter((p) => {
          const pKey = p.variation ? `${p.id}-${p.variation}` : p.id;
          return pKey !== targetKey;
        });
      }
      return prev.map((p) => {
        const pKey = p.variation ? `${p.id}-${p.variation}` : p.id;
        return pKey === targetKey ? { ...p, qty } : p;
      });
    });
  };

  const removeFromCart = (id: string, variation?: string) => {
    setCart((prev) => {
      const targetKey = variation ? `${id}-${variation}` : id;
      return prev.filter((p) => {
        const pKey = p.variation ? `${p.id}-${p.variation}` : p.id;
        return pKey !== targetKey;
      });
    });
    toast.success('কার্ট থেকে সরানো হয়েছে');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.qty, 0);
  const cartCount = cart.reduce((count, item) => count + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

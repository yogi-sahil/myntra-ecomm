import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('myntra_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const { user, token } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user && token) {
      fetchCart();
    }
  }, [user, token]);

  useEffect(() => {
    try {
      if (cartItems) {
        localStorage.setItem('myntra_cart', JSON.stringify(cartItems));
      }
    } catch (e) {}
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setCartItems(data);
          localStorage.setItem('myntra_cart', JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  const getSmartSize = (prod) => {
    if (prod && prod.size) return prod.size;
    const cat = (prod?.category || prod?.category_name || prod?.title || prod?.brand || '').toLowerCase();
    if (cat.includes('beauty') || cat.includes('makeup') || cat.includes('cosmetic') || cat.includes('cream') || cat.includes('powder') || cat.includes('tone') || cat.includes('lakme') || cat.includes('skincare')) {
      return 'Standard';
    }
    if (cat.includes('perfume') || cat.includes('fragrance') || cat.includes('spray')) {
      return '100ml';
    }
    if (cat.includes('watch') || cat.includes('jewel') || cat.includes('accessory') || cat.includes('bag') || cat.includes('sunglass')) {
      return 'One Size';
    }
    if (cat.includes('shoe') || cat.includes('footwear') || cat.includes('sneaker')) {
      return 'UK 8';
    }
    return 'M';
  };

  const addToCart = async (product, size = null) => {
    if (!token) {
      showToast('Please login to add items to bag', 'error');
      return;
    }

    const effectiveSize = size || getSmartSize(product);
    
    // Optimistic UI update
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id && item.size === effectiveSize);
      let updated;
      if (existingItem) {
        updated = prevItems.map((item) =>
          item.id === product.id && item.size === effectiveSize ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prevItems, { ...product, quantity: 1, size: effectiveSize }];
      }
      localStorage.setItem('myntra_cart', JSON.stringify(updated));
      return updated;
    });

    showToast('Added to Bag! 🛍️', 'success');

    try {
      await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId: product.id, quantity: 1, size: effectiveSize })
      });
      fetchCart();
    } catch (err) {
      console.error('Failed to add to cart on server', err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!token) return;

    // Optimistic UI update
    setCartItems((prevItems) => {
      const updated = prevItems.filter((item) => item.cart_item_id !== cartItemId && item.id !== cartItemId);
      localStorage.setItem('myntra_cart', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to remove from cart on server', err);
    }
  };

  const updateQuantity = async (cartItemId, amount, productId, size) => {
    if (!token) return;

    // Optimistic UI update
    setCartItems((prevItems) => {
      const updated = prevItems.map((item) => {
        if (item.cart_item_id === cartItemId || item.id === productId) {
          const newQuantity = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      localStorage.setItem('myntra_cart', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId: productId, quantity: amount, size })
      });
    } catch (err) {
      console.error('Failed to update quantity on server', err);
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('myntra_cart');
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
  const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      setCartItems,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartTotal,
      totalItems 
    }}>
      {children}
    </CartContext.Provider>
  );
};

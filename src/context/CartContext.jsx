/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
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
    } catch {
      return [];
    }
  });

  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [cartLoading, setCartLoading] = useState(Boolean(token));
  const [pendingItems, setPendingItems] = useState({});
  const cartRef = useRef(cartItems);
  const pendingItemsRef = useRef({});

  useEffect(() => {
    cartRef.current = cartItems;
  }, [cartItems]);

  const persistCart = useCallback((items) => {
    setCartItems(items);
    localStorage.setItem('myntra_cart', JSON.stringify(items));
  }, []);

  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cart`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not load your bag');
      if (Array.isArray(data)) persistCart(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setCartLoading(false);
    }
  }, [persistCart]);

  useEffect(() => {
    if (user && token) fetchCart();
    else {
      setCartItems([]);
      setCartLoading(false);
    }
  }, [user, token, fetchCart]);

  useEffect(() => {
    try {
      if (cartItems) {
        localStorage.setItem('myntra_cart', JSON.stringify(cartItems));
      }
    } catch {}
  }, [cartItems]);

  const getSmartSize = (prod) => {
    if (prod && prod.size) return prod.size;
    const available = Array.isArray(prod?.available_sizes)
      ? prod.available_sizes
      : String(prod?.available_sizes || '').split(',').map((value) => value.trim()).filter(Boolean);
    return available[0] || 'One Size';
  };

  const addToCart = async (product, size = null) => {
    if (!token) {
      showToast('Please login to add items to bag', 'error');
      return;
    }

    const effectiveSize = size || getSmartSize(product);
    const previousItems = cartRef.current;

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

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product.id, quantity: 1, size: effectiveSize })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not add this item');
      if (Array.isArray(data.items)) persistCart(data.items);
      showToast('Added to Bag! 🛍️', 'success');
    } catch (err) {
      console.error('Failed to add to cart on server', err);
      persistCart(previousItems);
      showToast(err.message || 'Could not add this item', 'error');
    }
  };

  const removeFromCart = async (cartItemId, productId, size) => {
    const previousItems = cartRef.current;
    setCartItems((prevItems) => {
      const updated = prevItems.filter((item) => {
        if (cartItemId && item.cart_item_id) {
          return item.cart_item_id !== cartItemId;
        }
        return !(item.id === productId && (!size || item.size === size));
      });
      localStorage.setItem('myntra_cart', JSON.stringify(updated));
      return updated;
    });

    if (!token) return;

    try {
      if (cartItemId) {
        const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not remove this item');
        if (Array.isArray(data.items)) persistCart(data.items);
      }
    } catch (err) {
      console.error('Failed to remove from cart on server', err);
      persistCart(previousItems);
      showToast(err.message || 'Could not remove this item', 'error');
    }
  };

  const updateQuantity = async (cartItemId, amount, productId, size) => {
    const pendingKey = String(cartItemId || `${productId}-${size || ''}`);
    if (pendingItemsRef.current[pendingKey]) return;
    pendingItemsRef.current[pendingKey] = true;
    const previousItems = cartRef.current;
    let targetNewQty = 1;

    setCartItems((prevItems) => {
      const updated = prevItems.map((item) => {
        const matchesCartId = cartItemId && item.cart_item_id && item.cart_item_id === cartItemId;
        const matchesProductAndSize = productId && item.id === productId && (!size || item.size === size);

        if (matchesCartId || matchesProductAndSize) {
          const newQuantity = Math.max(1, (item.quantity || 1) + amount);
          targetNewQty = newQuantity;
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      localStorage.setItem('myntra_cart', JSON.stringify(updated));
      return updated;
    });

    if (!token) {
      delete pendingItemsRef.current[pendingKey];
      return;
    }
    setPendingItems((current) => ({ ...current, [pendingKey]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/cart/update-qty`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItemId: cartItemId || null,
          productId: productId,
          size: size,
          quantity: targetNewQty
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not update quantity');
    } catch (err) {
      console.error('Failed to update quantity on server', err);
      persistCart(previousItems);
      showToast(err.message || 'Could not update quantity', 'error');
    } finally {
      delete pendingItemsRef.current[pendingKey];
      setPendingItems((current) => {
        const next = { ...current };
        delete next[pendingKey];
        return next;
      });
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('myntra_cart');
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
  const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{
      cartItems: cartItems || [],
      setCartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal: cartTotal || 0,
      totalItems: totalItems || 0,
      totalCount: totalItems || 0,
      cartLoading,
      pendingItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

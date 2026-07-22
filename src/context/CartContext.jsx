import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user, token]);

  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:8999/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  const addToCart = async (product, size = 'M') => {
    if (!token) return alert('Please login first');
    
    // Optimistic UI update
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id && item.size === size);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1, size }];
    });

    try {
      await fetch('http://localhost:8999/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId: product.id, quantity: 1, size })
      });
      // Fetch cart again to get the actual cart_item_id from DB for the new item
      fetchCart();
    } catch (err) {
      console.error('Failed to add to cart on server', err);
      fetchCart(); // revert on failure
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!token) return;

    // Optimistic UI update
    setCartItems((prevItems) => prevItems.filter((item) => item.cart_item_id !== cartItemId));

    try {
      await fetch(`http://localhost:8999/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to remove from cart on server', err);
      fetchCart(); // revert on failure
    }
  };

  const updateQuantity = async (cartItemId, amount, productId, size) => {
    if (!token) return;

    // Optimistic UI update
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.cart_item_id === cartItemId) {
          const newQuantity = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });

    try {
      await fetch('http://localhost:8999/api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        // Reusing the POST endpoint which adds 'amount' to the existing quantity for the given product and size
        body: JSON.stringify({ productId: productId, quantity: amount, size })
      });
    } catch (err) {
      console.error('Failed to update quantity on server', err);
      fetchCart(); // revert on failure
    }
  };

  const clearCart = async () => {
    if (!token) return;
    setCartItems([]);
    try {
      await fetch('http://localhost:8999/api/cart', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

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

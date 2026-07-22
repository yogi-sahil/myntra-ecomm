import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user, token]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('http://localhost:8999/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  };

  const addToWishlist = async (product) => {
    if (!token) return alert('Please login first');

    setWishlistItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems; // Already in wishlist
      }
      return [...prevItems, product];
    });

    try {
      await fetch('http://localhost:8999/api/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId: product.id })
      });
    } catch (err) {
      console.error('Failed to add to wishlist on server', err);
      fetchWishlist();
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!token) return;

    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));

    try {
      await fetch(`http://localhost:8999/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to remove from wishlist on server', err);
      fetchWishlist();
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const totalWishlistItems = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist,
      totalWishlistItems 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

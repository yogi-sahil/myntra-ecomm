import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const MobileHomeHeader = ({ activeTab, setActiveTab }) => {
  return (
    <div className="md:hidden fixed top-16 left-0 right-0 bg-white z-40 shadow-xs border-b border-[#f5f5f6]">
      {/* Cosmetics category shortcuts */}
      <div className="flex items-center justify-between px-3 py-1.5 text-[12px] font-extrabold overflow-x-auto no-scrollbar">
        {['ALL', 'SKIN', 'MAKEUP', 'HAIR', 'MEN'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab && setActiveTab(tab)}
            className={`pb-1 px-3 whitespace-nowrap transition-colors border-b-2 tracking-wide uppercase ${activeTab === tab ? 'border-[#ff3f6c] text-[#ff3f6c]' : 'border-transparent text-[#282c3f]'}`}
          >
            {tab}
          </button>
        ))}
        <button className="pb-1 px-2 text-[#282c3f]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const MobilePageHeader = ({ title = 'PRODUCTS' }) => {
  const navigate = useNavigate();
  const { totalCount = 0 } = useCart() || {};
  const { wishlistItems = [] } = useWishlist() || {};
  const wishlist = wishlistItems;

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 bg-white z-40 shadow-sm border-b border-[#f5f5f6] flex items-center justify-between px-3 py-3">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#282c3f]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <Link to="/" className="flex items-center gap-1.5">
          <span className="text-[#ff3f6c] font-black text-[20px] tracking-tighter">M</span>
          <span className="text-[14px] font-bold text-[#282c3f] uppercase tracking-wide truncate max-w-[170px]">
            {title}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4 text-[#282c3f]">
        <button onClick={() => navigate('/products')} className="text-[#282c3f]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <Link to="/wishlist" className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {Array.isArray(wishlist) && wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-[#ff3f6c] w-2 h-2 rounded-full"></span>}
        </Link>
        <Link to="/cart" className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 11h14l1 12H4L5 11z" />
          </svg>
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#ff3f6c] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

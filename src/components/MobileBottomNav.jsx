import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { totalCount } = useCart();
  const currentPath = location.pathname;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#eaeaec] z-50 px-2 py-1.5 flex justify-around items-center shadow-lg">
      {/* Home Tab */}
      <Link
        to="/"
        className={`flex flex-col items-center justify-center py-1 px-3 ${currentPath === '/' ? 'text-[#ff3f6c]' : 'text-[#696e79]'}`}
      >
        <div className="w-6 h-6 flex items-center justify-center font-black text-[18px]">
          <span className="text-[#ff3f6c] font-black leading-none tracking-tighter">M</span>
        </div>
        <span className={`text-[11px] mt-0.5 ${currentPath === '/' ? 'font-bold text-[#ff3f6c]' : 'font-medium'}`}>
          Home
        </span>
      </Link>

      {/* Skincare Tab */}
      <Link
        to="/products?category=Face%20Wash"
        className="flex flex-col items-center justify-center py-1 px-3 text-[#696e79]"
      >
        <span className="font-extrabold text-[15px] tracking-tight text-[#ff3f6c]">SKIN</span>
        <span className="text-[10px] text-[#696e79] font-normal -mt-0.5">Daily Care</span>
      </Link>

      {/* Makeup Tab */}
      <Link
        to="/products?category=Face%20Makeup"
        className="flex flex-col items-center justify-center py-1 px-3 text-[#696e79]"
      >
        <span className="font-serif font-bold text-[13px] tracking-widest text-[#282c3f]">MAKEUP</span>
        <span className="text-[10px] text-[#696e79] font-normal -mt-0.5">Trending</span>
      </Link>

      {/* Bag Tab */}
      <Link
        to="/cart"
        className={`flex flex-col items-center justify-center py-1 px-3 relative ${currentPath === '/cart' ? 'text-[#ff3f6c]' : 'text-[#696e79]'}`}
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 11h14l1 12H4L5 11z" />
          </svg>
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#ff3f6c] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </div>
        <span className={`text-[11px] mt-0.5 ${currentPath === '/cart' ? 'font-bold text-[#ff3f6c]' : 'font-medium'}`}>
          Bag
        </span>
      </Link>
    </div>
  );
};

export default MobileBottomNav;

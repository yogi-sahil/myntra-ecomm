import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="group relative w-full flex flex-col hover:shadow-[0_2px_16px_4px_rgba(40,44,63,0.07)] transition-shadow duration-300 bg-white">
      <Link to={`/product/${product.id}`} className="block">
        {/* Product Image */}
        <div className="relative w-full h-[280px] overflow-hidden">
          <img 
            src={product.image_url || product.image} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Rating Badge */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-[2px] flex items-center gap-1 text-[12px] font-bold text-[#282c3f]">
            <span>{product.rating || '4.3'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#14958f]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-gray-400 border-l border-gray-300 pl-1 ml-1 font-normal">{product.reviews || '1.1k'}</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 relative bg-white z-10">
          <h3 className="text-[16px] font-bold text-[#282c3f] truncate">{product.brand}</h3>
          <p className="text-[14px] text-[#535766] truncate mt-1">{product.title}</p>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[14px] font-bold text-[#282c3f]">Rs. {product.price}</span>
            {(product.original_price || product.originalPrice) && (
              <span className="text-[12px] text-[#7e818c] line-through">Rs. {product.original_price || product.originalPrice}</span>
            )}
            {product.discount > 0 && (
              <span className="text-[12px] font-bold text-[#ff905a]">({product.discount}% OFF)</span>
            )}
          </div>
        </div>
      </Link>

      {/* Hover Action (Add to Bag) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-white translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => addToCart(product)}
          className="w-full py-2.5 border border-[#d4d5d9] rounded-[2px] text-[14px] font-bold text-[#282c3f] flex items-center justify-center gap-2 hover:border-[#ff3f6c] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          ADD TO BAG
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

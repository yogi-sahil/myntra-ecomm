import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Link } from 'react-router-dom';

// Category-aware beauty fallbacks used only when the verified catalog image fails.
const CATEGORY_FALLBACKS = {
  'Face Wash': 'https://images.unsplash.com/photo-1556228578-f8b5e2c5c06d?w=500&q=80',
  'Serums & Treatments': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80',
  'Sunscreen & Moisturiser': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80',
  'Lip Care': 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=500&q=80',
  'Eye Makeup': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&q=80',
  'Face Makeup': 'https://images.unsplash.com/photo-1566177700499-5e6f3a0b30ee?w=500&q=80',
  'Lip Makeup': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80',
  'Hair Care': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&q=80',
  'Body & Bath': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&q=80',
  "Men's Grooming": 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80',
  'Fragrance & Deodorant': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80',
  'Beauty Tools': 'https://images.unsplash.com/photo-1574178626-0f6c85fe32b5?w=500&q=80',
  'Toners & Face Mists': 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=500&q=80',
  'Face Masks & Exfoliators': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80',
  'Cleansers & Makeup Removers': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80',
  'Nail Care': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=80',
  'Hair Styling & Masks': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&q=80',
  'Hand & Foot Care': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&q=80',
  'Shaving & Hair Removal': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80',
  'Intimate & Personal Care': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80',
};

const DEFAULT_FALLBACK_IMG = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80';

const getProductFallback = (product) => {
  return CATEGORY_FALLBACKS[product?.category] || DEFAULT_FALLBACK_IMG;
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [imgLoaded, setImgLoaded] = useState(false);

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image_url || product.image || getProductFallback(product)];

  const primaryImg = images[0] || getProductFallback(product);
  const secondaryImg = images[1] || primaryImg;

  const [imgSrc, setImgSrc] = useState(primaryImg);
  const isWishlisted = isInWishlist(product.id);

  const handleImageError = () => {
    const fallback = getProductFallback(product);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  // Determine badge type based on product properties
  const isTopRated = Number(product.rating || 4.2) >= 4.2;
  const isNew = product.id % 4 === 0;
  const isRisingStar = product.id % 7 === 0;
  const isAd = product.id % 9 === 0;

  return (
    <div className="group relative w-full flex flex-col hover:shadow-[0_2px_16px_4px_rgba(40,44,63,0.07)] transition-shadow duration-300 bg-white rounded-lg overflow-hidden border border-[#f0f0f5] md:border-transparent">
      {/* Product Card Content */}
      <Link to={`/product/${product.id}`} className="block relative">
        {/* Product Image Container */}
        <div
          className="relative w-full aspect-[3/4] overflow-hidden bg-[#f5f5f6]"
          onMouseEnter={() => setImgSrc(secondaryImg)}
          onMouseLeave={() => setImgSrc(primaryImg)}
        >
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={imgSrc}
            alt={product.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={handleImageError}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Top Left Myntra Badges (Matching Image 2) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {isTopRated && (
              <span className="bg-[#ff3f6c] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[3px] tracking-wide uppercase shadow-sm">
                Top Rated
              </span>
            )}
            {isNew && (
              <span className="bg-[#4828b4] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[3px] tracking-wide uppercase shadow-sm">
                NEW
              </span>
            )}
            {isRisingStar && (
              <span className="bg-[#5c24a6] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[3px] tracking-wide uppercase shadow-sm">
                Rising Star
              </span>
            )}
            {isAd && (
              <span className="bg-black/40 text-white text-[8px] font-bold px-1 py-0.5 rounded backdrop-blur-xs">
                AD
              </span>
            )}
          </div>

          {/* Bottom Left Rating Badge (Matching Image 2) */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 text-[11px] font-bold text-[#282c3f] shadow-xs">
            <span>{product.rating || '4.4'}</span>
            <span className="text-[#14958f]">★</span>
            <span className="text-[#94969f] font-normal border-l border-[#eaeaec] pl-1 ml-0.5 text-[10px]">
              {product.reviews ? String(product.reviews).replace(/[^0-9kK]/g, '') : '24'}
            </span>
          </div>

          {/* Bottom Right Play / Video or Shade indicator (Matching Image 2) */}
          {product.id % 3 === 0 ? (
            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/80 text-white text-[10px] flex items-center justify-center shadow-md">
              ▶
            </div>
          ) : product.id % 2 === 0 ? (
            <div className="absolute bottom-2 right-2 bg-white/95 text-[#282c3f] text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#eaeaec] flex items-center gap-1 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#ff3f6c] inline-block"></span>
              4 Shades
            </div>
          ) : null}
        </div>

        {/* Product Info (Matching Image 2 Style) */}
        <div className="p-2.5 relative bg-white z-10">
          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isWishlisted) removeFromWishlist(product.id);
              else addToWishlist(product);
            }}
            className="absolute top-2.5 right-2.5 text-[#282c3f] hover:text-[#ff3f6c] z-20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${isWishlisted ? 'text-[#ff3f6c] fill-[#ff3f6c]' : 'text-[#282c3f]'}`}
              fill={isWishlisted ? '#ff3f6c' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Brand Name in BOLD UPPERCASE */}
          <h3 className="text-[13px] font-extrabold text-[#282c3f] uppercase tracking-wide truncate pr-6">
            {product.brand}
          </h3>

          {/* Product Title Subtitle */}
          <p className="text-[12px] text-[#535766] truncate mt-0.5 font-normal">
            {product.title}
          </p>

          {/* Price Formatting matching Image 2 */}
          <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span className="text-[11px] text-[#7e818c] line-through">₹{Math.round(product.original_price)}</span>
            )}
            <span className="text-[13px] font-extrabold text-[#282c3f]">₹{Math.round(product.price)}</span>
            {product.discount > 0 && (
              <span className="text-[11px] font-bold text-[#ff905a]">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Optional Best Price tag */}
          {product.discount > 40 && (
            <p className="text-[10px] text-[#03a685] font-extrabold mt-0.5 truncate">
              Best Price ₹{Math.round(product.price * 0.9)} with offer
            </p>
          )}
        </div>
      </Link>

      {/* Hover Action (Add to Bag) for Desktop */}
      <div className="hidden md:block absolute bottom-0 left-0 right-0 p-2.5 bg-white translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
        <button
          onClick={() => addToCart(product)}
          className="w-full py-2 bg-[#ff3f6c] text-white rounded-[4px] text-[12px] font-bold flex items-center justify-center gap-2 hover:bg-[#e11b4c] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          ADD TO BAG
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

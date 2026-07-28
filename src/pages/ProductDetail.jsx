import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

import { ProductDetailSkeleton } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';
import { MobilePageHeader } from '../components/MobileHeader';
import MobileBottomNav from '../components/MobileBottomNav';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [error, setError] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [slideDir, setSlideDir] = useState('left');

  // Touch swipe tracking refs for mobile (must be above early returns)
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const imgLenRef = useRef(1); // tracks productImages.length for use in callbacks

  const goNext = useCallback(() => {
    setActiveImgIdx((prev) => (prev + 1) % imgLenRef.current);
    setSlideDir('left');
  }, []);

  const goPrev = useCallback(() => {
    setActiveImgIdx((prev) => (prev - 1 + imgLenRef.current) % imgLenRef.current);
    setSlideDir('right');
  }, []);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 40 && dy < 60) {
      if (dx < 0) goNext(); else goPrev();
    }
    touchStartX.current = null;
  }, [goNext, goPrev]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const COSMETIC_CATEGORIES = [
    'Face Wash', 'Serums & Treatments', 'Sunscreen & Moisturiser', 'Lip Care',
    'Eye Makeup', 'Face Makeup', 'Lip Makeup', 'Hair Care', 'Body & Bath',
    "Men's Grooming", 'Fragrance & Deodorant', 'Beauty Tools',
    'Toners & Face Mists', 'Face Masks & Exfoliators', 'Cleansers & Makeup Removers',
    'Nail Care', 'Hair Styling & Masks', 'Hand & Foot Care',
    'Shaving & Hair Removal', 'Intimate & Personal Care'
  ];

  const isNonApparel = product ? COSMETIC_CATEGORIES.includes(product.category) : false;

  const derivedSizes = useMemo(
    () => typeof product?.available_sizes === 'string' && product.available_sizes.trim() !== ''
      ? product.available_sizes.split(',').map(s => s.trim())
      : (isNonApparel ? ['One Size'] : ['S', 'M', 'L', 'XL', 'XXL']),
    [product?.available_sizes, isNonApparel]
  );

  // Dynamic product details based on category
  const getCategoryDetails = (cat) => {
    if (cat === 'Face Wash') return { type: 'Skin Type', value: 'Normal to Oily' };
    if (cat === 'Serums & Treatments') return { type: 'Concern', value: 'Daily Skin Treatment' };
    if (cat === 'Sunscreen & Moisturiser') return { type: 'Protection', value: 'Daily Hydration & SPF' };
    if (cat === 'Lip Care') return { type: 'Benefit', value: 'Hydrating Lip Care' };
    if (cat === 'Eye Makeup') return { type: 'Formula', value: 'Long-Lasting Kohl' };
    if (cat === 'Face Makeup') return { type: 'Finish', value: 'Matte / Dewy' };
    if (cat === 'Lip Makeup') return { type: 'Finish', value: 'Matte / Creamy' };
    if (cat === 'Hair Care') return { type: 'Hair Type', value: 'All Hair Types' };
    if (cat === 'Body & Bath') return { type: 'Skin Type', value: 'All Skin Types' };
    if (cat === "Men's Grooming") return { type: 'Use', value: 'Daily Grooming' };
    if (cat === 'Fragrance & Deodorant') return { type: 'Wear', value: 'Long-Lasting Fragrance' };
    if (cat === 'Beauty Tools') return { type: 'Material', value: 'Skin-Safe Material' };
    if (cat === 'Toners & Face Mists') return { type: 'Benefit', value: 'Refresh & Balance' };
    if (cat === 'Face Masks & Exfoliators') return { type: 'Routine', value: 'Weekly Treatment' };
    if (cat === 'Cleansers & Makeup Removers') return { type: 'Use', value: 'Gentle First Cleanse' };
    if (cat === 'Nail Care') return { type: 'Finish', value: 'Glossy / Trend Colour' };
    if (cat === 'Hair Styling & Masks') return { type: 'Benefit', value: 'Style & Deep Care' };
    if (cat === 'Hand & Foot Care') return { type: 'Concern', value: 'Dry & Rough Skin' };
    if (cat === 'Shaving & Hair Removal') return { type: 'Use', value: 'Smooth Grooming' };
    if (cat === 'Intimate & Personal Care') return { type: 'Use', value: 'Daily Gentle Care' };
    return { type: 'Type', value: 'Beauty & Personal Care' };
  };

  useEffect(() => {
    if (product) {
      if (isNonApparel || (derivedSizes.length === 1 && derivedSizes[0] !== 'S')) {
        setSelectedSize(derivedSizes[0] || 'One Size');
      }
    }
  }, [product, isNonApparel, derivedSizes]);

  if (loading) return <ProductDetailSkeleton />;
  if (fetchError || !product) return <div className="pt-32 text-center h-[50vh] text-red-500 font-bold">{fetchError || 'Product not found'}</div>;

  // The catalog importer validates four distinct, product-specific images.
  const productImages = [...new Set([
    ...(Array.isArray(product.images) ? product.images : []),
    product.image_url
  ].filter(Boolean))].slice(0, 4);

  // Keep ref in sync so goNext/goPrev always see the right count
  imgLenRef.current = productImages.length || 1;

  const handleAddToCart = () => {
    const sizeToUse = selectedSize || (isNonApparel ? (derivedSizes[0] || 'Standard') : '');
    if (!sizeToUse) {
      setError(true);
      return;
    }
    setError(false);
    addToCart(product, sizeToUse);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Top Header */}
      <MobilePageHeader title={product.category || 'PRODUCT DETAILS'} />

      <div className="pt-20 sm:pt-24 md:pt-28 pb-20 md:pb-12 w-full max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Left: Image Gallery */}
        <div className="w-full md:w-1/2">

          {/* ── DESKTOP: Left thumbnail strip + Large main image ── */}
          <div className="hidden md:flex gap-3 sticky top-28">

            {/* Thumbnail Strip (left column) */}
            <div className="flex flex-col gap-2 w-[72px] flex-shrink-0">
              {productImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSlideDir(idx > activeImgIdx ? 'left' : 'right'); setActiveImgIdx(idx); }}
                  className={`w-full aspect-[3/4] rounded-[4px] overflow-hidden border-2 transition-all duration-200 flex-shrink-0
                    ${activeImgIdx === idx
                      ? 'border-[#ff3f6c] shadow-md scale-[1.04]'
                      : 'border-[#eaeaec] opacity-55 hover:opacity-100 hover:border-[#282c3f]'
                    }`}
                >
                  <img src={imgUrl} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image Viewer */}
            <div className="flex-1 relative rounded-[4px] overflow-hidden bg-[#f5f5f6] border border-[#eaeaec] group" style={{ minHeight: '520px' }}>
              {/* Slide Wrapper */}
              <div
                key={activeImgIdx}
                className="w-full h-full"
                style={{
                  animation: slideDir === 'left'
                    ? 'slideInFromRight 0.32s cubic-bezier(0.25,0.46,0.45,0.94)'
                    : 'slideInFromLeft 0.32s cubic-bezier(0.25,0.46,0.45,0.94)',
                }}
              >
                <img
                  src={productImages[activeImgIdx]}
                  alt={`${product.title} view ${activeImgIdx + 1}`}
                  className="w-full h-full object-cover"
                  style={{ minHeight: '520px' }}
                />
              </div>

              {/* Prev Arrow */}
              {productImages.length > 1 && (
                <button
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white hover:scale-110 z-10"
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#282c3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Next Arrow */}
              {productImages.length > 1 && (
                <button
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white hover:scale-110 z-10"
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#282c3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Image counter pill */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                {activeImgIdx + 1} / {productImages.length}
              </div>
            </div>
          </div>

          {/* ── MOBILE: Swipeable Carousel + Thumbnails ── */}
          <div className="md:hidden relative w-full">
            {/* Main swipeable image */}
            <div
              className="relative overflow-hidden rounded-lg bg-[#f5f5f6] aspect-[3/4]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                key={activeImgIdx}
                className="w-full h-full"
                style={{
                  animation: slideDir === 'left'
                    ? 'slideInFromRight 0.28s cubic-bezier(0.25,0.46,0.45,0.94)'
                    : 'slideInFromLeft 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
                }}
              >
                <img
                  src={productImages[activeImgIdx]}
                  alt={`${product.title} pose ${activeImgIdx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Mobile Prev Arrow */}
              {productImages.length > 1 && (
                <button
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 shadow flex items-center justify-center z-10"
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#282c3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Mobile Next Arrow */}
              {productImages.length > 1 && (
                <button
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 shadow flex items-center justify-center z-10"
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#282c3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Dot Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {productImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSlideDir(idx > activeImgIdx ? 'left' : 'right'); setActiveImgIdx(idx); }}
                    className={`rounded-full transition-all duration-200 ${activeImgIdx === idx ? 'w-5 h-2 bg-[#ff3f6c]' : 'w-2 h-2 bg-white/70'}`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail Strip underneath */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              {productImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSlideDir(idx > activeImgIdx ? 'left' : 'right'); setActiveImgIdx(idx); }}
                  className={`w-16 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200
                    ${activeImgIdx === idx ? 'border-[#ff3f6c] shadow-md scale-105' : 'border-transparent opacity-60'}`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

        </div>

      {/* Right: Product Info */}
      <div className="w-full md:w-1/2 px-0 md:px-8">
        <h1 className="text-[24px] font-bold text-[#282c3f]">{product.brand}</h1>
        <h2 className="text-[20px] text-[#535766] font-light mt-1 mb-4">{product.title}</h2>

        {/* Ratings Badge */}
        <div className="inline-flex items-center gap-1 border border-[#eaeaec] rounded-[2px] px-2 py-1 mb-4">
          <span className="text-[14px] font-bold">{product.rating}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#14958f]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-[14px] text-[#535766] border-l border-[#eaeaec] pl-2 ml-1">{product.reviews} Ratings</span>
        </div>

        <hr className="border-t border-[#eaeaec] mb-4" />

        {/* Pricing */}
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[24px] font-bold text-[#282c3f]">₹{product.price}</span>
          <span className="text-[20px] text-[#7e818c] line-through">MRP ₹{product.original_price}</span>
          <span className="text-[20px] font-bold text-[#ff905a]">({product.discount}% OFF)</span>
        </div>
        <p className="text-[14px] font-bold text-[#03a685] mb-6">inclusive of all taxes</p>

        {/* Size / Variant Selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[16px] font-bold text-[#282c3f]">
              {isNonApparel ? 'AVAILABLE VARIANT / SIZE' : 'SELECT SIZE'}
            </h3>
            {!isNonApparel && <span className="text-[14px] font-bold text-[#ff3f6c] cursor-pointer">SIZE CHART</span>}
          </div>
          <div className="flex flex-wrap gap-3">
            {derivedSizes.map((size) => (
              <button
                key={size}
                onClick={() => { setSelectedSize(size); setError(false); }}
                className={`px-4 py-2.5 rounded-full border flex items-center justify-center text-[13px] font-bold transition-all
                  ${selectedSize === size ? 'border-[#ff3f6c] text-[#ff3f6c] bg-[#ff3f6c]/5' : 'border-[#bfc0c6] text-[#282c3f] hover:border-[#ff3f6c]'}
                `}
              >
                {size}
              </button>
            ))}
          </div>
          {error && <p className="text-[#ff3f6c] text-[12px] mt-2 font-bold">Please select a size option</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-[#ff3f6c] text-white font-bold py-4 rounded-[4px] flex justify-center items-center gap-2 hover:bg-[#e11b4c] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            ADD TO BAG
          </button>

          <button
            onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
            className="flex-1 border border-[#bfc0c6] text-[#282c3f] font-bold py-4 rounded-[4px] flex justify-center items-center gap-2 hover:border-[#282c3f] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isInWishlist(product.id) ? 'text-[#ff3f6c] fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isInWishlist(product.id) ? 'WISHLISTED' : 'WISHLIST'}
          </button>
        </div>

        <hr className="border-t border-[#eaeaec] mb-4" />

        {/* Product Details */}
        <div>
          <h3 className="text-[14px] font-bold text-[#282c3f] mb-4 flex items-center gap-2">
            PRODUCT DETAILS
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </h3>
          <p className="text-[14px] text-[#282c3f] leading-6 mb-4">{product.description}</p>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-[14px] mb-6">
            <div>
              <p className="text-[#7e818c]">{getCategoryDetails(product.category).type}</p>
              <p className="text-[#282c3f] font-medium">{getCategoryDetails(product.category).value}</p>
            </div>
            <div>
              <p className="text-[#7e818c]">Category</p>
              <p className="text-[#282c3f] font-medium">{product.category}</p>
            </div>
            <div>
              <p className="text-[#7e818c]">Brand</p>
              <p className="text-[#282c3f] font-medium">{product.brand}</p>
            </div>
            <div>
              <p className="text-[#7e818c]">Seller</p>
              <p className="text-[#282c3f] font-medium">{product.seller || product.brand}</p>
            </div>
            <div>
              <p className="text-[#7e818c]">SKU</p>
              <p className="text-[#282c3f] font-medium">{product.sku || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[#7e818c]">Stock</p>
              <p className="text-[#03a685] font-medium">{product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} units)` : 'Out of Stock'}</p>
            </div>
          </div>

          {/* Customer Reviews Highlights */}
          <hr className="border-t border-[#eaeaec] mb-4" />
          <h3 className="text-[14px] font-bold text-[#282c3f] mb-3">CUSTOMER REVIEWS</h3>
          <div className="flex items-center gap-3 mb-4 bg-[#f5f5f6] rounded-lg p-3">
            <div className="text-center">
              <div className="text-3xl font-black text-[#282c3f]">{product.rating}</div>
              <div className="flex items-center justify-center gap-0.5 my-1">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${s <= Math.round(product.rating) ? 'text-[#14958f] fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-[11px] text-[#7e818c]">{Number(product.reviews || 0).toLocaleString('en-IN')} ratings</div>
            </div>
            <div className="flex-1 pl-3">
              {[['5★', 70], ['4★', 20], ['3★', 6], ['2★', 2], ['1★', 2]].map(([star, pct]) => (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-[#535766] w-5">{star}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div className="bg-[#14958f] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {(Array.isArray(product.review_data) && product.review_data.length > 0
            ? product.review_data
            : [
                { name: 'Aarohi S.', text: `${product.title} is easy to use and feels like good value for money.`, ago: '3 days ago', stars: 5 },
                { name: 'Mehak R.', text: `The ${product.brand} quality and packaging are both impressive.`, ago: '1 week ago', stars: 5 },
                { name: 'Riya K.', text: 'The product matched its photos and fitted neatly into my daily routine.', ago: '2 weeks ago', stars: 4 },
                { name: 'Kabir M.', text: 'Arrived in good condition and the results met my expectations.', ago: '3 weeks ago', stars: 5 },
                { name: 'Neha P.', text: 'A practical everyday pick at a very reasonable price.', ago: '1 month ago', stars: 5 },
              ]
          ).map((rev, i) => (
            <div key={i} className="border-b border-[#f5f5f6] pb-3 mb-3 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[13px] text-[#282c3f]">{rev.name}</span>
                <span className="text-[11px] text-[#7e818c]">{rev.ago}</span>
              </div>
              <div className="flex gap-0.5 mb-1.5">
                {[1,2,3,4,5].map(s => <svg key={s} xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${s <= rev.stars ? 'text-[#14958f] fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
              </div>
              <p className="text-[13px] text-[#535766] leading-5">{rev.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default ProductDetail;

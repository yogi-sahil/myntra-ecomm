import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

import { ProductDetailSkeleton } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [error, setError] = useState(false);

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
  if (loading) return <ProductDetailSkeleton />;
  if (fetchError || !product) return <div className="pt-32 text-center h-[50vh] text-red-500 font-bold">{fetchError || 'Product not found'}</div>;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError(true);
      return;
    }
    setError(false);
    addToCart(product, selectedSize);
  };

  return (
    <div className="pt-24 pb-12 w-full max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row gap-8">
      {/* Left: Image Gallery */}
      <div className="w-full md:w-1/2">
        <div className="grid grid-cols-2 gap-2">
          {/* Mocking multiple images by repeating the same one for visual effect */}
          <img src={product.image_url} alt={product.title} className="w-full h-[auto] object-cover hover:scale-105 transition-transform duration-300" />
          <img src={product.image_url} alt={product.title} className="w-full h-[auto] object-cover hover:scale-105 transition-transform duration-300" />
          <img src={product.image_url} alt={product.title} className="w-full h-[auto] object-cover hover:scale-105 transition-transform duration-300" />
          <img src={product.image_url} alt={product.title} className="w-full h-[auto] object-cover hover:scale-105 transition-transform duration-300" />
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

        {/* Size Selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[16px] font-bold text-[#282c3f]">SELECT SIZE</h3>
            <span className="text-[14px] font-bold text-[#ff3f6c] cursor-pointer">SIZE CHART</span>
          </div>
          <div className="flex gap-4">
            {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <button
                key={size}
                onClick={() => { setSelectedSize(size); setError(false); }}
                className={`w-[50px] h-[50px] rounded-full border flex items-center justify-center text-[14px] font-bold transition-colors
                  ${selectedSize === size ? 'border-[#ff3f6c] text-[#ff3f6c]' : 'border-[#bfc0c6] text-[#282c3f] hover:border-[#ff3f6c]'}
                `}
              >
                {size}
              </button>
            ))}
          </div>
          {error && <p className="text-[#ff3f6c] text-[12px] mt-2">Please select a size</p>}
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
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-[14px]">
            <div>
              <p className="text-[#7e818c]">Fit</p>
              <p className="text-[#282c3f]">Regular Fit</p>
            </div>
            <div>
              <p className="text-[#7e818c]">Fabric</p>
              <p className="text-[#282c3f]">100% Cotton</p>
            </div>
            <div>
              <p className="text-[#7e818c]">Seller</p>
              <p className="text-[#282c3f]">{product.seller}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;

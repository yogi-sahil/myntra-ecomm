import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToBag = (item) => {
    addToCart(item);
    removeFromWishlist(item.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="pt-32 pb-20 w-full min-h-[60vh] flex flex-col items-center justify-center bg-white">
        <h2 className="text-[20px] font-bold text-[#282c3f] mb-4">YOUR WISHLIST IS EMPTY</h2>
        <p className="text-[16px] text-[#7e818c] mb-8 text-center max-w-[400px]">
          Add items that you like to your wishlist. Review them anytime and easily move them to the bag.
        </p>
        <Link 
          to="/products"
          className="border border-[#ff3f6c] text-[#ff3f6c] font-bold text-[14px] px-12 py-3 rounded-[4px] hover:bg-[#ff3f6c] hover:text-white transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 w-full max-w-[1200px] mx-auto px-4">
      <h1 className="text-[18px] font-bold text-[#282c3f] mb-8">My Wishlist <span className="font-normal text-[#535766]">{wishlistItems.length} items</span></h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {wishlistItems.map((item) => (
          <div key={item.id} className="group relative w-full flex flex-col border border-[#eaeaec] hover:shadow-[0_2px_16px_4px_rgba(40,44,63,0.07)] transition-shadow duration-300 bg-white">
            <Link to={`/product/${item.id}`} className="block">
              {/* Product Image */}
              <div className="relative w-full h-[280px] overflow-hidden bg-gray-100">
                <img 
                  src={item.image_url || item.image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80'} 
                  alt={item.title} 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80'; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Remove from Wishlist Button */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(item.id);
                  }}
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-2 text-gray-400 hover:text-red-500 z-10 transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Product Info */}
              <div className="p-3 relative bg-white z-10 border-b border-[#eaeaec]">
                <h3 className="text-[14px] font-bold text-[#282c3f] truncate">{item.brand}</h3>
                <p className="text-[13px] text-[#535766] truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[14px] font-bold text-[#282c3f]">Rs. {item.price}</span>
                  {(item.original_price || item.originalPrice) && (
                    <span className="text-[12px] text-[#7e818c] line-through">Rs. {item.original_price || item.originalPrice}</span>
                  )}
                  {item.discount > 0 && (
                    <span className="text-[12px] font-bold text-[#ff905a]">({item.discount}% OFF)</span>
                  )}
                </div>
              </div>
            </Link>

            {/* Move to Bag Action */}
            <button 
              onClick={() => handleMoveToBag(item)}
              className="w-full py-3 text-[14px] font-bold text-[#ff3f6c] uppercase hover:bg-gray-50 transition-colors"
            >
              Move to Bag
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;

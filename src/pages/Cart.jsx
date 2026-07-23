import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, totalItems } = useCart();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [defaultAddress, setDefaultAddress] = useState(null);

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/profile/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const def = data.find(a => a.is_default) || data[0];
          setDefaultAddress(def);
        }
      })
      .catch(err => console.error(err));
    }
  }, [token]);

  // Calculate some values based on Myntra's real UI
  const totalMRP = cartItems.reduce((acc, item) => {
    const itemOriginal = Number(item.original_price || item.originalPrice || item.price || 0);
    const qty = Number(item.quantity || 1);
    return acc + (itemOriginal * qty);
  }, 0);
  const totalDiscount = Math.max(0, totalMRP - cartTotal);
  const convenienceFee = 99; // fixed convenience fee

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput, cartTotal })
      });
      const data = await response.json();
      
      if (response.ok) {
        let discount = 0;
        if (data.coupon.type === 'Percentage') {
          discount = Math.floor(cartTotal * (data.coupon.value / 100));
        } else {
          discount = data.coupon.value;
        }
        // Ensure discount doesn't exceed cart total
        discount = Math.min(discount, cartTotal);
        
        setDiscountAmount(discount);
        setAppliedCoupon(data.coupon.code);
        showToast(data.message, 'success');
      } else {
        showToast(data.message || 'Invalid coupon code', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to apply coupon', 'error');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInput('');
    setAppliedCoupon('');
    setDiscountAmount(0);
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="pt-32 pb-20 w-full min-h-[60vh] flex flex-col items-center justify-center bg-white">
        <img 
          src="https://constant.myntassets.com/checkout/assets/img/empty-bag.webp" 
          alt="Empty Bag" 
          className="w-40 h-40 mb-6"
        />
        <h2 className="text-[20px] font-bold text-[#282c3f] mb-2">Hey, it feels so light!</h2>
        <p className="text-[14px] text-[#7e818c] mb-6">There is nothing in your bag. Let's add some items.</p>
        <Link 
          to="/products"
          className="border border-[#ff3f6c] text-[#ff3f6c] font-bold text-[14px] px-12 py-3 rounded-[4px] hover:bg-[#ff3f6c] hover:text-white transition-colors"
        >
          ADD ITEMS FROM WISHLIST
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 w-full max-w-[1000px] mx-auto px-4 flex flex-col md:flex-row gap-6 items-start">
      {/* Left Column: Cart Items */}
      <div className="w-full md:w-[65%] flex flex-col gap-4">
        
        {/* Address Banner */}
        <div className="flex justify-between items-center p-4 border border-[#eaeaec] rounded-[4px] bg-white">
          <div>
            <p className="text-[14px] text-[#282c3f]">
              Deliver to: <span className="font-bold">{defaultAddress ? `${defaultAddress.name}, ${defaultAddress.pincode}` : (user?.name ? `${user.name}` : 'Select Delivery Address')}</span>
            </p>
            <p className="text-[12px] text-[#7e818c] mt-1">
              {defaultAddress ? `${defaultAddress.address_line}, ${defaultAddress.city}, ${defaultAddress.state}` : 'Add or select a delivery address for seamless checkout'}
            </p>
          </div>
          <Link to="/checkout" className="text-[#ff3f6c] text-[12px] font-bold uppercase border border-[#ff3f6c] px-4 py-2 rounded-[4px] hover:bg-[#ff3f6c] hover:text-white transition-colors">
            {defaultAddress ? 'Change Address' : 'Add Address'}
          </Link>
        </div>

        {/* Offers Banner */}
        <div className="p-4 border border-[#eaeaec] rounded-[4px]">
          <h3 className="text-[14px] font-bold text-[#282c3f] flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#282c3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Available Offers
          </h3>
          <ul className="text-[13px] text-[#535766] list-disc list-inside space-y-1 ml-1">
            <li>10% Instant Discount on HDFC Bank Credit Cards on a min spend of Rs 3000.</li>
            <li>5% Unlimited Cashback on Flipkart Axis Bank Credit Card.</li>
          </ul>
        </div>

        {/* Item Count */}
        <div className="flex justify-between items-center mt-2 font-bold text-[16px] text-[#282c3f]">
          <span>{totalItems} ITEM{totalItems > 1 ? 'S' : ''} SELECTED</span>
        </div>

        {/* Items List */}
        <div className="border border-[#eaeaec] rounded-[4px] bg-white">
          {cartItems.map((item) => (
            <div key={item.cart_item_id || item.id} className="p-4 border-b border-[#eaeaec] last:border-b-0 relative group">
              <div className="flex gap-4">
                {/* Product Image */}
                <Link to={`/product/${item.id}`} className="w-[110px] h-[146px] flex-shrink-0 relative bg-gray-100 overflow-hidden">
                  <img 
                    src={item.image_url || item.image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80'} 
                    alt={item.title} 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80'; }}
                    className="w-full h-full object-cover" 
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex justify-between pr-6">
                    <h3 className="text-[14px] font-bold text-[#282c3f]">{item.brand}</h3>
                    <p className="text-[14px] text-[#282c3f] truncate w-[200px]">{item.title}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button className="bg-gray-100 px-2 py-1 text-[12px] font-bold text-[#282c3f] rounded-[2px] flex items-center gap-1">
                      Size: {item.size || 'M'} 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <div className="bg-gray-100 px-2 py-1 text-[12px] font-bold text-[#282c3f] rounded-[2px] flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.cart_item_id, -1, item.id, item.size)} className="text-gray-500 hover:text-black focus:outline-none">
                        -
                      </button>
                      <span>Qty: {item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cart_item_id, 1, item.id, item.size)} className="text-gray-500 hover:text-black focus:outline-none">
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-[14px] font-bold text-[#282c3f]">Rs. {item.price * item.quantity}</span>
                    {(item.original_price || item.originalPrice) && (
                      <span className="text-[14px] text-[#7e818c] line-through">
                        Rs. {Number(item.original_price || item.originalPrice) * item.quantity}
                      </span>
                    )}
                    {item.discount > 0 && (
                      <span className="text-[14px] font-bold text-[#ff905a]">{item.discount}% OFF</span>
                    )}
                  </div>
                  <div className="text-[12px] text-[#282c3f] mt-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong>14 days</strong> return available
                  </div>
                </div>

                {/* Remove Item Button */}
                <button 
                  onClick={() => removeFromCart(item.cart_item_id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                  title="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Price Details */}
      <div className="w-full md:w-[35%] flex flex-col gap-4 sticky top-[100px]">
        {/* Coupons */}
        <div className="p-4 border border-[#eaeaec] rounded-[4px]">
          <div className="flex justify-between items-center text-[13px] font-bold text-[#282c3f] mb-3">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Apply Coupons
            </div>
          </div>
          {appliedCoupon ? (
            <div className="flex justify-between items-center bg-[#e6f6f2] p-2 rounded-sm border border-[#03a685]">
              <span className="text-[12px] font-bold text-[#03a685]">{appliedCoupon} APPLIED</span>
              <button onClick={handleRemoveCoupon} className="text-[#ff3f6c] text-[12px] font-bold hover:underline">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter coupon (e.g. MYNTRA10)" 
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 border border-[#d4d5d9] px-3 py-1 outline-none text-[13px] uppercase"
              />
              <button onClick={handleApplyCoupon} className="text-[#ff3f6c] border border-[#ff3f6c] px-4 py-1 rounded-[4px] uppercase text-[12px] hover:bg-gray-50">
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="p-4 border border-[#eaeaec] rounded-[4px]">
          <h4 className="text-[12px] font-bold text-[#535766] uppercase mb-4">Price Details ({totalItems} Items)</h4>
          
          <div className="flex flex-col gap-3 text-[14px] text-[#282c3f] mb-4 border-b border-[#eaeaec] pb-4">
            <div className="flex justify-between">
              <span>Total MRP</span>
              <span>Rs. {totalMRP}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount on MRP</span>
              <span className="text-[#03a685]">- Rs. {totalDiscount}</span>
            </div>
            {appliedCoupon ? (
              <div className="flex justify-between">
                <span>Coupon Discount ({appliedCoupon})</span>
                <span className="text-[#03a685]">- Rs. {discountAmount}</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span>Coupon Discount</span>
                <span className="text-[#ff3f6c] cursor-pointer">Apply Coupon</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Convenience Fee</span>
              <span className="text-[#282c3f]">Rs. {convenienceFee}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[15px] font-bold text-[#282c3f] mb-6">
            <span>Total Amount</span>
            <span>Rs. {cartTotal - discountAmount + convenienceFee}</span>
          </div>

          <Link to="/checkout" state={{ discountAmount }} className="w-full bg-[#ff3f6c] text-white font-bold py-3 text-[14px] rounded-[2px] hover:bg-[#e11b4c] transition-colors flex justify-center mt-2">
            PLACE ORDER
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;

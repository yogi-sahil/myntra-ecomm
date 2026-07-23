import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
  const { cartItems, cartTotal, setCartItems } = useCart();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const [addressData, setAddressData] = useState({
    name: user?.name || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    mobile: user?.mobile || ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const discountFromCart = location.state?.discountAmount || 0;

  const convenienceFee = 99;
  const finalTotal = cartTotal - discountFromCart + convenienceFee;

  useEffect(() => {
    if (user) {
      setAddressData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        mobile: prev.mobile || user.mobile || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/profile/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSavedAddresses(data);
          const defaultAddress = data.find(a => a.is_default) || data[0];
          setSelectedAddressId(defaultAddress.id);
          populateAddressData(defaultAddress);
          setShowAddressForm(false);
        } else {
          setSavedAddresses([]);
          setShowAddressForm(true);
        }
      })
      .catch(err => {
        console.error(err);
        setShowAddressForm(true);
      });
    } else {
      setShowAddressForm(true);
    }
  }, [token]);

  const populateAddressData = (address) => {
    setAddressData({
      name: address.name || user?.name || '',
      street: address.address_line || address.street || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      mobile: address.mobile || user?.mobile || ''
    });
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
    populateAddressData(address);
    setShowAddressForm(false);
  };

  const handleSaveAddressAndContinue = async () => {
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.pincode || !addressData.mobile) {
      showToast('Please fill all required address fields (Street, City, State, Pincode, Mobile)', 'error');
      return;
    }

    if (showAddressForm && token) {
      try {
        const res = await fetch(`${API_BASE_URL}/profile/addresses`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            name: addressData.name || user?.name || 'Customer',
            mobile: addressData.mobile,
            pincode: addressData.pincode,
            address_line: addressData.street,
            city: addressData.city,
            state: addressData.state,
            is_default: savedAddresses.length === 0
          })
        });

        if (res.ok) {
          showToast('Address saved successfully! 📍', 'success');
          // Re-fetch saved addresses
          const updatedRes = await fetch(`${API_BASE_URL}/profile/addresses`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (updatedRes.ok) {
            const data = await updatedRes.json();
            if (Array.isArray(data)) {
              setSavedAddresses(data);
            }
          }
        }
      } catch (err) {
        console.error('Failed to save address:', err);
      }
    }

    setShowAddressForm(false);
    setStep(2);
  };

  const handlePlaceCodOrder = async () => {
    setLoading(true);
    try {
      const formattedAddress = `${addressData.street}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`;
      const response = await fetch(`${API_BASE_URL}/payment/cod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 2,
          totalAmount: finalTotal,
          shippingAddress: formattedAddress,
          items: cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      if (response.ok) {
        showToast('COD Order placed successfully! 📦', 'success');
        setCartItems && setCartItems([]);
        navigate('/');
      } else {
        showToast('Failed to place COD order', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error placing COD order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // 1. Create Razorpay Order on Backend
      const orderResponse = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal })
      });
      const orderData = await orderResponse.json();

      if (!orderResponse.ok) throw new Error(orderData.message);

      // 2. Setup Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_QvFiXZe6iRfjAH', // Public Key
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Myntra Clone',
        description: 'Test Transaction',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const formattedAddress = `${addressData.street}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`;
            // 3. Verify Payment and Save Order
            const verifyResponse = await fetch(`${API_BASE_URL}/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user?.id || 2, 
                totalAmount: finalTotal,
                shippingAddress: formattedAddress,
                items: cartItems.map(item => ({
                  id: item.id,
                  quantity: item.quantity,
                  price: item.price
                }))
              })
            });

            if (verifyResponse.ok) {
              showToast('Payment Successful! Order placed 🎉', 'success');
              setCartItems && setCartItems([]);
              navigate('/');
            } else {
              showToast('Payment Verification Failed', 'error');
            }
          } catch (err) {
            console.error('Verify error:', err);
            showToast('Failed to verify payment', 'error');
          }
        },
        prefill: {
          name: user?.name || 'Customer',
          email: user?.email || 'customer@myntra.local',
          contact: addressData.mobile || user?.mobile || '9999999999'
        },
        theme: {
          color: '#ff3f6c'
        }
      };

      // 4. Open Razorpay Checkout Modal
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        showToast('Payment Failed: ' + response.error.description, 'error');
      });
      rzp.open();

    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Error initiating checkout', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-12 w-full max-w-[900px] mx-auto px-4">
      
      {/* Secure Checkout Header Banner */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#eaeaec]">
        <h1 className="text-[20px] font-bold text-[#282c3f] flex items-center gap-2">
          SECURE CHECKOUT
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#03a685]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </h1>
        <div className="flex items-center gap-4 text-[12px] font-bold text-[#535766]">
          <span className={step >= 1 ? 'text-[#03a685]' : ''}>ADDRESS</span>
          <span className="text-[#eaeaec]">------</span>
          <span className={step >= 2 ? 'text-[#03a685]' : ''}>PAYMENT</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Area (Forms) */}
        <div className="w-full md:w-[65%] flex flex-col gap-4">
          
          {step === 1 && (
            <div className="border border-[#eaeaec] bg-white rounded-sm">
              <div className="p-4 bg-gray-50 border-b border-[#eaeaec] flex justify-between items-center">
                <h2 className="text-[14px] font-bold text-[#282c3f] uppercase">Select Delivery Address</h2>
                {savedAddresses.length > 0 && !showAddressForm && (
                  <button onClick={() => setShowAddressForm(true)} className="text-[12px] font-bold text-[#ff3f6c] uppercase border border-[#ff3f6c] px-3 py-1 rounded-sm">Add New</button>
                )}
                {showAddressForm && savedAddresses.length > 0 && (
                  <button onClick={() => setShowAddressForm(false)} className="text-[12px] font-bold text-[#ff3f6c] uppercase">Cancel</button>
                )}
              </div>
              
              <div className="p-6 flex flex-col gap-4">
                
                {/* Saved Addresses List */}
                {!showAddressForm && savedAddresses.length > 0 && (
                  <div className="flex flex-col gap-4 mb-4">
                    {savedAddresses.map((address) => (
                      <div 
                        key={address.id} 
                        onClick={() => handleSelectAddress(address)}
                        className={`p-4 border rounded-sm cursor-pointer transition-all ${selectedAddressId === address.id ? 'border-[#03a685] bg-[#e6f6f2]' : 'border-[#eaeaec] hover:border-[#282c3f]'}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <input type="radio" checked={selectedAddressId === address.id} onChange={() => handleSelectAddress(address)} className="accent-[#03a685]" />
                          <span className="text-[14px] font-bold text-[#282c3f]">{address.name}</span>
                          {address.is_default && <span className="bg-gray-200 text-[#535766] text-[10px] px-2 py-0.5 rounded-sm uppercase font-bold">Default</span>}
                        </div>
                        <p className="text-[13px] text-[#535766] ml-6">{address.address_line}</p>
                        <p className="text-[13px] text-[#535766] ml-6">{address.city}, {address.state} - {address.pincode}</p>
                        <p className="text-[13px] text-[#535766] ml-6 mt-1">Mobile: <span className="font-bold">{address.mobile}</span></p>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Address Form */}
                {(showAddressForm || savedAddresses.length === 0) && (
                  <div className="flex flex-col gap-3">
                    <input 
                      type="text" 
                      placeholder="Full Name *" 
                      value={addressData.name}
                      onChange={(e) => setAddressData({...addressData, name: e.target.value})}
                      className="w-full border border-[#d4d5d9] p-3 text-[13px] outline-none focus:border-[#282c3f] rounded-sm"
                    />
                    <input 
                      type="text" 
                      placeholder="Street Address / House No / Building *" 
                      value={addressData.street}
                      onChange={(e) => setAddressData({...addressData, street: e.target.value})}
                      className="w-full border border-[#d4d5d9] p-3 text-[13px] outline-none focus:border-[#282c3f] rounded-sm"
                    />
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="City *" 
                        value={addressData.city}
                        onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                        className="w-1/2 border border-[#d4d5d9] p-3 text-[13px] outline-none focus:border-[#282c3f] rounded-sm"
                      />
                      <input 
                        type="text" 
                        placeholder="State *" 
                        value={addressData.state}
                        onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                        className="w-1/2 border border-[#d4d5d9] p-3 text-[13px] outline-none focus:border-[#282c3f] rounded-sm"
                      />
                    </div>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Pincode *" 
                        value={addressData.pincode}
                        onChange={(e) => setAddressData({...addressData, pincode: e.target.value})}
                        className="w-1/2 border border-[#d4d5d9] p-3 text-[13px] outline-none focus:border-[#282c3f] rounded-sm"
                      />
                      <input 
                        type="text" 
                        placeholder="Mobile Number *" 
                        value={addressData.mobile}
                        onChange={(e) => setAddressData({...addressData, mobile: e.target.value})}
                        className="w-1/2 border border-[#d4d5d9] p-3 text-[13px] outline-none focus:border-[#282c3f] rounded-sm"
                      />
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleSaveAddressAndContinue}
                  className="w-full bg-[#ff3f6c] text-white font-bold py-3 text-[14px] rounded-[2px] mt-4 hover:bg-[#e11b4c] transition-colors"
                >
                  SAVE & CONTINUE TO PAYMENT
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="border border-[#eaeaec] bg-white rounded-sm">
              <div className="p-4 bg-gray-50 border-b border-[#eaeaec] flex justify-between items-center">
                <h2 className="text-[14px] font-bold text-[#282c3f] uppercase">Choose Payment Mode</h2>
                <span className="text-[11px] font-bold text-[#03a685] flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  100% SECURE PAYMENTS
                </span>
              </div>
              <div className="flex flex-col md:flex-row">
                {/* Payment Tabs */}
                <div className="w-full md:w-[42%] bg-gray-50 border-r border-[#eaeaec] flex flex-col">
                  <button 
                    onClick={() => setPaymentMethod('razorpay_all')}
                    className={`p-3.5 text-left text-[13px] font-bold transition-all flex items-center justify-between border-l-4 ${paymentMethod.startsWith('razorpay') ? 'text-[#282c3f] bg-white border-[#ff3f6c] shadow-sm' : 'text-[#535766] border-transparent hover:bg-gray-100'}`}
                  >
                    <span>Razorpay (UPI / Card / NetBanking)</span>
                    <span className="text-[9px] bg-[#ff3f6c] text-white px-1.5 py-0.5 rounded font-black uppercase">Recommended</span>
                  </button>

                  <button 
                    onClick={() => setPaymentMethod('razorpay_upi')}
                    className={`p-3.5 text-left text-[13px] font-bold transition-all flex items-center justify-between border-l-4 ${paymentMethod === 'razorpay_upi' ? 'text-[#282c3f] bg-white border-[#ff3f6c] shadow-sm' : 'text-[#535766] border-transparent hover:bg-gray-100'}`}
                  >
                    <span>UPI (Google Pay / PhonePe / Paytm)</span>
                    <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black uppercase">Fastest</span>
                  </button>

                  <button 
                    onClick={() => setPaymentMethod('razorpay_card')}
                    className={`p-3.5 text-left text-[13px] font-bold transition-all flex items-center justify-between border-l-4 ${paymentMethod === 'razorpay_card' ? 'text-[#282c3f] bg-white border-[#ff3f6c] shadow-sm' : 'text-[#535766] border-transparent hover:bg-gray-100'}`}
                  >
                    <span>Credit / Debit Card</span>
                    <span className="text-[9px] text-gray-500 font-semibold">Visa/Master</span>
                  </button>

                  <button 
                    onClick={() => setPaymentMethod('razorpay_netbanking')}
                    className={`p-3.5 text-left text-[13px] font-bold transition-all flex items-center justify-between border-l-4 ${paymentMethod === 'razorpay_netbanking' ? 'text-[#282c3f] bg-white border-[#ff3f6c] shadow-sm' : 'text-[#535766] border-transparent hover:bg-gray-100'}`}
                  >
                    <span>Net Banking</span>
                    <span className="text-[9px] text-gray-500 font-semibold">50+ Banks</span>
                  </button>

                  <button 
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3.5 text-left text-[13px] font-bold transition-all flex items-center justify-between border-l-4 ${paymentMethod === 'cod' ? 'text-[#282c3f] bg-white border-[#ff3f6c] shadow-sm' : 'text-[#535766] border-transparent hover:bg-gray-100'}`}
                  >
                    <span className="text-gray-400">Cash On Delivery (COD)</span>
                    <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-black uppercase">Coming Soon</span>
                  </button>
                </div>

                {/* Payment Content */}
                <div className="w-full md:w-[58%] p-6">
                  {paymentMethod.startsWith('razorpay') ? (
                    <div>
                      {/* Razorpay Gateway Branding Card */}
                      <div className="border border-blue-100 bg-blue-50/50 rounded-lg p-5 mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[13px] font-black text-[#0c2340] tracking-wider flex items-center gap-1.5">
                            ⚡ RAZORPAY SECURE GATEWAY
                          </span>
                          <span className="text-[11px] font-bold text-[#03a685] bg-emerald-100 px-2 py-0.5 rounded-full">Official Partner</span>
                        </div>
                        <p className="text-[12px] text-gray-600 mb-4 leading-relaxed">
                          Pay instantly using your preferred method: <strong>Google Pay, PhonePe, Paytm, BHIM UPI, Credit/Debit Cards, or NetBanking</strong>.
                        </p>
                        {/* Gateway Payment Badges */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-100">
                          <span className="bg-white border border-gray-200 text-[10px] font-bold px-2.5 py-1 rounded text-gray-700">Google Pay / PhonePe / Paytm</span>
                          <span className="bg-white border border-gray-200 text-[10px] font-bold px-2.5 py-1 rounded text-gray-700">Visa / Mastercard / RuPay</span>
                          <span className="bg-white border border-gray-200 text-[10px] font-bold px-2.5 py-1 rounded text-gray-700">NetBanking (50+ Banks)</span>
                        </div>
                      </div>

                      <button 
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className={`w-full text-white font-black py-3.5 text-[15px] rounded-[4px] shadow-md transition-all flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff3f6c] hover:bg-[#e11b4c] hover:shadow-lg'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {loading ? 'OPENING RAZORPAY GATEWAY...' : `PAY VIA RAZORPAY ₹${finalTotal}`}
                      </button>
                      
                      <p className="text-center text-[11px] text-gray-400 mt-3 font-semibold">
                        🔒 Safe & 256-Bit Encrypted Transaction powered by Razorpay
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="border border-amber-200 bg-amber-50 rounded-lg p-5 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase bg-amber-500 text-white px-2 py-0.5 rounded">COMING SOON</span>
                          <h4 className="text-[13px] font-black text-[#282c3f]">Cash On Delivery Unavailable</h4>
                        </div>
                        <p className="text-[12px] text-gray-600 leading-relaxed">
                          Cash on Delivery is currently unavailable in your delivery area. Please pay online via <strong>Razorpay Secure Gateway</strong> for 100% safe & instant order confirmation!
                        </p>
                      </div>

                      <button 
                        onClick={() => setPaymentMethod('razorpay_all')}
                        className="w-full text-white font-black py-3.5 text-[14px] rounded-[4px] shadow-md bg-[#ff3f6c] hover:bg-[#e11b4c] transition-all flex items-center justify-center gap-2"
                      >
                        SWITCH TO ONLINE PAYMENT (RAZORPAY)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Area (Order Summary) */}
        <div className="w-full md:w-[35%] flex flex-col gap-4">
          {/* Order Items Preview */}
          <div className="border border-[#eaeaec] bg-white rounded-sm p-4">
            <h4 className="text-[12px] font-bold text-[#535766] uppercase mb-3">Order Items ({cartItems.length})</h4>
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.cart_item_id || item.id} className="flex gap-3 items-center border-b border-gray-100 pb-2.5 last:border-b-0">
                  <div className="w-12 h-14 bg-gray-100 rounded overflow-hidden shrink-0">
                    <img 
                      src={item.image_url || item.image || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80'} 
                      alt={item.title} 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80'; }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[#282c3f] truncate">{item.brand || item.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                      <span>Qty: {item.quantity}</span>
                      <span>• Size: {item.size || 'M'}</span>
                    </div>
                  </div>
                  <span className="text-[12px] font-bold text-[#282c3f]">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#eaeaec] bg-white rounded-sm p-4">
            <h4 className="text-[12px] font-bold text-[#535766] uppercase mb-4">Price Details ({cartItems.length} Items)</h4>
            
            <div className="flex flex-col gap-3 text-[14px] text-[#282c3f] mb-4 border-b border-[#eaeaec] pb-4">
              <div className="flex justify-between">
                <span>Total</span>
                <span>Rs. {cartTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Convenience Fee</span>
                <span className="text-[#282c3f]">Rs. {convenienceFee}</span>
              </div>
              {discountFromCart > 0 && (
                <div className="flex justify-between">
                  <span>Extra Coupon Discount</span>
                  <span className="text-[#03a685]">- Rs. {discountFromCart}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[15px] font-bold text-[#282c3f]">
              <span>Total Amount</span>
              <span>Rs. {finalTotal}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[12px] text-[#7e818c]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Safe and Secure Payments. Easy returns. 100% Authentic products.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

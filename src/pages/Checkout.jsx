import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, CreditCard, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';

const CHECKOUT_COUPON_KEY = 'myntra_checkout_coupon';
const PRODUCT_FALLBACK = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80';
const inputClass = 'w-full rounded-md border border-[#d4d5d9] p-3 text-[13px] outline-none transition focus:border-[#ff3f6c] focus:ring-1 focus:ring-[#ff3f6c]';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, cartLoading } = useCart();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressSaving, setAddressSaving] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [serverPricing, setServerPricing] = useState(null);
  const [addressData, setAddressData] = useState({
    name: user?.name || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    mobile: user?.mobile || ''
  });

  const couponCode = location.state?.couponCode
    || sessionStorage.getItem(CHECKOUT_COUPON_KEY)
    || null;
  const quoteItems = useMemo(
    () => cartItems.map((item) => ({ id: item.id, quantity: item.quantity, size: item.size })),
    [cartItems]
  );
  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
    [cartItems]
  );
  const deliveryFee = serverPricing?.shippingFee ?? 0;
  const discount = serverPricing?.discount ?? 0;
  const finalTotal = serverPricing?.total ?? cartTotal;

  const populateAddressData = useCallback((address) => {
    setAddressData({
      name: address.name || user?.name || '',
      street: address.address_line || address.street || '',
      city: address.city || '',
      state: address.state || '',
      pincode: String(address.pincode || ''),
      mobile: String(address.mobile || user?.mobile || '')
    });
  }, [user]);

  useEffect(() => {
    if (!token) {
      setAddressLoading(false);
      setShowAddressForm(true);
      return undefined;
    }

    const controller = new AbortController();
    setAddressLoading(true);
    fetch(`${API_BASE_URL}/profile/addresses`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not load addresses');
        return data;
      })
      .then((data) => {
        if (data.length) {
          const defaultAddress = data.find((address) => address.is_default) || data[0];
          setSavedAddresses(data);
          setSelectedAddressId(defaultAddress.id);
          populateAddressData(defaultAddress);
          setShowAddressForm(false);
        } else {
          setSavedAddresses([]);
          setShowAddressForm(true);
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          showToast(error.message, 'error');
          setShowAddressForm(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAddressLoading(false);
      });

    return () => controller.abort();
  }, [token, populateAddressData, showToast]);

  useEffect(() => {
    if (!token || quoteItems.length === 0) {
      setPricingLoading(false);
      setServerPricing(null);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setPricingLoading(true);
      fetch(`${API_BASE_URL}/payment/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: quoteItems, couponCode }),
        signal: controller.signal
      })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Could not calculate order total');
          return data;
        })
        .then(setServerPricing)
        .catch((error) => {
          if (error.name !== 'AbortError') showToast(error.message, 'error');
        })
        .finally(() => {
          if (!controller.signal.aborted) setPricingLoading(false);
        });
    }, 120);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [token, quoteItems, couponCode, showToast]);

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
    populateAddressData(address);
    setShowAddressForm(false);
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setAddressData({
      name: user?.name || '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      mobile: user?.mobile || ''
    });
    setShowAddressForm(true);
  };

  const validateAddress = () => {
    if (addressData.name.trim().length < 2) return 'Please enter your full name';
    if (addressData.street.trim().length < 5) return 'Please enter a complete street address';
    if (addressData.city.trim().length < 2 || addressData.state.trim().length < 2) {
      return 'Please enter a valid city and state';
    }
    if (!/^\d{6}$/.test(addressData.pincode.trim())) return 'Pincode must be exactly 6 digits';
    if (!/^\d{10,15}$/.test(addressData.mobile.replace(/\D/g, ''))) {
      return 'Mobile number must contain 10 to 15 digits';
    }
    return '';
  };

  const handleSaveAddressAndContinue = async () => {
    const validationMessage = validateAddress();
    if (validationMessage) {
      showToast(validationMessage, 'error');
      return;
    }
    if (!showAddressForm && !selectedAddressId) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    if (showAddressForm && token) {
      setAddressSaving(true);
      try {
        const response = await fetch(`${API_BASE_URL}/profile/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: addressData.name,
            mobile: addressData.mobile,
            pincode: addressData.pincode,
            address_line: addressData.street,
            city: addressData.city,
            state: addressData.state,
            is_default: savedAddresses.length === 0
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not save address');

        let createdAddress = data.address;
        if (!createdAddress) {
          const addressesResponse = await fetch(`${API_BASE_URL}/profile/addresses`);
          const addressesData = await addressesResponse.json();
          if (!addressesResponse.ok || !Array.isArray(addressesData) || !addressesData.length) {
            throw new Error('Address was saved, but could not be refreshed');
          }
          createdAddress = addressesData.find((address) => (
            address.address_line === addressData.street
            && String(address.pincode) === String(addressData.pincode)
          )) || addressesData[0];
        }
        setSavedAddresses((current) => [createdAddress, ...current]);
        setSelectedAddressId(createdAddress.id);
        setShowAddressForm(false);
        showToast('Address saved successfully! 📍', 'success');
      } catch (error) {
        console.error('Failed to save address:', error);
        showToast(error.message || 'Could not save address', 'error');
        return;
      } finally {
        setAddressSaving(false);
      }
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (paymentLoading || pricingLoading || !serverPricing) return;
    setPaymentLoading(true);
    try {
      const orderResponse = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode, items: quoteItems })
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.message || 'Could not start payment');
      setServerPricing(orderData.pricing);

      if (!window.Razorpay) throw new Error('Payment gateway failed to load. Please refresh and try again.');

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Myntra Cosmetics',
        description: `${totalItems} item${totalItems > 1 ? 's' : ''}`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const shippingAddress = `${addressData.street}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`;
            const verifyResponse = await fetch(`${API_BASE_URL}/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                shippingAddress,
                couponCode,
                items: quoteItems
              })
            });
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(verifyData.message || 'Payment verification failed');

            sessionStorage.removeItem(CHECKOUT_COUPON_KEY);
            showToast('Payment successful! Your order is confirmed 🎉', 'success');
            await clearCart();
            navigate('/');
          } catch (error) {
            console.error('Payment verification error:', error);
            showToast(error.message || 'Could not confirm payment. Please contact support.', 'error');
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => setPaymentLoading(false)
        },
        prefill: {
          name: addressData.name || user?.name || 'Customer',
          email: user?.email || '',
          contact: addressData.mobile || user?.mobile || ''
        },
        theme: { color: '#ff3f6c' }
      });

      razorpay.on('payment.failed', (response) => {
        setPaymentLoading(false);
        showToast(response.error?.description || 'Payment failed. Please try again.', 'error');
      });
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      showToast(error.message || 'Could not start checkout', 'error');
      setPaymentLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="pt-32 min-h-[60vh] max-w-[980px] mx-auto px-4" aria-live="polite">
        <div className="h-8 w-52 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid md:grid-cols-[1fr_340px] gap-6">
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-80 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <span className="sr-only">Loading checkout</span>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="pt-32 pb-20 min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-bold text-[#282c3f]">Your bag is empty</h1>
        <p className="text-sm text-[#7e818c] mt-2 mb-6">Add a product before starting checkout.</p>
        <Link to="/products" className="bg-[#ff3f6c] text-white font-bold px-8 py-3 rounded-sm">EXPLORE PRODUCTS</Link>
      </div>
    );
  }

  return (
    <main className="pt-24 pb-14 w-full max-w-[980px] mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 pb-5 border-b border-[#eaeaec]">
        <div>
          <Link to="/cart" className="inline-flex items-center gap-1 text-xs font-bold text-[#535766] hover:text-[#ff3f6c] mb-2">
            <ArrowLeft size={14} /> BACK TO BAG
          </Link>
          <h1 className="text-xl font-bold text-[#282c3f] flex items-center gap-2">
            SECURE CHECKOUT <LockKeyhole size={20} className="text-[#03a685]" />
          </h1>
        </div>
        <div className="flex items-center text-[11px] font-bold">
          <span className="text-[#03a685]">1. ADDRESS</span>
          <span className="w-10 sm:w-16 h-px bg-[#d4d5d9] mx-2" />
          <span className={step === 2 ? 'text-[#03a685]' : 'text-[#7e818c]'}>2. PAYMENT</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <section className="min-w-0">
          {step === 1 ? (
            <div className="border border-[#eaeaec] bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 bg-[#fafafa] border-b border-[#eaeaec] flex justify-between items-center">
                <h2 className="text-sm font-bold text-[#282c3f] flex items-center gap-2">
                  <MapPin size={17} /> DELIVERY ADDRESS
                </h2>
                {savedAddresses.length > 0 && (
                  <button
                    onClick={showAddressForm ? () => {
                      const selected = savedAddresses.find((address) => address.id === selectedAddressId) || savedAddresses[0];
                      handleSelectAddress(selected);
                    } : handleAddNewAddress}
                    className="text-xs font-bold text-[#ff3f6c]"
                  >
                    {showAddressForm ? 'CANCEL' : '+ ADD NEW'}
                  </button>
                )}
              </div>

              <div className="p-4 sm:p-6">
                {addressLoading ? (
                  <div className="space-y-3">
                    <div className="h-24 bg-gray-100 rounded animate-pulse" />
                    <div className="h-24 bg-gray-100 rounded animate-pulse" />
                  </div>
                ) : !showAddressForm && savedAddresses.length > 0 ? (
                  <div className="space-y-3">
                    {savedAddresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 border rounded-md cursor-pointer transition ${selectedAddressId === address.id ? 'border-[#03a685] bg-[#f2fbf8]' : 'border-[#eaeaec] hover:border-[#94969f]'}`}
                      >
                        <div className="flex gap-3">
                          <input
                            type="radio"
                            name="delivery-address"
                            checked={selectedAddressId === address.id}
                            onChange={() => handleSelectAddress(address)}
                            className="mt-1 accent-[#03a685]"
                          />
                          <div className="text-[13px] text-[#535766] leading-5">
                            <p className="font-bold text-[#282c3f]">
                              {address.name}
                              {address.is_default ? <span className="ml-2 text-[10px] bg-gray-100 px-2 py-0.5 rounded">DEFAULT</span> : null}
                            </p>
                            <p>{address.address_line}</p>
                            <p>{address.city}, {address.state} – {address.pincode}</p>
                            <p className="mt-1">Mobile: <strong>{address.mobile}</strong></p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-[#535766] mb-1">CONTACT & ADDRESS DETAILS</p>
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Full Name *"
                      value={addressData.name}
                      onChange={(event) => setAddressData({ ...addressData, name: event.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      autoComplete="street-address"
                      placeholder="House no., building and street *"
                      value={addressData.street}
                      onChange={(event) => setAddressData({ ...addressData, street: event.target.value })}
                      className={inputClass}
                    />
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        autoComplete="address-level2"
                        placeholder="City *"
                        value={addressData.city}
                        onChange={(event) => setAddressData({ ...addressData, city: event.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        autoComplete="address-level1"
                        placeholder="State *"
                        value={addressData.state}
                        onChange={(event) => setAddressData({ ...addressData, state: event.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        maxLength={6}
                        placeholder="6-digit Pincode *"
                        value={addressData.pincode}
                        onChange={(event) => setAddressData({ ...addressData, pincode: event.target.value.replace(/\D/g, '') })}
                        className={inputClass}
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={15}
                        placeholder="Mobile Number *"
                        value={addressData.mobile}
                        onChange={(event) => setAddressData({ ...addressData, mobile: event.target.value.replace(/\D/g, '') })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSaveAddressAndContinue}
                  disabled={addressLoading || addressSaving}
                  className="w-full bg-[#ff3f6c] text-white font-bold py-3.5 text-sm rounded-md mt-5 hover:bg-[#e11b4c] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {addressSaving ? 'SAVING ADDRESS…' : showAddressForm ? 'SAVE & CONTINUE' : 'DELIVER TO THIS ADDRESS'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-[#03a685] bg-[#f2fbf8] rounded-lg p-4 flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#03a685] text-white flex items-center justify-center shrink-0">
                    <Check size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#282c3f]">Delivering to {addressData.name}</p>
                    <p className="text-xs text-[#535766] mt-1">{addressData.street}, {addressData.city} – {addressData.pincode}</p>
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="text-xs font-bold text-[#ff3f6c]">CHANGE</button>
              </div>

              <div className="border border-[#eaeaec] bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 bg-[#fafafa] border-b border-[#eaeaec]">
                  <h2 className="text-sm font-bold text-[#282c3f] flex items-center gap-2">
                    <CreditCard size={17} /> PAYMENT
                  </h2>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="border-2 border-[#ff3f6c] rounded-lg p-4 bg-[#fff8fa]">
                    <div className="flex items-start gap-3">
                      <input type="radio" checked readOnly className="mt-1 accent-[#ff3f6c]" />
                      <div>
                        <p className="text-sm font-bold text-[#282c3f]">Pay securely with Razorpay</p>
                        <p className="text-xs text-[#535766] mt-1 leading-5">UPI, credit/debit cards, wallets and net banking are available inside the secure payment window.</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {['UPI', 'Cards', 'Wallets', 'Net Banking'].map((method) => (
                            <span key={method} className="bg-white border border-[#eaeaec] rounded px-2 py-1 text-[10px] font-bold text-[#535766]">{method}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={paymentLoading || pricingLoading || !serverPricing}
                    className="w-full bg-[#ff3f6c] text-white font-bold py-3.5 text-sm rounded-md mt-5 hover:bg-[#e11b4c] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <LockKeyhole size={17} />
                    {paymentLoading ? 'PAYMENT WINDOW OPEN…' : pricingLoading ? 'VERIFYING PRICE…' : `PAY SECURELY ₹${finalTotal}`}
                  </button>
                  <p className="text-center text-[11px] text-[#7e818c] mt-3">You will review the amount again before completing payment.</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4 md:sticky md:top-24">
          <div className="border border-[#eaeaec] bg-white rounded-lg p-4">
            <h3 className="text-xs font-bold text-[#535766] uppercase mb-3">Order Items ({totalItems})</h3>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.cart_item_id || `${item.id}-${item.size}`} className="flex gap-3 items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="w-12 h-14 bg-[#f8f8f8] rounded overflow-hidden shrink-0">
                    <img
                      src={item.image_url || item.image || PRODUCT_FALLBACK}
                      alt={item.title}
                      onError={(event) => { event.currentTarget.src = PRODUCT_FALLBACK; }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#282c3f] truncate">{item.brand || item.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{item.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Qty {item.quantity} • {item.size || 'One Size'}</p>
                  </div>
                  <span className="text-xs font-bold text-[#282c3f]">₹{Number(item.price) * Number(item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#eaeaec] bg-white rounded-lg p-4" aria-live="polite">
            <h3 className="text-xs font-bold text-[#535766] uppercase mb-4">Price Details</h3>
            <div className="space-y-3 text-sm text-[#282c3f] border-b border-[#eaeaec] pb-4">
              <div className="flex justify-between"><span>Bag subtotal</span><span>₹{serverPricing?.subtotal ?? cartTotal}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-[#03a685]"><span>Coupon discount</span><span>− ₹{discount}</span></div>
              )}
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span className={deliveryFee === 0 ? 'text-[#03a685]' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[15px] font-bold text-[#282c3f] pt-4">
              <span>Total Amount</span>
              <span>{pricingLoading ? 'Updating…' : `₹${finalTotal}`}</span>
            </div>
            {couponCode && <p className="text-[11px] text-[#03a685] font-bold mt-3">{couponCode} applied</p>}
          </div>

          <div className="flex items-start gap-2 text-xs text-[#7e818c] px-1">
            <ShieldCheck size={18} className="text-[#03a685] shrink-0" />
            <span>100% authentic products, secure payment and easy returns.</span>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;

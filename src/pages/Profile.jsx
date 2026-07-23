import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';

const Profile = () => {
  const { user, token, logout, login } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: user?.name || '', 
    mobile: user?.mobile || '', 
    pincode: '', 
    address_line: '', 
    city: '', 
    state: '', 
    is_default: false
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'orders') {
          const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setOrders(Array.isArray(data) ? data : []);
          }
        } else if (activeTab === 'addresses') {
          fetchAddresses();
        }
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, navigate, activeTab]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/profile/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });
      if (response.ok) {
        showToast('Address added successfully! 📍', 'success');
        setShowAddAddress(false);
        setNewAddress({ name: user?.name || '', mobile: user?.mobile || '', pincode: '', address_line: '', city: '', state: '', is_default: false });
        fetchAddresses();
      } else {
        showToast('Failed to add address', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Error adding address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        showToast('Address removed', 'success');
        fetchAddresses();
      }
    } catch (error) {
      console.error(error);
      showToast('Error removing address', 'error');
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, name: profileData.name, mobile: profileData.mobile };
    login(updatedUser, token);
    setIsEditingProfile(false);
    showToast('Profile updated successfully! ✨', 'success');
  };

  if (!user) return null;

  return (
    <div className="pt-24 pb-12 w-full max-w-[1050px] mx-auto px-4 min-h-[70vh]">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-[250px] flex flex-col border border-[#eaeaec] bg-white h-fit shadow-xs rounded-sm">
          <div className="p-4 border-b border-[#eaeaec] bg-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#ff3f6c] text-white rounded-full flex justify-center items-center font-black text-[20px]">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-[#535766] font-semibold">Hello,</p>
              <p className="text-[14px] font-bold text-[#282c3f] truncate">{user.name}</p>
            </div>
          </div>

          <div className="flex flex-col p-2">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`text-left px-4 py-3 text-[14px] font-bold rounded-sm transition-all ${activeTab === 'overview' ? 'text-[#ff3f6c] bg-[#ff3f6c]/5 border-l-4 border-[#ff3f6c]' : 'text-[#535766] hover:text-[#ff3f6c]'}`}
            >
              Overview
            </button>
            <div className="h-[1px] w-full bg-[#eaeaec] my-2" />
            
            <p className="px-4 py-1 text-[11px] font-bold text-[#7e818c] uppercase tracking-wider">Orders</p>
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`text-left px-4 py-2.5 text-[14px] rounded-sm transition-all ${activeTab === 'orders' ? 'text-[#ff3f6c] font-bold border-l-4 border-[#ff3f6c]' : 'text-[#282c3f] hover:text-[#ff3f6c]'}`}
            >
              Orders & Returns
            </button>
            <div className="h-[1px] w-full bg-[#eaeaec] my-2" />
            
            <p className="px-4 py-1 text-[11px] font-bold text-[#7e818c] uppercase tracking-wider">Account</p>
            <button 
              onClick={() => setActiveTab('addresses')} 
              className={`text-left px-4 py-2.5 text-[14px] rounded-sm transition-all ${activeTab === 'addresses' ? 'text-[#ff3f6c] font-bold border-l-4 border-[#ff3f6c]' : 'text-[#282c3f] hover:text-[#ff3f6c]'}`}
            >
              Saved Addresses
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')} 
              className={`text-left px-4 py-2.5 text-[14px] rounded-sm transition-all ${activeTab === 'wishlist' ? 'text-[#ff3f6c] font-bold border-l-4 border-[#ff3f6c]' : 'text-[#282c3f] hover:text-[#ff3f6c]'}`}
            >
              My Wishlist ({wishlistItems.length})
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          {activeTab === 'overview' && (
            <>
              <div className="border border-[#eaeaec] p-6 bg-white flex justify-between items-center rounded-sm">
                <div>
                  <h2 className="text-[18px] font-bold text-[#282c3f]">Profile Details</h2>
                  <p className="text-[13px] text-[#535766] mt-1">Manage your account & personal details</p>
                </div>
                <button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)} 
                  className="text-[13px] font-bold text-[#ff3f6c] border border-[#ff3f6c] px-4 py-1.5 rounded hover:bg-[#ff3f6c] hover:text-white transition-all"
                >
                  {isEditingProfile ? 'CANCEL' : 'EDIT PROFILE'}
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="border border-[#eaeaec] p-6 bg-white flex flex-col gap-4 rounded-sm">
                  <div>
                    <label className="text-[12px] font-bold text-gray-500 mb-1 block">Full Name</label>
                    <input 
                      type="text" 
                      value={profileData.name} 
                      onChange={e => setProfileData({...profileData, name: e.target.value})} 
                      className="w-full border border-[#d4d5d9] p-3 text-[14px] rounded outline-none focus:border-[#282c3f]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-500 mb-1 block">Mobile Number</label>
                    <input 
                      type="tel" 
                      value={profileData.mobile} 
                      onChange={e => setProfileData({...profileData, mobile: e.target.value})} 
                      className="w-full border border-[#d4d5d9] p-3 text-[14px] rounded outline-none focus:border-[#282c3f]"
                      required
                    />
                  </div>
                  <button type="submit" className="bg-[#ff3f6c] text-white font-bold py-3 rounded text-[14px] hover:bg-[#e11b4c] transition-colors">
                    SAVE CHANGES
                  </button>
                </form>
              ) : (
                <div className="border border-[#eaeaec] p-6 bg-white flex flex-col gap-4 rounded-sm">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#eaeaec]">
                    <span className="text-[14px] text-[#535766]">Full Name</span>
                    <span className="text-[14px] text-[#282c3f] font-bold">{user.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#eaeaec]">
                    <span className="text-[14px] text-[#535766]">Mobile Number</span>
                    <span className="text-[14px] text-[#282c3f]">{user.mobile || 'Not provided'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#eaeaec]">
                    <span className="text-[14px] text-[#535766]">Email ID</span>
                    <span className="text-[14px] text-[#282c3f]">{user.email || 'Not provided'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#eaeaec]">
                    <span className="text-[14px] text-[#535766]">Account Role</span>
                    <span className="text-[14px] text-[#03a685] font-bold uppercase">{user.role}</span>
                  </div>
                </div>
              )}
              
              <button 
                onClick={handleLogout} 
                className="border border-[#ff3f6c] text-[#ff3f6c] px-8 py-3 w-fit text-[14px] font-bold rounded-sm mt-2 hover:bg-[#ff3f6c] hover:text-white transition-all"
              >
                LOGOUT
              </button>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-[#282c3f] mb-2">My Orders</h2>
              {loading ? (
                <p className="text-gray-500 font-bold py-8 text-center">Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="border border-[#eaeaec] p-12 text-center bg-white flex flex-col items-center justify-center rounded-sm">
                  <p className="text-[16px] text-[#535766] mb-4 font-semibold">You haven't placed any orders yet.</p>
                  <Link to="/products" className="bg-[#ff3f6c] text-white px-8 py-3 rounded-sm font-bold text-[14px] hover:bg-[#e11b4c] transition-colors">
                    START SHOPPING
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border border-[#eaeaec] bg-white p-5 flex flex-col gap-3 rounded-sm shadow-xs">
                    <div className="flex justify-between items-center border-b border-[#eaeaec] pb-3">
                      <div>
                        <span className="text-[14px] font-bold text-[#282c3f]">Order ID: #{order.id}</span>
                        <p className="text-[11px] text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <span className="text-[12px] bg-emerald-50 text-[#03a685] border border-emerald-200 px-3 py-1 rounded font-bold">{order.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] text-[#535766]">
                      <span>Items Count: <strong className="text-[#282c3f]">{order.total_items || 1}</strong></span>
                      <span className="text-[16px] font-black text-[#282c3f]">₹{order.total_amount}</span>
                    </div>
                    <div className="text-[12px] text-gray-500 pt-2 border-t border-gray-100">
                      Shipped to: <span className="font-semibold text-gray-700">{order.shipping_address}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-[18px] font-bold text-[#282c3f]">Saved Addresses</h2>
                <button 
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="text-[13px] font-bold text-[#ff3f6c] border border-[#ff3f6c] px-4 py-2 rounded-sm hover:bg-[#ff3f6c] hover:text-white transition-colors"
                >
                  {showAddAddress ? 'CANCEL' : '+ ADD NEW ADDRESS'}
                </button>
              </div>

              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="border border-[#eaeaec] bg-white p-6 flex flex-col gap-4 rounded-sm shadow-xs">
                  <h3 className="text-[13px] font-bold text-[#282c3f] uppercase tracking-wider">Contact Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Name *" required value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} className="border border-[#d4d5d9] p-3 text-[13px] rounded outline-none focus:border-[#282c3f]" />
                    <input type="tel" placeholder="Mobile No *" required value={newAddress.mobile} onChange={e => setNewAddress({...newAddress, mobile: e.target.value})} className="border border-[#d4d5d9] p-3 text-[13px] rounded outline-none focus:border-[#282c3f]" />
                  </div>
                  <h3 className="text-[13px] font-bold text-[#282c3f] uppercase tracking-wider mt-2">Address Details</h3>
                  <input type="text" placeholder="Pincode *" required value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="border border-[#d4d5d9] p-3 text-[13px] rounded outline-none focus:border-[#282c3f] w-1/2" />
                  <input type="text" placeholder="Address (House No, Building, Street, Area) *" required value={newAddress.address_line} onChange={e => setNewAddress({...newAddress, address_line: e.target.value})} className="border border-[#d4d5d9] p-3 text-[13px] rounded outline-none focus:border-[#282c3f]" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="City *" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="border border-[#d4d5d9] p-3 text-[13px] rounded outline-none focus:border-[#282c3f]" />
                    <input type="text" placeholder="State *" required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="border border-[#d4d5d9] p-3 text-[13px] rounded outline-none focus:border-[#282c3f]" />
                  </div>
                  <label className="flex items-center gap-2 mt-2 text-[13px] text-[#282c3f]">
                    <input type="checkbox" checked={newAddress.is_default} onChange={e => setNewAddress({...newAddress, is_default: e.target.checked})} className="w-4 h-4 accent-[#ff3f6c]" />
                    Make this my default address
                  </label>
                  <button type="submit" className="bg-[#ff3f6c] text-white font-bold py-3 w-full rounded mt-2 hover:bg-[#e11b4c] transition-colors">SAVE ADDRESS</button>
                </form>
              )}

              {loading ? (
                <p className="text-gray-500 font-bold py-8 text-center">Loading addresses...</p>
              ) : addresses.length === 0 && !showAddAddress ? (
                <div className="border border-[#eaeaec] p-8 text-center bg-white flex flex-col items-center justify-center rounded-sm">
                  <p className="text-[15px] text-[#535766] mb-4">No saved addresses found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-[#eaeaec] bg-white p-5 relative shadow-xs rounded-sm flex flex-col justify-between">
                      <div>
                        {address.is_default && <span className="absolute top-4 right-4 bg-gray-100 text-[#535766] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">Default</span>}
                        <p className="text-[14px] font-bold text-[#282c3f] mb-2">{address.name}</p>
                        <p className="text-[13px] text-[#535766]">{address.address_line}</p>
                        <p className="text-[13px] text-[#535766]">{address.city}, {address.state} - {address.pincode}</p>
                        <p className="text-[13px] text-[#535766] mt-2">Mobile: <span className="font-bold">{address.mobile}</span></p>
                      </div>
                      <div className="flex gap-4 mt-4 pt-3 border-t border-[#eaeaec]">
                        <button onClick={() => handleDeleteAddress(address.id)} className="text-[12px] font-bold text-[#ff3f6c] hover:underline uppercase">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-[#282c3f] mb-2">My Wishlist ({wishlistItems.length})</h2>
              {wishlistItems.length === 0 ? (
                <div className="border border-[#eaeaec] p-12 text-center bg-white flex flex-col items-center justify-center rounded-sm">
                  <p className="text-[15px] text-[#535766] mb-4">Your wishlist is currently empty.</p>
                  <Link to="/products" className="bg-[#ff3f6c] text-white px-6 py-2.5 rounded font-bold text-[13px]">EXPLORE PRODUCTS</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="border border-[#eaeaec] bg-white p-3 flex flex-col gap-2 rounded-sm group relative">
                      <Link to={`/product/${item.id}`} className="block overflow-hidden h-40 bg-gray-100 rounded">
                        <img src={item.image_url || item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </Link>
                      <h4 className="text-[13px] font-bold text-[#282c3f] truncate mt-1">{item.brand}</h4>
                      <p className="text-[12px] text-gray-500 truncate">{item.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[13px] font-bold text-[#282c3f]">₹{item.price}</span>
                        <button onClick={() => removeFromWishlist(item.id)} className="text-red-500 text-[11px] font-bold hover:underline">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;

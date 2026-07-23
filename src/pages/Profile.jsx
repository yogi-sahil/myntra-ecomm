import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const Profile = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '', mobile: '', pincode: '', address_line: '', city: '', state: '', is_default: false
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
            setOrders(data);
          }
        } else if (activeTab === 'addresses') {
          fetchAddresses();
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
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
        setAddresses(data);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const handleLogout = () => {
    logout();
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
        setShowAddAddress(false);
        setNewAddress({ name: '', mobile: '', pincode: '', address_line: '', city: '', state: '', is_default: false });
        fetchAddresses();
      } else {
        alert('Failed to add address');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="pt-24 pb-12 w-full max-w-[1000px] mx-auto px-4 min-h-[70vh]">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-[250px] flex flex-col border border-[#eaeaec] bg-white h-fit">
          <div className="p-4 border-b border-[#eaeaec] bg-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#282c3f] text-white rounded-sm flex justify-center items-center font-bold text-[18px]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[12px] text-[#535766]">Hello,</p>
              <p className="text-[14px] font-bold text-[#282c3f] truncate w-[120px]">{user.name}</p>
            </div>
          </div>

          <div className="flex flex-col p-2">
            <button onClick={() => setActiveTab('overview')} className={`text-left px-4 py-3 text-[14px] font-bold ${activeTab === 'overview' ? 'text-[#282c3f] bg-gray-100 border-l-4 border-[#ff3f6c]' : 'text-[#535766] hover:text-[#ff3f6c] transition-all'}`}>Overview</button>
            <div className="h-[1px] w-full bg-[#eaeaec] my-2"></div>
            
            <p className="px-4 py-2 text-[12px] font-bold text-[#535766] uppercase">Orders</p>
            <button onClick={() => setActiveTab('orders')} className={`text-left px-4 py-2 text-[14px] transition-all ${activeTab === 'orders' ? 'text-[#ff3f6c] font-bold border-l-4 border-[#ff3f6c]' : 'text-[#282c3f] hover:text-[#ff3f6c]'}`}>Orders & Returns</button>
            <div className="h-[1px] w-full bg-[#eaeaec] my-2"></div>
            
            <p className="px-4 py-2 text-[12px] font-bold text-[#535766] uppercase">Account</p>
            <button onClick={() => setActiveTab('addresses')} className={`text-left px-4 py-2 text-[14px] transition-all ${activeTab === 'addresses' ? 'text-[#ff3f6c] font-bold border-l-4 border-[#ff3f6c]' : 'text-[#282c3f] hover:text-[#ff3f6c]'}`}>Saved Addresses</button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          {activeTab === 'overview' && (
            <>
              <div className="border border-[#eaeaec] p-6 bg-white flex justify-between items-center">
                <div>
                  <h2 className="text-[18px] font-bold text-[#282c3f]">Profile Details</h2>
                  <p className="text-[14px] text-[#535766] mt-2">Manage your personal details</p>
                </div>
              </div>

              {/* Profile Info Card */}
              <div className="border border-[#eaeaec] p-6 bg-white flex flex-col gap-4">
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
                  <span className="text-[14px] text-[#535766]">Role</span>
                  <span className="text-[14px] text-[#282c3f] uppercase">{user.role}</span>
                </div>
              </div>
              
              <button onClick={handleLogout} className="border border-[#ff3f6c] text-[#ff3f6c] px-6 py-3 w-fit text-[14px] font-bold rounded-sm mx-auto mt-4 hover:bg-[#ff3f6c] hover:text-white transition-all">
                LOGOUT
              </button>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[18px] font-bold text-[#282c3f] mb-2">My Orders</h2>
              {loading ? (
                <p>Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="border border-[#eaeaec] p-8 text-center bg-white flex flex-col items-center justify-center">
                  <p className="text-[16px] text-[#535766] mb-4">You haven't placed any orders yet.</p>
                  <Link to="/products" className="bg-[#ff3f6c] text-white px-6 py-2 rounded-sm font-bold">START SHOPPING</Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border border-[#eaeaec] bg-white p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-[#eaeaec] pb-3">
                      <span className="text-[14px] font-bold text-[#282c3f]">Order ID: #{order.id}</span>
                      <span className="text-[12px] bg-gray-100 px-2 py-1 rounded-sm font-bold text-[#03a685]">{order.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] text-[#535766]">
                      <span>Date: {new Date(order.created_at).toLocaleDateString()}</span>
                      <span>Total Items: {order.total_items}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[14px] text-[#535766] truncate w-[200px]">Shipped to: {order.shipping_address}</span>
                      <span className="text-[16px] font-bold text-[#282c3f]">₹{order.total_amount}</span>
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
                  className="text-[14px] font-bold text-[#ff3f6c] border border-[#ff3f6c] px-4 py-2 rounded-sm hover:bg-[#ff3f6c] hover:text-white transition-colors"
                >
                  {showAddAddress ? 'CANCEL' : '+ ADD NEW ADDRESS'}
                </button>
              </div>

              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="border border-[#eaeaec] bg-white p-6 flex flex-col gap-4">
                  <h3 className="text-[14px] font-bold text-[#282c3f] uppercase mb-2">Contact Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Name" required value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} className="border border-[#d4d5d9] p-3 text-[14px] rounded-sm outline-none focus:border-[#282c3f]" />
                    <input type="tel" placeholder="Mobile No" required value={newAddress.mobile} onChange={e => setNewAddress({...newAddress, mobile: e.target.value})} className="border border-[#d4d5d9] p-3 text-[14px] rounded-sm outline-none focus:border-[#282c3f]" />
                  </div>
                  <h3 className="text-[14px] font-bold text-[#282c3f] uppercase mt-2 mb-2">Address</h3>
                  <input type="text" placeholder="Pincode" required value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="border border-[#d4d5d9] p-3 text-[14px] rounded-sm outline-none focus:border-[#282c3f] w-1/2" />
                  <input type="text" placeholder="Address (House No, Building, Street, Area)" required value={newAddress.address_line} onChange={e => setNewAddress({...newAddress, address_line: e.target.value})} className="border border-[#d4d5d9] p-3 text-[14px] rounded-sm outline-none focus:border-[#282c3f]" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Locality / Town" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="border border-[#d4d5d9] p-3 text-[14px] rounded-sm outline-none focus:border-[#282c3f]" />
                    <input type="text" placeholder="State" required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="border border-[#d4d5d9] p-3 text-[14px] rounded-sm outline-none focus:border-[#282c3f]" />
                  </div>
                  <label className="flex items-center gap-2 mt-2 text-[14px] text-[#282c3f]">
                    <input type="checkbox" checked={newAddress.is_default} onChange={e => setNewAddress({...newAddress, is_default: e.target.checked})} className="w-4 h-4 accent-[#ff3f6c]" />
                    Make this my default address
                  </label>
                  <button type="submit" className="bg-[#ff3f6c] text-white font-bold py-3 w-full rounded-sm mt-4 hover:bg-[#e11b4c] transition-colors">ADD ADDRESS</button>
                </form>
              )}

              {loading ? (
                <p>Loading addresses...</p>
              ) : addresses.length === 0 && !showAddAddress ? (
                <div className="border border-[#eaeaec] p-8 text-center bg-white flex flex-col items-center justify-center">
                  <p className="text-[16px] text-[#535766] mb-4">No saved addresses found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-[#eaeaec] bg-white p-4 relative shadow-sm rounded-sm">
                      {address.is_default && <span className="absolute top-4 right-4 bg-gray-100 text-[#535766] text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">Default</span>}
                      <p className="text-[14px] font-bold text-[#282c3f] mb-2">{address.name}</p>
                      <p className="text-[14px] text-[#535766]">{address.address_line}</p>
                      <p className="text-[14px] text-[#535766]">{address.city}, {address.state} - {address.pincode}</p>
                      <p className="text-[14px] text-[#535766] mt-2">Mobile: <span className="font-bold">{address.mobile}</span></p>
                      
                      <div className="flex gap-4 mt-4 pt-4 border-t border-[#eaeaec]">
                        <button onClick={() => handleDeleteAddress(address.id)} className="text-[14px] font-bold text-[#ff3f6c] hover:underline uppercase">Remove</button>
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

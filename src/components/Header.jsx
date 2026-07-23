import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const executeSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  // Mega Menu Data
  const menCategories = [
    { title: 'Topwear', items: ['T-shirts', 'Casual Shirts', 'Formal Shirts', 'Sweatshirts', 'Sweaters', 'Jackets', 'Blazers & Coats'] },
    { title: 'Indian & Festive Wear', items: ['Kurtas & Kurta Sets', 'Sherwanis', 'Nehru Jackets', 'Dhotis'] },
    { title: 'Bottomwear', items: ['Jeans', 'Casual Trousers', 'Formal Trousers', 'Shorts', 'Track Pants & Joggers'] },
    { title: 'Footwear', items: ['Casual Shoes', 'Sports Shoes', 'Formal Shoes', 'Sneakers', 'Sandals', 'Flip Flops'] }
  ];

  const womenCategories = [
    { title: 'Indian & Fusion Wear', items: ['Kurtas & Suits', 'Kurtis & Tops', 'Sarees', 'Ethnic Wear', 'Skirts & Palazzos', 'Lehenga Cholis'] },
    { title: 'Western Wear', items: ['Dresses', 'Tops', 'Tshirts', 'Jeans', 'Trousers', 'Shorts & Skirts', 'Jumpsuits'] },
    { title: 'Footwear', items: ['Flats', 'Casual Shoes', 'Heels', 'Boots', 'Sports Shoes'] }
  ];

  const beautyCategories = [
    { title: 'Makeup & Cosmetics', items: ['Strobe Cream', 'Highlighter', 'Makeup Kits', 'Mascara', 'Foundation', 'Lipsticks', 'Makeup Fixer'] },
    { title: 'Fragrances & Perfumes', items: ['Women Perfumes', 'Men Perfumes', 'Fragrances'] },
    { title: 'Skincare & Grooming', items: ['Skincare', 'Grooming'] }
  ];

  const watchesCategories = [
    { title: 'Watches Collection', items: ['Watches', 'Smartwatches'] },
    { title: 'Top Brands', items: ['Fossil', 'Casio', 'Apple', 'Puma'] }
  ];

  const MegaMenu = ({ categories }) => (
    <div className="absolute top-[80px] left-0 w-full bg-white shadow-xl border-t border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
      <div className="max-w-[1200px] mx-auto flex justify-start gap-12 p-8 min-h-[300px]">
        {categories.map((col, idx) => (
          <div key={idx} className="flex flex-col w-[200px]">
            <span className="text-[#ee5f73] font-bold text-[14px] mb-4">{col.title}</span>
            <ul className="flex flex-col gap-2">
              {col.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <Link to={`/products?category=${encodeURIComponent(item)}`} className="text-[#282c3f] text-[13px] hover:font-bold hover:text-[#ff3f6c] transition">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-20 w-full">
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between px-4 sm:px-6 relative">
          
          {/* Left: Mobile Menu Toggle & Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#282c3f] hover:text-[#ff3f6c] lg:hidden rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle mobile menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="https://raw.githubusercontent.com/ZeroOctave/ZeroOctave-Javascript-Projects/main/assets/Images/myntraclone/logo.png" 
                alt="Myntra Logo" 
                className="h-8 sm:h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex h-full">
            <ul className="flex items-center h-full font-bold text-[13px] uppercase text-[#282c3f] tracking-[0.5px]">
              <li className="group cursor-pointer h-full px-4 flex items-center hover:border-b-4 hover:border-[#ee5f73] transition-colors">
                <Link to="/products?category=Men%20T-Shirts">Men</Link>
                <MegaMenu categories={menCategories} />
              </li>
              
              <li className="group cursor-pointer h-full px-4 flex items-center hover:border-b-4 hover:border-[#fb56c1] transition-colors">
                <Link to="/products?category=Women%20Sarees">Women</Link>
                <MegaMenu categories={womenCategories} />
              </li>
              
              <li className="group cursor-pointer h-full px-4 flex items-center hover:border-b-4 hover:border-[#f26a10] transition-colors">
                <Link to="/products?category=Kids%20Clothing">Kids</Link>
                <MegaMenu categories={kidsCategories} />
              </li>
              
              <li className="group cursor-pointer h-full px-4 flex items-center hover:border-b-4 hover:border-[#f2c210] transition-colors">
                <Link to="/products?category=Watches">Watches</Link>
                <MegaMenu categories={watchesCategories} />
              </li>
              
              <li className="group cursor-pointer h-full px-4 flex items-center hover:border-b-4 hover:border-[#0db7af] transition-colors">
                <Link to="/products?category=Makeup">Beauty</Link>
                <MegaMenu categories={beautyCategories} />
              </li>

              <li className="group cursor-pointer h-full px-4 flex items-center hover:border-b-4 hover:border-[#ff3f6c] transition-colors relative">
                <Link to="/products">Studio</Link>
                <span className="absolute top-[22px] right-[-8px] text-[#ff3f6c] text-[9px] uppercase font-black">New</span>
              </li>
            </ul>
          </nav>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-[450px] mx-4 hidden md:block">
            <div className="relative bg-[#f5f5f6] rounded-md flex items-center h-10 px-3 border border-transparent focus-within:border-[#ff3f6c] focus-within:bg-white transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search for products, brands and more"
                className="bg-transparent w-full outline-none text-[13px] text-[#282c3f] placeholder-gray-500 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          {/* Right Actions Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-1.5 text-[#282c3f] md:hidden hover:text-[#ff3f6c] transition"
              aria-label="Toggle search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            <div className="flex flex-col items-center cursor-pointer group relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#282c3f] group-hover:text-[#ff3f6c] transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[11px] sm:text-[12px] font-bold mt-0.5 text-[#282c3f] hidden sm:block">{user ? 'Profile' : 'Login'}</span>
              
              <div className="absolute top-[100%] right-0 w-64 bg-white shadow-xl rounded-lg border border-gray-100 hidden group-hover:block p-4 z-50">
                {user ? (
                  <>
                    <div className="mb-3">
                      <p className="font-black text-[14px] text-[#282c3f]">Hello {user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    <hr className="mb-3" />
                    <div className="flex flex-col gap-2">
                      <Link to="/profile" className="text-[13px] text-gray-700 hover:text-[#ff3f6c] font-bold">My Orders</Link>
                      <Link to="/wishlist" className="text-[13px] text-gray-700 hover:text-[#ff3f6c] font-bold">My Wishlist</Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="text-[13px] text-[#ff3f6c] font-black">Admin Panel</Link>
                      )}
                      <button onClick={handleLogout} className="text-[13px] text-red-600 font-bold text-left mt-2 hover:underline">Log Out</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3">
                      <h3 className="font-bold text-[14px] text-[#282c3f]">Welcome</h3>
                      <p className="text-[11px] text-gray-500">To access account and manage orders</p>
                    </div>
                    <Link to="/login" className="block text-center border border-[#ff3f6c] py-2 text-[13px] font-bold text-[#ff3f6c] rounded-md hover:bg-[#ff3f6c] hover:text-white transition">
                      LOGIN / SIGNUP
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="flex flex-col items-center cursor-pointer relative hover:text-[#ff3f6c] transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#282c3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-[11px] sm:text-[12px] font-bold mt-0.5 text-[#282c3f] hidden sm:block">Wishlist</span>
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ff3f6c] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Bag / Cart */}
            <Link to="/cart" className="flex flex-col items-center cursor-pointer relative hover:text-[#ff3f6c] transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#282c3f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-[11px] sm:text-[12px] font-bold mt-0.5 text-[#282c3f] hidden sm:block">Bag</span>
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ff3f6c] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Expandable Mobile Search Bar */}
        {isMobileSearchOpen && (
          <div className="md:hidden border-t border-gray-100 bg-gray-50 p-3 animate-in slide-in-from-top">
            <div className="flex items-center bg-white rounded-lg border border-gray-300 px-3 py-2">
              <input
                type="text"
                placeholder="Search products, categories..."
                className="w-full text-xs font-semibold outline-none text-[#282c3f]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                autoFocus
              />
              <button onClick={executeSearch} className="text-xs font-bold text-[#ff3f6c] ml-2">Search</button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Sidebar Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white shadow-2xl flex flex-col z-50">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 bg-[#282c3f] text-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#ff3f6c] flex items-center justify-center font-black text-sm">
                  {user ? user.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <div>
                  <p className="font-bold text-sm">{user ? user.name : 'Welcome Guest'}</p>
                  <p className="text-[11px] text-gray-300">{user ? user.email : 'Explore fashion deals'}</p>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-300 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[#282c3f]">
              <div className="space-y-1 border-b border-gray-100 pb-3">
                <p className="text-[11px] font-black text-[#ff3f6c] uppercase tracking-wider mb-2">Shop Categories</p>
                <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-bold hover:text-[#ff3f6c]">👕 Men Collection</Link>
                <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-bold hover:text-[#ff3f6c]">👗 Women Collection</Link>
                <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-bold hover:text-[#ff3f6c]">🧒 Kids Fashion</Link>
                <Link to="/products?category=Watches" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-bold hover:text-[#ff3f6c]">⌚ Watches & Smartwatches</Link>
                <Link to="/products?category=Sneakers" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-bold hover:text-[#ff3f6c]">👟 Sneakers & Footwear</Link>
                <Link to="/products?category=Beauty" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-bold hover:text-[#ff3f6c]">💄 Beauty & Makeup</Link>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">My Account</p>
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">📦 My Orders</Link>
                    <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">❤️ Wishlist ({wishlistItems.length})</Link>
                    <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">🛍️ Shopping Bag ({cartItems.length})</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-sm font-black text-[#ff3f6c]">🔒 Admin Workspace</Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left py-2 text-sm font-bold text-red-600">Log Out</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-center bg-[#ff3f6c] text-white py-2.5 rounded-lg text-sm font-bold shadow-sm">
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Header;

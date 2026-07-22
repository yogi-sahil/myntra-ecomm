import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#fafbfc] pt-12 pb-8 mt-14 border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Responsive Grid Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          
          {/* Column 1 */}
          <div className="flex flex-col">
            <h4 className="text-[11px] sm:text-[12px] font-black text-[#282c3f] mb-4 uppercase tracking-wider">Online Shopping</h4>
            <ul className="text-[13px] text-[#696b79] space-y-2 font-medium">
              <li><Link to="/products?category=Men T-Shirts" className="hover:text-[#ff3f6c] transition-colors">Men</Link></li>
              <li><Link to="/products?category=Women Sarees" className="hover:text-[#ff3f6c] transition-colors">Women</Link></li>
              <li><Link to="/products?category=Kids Clothing" className="hover:text-[#ff3f6c] transition-colors">Kids</Link></li>
              <li><Link to="/products?category=Watches" className="hover:text-[#ff3f6c] transition-colors">Watches</Link></li>
              <li><Link to="/products?category=Beauty" className="hover:text-[#ff3f6c] transition-colors">Beauty</Link></li>
              <li><Link to="/products" className="hover:text-[#ff3f6c] transition-colors">Gift Cards</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col">
            <h4 className="text-[11px] sm:text-[12px] font-black text-[#282c3f] mb-4 uppercase tracking-wider">Useful Links</h4>
            <ul className="text-[13px] text-[#696b79] space-y-2 font-medium">
              <li><a href="#" className="hover:text-[#ff3f6c] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#ff3f6c] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#ff3f6c] transition-colors">Site Map</a></li>
              <li><a href="#" className="hover:text-[#ff3f6c] transition-colors">Corporate Info</a></li>
              <li><a href="#" className="hover:text-[#ff3f6c] transition-colors">Whitehat</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col">
            <h4 className="text-[11px] sm:text-[12px] font-black text-[#282c3f] mb-4 uppercase tracking-wider">Customer Policies</h4>
            <ul className="text-[13px] text-[#696b79] space-y-2 font-medium">
              <li><a href="#" className="hover:text-[#ff3f6c] transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-[#ff3f6c] transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-[#ff3f6c] transition-colors">T&C</a></li>
              <li><a href="#" className="hover:text-[#ff3f6c] transition-colors">Terms Of Use</a></li>
              <li><a href="#" className="hover:text-[#ff3f6c] transition-colors">Track Orders</a></li>
              <li><a href="#" className="hover:text-[#ff3f6c] transition-colors">Shipping Info</a></li>
            </ul>
          </div>

          {/* Column 4 - App Experience */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 flex flex-col">
            <h4 className="text-[11px] sm:text-[12px] font-black text-[#282c3f] mb-4 uppercase tracking-wider">Experience App on Mobile</h4>
            <div className="flex flex-wrap gap-3 mb-6">
              <a href="#" className="hover:opacity-90 transition">
                <img src="https://constant.myntassets.com/web/assets/img/80cc455a-92d2-4b5c-a038-7da0d92af33f1539674178924-google_play.png" alt="Google Play" className="w-[125px] h-[38px] object-contain" />
              </a>
              <a href="#" className="hover:opacity-90 transition">
                <img src="https://constant.myntassets.com/web/assets/img/bc5e11ad-0250-420a-ac71-115a57ca35d51539674178941-apple_store.png" alt="App Store" className="w-[125px] h-[38px] object-contain" />
              </a>
            </div>

            <h4 className="text-[11px] sm:text-[12px] font-black text-[#282c3f] mb-3 uppercase tracking-wider">Keep in touch</h4>
            <div className="flex gap-4 text-gray-500">
              <a href="#" className="hover:text-[#ff3f6c] transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="hover:text-[#ff3f6c] transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="hover:text-[#ff3f6c] transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

        </div>
        
        {/* Bottom Promises (Mobile Optimized Stack) */}
        <div className="flex flex-col md:flex-row justify-around items-center border-t border-gray-200 pt-6 gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src="https://constant.myntassets.com/web/assets/img/6c3306ca-1efa-4a27-8769-3b69d16948741574602902452-original.png" alt="100% Original" className="w-10 h-8 object-contain shrink-0" />
            <p className="text-[12px] sm:text-[13px] text-[#696b79]">
              <strong className="text-[#282c3f] font-bold">100% ORIGINAL</strong> guarantee for all fashion items
            </p>
          </div>
          <div className="flex items-center gap-3">
            <img src="https://constant.myntassets.com/web/assets/img/ef05d6ec-950a-4d01-bbfa-e8e5af80ffe31574602902427-30days.png" alt="Return Policy" className="w-10 h-8 object-contain shrink-0" />
            <p className="text-[12px] sm:text-[13px] text-[#696b79]">
              <strong className="text-[#282c3f] font-bold">14 Days Easy Returns</strong> & seamless exchange
            </p>
          </div>
        </div>
        
        <div className="text-center text-[11px] text-gray-400 font-semibold mt-6">
          © 2026 www.myntra.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { API_BASE_URL } from '../config';

const API_BASE = API_BASE_URL;

const categoryImageMap = {
  'Men T-Shirts': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80',
  'Casual Shirts': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80',
  'Oversized Tees': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80',
  'Women Sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80',
  'Kurta Sets': 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&q=80',
  'Ethnic Wear': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=500&q=80',
  'Dresses': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80',
  'Sneakers': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80',
  'Heels': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80',
  'Boots': 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&q=80',
  'Loafers': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&q=80',
  'Watches': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80',
  'Smartwatches': 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=500&q=80',
  'Handbags': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80',
  'Backpacks': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
  'Sunglasses': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80',
  'Jackets': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
  'Hoodies': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80',
  'Sweaters': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80',
  'Denim Jeans': 'https://images.unsplash.com/photo-1542272604-780c36856542?w=500&q=80',
  'Cargo Pants': 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500&q=80',
  'Shorts': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80',
  'Sportswear': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80',
  'Activewear': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80',
  'Fragrances': 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&q=80',
  'Grooming': 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&q=80',
  'Makeup': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&q=80',
  'Jewellery': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80',
  'Blazers': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&q=80',
  'Kids Clothing': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&q=80',
  'Wallets': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80',
  'Caps & Hats': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80',
  'Belts': 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500&q=80',
  'Travel Bags': 'https://images.unsplash.com/photo-1565026057447-b88e3f29042b?w=500&q=80',
};

const getCategoryImg = (catName) => {
  return categoryImageMap[catName] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80';
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero Banners
  const banners = [
    "https://raw.githubusercontent.com/ZeroOctave/ZeroOctave-Javascript-Projects/main/assets/Images/myntraclone/ss1.png",
    "https://raw.githubusercontent.com/ZeroOctave/ZeroOctave-Javascript-Projects/main/assets/Images/myntraclone/pic5.webp",
  ];

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/products`),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(Array.isArray(catData) ? catData.filter(c => c.status === 'Active') : []);
        }
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setTrendingProducts(Array.isArray(prodData) ? prodData : []);
        }
      } catch (err) {
        console.error('Failed to load homepage dynamic data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Filter top deals (discount >= 45%)
  const topDeals = trendingProducts.filter(p => Number(p.discount || 0) >= 45).slice(0, 8);
  // Filter new arrivals
  const newArrivals = trendingProducts.slice(0, 8);

  return (
    <main className="pt-24 pb-12 w-full max-w-[1400px] mx-auto overflow-hidden">
      {/* Hero Banner Section */}
      <section className="w-full mb-10 px-4">
        <Link to="/products" className="block overflow-hidden rounded-xl shadow-md group">
          <img 
            src={banners[0]} 
            alt="Hero Banner - Super Savings Season" 
            className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition-transform duration-300"
          />
        </Link>
      </section>

      {/* Explore 50+ Dynamic Categories Grid */}
      <section className="mb-16 px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-gray-100 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ff3f6c]/10 text-[#ff3f6c] font-black text-[11px] uppercase tracking-wider">
                50+ CATEGORIES
              </span>
              <span className="text-xs text-gray-400 font-bold">• 40-70% OFF</span>
            </div>
            <h2 className="text-2xl md:text-3xl uppercase font-black text-[#282c3f] tracking-wider mt-1">
              Shop By Category
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">Explore high fashion trends curated for your style</p>
          </div>
          <Link to="/products" className="text-xs md:text-sm font-bold text-[#ff3f6c] hover:underline flex items-center gap-1.5 shrink-0">
            View All 50+ Categories <span className="text-base">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#ff3f6c] font-bold text-lg animate-pulse">Loading 50+ fashion categories…</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {categories.slice(0, 24).map((cat, idx) => {
              const catImg = getCategoryImg(cat.name);
              // Varied discount badge for visual flair
              const discountText = idx % 3 === 0 ? '40-60% OFF' : idx % 2 === 0 ? 'UP TO 70% OFF' : 'MIN 50% OFF';

              return (
                <Link
                  key={cat.id || cat.name}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group relative flex flex-col justify-end h-56 sm:h-60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gray-900 border border-gray-100"
                >
                  {/* Background Cover Image */}
                  <img
                    src={catImg}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95 group-hover:via-black/40 transition-all duration-300" />

                  {/* Top Discount Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-[#ff3f6c] text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                      {discountText}
                    </span>
                  </div>

                  {/* Bottom Text Content */}
                  <div className="relative z-10 p-3.5 flex flex-col justify-end">
                    <h3 className="text-sm font-black text-white group-hover:text-[#ff905a] transition-colors line-clamp-1 drop-shadow-md">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-300 group-hover:text-white flex items-center gap-1 mt-0.5">
                      Explore Now <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Dynamic Deal Of The Day (50%+ OFF Deals) */}
      <section className="mb-14 px-4">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-[#ff3f6c] animate-ping" />
              <h2 className="text-xl md:text-2xl uppercase font-black text-[#282c3f] tracking-wider">
                Deals Of The Day (Min 50% OFF)
              </h2>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Handpicked discounts up to 70% OFF</p>
          </div>
          <Link to="/products?sort=price_asc" className="text-xs md:text-sm font-bold text-[#ff3f6c] hover:underline">
            See All Deals →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 font-bold">Loading deals…</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {topDeals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Secondary Promo Banner */}
      <section className="w-full mb-14 px-4">
        <Link to="/products" className="block overflow-hidden rounded-xl shadow-md group">
          <img 
            src={banners[1]} 
            alt="Promo Offer Banner" 
            className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition-transform duration-300"
          />
        </Link>
      </section>

      {/* Dynamic Trending New Arrivals */}
      <section className="mb-12 px-4">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl uppercase font-black text-[#282c3f] tracking-wider">
              Trending New Arrivals
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Latest fashion styles updated daily</p>
          </div>
          <Link to="/products" className="text-xs md:text-sm font-bold text-[#ff3f6c] hover:underline">
            View Full Collection →
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 font-bold">Loading trending products…</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { CategoryCircleSkeleton, ProductGridSkeleton } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';
import { MobileHomeHeader } from '../components/MobileHeader';
import MobileBottomNav from '../components/MobileBottomNav';

const CATEGORY_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&q=80';

const HERO_SLIDES = [
  {
    id: 1,
    eyebrow: 'BEAUTY BONANZA',
    title: 'The Beauty Edit',
    line: 'TRENDING MAKEUP',
    offer: '40–80% OFF',
    note: 'Bestselling colour cosmetics under ₹499',
    cta: 'SHOP MAKEUP',
    category: 'Lip Makeup',
    gradient: 'from-[#ffd6de] via-[#f9a6bb] to-[#ef718f]',
    text: 'text-[#5b1630]',
  },
  {
    id: 2,
    eyebrow: 'SKINCARE SPOTLIGHT',
    title: 'Glow Starts Here',
    line: 'SERUMS & SPF',
    offer: 'MIN. 20% OFF',
    note: 'Minimalist, Plum, Lakme and more',
    cta: 'EXPLORE SKINCARE',
    category: 'Serums & Treatments',
    gradient: 'from-[#d9f1e6] via-[#a9ddc9] to-[#74c2a4]',
    text: 'text-[#123f35]',
  },
  {
    id: 3,
    eyebrow: 'GROOMING FEST',
    title: 'Fresh All Day',
    line: 'MEN’S ESSENTIALS',
    offer: 'UP TO 50% OFF',
    note: 'Face care, fragrance and daily grooming',
    cta: 'SHOP MEN',
    category: "Men's Grooming",
    gradient: 'from-[#dbe8f7] via-[#9fc1e7] to-[#739dd0]',
    text: 'text-[#17345a]',
  },
  {
    id: 4,
    eyebrow: 'HAIRCARE DAYS',
    title: 'Good Hair Energy',
    line: 'SALON-LIKE CARE',
    offer: 'UNDER ₹449',
    note: 'Dove, TRESemmé, Livon and more',
    cta: 'SHOP HAIRCARE',
    category: 'Hair Care',
    gradient: 'from-[#f7e0c3] via-[#e8bd8d] to-[#d59b61]',
    text: 'text-[#523116]',
  },
];

const QUICK_CATEGORIES = [
  { name: 'Skin', category: 'Face Wash' },
  { name: 'Serums', category: 'Serums & Treatments' },
  { name: 'Makeup', category: 'Face Makeup' },
  { name: 'Lips', category: 'Lip Makeup' },
  { name: 'Hair', category: 'Hair Care' },
  { name: 'Men', category: "Men's Grooming" },
];

const CATEGORY_COLORS = [
  'from-[#ffdde5] to-[#ff9eb5]',
  'from-[#e3f3ea] to-[#96d1b4]',
  'from-[#e5e0ff] to-[#b7a8f5]',
  'from-[#ffe6d5] to-[#f4b07b]',
  'from-[#dcefff] to-[#9bc7ec]',
  'from-[#f8e3cc] to-[#d9ab7b]',
];

const SPOTLIGHT_BRANDS = [
  'Maybelline New York',
  'Lakme',
  'Minimalist',
  'Dove',
  'Nivea Men',
  'Engage',
];

const TAB_CATEGORY_GROUPS = {
  SKIN: ['Face Wash', 'Serums & Treatments', 'Sunscreen & Moisturiser', 'Lip Care', 'Toners & Face Mists', 'Face Masks & Exfoliators'],
  MAKEUP: ['Eye Makeup', 'Face Makeup', 'Lip Makeup', 'Nail Care', 'Cleansers & Makeup Removers', 'Beauty Tools'],
  HAIR: ['Hair Care', 'Hair Styling & Masks', 'Body & Bath', 'Hand & Foot Care'],
  MEN: ["Men's Grooming", 'Shaving & Hair Removal', 'Intimate & Personal Care', 'Fragrance & Deodorant'],
};

const getProductImage = (product) => (
  product?.images?.[0] || product?.image_url || product?.image || CATEGORY_FALLBACK_IMAGE
);

const getCategoryImage = (category, products) => {
  if (category?.image_url) return category.image_url;
  return getProductImage(products.find((product) => product.category === category?.name));
};

const SectionTitle = ({ children, subtitle, link = '/products', linkLabel = 'VIEW ALL' }) => (
  <div className="flex items-end justify-between gap-4 mb-5 md:mb-8">
    <div>
      <h2 className="text-[18px] sm:text-[22px] md:text-[28px] font-black uppercase tracking-[0.16em] text-[#3e4152]">
        {children}
      </h2>
      {subtitle && (
        <p className="mt-1.5 text-[11px] md:text-[13px] font-medium text-[#7e818c]">
          {subtitle}
        </p>
      )}
    </div>
    <Link
      to={link}
      className="hidden sm:inline-flex text-[11px] md:text-[12px] font-black tracking-[0.12em] text-[#ff3f6c] hover:text-[#d62957]"
    >
      {linkLabel} →
    </Link>
  </div>
);

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  useEffect(() => {
    if (heroPaused) return undefined;
    const timer = setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroPaused]);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/products`),
        ]);

        if (!categoryResponse.ok || !productResponse.ok) {
          throw new Error('Homepage catalog is unavailable');
        }

        const [categoryData, productData] = await Promise.all([
          categoryResponse.json(),
          productResponse.json(),
        ]);

        setCategories(Array.isArray(categoryData)
          ? categoryData.filter((category) => category.status === 'Active')
          : []);
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const dealProducts = useMemo(
    () => {
      const uniqueBrands = new Map();
      [...products]
        .sort((first, second) => Number(second.discount || 0) - Number(first.discount || 0))
        .forEach((product) => {
          if (!uniqueBrands.has(product.brand)) uniqueBrands.set(product.brand, product);
        });
      return [...uniqueBrands.values()].slice(0, 6);
    },
    [products],
  );

  const brandProducts = useMemo(() => {
    const selected = SPOTLIGHT_BRANDS
      .map((brand) => products.find((product) => product.brand === brand))
      .filter(Boolean);
    const selectedBrands = new Set(selected.map((product) => product.brand));

    products.forEach((product) => {
      if (selected.length < 6 && !selectedBrands.has(product.brand)) {
        selected.push(product);
        selectedBrands.add(product.brand);
      }
    });
    return selected.slice(0, 6);
  }, [products]);

  const trendingProducts = useMemo(() => {
    const allowedCategories = TAB_CATEGORY_GROUPS[activeTab];
    const filtered = allowedCategories
      ? products.filter((product) => allowedCategories.includes(product.category))
      : products;
    return [...filtered]
      .sort((first, second) => Number(second.reviews || 0) - Number(first.reviews || 0))
      .slice(0, 8);
  }, [activeTab, products]);

  const activeHero = HERO_SLIDES[currentSlide];
  const heroProducts = products
    .filter((product) => product.category === activeHero.category)
    .slice(0, 3);
  const categoryTiles = categories.slice(0, 12);

  const showPreviousSlide = () => {
    setCurrentSlide((previous) => (previous - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const showNextSlide = () => {
    setCurrentSlide((previous) => (previous + 1) % HERO_SLIDES.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <MobileHomeHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pt-[108px] md:pt-20 pb-20 md:pb-0 overflow-hidden">
        <aside className="hidden lg:flex fixed right-0 top-[45%] z-40">
          <Link
            to="/products"
            className="h-60 w-11 bg-[#535766] text-white flex items-center justify-center shadow-xl hover:bg-[#ff3f6c] transition-colors"
          >
            <span className="[writing-mode:vertical-rl] rotate-180 text-[13px] font-black tracking-[0.15em]">
              FLAT ₹200 OFF
            </span>
          </Link>
        </aside>

        <section className="bg-[#fff1ec] border-y border-[#f6ddd3] px-4 py-2.5 md:py-3">
          <div className="max-w-[1500px] mx-auto flex items-center justify-center gap-3 sm:gap-8 text-center">
            <span className="text-[12px] sm:text-[15px] font-black text-[#282c3f]">WELCOME OFFER</span>
            <span className="h-5 border-l border-[#d6b8ad]" />
            <span className="text-[12px] sm:text-[17px] font-bold text-[#535766]">
              Get <strong className="text-[#ff3f6c]">25% OFF</strong> on your first order
            </span>
            <span className="hidden sm:inline-flex border border-dashed border-[#ff3f6c] bg-white px-3 py-1 text-[11px] font-black tracking-[0.14em] text-[#ff3f6c]">
              MYNTRASAVE
            </span>
          </div>
        </section>

        <section className="md:hidden px-3 py-4 border-b border-[#ececec]">
          {loading ? (
            <CategoryCircleSkeleton />
          ) : (
            <div className="flex gap-5 overflow-x-auto no-scrollbar">
              {QUICK_CATEGORIES.map((item) => {
                const category = categories.find((entry) => entry.name === item.category);
                return (
                  <Link
                    key={item.name}
                    to={`/products?category=${encodeURIComponent(item.category)}`}
                    className="shrink-0 flex flex-col items-center gap-1.5"
                  >
                    <div className="w-[62px] h-[62px] rounded-full p-[2px] bg-gradient-to-tr from-[#ff3f6c] via-[#ff905a] to-[#f9c74f]">
                      <img
                        src={getCategoryImage(category, products)}
                        alt={item.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white bg-white"
                      />
                    </div>
                    <span className="text-[10px] font-extrabold text-[#3e4152]">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section
          className="relative w-full"
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
        >
          <div className={`relative min-h-[330px] sm:min-h-[380px] md:min-h-[430px] lg:min-h-[470px] overflow-hidden bg-gradient-to-r ${activeHero.gradient}`}>
            <div className="absolute -top-28 left-[35%] w-80 h-80 rounded-full bg-white/25 blur-sm" />
            <div className="absolute -bottom-40 right-[4%] w-[520px] h-[520px] rounded-full border-[70px] border-white/15" />

            <div className="relative z-10 max-w-[1500px] mx-auto min-h-[330px] sm:min-h-[380px] md:min-h-[430px] lg:min-h-[470px] grid grid-cols-12 items-center px-5 sm:px-8 md:px-12 lg:px-16">
              <div className={`col-span-7 md:col-span-5 ${activeHero.text}`}>
                <p className="text-[10px] sm:text-[12px] font-black tracking-[0.28em] mb-2 md:mb-4">
                  {activeHero.eyebrow}
                </p>
                <h1 className="font-serif text-[35px] sm:text-[48px] md:text-[60px] lg:text-[72px] font-black leading-[0.92] tracking-tight">
                  {activeHero.title}
                </h1>
                <p className="mt-3 md:mt-5 text-[12px] sm:text-[16px] md:text-[19px] font-black tracking-[0.16em]">
                  {activeHero.line}
                </p>
                <p className="mt-1 text-[24px] sm:text-[32px] md:text-[42px] font-black leading-none">
                  {activeHero.offer}
                </p>
                <p className="hidden sm:block mt-3 text-[12px] md:text-[14px] font-semibold opacity-80">
                  {activeHero.note}
                </p>
                <Link
                  to={`/products?category=${encodeURIComponent(activeHero.category)}`}
                  className="inline-flex mt-4 md:mt-6 bg-[#282c3f] text-white px-4 md:px-7 py-2.5 md:py-3 text-[10px] md:text-[12px] font-black tracking-[0.14em] hover:bg-[#ff3f6c] transition-colors"
                >
                  {activeHero.cta} →
                </Link>
              </div>

              <div className="col-span-5 md:col-span-7 h-full flex items-end justify-center gap-2 md:gap-4 lg:gap-6 pt-8">
                {(heroProducts.length > 0 ? heroProducts : products.slice(0, 3)).map((product, index) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className={`relative bg-white/95 shadow-[0_18px_45px_rgba(40,44,63,0.18)] overflow-hidden transition-transform hover:-translate-y-2 ${
                      index === 1
                        ? 'w-full max-w-[155px] sm:max-w-none sm:w-[44%] h-[245px] sm:h-[330px] md:h-[390px]'
                        : 'hidden sm:block w-[28%] h-[240px] md:h-[340px]'
                    }`}
                  >
                    <img
                      src={getProductImage(product)}
                      alt={product.title}
                      className="w-full h-[72%] object-contain p-2 md:p-4"
                    />
                    <div className="h-[28%] bg-white px-2 md:px-4 py-2 border-t border-[#f2f2f2] text-center">
                      <p className="text-[9px] md:text-[12px] font-black uppercase truncate text-[#282c3f]">
                        {product.brand}
                      </p>
                      <p className="text-[9px] md:text-[11px] text-[#7e818c] truncate mt-0.5">
                        {product.title}
                      </p>
                      <p className="text-[10px] md:text-[13px] font-black text-[#ff3f6c] mt-1">
                        ₹{Math.round(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={showPreviousSlide}
              aria-label="Previous offer"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-14 items-center justify-center bg-white/70 hover:bg-white text-[#282c3f] shadow-md"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={showNextSlide}
              aria-label="Next offer"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-14 items-center justify-center bg-white/70 hover:bg-white text-[#282c3f] shadow-md"
            >
              ›
            </button>
          </div>

          <div className="flex justify-center gap-2.5 py-4">
            {HERO_SLIDES.map((slide, index) => (
              <button
                type="button"
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Show ${slide.title}`}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === index ? 'w-8 bg-[#535766]' : 'w-1.5 bg-[#d4d5d9]'
                }`}
              />
            ))}
          </div>
        </section>

        <section className="px-4 sm:px-8 lg:px-12 py-4 md:py-8">
          <div className="max-w-[1500px] mx-auto">
            <SectionTitle subtitle="Big savings on fast-selling beauty picks">
              Deals Of The Day
            </SectionTitle>

            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
                {dealProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group bg-[#f5f5f6] overflow-hidden"
                  >
                    <div className="relative aspect-[4/5] bg-white overflow-hidden">
                      <span className="absolute top-2 left-2 z-10 bg-[#ff3f6c] text-white text-[9px] md:text-[10px] font-black px-2 py-1">
                        {index < 2 ? 'HOT DEAL' : 'BESTSELLER'}
                      </span>
                      <img
                        src={getProductImage(product)}
                        alt={product.title}
                        className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className={`bg-gradient-to-r ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} text-center px-2 py-3 md:py-4`}>
                      <p className="text-[11px] md:text-[13px] font-black uppercase truncate text-[#282c3f]">
                        {product.brand}
                      </p>
                      <p className="text-[18px] md:text-[22px] font-black text-[#282c3f] leading-tight">
                        {product.discount}% OFF
                      </p>
                      <p className="text-[10px] md:text-[11px] font-bold text-[#535766] mt-0.5">
                        Shop Now
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="px-4 sm:px-8 lg:px-12 py-7 md:py-12">
          <div className="max-w-[1500px] mx-auto">
            <SectionTitle subtitle="The labels everyone is adding to bag">
              Best Of Beauty Brands
            </SectionTitle>

            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
                {brandProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    to={`/products?brand=${encodeURIComponent(product.brand)}`}
                    className="group border border-[#eaeaec] bg-white overflow-hidden"
                  >
                    <div className={`aspect-[4/5] bg-gradient-to-b ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} p-3 md:p-5`}>
                      <img
                        src={getProductImage(product)}
                        alt={product.brand}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-center px-2 py-3.5">
                      <h3 className="text-[12px] md:text-[14px] font-black uppercase truncate text-[#282c3f]">
                        {product.brand}
                      </h3>
                      <p className="text-[11px] md:text-[13px] font-bold text-[#ff3f6c] mt-1">
                        UP TO {product.discount}% OFF
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-[#fafbfc] px-4 sm:px-8 lg:px-12 py-8 md:py-14">
          <div className="max-w-[1500px] mx-auto">
            <SectionTitle subtitle="Everything you need, one tap away">
              Categories To Bag
            </SectionTitle>

            {loading ? (
              <CategoryCircleSkeleton />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-7 md:gap-x-6 md:gap-y-10">
                {categoryTiles.map((category, index) => (
                  <Link
                    key={category.id || category.name}
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    className="group text-center"
                  >
                    <div className={`mx-auto aspect-square rounded-full overflow-hidden bg-gradient-to-br ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} border-[5px] md:border-[8px] border-white shadow-[0_4px_16px_rgba(40,44,63,0.1)]`}>
                      <img
                        src={getCategoryImage(category, products)}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="mt-2.5 text-[10px] sm:text-[12px] md:text-[14px] font-black text-[#3e4152] uppercase leading-tight">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-[10px] md:text-[12px] font-bold text-[#ff3f6c]">
                      Under ₹499
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="px-4 sm:px-8 lg:px-12 py-8 md:py-14">
          <div className="max-w-[1500px] mx-auto">
            <div className="grid md:grid-cols-2 overflow-hidden">
              <Link
                to="/products?category=Sunscreen%20%26%20Moisturiser"
                className="relative min-h-[230px] md:min-h-[290px] bg-gradient-to-r from-[#f8d7df] to-[#ef9eb2] flex items-center overflow-hidden group"
              >
                <div className="relative z-10 p-7 md:p-10 w-[58%] text-[#5c1d31]">
                  <p className="text-[10px] font-black tracking-[0.22em]">SKINCARE ESSENTIALS</p>
                  <h2 className="font-serif text-[30px] md:text-[44px] font-black leading-none mt-2">
                    Everyday Glow
                  </h2>
                  <p className="text-[17px] md:text-[23px] font-black mt-3">Starting ₹199</p>
                  <span className="inline-flex mt-4 text-[10px] md:text-[11px] font-black bg-[#282c3f] text-white px-4 py-2.5 tracking-widest">
                    SHOP NOW →
                  </span>
                </div>
                <img
                  src={getProductImage(products.find((product) => product.category === 'Sunscreen & Moisturiser'))}
                  alt="Skincare essentials"
                  className="absolute right-0 bottom-0 w-[48%] h-full object-contain p-4 group-hover:scale-105 transition-transform"
                />
              </Link>

              <Link
                to="/products?category=Fragrance%20%26%20Deodorant"
                className="relative min-h-[230px] md:min-h-[290px] bg-gradient-to-r from-[#cbdcf1] to-[#86a9d1] flex items-center overflow-hidden group"
              >
                <div className="relative z-10 p-7 md:p-10 w-[58%] text-[#183759]">
                  <p className="text-[10px] font-black tracking-[0.22em]">FRAGRANCE EDIT</p>
                  <h2 className="font-serif text-[30px] md:text-[44px] font-black leading-none mt-2">
                    Find Your Scent
                  </h2>
                  <p className="text-[17px] md:text-[23px] font-black mt-3">Up to 50% off</p>
                  <span className="inline-flex mt-4 text-[10px] md:text-[11px] font-black bg-[#282c3f] text-white px-4 py-2.5 tracking-widest">
                    EXPLORE →
                  </span>
                </div>
                <img
                  src={getProductImage(products.find((product) => product.category === 'Fragrance & Deodorant'))}
                  alt="Fragrance collection"
                  className="absolute right-0 bottom-0 w-[48%] h-full object-contain p-4 group-hover:scale-105 transition-transform"
                />
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-8 lg:px-12 pb-12 md:pb-20">
          <div className="max-w-[1500px] mx-auto">
            <SectionTitle
              subtitle={`${activeTab === 'ALL' ? 'Most-loved' : activeTab.toLowerCase()} picks customers are shopping now`}
              link="/products"
            >
              Trending Now
            </SectionTitle>

            <div className="md:hidden flex gap-2 overflow-x-auto no-scrollbar mb-5">
              {['ALL', 'SKIN', 'MAKEUP', 'HAIR', 'MEN'].map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 px-4 py-2 text-[10px] font-black tracking-wider border ${
                    activeTab === tab
                      ? 'bg-[#282c3f] text-white border-[#282c3f]'
                      : 'bg-white text-[#535766] border-[#d4d5d9]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {trendingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border-y border-[#eaeaec] bg-[#f8f8f8] px-4 py-4 mb-0">
          <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
            <span className="text-[11px] md:text-[13px] font-black text-[#282c3f]">EXTRA 7.5% CASHBACK</span>
            <span className="hidden sm:block h-5 border-l border-[#bfc0c6]" />
            <span className="text-[10px] md:text-[12px] font-semibold text-[#535766]">
              On select bank cards • Minimum order value applies
            </span>
            <Link to="/products" className="text-[10px] md:text-[11px] font-black text-[#ff3f6c]">
              SHOP OFFERS →
            </Link>
          </div>
        </section>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';
import { MobilePageHeader } from '../components/MobileHeader';

const API_BASE = API_BASE_URL;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mobile Drawer State
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Parse URL queries
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  const activeCategories = searchParams.get('category') ? searchParams.get('category').split(',') : [];
  const activeBrands = searchParams.get('brand') ? searchParams.get('brand').split(',') : [];
  const activeSort = searchParams.get('sort') || '';

  const headerTitle = activeCategories.length > 0
    ? activeCategories.join(', ')
    : searchQuery ? `Search: ${searchQuery}` : 'ALL PRODUCTS';

  // Fetch Categories & Brands List dynamically
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/products`),
        ]);
        if (catRes.ok && catRes.headers.get('content-type')?.includes('application/json')) {
          const catData = await catRes.json();
          setAllCategories(Array.isArray(catData) ? catData.filter(c => c.status === 'Active') : []);
        }
        if (prodRes.ok && prodRes.headers.get('content-type')?.includes('application/json')) {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData)) {
            const brands = [...new Set(prodData.map(p => p.brand).filter(Boolean))].sort();
            setAllBrands(brands);
          }
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch filtered products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentParams = new URLSearchParams(location.search);
        const currentSearch = currentParams.get('search') || '';
        const currentCategories = currentParams.get('category') || '';
        const currentBrands = currentParams.get('brand') || '';
        const currentSort = currentParams.get('sort') || '';
        const apiParams = new URLSearchParams();
        if (currentSearch) apiParams.append('search', currentSearch);
        if (currentCategories) apiParams.append('category', currentCategories);
        if (currentBrands) apiParams.append('brand', currentBrands);
        if (currentSort) apiParams.append('sort', currentSort);

        const response = await fetch(`${API_BASE}/products?${apiParams.toString()}`);
        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType?.includes('application/json')) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]);

  const handleFilterChange = (filterType, value) => {
    const params = new URLSearchParams(location.search);
    let currentFilters = params.get(filterType) ? params.get(filterType).split(',') : [];

    if (currentFilters.includes(value)) {
      currentFilters = currentFilters.filter(item => item !== value);
    } else {
      currentFilters.push(value);
    }

    if (currentFilters.length > 0) {
      params.set(filterType, currentFilters.join(','));
    } else {
      params.delete(filterType);
    }

    navigate(`/products?${params.toString()}`);
  };

  const handleSortChange = (sortVal) => {
    const params = new URLSearchParams(location.search);
    if (sortVal) {
      params.set('sort', sortVal);
    } else {
      params.delete('sort');
    }
    navigate(`/products?${params.toString()}`);
    setShowMobileSort(false);
  };

  const clearAllFilters = () => {
    navigate('/products');
  };

  if (error) return <div className="pt-32 text-center h-[50vh] text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Top Header */}
      <MobilePageHeader title={headerTitle} />

      <div className="pt-20 sm:pt-24 md:pt-28 pb-20 md:pb-12 w-full max-w-[1400px] mx-auto px-2 md:px-4 min-h-[70vh]">

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:flex text-[14px] text-[#282c3f] mb-4">
          <span className="cursor-pointer hover:underline" onClick={() => navigate('/')}>Home</span> / <span className="font-bold">Products</span>
          {searchQuery && <span> / Search: "{searchQuery}"</span>}
        </div>

        {/* Page Title & Count */}
        <div className="hidden md:flex justify-between items-center mb-6 border-b border-[#eaeaec] pb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-black text-[#282c3f]">Products Catalogue</h1>
            <span className="text-[14px] text-[#535766] font-semibold">- {products.length} items found</span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 border border-[#d4d5d9] px-4 py-2 rounded cursor-pointer hover:border-[#282c3f] bg-white">
            <span className="text-[14px] text-[#282c3f] font-semibold">Sort by:</span>
            <select
              className="outline-none text-[14px] font-bold text-[#282c3f] bg-transparent cursor-pointer"
              value={activeSort}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0 border-r border-[#eaeaec] pr-6 sticky top-24 self-start max-h-[calc(100vh-110px)] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="font-black text-[14px] text-[#282c3f] uppercase tracking-wider">Filters</span>
              {(activeCategories.length > 0 || activeBrands.length > 0 || searchQuery || activeSort) && (
                <button onClick={clearAllFilters} className="text-[#ff3f6c] text-[12px] font-bold cursor-pointer hover:underline">CLEAR ALL</button>
              )}
            </div>

            {/* Dynamic Categories List */}
            <div className="border-t border-[#eaeaec] py-4">
              <h3 className="font-bold text-[13px] text-[#282c3f] mb-3 uppercase tracking-wider">Categories ({allCategories.length})</h3>
              <ul className="space-y-2 text-[13px] text-[#282c3f] max-h-64 overflow-y-auto pr-1">
                {allCategories.map(cat => (
                  <li key={cat.id || cat.name} className="flex items-center gap-3 hover:text-[#ff3f6c] cursor-pointer">
                    <input
                      type="checkbox"
                      id={`cat-${cat.name}`}
                      className="accent-[#ff3f6c] cursor-pointer h-4 w-4 rounded"
                      checked={activeCategories.includes(cat.name)}
                      onChange={() => handleFilterChange('category', cat.name)}
                    />
                    <label htmlFor={`cat-${cat.name}`} className="cursor-pointer text-xs font-semibold select-none flex-1 truncate">{cat.name}</label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dynamic Brands List */}
            <div className="border-t border-[#eaeaec] py-4">
              <h3 className="font-bold text-[13px] text-[#282c3f] mb-3 uppercase tracking-wider">Brands ({allBrands.length})</h3>
              <ul className="space-y-2 text-[13px] text-[#282c3f] max-h-64 overflow-y-auto pr-1">
                {allBrands.map(brand => (
                  <li key={brand} className="flex items-center gap-3 hover:text-[#ff3f6c] cursor-pointer">
                    <input
                      type="checkbox"
                      id={`brand-${brand}`}
                      className="accent-[#ff3f6c] cursor-pointer h-4 w-4 rounded"
                      checked={activeBrands.includes(brand)}
                      onChange={() => handleFilterChange('brand', brand)}
                    />
                    <label htmlFor={`brand-${brand}`} className="cursor-pointer text-xs font-semibold select-none flex-1 truncate">{brand}</label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid (Matching 2-Column Layout on Mobile) */}
          <div className="flex-1">
            {loading ? (
               <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
               <div className="text-center py-20 flex flex-col items-center bg-gray-50 rounded-2xl p-8 border border-gray-100">
                 <h2 className="text-[20px] font-black text-[#282c3f] mb-2">No matching products found</h2>
                 <p className="text-[14px] text-[#535766]">Try selecting a different category or clearing search filters.</p>
                 <button onClick={clearAllFilters} className="mt-6 bg-[#ff3f6c] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#e73361] transition-colors shadow-md">Clear All Filters</button>
               </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar on Mobile Screen (Matching Image 2 Format: GENDER | SORT | FILTER) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#eaeaec] z-50 flex items-center justify-around text-[13px] font-extrabold text-[#282c3f] py-2.5 shadow-lg">
        {/* Gender Option Button */}
        <button
          onClick={() => setShowMobileFilter(true)}
          className="flex-1 flex items-center justify-center gap-1 border-r border-[#eaeaec] py-1"
        >
          <span>GENDER</span>
        </button>

        {/* Sort Option Button */}
        <button
          onClick={() => setShowMobileSort(true)}
          className="flex-1 flex items-center justify-center gap-1 border-r border-[#eaeaec] py-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#ff3f6c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span>SORT</span>
        </button>

        {/* Filter Option Button */}
        <button
          onClick={() => setShowMobileFilter(true)}
          className="flex-1 flex items-center justify-center gap-1 py-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#ff3f6c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>FILTER</span>
          {(activeCategories.length > 0 || activeBrands.length > 0) && (
            <span className="w-2 h-2 rounded-full bg-[#ff3f6c]"></span>
          )}
        </button>
      </div>

      {/* Mobile Sort Modal Sheet */}
      {showMobileSort && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-50 flex flex-col justify-end animate-fadeIn">
          <div className="bg-white rounded-t-2xl p-4 w-full max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#eaeaec] mb-3">
              <h3 className="font-extrabold text-[15px] text-[#282c3f] uppercase">SORT BY</h3>
              <button onClick={() => setShowMobileSort(false)} className="text-[#696e79] font-bold text-[18px]">✕</button>
            </div>
            <div className="flex flex-col gap-2 font-medium text-[14px]">
              <button
                onClick={() => handleSortChange('')}
                className={`p-3 text-left rounded-lg ${activeSort === '' ? 'bg-[#ff3f6c]/10 text-[#ff3f6c] font-bold' : 'text-[#282c3f]'}`}
              >
                Recommended
              </button>
              <button
                onClick={() => handleSortChange('price_asc')}
                className={`p-3 text-left rounded-lg ${activeSort === 'price_asc' ? 'bg-[#ff3f6c]/10 text-[#ff3f6c] font-bold' : 'text-[#282c3f]'}`}
              >
                Price: Low to High
              </button>
              <button
                onClick={() => handleSortChange('price_desc')}
                className={`p-3 text-left rounded-lg ${activeSort === 'price_desc' ? 'bg-[#ff3f6c]/10 text-[#ff3f6c] font-bold' : 'text-[#282c3f]'}`}
              >
                Price: High to Low
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Drawer Sheet */}
      {showMobileFilter && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-50 flex flex-col justify-end animate-fadeIn">
          <div className="bg-white rounded-t-2xl p-4 w-full h-[80vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-[#eaeaec]">
              <h3 className="font-extrabold text-[15px] text-[#282c3f] uppercase">FILTERS</h3>
              <button onClick={() => setShowMobileFilter(false)} className="text-[#ff3f6c] font-bold text-[14px]">DONE</button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              <div>
                <h4 className="font-bold text-[13px] text-[#282c3f] uppercase mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(cat => (
                    <button
                      key={cat.id || cat.name}
                      onClick={() => handleFilterChange('category', cat.name)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all ${activeCategories.includes(cat.name) ? 'bg-[#ff3f6c] text-white border-[#ff3f6c]' : 'bg-[#f5f5f6] text-[#282c3f] border-transparent'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-t border-[#eaeaec]" />

              <div>
                <h4 className="font-bold text-[13px] text-[#282c3f] uppercase mb-2">Brands</h4>
                <div className="flex flex-wrap gap-2">
                  {allBrands.map(brand => (
                    <button
                      key={brand}
                      onClick={() => handleFilterChange('brand', brand)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all ${activeBrands.includes(brand) ? 'bg-[#ff3f6c] text-white border-[#ff3f6c]' : 'bg-[#f5f5f6] text-[#282c3f] border-transparent'}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#eaeaec] flex justify-between">
              <button onClick={clearAllFilters} className="text-[#ff3f6c] font-bold text-[13px]">Clear All</button>
              <button onClick={() => setShowMobileFilter(false)} className="bg-[#ff3f6c] text-white font-bold px-6 py-2 rounded-lg text-[13px]">Apply Filters</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;

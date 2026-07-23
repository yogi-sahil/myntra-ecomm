import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import { API_BASE_URL } from '../config';

const API_BASE = API_BASE_URL;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Parse URL queries
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  const activeCategories = searchParams.get('category') ? searchParams.get('category').split(',') : [];
  const activeBrands = searchParams.get('brand') ? searchParams.get('brand').split(',') : [];
  const activeSort = searchParams.get('sort') || '';

  // Fetch Categories & Brands List dynamically
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/products`),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setAllCategories(Array.isArray(catData) ? catData.filter(c => c.status === 'Active') : []);
        }
        if (prodRes.ok) {
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
        const apiParams = new URLSearchParams();
        if (searchQuery) apiParams.append('search', searchQuery);
        if (activeCategories.length > 0) apiParams.append('category', activeCategories.join(','));
        if (activeBrands.length > 0) apiParams.append('brand', activeBrands.join(','));
        if (activeSort) apiParams.append('sort', activeSort);

        const response = await fetch(`${API_BASE}/products?${apiParams.toString()}`);
        if (!response.ok) {
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

  const handleSortChange = (e) => {
    const params = new URLSearchParams(location.search);
    if (e.target.value) {
      params.set('sort', e.target.value);
    } else {
      params.delete('sort');
    }
    navigate(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    navigate('/products');
  };

  if (error) return <div className="pt-32 text-center h-[50vh] text-red-500 font-bold">{error}</div>;

  return (
    <div className="pt-24 pb-12 w-full max-w-[1400px] mx-auto px-4 min-h-[70vh]">
      {/* Breadcrumbs */}
      <div className="text-[14px] text-[#282c3f] mb-4">
        <span className="cursor-pointer hover:underline" onClick={() => navigate('/')}>Home</span> / <span className="font-bold">Products</span>
        {searchQuery && <span> / Search: "{searchQuery}"</span>}
      </div>
      
      {/* Page Title & Count */}
      <div className="flex justify-between items-center mb-6 border-b border-[#eaeaec] pb-4">
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
            onChange={handleSortChange}
          >
            <option value="">Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar Filters (Sticky on scroll) */}
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

        {/* Product Grid */}
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;

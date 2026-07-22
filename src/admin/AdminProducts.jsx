import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Edit2, Image as ImageIcon, LoaderCircle, Package, Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog, DataState, Field, Pagination, SearchField, inputClass } from './AdminUI';
import { useAdminToast } from './AdminToastContext';
import { API_BASE, formatCurrency, getApiError, getAuthHeaders, paginate } from './adminUtils';

const emptyForm = { title: '', brand: '', category: '', price: '', original_price: '', discount: '', image_url: '', description: '', stock_quantity: '50', sku: '', available_sizes: 'S,M,L,XL' };
const PAGE_SIZE = 8;

const StockBadge = ({ quantity }) => {
  const qty = Number(quantity ?? 50);
  if (qty <= 0) return <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">Out of stock</span>;
  if (qty < 10) return <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">Low stock ({qty})</span>;
  return <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">In stock ({qty})</span>;
};

const AdminProducts = () => {
  const { token } = useAuth();
  const notify = useAdminToast();
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/categories`),
      ]);
      if (!productsResponse.ok) throw new Error(await getApiError(productsResponse, 'Products could not be loaded.'));
      if (!categoriesResponse.ok) throw new Error(await getApiError(categoriesResponse, 'Categories could not be loaded.'));
      const [productData, categoryData] = await Promise.all([productsResponse.json(), categoriesResponse.json()]);
      setProducts(Array.isArray(productData) ? productData : []);
      setCategories(Array.isArray(categoryData) ? categoryData.filter((category) => category.status === 'Active') : []);
    } catch (err) {
      setError(err.message || 'Products could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setCurrentPage(1); setSelectedIds([]); }, [search, categoryFilter]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !query || [product.title, product.brand, product.category, product.sku].some((value) => String(value || '').toLowerCase().includes(query));
      return matchesQuery && (categoryFilter === 'All' || product.category === categoryFilter);
    });
  }, [products, search, categoryFilter]);
  const visibleProducts = paginate(filteredProducts, currentPage, PAGE_SIZE);

  const toggleSelectAll = () => {
    if (selectedIds.length === visibleProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleProducts.map((p) => p.id));
    }
  };

  const toggleSelectId = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    setIsUploading(true);
    setFormError('');
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        const response = await fetch(`${API_BASE}/admin/upload`, {
          method: 'POST',
          headers: getAuthHeaders(token, true),
          body: JSON.stringify({ imageBase64: base64Data, fileName: file.name }),
        });
        if (!response.ok) throw new Error(await getApiError(response, 'Failed to upload image.'));
        const data = await response.json();
        const fullUrl = data.imageUrl.startsWith('/uploads') ? `${API_BASE.replace('/api', '')}${data.imageUrl}` : data.imageUrl;
        updateField('image_url', fullUrl);
        notify('Product image uploaded.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setFormError(err.message || 'Image upload failed.');
      setIsUploading(false);
    }
  };

  const openForm = (product = null) => {
    setEditId(product?.id || null);
    setFormData(product ? {
      title: product.title || '', brand: product.brand || '', category: product.category || '',
      price: product.price ?? '', original_price: product.original_price ?? '', discount: product.discount || '',
      image_url: product.image_url || '', description: product.description || '',
      stock_quantity: product.stock_quantity ?? 50, sku: product.sku || '', available_sizes: product.available_sizes || 'S,M,L,XL'
    } : emptyForm);
    setFormError('');
    setShowForm(true);
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      titleRef.current?.focus();
    }, 50);
  };

  const closeForm = (force = false) => {
    if (isSaving && !force) return;
    setShowForm(false);
    setEditId(null);
    setFormData(emptyForm);
    setFormError('');
  };

  // Auto calculate discount / price
  const handlePriceChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      const orig = Number(field === 'original_price' ? value : prev.original_price);
      const sel = Number(field === 'price' ? value : prev.price);
      const disc = Number(field === 'discount' ? value : prev.discount);

      if (field === 'price' || field === 'original_price') {
        if (orig > 0 && sel > 0 && orig >= sel) {
          next.discount = String(Math.round(((orig - sel) / orig) * 100));
        }
      } else if (field === 'discount') {
        if (orig > 0 && disc >= 0 && disc <= 100) {
          next.price = String(Math.round(orig * (1 - disc / 100)));
        }
      }
      return next;
    });
  };

  const generateRandomSKU = () => {
    const prefix = (formData.brand || formData.category || 'SKU').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    updateField('sku', `${prefix}-${randomNum}`);
  };

  const toggleSize = (size) => {
    const currentSizes = formData.available_sizes ? formData.available_sizes.split(',').map((s) => s.trim()).filter(Boolean) : [];
    let updated;
    if (currentSizes.includes(size)) {
      updated = currentSizes.filter((s) => s !== size);
    } else {
      updated = [...currentSizes, size];
    }
    updateField('available_sizes', updated.join(','));
  };

  // Keyboard shortcuts (Cmd+S / Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showForm) return;
      if (e.key === 'Escape') closeForm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);

  const validateForm = () => {
    const price = Number(formData.price);
    const originalPrice = Number(formData.original_price);
    if (price <= 0) return 'Selling price must be greater than zero.';
    if (originalPrice <= 0) return 'Original price must be greater than zero.';
    if (originalPrice < price) return 'Original price cannot be lower than the selling price.';
    if (formData.discount !== '' && (Number(formData.discount) < 0 || Number(formData.discount) > 100)) return 'Discount must be between 0 and 100%.';
    if (!formData.image_url.startsWith('http') && !formData.image_url.startsWith('/uploads')) {
      return 'Provide a valid HTTP/HTTPS or uploaded image URL.';
    }
    return '';
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) { setFormError(validationError); return; }
    setIsSaving(true);
    setFormError('');
    try {
      const response = await fetch(`${API_BASE}/admin/products${editId ? `/${editId}` : ''}`, {
        method: editId ? 'PUT' : 'POST',
        headers: getAuthHeaders(token, true),
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(await getApiError(response, `Product could not be ${editId ? 'updated' : 'created'}.`));
      notify(`Product ${editId ? 'updated' : 'created'} successfully.`);
      closeForm(true);
      await fetchData();
    } catch (err) {
      setFormError(err.message || 'Product could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/admin/products/${deleteTarget.id}`, { method: 'DELETE', headers: getAuthHeaders(token) });
      if (!response.ok) throw new Error(await getApiError(response, 'Product could not be deleted.'));
      setProducts((current) => current.filter((product) => product.id !== deleteTarget.id));
      notify('Product deleted.');
      setDeleteTarget(null);
    } catch (err) {
      notify(err.message || 'Product could not be deleted.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    setIsBulkDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/admin/products/bulk-delete`, {
        method: 'POST',
        headers: getAuthHeaders(token, true),
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!response.ok) throw new Error(await getApiError(response, 'Bulk product deletion failed.'));
      const data = await response.json();
      setProducts((current) => current.filter((product) => !selectedIds.includes(product.id)));
      setSelectedIds([]);
      notify(data.message || 'Selected products deleted.');
      setShowBulkConfirm(false);
    } catch (err) {
      notify(err.message || 'Bulk product deletion failed.', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div><h1 className="text-2xl font-black tracking-tight text-[#282c3f]">Products</h1><p className="mt-1 text-sm text-gray-500">Manage catalogue information, inventory, imagery, categories, and pricing.</p></div>
        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
          {selectedIds.length > 0 && (
            <button type="button" onClick={() => setShowBulkConfirm(true)} className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">
              <Trash2 size={17} /> Delete selected ({selectedIds.length})
            </button>
          )}
          <SearchField value={search} onChange={setSearch} placeholder="Search title, brand, SKU…" label="Search products" />
          <label className="sr-only" htmlFor="product-category-filter">Filter by category</label>
          <select id="product-category-filter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-600 outline-none focus:border-[#ff3f6c] focus:ring-2 focus:ring-[#ff3f6c]/20"><option>All</option>{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select>
          <button type="button" onClick={() => showForm ? closeForm() : openForm()} className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#ff3f6c] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#e73361]"><Plus size={18} /> {showForm ? 'Close form' : 'Add product'}</button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="product-drawer-title">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity" onClick={() => closeForm()} />
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-2xl transform bg-white shadow-2xl transition-all flex flex-col">
              {/* Sticky Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/70">
                <div>
                  <h2 id="product-drawer-title" className="text-xl font-black text-[#282c3f]">{editId ? 'Edit Product' : 'Add New Product'}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-[10px] font-bold">Esc</kbd> to close</p>
                </div>
                <button type="button" onClick={() => closeForm()} className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition" aria-label="Close product drawer">
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {formError && <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700">{formError}</div>}
                
                <form id="product-form" onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field id="product-title" label="Product title" required>
                      <input ref={titleRef} id="product-title" required className={inputClass} value={formData.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Printed cotton T-shirt" />
                    </Field>
                    <Field id="product-brand" label="Brand" required>
                      <input id="product-brand" required className={inputClass} value={formData.brand} onChange={(e) => updateField('brand', e.target.value)} placeholder="Roadster" />
                    </Field>
                  </div>

                  <Field id="product-category" label="Category" required>
                    <select id="product-category" required className={inputClass} value={formData.category} onChange={(e) => updateField('category', e.target.value)}>
                      <option value="" disabled>Select category</option>
                      {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </Field>

                  {/* Auto-Calculating Price & Discount Box */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Pricing & Auto Discount</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Field id="product-original-price" label="Original Price (₹)" required hint="MRP list price">
                        <input id="product-original-price" type="number" required min="0.01" step="0.01" className={inputClass} value={formData.original_price} onChange={(e) => handlePriceChange('original_price', e.target.value)} placeholder="999" />
                      </Field>
                      <Field id="product-price" label="Selling Price (₹)" required hint="Final store price">
                        <input id="product-price" type="number" required min="0.01" step="0.01" className={inputClass} value={formData.price} onChange={(e) => handlePriceChange('price', e.target.value)} placeholder="499" />
                      </Field>
                      <Field id="product-discount" label="Discount (%)" hint="Auto computed">
                        <input id="product-discount" type="number" min="0" max="100" step="1" className={inputClass} value={formData.discount} onChange={(e) => handlePriceChange('discount', e.target.value)} placeholder="50" />
                      </Field>
                    </div>
                  </div>

                  {/* Stock Quantity & Quick Presets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Field id="product-stock" label="Stock Quantity" required hint="Total inventory available">
                        <input id="product-stock" type="number" min="0" required className={inputClass} value={formData.stock_quantity} onChange={(e) => updateField('stock_quantity', e.target.value)} />
                      </Field>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-500">Presets:</span>
                        <button type="button" onClick={() => updateField('stock_quantity', String(Number(formData.stock_quantity || 0) + 10))} className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700 hover:bg-gray-200">+10</button>
                        <button type="button" onClick={() => updateField('stock_quantity', String(Number(formData.stock_quantity || 0) + 50))} className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700 hover:bg-gray-200">+50</button>
                        <button type="button" onClick={() => updateField('stock_quantity', '50')} className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700 hover:bg-gray-200">Reset 50</button>
                      </div>
                    </div>

                    <div>
                      <Field id="product-sku" label="SKU Code" hint="Unique inventory identifier">
                        <div className="flex gap-2">
                          <input id="product-sku" className={inputClass} value={formData.sku} onChange={(e) => updateField('sku', e.target.value)} placeholder="SKU-8921" />
                          <button type="button" onClick={generateRandomSKU} className="shrink-0 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200">Generate</button>
                        </div>
                      </Field>
                    </div>
                  </div>

                  {/* Size Selector Chips */}
                  <div>
                    <label className="block text-sm font-black text-[#282c3f] mb-1.5">Available Sizes</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((sz) => {
                        const isSelected = (formData.available_sizes || '').split(',').map(s=>s.trim()).includes(sz);
                        return (
                          <button type="button" key={sz} onClick={() => toggleSize(sz)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${isSelected ? 'bg-[#ff3f6c] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                    <input id="product-sizes" className={inputClass} value={formData.available_sizes} onChange={(e) => updateField('available_sizes', e.target.value)} placeholder="S,M,L,XL" />
                  </div>

                  <Field id="product-description" label="Description" hint="Customer facing product details">
                    <textarea id="product-description" rows="3" className={`${inputClass} resize-y`} value={formData.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Fabric, fit, pattern, and key details…" />
                  </Field>

                  {/* Image Upload Box */}
                  <div className="border-t border-gray-100 pt-4">
                    <label className="block text-sm font-black text-[#282c3f] mb-2">Product Image</label>
                    <div className="flex flex-col gap-3">
                      <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#ff3f6c] bg-gray-50 hover:bg-[#ff3f6c]/5 rounded-xl p-4 cursor-pointer text-center transition">
                        <UploadCloud size={28} className="text-gray-400 mb-1" />
                        <p className="text-xs font-bold text-gray-700">Click to upload product image</p>
                        <p className="text-[11px] text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0])} />
                      </div>

                      <Field id="product-image" label="Or paste image URL">
                        <input id="product-image" type="text" className={inputClass} value={formData.image_url} onChange={(e) => updateField('image_url', e.target.value)} placeholder="https://example.com/product.jpg" />
                      </Field>
                      {isUploading && <p className="text-xs text-[#ff3f6c] font-bold flex items-center gap-1.5"><LoaderCircle className="animate-spin" size={14} /> Uploading image…</p>}
                      {formData.image_url && (
                        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2.5">
                          <img src={formData.image_url} alt="Product preview" className="h-14 w-12 rounded object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-800 truncate">{formData.image_url}</p>
                            <p className="text-[10px] text-gray-400">Selected image preview</p>
                          </div>
                          <button type="button" onClick={() => updateField('image_url', '')} className="text-xs text-red-600 font-bold hover:underline">Remove</button>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Sticky Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/70">
                <button type="button" onClick={() => closeForm()} disabled={isSaving} className="rounded-lg px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
                <button type="submit" form="product-form" disabled={isSaving || isUploading} className="flex min-w-36 items-center justify-center gap-2 rounded-lg bg-[#03a685] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#028a6f] shadow-md disabled:opacity-60">
                  {isSaving ? <><LoaderCircle className="animate-spin" size={17} /> Saving…</> : editId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm" aria-label="Product list">
        <DataState loading={loading} error={error} onRetry={fetchData} isEmpty={!loading && !error && filteredProducts.length === 0} icon={Package} loadingText="Loading products…" emptyTitle={search || categoryFilter !== 'All' ? 'No matching products' : 'No products yet'} emptyText={search || categoryFilter !== 'All' ? 'Try a different search or category filter.' : 'Add your first product to start building the catalogue.'}>
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="p-4 pl-6 w-10">
                      <input type="checkbox" checked={visibleProducts.length > 0 && selectedIds.length === visibleProducts.length} onChange={toggleSelectAll} className="rounded border-gray-300 text-[#ff3f6c] focus:ring-[#ff3f6c]" />
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Product</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Category & SKU</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Stock Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Price</th>
                    <th className="p-4 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleProducts.map((product) => (
                    <tr key={product.id} className={`hover:bg-gray-50/70 ${selectedIds.includes(product.id) ? 'bg-[#ff3f6c]/5' : ''}`}>
                      <td className="p-4 pl-6">
                        <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelectId(product.id)} className="rounded border-gray-300 text-[#ff3f6c] focus:ring-[#ff3f6c]" />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
                            {product.image_url ? <img src={product.image_url} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={20} className="text-gray-400" />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#282c3f]">{product.brand}</p>
                            <p className="mt-0.5 max-w-xs truncate text-sm text-gray-500">{product.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 block w-fit">{product.category}</span>
                        <span className="mt-1 text-[11px] font-mono text-gray-400 block">{product.sku || `SKU-${product.id}`}</span>
                      </td>
                      <td className="p-4">
                        <StockBadge quantity={product.stock_quantity} />
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-black text-[#282c3f]">{formatCurrency(product.price)}</p>
                        {product.original_price && <p className="mt-1 text-xs text-gray-400 line-through">{formatCurrency(product.original_price)}</p>}
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openForm(product)} className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600" aria-label={`Edit ${product.title}`}><Edit2 size={17} /></button>
                          <button type="button" onClick={() => setDeleteTarget(product)} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${product.title}`}><Trash2 size={17} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 md:hidden">
              {visibleProducts.map((product) => (
                <article key={product.id} className="p-4">
                  <div className="flex gap-3">
                    <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelectId(product.id)} className="mt-1 rounded border-gray-300 text-[#ff3f6c]" />
                    <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                      {product.image_url ? <img src={product.image_url} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={22} className="text-gray-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#282c3f]">{product.brand}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{product.title}</p>
                      <p className="mt-1 text-sm font-black text-[#282c3f]">{formatCurrency(product.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <StockBadge quantity={product.stock_quantity} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button type="button" onClick={() => openForm(product)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" aria-label={`Edit ${product.title}`}><Edit2 size={18} /></button>
                      <button type="button" onClick={() => setDeleteTarget(product)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${product.title}`}><Trash2 size={18} /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <Pagination currentPage={currentPage} pageSize={PAGE_SIZE} totalItems={filteredProducts.length} onPageChange={setCurrentPage} label="products" />
          </>
        </DataState>
      </section>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete product?" description={`“${deleteTarget?.title || ''}” will be permanently removed from the catalogue. Existing order history may still reference it.`} confirmLabel="Delete product" busy={isDeleting} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      <ConfirmDialog open={showBulkConfirm} title="Delete selected products?" description={`You are about to delete ${selectedIds.length} product(s). Products linked to existing orders cannot be deleted.`} confirmLabel="Delete selected" tone="warning" busy={isBulkDeleting} onCancel={() => setShowBulkConfirm(false)} onConfirm={handleBulkDelete} />
    </div>
  );
};

export default AdminProducts;

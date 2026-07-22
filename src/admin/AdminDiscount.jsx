import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Clock, Edit2, LoaderCircle, Plus, Tag, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog, DataState, Field, Pagination, SearchField, inputClass } from './AdminUI';
import { useAdminToast } from './AdminToastContext';
import { API_BASE, formatCurrency, formatDate, getApiError, getAuthHeaders, paginate } from './adminUtils';

const emptyForm = { code: '', type: 'Percentage', value: '', minOrder: '', expiry: '', status: 'Active' };
const PAGE_SIZE = 10;
const today = new Date().toISOString().slice(0, 10);

const effectiveStatus = (coupon) => coupon.status === 'Active' && new Date(coupon.expiry_date).getTime() < new Date().setHours(0, 0, 0, 0) ? 'Expired' : coupon.status;
const StatusBadge = ({ coupon }) => {
  const status = effectiveStatus(coupon);
  const style = status === 'Active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : status === 'Expired' ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-gray-50 text-gray-600';
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${style}`}>{status === 'Expired' && <AlertCircle size={13} />}{status}</span>;
};

const AdminDiscount = () => {
  const { token } = useAuth();
  const notify = useAdminToast();
  const formRef = useRef(null);
  const codeRef = useRef(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_BASE}/coupons`, { headers: getAuthHeaders(token) });
      if (!response.ok) throw new Error(await getApiError(response, 'Coupons could not be loaded.'));
      const data = await response.json(); setCoupons(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message || 'Coupons could not be loaded.'); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase();
    return coupons.filter((coupon) => (!query || coupon.code.toLowerCase().includes(query)) && (statusFilter === 'All' || effectiveStatus(coupon) === statusFilter));
  }, [coupons, search, statusFilter]);
  const visibleCoupons = paginate(filteredCoupons, currentPage, PAGE_SIZE);

  // Generate coupon code
  const generateCouponCode = () => {
    const prefixes = ['MYNTRA', 'FESTIVE', 'SUPER', 'SUMMER', 'VIP', 'FLASH'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const val = formData.value ? Math.round(Number(formData.value)) : 20;
    updateField('code', `${prefix}${val}`);
  };

  // Keyboard shortcuts (Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showForm) return;
      if (e.key === 'Escape') closeForm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);

  const openForm = (coupon = null) => {
    setEditId(coupon?.id || null); setFormError('');
    setFormData(coupon ? { code: coupon.code, type: coupon.discount_type, value: coupon.discount_value, minOrder: coupon.min_order_value, expiry: new Date(coupon.expiry_date).toISOString().slice(0, 10), status: coupon.status } : emptyForm);
    setShowForm(true); window.setTimeout(() => { codeRef.current?.focus(); }, 50);
  };
  const closeForm = (force = false) => { if (isSaving && !force) return; setShowForm(false); setEditId(null); setFormData(emptyForm); setFormError(''); };
  const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

  const handleSave = async (event) => {
    event.preventDefault();
    if (formData.type === 'Percentage' && Number(formData.value) > 100) { setFormError('Percentage discounts cannot exceed 100%.'); return; }
    if (!editId && formData.expiry < today) { setFormError('Expiry date cannot be in the past.'); return; }
    setIsSaving(true); setFormError('');
    try {
      const response = await fetch(`${API_BASE}/coupons${editId ? `/${editId}` : ''}`, { method: editId ? 'PUT' : 'POST', headers: getAuthHeaders(token, true), body: JSON.stringify(formData) });
      if (!response.ok) throw new Error(await getApiError(response, 'Coupon could not be saved.'));
      notify(`Coupon ${editId ? 'updated' : 'created'} successfully.`); closeForm(true); await fetchCoupons();
    } catch (err) { setFormError(err.message || 'Coupon could not be saved.'); }
    finally { setIsSaving(false); }
  };

  const deleteCoupon = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/coupons/${deleteTarget.id}`, { method: 'DELETE', headers: getAuthHeaders(token) });
      if (!response.ok) throw new Error(await getApiError(response, 'Coupon could not be deleted.'));
      setCoupons((current) => current.filter((coupon) => coupon.id !== deleteTarget.id)); setDeleteTarget(null); notify('Coupon deleted.');
    } catch (err) { notify(err.message || 'Coupon could not be deleted.', 'error'); }
    finally { setIsDeleting(false); }
  };

  const reward = (coupon) => coupon.discount_type === 'Fixed' ? `${formatCurrency(coupon.discount_value)} off` : `${Number(coupon.discount_value)}% off`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div><h1 className="text-2xl font-black text-[#282c3f]">Discounts & Coupons</h1><p className="mt-1 text-sm text-gray-500">Create, validate, and retire customer promotions.</p></div>
        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
          <SearchField value={search} onChange={setSearch} placeholder="Search coupon code…" label="Search coupons" />
          <label className="sr-only" htmlFor="coupon-status-filter">Filter coupon status</label>
          <select id="coupon-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-600 outline-none focus:border-[#ff3f6c]"><option>All</option><option>Active</option><option>Inactive</option><option>Expired</option></select>
          <button type="button" onClick={() => showForm ? closeForm() : openForm()} className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#ff3f6c] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e73361]"><Plus size={18} /> {showForm ? 'Close form' : 'Create coupon'}</button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="coupon-drawer-title">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity" onClick={() => closeForm()} />
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md transform bg-white shadow-2xl transition-all flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/70">
                <div>
                  <h2 id="coupon-drawer-title" className="text-xl font-black text-[#282c3f]">{editId ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-[10px] font-bold">Esc</kbd> to close</p>
                </div>
                <button type="button" onClick={() => closeForm()} className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {formError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700">{formError}</div>}
                
                <form id="coupon-form" onSubmit={handleSave} className="space-y-4">
                  <Field id="coupon-code" label="Coupon code" required>
                    <div className="flex gap-2">
                      <input ref={codeRef} id="coupon-code" required minLength="3" maxLength="32" pattern="[A-Z0-9_-]+" className={`${inputClass} font-black uppercase`} value={formData.code} onChange={(e) => updateField('code', e.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="SUMMER50" />
                      <button type="button" onClick={generateCouponCode} className="shrink-0 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200">Generate</button>
                    </div>
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field id="coupon-type" label="Discount type">
                      <select id="coupon-type" className={inputClass} value={formData.type} onChange={(e) => updateField('type', e.target.value)}>
                        <option>Percentage</option>
                        <option>Fixed</option>
                      </select>
                    </Field>

                    <Field id="coupon-value" label={formData.type === 'Percentage' ? 'Value (%)' : 'Value (₹)'} required>
                      <input id="coupon-value" type="number" required min="1" max={formData.type === 'Percentage' ? 100 : undefined} step="0.01" className={inputClass} value={formData.value} onChange={(e) => updateField('value', e.target.value)} placeholder="20" />
                    </Field>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-500">Quick values:</span>
                    {['10', '20', '30', '50'].map((val) => (
                      <button key={val} type="button" onClick={() => updateField('value', val)} className="rounded bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700 hover:bg-gray-200">{val}{formData.type === 'Percentage' ? '%' : '₹'}</button>
                    ))}
                  </div>

                  <Field id="coupon-minimum" label="Minimum order value (₹)" required hint="Minimum cart subtotal">
                    <input id="coupon-minimum" type="number" required min="0" step="0.01" className={inputClass} value={formData.minOrder} onChange={(e) => updateField('minOrder', e.target.value)} placeholder="499" />
                  </Field>

                  <Field id="coupon-expiry" label="Expiry date" required>
                    <input id="coupon-expiry" type="date" required min={editId ? undefined : today} className={inputClass} value={formData.expiry} onChange={(e) => updateField('expiry', e.target.value)} />
                  </Field>

                  <Field id="coupon-status" label="Status">
                    <select id="coupon-status" className={inputClass} value={formData.status} onChange={(e) => updateField('status', e.target.value)}>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </Field>
                </form>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/70">
                <button type="button" onClick={() => closeForm()} disabled={isSaving} className="rounded-lg px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
                <button type="submit" form="coupon-form" disabled={isSaving} className="flex min-w-32 items-center justify-center gap-2 rounded-lg bg-[#03a685] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#028a6f] shadow-md disabled:opacity-60">
                  {isSaving ? <LoaderCircle className="animate-spin" size={17} /> : editId ? 'Update Coupon' : 'Save Coupon'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm" aria-label="Coupon list"><DataState loading={loading} error={error} onRetry={fetchCoupons} isEmpty={!loading && !error && filteredCoupons.length === 0} icon={Tag} loadingText="Loading coupons…" emptyTitle={search || statusFilter !== 'All' ? 'No matching coupons' : 'No coupons yet'} emptyText="Try changing the search or status filter."><><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[850px] text-left"><thead><tr className="border-b border-gray-100 bg-gray-50/70"><th className="p-4 pl-6 text-xs font-bold uppercase tracking-wider text-gray-500">Code</th><th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Reward</th><th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Condition</th><th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Expiry</th><th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th><th className="p-4 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{visibleCoupons.map((coupon) => <tr key={coupon.id} className="hover:bg-gray-50/70"><td className="p-4 pl-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff3f6c]/10 text-[#ff3f6c]"><Tag size={18} /></div><p className="text-sm font-black tracking-wide text-[#282c3f]">{coupon.code}</p></div></td><td className="p-4 text-sm font-black text-[#ff3f6c]">{reward(coupon)}</td><td className="p-4 text-sm text-gray-600">Spend at least <strong>{formatCurrency(coupon.min_order_value)}</strong></td><td className="p-4"><p className="flex items-center gap-1.5 text-sm text-gray-600"><Clock size={14} className="text-gray-400" />{formatDate(coupon.expiry_date)}</p></td><td className="p-4"><StatusBadge coupon={coupon} /></td><td className="p-4 pr-6"><div className="flex justify-end gap-2"><button type="button" onClick={() => openForm(coupon)} className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600" aria-label={`Edit ${coupon.code}`}><Edit2 size={17} /></button><button type="button" onClick={() => setDeleteTarget(coupon)} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${coupon.code}`}><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div><div className="divide-y divide-gray-100 md:hidden">{visibleCoupons.map((coupon) => <article key={coupon.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black tracking-wide text-[#282c3f]">{coupon.code}</p><p className="mt-1 text-lg font-black text-[#ff3f6c]">{reward(coupon)}</p></div><StatusBadge coupon={coupon} /></div><p className="mt-3 text-sm text-gray-600">Minimum spend: <strong>{formatCurrency(coupon.min_order_value)}</strong></p><p className="mt-1 text-xs text-gray-400">Expires {formatDate(coupon.expiry_date)}</p><div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3"><button type="button" onClick={() => openForm(coupon)} className="rounded-lg p-2 text-blue-600" aria-label={`Edit ${coupon.code}`}><Edit2 size={18} /></button><button type="button" onClick={() => setDeleteTarget(coupon)} className="rounded-lg p-2 text-red-600" aria-label={`Delete ${coupon.code}`}><Trash2 size={18} /></button></div></article>)}</div><Pagination currentPage={currentPage} pageSize={PAGE_SIZE} totalItems={filteredCoupons.length} onPageChange={setCurrentPage} label="coupons" /></></DataState></section>
      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete coupon?" description={`Coupon “${deleteTarget?.code || ''}” will stop being available and will be permanently removed.`} confirmLabel="Delete coupon" busy={isDeleting} onCancel={() => setDeleteTarget(null)} onConfirm={deleteCoupon} />
    </div>
  );
};

export default AdminDiscount;

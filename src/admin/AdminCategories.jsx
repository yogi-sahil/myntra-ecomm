import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Edit2, FolderTree, LoaderCircle, Plus, Trash2, X, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog, DataState, Field, Pagination, SearchField, inputClass } from './AdminUI';
import { useAdminToast } from './AdminToastContext';
import { API_BASE, getApiError, getAuthHeaders, paginate } from './adminUtils';

const emptyForm = { name: '', slug: '', status: 'Active' };
const PAGE_SIZE = 10;
const makeSlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const AdminCategories = () => {
  const { token } = useAuth();
  const notify = useAdminToast();
  const formRef = useRef(null);
  const nameRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_BASE}/categories`);
      if (!response.ok) throw new Error(await getApiError(response, 'Categories could not be loaded.'));
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message || 'Categories could not be loaded.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  // Keyboard shortcut Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showForm) return;
      if (e.key === 'Escape') closeForm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories.filter((category) => (!query || `${category.name} ${category.slug}`.toLowerCase().includes(query)) && (statusFilter === 'All' || category.status === statusFilter));
  }, [categories, search, statusFilter]);
  const visibleCategories = paginate(filteredCategories, currentPage, PAGE_SIZE);

  const openForm = (category = null) => {
    setEditId(category?.id || null);
    setFormData(category ? { name: category.name, slug: category.slug, status: category.status } : emptyForm);
    setSlugEdited(Boolean(category)); setFormError(''); setShowForm(true);
    window.setTimeout(() => { nameRef.current?.focus(); }, 50);
  };
  const closeForm = (force = false) => { if (isSaving && !force) return; setShowForm(false); setEditId(null); setFormData(emptyForm); setFormError(''); setSlugEdited(false); };

  const handleSave = async (event) => {
    event.preventDefault(); setIsSaving(true); setFormError('');
    try {
      const response = await fetch(`${API_BASE}/admin/categories${editId ? `/${editId}` : ''}`, { method: editId ? 'PUT' : 'POST', headers: getAuthHeaders(token, true), body: JSON.stringify(formData) });
      if (!response.ok) throw new Error(await getApiError(response, 'Category could not be saved.'));
      notify(`Category ${editId ? 'updated' : 'created'} successfully.`); closeForm(true); await fetchCategories();
    } catch (err) { setFormError(err.message || 'Category could not be saved.'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/admin/categories/${deleteTarget.id}`, { method: 'DELETE', headers: getAuthHeaders(token) });
      if (!response.ok) throw new Error(await getApiError(response, 'Category could not be deleted.'));
      setCategories((current) => current.filter((category) => category.id !== deleteTarget.id)); setDeleteTarget(null); notify('Category deleted.');
    } catch (err) { notify(err.message || 'Category could not be deleted.', 'error'); }
    finally { setIsDeleting(false); }
  };

  const StatusBadge = ({ status }) => <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${status === 'Active' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>{status === 'Active' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}{status}</span>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div><h1 className="text-2xl font-black text-[#282c3f]">Categories</h1><p className="mt-1 text-sm text-gray-500">Organize catalogue navigation and control category availability.</p></div>
        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
          <SearchField value={search} onChange={setSearch} placeholder="Search categories…" label="Search categories" />
          <label htmlFor="category-status-filter" className="sr-only">Filter category status</label>
          <select id="category-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-600 outline-none focus:border-[#ff3f6c]"><option>All</option><option>Active</option><option>Inactive</option></select>
          <button type="button" onClick={() => showForm ? closeForm() : openForm()} className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#ff3f6c] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e73361]"><Plus size={18} /> {showForm ? 'Close form' : 'Add category'}</button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="category-drawer-title">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity" onClick={() => closeForm()} />
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md transform bg-white shadow-2xl transition-all flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/70">
                <div>
                  <h2 id="category-drawer-title" className="text-xl font-black text-[#282c3f]">{editId ? 'Edit Category' : 'Add New Category'}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-[10px] font-bold">Esc</kbd> to close</p>
                </div>
                <button type="button" onClick={() => closeForm()} className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {formError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{formError}</div>}
                
                <form id="category-form" onSubmit={handleSave} className="space-y-4">
                  <Field id="category-name" label="Category name" required>
                    <input ref={nameRef} id="category-name" required className={inputClass} value={formData.name} onChange={(e) => { const name = e.target.value; setFormData((current) => ({ ...current, name, slug: slugEdited ? current.slug : makeSlug(name) })); }} placeholder="Footwear" />
                  </Field>

                  <Field id="category-slug" label="URL slug" required hint={`Storefront path: /${formData.slug || 'category-name'}`}>
                    <div className="flex gap-2">
                      <input id="category-slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={inputClass} value={formData.slug} onChange={(e) => { setSlugEdited(true); setFormData((current) => ({ ...current, slug: makeSlug(e.target.value) })); }} />
                      <button type="button" onClick={() => setFormData((current) => ({ ...current, slug: makeSlug(current.name) }))} className="shrink-0 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200">Auto</button>
                    </div>
                  </Field>

                  <Field id="category-status" label="Status">
                    <select id="category-status" className={inputClass} value={formData.status} onChange={(e) => setFormData((current) => ({ ...current, status: e.target.value }))}>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </Field>
                </form>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/70">
                <button type="button" onClick={() => closeForm()} disabled={isSaving} className="rounded-lg px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
                <button type="submit" form="category-form" disabled={isSaving} className="flex min-w-32 items-center justify-center gap-2 rounded-lg bg-[#03a685] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#028a6f] shadow-md disabled:opacity-60">
                  {isSaving ? <LoaderCircle className="animate-spin" size={17} /> : editId ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm" aria-label="Category list">
        <DataState loading={loading} error={error} onRetry={fetchCategories} isEmpty={!loading && !error && filteredCategories.length === 0} icon={FolderTree} loadingText="Loading categories…" emptyTitle={search || statusFilter !== 'All' ? 'No matching categories' : 'No categories yet'} emptyText="Try changing the search or status filter.">
          <>
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="p-4 pl-6 text-xs font-bold uppercase tracking-wider text-gray-500">Category</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Storefront path</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="p-4 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50/70">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff3f6c]/10 text-[#ff3f6c]">
                            <FolderTree size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#282c3f]">{category.name}</p>
                            <p className="mt-0.5 text-xs text-gray-400">ID #{category.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">/{category.slug}</td>
                      <td className="p-4"><StatusBadge status={category.status} /></td>
                      <td className="p-4 pr-6">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openForm(category)} className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600" aria-label={`Edit ${category.name}`}><Edit2 size={17} /></button>
                          <button type="button" onClick={() => setDeleteTarget(category)} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${category.name}`}><Trash2 size={17} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 md:hidden">
              {visibleCategories.map((category) => (
                <article key={category.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff3f6c]/10 text-[#ff3f6c]">
                      <FolderTree size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-[#282c3f]">{category.name}</p>
                      <p className="mt-1 truncate text-sm text-gray-500">/{category.slug}</p>
                      <div className="mt-3"><StatusBadge status={category.status} /></div>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => openForm(category)} className="rounded-lg p-2 text-blue-600" aria-label={`Edit ${category.name}`}><Edit2 size={18} /></button>
                      <button type="button" onClick={() => setDeleteTarget(category)} className="rounded-lg p-2 text-red-600" aria-label={`Delete ${category.name}`}><Trash2 size={18} /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <Pagination currentPage={currentPage} pageSize={PAGE_SIZE} totalItems={filteredCategories.length} onPageChange={setCurrentPage} label="categories" />
          </>
        </DataState>
      </section>

      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete category?" description={`“${deleteTarget?.name || ''}” will be removed. Products using this category will not be reassigned automatically.`} confirmLabel="Delete category" busy={isDeleting} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default AdminCategories;

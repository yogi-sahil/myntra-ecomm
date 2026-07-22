import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoaderCircle, Plus, Shield, Trash2, User as UserIcon, UserPlus, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog, DataState, Field, Pagination, SearchField, inputClass } from './AdminUI';
import { useAdminToast } from './AdminToastContext';
import { API_BASE, formatDate, getApiError, getAuthHeaders, paginate } from './adminUtils';

const PAGE_SIZE = 10;
const emptyForm = { name: '', email: '', mobile: '', password: '', role: 'customer' };

const RoleBadge = ({ role }) => <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${role === 'admin' ? 'bg-[#ff3f6c]/10 text-[#ff3f6c]' : 'bg-gray-100 text-gray-600'}`}>{role === 'admin' ? <Shield size={13} /> : <UserIcon size={13} />}{role}</span>;

const AdminUsers = () => {
  const { token, user: currentUser } = useAuth();
  const notify = useAdminToast();
  const formRef = useRef(null);
  const nameRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingRole, setPendingRole] = useState(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders(token) });
      if (!response.ok) throw new Error(await getApiError(response, 'Users could not be loaded.'));
      const data = await response.json(); setUsers(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message || 'Users could not be loaded.'); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setCurrentPage(1); setSelectedIds([]); }, [search, roleFilter]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => (!query || [user.name, user.email, user.mobile, user.id].some((value) => String(value || '').toLowerCase().includes(query))) && (roleFilter === 'All' || user.role === roleFilter.toLowerCase()));
  }, [users, search, roleFilter]);
  const visibleUsers = paginate(filteredUsers, currentPage, PAGE_SIZE);

  const toggleSelectAll = () => {
    const deletableVisible = visibleUsers.filter((u) => u.id !== currentUser?.id);
    if (selectedIds.length === deletableVisible.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(deletableVisible.map((u) => u.id));
    }
  };

  const toggleSelectId = (id) => {
    if (id === currentUser?.id) return;
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const openForm = () => { setFormData(emptyForm); setFormError(''); setShowForm(true); window.setTimeout(() => { formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); nameRef.current?.focus(); }, 50); };
  const closeForm = (force = false) => { if (isSaving && !force) return; setShowForm(false); setFormData(emptyForm); setFormError(''); };
  const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

  const handleCreate = async (event) => {
    event.preventDefault();
    if (formData.password.length < 8) { setFormError('Password must be at least 8 characters.'); return; }
    setIsSaving(true); setFormError('');
    try {
      const response = await fetch(`${API_BASE}/admin/users`, { method: 'POST', headers: getAuthHeaders(token, true), body: JSON.stringify(formData) });
      if (!response.ok) throw new Error(await getApiError(response, 'User could not be created.'));
      const createdUser = await response.json(); setUsers((current) => [createdUser, ...current]); closeForm(true); notify(`${createdUser.name} was added.`);
    } catch (err) { setFormError(err.message || 'User could not be created.'); }
    finally { setIsSaving(false); }
  };

  const updateRole = async () => {
    setIsUpdatingRole(true);
    try {
      const response = await fetch(`${API_BASE}/admin/users/${pendingRole.user.id}/role`, { method: 'PUT', headers: getAuthHeaders(token, true), body: JSON.stringify({ role: pendingRole.role }) });
      if (!response.ok) throw new Error(await getApiError(response, 'User role could not be updated.'));
      setUsers((current) => current.map((user) => user.id === pendingRole.user.id ? { ...user, role: pendingRole.role } : user)); notify(`${pendingRole.user.name} is now ${pendingRole.role === 'admin' ? 'an admin' : 'a customer'}.`); setPendingRole(null);
    } catch (err) { notify(err.message || 'User role could not be updated.', 'error'); }
    finally { setIsUpdatingRole(false); }
  };

  const deleteUser = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/admin/users/${deleteTarget.id}`, { method: 'DELETE', headers: getAuthHeaders(token) });
      if (!response.ok) throw new Error(await getApiError(response, 'User could not be deleted.'));
      setUsers((current) => current.filter((user) => user.id !== deleteTarget.id)); notify('User deleted.'); setDeleteTarget(null);
    } catch (err) { notify(err.message || 'User could not be deleted.', 'error'); }
    finally { setIsDeleting(false); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    setIsBulkDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/admin/users/bulk-delete`, {
        method: 'POST',
        headers: getAuthHeaders(token, true),
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!response.ok) throw new Error(await getApiError(response, 'Bulk user deletion failed.'));
      const data = await response.json();
      setUsers((current) => current.filter((user) => !selectedIds.includes(user.id)));
      setSelectedIds([]);
      notify(data.message || 'Selected users deleted.');
      setShowBulkConfirm(false);
    } catch (err) { notify(err.message || 'Bulk user deletion failed.', 'error'); }
    finally { setIsBulkDeleting(false); }
  };

  const RoleSelect = ({ account }) => <><label className="sr-only" htmlFor={`user-role-${account.id}`}>Role for {account.name}</label><select id={`user-role-${account.id}`} value={account.role} disabled={account.id === currentUser?.id} onChange={(e) => setPendingRole({ user: account, role: e.target.value })} className="rounded-lg border border-gray-200 bg-white p-2 text-xs font-bold uppercase text-gray-600 outline-none focus:border-[#ff3f6c] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"><option value="customer">Customer</option><option value="admin">Admin</option></select></>;

  // Keyboard shortcut Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showForm) return;
      if (e.key === 'Escape') closeForm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div><h1 className="text-2xl font-black text-[#282c3f]">Users</h1><p className="mt-1 text-sm text-gray-500">Manage customer accounts and administrative access.</p></div>
        <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
          {selectedIds.length > 0 && (
            <button type="button" onClick={() => setShowBulkConfirm(true)} className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">
              <Trash2 size={17} /> Delete selected ({selectedIds.length})
            </button>
          )}
          <SearchField value={search} onChange={setSearch} placeholder="Search name, email, mobile…" label="Search users" />
          <label className="sr-only" htmlFor="user-role-filter">Filter by role</label>
          <select id="user-role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-600 outline-none focus:border-[#ff3f6c]"><option>All</option><option>Customer</option><option>Admin</option></select>
          <button type="button" onClick={() => showForm ? closeForm() : openForm()} className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#ff3f6c] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e73361]"><UserPlus size={18} /> Add user</button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="user-drawer-title">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity" onClick={() => closeForm()} />
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md transform bg-white shadow-2xl transition-all flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/70">
                <div>
                  <h2 id="user-drawer-title" className="text-xl font-black text-[#282c3f]">Add New User</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-[10px] font-bold">Esc</kbd> to close</p>
                </div>
                <button type="button" onClick={() => closeForm()} className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {formError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{formError}</div>}
                
                <form id="user-form" onSubmit={handleCreate} className="space-y-4">
                  <Field id="user-name" label="Full name" required>
                    <input ref={nameRef} id="user-name" required className={inputClass} value={formData.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Rahul Kumar" />
                  </Field>

                  <Field id="user-email" label="Email" required>
                    <input id="user-email" type="email" required autoComplete="off" className={inputClass} value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="rahul@example.com" />
                  </Field>

                  <Field id="user-mobile" label="Mobile number" required>
                    <input id="user-mobile" type="tel" required pattern="[0-9+ ()-]{7,20}" className={inputClass} value={formData.mobile} onChange={(e) => updateField('mobile', e.target.value)} placeholder="9876543210" />
                  </Field>

                  <Field id="user-password" label="Temporary password" required hint="At least 8 characters">
                    <input id="user-password" type="password" required minLength="8" autoComplete="new-password" className={inputClass} value={formData.password} onChange={(e) => updateField('password', e.target.value)} />
                  </Field>

                  <Field id="user-role" label="Account role" required hint="Admins get full administration access">
                    <select id="user-role" className={inputClass} value={formData.role} onChange={(e) => updateField('role', e.target.value)}>
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </Field>
                </form>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/70">
                <button type="button" onClick={() => closeForm()} disabled={isSaving} className="rounded-lg px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-50">Cancel</button>
                <button type="submit" form="user-form" disabled={isSaving} className="flex min-w-32 items-center justify-center gap-2 rounded-lg bg-[#03a685] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#028a6f] shadow-md disabled:opacity-60">
                  {isSaving ? <LoaderCircle className="animate-spin" size={17} /> : <><Plus size={17} /> Create User</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm" aria-label="User list">
        <DataState loading={loading} error={error} onRetry={fetchUsers} isEmpty={!loading && !error && filteredUsers.length === 0} icon={Users} loadingText="Loading users…" emptyTitle={search || roleFilter !== 'All' ? 'No matching users' : 'No users yet'} emptyText="Try changing the search or role filter.">
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="p-4 pl-6 w-10">
                      <input type="checkbox" checked={visibleUsers.length > 0 && selectedIds.length === visibleUsers.filter(u=>u.id!==currentUser?.id).length} onChange={toggleSelectAll} className="rounded border-gray-300 text-[#ff3f6c]" />
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Contact</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Role</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Joined</th>
                    <th className="p-4 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleUsers.map((account) => (
                    <tr key={account.id} className={`hover:bg-gray-50/70 ${selectedIds.includes(account.id) ? 'bg-[#ff3f6c]/5' : ''}`}>
                      <td className="p-4 pl-6">
                        <input type="checkbox" disabled={account.id === currentUser?.id} checked={selectedIds.includes(account.id)} onChange={() => toggleSelectId(account.id)} className="rounded border-gray-300 text-[#ff3f6c] disabled:opacity-30" />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white ${account.role === 'admin' ? 'bg-[#ff3f6c]' : 'bg-gray-400'}`}>
                            {(account.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#282c3f]">{account.name}{account.id === currentUser?.id && <span className="ml-2 text-xs font-semibold text-gray-400">You</span>}</p>
                            <p className="mt-0.5 text-xs text-gray-400">ID #{account.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-700">{account.email || 'No email'}</p>
                        <p className="mt-1 text-xs text-gray-500">{account.mobile || 'No mobile'}</p>
                      </td>
                      <td className="p-4"><RoleBadge role={account.role} /></td>
                      <td className="p-4 text-sm text-gray-600">{formatDate(account.created_at)}</td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <RoleSelect account={account} />
                          <button type="button" disabled={account.id === currentUser?.id} onClick={() => setDeleteTarget(account)} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Delete ${account.name}`}><Trash2 size={17} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 md:hidden">
              {visibleUsers.map((account) => (
                <article key={account.id} className="p-4">
                  <div className="flex gap-3">
                    <input type="checkbox" disabled={account.id === currentUser?.id} checked={selectedIds.includes(account.id)} onChange={() => toggleSelectId(account.id)} className="mt-1 rounded border-gray-300 text-[#ff3f6c] disabled:opacity-30" />
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-black text-white ${account.role === 'admin' ? 'bg-[#ff3f6c]' : 'bg-gray-400'}`}>
                      {(account.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-[#282c3f]">{account.name}{account.id === currentUser?.id && <span className="ml-2 text-xs text-gray-400">You</span>}</p>
                      <p className="mt-1 truncate text-sm text-gray-500">{account.email}</p>
                      <div className="mt-3"><RoleBadge role={account.role} /></div>
                    </div>
                    {account.id !== currentUser?.id && <button type="button" onClick={() => setDeleteTarget(account)} className="h-fit rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${account.name}`}><Trash2 size={18} /></button>}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400">Joined {formatDate(account.created_at)}</p>
                    <RoleSelect account={account} />
                  </div>
                </article>
              ))}
            </div>

            <Pagination currentPage={currentPage} pageSize={PAGE_SIZE} totalItems={filteredUsers.length} onPageChange={setCurrentPage} label="users" />
          </>
        </DataState>
      </section>

      <ConfirmDialog open={Boolean(pendingRole)} title={pendingRole?.role === 'admin' ? 'Grant admin access?' : 'Remove admin access?'} description={pendingRole?.role === 'admin' ? `${pendingRole?.user.name} will be able to manage products, orders, users, discounts, and store credentials.` : `${pendingRole?.user.name} will immediately lose access to the administration workspace.`} confirmLabel={pendingRole?.role === 'admin' ? 'Grant access' : 'Remove access'} tone="warning" busy={isUpdatingRole} onCancel={() => setPendingRole(null)} onConfirm={updateRole} />
      <ConfirmDialog open={Boolean(deleteTarget)} title="Delete user?" description={`“${deleteTarget?.name || ''}” will be permanently removed. Their order history may prevent deletion or remain linked for reporting.`} confirmLabel="Delete user" busy={isDeleting} onCancel={() => setDeleteTarget(null)} onConfirm={deleteUser} />
      <ConfirmDialog open={showBulkConfirm} title="Delete selected users?" description={`You are about to delete ${selectedIds.length} user(s). Users with order history will not be deleted.`} confirmLabel="Delete selected" tone="warning" busy={isBulkDeleting} onCancel={() => setShowBulkConfirm(false)} onConfirm={handleBulkDelete} />
    </div>
  );
};

export default AdminUsers;

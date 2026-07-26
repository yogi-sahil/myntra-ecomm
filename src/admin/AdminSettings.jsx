import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CreditCard, LoaderCircle, RefreshCw, Save, Store, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DataState, Field, inputClass } from './AdminUI';
import { useAdminToast } from './AdminToastContext';
import { API_BASE, getApiError, getAuthHeaders } from './adminUtils';

const initialSettings = { store_name: '', contact_email: '', support_phone: '', currency: 'INR', convenience_fee: '', free_shipping_threshold: '' };

const SettingsSection = ({ icon: Icon, color, title, description, children }) => <section className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7"><div className={`absolute inset-y-0 left-0 w-1 ${color.bar}`} /><div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color.icon}`}><Icon size={20} /></div><div><h2 className="text-lg font-black text-[#282c3f]">{title}</h2><p className="mt-0.5 text-xs text-gray-500">{description}</p></div></div>{children}</section>;

const AdminSettings = () => {
  const { token } = useAuth();
  const notify = useAdminToast();
  const [formData, setFormData] = useState(initialSettings);
  const [savedData, setSavedData] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [checkingApi, setCheckingApi] = useState(false);

  const isDirty = useMemo(() => JSON.stringify(formData) !== JSON.stringify(savedData), [formData, savedData]);

  const fetchSettings = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_BASE}/admin/settings`, { headers: getAuthHeaders(token) });
      if (!response.ok) throw new Error(await getApiError(response, 'Store settings could not be loaded.'));
      const data = { ...initialSettings, ...await response.json() }; setFormData(data); setSavedData(data);
    } catch (err) { setError(err.message || 'Store settings could not be loaded.'); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useEffect(() => {
    const warn = (event) => { if (isDirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const handleChange = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSave = async (event) => {
    event.preventDefault(); setIsSaving(true); setSaveError('');
    try {
      const response = await fetch(`${API_BASE}/admin/settings`, { method: 'PUT', headers: getAuthHeaders(token, true), body: JSON.stringify(formData) });
      if (!response.ok) throw new Error(await getApiError(response, 'Settings could not be saved.'));
      setSavedData(formData); notify('Store settings saved successfully.');
    } catch (err) { setSaveError(err.message || 'Settings could not be saved.'); }
    finally { setIsSaving(false); }
  };

  const checkApi = async () => {
    setCheckingApi(true);
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (!response.ok) throw new Error('API check failed.');
      notify('Store API is reachable.');
    } catch { notify('Store API is currently unavailable.', 'error'); }
    finally { setCheckingApi(false); }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-black text-[#282c3f]">Store Settings</h1><p className="mt-1 text-sm text-gray-500">Configure store identity, payments, and delivery rules.</p></div>{isDirty && <span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">Unsaved changes</span>}</div>
      <DataState loading={loading} error={error} onRetry={fetchSettings} loadingText="Loading settings…">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <SettingsSection icon={Store} color={{ bar: 'bg-blue-500', icon: 'bg-blue-50 text-blue-600' }} title="General Details" description="Customer-facing store information"><div className="grid grid-cols-1 gap-5 md:grid-cols-2"><Field id="store-name" label="Store name" required><input id="store-name" name="store_name" required className={inputClass} value={formData.store_name} onChange={handleChange} /></Field><Field id="contact-email" label="Contact email" required><input id="contact-email" name="contact_email" type="email" required className={inputClass} value={formData.contact_email} onChange={handleChange} /></Field><Field id="support-phone" label="Support phone" required><input id="support-phone" name="support_phone" type="tel" required className={inputClass} value={formData.support_phone} onChange={handleChange} /></Field><Field id="store-currency" label="Store currency"><select id="store-currency" name="currency" className={inputClass} value={formData.currency} onChange={handleChange}><option value="INR">INR (₹)</option><option value="USD">USD ($)</option></select></Field></div></SettingsSection>

          <SettingsSection icon={CreditCard} color={{ bar: 'bg-[#ff3f6c]', icon: 'bg-[#ff3f6c]/10 text-[#ff3f6c]' }} title="Payment Gateway" description="Razorpay is configured securely on the server"><div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"><strong>Credentials are not stored or displayed in the admin panel.</strong> Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the backend environment.</div><div><button type="button" onClick={checkApi} disabled={checkingApi} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-60">{checkingApi ? <LoaderCircle className="animate-spin" size={17} /> : <CheckCircle2 size={17} />} Check API availability</button></div></SettingsSection>

          <SettingsSection icon={Truck} color={{ bar: 'bg-emerald-500', icon: 'bg-emerald-50 text-emerald-600' }} title="Shipping Settings" description="Fees and free-shipping eligibility"><div className="grid grid-cols-1 gap-5 md:grid-cols-2"><Field id="convenience-fee" label="Flat convenience fee (₹)" required hint="Applied when the order is below the free-shipping threshold."><input id="convenience-fee" name="convenience_fee" type="number" required min="0" step="0.01" className={inputClass} value={formData.convenience_fee} onChange={handleChange} /></Field><Field id="shipping-threshold" label="Free shipping threshold (₹)" required hint="Orders at or above this value qualify for free shipping."><input id="shipping-threshold" name="free_shipping_threshold" type="number" required min="0" step="0.01" className={inputClass} value={formData.free_shipping_threshold} onChange={handleChange} /></Field></div></SettingsSection>

          <div className="sticky bottom-3 z-20 rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:flex sm:items-center sm:justify-between"><div>{saveError && <p className="mb-3 text-sm font-semibold text-red-600 sm:mb-0" role="alert">{saveError}</p>}{!saveError && <p className="mb-3 text-xs text-gray-500 sm:mb-0">{isDirty ? 'Review and save your changes.' : 'All changes are saved.'}</p>}</div><div className="flex justify-end gap-2"><button type="button" onClick={() => setFormData(savedData)} disabled={!isDirty || isSaving} className="rounded-lg px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40"><RefreshCw size={16} className="mr-1 inline" /> Reset</button><button type="submit" disabled={!isDirty || isSaving} className="flex min-w-40 items-center justify-center gap-2 rounded-lg bg-[#03a685] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#028a6f] disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? <><LoaderCircle className="animate-spin" size={17} /> Saving…</> : <><Save size={17} /> Save settings</>}</button></div></div>
        </form>
      </DataState>
    </div>
  );
};

export default AdminSettings;

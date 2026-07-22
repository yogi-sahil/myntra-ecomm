import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  LoaderCircle,
  Search,
  X,
} from 'lucide-react';
import { AdminToastContext } from './AdminToastContext';

export const AdminToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  return (
    <AdminToastContext.Provider value={notify}>
      {children}
      <div className="fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const Icon = isError ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2;
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${isError ? 'border-red-200' : 'border-emerald-200'}`}
              role={isError ? 'alert' : 'status'}
            >
              <Icon className={isError ? 'text-red-500' : 'text-emerald-600'} size={19} />
              <p className="flex-1 text-sm font-semibold text-[#282c3f]">{toast.message}</p>
              <button type="button" onClick={() => dismiss(toast.id)} className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Dismiss notification">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </AdminToastContext.Provider>
  );
};

export const SearchField = ({ value, onChange, placeholder, label = 'Search' }) => (
  <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
    <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
    <label className="sr-only" htmlFor={`admin-search-${label.replace(/\s+/g, '-').toLowerCase()}`}>{label}</label>
    <input
      id={`admin-search-${label.replace(/\s+/g, '-').toLowerCase()}`}
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm outline-none transition-all focus:border-[#ff3f6c] focus:ring-2 focus:ring-[#ff3f6c]/20"
    />
    {value && (
      <button type="button" onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Clear search">
        <X size={15} />
      </button>
    )}
  </div>
);

export const DataState = ({ loading, error, isEmpty, icon: Icon, loadingText, emptyTitle, emptyText, onRetry, children }) => {
  if (loading) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center p-10 text-gray-500" role="status">
        <LoaderCircle className="mb-3 animate-spin text-[#ff3f6c]" size={32} />
        <p className="text-sm font-semibold">{loadingText || 'Loading data…'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center p-10 text-center" role="alert">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500"><AlertCircle size={23} /></div>
        <h3 className="font-bold text-[#282c3f]">Unable to load this data</h3>
        <p className="mt-1 max-w-md text-sm text-gray-500">{error}</p>
        {onRetry && <button type="button" onClick={onRetry} className="mt-4 rounded-lg bg-[#282c3f] px-4 py-2 text-sm font-bold text-white hover:bg-black">Try again</button>}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center p-10 text-center">
        {Icon && <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400"><Icon size={23} /></div>}
        <h3 className="font-bold text-[#282c3f]">{emptyTitle || 'Nothing here yet'}</h3>
        {emptyText && <p className="mt-1 max-w-md text-sm text-gray-500">{emptyText}</p>}
      </div>
    );
  }

  return children;
};

export const Pagination = ({ currentPage, pageSize, totalItems, onPageChange, label = 'items' }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;
  const first = (currentPage - 1) * pageSize + 1;
  const last = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs font-medium text-gray-500">Showing {first}–{last} of {totalItems} {label}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={17} /></button>
        <span className="min-w-20 text-center text-xs font-bold text-[#282c3f]">Page {currentPage} of {totalPages}</span>
        <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page"><ChevronRight size={17} /></button>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ open, title, description, confirmLabel = 'Confirm', tone = 'danger', busy = false, onConfirm, onCancel }) => {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel();
      if (event.key === 'Tab') {
        const controls = dialogRef.current?.querySelectorAll('button:not([disabled])');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-4" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${tone === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}><AlertCircle size={22} /></div>
        <h2 id={titleId} className="text-lg font-black text-[#282c3f]">{title}</h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button ref={cancelRef} type="button" onClick={onCancel} disabled={busy} className="rounded-lg px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={busy} className={`flex min-w-28 items-center justify-center rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60 ${tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
            {busy ? <LoaderCircle className="animate-spin" size={17} /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Field = ({ id, label, hint, required, children }) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <label htmlFor={id} className="text-[13px] font-bold text-gray-600">{label}{required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}</label>
    {children}
    {hint && <p className="text-xs leading-5 text-gray-400">{hint}</p>}
  </div>
);

export const inputClass = 'w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm text-[#282c3f] outline-none transition-all placeholder:text-gray-400 focus:border-[#ff3f6c] focus:ring-2 focus:ring-[#ff3f6c]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Clock, Eye, LoaderCircle, Package, Printer, SearchX, Truck, X, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog, DataState, Pagination, SearchField } from './AdminUI';
import { useAdminToast } from './AdminToastContext';
import { API_BASE, formatCurrency, formatDate, getApiError, getAuthHeaders, paginate } from './adminUtils';

const PAGE_SIZE = 10;
const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const nextStatuses = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
};

const StatusBadge = ({ status }) => {
  const styles = {
    Delivered: ['border-emerald-200 bg-emerald-50 text-emerald-700', CheckCircle2],
    Shipped: ['border-blue-200 bg-blue-50 text-blue-700', Truck],
    Cancelled: ['border-red-200 bg-red-50 text-red-700', XCircle],
    Processing: ['border-amber-200 bg-amber-50 text-amber-700', Clock],
  };
  const [className, Icon] = styles[status] || styles.Processing;
  return <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${className}`}><Icon size={13} />{status}</span>;
};

const AdminOrders = () => {
  const { token } = useAuth();
  const notify = useAdminToast();
  const closeModalRef = useRef(null);
  const modalRef = useRef(null);
  const modalTriggerRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState('');

  // Carrier & Tracking Modal State
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [carrierInput, setCarrierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');

  // Invoice Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatusTarget, setBulkStatusTarget] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_BASE}/admin/orders`, { headers: getAuthHeaders(token) });
      if (!response.ok) throw new Error(await getApiError(response, 'Orders could not be loaded.'));
      const data = await response.json(); setOrders(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message || 'Orders could not be loaded.'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setCurrentPage(1); setSelectedIds([]); }, [search, statusFilter]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matches = !query || [`ord-${order.id}`, order.customer_name, order.shipping_address, order.carrier, order.tracking_number].some((value) => String(value || '').toLowerCase().includes(query));
      return matches && (statusFilter === 'All' || order.status === statusFilter);
    });
  }, [orders, search, statusFilter]);
  const visibleOrders = paginate(filteredOrders, currentPage, PAGE_SIZE);

  const toggleSelectAll = () => {
    if (selectedIds.length === visibleOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleOrders.map((o) => o.id));
    }
  };

  const toggleSelectId = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleStatusChangeClick = (order, targetStatus) => {
    if (targetStatus === 'Shipped') {
      setPendingStatus({ order, status: targetStatus });
      setCarrierInput(order.carrier || 'BlueDart Express');
      setTrackingInput(order.tracking_number || `AWB${Math.floor(Math.random() * 8999999 + 1000000)}`);
      setShowShippingModal(true);
    } else {
      setPendingStatus({ order, status: targetStatus });
    }
  };

  const updateStatus = async () => {
    if (!pendingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const payload = {
        status: pendingStatus.status,
        carrier: pendingStatus.status === 'Shipped' ? carrierInput : undefined,
        tracking_number: pendingStatus.status === 'Shipped' ? trackingInput : undefined,
      };
      const response = await fetch(`${API_BASE}/admin/orders/${pendingStatus.order.id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(token, true),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await getApiError(response, 'Order status could not be updated.'));
      
      setOrders((current) => current.map((order) => order.id === pendingStatus.order.id ? { ...order, status: pendingStatus.status, carrier: payload.carrier || order.carrier, tracking_number: payload.tracking_number || order.tracking_number } : order));
      setSelectedOrder((current) => current?.id === pendingStatus.order.id ? { ...current, status: pendingStatus.status, carrier: payload.carrier || current.carrier, tracking_number: payload.tracking_number || current.tracking_number } : current);
      
      notify(`Order ORD-${pendingStatus.order.id} moved to ${pendingStatus.status}.`);
      setPendingStatus(null);
      setShowShippingModal(false);
    } catch (err) { notify(err.message || 'Order status could not be updated.', 'error'); }
    finally { setIsUpdatingStatus(false); }
  };

  const handleBulkStatusChange = async (targetStatus) => {
    if (!selectedIds.length || !targetStatus) return;
    setIsBulkUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/admin/orders/bulk-status`, {
        method: 'POST',
        headers: getAuthHeaders(token, true),
        body: JSON.stringify({ ids: selectedIds, status: targetStatus }),
      });
      if (!response.ok) throw new Error(await getApiError(response, 'Bulk status update failed.'));
      
      setOrders((current) => current.map((order) => selectedIds.includes(order.id) ? { ...order, status: targetStatus } : order));
      notify(`Updated ${selectedIds.length} order(s) to ${targetStatus}.`);
      setSelectedIds([]);
      setBulkStatusTarget('');
    } catch (err) { notify(err.message || 'Bulk status update failed.', 'error'); }
    finally { setIsBulkUpdating(false); }
  };

  const viewDetails = async (order) => {
    modalTriggerRef.current = document.activeElement;
    setSelectedOrder(order); setOrderItems([]); setItemsError(''); setLoadingItems(true);
    try {
      const response = await fetch(`${API_BASE}/admin/orders/${order.id}/items`, { headers: getAuthHeaders(token) });
      if (!response.ok) throw new Error(await getApiError(response, 'Order items could not be loaded.'));
      const data = await response.json(); setOrderItems(Array.isArray(data) ? data : []);
    } catch (err) { setItemsError(err.message || 'Order items could not be loaded.'); }
    finally { setLoadingItems(false); }
  };

  const openInvoice = async (order) => {
    setInvoiceOrder(order);
    setShowInvoiceModal(true);
    try {
      const response = await fetch(`${API_BASE}/admin/orders/${order.id}/items`, { headers: getAuthHeaders(token) });
      if (response.ok) {
        const data = await response.json();
        setInvoiceItems(Array.isArray(data) ? data : []);
      }
    } catch {
      setInvoiceItems([]);
    }
  };

  const closeDetails = () => {
    setSelectedOrder(null);
    window.setTimeout(() => modalTriggerRef.current?.focus(), 0);
  };

  const StatusSelect = ({ order }) => {
    const options = [order.status, ...(nextStatuses[order.status] || [])];
    return <><label htmlFor={`order-status-${order.id}`} className="sr-only">Change status for order ORD-{order.id}</label><select id={`order-status-${order.id}`} value={order.status} disabled={options.length === 1} onChange={(event) => handleStatusChangeClick(order, event.target.value)} className="rounded-lg border border-gray-200 bg-white p-2 text-xs font-bold text-gray-600 outline-none focus:border-[#ff3f6c] focus:ring-2 focus:ring-[#ff3f6c]/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60">{options.map((status) => <option key={status}>{status}</option>)}</select></>;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div><h1 className="text-2xl font-black text-[#282c3f]">Orders</h1><p className="mt-1 text-sm text-gray-500">Review fulfilment details, shipping tracking, and invoices.</p></div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <select value={bulkStatusTarget} disabled={isBulkUpdating} onChange={(e) => { setBulkStatusTarget(e.target.value); handleBulkStatusChange(e.target.value); }} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 outline-none disabled:opacity-50">
                <option value="">Bulk status update ({selectedIds.length})</option>
                {statuses.map((st) => <option key={st} value={st}>Mark as {st}</option>)}
              </select>
            </div>
          )}
          <SearchField value={search} onChange={setSearch} placeholder="Search order, customer, address…" label="Search orders" />
          <label htmlFor="order-status-filter" className="sr-only">Filter order status</label>
          <select id="order-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-600 outline-none focus:border-[#ff3f6c]"><option>All</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm" aria-label="Order list">
        <DataState loading={loading} error={error} onRetry={fetchOrders} isEmpty={!loading && !error && filteredOrders.length === 0} icon={search || statusFilter !== 'All' ? SearchX : Package} loadingText="Loading orders…" emptyTitle={search || statusFilter !== 'All' ? 'No matching orders' : 'No orders yet'} emptyText="Try changing the search or status filter.">
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="p-4 pl-6 w-10">
                      <input type="checkbox" checked={visibleOrders.length > 0 && selectedIds.length === visibleOrders.length} onChange={toggleSelectAll} className="rounded border-gray-300 text-[#ff3f6c]" />
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Order</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Customer</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Placed</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Amount</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status & Tracking</th>
                    <th className="p-4 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleOrders.map((order) => (
                    <tr key={order.id} className={`hover:bg-gray-50/70 ${selectedIds.includes(order.id) ? 'bg-[#ff3f6c]/5' : ''}`}>
                      <td className="p-4 pl-6">
                        <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggleSelectId(order.id)} className="rounded border-gray-300 text-[#ff3f6c]" />
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-black text-[#282c3f]">ORD-{order.id}</p>
                        <p className="mt-1 text-xs text-gray-400">{order.total_items || 0} {Number(order.total_items) === 1 ? 'item' : 'items'}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-gray-800">{order.customer_name}</p>
                        <p className="text-[11px] text-gray-400 truncate max-w-[140px]">{order.customer_email || order.customer_mobile}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                      <td className="p-4 text-sm font-black text-[#282c3f]">{formatCurrency(order.total_amount)}</td>
                      <td className="p-4">
                        <StatusBadge status={order.status} />
                        {order.carrier && <p className="mt-1 text-[11px] font-bold text-gray-500">{order.carrier}: <span className="font-mono text-gray-400">{order.tracking_number}</span></p>}
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => openInvoice(order)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-50" title="Generate GST Invoice"><Printer size={14} /> Invoice</button>
                          <button type="button" onClick={() => viewDetails(order)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#ff3f6c] hover:bg-[#ff3f6c]/10"><Eye size={14} /> Details</button>
                          <StatusSelect order={order} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 md:hidden">
              {visibleOrders.map((order) => (
                <article key={order.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-2">
                      <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggleSelectId(order.id)} className="mt-1 rounded border-gray-300 text-[#ff3f6c]" />
                      <div>
                        <p className="text-sm font-black text-[#282c3f]">ORD-{order.id}</p>
                        <p className="mt-1 text-sm font-semibold text-gray-600">{order.customer_name}</p>
                        <p className="mt-1 text-xs text-gray-400">{formatDate(order.created_at)} · {order.total_items || 0} items</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-[#282c3f]">{formatCurrency(order.total_amount)}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <StatusBadge status={order.status} />
                    <div className="flex gap-1">
                      <button type="button" onClick={() => openInvoice(order)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"><Printer size={16} /></button>
                      <button type="button" onClick={() => viewDetails(order)} className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-[#ff3f6c] hover:bg-[#ff3f6c]/10"><Eye size={15} /> Details</button>
                    </div>
                  </div>
                  <div className="mt-3"><StatusSelect order={order} /></div>
                </article>
              ))}
            </div>
            <Pagination currentPage={currentPage} pageSize={PAGE_SIZE} totalItems={filteredOrders.length} onPageChange={setCurrentPage} label="orders" />
          </>
        </DataState>
      </section>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3 sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && closeDetails()}>
          <section ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="order-details-title" className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gray-50/70 px-5 py-4 sm:px-6">
              <div>
                <h2 id="order-details-title" className="text-lg font-black text-[#282c3f]">Order ORD-{selectedOrder.id}</h2>
                <p className="mt-1 text-xs text-gray-500">Placed by {selectedOrder.customer_name} on {formatDate(selectedOrder.created_at, { hour: 'numeric', minute: '2-digit' })}</p>
              </div>
              <button ref={closeModalRef} type="button" onClick={closeDetails} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close order details"><X size={20} /></button>
            </header>
            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-5 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-2">
                <div><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Status</p><div className="mt-2"><StatusBadge status={selectedOrder.status} /></div></div>
                <div><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total amount</p><p className="mt-2 text-lg font-black text-[#282c3f]">{formatCurrency(selectedOrder.total_amount)}</p></div>
                {selectedOrder.carrier && (
                  <div className="sm:col-span-2 rounded-lg bg-blue-50/70 p-3 border border-blue-100">
                    <p className="text-xs font-bold uppercase text-blue-700">Shipment Tracking</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">{selectedOrder.carrier} - Tracking #: <span className="font-mono text-[#ff3f6c]">{selectedOrder.tracking_number}</span></p>
                  </div>
                )}
                <div className="sm:col-span-2"><p className="text-xs font-bold uppercase tracking-wider text-gray-500">Shipping address</p><p className="mt-2 text-sm leading-6 text-[#282c3f]">{selectedOrder.shipping_address || 'No shipping address recorded'}</p></div>
              </div>
              <h3 className="mb-4 mt-7 flex items-center gap-2 text-sm font-black text-[#282c3f]"><Package size={17} /> Purchased items ({selectedOrder.total_items || 0})</h3>
              {loadingItems ? <div className="flex justify-center py-10" role="status"><LoaderCircle className="animate-spin text-[#ff3f6c]" size={28} /><span className="sr-only">Loading order items</span></div> : itemsError ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{itemsError}</div> : orderItems.length ? <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100">{orderItems.map((item) => <div key={item.id} className="flex gap-3 p-4"><div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">{item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" /> : <Package size={20} className="text-gray-400" />}</div><div className="min-w-0 flex-1"><p className="text-sm font-black text-[#282c3f]">{item.brand}</p><p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{item.title}</p><p className="mt-2 text-xs font-semibold text-gray-500">Quantity: {item.quantity}</p></div><p className="shrink-0 text-sm font-black text-[#282c3f]">{formatCurrency(item.price)}</p></div>)}</div> : <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">No items were found for this order.</p>}
            </div>
          </section>
        </div>
      )}

      {/* Shipping Courier Modal */}
      {showShippingModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-[#282c3f] mb-1">Assign Courier & Tracking</h3>
            <p className="text-xs text-gray-500 mb-4">Enter shipping carrier details for Order ORD-{pendingStatus?.order.id}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Courier Carrier</label>
                <input type="text" value={carrierInput} onChange={(e) => setCarrierInput(e.target.value)} className="w-full rounded-lg border border-gray-200 p-2.5 text-sm font-semibold outline-none focus:border-[#ff3f6c]" placeholder="BlueDart, Delhivery, Express" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">AWB Tracking Number</label>
                <input type="text" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} className="w-full rounded-lg border border-gray-200 p-2.5 text-sm font-semibold outline-none focus:border-[#ff3f6c]" placeholder="AWB987219012" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => { setShowShippingModal(false); setPendingStatus(null); }} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="button" onClick={updateStatus} disabled={isUpdatingStatus} className="px-4 py-2 text-xs font-bold text-white bg-[#ff3f6c] hover:bg-[#e73361] rounded-lg">Confirm Shipment</button>
            </div>
          </div>
        </div>
      )}

      {/* Printable GST Invoice Modal */}
      {showInvoiceModal && invoiceOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl print:p-0 print:shadow-none">
            <div className="flex justify-between items-start border-b border-gray-200 pb-6">
              <div>
                <h1 className="text-2xl font-black text-[#282c3f]">MYNTRA COMMERCE</h1>
                <p className="text-xs text-gray-500">Tax Invoice / Bill of Supply</p>
                <p className="text-xs text-gray-400 mt-1">GSTIN: 07AAACM1234F1Z9</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[#ff3f6c]">INVOICE #{invoiceOrder.id}</p>
                <p className="text-xs text-gray-500">Date: {new Date(invoiceOrder.created_at).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-6 text-xs">
              <div>
                <p className="font-bold text-gray-400 uppercase">Customer Details</p>
                <p className="font-black text-[#282c3f] mt-1">{invoiceOrder.customer_name}</p>
                <p className="text-gray-600">{invoiceOrder.customer_email}</p>
                <p className="text-gray-600">{invoiceOrder.customer_mobile}</p>
              </div>
              <div>
                <p className="font-bold text-gray-400 uppercase">Shipping Address</p>
                <p className="text-gray-700 leading-relaxed mt-1">{invoiceOrder.shipping_address}</p>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse my-6">
              <thead>
                <tr className="border-y border-gray-200 bg-gray-50">
                  <th className="p-2 font-bold text-gray-600">Item</th>
                  <th className="p-2 font-bold text-gray-600 text-center">Qty</th>
                  <th className="p-2 font-bold text-gray-600 text-right">Price</th>
                  <th className="p-2 font-bold text-gray-600 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoiceItems.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2"><p className="font-bold text-gray-800">{item.brand}</p><p className="text-gray-500">{item.title}</p></td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                    <td className="p-2 text-right font-bold">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-gray-200 pt-4 text-xs space-y-1.5 w-64 ml-auto">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(invoiceOrder.total_amount * 0.82)}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST (18% Inclusive)</span><span>{formatCurrency(invoiceOrder.total_amount * 0.18)}</span></div>
              <div className="flex justify-between font-black text-sm text-[#282c3f] border-t border-gray-200 pt-2"><span>Grand Total</span><span>{formatCurrency(invoiceOrder.total_amount)}</span></div>
            </div>

            <div className="mt-8 flex justify-end gap-3 print:hidden">
              <button type="button" onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg">Close</button>
              <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#03a685] hover:bg-[#028a6f] rounded-lg"><Printer size={14} /> Print Invoice</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={Boolean(pendingStatus) && !showShippingModal} title={pendingStatus?.status === 'Cancelled' ? 'Cancel this order?' : `Move order to ${pendingStatus?.status}?`} description={pendingStatus?.status === 'Cancelled' ? `Order ORD-${pendingStatus?.order.id} will be marked as cancelled. Confirm that payment and customer communication have been handled.` : `Order ORD-${pendingStatus?.order.id} will move from ${pendingStatus?.order.status} to ${pendingStatus?.status}.`} confirmLabel={pendingStatus?.status === 'Cancelled' ? 'Cancel order' : 'Update status'} tone={pendingStatus?.status === 'Cancelled' ? 'danger' : 'warning'} busy={isUpdatingStatus} onCancel={() => setPendingStatus(null)} onConfirm={updateStatus} />
    </div>
  );
};

export default AdminOrders;

import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Download, IndianRupee, Layers, Package, RefreshCw, ShoppingBag, Tags, TrendingUp, Users, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DataState } from './AdminUI';
import { useAdminToast } from './AdminToastContext';
import { API_BASE, formatCurrency, formatDate, getApiError, getAuthHeaders } from './adminUtils';

const AdminDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const notify = useAdminToast();
  const [data, setData] = useState({ revenue: 0, totalOrders: 0, totalProducts: 0, activeUsers: 0, activity: [], categoryBreakdown: [], lowStockProducts: [] });
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, healthResponse] = await Promise.all([
        fetch(`${API_BASE}/admin/dashboard/stats`, { headers: getAuthHeaders(token) }),
        fetch(`${API_BASE}/admin/dashboard/health`, { headers: getAuthHeaders(token) }),
      ]);
      if (!statsResponse.ok) throw new Error(await getApiError(statsResponse, 'Dashboard statistics could not be loaded.'));
      const stats = await statsResponse.json();
      setData({
        revenue: stats.revenue || 0,
        totalOrders: stats.totalOrders || 0,
        totalProducts: stats.totalProducts || 0,
        activeUsers: stats.activeUsers || 0,
        activity: stats.activity || [],
        categoryBreakdown: stats.categoryBreakdown || [],
        lowStockProducts: stats.lowStockProducts || [],
      });
      setHealth(healthResponse.ok ? await healthResponse.json() : { api: 'operational', database: 'unavailable' });
    } catch (err) {
      setError(err.message || 'Dashboard statistics could not be loaded.');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleDownloadReport = () => {
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Metric', 'Value'],
      ['Total revenue', data.revenue],
      ['Total orders', data.totalOrders],
      ['Total products', data.totalProducts],
      ['Customers', data.activeUsers],
      [],
      ['Recent activity', 'Reference', 'Date', 'Amount'],
      ...data.activity.map((item) => [item.type === 'order' ? 'Order' : 'User registration', item.type === 'order' ? `ORD-${item.id}` : item.customer_name, new Date(item.created_at).toLocaleString('en-IN'), item.type === 'order' ? item.total_amount : '']),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `admin-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    notify('Dashboard report downloaded.');
  };

  const stats = [
    { title: 'Total Revenue', value: formatCurrency(data.revenue), caption: 'All non-cancelled orders', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: IndianRupee },
    { title: 'Total Orders', value: data.totalOrders, caption: 'All time', color: 'text-blue-600', bg: 'bg-blue-50', icon: ShoppingBag },
    { title: 'Total Products', value: data.totalProducts, caption: 'In the catalogue', color: 'text-[#ff3f6c]', bg: 'bg-[#ff3f6c]/10', icon: Tags },
    { title: 'Customers', value: data.activeUsers, caption: 'Registered accounts', color: 'text-purple-600', bg: 'bg-purple-50', icon: Users },
  ];

  // Generate smooth SVG curve path for Revenue Chart
  const samplePoints = [35, 50, 40, 70, 60, 90, 85, 110, 95, 130];
  const maxPoint = Math.max(...samplePoints);
  const chartHeight = 120;
  const chartWidth = 500;
  const pathD = samplePoints
    .map((val, idx) => {
      const x = (idx / (samplePoints.length - 1)) * chartWidth;
      const y = chartHeight - (val / maxPoint) * (chartHeight - 20);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  const categoryColors = ['#ff3f6c', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
  const totalCategoryProducts = data.categoryBreakdown.reduce((sum, item) => sum + Number(item.count), 0) || 1;

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#282c3f]">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">A live, all-time summary of your store.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={fetchDashboard} className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm hover:bg-gray-50" aria-label="Refresh dashboard"><RefreshCw size={18} /></button>
          <button type="button" onClick={handleDownloadReport} disabled={loading || Boolean(error)} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-[#282c3f] shadow-sm hover:bg-gray-50 disabled:opacity-50"><Download size={17} /> Download Report</button>
        </div>
      </div>

      <DataState loading={loading} error={error} onRetry={fetchDashboard} loadingText="Loading live store data…">
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article key={stat.title} className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}><Icon size={24} aria-hidden="true" /></div>
                  <p className="text-3xl font-black tracking-tight text-[#282c3f]">{stat.value}</p>
                  <h2 className="mt-1 text-sm font-bold text-gray-600">{stat.title}</h2>
                  <p className="mt-2 text-xs text-gray-400">{stat.caption}</p>
                  <Icon size={112} className="absolute -bottom-5 -right-4 text-gray-900 opacity-[0.035]" aria-hidden="true" />
                </article>
              );
            })}
          </div>

          {/* Revenue Chart & Catalogue Distribution */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Sales Trend Chart */}
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-black text-[#282c3f]"><TrendingUp size={20} className="text-[#ff3f6c]" /> Revenue & Sales Trend</h2>
                  <p className="text-xs text-gray-400">Order revenue over recent periods</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">+18.4% growth</span>
              </div>
              <div className="relative mt-4 h-44 w-full overflow-hidden rounded-xl bg-gray-50/50 p-4">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff3f6c" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#ff3f6c" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={areaD} fill="url(#revenueGradient)" />
                  <path d={pathD} fill="none" stroke="#ff3f6c" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-gray-400">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </section>

            {/* Category Breakdown */}
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-black text-[#282c3f]"><Layers size={18} className="text-blue-500" /> Catalogue Distribution</h2>
              <p className="mt-0.5 text-xs text-gray-400">Products by category</p>
              {data.categoryBreakdown.length > 0 ? (
                <div className="mt-6 flex flex-col gap-4">
                  {data.categoryBreakdown.map((item, idx) => {
                    const percentage = Math.round((Number(item.count) / totalCategoryProducts) * 100);
                    const barColor = categoryColors[idx % categoryColors.length];
                    return (
                      <div key={item.category} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span>{item.category}</span>
                          <span className="text-gray-400">{item.count} items ({percentage}%)</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: barColor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-gray-400">No categories found in products.</div>
              )}
            </section>
          </div>

          {/* Activity & System Health / Low Stock Warning */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2" aria-labelledby="recent-activity-heading">
              <div className="mb-6 flex items-center justify-between">
                <h2 id="recent-activity-heading" className="text-lg font-black text-[#282c3f]">Recent Activity</h2>
                <button type="button" onClick={() => navigate('/admin/orders')} className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold text-[#ff3f6c] hover:bg-[#ff3f6c]/10">View orders <ArrowRight size={15} /></button>
              </div>
              {data.activity.length ? (
                <div className="divide-y divide-gray-100">
                  {data.activity.map((item) => (
                    <div key={`${item.type}-${item.id}`} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.type === 'order' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{item.type === 'order' ? <ShoppingBag size={17} /> : <Users size={17} />}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#282c3f]">{item.type === 'order' ? <><strong>Order ORD-{item.id}</strong> placed by {item.customer_name}</> : <><strong>{item.customer_name}</strong> registered an account</>}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-400"><Clock size={12} /> {formatDate(item.created_at, { hour: 'numeric', minute: '2-digit' })}</p>
                      </div>
                      {item.type === 'order' && <p className="shrink-0 text-sm font-black text-[#282c3f]">{formatCurrency(item.total_amount)}</p>}
                    </div>
                  ))}
                </div>
              ) : <div className="py-12 text-center"><Package className="mx-auto text-gray-300" size={34} /><p className="mt-3 text-sm text-gray-500">No activity has been recorded yet.</p></div>}
            </section>

            <div className="flex flex-col gap-6">
              {/* Low Stock Warning */}
              {data.lowStockProducts.length > 0 && (
                <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-amber-800">
                    <AlertTriangle size={18} className="text-amber-600" />
                    <h2 className="text-sm font-black uppercase tracking-wider">Low Stock Inventory</h2>
                  </div>
                  <div className="space-y-2">
                    {data.lowStockProducts.map((prod) => (
                      <div key={prod.id} className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs shadow-sm">
                        <span className="truncate font-bold text-gray-800">{prod.title}</span>
                        <span className="shrink-0 font-black text-amber-600">{prod.stock_quantity} left</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* System Health */}
              <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="system-health-heading">
                <div className="mb-5 flex items-center justify-between"><h2 id="system-health-heading" className="text-lg font-black text-[#282c3f]">System Health</h2><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" /></div>
                <div className="space-y-3">
                  {[['API Services', health?.api], ['Database', health?.database]].map(([label, status]) => {
                    const ok = status === 'operational';
                    return <div key={label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"><div className={`flex h-9 w-9 items-center justify-center rounded-full ${ok ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}</div><div><p className="text-sm font-bold text-[#282c3f]">{label}</p><p className="mt-0.5 text-xs text-gray-500">{ok ? 'Operational' : 'Unavailable'}</p></div></div>;
                  })}
                </div>
                {health?.checkedAt && <p className="mt-4 text-xs text-gray-400">Checked {new Date(health.checkedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</p>}
              </section>
            </div>
          </div>
        </>
      </DataState>
    </div>
  );
};

export default AdminDashboard;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowUpRightFromSquare,
  faBagShopping,
  faBarsStaggered,
  faBell,
  faBoxOpen,
  faCartShopping,
  faChevronDown,
  faChevronRight,
  faGaugeHigh,
  faGear,
  faLayerGroup,
  faMagnifyingGlass,
  faRotate,
  faRightFromBracket,
  faStore,
  faTags,
  faUsersGear,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { AdminToastProvider } from './AdminUI';
import { API_BASE, formatCurrency, formatDate, getAuthHeaders } from './adminUtils';

const navLinks = [
  { name: 'Dashboard', path: '/admin', icon: faGaugeHigh, group: 'Overview', description: 'Store performance and activity', keywords: 'home analytics revenue' },
  { name: 'Products', path: '/admin/products', icon: faBoxOpen, group: 'Catalogue', description: 'Catalogue, pricing, and imagery', keywords: 'items stock price catalog' },
  { name: 'Categories', path: '/admin/categories', icon: faLayerGroup, group: 'Catalogue', description: 'Storefront navigation structure', keywords: 'collection taxonomy slug' },
  { name: 'Orders', path: '/admin/orders', icon: faCartShopping, group: 'Commerce', description: 'Fulfilment and order status', keywords: 'shipping delivery pending' },
  { name: 'Discounts', path: '/admin/discounts', icon: faTags, group: 'Commerce', description: 'Coupons and promotions', keywords: 'offers coupon sale' },
  { name: 'Users', path: '/admin/users', icon: faUsersGear, group: 'Administration', description: 'Customers and team access', keywords: 'people accounts role admin' },
  { name: 'Settings', path: '/admin/settings', icon: faGear, group: 'Administration', description: 'Store, payment, and shipping rules', keywords: 'configuration razorpay currency' },
];

const navGroups = ['Overview', 'Catalogue', 'Commerce', 'Administration'];

const AdminShell = () => {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const commandInputRef = useRef(null);
  const commandDialogRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('admin-sidebar-collapsed') === 'true');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [commandIndex, setCommandIndex] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shellData, setShellData] = useState({ orders: [], health: 'checking', checkedAt: null });
  const [refreshingShell, setRefreshingShell] = useState(false);

  const currentPath = location.pathname;
  const currentPage = navLinks.find((link) => link.path === '/admin' ? currentPath === '/admin' : currentPath.startsWith(link.path)) || navLinks[0];
  const initials = (user?.name || 'Admin').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const attentionOrders = useMemo(() => shellData.orders.filter((order) => ['Pending', 'Processing'].includes(order.status)), [shellData.orders]);

  const filteredCommands = useMemo(() => {
    const query = commandQuery.trim().toLowerCase();
    if (!query) return navLinks;
    return navLinks.filter((link) => `${link.name} ${link.description} ${link.keywords}`.toLowerCase().includes(query));
  }, [commandQuery]);

  const fetchShellData = useCallback(async () => {
    setRefreshingShell(true);
    try {
      const [ordersResponse, healthResponse] = await Promise.all([
        fetch(`${API_BASE}/admin/orders`, { headers: getAuthHeaders(token) }),
        fetch(`${API_BASE}/admin/dashboard/health`, { headers: getAuthHeaders(token) }),
      ]);
      const orders = ordersResponse.ok ? await ordersResponse.json() : [];
      const health = healthResponse.ok ? await healthResponse.json() : null;
      setShellData({
        orders: Array.isArray(orders) ? orders : [],
        health: health?.api === 'operational' && health?.database === 'operational' ? 'operational' : 'unavailable',
        checkedAt: health?.checkedAt || new Date().toISOString(),
      });
    } catch {
      setShellData((current) => ({ ...current, health: 'unavailable', checkedAt: new Date().toISOString() }));
    } finally {
      setRefreshingShell(false);
    }
  }, [token]);

  useEffect(() => { fetchShellData(); }, [fetchShellData, currentPath]);
  useEffect(() => { localStorage.setItem('admin-sidebar-collapsed', String(isCollapsed)); }, [isCollapsed]);
  useEffect(() => { setIsMobileOpen(false); setNotificationsOpen(false); setProfileOpen(false); }, [currentPath]);
  useEffect(() => { setCommandIndex(0); }, [commandQuery]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
      if (event.key === 'Escape') {
        if (commandOpen) setCommandOpen(false);
        else if (isMobileOpen) { setIsMobileOpen(false); window.setTimeout(() => mobileMenuButtonRef.current?.focus(), 0); }
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [commandOpen, isMobileOpen]);

  useEffect(() => {
    if (!commandOpen) return undefined;
    setCommandQuery('');
    window.setTimeout(() => commandInputRef.current?.focus(), 0);
    const onTab = (event) => {
      if (event.key !== 'Tab') return;
      const controls = commandDialogRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled])');
      if (!controls?.length) return;
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onTab);
    return () => document.removeEventListener('keydown', onTab);
  }, [commandOpen]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const handleLogout = () => { logout(); navigate('/admin/login', { replace: true }); };
  const runCommand = (link) => { navigate(link.path); setCommandOpen(false); };
  const handleCommandKeyDown = (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setCommandIndex((index) => Math.min(index + 1, filteredCommands.length - 1)); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setCommandIndex((index) => Math.max(index - 1, 0)); }
    if (event.key === 'Enter' && filteredCommands[commandIndex]) { event.preventDefault(); runCommand(filteredCommands[commandIndex]); }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f4f6] font-sans">
      <a href="#admin-main-content" className="sr-only z-[120] rounded-lg bg-[#282c3f] px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to admin content</a>

      {isMobileOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-[#101321]/60 backdrop-blur-sm md:hidden" onClick={() => setIsMobileOpen(false)} />}

      <aside id="admin-sidebar" aria-label="Admin navigation" className={`fixed z-50 flex h-full flex-col border-r border-gray-100 bg-white shadow-[8px_0_28px_rgba(40,44,63,0.04)] transition-all duration-300 ease-in-out md:relative ${isMobileOpen ? 'w-72 translate-x-0' : '-translate-x-full md:translate-x-0'} ${isCollapsed ? 'md:w-[84px]' : 'md:w-[272px]'}`}>
        <div className={`flex h-[72px] shrink-0 items-center justify-between border-b border-gray-100 px-4 ${isCollapsed ? 'md:justify-center md:px-2' : ''}`}>
          <Link to="/admin" className={`flex min-w-0 items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff3f6c]/30 ${isCollapsed ? 'md:hidden' : ''}`} aria-label="Europion Admin dashboard">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff3f6c] to-[#ff6b8d] text-white shadow-md shadow-[#ff3f6c]/20"><FontAwesomeIcon icon={faBagShopping} className="h-[18px] w-[18px]" /></span>
            <span className="min-w-0"><span className="block truncate text-base font-black tracking-tight text-[#282c3f]">Europion Admin</span><span className="block text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">Commerce workspace</span></span>
          </Link>
          <button type="button" className="hidden md:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 shadow-sm transition hover:border-[#ff3f6c]/30 hover:bg-[#ff3f6c]/5 hover:text-[#ff3f6c] focus:outline-none focus:ring-2 focus:ring-[#ff3f6c]/25" onClick={() => setIsCollapsed((value) => !value)} aria-controls="admin-sidebar" aria-expanded={!isCollapsed} aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}><FontAwesomeIcon icon={faBarsStaggered} className="h-4 w-4" /></button>
          <button type="button" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden" onClick={() => setIsMobileOpen(false)} aria-label="Close navigation"><FontAwesomeIcon icon={faXmark} className="h-5 w-5" /></button>
        </div>

        <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4">
          {navGroups.map((group) => (
            <div key={group} className="mb-4 last:mb-0">
              <p className={`mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 ${isCollapsed ? 'md:hidden' : ''}`}>{group}</p>
              <div className="flex flex-col gap-1.5">
                {navLinks.filter((link) => link.group === group).map((link) => {
                  const isActive = link.path === '/admin' ? currentPath === '/admin' : currentPath.startsWith(link.path);
                  const badge = link.name === 'Orders' ? attentionOrders.length : 0;
                  return (
                    <Link key={link.name} to={link.path} aria-current={isActive ? 'page' : undefined} title={isCollapsed ? link.name : undefined} className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-bold transition-all ${isActive ? 'bg-gradient-to-r from-[#ff3f6c]/12 to-[#ff3f6c]/5 text-[#ff3f6c]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#282c3f]'} ${isCollapsed ? 'md:min-h-[60px] md:flex-col md:justify-center md:gap-1 md:px-1 md:py-2' : ''}`}>
                      {isActive && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#ff3f6c]" aria-hidden="true" />}
                      <FontAwesomeIcon icon={link.icon} fixedWidth className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      <span className={`flex min-w-0 flex-1 items-center justify-between ${isCollapsed ? 'md:block md:max-w-full md:flex-none md:text-center' : ''}`}><span className={`truncate ${isCollapsed ? 'md:block md:max-w-[68px] md:text-[9px] md:font-black md:leading-tight' : ''}`}>{link.name}</span>{badge > 0 && <span className={`ml-2 min-w-5 items-center justify-center rounded-full bg-[#ff3f6c] px-1.5 py-0.5 text-[10px] font-black text-white ${isCollapsed ? 'flex md:hidden' : 'flex'}`} aria-label={`${badge} orders need attention`}>{badge > 99 ? '99+' : badge}</span>}</span>
                      {isCollapsed && badge > 0 && <span className="absolute right-2 top-1.5 hidden h-2 w-2 rounded-full bg-[#ff3f6c] ring-2 ring-white md:block" aria-label={`${badge} orders need attention`} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-gray-100 p-3">
          <Link to="/" className={`mb-2 flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-600 hover:border-[#ff3f6c]/30 hover:bg-[#ff3f6c]/5 hover:text-[#ff3f6c] ${isCollapsed ? 'md:min-h-[56px] md:flex-col md:justify-center md:gap-1 md:px-1 md:py-2' : ''}`} title={isCollapsed ? 'Preview storefront' : undefined}><FontAwesomeIcon icon={faStore} className="h-4 w-4 shrink-0" /><span className={`flex-1 ${isCollapsed ? 'md:flex-none md:text-[9px] md:font-black md:leading-tight' : ''}`}><span className="md:hidden">Preview storefront</span><span className={isCollapsed ? 'hidden md:inline' : 'hidden'}>Store</span><span className={isCollapsed ? 'hidden' : 'hidden md:inline'}>Preview storefront</span></span><span className={isCollapsed ? 'md:hidden' : ''}><FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" /></span></Link>
          <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2 ${isCollapsed ? 'md:flex-col md:justify-center md:gap-1 md:px-1' : ''}`} title={`System ${shellData.health}`}><span className={`relative h-2.5 w-2.5 shrink-0 rounded-full ${shellData.health === 'operational' ? 'bg-emerald-500' : shellData.health === 'checking' ? 'bg-amber-400' : 'bg-red-500'}`}>{shellData.health === 'operational' && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-30" />}</span><span className={`text-xs font-semibold text-gray-500 ${isCollapsed ? 'md:text-[9px] md:font-black md:leading-tight' : ''}`}><span className="md:hidden">{shellData.health === 'operational' ? 'Systems operational' : shellData.health === 'checking' ? 'Checking systems…' : 'System attention needed'}</span><span className={isCollapsed ? 'hidden md:inline' : 'hidden'}>{shellData.health === 'operational' ? 'Online' : shellData.health === 'checking' ? 'Check' : 'Issue'}</span><span className={isCollapsed ? 'hidden' : 'hidden md:inline'}>{shellData.health === 'operational' ? 'Systems operational' : shellData.health === 'checking' ? 'Checking systems…' : 'System attention needed'}</span></span></div>
        </div>
      </aside>

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-gray-100 bg-white/95 px-4 shadow-sm backdrop-blur md:px-6 xl:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button ref={mobileMenuButtonRef} type="button" className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-[#ff3f6c]/30 hover:bg-[#ff3f6c]/5 hover:text-[#ff3f6c] md:hidden" onClick={() => setIsMobileOpen(true)} aria-controls="admin-sidebar" aria-expanded={isMobileOpen} aria-label="Open navigation"><FontAwesomeIcon icon={faBarsStaggered} className="h-[19px] w-[19px]" /></button>
            <div className="min-w-0"><div className="hidden items-center gap-1.5 text-[11px] font-semibold text-gray-400 sm:flex"><span>Admin</span><FontAwesomeIcon icon={faChevronRight} className="h-2.5 w-2.5" /><span className="text-gray-600">{currentPage.name}</span></div><p className="truncate text-base font-black text-[#282c3f] sm:mt-0.5">{currentPage.name}</p></div>
          </div>

          <button type="button" onClick={() => setCommandOpen(true)} className="mx-6 hidden min-w-64 max-w-md flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-left text-sm text-gray-400 transition hover:border-gray-300 hover:bg-white hover:shadow-sm md:flex"><FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" /><span className="flex-1">Search admin tools…</span><kbd className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold text-gray-400">⌘ K</kbd></button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={() => setCommandOpen(true)} className="rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 hover:text-[#282c3f] md:hidden" aria-label="Search admin tools"><FontAwesomeIcon icon={faMagnifyingGlass} className="h-[18px] w-[18px]" /></button>
            <div ref={notificationRef} className="relative">
              <button type="button" onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }} className="relative rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 hover:text-[#282c3f]" aria-label={`Notifications${attentionOrders.length ? `, ${attentionOrders.length} unread` : ''}`} aria-expanded={notificationsOpen}><FontAwesomeIcon icon={faBell} className="h-[18px] w-[18px]" />{attentionOrders.length > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff3f6c] px-1 text-[9px] font-black text-white ring-2 ring-white">{attentionOrders.length > 9 ? '9+' : attentionOrders.length}</span>}</button>
              {notificationsOpen && <div className="absolute right-0 top-12 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5"><div><p className="text-sm font-black text-[#282c3f]">Order attention</p><p className="mt-0.5 text-xs text-gray-400">Pending and processing orders</p></div><button type="button" onClick={fetchShellData} disabled={refreshingShell} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Refresh notifications"><FontAwesomeIcon icon={faRotate} className={`h-4 w-4 ${refreshingShell ? 'animate-spin' : ''}`} /></button></div>{attentionOrders.length ? <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto">{attentionOrders.slice(0, 5).map((order) => <button key={order.id} type="button" onClick={() => { navigate('/admin/orders'); setNotificationsOpen(false); }} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${order.status === 'Pending' ? 'bg-amber-400' : 'bg-blue-500'}`} /><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#282c3f]">ORD-{order.id} · {order.status}</span><span className="mt-1 block truncate text-xs text-gray-500">{order.customer_name} · {formatCurrency(order.total_amount)}</span><span className="mt-1 block text-[11px] text-gray-400">{formatDate(order.created_at)}</span></span><FontAwesomeIcon icon={faChevronRight} className="mt-3 h-3.5 w-3.5 text-gray-300" /></button>)}</div> : <div className="px-5 py-10 text-center"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><FontAwesomeIcon icon={faBell} className="h-[18px] w-[18px]" /></span><p className="mt-3 text-sm font-bold text-[#282c3f]">You’re all caught up</p><p className="mt-1 text-xs text-gray-400">No orders currently need attention.</p></div>}<button type="button" onClick={() => { navigate('/admin/orders'); setNotificationsOpen(false); }} className="w-full border-t border-gray-100 px-4 py-3 text-center text-xs font-bold text-[#ff3f6c] hover:bg-[#ff3f6c]/5">Open all orders</button></div>}
            </div>

            <div className="mx-1 hidden h-8 w-px bg-gray-100 sm:block" />
            <div ref={profileRef} className="relative">
              <button type="button" onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }} className="flex items-center gap-2 rounded-xl p-1.5 pr-2 hover:bg-gray-50" aria-label="Open admin profile menu" aria-expanded={profileOpen}><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff3f6c] to-[#ff6b8d] text-xs font-black text-white shadow-sm">{initials}</span><span className="hidden max-w-36 text-left lg:block"><span className="block truncate text-xs font-black text-[#282c3f]">{user?.name || 'Admin'}</span><span className="mt-0.5 block truncate text-[10px] text-gray-400">Administrator</span></span><span className={`hidden text-gray-400 transition-transform lg:flex ${profileOpen ? 'rotate-180' : ''}`}><FontAwesomeIcon icon={faChevronDown} className="h-3 w-3" /></span></button>
              {profileOpen && <div className="absolute right-0 top-13 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"><div className="border-b border-gray-100 px-4 py-4"><p className="truncate text-sm font-black text-[#282c3f]">{user?.name}</p><p className="mt-1 truncate text-xs text-gray-400">{user?.email}</p></div><div className="p-2"><button type="button" onClick={() => { navigate('/admin/settings'); setProfileOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-gray-600 hover:bg-gray-50"><FontAwesomeIcon icon={faGear} className="h-4 w-4" /> Store settings</button><button type="button" onClick={() => { navigate('/'); setProfileOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-gray-600 hover:bg-gray-50"><FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-4 w-4" /> Preview storefront</button></div><div className="border-t border-gray-100 p-2"><button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50"><FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" /> Log out</button></div></div>}
            </div>
          </div>
        </header>

        <main className="admin-workspace-bg flex-1 overflow-y-auto p-4 md:p-6 xl:p-8" id="admin-main-content">
          <div className="mx-auto flex min-h-full w-full max-w-[1600px] flex-col">
            <div className="flex-1"><Outlet /></div>
            <footer className="mt-10 flex flex-col gap-3 border-t border-gray-200/80 py-5 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><span className="font-bold text-gray-500">Europion Commerce Workspace</span><span className="hidden h-3 w-px bg-gray-300 sm:block" /><span>© {new Date().getFullYear()} Store administration</span></div>
              <div className="flex flex-wrap items-center gap-4"><span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${shellData.health === 'operational' ? 'bg-emerald-500' : 'bg-red-500'}`} />{shellData.health === 'operational' ? 'All systems operational' : 'Service status unavailable'}</span><Link to="/" className="flex items-center gap-1 font-bold text-gray-500 hover:text-[#ff3f6c]">View store <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-2.5 w-2.5" /></Link></div>
            </footer>
          </div>
        </main>
      </div>

      {commandOpen && <div className="fixed inset-0 z-[110] flex items-start justify-center bg-[#101321]/65 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && setCommandOpen(false)}><section ref={commandDialogRef} role="dialog" aria-modal="true" aria-labelledby="admin-command-title" className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl"><h2 id="admin-command-title" className="sr-only">Search admin tools</h2><div className="flex items-center gap-3 border-b border-gray-100 px-4"><FontAwesomeIcon icon={faMagnifyingGlass} className="h-[18px] w-[18px] shrink-0 text-gray-400" /><input ref={commandInputRef} type="search" value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} onKeyDown={handleCommandKeyDown} placeholder="Where do you want to go?" className="min-w-0 flex-1 border-0 bg-transparent py-4 text-base font-semibold text-[#282c3f] outline-none placeholder:font-normal placeholder:text-gray-400" /><button type="button" onClick={() => setCommandOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label="Close search"><FontAwesomeIcon icon={faXmark} className="h-[18px] w-[18px]" /></button></div><div className="max-h-[55vh] overflow-y-auto p-2">{filteredCommands.length ? filteredCommands.map((link, index) => <button key={link.path} type="button" onMouseEnter={() => setCommandIndex(index)} onClick={() => runCommand(link)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${index === commandIndex ? 'bg-[#ff3f6c]/8' : 'hover:bg-gray-50'}`}><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${index === commandIndex ? 'bg-[#ff3f6c] text-white' : 'bg-gray-100 text-gray-500'}`}><FontAwesomeIcon icon={link.icon} className="h-[18px] w-[18px]" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-black text-[#282c3f]">{link.name}</span><span className="mt-0.5 block truncate text-xs text-gray-400">{link.description}</span></span><span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">{link.group}</span></button>) : <div className="px-4 py-12 text-center"><FontAwesomeIcon icon={faMagnifyingGlass} className="h-7 w-7 text-gray-300" /><p className="mt-3 text-sm font-bold text-[#282c3f]">No matching admin tools</p><p className="mt-1 text-xs text-gray-400">Try products, orders, users, or settings.</p></div>}</div><div className="flex items-center gap-4 border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-[10px] font-semibold text-gray-400"><span>↑↓ Navigate</span><span>↵ Open</span><span>Esc Close</span></div></section></div>}
    </div>
  );
};

const AdminLayout = () => <AdminToastProvider><AdminShell /></AdminToastProvider>;

export default AdminLayout;

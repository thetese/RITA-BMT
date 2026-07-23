
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import './styles/App.css';
import Dashboard from './components/Dashboard';
import AppLauncher from './components/AppLauncher';
import SalesForm from './components/SalesForm';
import SalesList from './components/SalesList';
import Reports from './components/Reports';
import ProductsManagement from './components/ProductsManagement';
import DailyGridForm from './components/DailyGridForm';
import AccountersManagement from './components/AccountersManagement';
import LoginScreen from './components/LoginScreen';
import UsersManagement from './components/UsersManagement';
import Expenses from './components/Expenses';
import Customers from './components/Customers';
import Ingredients from './components/Ingredients';
import TablesManagement from './components/TablesManagement';
import Settings from './components/Settings';
import RestaurantPOS from './components/RestaurantPOS';
import RetailPOS from './components/RetailPOS';
import ReceiptsHistory from './components/ReceiptsHistory';
import KDS from './components/KDS';
import EmployeeTimecards from './components/EmployeeTimecards';
import SuppliersManagement from './components/SuppliersManagement';
import InvoiceMaker from './components/InvoiceMaker';
import Warehouses from './components/Warehouses';
import FinancialStatements from './components/FinancialStatements';
import ChartOfAccounts from './components/ChartOfAccounts';
import JournalEntries from './components/JournalEntries';
import LeadsPipeline from './components/LeadsPipeline';
import LeaveRequests from './components/LeaveRequests';
import Payroll from './components/Payroll';
import PurchaseOrders from './components/PurchaseOrders';
import StockTransfers from './components/StockTransfers';
import { 
  Bell, LayoutDashboard, TerminalSquare, MonitorPlay, CalendarDays, 
  ListOrdered, ReceiptText, PackageSearch, Wheat, Truck, 
  Users, UserCircle, Shield, Receipt, LineChart, Table, Settings2, 
  Sun, Moon, LogOut, ChevronLeft, Menu, AlertTriangle, Clock, FileText,
  Building2, BookOpen, BookMarked, Target, DollarSign, PackageOpen, ArrowRightLeft, Calendar
} from 'lucide-react';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ConfirmProvider, useConfirm } from './components/ui/Confirm';
import FoodReadyAlerts from './components/FoodReadyAlerts';
import { useAuthStore } from './store/useAuthStore';
import { useSalesStore } from './store/useSalesStore';
import { useConfigStore } from './store/useConfigStore';

function MainLayout() {
  const { currentUser, logout } = useAuthStore();
  const { theme, businessType, toggleTheme } = useConfigStore();
  const { lowStockItems } = useSalesStore();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const isSecondary = urlParams.get('isMain') === 'false';
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoute = (key: string) => {
    switch(key) {
      case 'dashboard': return '/dashboard';
      case 'pos': return businessType === 'restaurant' ? '/restaurant' : '/retail';
      case 'products': return '/products';
      case 'receipts': return '/receipts';
      case 'settings': return '/settings';
      default: return `/${key}`;
    }
  };

  let activeApp = 'pos';
  if (location.pathname.startsWith('/products') || location.pathname.startsWith('/suppliers') || location.pathname.startsWith('/ingredients')) activeApp = 'inventory';
  else if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/expenses') || location.pathname.startsWith('/reports') || location.pathname.startsWith('/invoices') || location.pathname.startsWith('/receipts') || location.pathname.startsWith('/sales')) activeApp = 'finance';
  else if (location.pathname.startsWith('/customers') || location.pathname.startsWith('/team')) activeApp = 'crm';
  else if (location.pathname.startsWith('/timecards') || location.pathname.startsWith('/users')) activeApp = 'hr';
  else if (location.pathname.startsWith('/settings') || location.pathname.startsWith('/tables')) activeApp = 'settings';

  const allNavGroups = [
    {
      app: 'pos',
      group: 'Sales & POS',
      items: [
        { key: 'pos', label: 'POS Terminal', icon: <TerminalSquare size={18} />, adminOnly: false },
        ...(businessType === 'restaurant' ? [{ key: 'kitchen', label: 'Kitchen Display', icon: <MonitorPlay size={18} />, adminOnly: false }] : []),
        { key: 'grid', label: 'Daily Grid', icon: <CalendarDays size={18} />, adminOnly: false },
      ]
    },
    {
      app: 'inventory',
      group: 'Inventory Management',
      items: [
        { key: 'products', label: 'Finished Products', icon: <PackageSearch size={18} />, adminOnly: true },
        { key: 'purchase-orders', label: 'Purchase Orders', icon: <PackageOpen size={18} />, adminOnly: true },
        { key: 'warehouses', label: 'Warehouses', icon: <Building2 size={18} />, adminOnly: true },
        { key: 'stock-transfers', label: 'Stock Transfers', icon: <ArrowRightLeft size={18} />, adminOnly: true },
        ...(businessType === 'restaurant' ? [{ key: 'ingredients', label: 'Raw Ingredients', icon: <Wheat size={18} />, adminOnly: true }] : []),
        ...(businessType !== 'restaurant' ? [{ key: 'suppliers', label: 'Suppliers Directory', icon: <Truck size={18} />, adminOnly: true }] : [])
      ]
    },
    {
      app: 'hr',
      group: 'Human Resources',
      items: [
        { key: 'timecards', label: 'Timecards', icon: <Clock size={18} />, adminOnly: false },
        { key: 'users', label: 'System Users', icon: <Shield size={18} />, adminOnly: true },
        { key: 'payroll', label: 'Payroll & Wages', icon: <DollarSign size={18} />, adminOnly: true },
      ]
    },
    {
      app: 'crm',
      group: 'CRM',
      items: [
        { key: 'customers', label: 'Customer Directory', icon: <Users size={18} />, adminOnly: false },
        { key: 'leads-pipeline', label: 'Sales Pipeline', icon: <Target size={18} />, adminOnly: true },
        { key: 'team', label: 'Team', icon: <UserCircle size={18} />, adminOnly: true },
        { key: 'users', label: 'Users & Permissions', icon: <Users size={18} />, adminOnly: true },
        { key: 'payroll', label: 'Payroll & Wages', icon: <DollarSign size={18} />, adminOnly: true },
        { key: 'leave-requests', label: 'Leave & PTO', icon: <Calendar size={18} /> },
        { key: 'settings', label: 'System Settings', icon: <Settings2 size={18} />, adminOnly: true },
      ]
    },
    {
      app: 'finance',
      group: 'Finance & Analytics',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, adminOnly: true },
        { key: 'sales', label: 'Sales List', icon: <ListOrdered size={18} />, adminOnly: true },
        { key: 'invoices', label: 'Invoice Maker', icon: <FileText size={18} />, adminOnly: false },
        { key: 'receipts', label: 'Receipts & Refunds', icon: <ReceiptText size={18} />, adminOnly: true },
        { key: 'expenses', label: 'Expenses', icon: <Receipt size={18} />, adminOnly: true },
        { key: 'reports', label: 'Reports', icon: <LineChart size={18} />, adminOnly: true },
      ]
    },
    {
      app: 'finance',
      group: 'Accounting & Finance',
      items: [
        { key: 'financial-statements', label: 'Financial Statements', icon: <LineChart size={18} />, adminOnly: true },
        { key: 'chart-of-accounts', label: 'Chart of Accounts', icon: <BookOpen size={18} />, adminOnly: true },
        { key: 'journal-entries', label: 'Journal Entries', icon: <BookMarked size={18} />, adminOnly: true },
      ]
    },
    {
      app: 'settings',
      group: 'System Configuration',
      items: [
        ...(businessType === 'restaurant' ? [{ key: 'tables', label: 'Table Config', icon: <Table size={18} />, adminOnly: true }] : []),
        { key: 'settings', label: 'Settings', icon: <Settings2 size={18} />, adminOnly: true },
      ]
    }
  ];

  const navGroups = allNavGroups.filter(g => g.app === activeApp);

  if (!currentUser) return null;

  return (
    <div className={`app ${isSecondary ? 'secondary-layout' : ''}`}>
      {isSecondary && (
        <button 
          onClick={() => { window.location.href = window.location.pathname; }}
          style={{
            position: 'absolute', top: '15px', left: '15px', zIndex: 9999,
            backgroundColor: '#10b981', color: 'white', padding: '8px 16px',
            borderRadius: '8px', border: 'none', fontWeight: '600',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
          title="Exit Assigned Display Mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Exit Display
        </button>
      )}

      {!isSecondary && (
        <div className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden', flex: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <img src="./logo.png" alt="Rita Logo" style={{ height: '36px', objectFit: 'contain', flexShrink: 0, margin: isSidebarCollapsed ? '0 auto' : '0' }} onError={(e: any) => e.target.style.display='none'} />
              <h2 className="sidebar-text" style={{ whiteSpace: 'nowrap', margin: 0, opacity: isSidebarCollapsed ? 0 : 1, transition: 'opacity 0.2s', fontSize: '1.2rem' }}>Rita ERP</h2>
            </div>
            <div className="sidebar-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {lowStockItems.length > 0 && (
                <div 
                  style={{ cursor: 'pointer', position: 'relative' }}
                  onClick={() => setShowLowStockModal(true)}
                  title="Low Stock Alerts"
                >
                  <Bell size={18} style={{ color: 'var(--danger)' }} />
                  <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--danger)', color: 'white', borderRadius: '50%', padding: '1px 4px', fontSize: '0.6rem', fontWeight: 'bold' }}>
                    {lowStockItems.length}
                  </span>
                </div>
              )}
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isSidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>
          </div>

          <div className="sidebar-nav">
            {navGroups.map((g, idx) => {
              const visibleItems = g.items.filter((i: any) => currentUser.role?.toLowerCase() === 'admin' || !i.adminOnly);
              if (visibleItems.length === 0) return null;
              return (
                <div key={idx} style={{ marginBottom: '15px' }}>
                  <div className="sidebar-text" style={{ padding: '0 20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {g.group}
                  </div>
                  <ul>
                    {visibleItems.map((item: any) => {
                      const route = getRoute(item.key);
                      const active = location.pathname === route;
                      return (
                        <li 
                          key={item.key}
                          className={active ? 'active' : ''} 
                          onClick={() => navigate(route)}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 20px', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
                          title={isSidebarCollapsed ? item.label : undefined}
                        >
                          {item.icon}
                          <span className="sidebar-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="sidebar-footer" style={{ padding: isSidebarCollapsed ? '20px 10px' : '20px' }}>
            <div className="user-info sidebar-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <UserCircle size={18} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem' }}>{currentUser.username} ({currentUser.role})</span>
            </div>
            <button className="btn-secondary" style={{ width: '100%', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', gap: '8px', padding: isSidebarCollapsed ? '10px 0' : '10px 16px', border: 'none', background: 'transparent' }} onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              <span className="sidebar-text" style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
            </button>
            <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', gap: '8px', padding: isSidebarCollapsed ? '10px 0' : '10px 16px', border: 'none', background: 'transparent' }} onClick={handleLogout} title="Logout">
              <LogOut size={18} />
              <span className="sidebar-text" style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>Logout</span>
            </button>
          </div>
        </div>
      )}

      <main className="app-main">
        <Outlet />
      </main>

      {showLowStockModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal" style={{ maxWidth: '600px' }}>
            <h2 style={{ color: 'var(--danger)', marginBottom: '15px' }}>Low Stock Alerts</h2>
            {lowStockItems.length === 0 ? (
              <p>Everything is fully stocked!</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Current Stock</th>
                      <th>Threshold</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item: any) => (
                      <tr key={item.id}>
                        <td><span className="badge">{item.type.toUpperCase()}</span></td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{item.stockQuantity}</td>
                        <td>{item.lowStockThreshold}</td>
                        <td>
                          <button 
                            className="btn-sm" 
                            onClick={() => {
                              navigate(item.type === 'product' ? '/products' : '/ingredients');
                              setShowLowStockModal(false);
                            }}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setShowLowStockModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {location.pathname !== '/kitchen' && <FoodReadyAlerts />}
    </div>
  );
}

function InnerApp() {
  const api = (window as any).api;
  const { askConfirm } = useConfirm();
  
  const { currentUser, setCurrentUser } = useAuthStore();
  const { theme, businessType, setTheme, setBusinessType, toggleTheme } = useConfigStore();
  const { sales, accounters, lowStockItems, loadAllData } = useSalesStore();
  
  const [editingSale, setEditingSale] = useState<any>(null);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', category: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (!api) return;
    api.getSetting('theme').then((savedTheme: any) => {
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'dark') document.body.classList.add('dark');
      }
    });
    api.getSetting('businessType').then((type: any) => {
      if (type) setBusinessType(type);
    });
  }, [api, setTheme, setBusinessType]);

  useEffect(() => { 
    if (currentUser) {
      loadAllData();
      const socket = io('http://localhost:4000');
      socket.on('data-update', () => {
        loadAllData();
      });
      return () => {
        socket.disconnect();
      };
    }
  }, [currentUser, loadAllData]);

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  const addSale = async (sale: any) => {
    await api.addSale(sale, currentUser.id);
    await loadAllData();
  };

  const updateSale = async (sale: any) => {
    await api.updateSale(sale, currentUser.id);
    setEditingSale(null);
    await loadAllData();
  };

  const deleteSale = async (id: any) => {
    if (await askConfirm('Delete this sale record?')) {
      await api.deleteSale(id, currentUser.id);
      await loadAllData();
    }
  };

  const categories = Array.from(new Set(sales.map((s: any) => s.category)));

  const filteredSales = sales.filter((s: any) => {
    const matchDate = (!filter.startDate || s.date >= filter.startDate) &&
      (!filter.endDate || s.date <= filter.endDate);
    const matchCategory = !filter.category || s.category === filter.category;
    return matchDate && matchCategory;
  });

  return (
    <Routes>
      {/* App Launcher is outside the MainLayout so it has no sidebar */}
      <Route path="/" element={<AppLauncher />} />
      
      {/* Modules have the MainLayout sidebar */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard sales={filteredSales} filter={filter} setFilter={setFilter} categories={categories} lowStockItems={lowStockItems} />} />
        <Route path="/retail" element={<RetailPOS currentUser={currentUser} categories={categories} sales={sales} onSave={loadAllData} />} />
        <Route path="/restaurant" element={<RestaurantPOS currentUser={currentUser} categories={categories} sales={sales} onSave={loadAllData} />} />
        <Route path="/products" element={<ProductsManagement categories={categories} currentUser={currentUser} businessType={businessType} />} />
        <Route path="/purchase-orders" element={<PurchaseOrders currentUser={currentUser} />} />
        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/stock-transfers" element={<StockTransfers currentUser={currentUser} />} />
        <Route path="/financial-statements" element={<FinancialStatements />} />
        <Route path="/chart-of-accounts" element={<ChartOfAccounts />} />
        <Route path="/journal-entries" element={<JournalEntries />} />
        <Route path="/leads-pipeline" element={<LeadsPipeline currentUser={currentUser} />} />
        <Route path="/payroll" element={<Payroll currentUser={currentUser} />} />
        <Route path="/leave-requests" element={<LeaveRequests currentUser={currentUser} />} />
        <Route path="/receipts" element={<ReceiptsHistory sales={sales} currentUser={currentUser} />} />
        <Route path="/settings" element={<Settings theme={theme} toggleTheme={toggleTheme} setBusinessType={setBusinessType} />} />
        
        <Route path="/kitchen" element={<KDS />} />
        <Route path="/timecards" element={<EmployeeTimecards currentUser={currentUser} />} />
        <Route path="/grid" element={<DailyGridForm onSave={loadAllData} accounters={accounters} />} />
        <Route path="/invoices" element={<InvoiceMaker />} />
        <Route path="/add" element={
          <SalesForm 
            onSubmit={editingSale ? updateSale : addSale} 
            sale={editingSale} 
            categories={categories} 
            accounters={accounters} 
            onCancel={() => { setEditingSale(null); navigate('/sales'); }} 
            currentUser={currentUser} 
          />
        } />
        <Route path="/sales" element={<SalesList sales={sales} filter={filter} setFilter={setFilter} categories={categories} onEdit={(sale: any) => { setEditingSale(sale); navigate('/add'); }} onDelete={deleteSale} currentUser={currentUser} />} />
        <Route path="/suppliers" element={<SuppliersManagement currentUser={currentUser} />} />
        <Route path="/customers" element={<Customers currentUser={currentUser} />} />
        <Route path="/ingredients" element={<Ingredients currentUser={currentUser} />} />
        <Route path="/expenses" element={<Expenses currentUser={currentUser} />} />
        <Route path="/reports" element={<Reports sales={filteredSales} filter={filter} setFilter={setFilter} categories={categories} lowStockItems={lowStockItems} />} />
        <Route path="/team" element={<AccountersManagement />} />
        <Route path="/users" element={<UsersManagement currentUser={currentUser} />} />
        <Route path="/tables" element={<TablesManagement currentUser={currentUser} />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ConfirmProvider>
          <InnerApp />
        </ConfirmProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}



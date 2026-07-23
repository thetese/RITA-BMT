// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import './styles/App.css';
import Dashboard from './components/Dashboard';
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
import Appointments from './components/Appointments';
import CRM from './components/CRM';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import TimeEntries from './components/TimeEntries';
import ClientPortal from './components/ClientPortal';
import WorkerDashboard from './components/WorkerDashboard';
import ManagementDashboard from './components/ManagementDashboard';
import AppSwitcher from './components/AppSwitcher';
import { 
  Bell, LayoutDashboard, TerminalSquare, MonitorPlay, CalendarDays, 
  ListOrdered, ReceiptText, PackageSearch, Wheat, Truck, 
  Users, UserCircle, Shield, Receipt, LineChart, Table, Settings2, 
  Sun, Moon, LogOut, ChevronLeft, Menu, Target, AlertTriangle, Clock, FileText, Briefcase, CheckSquare, Timer, LayoutGrid
} from 'lucide-react';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ConfirmProvider, useConfirm } from './components/ui/Confirm';
import FoodReadyAlerts from './components/FoodReadyAlerts';
import { useAuthStore } from './store/useAuthStore';
import { useSalesStore } from './store/useSalesStore';
import { useConfigStore } from './store/useConfigStore';

function InnerApp() {
  const api = (window as any).api;
  const { askConfirm } = useConfirm();
  const { showToast } = useToast();
  
  const { currentUser, setCurrentUser, logout } = useAuthStore();
  const { theme, setTheme, toggleTheme } = useConfigStore();
  const { sales, accounters, lowStockItems, loadAllData } = useSalesStore();
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const initialPage = urlParams.get('page') || 'dashboard';
  const isMain = urlParams.get('isMain') === 'true' || !urlParams.has('page');
  const isSecondary = !isMain;
  const [page, setPage] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const businessType = import.meta.env.VITE_APP_TYPE || 'retail';
  const [currentModule, setCurrentModule] = useState(null);
  const effectiveType = businessType === 'general' ? currentModule : businessType;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', category: '' });

  useEffect(() => {
    if (!api) return;
    api.getSetting('theme').then((savedTheme: any) => {
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'dark') document.body.classList.add('dark');
      }
    });
  }, [api, setTheme]);

  useEffect(() => { 
    if (currentUser) {
      loadAllData();
      
      // Auto-route based on role for Service businesses (if running isolated)
      if (businessType === 'service') {
        if (currentUser.role === 'Worker') {
          setPage('worker_dash');
          setIsSidebarCollapsed(true);
        } else if (currentUser.role === 'Sales') {
          setPage('crm');
        } else if (currentUser.role === 'Admin') {
          setPage('management_dash');
        }
      } else if (businessType !== 'general') {
        setPage('dashboard');
      }

      const interval = setInterval(loadAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, loadAllData, businessType]);

  useEffect(() => {
    if (businessType === 'general' && currentModule) {
      if (currentModule === 'service') setPage('crm');
      else if (currentModule === 'retail' || currentModule === 'restaurant') setPage('dashboard');
      else if (currentModule === 'projects') setPage('management_dash');
      else if (currentModule === 'inventory') setPage('products');
      else if (currentModule === 'hr') setPage('users');
      else if (currentModule === 'finance') setPage('reports');
    }
  }, [currentModule, businessType]);



  const handleLogout = () => {
    logout();
    setPage('dashboard');
  };

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

  const categories = [...new Set(sales.map(s => s.category))];

  const filteredSales = sales.filter(s => {
    const matchDate = (!filter.startDate || s.date >= filter.startDate) &&
      (!filter.endDate || s.date <= filter.endDate);
    const matchCategory = !filter.category || s.category === filter.category;
    return matchDate && matchCategory;
  });

  let navGroups = [];

  if (businessType === 'general') {
    if (currentModule === 'retail' || currentModule === 'restaurant') {
      navGroups.push({
        group: currentModule === 'retail' ? 'Retail POS' : 'Restaurant POS',
        items: [
          { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, adminOnly: true },
          { key: 'pos', label: 'POS Terminal', icon: <TerminalSquare size={18} />, adminOnly: false },
          ...(currentModule === 'restaurant' ? [{ key: 'kitchen', label: 'Kitchen Display', icon: <MonitorPlay size={18} />, adminOnly: false }] : []),
          { key: 'grid', label: 'Daily Grid', icon: <CalendarDays size={18} />, adminOnly: false },
          { key: 'sales', label: 'Sales List', icon: <ListOrdered size={18} />, adminOnly: true },
          { key: 'receipts', label: 'Receipts & Refunds', icon: <ReceiptText size={18} />, adminOnly: true }
        ]
      });
    } else if (currentModule === 'service') {
      navGroups.push({
        group: 'Service CRM',
        items: [
          { key: 'crm', label: 'CRM & Pipeline', icon: <Target size={18} />, adminOnly: true },
          { key: 'appointments', label: 'Appointments', icon: <CalendarDays size={18} />, adminOnly: false },
          { key: 'invoices', label: 'Invoice Maker', icon: <FileText size={18} />, adminOnly: false }
        ]
      });
    } else if (currentModule === 'projects') {
      navGroups.push({
        group: 'Projects & Tasks',
        items: [
          { key: 'management_dash', label: 'Gantt & Timelines', icon: <CalendarDays size={18} />, adminOnly: true },
          { key: 'worker_dash', label: 'My Action Feed', icon: <CheckSquare size={18} />, adminOnly: false },
          { key: 'projects', label: 'Projects', icon: <Briefcase size={18} />, adminOnly: true },
          { key: 'tasks', label: 'My Tasks', icon: <CheckSquare size={18} />, adminOnly: false },
          { key: 'time', label: 'Time Logs', icon: <Timer size={18} />, adminOnly: false }
        ]
      });
    } else if (currentModule === 'inventory') {
      navGroups.push({
        group: 'Inventory',
        items: [
          { key: 'products', label: 'Products & Services', icon: <PackageSearch size={18} />, adminOnly: true },
          { key: 'ingredients', label: 'Raw Ingredients', icon: <Wheat size={18} />, adminOnly: true },
          { key: 'suppliers', label: 'Suppliers & POs', icon: <Truck size={18} />, adminOnly: true }
        ]
      });
    } else if (currentModule === 'hr') {
      navGroups.push({
        group: 'People & HR',
        items: [
          { key: 'customers', label: 'Customers', icon: <Users size={18} />, adminOnly: false },
          { key: 'team', label: 'Team', icon: <UserCircle size={18} />, adminOnly: true },
          { key: 'timecards', label: 'Timecards', icon: <Clock size={18} />, adminOnly: false },
          { key: 'users', label: 'System Users', icon: <Shield size={18} />, adminOnly: true }
        ]
      });
    } else if (currentModule === 'finance') {
      navGroups.push({
        group: 'Finance',
        items: [
          { key: 'expenses', label: 'Expenses', icon: <Receipt size={18} />, adminOnly: true },
          { key: 'reports', label: 'Reports', icon: <LineChart size={18} />, adminOnly: true }
        ]
      });
    }

    if (currentModule) {
      navGroups.push({
        group: 'System',
        items: [
          ...(currentModule === 'restaurant' ? [{ key: 'tables', label: 'Table Config', icon: <Table size={18} />, adminOnly: true }] : []),
          { key: 'settings', label: 'Settings', icon: <Settings2 size={18} />, adminOnly: true },
        ]
      });
    }
  } else {
    // Isolated Mode navGroups
    navGroups = [
      {
        group: businessType === 'service' ? 'Workspace' : 'Sales & POS',
        items: [
          ...(businessType === 'service' ? [
            { key: 'management_dash', label: 'Gantt & Timelines', icon: <CalendarDays size={18} />, adminOnly: true },
            { key: 'worker_dash', label: 'My Action Feed', icon: <CheckSquare size={18} />, adminOnly: false },
            { key: 'crm', label: 'CRM & Pipeline', icon: <Target size={18} />, adminOnly: true },
            { key: 'projects', label: 'Projects', icon: <Briefcase size={18} />, adminOnly: true },
            { key: 'tasks', label: 'My Tasks', icon: <CheckSquare size={18} />, adminOnly: false },
            { key: 'time', label: 'Time Logs', icon: <Timer size={18} />, adminOnly: false },
            { key: 'appointments', label: 'Appointments', icon: <CalendarDays size={18} />, adminOnly: false },
          ] : [
            { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, adminOnly: true },
            { key: 'pos', label: 'POS Terminal', icon: <TerminalSquare size={18} />, adminOnly: false },
            ...(businessType === 'restaurant' ? [{ key: 'kitchen', label: 'Kitchen Display', icon: <MonitorPlay size={18} />, adminOnly: false }] : []),
            { key: 'grid', label: 'Daily Grid', icon: <CalendarDays size={18} />, adminOnly: false },
            { key: 'sales', label: 'Sales List', icon: <ListOrdered size={18} />, adminOnly: true },
            { key: 'receipts', label: 'Receipts & Refunds', icon: <ReceiptText size={18} />, adminOnly: true }
          ])
        ]
      },
      {
        group: businessType === 'service' ? 'Billing & Catalog' : 'Inventory',
        items: [
          ...(businessType === 'service' ? [
            { key: 'invoices', label: 'Invoice Maker', icon: <FileText size={18} />, adminOnly: false },
            { key: 'products', label: 'Services & Offerings', icon: <PackageSearch size={18} />, adminOnly: true },
          ] : [
            { key: 'products', label: 'Finished Products', icon: <PackageSearch size={18} />, adminOnly: true },
            ...(businessType === 'restaurant' ? [{ key: 'ingredients', label: 'Raw Ingredients', icon: <Wheat size={18} />, adminOnly: true }] : []),
            { key: 'suppliers', label: 'Suppliers & POs', icon: <Truck size={18} />, adminOnly: true }
          ])
        ]
      },
      {
        group: 'People & Access',
        items: [
          ...(businessType !== 'service' ? [
            { key: 'timecards', label: 'Timecards', icon: <Clock size={18} />, adminOnly: false },
            { key: 'team', label: 'Team', icon: <UserCircle size={18} />, adminOnly: true },
          ] : []),
          { key: 'customers', label: 'Customers', icon: <Users size={18} />, adminOnly: false },
          { key: 'users', label: 'Users', icon: <Shield size={18} />, adminOnly: true },
        ]
      },
      {
        group: 'Finance',
        items: [
          { key: 'expenses', label: 'Expenses', icon: <Receipt size={18} />, adminOnly: true },
          ...(businessType !== 'service' ? [
            { key: 'reports', label: 'Reports', icon: <LineChart size={18} />, adminOnly: true },
          ] : [])
        ]
      },
      {
        group: 'System',
        items: [
          ...(businessType === 'restaurant' ? [{ key: 'tables', label: 'Table Config', icon: <Table size={18} />, adminOnly: true }] : []),
          { key: 'settings', label: 'Settings', icon: <Settings2 size={18} />, adminOnly: true },
        ]
      }
    ];
  }

  return (
    <div className={`app ${isSecondary ? 'secondary-layout' : ''}`}>
      {/* Secondary Display Exit Button */}
      {isSecondary && (
        <button 
          onClick={() => { window.location.href = window.location.pathname; }}
          style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            zIndex: 9999,
            backgroundColor: '#10b981', // Emerald green
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          title="Exit Assigned Display Mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Exit Display
        </button>
      )}

      {/* Sidebar */}
      {!isSecondary && !(businessType === 'general' && !currentModule) && (() => {
        const sidebarGradients: Record<string, string> = {
          retail: 'linear-gradient(180deg, #064e3b 0%, #047857 50%, #059669 100%)',
          restaurant: 'linear-gradient(180deg, #451a03 0%, #6b2f0a 50%, #78350f 100%)',
          service: 'linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
          projects: 'linear-gradient(180deg, #064e3b 0%, #0f766e 50%, #0d9488 100%)',
          inventory: 'linear-gradient(180deg, #451a03 0%, #713f12 50%, #854d0e 100%)',
          hr: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
          finance: 'linear-gradient(180deg, #4c0519 0%, #6b0f2a 50%, #881337 100%)',
        };
        const sidebarBg = currentModule && sidebarGradients[currentModule] ? sidebarGradients[currentModule] : undefined;
        return (
        <div 
          className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
          style={sidebarBg ? { background: sidebarBg } : undefined}
        >
          <div className="sidebar-header" style={{ padding: isSidebarCollapsed ? '20px 10px' : '20px', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between' }}>
            {!isSidebarCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {businessType === 'general' && (
                  <button onClick={() => setCurrentModule(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Back to Apps">
                    <LayoutGrid size={24} />
                  </button>
                )}
                <img src="/logo.png" alt="Rita" style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
                <h1 style={{ fontSize: '1.1rem', margin: 0, fontWeight: '800', letterSpacing: '0.5px' }}>
                  Rita BMT
                </h1>
              </div>
            )}
            <button className="collapse-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <Menu size={20} />
            </button>
          </div>

        <div className="sidebar-nav">
          {navGroups.map((g, idx) => {
            const visibleItems = g.items.filter(i => currentUser.role?.toLowerCase() === 'admin' || !i.adminOnly);
            if (visibleItems.length === 0) return null;
            return (
              <div key={idx} style={{ marginBottom: '15px' }}>
                <div className="sidebar-text" style={{ padding: '0 20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {g.group}
                </div>
                <ul>
                  {visibleItems.map(item => (
                    <li 
                      key={item.key}
                      className={page === item.key ? 'active' : ''} 
                      onClick={() => setPage(item.key)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 20px', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      {item.icon}
                      <span className="sidebar-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                    </li>
                  ))}
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
      );})()}

      <main className="app-main">
        {businessType === 'general' && !currentModule ? (
          <AppSwitcher setCurrentModule={setCurrentModule} currentUser={currentUser} onLogout={handleLogout} toggleTheme={toggleTheme} theme={theme} setPage={setPage} />
        ) : (
          <>
            {page === 'dashboard' && (
              <Dashboard currentUser={currentUser} sales={filteredSales} filter={filter} setFilter={setFilter} categories={categories} lowStockItems={lowStockItems} />
            )}
            {effectiveType === 'restaurant' && page === 'kitchen' && (
              <KDS />
            )}
            {page === 'timecards' && (
              <EmployeeTimecards currentUser={currentUser} />
            )}
            {page === 'pos' && effectiveType === 'restaurant' && (
              <RestaurantPOS currentUser={currentUser} categories={categories} sales={sales} onSave={loadAllData} />
            )}
            {page === 'pos' && effectiveType !== 'restaurant' && (
              <RetailPOS currentUser={currentUser} categories={categories} sales={sales} onSave={loadAllData} />
            )}
            {page === 'grid' && effectiveType !== 'service' && (
              <DailyGridForm onSave={loadAllData} accounters={accounters} currentUser={currentUser} />
            )}
            {page === 'appointments' && effectiveType === 'service' && (
              <Appointments currentUser={currentUser} />
            )}
            {page === 'management_dash' && (effectiveType === 'service' || effectiveType === 'projects') && (
              <ManagementDashboard currentUser={currentUser} />
            )}
            {page === 'worker_dash' && (effectiveType === 'service' || effectiveType === 'projects') && (
              <WorkerDashboard currentUser={currentUser} />
            )}
            {page === 'crm' && effectiveType === 'service' && (
              <CRM />
            )}
            {page === 'projects' && (effectiveType === 'service' || effectiveType === 'projects') && (
              <Projects setPage={setPage} setSelectedProjectId={setSelectedProjectId} />
            )}
            {page === 'portal' && (effectiveType === 'service' || effectiveType === 'projects') && selectedProjectId && (
              <ClientPortal projectId={selectedProjectId} setPage={setPage} setSelectedProjectId={setSelectedProjectId} />
            )}
            {page === 'tasks' && (effectiveType === 'service' || effectiveType === 'projects') && (
              <Tasks currentUser={currentUser} selectedProjectId={selectedProjectId} setPage={setPage} setSelectedProjectId={setSelectedProjectId} />
            )}
            {page === 'time' && (effectiveType === 'service' || effectiveType === 'projects') && (
              <TimeEntries currentUser={currentUser} />
            )}
            {page === 'invoices' && (
              <InvoiceMaker currentUser={currentUser} />
            )}
            {page === 'add' && (
              <SalesForm
                onSubmit={editingSale ? updateSale : addSale}
                sale={editingSale}
                categories={categories}
                accounters={accounters}
                onCancel={() => setEditingSale(null)}
                currentUser={currentUser}
              />
            )}
            { page === 'sales' && (
              <SalesList
                sales={sales}
                filter={filter}
                setFilter={setFilter}
                categories={categories}
                onEdit={(sale: any) => { setEditingSale(sale); setPage('add'); }}
                onDelete={deleteSale}
                currentUser={currentUser}
              />
            )}
            {page === 'receipts' && (
              <ReceiptsHistory sales={sales} currentUser={currentUser} onRefresh={loadAllData} />
            )}
            {page === 'products' && (
              <ProductsManagement categories={categories} currentUser={currentUser} businessType={effectiveType} />
            )}
            {page === 'suppliers' && (
              <SuppliersManagement currentUser={currentUser} />
            )}
            {page === 'customers' && (
              <Customers currentUser={currentUser} />
            )}
            {page === 'ingredients' && (
              <Ingredients currentUser={currentUser} />
            )}
            {page === 'expenses' && (
              <Expenses currentUser={currentUser} />
            )}
            {page === 'reports' && (
              <Reports sales={filteredSales} filter={filter} setFilter={setFilter} categories={categories} lowStockItems={lowStockItems} />
            )}
            {page === 'team' && (
              <AccountersManagement />
            )}
        {page === 'users' && (
          <UsersManagement currentUser={currentUser} />
        )}
        {page === 'tables' && (
          <TablesManagement currentUser={currentUser} />
        )}
        {page === 'settings' && (
          <Settings theme={theme} toggleTheme={toggleTheme} />
        )}
          </>
        )}
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
                    {lowStockItems.map(item => (
                      <tr key={item.id}>
                        <td><span className="badge">{item.type.toUpperCase()}</span></td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{item.stockQuantity}</td>
                        <td>{item.lowStockThreshold}</td>
                        <td>
                          <button 
                            className="btn-sm" 
                            onClick={() => {
                              setPage(item.type === 'product' ? 'products' : 'ingredients');
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
      {businessType === 'restaurant' && page !== 'kitchen' && <FoodReadyAlerts />}
      </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <InnerApp />
      </ConfirmProvider>
    </ToastProvider>
  );
}

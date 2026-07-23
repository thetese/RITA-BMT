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
import Settings from './components/Settings';
import POS from './components/POS';

export default function App() {
  const api = window.api;
  
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  const [sales, setSales] = useState([]);
  const [accounters, setAccounters] = useState([]);
  const [page, setPage] = useState('dashboard');
  const [editingSale, setEditingSale] = useState(null);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', category: '' });

  useEffect(() => {
    if (!api) return;
    api.getSetting('theme').then(savedTheme => {
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'dark') document.body.classList.add('dark');
      }
    });
  }, [api]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    if (api) api.setSetting('theme', newTheme);
  };

  const loadSales = useCallback(async () => {
    if (!api) return;
    try {
      const data = await api.getSales();
      setSales(data);
    } catch (err) {
      console.error(err);
    }
  }, [api]);

  const loadAccounters = useCallback(async () => {
    if (!api) return;
    try {
      const data = await api.getAccounters();
      setAccounters(data);
    } catch (err) {
      console.error(err);
    }
  }, [api]);

  useEffect(() => { 
    if (currentUser) {
      loadSales(); 
      loadAccounters();
    }
  }, [currentUser, loadSales, loadAccounters]);

  const handleLogout = () => {
    setCurrentUser(null);
    setPage('dashboard');
  };

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  const addSale = async (sale) => {
    await api.addSale(sale, currentUser.id);
    await loadSales();
  };

  const updateSale = async (sale) => {
    await api.updateSale(sale, currentUser.id);
    setEditingSale(null);
    await loadSales();
  };

  const deleteSale = async (id) => {
    if (confirm('Delete this sale record?')) {
      await api.deleteSale(id, currentUser.id);
      await loadSales();
    }
  };

  const categories = [...new Set(sales.map(s => s.category))];

  const filteredSales = sales.filter(s => {
    const matchDate = (!filter.startDate || s.date >= filter.startDate) &&
      (!filter.endDate || s.date <= filter.endDate);
    const matchCategory = !filter.category || s.category === filter.category;
    return matchDate && matchCategory;
  });

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', adminOnly: false },
    { key: 'pos', label: 'POS', adminOnly: false },
    { key: 'grid', label: 'Daily Grid', adminOnly: false },
    { key: 'add', label: 'New Sale', adminOnly: false },
    { key: 'sales', label: 'Sales List', adminOnly: false },
    { key: 'products', label: 'Inventory', adminOnly: false },
    { key: 'customers', label: 'Customers', adminOnly: false },
    { key: 'expenses', label: 'Expenses', adminOnly: true },
    { key: 'reports', label: 'Reports', adminOnly: true },
    { key: 'team', label: 'Team', adminOnly: true },
    { key: 'users', label: 'Users', adminOnly: true },
    { key: 'settings', label: 'Settings', adminOnly: true },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="./logo.png" alt="Rita Logo" style={{ height: '50px', objectFit: 'contain' }} onError={(e) => e.target.style.display='none'} />
          <h1>Rita Reports</h1>
        </div>
        <nav>
          {navItems.filter(item => !item.adminOnly || currentUser.role === 'Admin').map(item => (
            <button
              key={item.key}
              className={`nav-btn ${page === item.key ? 'active' : ''}`}
              onClick={() => setPage(item.key)}
            >
              {item.label}
            </button>
          ))}
          <button className="nav-btn" onClick={handleLogout} style={{ marginLeft: 'auto', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '16px' }}>
            Logout ({currentUser.username})
          </button>
        </nav>
      </header>

      <main className="app-main">
        {page === 'dashboard' && (
          <Dashboard sales={filteredSales} filter={filter} setFilter={setFilter} categories={categories} />
        )}
        {page === 'pos' && (
          <POS currentUser={currentUser} categories={categories} />
        )}
        {page === 'grid' && (
          <DailyGridForm onSave={loadSales} accounters={accounters} currentUser={currentUser} />
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
        {page === 'sales' && (
          <SalesList
            sales={sales}
            filter={filter}
            setFilter={setFilter}
            categories={categories}
            onEdit={(sale) => { setEditingSale(sale); setPage('add'); }}
            onDelete={deleteSale}
            currentUser={currentUser}
          />
        )}
        {page === 'products' && (
          <ProductsManagement categories={categories} currentUser={currentUser} />
        )}
        {page === 'customers' && (
          <Customers currentUser={currentUser} />
        )}
        {page === 'expenses' && (
          <Expenses currentUser={currentUser} />
        )}
        {page === 'reports' && (
          <Reports sales={filteredSales} filter={filter} setFilter={setFilter} categories={categories} />
        )}
        {page === 'team' && (
          <AccountersManagement />
        )}
        {page === 'users' && (
          <UsersManagement currentUser={currentUser} />
        )}
        {page === 'settings' && (
          <Settings theme={theme} toggleTheme={toggleTheme} />
        )}
      </main>
    </div>
  );
}

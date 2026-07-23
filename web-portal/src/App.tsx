import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { LayoutDashboard, LogOut, Package, Receipt, Users, AlertTriangle } from 'lucide-react';
import bcrypt from 'bcryptjs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import './App.css';

function App() {
  const [session, setSession] = useState<any>(null);
  const [storeId, setStoreId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  // Dashboard Data
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const localSession = localStorage.getItem('portalSession');
    if (localSession) {
      const parsed = JSON.parse(localSession);
      setSession(parsed);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) {
      fetchDashboardData(session.storeId);
    }
  }, [session]);

  const fetchDashboardData = async (currentStoreId: string) => {
    // Manually filter by storeId since we are not using Supabase RLS yet
    const { data: salesData } = await supabase
      .from('sales')
      .select('*')
      .eq('storeId', currentStoreId)
      .order('createdAt', { ascending: false })
      .limit(20);
    if (salesData) setSales(salesData);

    const { data: productsData } = await supabase.from('products').select('*').eq('storeId', currentStoreId);
    if (productsData) setProducts(productsData);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('storeId', storeId)
      .single();

    if (error || !user) {
      alert("Invalid Store ID or Username");
      return;
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      alert("Invalid password");
      return;
    }

    if (user.role !== 'Admin') {
      alert("Access Denied: Only Administrators can access the cloud portal.");
      return;
    }

    const newSession = { id: user.id, username: user.username, storeId: user.storeId, role: user.role };
    localStorage.setItem('portalSession', JSON.stringify(newSession));
    setSession(newSession);
  };

  const handleLogout = async () => {
    localStorage.removeItem('portalSession');
    setSession(null);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>Loading...</div>;

  if (!session) {
    return (
      <div className="login-container">
        <div className="login-card animate-fade-in">
          <h2>Store Portal</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Store Code</label>
              <input type="text" value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="e.g. MAIN-STORE" required />
            </div>
            <div className="input-group">
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  const totalSales = sales.reduce((acc, curr) => acc + (curr.total || 0), 0);

  // Prepare chart data
  const chartData = [...sales].reverse().map((sale) => ({
    name: new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    total: sale.total || 0,
  }));

  const COLORS = ['#10b981', '#06b6d4', '#4f46e5', '#8b5cf6'];
  const categoryCount: Record<string, number> = {};
  products.forEach(p => {
    const cat = p.category || 'Uncategorized';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const pieData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2><LayoutDashboard color="#10b981" /> Store Portal</h2>
        <div className="nav-item active"><LayoutDashboard size={20} /> Overview</div>
        <div className="nav-item"><Receipt size={20} /> Sales</div>
        <div className="nav-item"><Package size={20} /> Inventory</div>
        <div className="nav-item"><Users size={20} /> Customers</div>
        
        <div style={{ flex: 1 }}></div>
        <div className="nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
          <LogOut size={20} /> Sign Out
        </div>
      </div>
      
      <div className="main-content">
        <div className="header animate-fade-in">
          <div>
            <h1 style={{ margin: 0, fontSize: '32px' }}>Welcome back, {session.username}</h1>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>Store Code: <strong>{session.storeId}</strong></p>
          </div>
          <div className="sync-badge">
            <div className="sync-dot"></div> Live Sync Active
          </div>
        </div>

        {(() => {
          const todayDateObj = new Date();
          const nextWeekObj = new Date();
          nextWeekObj.setDate(todayDateObj.getDate() + 7);
          const expiringProducts = products.filter(p => {
            if (!p.expirationDate || p.stockQuantity <= 0) return false;
            const expDate = new Date(p.expirationDate);
            return expDate <= nextWeekObj;
          });

          if (expiringProducts.length === 0) return null;

          return (
            <div className="alert-banner animate-fade-in" style={{ animationDelay: '0.1s' }}>
               <AlertTriangle size={24} color="#ef4444" />
               <div style={{ color: '#f8fafc' }}>
                 <strong style={{ display: 'block', color: '#ef4444', marginBottom: '4px' }}>Inventory Alert</strong>
                 You have {expiringProducts.length} product(s) expiring within the next 7 days.
               </div>
            </div>
          );
        })()}

        <div className="stats-grid animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-card">
            <h3>Recent Revenue</h3>
            <p className="value">${totalSales.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Recent Orders</h3>
            <p className="value">{sales.length}</p>
          </div>
          <div className="stat-card">
            <h3>Products in Catalog</h3>
            <p className="value">{products.length}</p>
          </div>
        </div>

        <div className="charts-grid animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="chart-card">
            <h3>Revenue Trend (Recent)</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card">
            <h3>Products by Category</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Recent Transactions</h2>
        <div className="table-container animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <table>
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Date / Time</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No recent sales found. Sync your desktop app to see data here.</td></tr>
              ) : (
                sales.slice(0, 10).map((sale) => (
                  <tr key={sale.id}>
                    <td style={{ fontWeight: 500 }}>{sale.receiptNumber || sale.id.substring(0, 8)}</td>
                    <td>{new Date(sale.createdAt).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>${(sale.total || 0).toFixed(2)}</td>
                    <td><span className="status-pill">Completed</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, RadialBarChart, RadialBar } from 'recharts';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Dashboard({ sales, filter, setFilter, categories }) {
  const [products, setProducts] = useState([]);
  const [monthlyTarget, setMonthlyTarget] = useState(1000000); // 1M default

  useEffect(() => {
    if (window.api) {
      window.api.getProducts().then(setProducts);
      window.api.getSetting('monthlyTarget').then(val => {
        if (val) setMonthlyTarget(Number(val));
      });
    }
  }, []);

  const handleTargetChange = (e) => {
    const val = e.target.value;
    setMonthlyTarget(val);
    if (window.api) window.api.setSetting('monthlyTarget', val);
  };

  const totalSales = sales.reduce((sum, s) => sum + s.totalPrice, 0);
  const totalCost = sales.reduce((sum, s) => sum + (s.costPrice || 0) * s.quantity, 0);
  const totalInterest = totalSales - totalCost;
  const totalQuantity = sales.reduce((sum, s) => sum + s.quantity, 0);

  const dailyMap = {};
  sales.forEach(s => {
    if (!dailyMap[s.date]) dailyMap[s.date] = { total: 0, interest: 0 };
    dailyMap[s.date].total += s.totalPrice;
    dailyMap[s.date].interest += s.totalPrice - ((s.costPrice || 0) * s.quantity);
  });
  const dailyData = Object.entries(dailyMap)
    .map(([date, data]) => ({ date, total: data.total, interest: data.interest }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const catMap = {};
  sales.forEach(s => {
    catMap[s.category] = (catMap[s.category] || 0) + s.totalPrice;
  });
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  const itemMap = {};
  sales.forEach(s => {
    itemMap[s.productName] = (itemMap[s.productName] || 0) + s.quantity;
  });
  const topSellers = Object.entries(itemMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const lowStockProducts = products.filter(p => p.stockQuantity <= 10 && p.stockQuantity > 0);
  const outOfStockProducts = products.filter(p => p.stockQuantity === 0);

  const targetProgress = Math.min((totalSales / monthlyTarget) * 100, 100) || 0;
  const radialData = [
    { name: 'Goal', value: 100, fill: 'var(--hover-bg)' },
    { name: 'Progress', value: targetProgress, fill: targetProgress >= 100 ? 'var(--success)' : 'var(--primary)' }
  ];

  return (
    <div className="dashboard">
      <div className="filter-bar">
        <input type="date" value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} />
        <input type="date" value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} />
        <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target (FRW):</label>
          <input type="number" value={monthlyTarget} onChange={handleTargetChange} style={{ width: '120px' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', marginBottom: '24px' }}>
        <div>
          <div className="summary-cards" style={{ marginBottom: 0 }}>
            <div className="card"><h3>Total Sales</h3><p className="value">{totalSales.toLocaleString()} FRW</p></div>
            <div className="card"><h3>Total Cost</h3><p className="value">{totalCost.toLocaleString()} FRW</p></div>
            <div className="card"><h3>Total Gross Profit</h3><p className="value interest">{totalInterest.toLocaleString()} FRW</p></div>
            <div className="card"><h3>Items Sold</h3><p className="value">{totalQuantity}</p></div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 0, padding: '10px' }}>
          <h3>Goal Progress</h3>
          <ResponsiveContainer width="100%" height={120}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={15} data={radialData} startAngle={180} endAngle={0}>
              <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
              <Tooltip cursor={{ fill: 'transparent' }} formatter={(val, name) => [val.toFixed(1) + '%', name]} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '-25px', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
            {targetProgress.toFixed(1)}%
          </div>
        </div>
      </div>

      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', backgroundColor: 'var(--danger-hover)' }}>
          <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ Inventory Alerts
          </h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
            {outOfStockProducts.length > 0 && (
              <div>
                <strong>Out of Stock:</strong>
                <ul style={{ marginLeft: '20px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {outOfStockProducts.map(p => <li key={p.id}>{p.productName}</li>)}
                </ul>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div>
                <strong>Low Stock (≤ 10):</strong>
                <ul style={{ marginLeft: '20px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {lowStockProducts.map(p => <li key={p.id}>{p.productName} ({p.stockQuantity} left)</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="charts">
        <div className="chart-box">
          <h3>Daily Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <Bar dataKey="total" fill="var(--primary)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-box">
          <h3>Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{ fill: 'var(--text-primary)', fontSize: 12 }}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-box full-width" style={{ marginTop: '20px' }}>
          <h3>Profit Margin Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <Line type="monotone" dataKey="interest" stroke="var(--success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box full-width" style={{ marginTop: '20px' }}>
          <h3>Top 5 Best Sellers (By Quantity)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSellers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis dataKey="name" type="category" width={100} stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <Bar dataKey="qty" fill="#f59e0b" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

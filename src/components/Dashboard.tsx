// @ts-nocheck
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar, AreaChart, Area 
} from 'recharts';
import { Sparkles, AlertTriangle, FileDown, Printer, Bot } from 'lucide-react';
import '../styles/App.css';
import { generateZReportHTML } from '../utils/receiptGenerator';
import { useToast } from './ui/Toast';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Dashboard({ sales, filter, setFilter, categories, lowStockItems = [] }) {
  const [products, setProducts] = useState([]);
  const [monthlyTarget, setMonthlyTarget] = useState(1000000); // 1M default
  const [activeTab, setActiveTab] = useState('today');
  const { showToast } = useToast();

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

  const lowStockProducts = lowStockItems.filter(p => p.stockQuantity > 0);
  const outOfStockProducts = lowStockItems.filter(p => p.stockQuantity <= 0);

  const targetProgress = Math.min((totalSales / monthlyTarget) * 100, 100) || 0;
  const radialData = [
    { name: 'Goal', value: 100, fill: 'var(--hover-bg)' },
    { name: 'Progress', value: targetProgress, fill: targetProgress >= 100 ? 'var(--success)' : 'var(--primary)' }
  ];

  // Predictive Reorder Logic (Last 30 Days Velocity)
  const todayDate = new Date();
  const thirtyDaysAgo = new Date(todayDate);
  thirtyDaysAgo.setDate(todayDate.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const recentSales = sales.filter(s => s.date >= thirtyDaysAgoStr);
  const velocityMap = {};
  recentSales.forEach(s => {
    // try to match by productId, fallback to productName
    const key = s.productId || s.productName;
    velocityMap[key] = (velocityMap[key] || 0) + s.quantity;
  });

  const reorderSuggestions = products.map(p => {
    const soldIn30Days = velocityMap[p.id] || velocityMap[p.productName] || 0;
    const dailyVelocity = soldIn30Days / 30;
    const daysOfStockLeft = dailyVelocity > 0 ? p.stockQuantity / dailyVelocity : 999;
    
    if (daysOfStockLeft <= 14 && dailyVelocity > 0 && p.stockQuantity < 500) {
      const suggestedReorder = Math.ceil((dailyVelocity * 30) - p.stockQuantity);
      if (suggestedReorder > 0) {
        return {
          id: p.id,
          name: p.productName,
          stock: p.stockQuantity,
          daysLeft: Math.floor(daysOfStockLeft),
          runOutDateStr: new Date(Date.now() + daysOfStockLeft * 86400000).toLocaleDateString(),
          suggestedReorder
        };
      }
    }
    return null;
  }).filter(Boolean).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 6);

  const generateAiSummary = () => {
    if (sales.length === 0) return "Not enough data yet. Start selling to get AI insights!";
    
    let bestDay = null;
    let maxSales = 0;
    Object.entries(dailyMap).forEach(([date, data]) => {
      if (data.total > maxSales) { maxSales = data.total; bestDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }); }
    });

    const bestProduct = topSellers[0] ? topSellers[0].name : 'N/A';

    const actualProgress = monthlyTarget ? (totalSales / monthlyTarget) * 100 : 0;
    const targetStatus = actualProgress >= 100 
      ? `You have crushed your target by ${(actualProgress - 100).toFixed(1)}%! Fantastic job.`
      : `You are at ${actualProgress.toFixed(1)}% of your goal. You need ${(monthlyTarget - totalSales).toLocaleString()} FRW more to hit it.`;

    const marginAlert = totalInterest < (totalSales * 0.1) 
      ? "However, your overall gross margins seem a bit low—consider reviewing your pricing strategy."
      : "Your gross margins are looking very healthy.";

    const restockAlert = outOfStockProducts.length > 0
      ? `Critical: You have ${outOfStockProducts.length} items out of stock! Restock immediately to avoid losing sales.`
      : lowStockProducts.length > 0 
        ? `Warning: ${lowStockProducts.length} items are running low. Consider reordering soon.`
        : `Inventory levels are currently stable.`;

    return `Based on recent data, your most profitable days are usually ${bestDay || 'weekends'}. Your customers are loving "${bestProduct}". ${targetStatus} ${marginAlert} ${restockAlert}`;
  };

  const handlePrintZReport = async () => {
    try {
      const expenses = await window.api.getExpenses();
      const businessName = await window.api.getSetting('businessName') || '';
      const businessAddress = await window.api.getSetting('businessAddress') || '';
      const businessPhone = await window.api.getSetting('businessPhone') || '';
      
      const html = generateZReportHTML(sales, expenses, { businessName, businessAddress, businessPhone });
      const printerName = await window.api.getSetting('receiptPrinter');
      const res = await window.api.printReceipt(html, printerName || '');
      if (res.success) showToast("Z-Report printed successfully!", "success");
      else showToast("Printing failed: " + res.errorType, "error");
    } catch (e) {
      showToast("Error printing Z-Report: " + e.message, "error");
    }
  };

  const handleExportCSV = () => {
    if (sales.length === 0) {
      showToast("No sales to export in the current filter range.", "error");
      return;
    }
    const headers = ["ID", "Date", "Product", "Category", "Quantity", "Unit Price", "Total Price", "Payment Method", "Customer Name", "Receipt ID"];
    const rows = sales.map(s => [
      s.id, s.date, `"${s.productName}"`, `"${s.category}"`, s.quantity, s.unitPrice, s.totalPrice, s.paymentMethod || 'Cash', `"${s.customerName || ''}"`, s.receiptId || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard">
      {/* ── Tab Bar ── */}
      <div className="dashboard-tabs">
        <button className={`dashboard-tab ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>Today</button>
        <button className={`dashboard-tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Reports</button>
        <button className={`dashboard-tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Inventory Risks</button>
      </div>

      {/* ══════════════ TODAY TAB ══════════════ */}
      {activeTab === 'today' && (
        <>
          <div className="filter-bar">
            <input type="date" value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} />
            <input type="date" value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} />
            <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleExportCSV}>
                <FileDown size={14} /> Export CSV
              </button>
              <button className="btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handlePrintZReport}>
                <Printer size={14} /> Z-Report (Today)
              </button>
              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }}></div>
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

          {/* AI Summary */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary)', marginBottom: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0', color: 'var(--primary)' }}>
              <Sparkles size={20} /> AI Summary
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
              {generateAiSummary()}
            </p>
          </div>
        </>
      )}

      {/* ══════════════ REPORTS TAB ══════════════ */}
      {activeTab === 'reports' && (
        <>
          <div className="filter-bar">
            <input type="date" value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} />
            <input type="date" value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} />
            <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="charts">
            <div className="chart-box">
              <h3>Sales Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <Area type="monotone" dataKey="total" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-box">
              <h3>Revenue by Category</h3>
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
              <h3>Top Sellers</h3>
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
        </>
      )}

      {/* ══════════════ INVENTORY RISKS TAB ══════════════ */}
      {activeTab === 'inventory' && (
        <>
          {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) ? (
            <div className="card" style={{ borderLeft: '4px solid var(--danger)', backgroundColor: 'var(--danger-hover)' }}>
              <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                <AlertTriangle size={20} /> Inventory Alerts
              </h3>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                {outOfStockProducts.length > 0 && (
                  <div>
                    <strong>Out of Stock:</strong>
                    <ul style={{ marginLeft: '20px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {outOfStockProducts.map(p => <li key={p.id}>{p.name} <span style={{fontSize: '0.8em', color: 'gray'}}>({p.type})</span></li>)}
                    </ul>
                  </div>
                )}
                {lowStockProducts.length > 0 && (
                  <div>
                    <strong>Low Stock Warnings:</strong>
                    <ul style={{ marginLeft: '20px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {lowStockProducts.map(p => <li key={p.id}>{p.name} <span style={{fontSize: '0.8em', color: 'gray'}}>({p.type})</span> - {p.stockQuantity} left (Threshold: {p.lowStockThreshold})</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1.1rem' }}>✅ All stock levels are healthy. No alerts at this time.</p>
            </div>
          )}

          {reorderSuggestions.length > 0 ? (
            <div className="card" style={{ borderLeft: '4px solid #f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.05)', marginTop: '20px' }}>
              <h3 style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 15px 0' }}>
                <Bot size={20} /> AI Reorder Suggestions
              </h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Current Stock</th>
                      <th>Est. Stockout Date</th>
                      <th>Suggested Order (30 Days)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reorderSuggestions.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td>{p.stock}</td>
                        <td style={{ color: p.daysLeft <= 3 ? 'var(--danger)' : 'inherit', fontWeight: p.daysLeft <= 3 ? 'bold' : 'normal' }}>
                          {p.runOutDateStr} <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>({p.daysLeft} days)</span>
                        </td>
                        <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>+{p.suggestedReorder} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', marginTop: '20px' }}>
              <Bot size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem' }}>No reorder suggestions at the moment. All products have adequate stock levels.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

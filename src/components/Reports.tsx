// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { useToast } from './ui/Toast';

export default function Reports({ sales, filter, setFilter, categories, lowStockItems = [] }) {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [timecards, setTimecards] = useState([]);
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (window.api) {
      window.api.getExpenses().then(data => {
        const filteredExp = data.filter(e => {
          const matchDate = (!filter.startDate || e.date >= filter.startDate) &&
                            (!filter.endDate || e.date <= filter.endDate);
          return matchDate;
        });
        setExpenses(filteredExp);
      });
      
      window.api.getTimecards().then(data => setTimecards(data));
      window.api.getUsers().then(data => setUsers(data));
      if (window.api.getInvoices) {
        window.api.getInvoices().then(data => {
          const filteredInv = data.filter(i => {
            const dateStr = i.createdAt.slice(0, 10);
            const matchDate = (!filter.startDate || dateStr >= filter.startDate) &&
                              (!filter.endDate || dateStr <= filter.endDate);
            const matchCategory = !filter.category || filter.category === 'Service';
            return matchDate && matchCategory;
          });
          setInvoices(filteredInv);
        });
      }
    }
  }, [filter]);

  const totalSales = sales.reduce((sum, s) => sum + s.totalPrice, 0);
  const invoiceRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + (i.total || 0), 0);
  const totalRevenue = totalSales + invoiceRevenue;
  const totalCost = sales.reduce((sum, s) => sum + (s.costPrice || 0) * s.quantity, 0);
  const totalGrossProfit = totalSales - totalCost + invoiceRevenue;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalGrossProfit - totalExpenses;
  const marginRate = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  const monthlyMap = {};
  sales.forEach(s => {
    const month = s.date.slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { sales: 0, invoice: 0, cost: 0, gross: 0, expenses: 0 };
    monthlyMap[month].sales += s.totalPrice;
    monthlyMap[month].cost += (s.costPrice || 0) * s.quantity;
    monthlyMap[month].gross += s.totalPrice - (s.costPrice || 0) * s.quantity;
  });
  invoices.filter(i => i.status === 'PAID').forEach(i => {
    const month = i.createdAt.slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { sales: 0, invoice: 0, cost: 0, gross: 0, expenses: 0 };
    monthlyMap[month].invoice += (i.total || 0);
    monthlyMap[month].gross += (i.total || 0);
  });
  expenses.forEach(e => {
    const month = e.date.slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { sales: 0, invoice: 0, cost: 0, gross: 0, expenses: 0 };
    monthlyMap[month].expenses += e.amount;
  });
  
  const monthlyData = Object.entries(monthlyMap)
    .map(([month, data]) => ({ 
      month, 
      sales: data.sales + data.invoice, 
      cost: data.cost, 
      expenses: data.expenses, 
      netProfit: data.gross - data.expenses 
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const catMap = {};
  sales.forEach(s => {
    if (!catMap[s.category]) catMap[s.category] = { sales: 0, cost: 0, qty: 0 };
    catMap[s.category].sales += s.totalPrice;
    catMap[s.category].cost += (s.costPrice || 0) * s.quantity;
    catMap[s.category].qty += s.quantity;
  });
  invoices.filter(i => i.status === 'PAID').forEach(i => {
    let items = typeof i.items === 'string' ? JSON.parse(i.items || '[]') : (i.items || []);
    items.forEach(item => {
      let cat = item.category || 'Service';
      if (!catMap[cat]) catMap[cat] = { sales: 0, cost: 0, qty: 0 };
      catMap[cat].sales += item.quantity * item.unitPrice;
      catMap[cat].qty += item.quantity;
    });
  });
  const catData = Object.entries(catMap).map(([cat, d]) => ({
    category: cat,
    sales: d.sales,
    cost: d.cost,
    interest: d.sales - d.cost,
    qty: d.qty,
  })).sort((a, b) => b.sales - a.sales);

  const paymentMap = {};
  sales.forEach(s => {
    let method = s.paymentMethod || 'Unknown';
    if (!paymentMap[method]) paymentMap[method] = { revenue: 0 };
    paymentMap[method].revenue += s.totalPrice;
  });
  invoices.filter(i => i.status === 'PAID').forEach(i => {
    let method = 'Invoice/Bank Transfer';
    if (!paymentMap[method]) paymentMap[method] = { revenue: 0 };
    paymentMap[method].revenue += (i.total || 0);
  });
  const paymentData = Object.entries(paymentMap).map(([name, data]) => ({ name, value: data.revenue }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];

  // Analytics Computations
  // 1. Top Performing Items
  const itemsMap = {};
  sales.forEach(s => {
    if (!itemsMap[s.productName]) itemsMap[s.productName] = { quantity: 0, revenue: 0 };
    itemsMap[s.productName].quantity += s.quantity;
    itemsMap[s.productName].revenue += s.totalPrice;
  });
  invoices.filter(i => i.status === 'PAID').forEach(i => {
    let items = typeof i.items === 'string' ? JSON.parse(i.items || '[]') : (i.items || []);
    items.forEach(item => {
      let name = item.description || 'Service Billed';
      if (!itemsMap[name]) itemsMap[name] = { quantity: 0, revenue: 0 };
      itemsMap[name].quantity += item.quantity;
      itemsMap[name].revenue += item.quantity * item.unitPrice;
    });
  });
  const topItemsData = Object.entries(itemsMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // 2. Peak Traffic Hours
  const hourlyMap = {};
  for (let i = 6; i < 24; i++) { // Start at 6 AM usually
    const hourStr = i.toString().padStart(2, '0') + ':00';
    hourlyMap[hourStr] = { revenue: 0, orders: 0 };
  }
  sales.forEach(s => {
    if (s.createdAt || s.date) {
      const dateStr = s.createdAt || s.date;
      const hour = new Date(dateStr).getHours();
      if (hour >= 6 && hour < 24) {
        const hourStr = hour.toString().padStart(2, '0') + ':00';
        hourlyMap[hourStr].revenue += s.totalPrice;
        hourlyMap[hourStr].orders += 1;
      }
    }
  });
  invoices.filter(i => i.status === 'PAID').forEach(i => {
    if (i.createdAt) {
      const hour = new Date(i.createdAt).getHours();
      if (hour >= 6 && hour < 24) {
        const hourStr = hour.toString().padStart(2, '0') + ':00';
        hourlyMap[hourStr].revenue += (i.total || 0);
        hourlyMap[hourStr].orders += 1;
      }
    }
  });
  const hourlyData = Object.entries(hourlyMap).map(([hour, data]) => ({ hour, ...data }));

  // 3. Waiter Performance
  const waiterMap = {};
  sales.forEach(s => {
    const wName = s.waiterName || 'Unknown';
    if (!waiterMap[wName]) waiterMap[wName] = { revenue: 0, orders: 0 };
    waiterMap[wName].revenue += s.totalPrice;
    waiterMap[wName].orders += 1;
  });
  const waiterData = Object.entries(waiterMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // 4. Payroll Computation
  const payrollMap = {};
  users.forEach(u => {
    payrollMap[u.id] = { username: u.username, hoursWorked: 0, hourlyRate: u.hourlyRate || 0, wages: 0, commissions: 0, commissionRate: u.commissionRate || 0, totalPay: 0 };
  });

  timecards.forEach(t => {
    const matchDate = (!filter.startDate || t.clockIn >= filter.startDate) &&
                      (!filter.endDate || t.clockIn <= filter.endDate);
    if (!matchDate) return;
    
    if (t.clockOut && payrollMap[t.userId]) {
      const ms = new Date(t.clockOut) - new Date(t.clockIn);
      const hours = ms / (1000 * 60 * 60);
      payrollMap[t.userId].hoursWorked += hours;
      payrollMap[t.userId].wages += hours * (t.hourlyRate || 0);
    }
  });

  sales.forEach(s => {
    const wName = s.waiterName;
    if (wName) {
      const user = users.find(u => u.username === wName);
      if (user && payrollMap[user.id]) {
        const comm = s.totalPrice * ((user.commissionRate || 0) / 100);
        payrollMap[user.id].commissions += comm;
      }
    }
  });

  const payrollData = Object.values(payrollMap).map(p => {
    p.totalPay = p.wages + p.commissions;
    return p;
  }).filter(p => p.hoursWorked > 0 || p.commissions > 0);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Rita - Comprehensive Performance Report", 14, 15);
    const now = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${now}`, 14, 22);
    
    doc.text(`Total Revenue (Sales + Invoices): ${totalRevenue.toLocaleString()} FRW`, 14, 30);
    doc.text(`POS Sales: ${totalSales.toLocaleString()} FRW | Invoices: ${invoiceRevenue.toLocaleString()} FRW`, 14, 36);
    doc.text(`Total Expenses: ${totalExpenses.toLocaleString()} FRW`, 14, 42);
    doc.text(`Net Profit: ${netProfit.toLocaleString()} FRW`, 14, 48);

    autoTable(doc, {
      head: [['Category', 'Qty Sold', 'Sales (FRW)', 'Cost (FRW)', 'Gross Profit (FRW)']],
      body: catData.map(c => [
        c.category, 
        c.qty, 
        c.sales.toLocaleString(), 
        c.cost.toLocaleString(), 
        c.interest.toLocaleString()
      ]),
      startY: 50
    });
    doc.save('Rita_Sales_Report.pdf');
  };

  const exportVisualPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    const btnContainer = document.getElementById('report-buttons');
    if (btnContainer) btnContainer.style.display = 'none';

    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('Rita_Full_Report.pdf');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate PDF.', 'error');
    } finally {
      if (btnContainer) btnContainer.style.display = 'flex';
    }
  };

  return (
    <div className="reports" id="report-content" style={{ padding: '20px', backgroundColor: 'var(--card-bg)' }}>
      <h2>Financial Reports & Analysis</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Generated on: {new Date().toLocaleString()}</p>

      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input type="date" value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} />
          <input type="date" value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} />
          <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div id="report-buttons" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={exportVisualPDF}>Download Full PDF</button>
          <button className="btn-secondary" onClick={exportPDF}>Summary PDF</button>
        </div>
      </div>

      {/* Auto Report Maker Widget */}
      <div style={{ marginBottom: '20px', padding: '15px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>⚙️ Auto Report Maker</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '0.9rem' }}>
          Background reports are generated automatically at 23:59. You can also manually trigger Excel generation for the current period directly to your Documents folder.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={async () => {
            const path = await window.api.generateReport('Daily');
            if (path) showToast(`Daily report saved to ${path}`, 'success');
            else showToast('No sales data to report', 'error');
          }}>Generate Daily Excel</button>
          
          <button className="btn-secondary" onClick={async () => {
            const path = await window.api.generateReport('Weekly');
            if (path) showToast(`Weekly report saved to ${path}`, 'success');
            else showToast('No sales data to report', 'error');
          }}>Generate Weekly Excel</button>
          
          <button className="btn-secondary" onClick={async () => {
            const path = await window.api.generateReport('Monthly');
            if (path) showToast(`Monthly report saved to ${path}`, 'success');
            else showToast('No sales data to report', 'error');
          }}>Generate Monthly Excel</button>
        </div>
      </div>
      
      {/* Low Stock Warnings Widget */}
      {lowStockItems.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px', color: '#856404' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2em' }}>⚠️</span> Low Stock Alerts
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {lowStockItems.map(p => (
              <span key={p.id} style={{ background: p.stockQuantity <= 0 ? 'var(--danger)' : '#ff9800', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9em', fontWeight: 'bold' }}>
                {p.name}: {p.stockQuantity} left
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="summary-cards">
        <div className="card">
          <h3>Total Revenue</h3>
          <p className="value">{totalRevenue.toLocaleString()} FRW</p>
          <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginTop: '5px' }}>
            POS: {totalSales.toLocaleString()} | Invoices: {invoiceRevenue.toLocaleString()}
          </div>
        </div>
        <div className="card"><h3>Total Cost of Goods</h3><p className="value">{totalCost.toLocaleString()} FRW</p></div>
        <div className="card"><h3>Total Expenses</h3><p className="value warning">{totalExpenses.toLocaleString()} FRW</p></div>
        <div className="card"><h3>Net Profit</h3><p className="value interest">{netProfit.toLocaleString()} FRW</p></div>
      </div>

      <div className="charts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Top Items */}
        <div className="chart-box" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3>Top Performing Items (Qty)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItemsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis dataKey="name" type="category" width={100} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <Bar dataKey="quantity" fill="var(--primary)" name="Quantity Sold" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="chart-box" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3>Payment Methods</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {paymentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString()} FRW`} contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Traffic */}
        <div className="chart-box" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3>Peak Traffic Hours (Revenue)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="hour" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
              <YAxis stroke="var(--text-secondary)" width={80} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} name="Revenue (FRW)" dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Waiter Performance */}
        <div className="chart-box" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
          <h3>Waiter Performance</h3>
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
            {waiterData.map(w => (
              <div key={w.name} style={{ minWidth: '200px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>{w.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Orders: {w.orders}</div>
                <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.1rem' }}>{w.revenue.toLocaleString()} FRW</div>
              </div>
            ))}
            {waiterData.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No waiter data available.</div>}
          </div>
        </div>

        {/* Payroll & Commissions */}
        <div className="chart-box" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
          <h3>Payroll & Commissions</h3>
          <table className="cat-table" style={{ marginTop: '15px' }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Hours Worked</th>
                <th>Wages (FRW)</th>
                <th>Commissions (FRW)</th>
                <th>Total Pay (FRW)</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map(p => (
                <tr key={p.username}>
                  <td><strong>{p.username}</strong></td>
                  <td>{p.hoursWorked.toFixed(2)} hrs @ {p.hourlyRate}/hr</td>
                  <td>{Math.round(p.wages).toLocaleString()}</td>
                  <td>{Math.round(p.commissions).toLocaleString()} ({p.commissionRate}%)</td>
                  <td className="interest"><strong>{Math.round(p.totalPay).toLocaleString()}</strong></td>
                </tr>
              ))}
              {payrollData.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No payroll data available for this period.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="charts">
        <div className="chart-box full-width">
          <h3>Monthly Financials Overview</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              <Legend wrapperStyle={{ color: 'var(--text-primary)' }} />
              <Bar dataKey="sales" fill="var(--primary)" name="Revenue" />
              <Bar dataKey="expenses" fill="var(--danger)" name="Expenses" />
              <Bar dataKey="netProfit" fill="var(--success)" name="Net Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {catData.length > 0 && (
        <div className="charts" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
          <div className="chart-box" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3>Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" outerRadius={100} dataKey="sales" label={({category, percent}) => `${category} ${(percent * 100).toFixed(0)}%`}>
                  {catData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString()} FRW`} contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-box" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3>Category Performance Breakdown</h3>
          <table className="cat-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Qty Sold</th>
                <th>Revenue</th>
                <th>Cost of Goods</th>
                <th>Gross Profit</th>
              </tr>
            </thead>
            <tbody>
              {catData.map(c => (
                <tr key={c.category}>
                  <td><span className="badge">{c.category}</span></td>
                  <td>{c.qty}</td>
                  <td>{c.sales.toLocaleString()} FRW</td>
                  <td>{c.cost.toLocaleString()} FRW</td>
                  <td className="interest">{c.interest.toLocaleString()} FRW</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

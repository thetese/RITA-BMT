import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

export default function Reports({ sales, filter, setFilter, categories }) {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    if (window.api) {
      window.api.getExpenses().then(data => {
        // Filter expenses based on the same date filter if applicable
        const filteredExp = data.filter(e => {
          const matchDate = (!filter.startDate || e.date >= filter.startDate) &&
                            (!filter.endDate || e.date <= filter.endDate);
          return matchDate;
        });
        setExpenses(filteredExp);
      });
    }
  }, [filter]);

  const totalSales = sales.reduce((sum, s) => sum + s.totalPrice, 0);
  const totalCost = sales.reduce((sum, s) => sum + (s.costPrice || 0) * s.quantity, 0);
  const totalGrossProfit = totalSales - totalCost;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalGrossProfit - totalExpenses;
  const marginRate = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0;

  const monthlyMap = {};
  sales.forEach(s => {
    const month = s.date.slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { sales: 0, cost: 0, gross: 0, expenses: 0 };
    monthlyMap[month].sales += s.totalPrice;
    monthlyMap[month].cost += (s.costPrice || 0) * s.quantity;
    monthlyMap[month].gross += s.totalPrice - (s.costPrice || 0) * s.quantity;
  });
  expenses.forEach(e => {
    const month = e.date.slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { sales: 0, cost: 0, gross: 0, expenses: 0 };
    monthlyMap[month].expenses += e.amount;
  });
  
  const monthlyData = Object.entries(monthlyMap)
    .map(([month, data]) => ({ 
      month, 
      sales: data.sales, 
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
  const catData = Object.entries(catMap).map(([cat, d]) => ({
    category: cat,
    sales: d.sales,
    cost: d.cost,
    interest: d.sales - d.cost,
    qty: d.qty,
  }));

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Rita - Comprehensive Performance Report", 14, 15);
    const now = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${now}`, 14, 22);
    
    doc.text(`Total Revenue: ${totalSales.toLocaleString()} FRW`, 14, 30);
    doc.text(`Total Expenses: ${totalExpenses.toLocaleString()} FRW`, 14, 36);
    doc.text(`Net Profit: ${netProfit.toLocaleString()} FRW`, 14, 42);

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
      alert('Failed to generate PDF.');
    } finally {
      if (btnContainer) btnContainer.style.display = 'flex';
    }
  };

  return (
    <div className="reports" id="report-content" style={{ padding: '20px', backgroundColor: 'var(--card-bg)' }}>
      <h2>Financial Reports & Analysis</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Generated on: {new Date().toLocaleString()}</p>

      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between' }}>
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

      <div className="summary-cards">
        <div className="card"><h3>Total Revenue</h3><p className="value">{totalSales.toLocaleString()} FRW</p></div>
        <div className="card"><h3>Total Cost of Goods</h3><p className="value">{totalCost.toLocaleString()} FRW</p></div>
        <div className="card"><h3>Total Expenses</h3><p className="value warning">{totalExpenses.toLocaleString()} FRW</p></div>
        <div className="card"><h3>Net Profit</h3><p className="value interest">{netProfit.toLocaleString()} FRW</p></div>
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
        <div className="chart-box full-width">
          <h3>Category Performance</h3>
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
      )}
    </div>
  );
}

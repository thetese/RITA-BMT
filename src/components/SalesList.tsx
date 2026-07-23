// @ts-nocheck
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SalesList({ sales, filter, setFilter, categories, onEdit, onDelete, currentUser }) {
  
  const isActionAllowed = (sale) => {
    if (currentUser?.role === 'Admin') return true;
    if (!sale.createdAt) return true;
    const createdAtUTC = new Date(sale.createdAt.replace(' ', 'T') + 'Z').getTime();
    const now = Date.now();
    const hoursElapsed = (now - createdAtUTC) / (1000 * 60 * 60);
    return hoursElapsed < 24;
  };

  const generateInvoice = async (sale) => {
    const doc = new jsPDF('p', 'mm', 'a5'); // A5 format for receipts
    
    const bName = await window.api.getSetting('businessName') || 'RITA SALES';
    const bAddress = await window.api.getSetting('businessAddress') || 'Business Address Here';
    const bPhone = await window.api.getSetting('businessPhone') || '+250 780 000 000';

    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Primary color
    doc.text(bName, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(bAddress, 14, 26);
    doc.text(`Tel: ${bPhone}`, 14, 31);
    
    // Title & Meta
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("CASH RECEIPT", 14, 45);
    
    doc.setFontSize(10);
    doc.text(`Receipt No: #${sale.id.substring(0, 8).toUpperCase()}`, 14, 52);
    doc.text(`Date: ${sale.date}`, 14, 57);
    doc.text(`Payment Method: ${sale.paymentMethod || 'Cash'}`, 14, 62);
    if(sale.customerName) doc.text(`Served by: ${sale.customerName}`, 14, 67);

    // Table
    autoTable(doc, {
      startY: 75,
      head: [['Item Description', 'Qty', 'Unit Price', 'Amount']],
      body: [
        [sale.productName, sale.quantity, `${sale.unitPrice.toLocaleString()}`, `${sale.totalPrice.toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10 }
    });

    const finalY = doc.lastAutoTable.finalY || 75;
    
    // Total Line
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL DUE: ${sale.totalPrice.toLocaleString()} FRW`, 14, finalY + 12);
    
    // Footer message
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150);
    doc.text("Thank you for your business! Please come again.", 14, finalY + 25);
    
    doc.save(`Receipt_${sale.id.substring(0,6)}.pdf`);
  };

  const [currentPage, setCurrentPage] = React.useState(1);
  const daysPerPage = 7;

  const filteredSales = sales.filter(s => {
    const matchDate = (!filter.startDate || s.date >= filter.startDate) &&
      (!filter.endDate || s.date <= filter.endDate);
    const matchCategory = !filter.category || s.category === filter.category;
    return matchDate && matchCategory;
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Group by date
  const groupedSales = {};
  filteredSales.forEach(s => {
    if(!groupedSales[s.date]) groupedSales[s.date] = { sales: [], total: 0, interest: 0 };
    groupedSales[s.date].sales.push(s);
    groupedSales[s.date].total += (s.totalPrice || 0);
    groupedSales[s.date].interest += (s.quantity * (s.unitPrice - (s.costPrice || 0)));
  });

  const sortedDates = Object.keys(groupedSales).sort((a,b) => b.localeCompare(a));
  const totalPages = Math.ceil(sortedDates.length / daysPerPage);
  const currentDates = sortedDates.slice((currentPage - 1) * daysPerPage, currentPage * daysPerPage);

  return (
    <div className="sales-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Sales Records</h2>
      </div>

      <div className="filter-bar">
        <input type="date" value={filter.startDate} onChange={e => setFilter({ ...filter, startDate: e.target.value })} />
        <input type="date" value={filter.endDate} onChange={e => setFilter({ ...filter, endDate: e.target.value })} />
        <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
              {currentUser?.role === 'Admin' && <th>Cost/Unit</th>}
              {currentUser?.role === 'Admin' && <th>Interest</th>}
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedDates.length === 0 && (
              <tr><td colSpan={10} className="empty">No sales records found.</td></tr>
            )}
            {currentDates.map(date => (
              <React.Fragment key={date}>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', fontWeight: 'bold' }}>
                  <td colSpan={currentUser?.role === 'Admin' ? 10 : 8} style={{ padding: '12px 16px', fontSize: '1.05rem', color: 'var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>🗓️ {date}</span>
                      <span>
                        Total Sales: {groupedSales[date].total.toLocaleString()} FRW
                        {currentUser?.role === 'Admin' && <span style={{ marginLeft: '15px', color: 'var(--success)' }}>Profit: {groupedSales[date].interest.toLocaleString()} FRW</span>}
                      </span>
                    </div>
                  </td>
                </tr>
                {groupedSales[date].sales.map(s => (
                  <tr key={s.id}>
                    <td>{s.date}</td>
                    <td style={{ fontWeight: 500 }}>{s.productName}</td>
                    <td><span className="badge">{s.category}</span></td>
                    <td>{s.quantity}</td>
                    <td>{s.unitPrice.toLocaleString()} FRW</td>
                    <td style={{ fontWeight: 600 }}>{s.totalPrice.toLocaleString()} FRW</td>
                    
                    {currentUser?.role === 'Admin' && <td>{(s.costPrice || 0).toLocaleString()} FRW</td>}
                    {currentUser?.role === 'Admin' && <td className="interest">{(s.quantity * (s.unitPrice - (s.costPrice || 0))).toLocaleString()} FRW</td>}
                    
                    <td>{s.paymentMethod || 'Cash'}</td>
                    
                    <td className="actions">
                      <button className="btn-sm" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => generateInvoice(s)}>Print</button>
                      {isActionAllowed(s) ? (
                        <>
                          <button className="btn-sm" onClick={() => onEdit(s)}>Edit</button>
                          <button className="btn-sm btn-danger" onClick={() => onDelete(s.id)}>Del</button>
                        </>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'inline-block', marginTop: '4px' }} title="Locked after 24 hours">🔒 Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
          <button 
            className="btn-secondary btn-sm" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="btn-secondary btn-sm" 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

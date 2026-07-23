// @ts-nocheck
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from './ui/Toast';
import { useConfirm } from './ui/Confirm';

export default function InvoiceMaker() {
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();

  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [businessInfo, setBusinessInfo] = useState({ name: 'RITA SALES', address: 'Business Address Here', phone: 'Tel: +250 780 000 000' });
  
  const [form, setForm] = useState({
    customerName: '',
    customerAddress: '',
    items: [],
    taxRate: 18 // Default VAT 18%
  });

  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!window.api) return;
    const invData = await window.api.getInvoices();
    setInvoices(invData || []);
    
    const prodData = await window.api.getProducts();
    setProducts(prodData || []);

    const name = await window.api.getSetting('businessName');
    const address = await window.api.getSetting('businessAddress');
    const phone = await window.api.getSetting('businessPhone');
    
    setBusinessInfo({
      name: name || 'RITA SALES',
      address: address || 'Business Address Here',
      phone: phone || '+250 780 000 000'
    });
  };

  const handleAddItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice < 0) {
      showToast('Please enter valid item details', 'error');
      return;
    }
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem }]
    }));
    setNewItem({ description: '', quantity: 1, unitPrice: 0 });
  };

  const handleRemoveItem = (index) => {
    setForm(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  const handleProductSelect = (e) => {
    const prodId = e.target.value;
    if (!prodId) return;
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setNewItem({
        description: prod.name || prod.productName,
        quantity: 1,
        unitPrice: prod.unitPrice
      });
    }
  };

  const calculateTotals = () => {
    const subtotal = form.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * (form.taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSaveInvoice = async () => {
    if (!form.customerName) {
      showToast('Customer Name is required', 'error');
      return;
    }
    if (form.items.length === 0) {
      showToast('Please add at least one item', 'error');
      return;
    }

    const totals = calculateTotals();
    const payload = {
      id: editingId,
      customerName: form.customerName,
      customerAddress: form.customerAddress,
      items: JSON.stringify(form.items),
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      status: 'PENDING'
    };

    let saved = false;
    if (editingId) {
      saved = await window.api.updateInvoice(payload);
    } else {
      saved = await window.api.addInvoice(payload);
    }

    if (saved) {
      showToast(editingId ? 'Invoice updated' : 'Invoice saved successfully', 'success');
      setForm({ customerName: '', customerAddress: '', items: [], taxRate: 18 });
      setEditingId(null);
      loadData();
    }
  };

  const handleEditInvoice = (inv) => {
    setEditingId(inv.id);
    setForm({
      customerName: inv.customerName,
      customerAddress: inv.customerAddress,
      items: typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items,
      taxRate: 18 // assuming default or parse from tax/subtotal ratio
    });
  };

  const handleDeleteInvoice = async (id) => {
    if (await askConfirm('Are you sure you want to delete this invoice?')) {
      await window.api.deleteInvoice(id);
      showToast('Invoice deleted', 'success');
      loadData();
    }
  };

  const generatePDF = (inv) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text(businessInfo.name, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(businessInfo.address, 14, 26);
    doc.text(`Tel: ${businessInfo.phone}`, 14, 31);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("INVOICE", 14, 45);

    doc.setFontSize(10);
    doc.text(`Invoice No: #${inv.id.substring(0, 8).toUpperCase()}`, 130, 26);
    doc.text(`Date: ${new Date(inv.createdAt).toLocaleDateString()}`, 130, 31);
    doc.text(`Status: ${inv.status}`, 130, 36);

    doc.setFontSize(12);
    doc.text("Bill To:", 14, 55);
    doc.setFontSize(10);
    doc.text(inv.customerName, 14, 61);
    if (inv.customerAddress) doc.text(inv.customerAddress, 14, 66);

    const parsedItems = typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items;

    autoTable(doc, {
      startY: 75,
      head: [['Description', 'Qty', 'Unit Price (FRW)', 'Total (FRW)']],
      body: parsedItems.map(item => [
        item.description,
        item.quantity,
        item.unitPrice.toLocaleString(),
        (item.quantity * item.unitPrice).toLocaleString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    const finalY = doc.lastAutoTable.finalY || 70;
    doc.text(`Subtotal: ${inv.subtotal.toLocaleString()} FRW`, 130, finalY + 10);
    doc.text(`Tax: ${inv.tax.toLocaleString()} FRW`, 130, finalY + 16);
    doc.setFontSize(12);
    doc.text(`Total: ${inv.total.toLocaleString()} FRW`, 130, finalY + 24);

    doc.save(`Invoice_${inv.id.substring(0,8)}.pdf`);
  };

  const updateStatus = async (id, status) => {
    if (await askConfirm(`Mark this invoice as ${status}?`)) {
      await window.api.updateInvoiceStatus(id, status);
      loadData();
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="crm-container">
      <div className="customers-list">
        <h2>Invoice History</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {invoices.map(inv => (
            <div key={inv.id} className="customer-card">
              <div className="info">
                <h3>{inv.customerName}</h3>
                <p>Date: {new Date(inv.createdAt).toLocaleDateString()}</p>
                <p>Total: {inv.total.toLocaleString()} FRW</p>
                <span className="badge" style={{ background: inv.status === 'PAID' ? 'var(--success)' : 'var(--danger)' }}>{inv.status}</span>
              </div>
              <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <button className="btn-secondary btn-sm" onClick={() => generatePDF(inv)}>Print PDF</button>
                {inv.status === 'PENDING' && (
                  <button className="btn-secondary btn-sm" style={{ color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => updateStatus(inv.id, 'PAID')}>Mark Paid</button>
                )}
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button className="btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleEditInvoice(inv)}>Edit</button>
                  <button className="btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleDeleteInvoice(inv.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {invoices.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No invoices generated yet.</p>}
        </div>
      </div>

      <div className="sales-form">
        <h2>{editingId ? 'Edit Invoice' : 'Create New Invoice'}</h2>
        {editingId && (
          <button className="btn-secondary btn-sm" style={{ marginBottom: '15px' }} onClick={() => {
            setEditingId(null);
            setForm({ customerName: '', customerAddress: '', items: [], taxRate: 18 });
          }}>Cancel Edit</button>
        )}
        
        <div className="form-group">
          <label>Customer Name *</label>
          <input type="text" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} placeholder="Company or Client Name" />
        </div>
        <div className="form-group">
          <label>Customer Address</label>
          <input type="text" value={form.customerAddress} onChange={e => setForm({...form, customerAddress: e.target.value})} placeholder="Address, City, etc." />
        </div>

        <div style={{ background: 'var(--bg-color)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Add Line Item</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <select onChange={handleProductSelect} defaultValue="">
              <option value="">-- Select Product from DB --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name || p.productName}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} style={{ flex: 2 }} />
            <input type="number" placeholder="Qty" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseFloat(e.target.value)})} style={{ flex: 1 }} />
            <input type="number" placeholder="Unit Price" value={newItem.unitPrice} onChange={e => setNewItem({...newItem, unitPrice: parseFloat(e.target.value)})} style={{ flex: 1 }} />
            <button className="btn-primary" onClick={handleAddItem}>Add</button>
          </div>
        </div>

        <table className="cart-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {form.items.map((it, idx) => (
              <tr key={idx}>
                <td>{it.description}</td>
                <td>{it.quantity}</td>
                <td>{it.unitPrice.toLocaleString()}</td>
                <td>{(it.quantity * it.unitPrice).toLocaleString()}</td>
                <td><button className="btn-danger btn-sm" onClick={() => handleRemoveItem(idx)}>X</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>Tax Rate (%)</label>
          <input type="number" value={form.taxRate} onChange={e => setForm({...form, taxRate: parseFloat(e.target.value) || 0})} />
        </div>

        <div className="cart-summary" style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-color)', borderRadius: '8px' }}>
          <p>Subtotal: {subtotal.toLocaleString()} FRW</p>
          <p>Tax: {tax.toLocaleString()} FRW</p>
          <h3>Total: {total.toLocaleString()} FRW</h3>
        </div>

        <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={handleSaveInvoice}>
          {editingId ? 'Update Invoice' : 'Save & Generate Invoice'}
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

const defaultSale = {
  productId: '',
  productName: '',
  category: '',
  quantity: 1,
  unitPrice: '',
  costPrice: '',
  date: new Date().toISOString().split('T')[0],
  customerName: '', // Originally used for Accounter, let's keep it for compatibility or label as Team Member
  customerId: '',
  paymentMethod: 'Cash',
  notes: '',
};

export default function SalesForm({ onSubmit, sale, categories = [], accounters = [], onCancel, currentUser }) {
  const [form, setForm] = useState(defaultSale);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!window.api) return;
      const [pData, cData] = await Promise.all([
        window.api.getProducts(),
        window.api.getCustomers()
      ]);
      setProducts(pData);
      setCustomers(cData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (sale) {
      setForm({
        ...sale,
        unitPrice: formatMoney(sale.unitPrice),
        costPrice: formatMoney(sale.costPrice)
      });
      const prod = products.find(p => p.productName === sale.productName);
      setSelectedProduct(prod || null);
    } else {
      setForm(defaultSale);
      setSelectedProduct(null);
    }
  }, [sale, products]);

  const formatMoney = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const str = val.toString().replace(/[^0-9.]/g, '');
    const parts = str.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  const parseMoney = (val) => {
    if (!val) return 0;
    return parseFloat(val.toString().replace(/,/g, '')) || 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (e) => {
    const prodId = e.target.value;
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setSelectedProduct(prod);
      setForm(prev => ({
        ...prev,
        productId: prod.id,
        productName: prod.productName,
        category: prod.category,
        unitPrice: formatMoney(prod.unitPrice),
        costPrice: formatMoney(prod.costPrice)
      }));
    } else {
      setSelectedProduct(null);
      setForm(prev => ({ ...prev, productId: '', productName: '', category: '', unitPrice: '', costPrice: '' }));
    }
  };

  const handleMoney = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: formatMoney(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseFloat(form.quantity) || 0;
    const up = parseMoney(form.unitPrice);
    const cp = parseMoney(form.costPrice);
    const totalPrice = qty * up;
    
    onSubmit({ 
      ...form, 
      quantity: qty,
      unitPrice: up,
      costPrice: cp,
      totalPrice 
    });
    if (!sale) {
      setForm(defaultSale);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="sales-form">
      <h2>{sale ? 'Edit Sale' : 'Add New Sale'}</h2>
      <form onSubmit={handleSubmit}>
        
        <div className="form-row">
          <label>Select Inventory Product (Optional)</label>
          <select value={form.productId} onChange={handleProductSelect}>
            <option value="">-- Custom Product --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.productName} ({p.stockQuantity} in stock)</option>
            ))}
          </select>
          {selectedProduct && selectedProduct.stockQuantity < form.quantity && (
            <div className="warning" style={{ marginTop: '6px', fontSize: '0.85em' }}>
              Warning: Selling more than current stock ({selectedProduct.stockQuantity}).
            </div>
          )}
        </div>

        <div className="form-row">
          <label>Product Name *</label>
          <input name="productName" value={form.productName} onChange={handleChange} required />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-row">
            <label>Category *</label>
            <input name="category" value={form.category} onChange={handleChange} list="cat-list" required />
            <datalist id="cat-list">
              {categories.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="form-row">
            <label>Quantity *</label>
            <input name="quantity" type="number" min="0" step="any" value={form.quantity} onChange={handleChange} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-row">
            <label>Unit Price (FRW) *</label>
            <input name="unitPrice" type="text" inputMode="numeric" value={form.unitPrice} onChange={handleMoney} required />
          </div>
          <div className="form-row">
            <label>Cost Price (FRW)</label>
            <input name="costPrice" type="text" inputMode="numeric" value={form.costPrice} onChange={handleMoney} />
          </div>
        </div>

        <div className="form-row">
          <label>Total Price (Auto-calculated)</label>
          <input type="text" value={`${((parseFloat(form.quantity) || 0) * parseMoney(form.unitPrice)).toLocaleString()} FRW`} disabled />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div className="form-row">
            <label>Date *</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Payment Method</label>
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
              <option value="Cash">Cash</option>
              <option value="MoMo">Mobile Money</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Credit">Credit / Unpaid</option>
            </select>
          </div>
          <div className="form-row">
            <label>Team Member</label>
            <select name="customerName" value={form.customerName} onChange={handleChange}>
              <option value="">None</option>
              {accounters.map(a => <option key={a.id} value={a.name}>{a.name} ({a.shift})</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <label>Link Customer (CRM)</label>
          <select name="customerId" value={form.customerId} onChange={handleChange}>
            <option value="">-- No Customer Linked --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="form-row">
          <label>Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
        </div>

        <div className="form-actions">
          {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>}
          <button type="submit" className="btn-primary">{sale ? 'Update' : 'Add Sale'}</button>
        </div>
      </form>
    </div>
  );
}

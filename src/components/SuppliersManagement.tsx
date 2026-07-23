import React, { useState, useEffect } from 'react';
import { useToast } from './ui/Toast';
import { useConfirm } from './ui/Confirm';

const defaultSupplier = { name: '', contact: '', phone: '', email: '', address: '' };

export default function SuppliersManagement({ currentUser }) {
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [form, setForm] = useState(defaultSupplier);
  const [editingId, setEditingId] = useState(null);

  // PO Modal
  const [showPOModal, setShowPOModal] = useState(false);
  const [poForm, setPoForm] = useState({ supplierId: '', poNumber: '', items: [] });
  const [poItem, setPoItem] = useState({ productId: '', quantity: '', costPrice: '' });

  const loadData = async () => {
    if (!window.api) return;
    const supData = await window.api.getSuppliers();
    setSuppliers(supData);
    
    const poData = await window.api.getPurchaseOrders();
    setPurchaseOrders(poData);
    
    const prodData = await window.api.getProducts();
    setProducts(prodData);
  };

  useEffect(() => { loadData(); }, []);

  // Barcode Scanner Listener for PO Modal
  const barcodeBufferRef = React.useRef('');
  const lastKeyTimeRef = React.useRef(Date.now());

  useEffect(() => {
    if (!showPOModal) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const currentTime = Date.now();
      if (currentTime - lastKeyTimeRef.current > 50) {
        barcodeBufferRef.current = '';
      }
      lastKeyTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBufferRef.current.length > 0) {
          const scannedCode = barcodeBufferRef.current;
          let foundProduct = products.find(p => p.barcode === scannedCode);
          
          if (!foundProduct && scannedCode.length === 13 && /^2[0-9]/.test(scannedCode)) {
            const itemCodePrefix = scannedCode.substring(0, 7);
            foundProduct = products.find(p => p.barcode && p.barcode.startsWith(itemCodePrefix));
          }

          if (foundProduct) {
            setPoItem(prev => ({
              ...prev,
              productId: foundProduct.id,
              costPrice: foundProduct.costPrice || ''
            }));
            // Optional: Auto-focus the quantity field if we had a ref
          } else {
            showToast(`Barcode ${scannedCode} not found in catalog.`, "error");
          }
          barcodeBufferRef.current = '';
        }
      } else if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPOModal, products]);

  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await window.api.updateSupplier({ ...form, id: editingId }, currentUser?.id);
    } else {
      await window.api.addSupplier(form, currentUser?.id);
    }
    setForm(defaultSupplier);
    setEditingId(null);
    loadData();
  };

  const handleSupplierEdit = (sup) => {
    setForm(sup);
    setEditingId(sup.id);
  };

  const handleSupplierDelete = async (id) => {
    if (await askConfirm("Delete this supplier?")) {
      await window.api.deleteSupplier(id, currentUser?.id);
      loadData();
    }
  };

  const handleAddPoItem = () => {
    if (!poItem.productId || !poItem.quantity) return;
    const prod = products.find(p => p.id === poItem.productId);
    const newItem = {
      productId: prod.id,
      productName: prod.productName,
      quantity: parseInt(poItem.quantity) || 0,
      costPrice: parseFloat(poItem.costPrice) || prod.costPrice || 0
    };
    setPoForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setPoItem({ productId: '', quantity: '', costPrice: '' });
  };

  const handleRemovePoItem = (index) => {
    setPoForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handlePOSubmit = async (e) => {
    e.preventDefault();
    if (poForm.items.length === 0) {
      showToast("Please add items to the Purchase Order.", "error");
      return;
    }
    
    const totalAmount = poForm.items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
    
    const poPayload = {
      ...poForm,
      totalAmount,
      date: new Date().toISOString().split('T')[0]
    };
    
    await window.api.addPurchaseOrder(poPayload, currentUser?.id);
    setShowPOModal(false);
    setPoForm({ supplierId: '', poNumber: '', items: [] });
    loadData(); // This will refresh products stock and cost prices too
  };

  return (
    <div className="suppliers-mgmt" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
      
      {/* LEFT COL: Suppliers */}
      <div>
        <div className="sales-form">
          <h2>{editingId ? 'Edit Supplier' : 'Add New Supplier'}</h2>
          <form onSubmit={handleSupplierSubmit}>
            <div className="form-row">
              <label>Supplier Name *</label>
              <input name="name" value={form.name} onChange={handleSupplierChange} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-row">
                <label>Contact Person</label>
                <input name="contact" value={form.contact} onChange={handleSupplierChange} />
              </div>
              <div className="form-row">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleSupplierChange} />
              </div>
            </div>
            <div className="form-row">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleSupplierChange} />
            </div>
            <div className="form-row">
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleSupplierChange} />
            </div>
            <div className="form-actions">
              {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(defaultSupplier); }}>Cancel</button>}
              <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add Supplier'}</button>
            </div>
          </form>
        </div>

        <div className="sales-list" style={{ marginTop: '24px' }}>
          <h2>Supplier Directory</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(sup => (
                  <tr key={sup.id}>
                    <td style={{ fontWeight: 500 }}>{sup.name}</td>
                    <td>{sup.phone || sup.email || '-'}</td>
                    <td className="actions">
                      <button className="btn-sm" onClick={() => handleSupplierEdit(sup)}>Edit</button>
                      <button className="btn-sm btn-danger" onClick={() => handleSupplierDelete(sup.id)}>Del</button>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr><td colSpan={3} className="empty">No suppliers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT COL: Purchase Orders */}
      <div>
        <div className="sales-form" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '20px' }}>
          <h2 style={{ margin: 0 }}>Purchase Orders (Inwards)</h2>
          <button className="btn-primary" onClick={() => setShowPOModal(true)}>➕ Receive Stock</button>
        </div>

        <div className="sales-list">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PO # / Date</th>
                  <th>Supplier</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(po => (
                  <tr key={po.id}>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{po.poNumber}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{po.date}</div>
                    </td>
                    <td>{po.supplierName || 'N/A'}</td>
                    <td style={{ fontWeight: 'bold' }}>{po.totalAmount.toLocaleString()} FRW</td>
                    <td><span className="badge" style={{ background: 'var(--success)' }}>{po.status}</span></td>
                  </tr>
                ))}
                {purchaseOrders.length === 0 && (
                  <tr><td colSpan={4} className="empty">No purchase orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Receive Stock Modal */}
      {showPOModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-color)', padding: '30px', borderRadius: '12px', width: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0 }}>Receive Stock (Purchase Order)</h2>
            
            <form onSubmit={handlePOSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="form-row">
                  <label>Supplier</label>
                  <select value={poForm.supplierId} onChange={e => setPoForm({...poForm, supplierId: e.target.value})} required>
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label>PO Number (Ref)</label>
                  <input value={poForm.poNumber} onChange={e => setPoForm({...poForm, poNumber: e.target.value})} placeholder="e.g. INV-2023-001" required />
                </div>
              </div>

              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                Items Received <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginLeft: '10px' }}>ℹ️ Scan barcode to select product</span>
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'end', marginBottom: '20px' }}>
                <div>
                  <label>Product</label>
                  <select value={poItem.productId} onChange={e => {
                    const prod = products.find(p => p.id === e.target.value);
                    setPoItem({...poItem, productId: e.target.value, costPrice: prod ? prod.costPrice : ''});
                  }}>
                    <option value="">Select Product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.productName} (Stock: {p.stockQuantity})</option>)}
                  </select>
                </div>
                <div>
                  <label>Qty Received</label>
                  <input type="number" min="1" value={poItem.quantity} onChange={e => setPoItem({...poItem, quantity: e.target.value})} />
                </div>
                <div>
                  <label>Cost / Unit</label>
                  <input type="number" value={poItem.costPrice} onChange={e => setPoItem({...poItem, costPrice: e.target.value})} />
                </div>
                <button type="button" className="btn-secondary" onClick={handleAddPoItem} style={{ height: '40px' }}>Add</button>
              </div>

              {poForm.items.length > 0 && (
                <table className="cat-table" style={{ width: '100%', marginBottom: '20px' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Cost/Unit</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {poForm.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{item.costPrice.toLocaleString()}</td>
                        <td style={{ fontWeight: 'bold' }}>{(item.quantity * item.costPrice).toLocaleString()}</td>
                        <td><button type="button" className="btn-sm btn-danger" onClick={() => handleRemovePoItem(idx)}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total:</td>
                      <td colSpan={2} style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>
                        {poForm.items.reduce((s, i) => s + (i.quantity * i.costPrice), 0).toLocaleString()} FRW
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}

              <div className="form-actions" style={{ marginTop: '30px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPOModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Complete Receive Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

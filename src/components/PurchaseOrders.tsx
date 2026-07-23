import React, { useState, useEffect } from 'react';
import { Truck, Plus, PackageOpen, CheckCircle, Clock } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function PurchaseOrders({ currentUser }: { currentUser: any }) {
  const { showToast } = useToast();
  const api = (window as any).api;

  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newPo, setNewPo] = useState<any>({ supplierId: '', items: [] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!api) return;
    try {
      const p = await api.getPurchaseOrders();
      setPos(p);
      const s = await api.getSuppliers();
      setSuppliers(s);
      const pr = await api.getProducts();
      setProducts(pr);
    } catch (e: any) {
      showToast('Error loading data: ' + e.message, 'error');
    }
  };

  const handleAddItem = () => {
    setNewPo({ ...newPo, items: [...newPo.items, { productId: '', quantity: 1, costPrice: 0 }] });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...newPo.items];
    updated[index][field] = value;
    
    // Auto-fill cost price if product is selected
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) updated[index].costPrice = prod.costPrice || 0;
      if (prod) updated[index].productName = prod.productName;
    }
    
    setNewPo({ ...newPo, items: updated });
  };

  const calculateTotal = () => {
    return newPo.items.reduce((sum: number, item: any) => sum + (item.quantity * item.costPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    try {
      await api.addPurchaseOrder({
        ...newPo,
        totalAmount: calculateTotal(),
        status: 'DRAFT'
      }, currentUser?.id);
      showToast('Draft PO created successfully.', 'success');
      setIsAdding(false);
      setNewPo({ supplierId: '', items: [] });
      loadData();
    } catch (e: any) {
      showToast('Failed to create PO: ' + e.message, 'error');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!api) return;
    try {
      await api.updatePurchaseOrderStatus(id, status, currentUser?.id);
      showToast(`PO marked as ${status}`, 'success');
      loadData();
    } catch (e: any) {
      showToast('Failed to update status: ' + e.message, 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return <span className="ui-badge ui-badge-neutral"><Clock size={12} style={{marginRight: 4}}/> Draft</span>;
      case 'SENT': return <span className="ui-badge ui-badge-primary">Sent</span>;
      case 'RECEIVED': return <span className="ui-badge ui-badge-success"><CheckCircle size={12} style={{marginRight: 4}}/> Received</span>;
      case 'CANCELED': return <span className="ui-badge ui-badge-danger">Canceled</span>;
      default: return <span className="ui-badge">{status}</span>;
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div className="ui-page-header">
        <div>
          <h1>Purchase Orders</h1>
          <p>Manage supplier orders and track receiving status.</p>
        </div>
        <button className="ui-btn ui-btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={16} /> New Draft PO
        </button>
      </div>

      <div className="ui-panel">
        <table className="table">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pos.map(po => {
              const items = JSON.parse(po.itemsData || '[]');
              return (
                <tr key={po.id}>
                  <td style={{ fontWeight: 600 }}>{po.poNumber}</td>
                  <td>{new Date(po.date).toLocaleDateString()}</td>
                  <td>{po.supplierName || 'Unknown Supplier'}</td>
                  <td>{items.length} items</td>
                  <td style={{ fontWeight: 'bold' }}>${po.totalAmount?.toLocaleString()}</td>
                  <td>{getStatusBadge(po.status)}</td>
                  <td>
                    {po.status === 'DRAFT' && (
                      <button className="ui-btn ui-btn-primary ui-btn-sm" onClick={() => updateStatus(po.id, 'SENT')}>Mark Sent</button>
                    )}
                    {po.status === 'SENT' && (
                      <button className="ui-btn ui-btn-success ui-btn-sm" onClick={() => updateStatus(po.id, 'RECEIVED')}><PackageOpen size={14}/> Receive Goods</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {pos.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <Truck size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
                  <p>No purchase orders found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAdding && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h2>Create Purchase Order (Draft)</h2>
              <button className="close-btn" onClick={() => setIsAdding(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Supplier</label>
                <select className="input" value={newPo.supplierId} onChange={e => setNewPo({...newPo, supplierId: e.target.value})} required>
                  <option value="">Select Supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4>Order Items</h4>
                <table className="table" style={{ marginTop: '8px' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Cost</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newPo.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td>
                          <select className="input" value={item.productId} onChange={e => handleItemChange(idx, 'productId', e.target.value)} required>
                            <option value="">Select Product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                          </select>
                        </td>
                        <td>
                          <input type="number" min="1" className="input" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value))} required />
                        </td>
                        <td>
                          <input type="number" step="0.01" min="0" className="input" value={item.costPrice} onChange={e => handleItemChange(idx, 'costPrice', parseFloat(e.target.value))} required />
                        </td>
                        <td style={{ fontWeight: 'bold' }}>
                          ${(item.quantity * item.costPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" className="ui-btn ui-btn-ghost ui-btn-sm" onClick={handleAddItem} style={{ marginTop: '8px' }}>+ Add Item</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h3 style={{ margin: 0 }}>Total: ${calculateTotal().toFixed(2)}</h3>
                <div className="form-actions">
                  <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
                  <button type="submit" className="ui-btn ui-btn-primary">Save Draft</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

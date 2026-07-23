import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function StockTransfers({ currentUser }: { currentUser: any }) {
  const { showToast } = useToast();
  const api = (window as any).api;

  const [transfers, setTransfers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTransfer, setNewTransfer] = useState<any>({ fromWarehouseId: '', toWarehouseId: '', notes: '', items: [] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!api) return;
    try {
      const t = await api.getStockTransfers();
      setTransfers(t);
      const w = await api.getWarehouses();
      setWarehouses(w);
      const p = await api.getProducts();
      setProducts(p);
    } catch (e: any) {
      showToast('Error loading transfers: ' + e.message, 'error');
    }
  };

  const handleAddItem = () => {
    setNewTransfer({ ...newTransfer, items: [...newTransfer.items, { productId: '', quantity: 1 }] });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...newTransfer.items];
    updated[index][field] = value;
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) updated[index].productName = prod.productName;
    }
    setNewTransfer({ ...newTransfer, items: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    
    if (newTransfer.fromWarehouseId === newTransfer.toWarehouseId) {
      showToast('Source and Destination warehouses cannot be the same', 'error');
      return;
    }
    
    if (newTransfer.items.length === 0) {
      showToast('Please add at least one item to transfer', 'error');
      return;
    }

    try {
      await api.addStockTransfer(newTransfer, currentUser?.id);
      showToast('Transfer created successfully', 'success');
      setIsAdding(false);
      setNewTransfer({ fromWarehouseId: '', toWarehouseId: '', notes: '', items: [] });
      loadData();
    } catch (e: any) {
      showToast('Failed to create transfer: ' + e.message, 'error');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!api) return;
    try {
      await api.updateStockTransferStatus(id, status, currentUser?.id);
      showToast(`Transfer marked as ${status}`, 'success');
      loadData();
    } catch (e: any) {
      showToast('Failed to update status: ' + e.message, 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="ui-badge ui-badge-warning"><AlertTriangle size={12} style={{marginRight: 4}}/> Pending</span>;
      case 'COMPLETED': return <span className="ui-badge ui-badge-success"><CheckCircle size={12} style={{marginRight: 4}}/> Completed</span>;
      case 'CANCELED': return <span className="ui-badge ui-badge-danger">Canceled</span>;
      default: return <span className="ui-badge">{status}</span>;
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div className="ui-page-header">
        <div>
          <h1>Inter-Warehouse Transfers</h1>
          <p>Move stock securely between multiple storage locations.</p>
        </div>
        <button className="ui-btn ui-btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={16} /> New Transfer
        </button>
      </div>

      <div className="ui-panel">
        <table className="table">
          <thead>
            <tr>
              <th>Transfer Number</th>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Items</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map(trf => {
              const items = JSON.parse(trf.itemsData || '[]');
              return (
                <tr key={trf.id}>
                  <td style={{ fontWeight: 600 }}>{trf.transferNumber}</td>
                  <td>{new Date(trf.date).toLocaleDateString()}</td>
                  <td>{trf.fromWarehouseName}</td>
                  <td>{trf.toWarehouseName}</td>
                  <td>{items.length} items</td>
                  <td>{getStatusBadge(trf.status)}</td>
                  <td>
                    {trf.status === 'PENDING' && (
                      <button className="ui-btn ui-btn-success ui-btn-sm" onClick={() => updateStatus(trf.id, 'COMPLETED')}>Complete Transfer</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {transfers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <ArrowRightLeft size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
                  <p>No stock transfers found.</p>
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
              <h2>New Stock Transfer</h2>
              <button className="close-btn" onClick={() => setIsAdding(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label>Source Warehouse (From)</label>
                  <select className="input" value={newTransfer.fromWarehouseId} onChange={e => setNewTransfer({...newTransfer, fromWarehouseId: e.target.value})} required>
                    <option value="">Select Warehouse...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Destination Warehouse (To)</label>
                  <select className="input" value={newTransfer.toWarehouseId} onChange={e => setNewTransfer({...newTransfer, toWarehouseId: e.target.value})} required>
                    <option value="">Select Warehouse...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Notes / Reason</label>
                <input type="text" className="input" value={newTransfer.notes} onChange={e => setNewTransfer({...newTransfer, notes: e.target.value})} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4>Items to Transfer</h4>
                <table className="table" style={{ marginTop: '8px' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newTransfer.items.map((item: any, idx: number) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" className="ui-btn ui-btn-ghost ui-btn-sm" onClick={handleAddItem} style={{ marginTop: '8px' }}>+ Add Item</button>
              </div>

              <div className="form-actions" style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="ui-btn ui-btn-primary">Initiate Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Building2, Package, MapPin } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function Warehouses() {
  const { showToast } = useToast();
  const api = (window as any).api;
  
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [warehouseStock, setWarehouseStock] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({ name: '', location: '', isDefault: false });

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    if (!api) return;
    try {
      const data = await api.getWarehouses();
      setWarehouses(data);
      if (data.length > 0 && !selectedWarehouse) {
        handleSelectWarehouse(data[0].id);
      }
    } catch (e: any) {
      showToast('Failed to load warehouses: ' + e.message, 'error');
    }
  };

  const handleSelectWarehouse = async (id: string) => {
    setSelectedWarehouse(id);
    if (!api) return;
    try {
      const stock = await api.getWarehouseStock(id);
      setWarehouseStock(stock);
    } catch (e: any) {
      showToast('Failed to load stock: ' + e.message, 'error');
    }
  };

  const handleAddWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    try {
      await api.addWarehouse(newWarehouse);
      showToast('Warehouse added successfully!', 'success');
      setIsAdding(false);
      setNewWarehouse({ name: '', location: '', isDefault: false });
      loadWarehouses();
    } catch (e: any) {
      showToast('Failed to add warehouse: ' + e.message, 'error');
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div className="ui-page-header">
        <div>
          <h1>Multi-Warehouse Inventory</h1>
          <p>Manage stock levels across different locations and warehouses.</p>
        </div>
        <button className="ui-btn ui-btn-primary" onClick={() => setIsAdding(true)}>
          + Add Warehouse
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Sidebar: List of Warehouses */}
        <div className="ui-panel" style={{ padding: '16px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.1rem' }}>Locations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {warehouses.map(w => (
              <div 
                key={w.id}
                onClick={() => handleSelectWarehouse(w.id)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedWarehouse === w.id ? 'var(--primary)' : 'var(--border-color)',
                  background: selectedWarehouse === w.id ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{w.name}</span>
                  {w.isDefault === 1 && <span className="ui-badge ui-badge-primary">Primary</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={12} /> {w.location || 'No location specified'}
                </div>
              </div>
            ))}
            {warehouses.length === 0 && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                No warehouses found.
              </div>
            )}
          </div>
        </div>

        {/* Main Content: Warehouse Stock */}
        <div className="ui-panel">
          {selectedWarehouse ? (
            <>
              <div className="ui-panel-header">
                <h2><Package size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }}/> Stock at {warehouses.find(w => w.id === selectedWarehouse)?.name}</h2>
              </div>
              
              {warehouseStock.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Unit Price</th>
                      <th>Qty in Warehouse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouseStock.map(item => (
                      <tr key={item.id}>
                        <td>{item.productName}</td>
                        <td>{item.category}</td>
                        <td>{item.unitPrice?.toLocaleString()}</td>
                        <td style={{ fontWeight: 600, color: item.quantity <= 0 ? 'var(--danger)' : 'inherit' }}>
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <Package size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
                  <p>No stock recorded in this warehouse yet.</p>
                  <p style={{ fontSize: '0.85rem' }}>Transfer stock from another warehouse to populate this list.</p>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Select a warehouse to view its stock.
            </div>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>Add New Warehouse</h2>
              <button className="close-btn" onClick={() => setIsAdding(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddWarehouse}>
              <div className="form-group">
                <label>Warehouse Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newWarehouse.name} 
                  onChange={e => setNewWarehouse({...newWarehouse, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Location / Address</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newWarehouse.location} 
                  onChange={e => setNewWarehouse({...newWarehouse, location: e.target.value})} 
                />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="isDefault" 
                  checked={newWarehouse.isDefault} 
                  onChange={e => setNewWarehouse({...newWarehouse, isDefault: e.target.checked})} 
                />
                <label htmlFor="isDefault" style={{ margin: 0, fontWeight: 'normal' }}>Set as Primary Warehouse</label>
              </div>
              <div className="form-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="ui-btn ui-btn-primary">Save Warehouse</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

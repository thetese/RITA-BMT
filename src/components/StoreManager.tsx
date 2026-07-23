import React, { useState, useEffect } from 'react';
import { useConfirm } from './ui/Confirm';
import { useToast } from './ui/Toast';
import { useStoreLocation, StoreLocation } from '../context/StoreContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function StoreManager() {
  const { availableStores, refreshStores } = useStoreLocation();
  const { askConfirm } = useConfirm();
  const { showToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreLocation | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

  const handleOpenModal = (store?: StoreLocation) => {
    if (store) {
      setEditingStore(store);
      setFormData({ name: store.name, address: store.address || '', phone: store.phone || '' });
    } else {
      setEditingStore(null);
      setFormData({ name: '', address: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      showToast('Store name is required', 'error');
      return;
    }
    try {
      if (editingStore) {
        await (window as any).api.updateStore({ id: editingStore.id, ...formData });
        showToast('Branch updated successfully', 'success');
      } else {
        await (window as any).api.addStore(formData);
        showToast('Branch created successfully', 'success');
      }
      setIsModalOpen(false);
      refreshStores();
    } catch (err: any) {
      showToast('Failed to save branch: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (id === 'default-store-id') {
      showToast('Cannot delete the default branch', 'error');
      return;
    }
    if (await askConfirm('Are you sure you want to delete this branch? All data associated with it will remain in DB but might be inaccessible.')) {
      try {
        await (window as any).api.deleteStore(id);
        showToast('Branch deleted successfully', 'success');
        refreshStores();
      } catch (err: any) {
        showToast('Failed to delete branch: ' + err.message, 'error');
      }
    }
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h3>Branches & Locations</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage your physical stores or branches.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add Branch
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {availableStores.map(store => (
              <tr key={store.id}>
                <td style={{ fontWeight: 600 }}>{store.name} {store.id === 'default-store-id' && <span className="badge">Primary</span>}</td>
                <td>{store.address || '-'}</td>
                <td>{store.phone || '-'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-sm btn-secondary" onClick={() => handleOpenModal(store)} style={{ marginRight: '8px' }}><Edit2 size={14} /></button>
                  {store.id !== 'default-store-id' && (
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(store.id)}><Trash2 size={14} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <h2>{editingStore ? 'Edit Branch' : 'New Branch'}</h2>
            
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Branch Name *</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                placeholder="e.g. Downtown Store"
              />
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Address</label>
              <input 
                type="text" 
                value={formData.address} 
                onChange={e => setFormData({ ...formData, address: e.target.value })} 
                placeholder="Branch address"
              />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Phone Number</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                placeholder="Contact number"
              />
            </div>

            <div className="form-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>Save Branch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

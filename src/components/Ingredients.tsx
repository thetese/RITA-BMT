// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useConfirm } from './ui/Confirm';

const defaultIngredient = {
  name: '',
  unit: 'kg', // kg, L, pcs, g, ml
  stockQuantity: 0,
  costPerUnit: 0,
  lowStockThreshold: 5
};

export default function Ingredients({ currentUser }) {
  const { askConfirm } = useConfirm();
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState(defaultIngredient);
  const [editingId, setEditingId] = useState(null);
  
  const [adjustingIngredient, setAdjustingIngredient] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ type: 'IN', quantity: 1, reason: '' });

  const loadData = async () => {
    if (!window.api) return;
    const data = await window.api.getIngredients();
    setIngredients(data);
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await window.api.updateIngredient({ 
          ...form, 
          id: editingId,
          stockQuantity: parseFloat(form.stockQuantity) || 0,
          costPerUnit: parseFloat(form.costPerUnit) || 0,
          lowStockThreshold: parseFloat(form.lowStockThreshold) || 5
        }, currentUser.id);
      } else {
        await window.api.addIngredient({
          ...form,
          stockQuantity: parseFloat(form.stockQuantity) || 0,
          costPerUnit: parseFloat(form.costPerUnit) || 0,
          lowStockThreshold: parseFloat(form.lowStockThreshold) || 5
        }, currentUser.id);
      }
      setForm(defaultIngredient);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (ing) => {
    setForm(ing);
    setEditingId(ing.id);
  };

  const handleDelete = async (id) => {
    if (await askConfirm('Delete this raw ingredient? Any mapped recipes using it will also be deleted!')) {
      await window.api.deleteIngredient(id, currentUser.id);
      loadData();
    }
  };
  
  const handleAdjustStock = async (e) => {
    e.preventDefault();
    const qty = parseFloat(adjustForm.quantity) || 0;
    const isAdding = adjustForm.type === 'IN';
    
    const newStock = isAdding 
      ? adjustingIngredient.stockQuantity + qty 
      : adjustingIngredient.stockQuantity - qty;
      
    await window.api.updateIngredient({ 
      ...adjustingIngredient, 
      stockQuantity: newStock 
    }, currentUser.id);
    
    // In a real app we'd log the reason to a stock_adjustments table
    
    setAdjustingIngredient(null);
    setAdjustForm({ type: 'IN', quantity: 1, reason: '' });
    loadData();
  };

  return (
    <div className="customers-mgmt">
      <div className="sales-form">
        <h2>{editingId ? 'Edit Raw Material' : 'Add Raw Material (Ingredient)'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Material Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Raw Beef, Tomatoes, Buns" required />
          </div>
          <div className="form-row">
            <label>Measurement Unit *</label>
            <select name="unit" value={form.unit} onChange={handleChange} required>
              <option value="kg">kg (Kilograms)</option>
              <option value="g">g (Grams)</option>
              <option value="L">L (Liters)</option>
              <option value="ml">ml (Milliliters)</option>
              <option value="pcs">pcs (Pieces)</option>
            </select>
          </div>
          <div className="form-row">
            <label>Cost per Unit (FRW) *</label>
            <input type="number" name="costPerUnit" value={form.costPerUnit} onChange={handleChange} min="0" step="0.01" required />
          </div>
          <div className="form-row">
            <label>Initial Stock ({form.unit}) *</label>
            <input type="number" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} min="0" step="0.01" required disabled={!!editingId} />
          </div>
          <div className="form-row">
            <label>Low Stock Threshold ({form.unit}) *</label>
            <input type="number" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange} min="0" step="0.01" required />
          </div>
          <div className="form-actions">
            {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(defaultIngredient); }}>Cancel</button>}
            <button type="submit" className="btn-primary">{editingId ? 'Update Material' : 'Add Material'}</button>
          </div>
        </form>
      </div>

      <div className="sales-list" style={{ marginTop: '24px' }}>
        <h2>Raw Inventory Database</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ingredient Name</th>
                <th>In Stock</th>
                <th>Threshold</th>
                <th>Unit Cost</th>
                <th>Total Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map(ing => (
                <tr key={ing.id} style={{ backgroundColor: ing.stockQuantity <= 0 ? '#ffebee' : (ing.stockQuantity <= (ing.lowStockThreshold || 5) ? '#fff8e1' : 'transparent') }}>
                  <td style={{ fontWeight: 600 }}>{ing.name}</td>
                  <td>
                    <span style={{ color: ing.stockQuantity <= (ing.lowStockThreshold || 5) ? 'var(--danger)' : 'inherit', fontWeight: 'bold' }}>
                      {ing.stockQuantity} {ing.unit}
                    </span>
                  </td>
                  <td>{ing.lowStockThreshold || 5} {ing.unit}</td>
                  <td>{ing.costPerUnit.toLocaleString()} FRW / {ing.unit}</td>
                  <td className="interest">{(ing.stockQuantity * ing.costPerUnit).toLocaleString()} FRW</td>
                  <td className="actions">
                    <button className="btn-sm" onClick={() => setAdjustingIngredient(ing)}>Adjust</button>
                    <button className="btn-sm" onClick={() => handleEdit(ing)}>Edit</button>
                    {currentUser.role === 'Admin' && (
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(ing.id)}>Del</button>
                    )}
                  </td>
                </tr>
              ))}
              {ingredients.length === 0 && (
                <tr><td colSpan={5} className="empty">No raw materials added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {adjustingIngredient && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-color)', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0 }}>Adjust Raw Stock: {adjustingIngredient.name}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Current Stock: {adjustingIngredient.stockQuantity} {adjustingIngredient.unit}</p>
            <form onSubmit={handleAdjustStock}>
              <div className="form-row">
                <label>Adjustment Type</label>
                <select value={adjustForm.type} onChange={e => setAdjustForm({...adjustForm, type: e.target.value})} required>
                  <option value="IN">Stock IN (Receive Delivery)</option>
                  <option value="OUT">Stock OUT (Spoilage/Waste)</option>
                </select>
              </div>
              <div className="form-row">
                <label>Quantity ({adjustingIngredient.unit})</label>
                <input type="number" step="0.01" value={adjustForm.quantity} onChange={e => setAdjustForm({...adjustForm, quantity: e.target.value})} min="0.01" required />
              </div>
              <div className="form-row">
                <label>Reason / Notes</label>
                <input type="text" value={adjustForm.reason} onChange={e => setAdjustForm({...adjustForm, reason: e.target.value})} placeholder="e.g. Expired, Restock, Return" required />
              </div>
              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setAdjustingIngredient(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

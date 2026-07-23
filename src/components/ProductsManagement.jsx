import React, { useState, useEffect } from 'react';

const defaultProduct = {
  productName: '',
  category: '',
  unitPrice: '',
  costPrice: '',
  stockQuantity: '',
  taxTyCd: 'B'
};

export default function ProductsManagement({ categories = [], currentUser }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(defaultProduct);
  const [editingId, setEditingId] = useState(null);

  const loadProducts = async () => {
    if (!window.api) return;
    const data = await window.api.getProducts();
    setProducts(data);
  };

  useEffect(() => { loadProducts(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const formatMoney = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const str = val.toString().replace(/[^0-9.]/g, '');
    const parts = str.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  const handleMoney = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: formatMoney(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        unitPrice: parseFloat(form.unitPrice.toString().replace(/,/g, '')) || 0,
        costPrice: parseFloat(form.costPrice.toString().replace(/,/g, '')) || 0,
        stockQuantity: parseInt(form.stockQuantity, 10) || 0,
        taxTyCd: form.taxTyCd || 'B'
      };
      if (editingId) {
        await window.api.updateProduct({ ...payload, id: editingId }, currentUser?.id);
      } else {
        await window.api.addProduct(payload, currentUser?.id);
      }
      setForm(defaultProduct);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      alert("Error adding product: " + err.message);
      console.error(err);
    }
  };

  const handleEdit = (prod) => {
    setForm({
      ...prod,
      unitPrice: formatMoney(prod.unitPrice),
      costPrice: formatMoney(prod.costPrice),
      stockQuantity: prod.stockQuantity || 0,
      taxTyCd: prod.taxTyCd || 'B'
    });
    setEditingId(prod.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this product?')) {
      await window.api.deleteProduct(id, currentUser?.id);
      loadProducts();
    }
  };

  return (
    <div className="products-mgmt">
      <div className="sales-form">
        <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Product Name *</label>
            <input name="productName" value={form.productName} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Category *</label>
            <input name="category" value={form.category} onChange={handleChange} list="cat-list" required />
            <datalist id="cat-list">
              {categories.map(c => <option key={c} value={c} />)}
            </datalist>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-row">
              <label>Initial Stock Quantity</label>
              <input name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-row">
              <label>RRA Tax Category</label>
              <select name="taxTyCd" value={form.taxTyCd} onChange={handleChange} required>
                <option value="A">A - Exempt (0%)</option>
                <option value="B">B - 18% VAT</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(defaultProduct); }}>Cancel</button>}
            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add Product'}</button>
          </div>
        </form>
      </div>

      <div className="sales-list" style={{ marginTop: '24px' }}>
        <h2>Product Catalog & Inventory</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Product Name</th>
                <th>Unit Price</th>
                <th>Cost Price</th>
                <th>Tax Cat</th>
                <th>In Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><span className="badge">{p.category}</span></td>
                  <td style={{ fontWeight: 500 }}>{p.productName}</td>
                  <td>{p.unitPrice.toLocaleString()} FRW</td>
                  <td>{p.costPrice.toLocaleString()} FRW</td>
                  <td>{p.taxTyCd === 'A' ? 'A (0%)' : 'B (18%)'}</td>
                  <td>
                    {p.stockQuantity > 0 ? (
                      p.stockQuantity <= 10 ? <span className="warning">{p.stockQuantity}</span> : <span className="interest">{p.stockQuantity}</span>
                    ) : (
                      <span className="btn-danger" style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.85em' }}>Out of Stock</span>
                    )}
                  </td>
                  <td className="actions">
                    <button className="btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                    {currentUser?.role === 'Admin' && (
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Del</button>
                    )}
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="empty">No products added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

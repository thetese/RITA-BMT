import React, { useState, useEffect } from 'react';

export default function DailyGridForm({ onSave, accounters = [] }) {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [accounter, setAccounter] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const loadProducts = async () => {
    const data = await window.api.getProducts();
    setProducts(data);
  };

  useEffect(() => { loadProducts(); }, []);

  const handleQtyChange = (productId, qtyStr) => {
    const val = parseInt(qtyStr, 10);
    setQuantities(prev => ({ ...prev, [productId]: isNaN(val) ? '' : val }));
  };

  const calculateTotal = (product) => {
    const qty = quantities[product.id] || 0;
    return qty * product.unitPrice;
  };

  const grandTotal = products.reduce((sum, p) => sum + calculateTotal(p), 0);

  const handleSave = async () => {
    if (!accounter.trim()) {
      alert("Please enter the Accounter name.");
      return;
    }
    const salesToAdd = products
      .filter(p => quantities[p.id] > 0)
      .map(p => ({
        productName: p.productName,
        category: p.category,
        quantity: quantities[p.id],
        unitPrice: p.unitPrice,
        costPrice: p.costPrice,
        totalPrice: quantities[p.id] * p.unitPrice,
        date: date,
        customerName: accounter,
        notes: 'Grid Bulk Entry'
      }));

    if (salesToAdd.length === 0) {
      alert("No quantities entered.");
      return;
    }

    try {
      // Save them sequentially
      for (const sale of salesToAdd) {
        await window.api.addSale(sale);
      }
      
      alert(`Successfully saved ${salesToAdd.length} items!`);
      setQuantities({}); // clear form
      if (onSave) onSave();
    } catch (err) {
      alert("Error saving sales: " + err.message + "\n\nIf the error says 'is not a function', please CLOSE the app completely and restart it.");
      console.error(err);
    }
  };

  return (
    <div className="grid-form-container">
      <div className="grid-header-row">
        <div className="header-field">
          <label>Accounter:</label>
          <select 
            value={accounter}
            onChange={e => setAccounter(e.target.value)}
            className="dotted-input"
          >
            <option value="">Select Accounter...</option>
            {accounters.map(a => (
              <option key={a.id} value={a.name}>{a.name} ({a.shift})</option>
            ))}
          </select>
        </div>
        <div className="header-field">
          <label>On:</label>
          <input 
            type="date" 
            value={date}
            onChange={e => setDate(e.target.value)}
            className="dotted-input"
          />
        </div>
      </div>

      <div className="table-wrap grid-table-wrap">
        <table className="format-table">
          <thead>
            <tr>
              <th>Commande</th>
              <th>Unit price</th>
              <th>Quantity</th>
              <th>Total sales</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const qty = quantities[p.id] || '';
              const total = qty ? qty * p.unitPrice : '';
              return (
                <tr key={p.id}>
                  <td className="item-name">{p.productName}</td>
                  <td>{p.unitPrice.toLocaleString()}</td>
                  <td className="qty-cell">
                    <input 
                      type="number" 
                      min="0"
                      value={qty} 
                      onChange={e => handleQtyChange(p.id, e.target.value)} 
                    />
                  </td>
                  <td>{total ? total.toLocaleString() : ''}</td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr><td colSpan={4} className="empty">No products defined. Go to 'Add Items' first!</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr className="grand-total-row">
              <td colSpan={3} className="total-label">
                ……………………………………………rwf total
              </td>
              <td className="total-value">
                {grandTotal > 0 ? grandTotal.toLocaleString() : ''}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="form-actions" style={{ marginTop: '20px' }}>
        <button className="btn-primary" onClick={handleSave}>Save Sales</button>
      </div>
    </div>
  );
}

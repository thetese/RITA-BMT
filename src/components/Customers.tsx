// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useConfirm } from './ui/Confirm';

const defaultCustomer = {
  name: '',
  phone: '',
  email: '',
  address: '',
  creditLimit: 0,
  accountBalance: 0
};

export default function Customers({ currentUser }) {
  const { askConfirm } = useConfirm();
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState(defaultCustomer);
  const [editingId, setEditingId] = useState(null);
  const [historyCustomer, setHistoryCustomer] = useState(null);

  const loadData = async () => {
    if (!window.api) return;
    const [cData, sData] = await Promise.all([
      window.api.getCustomers(),
      window.api.getSales()
    ]);
    setCustomers(cData);
    setSales(sData);
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (editingId) {
        await window.api.updateCustomer({ ...payload, id: editingId }, currentUser.id);
      } else {
        await window.api.addCustomer(payload, currentUser.id);
      }
      setForm(defaultCustomer);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (cust) => {
    setForm(cust);
    setEditingId(cust.id);
  };

  const handleDelete = async (id) => {
    if (await askConfirm('Delete this customer?')) {
      await window.api.deleteCustomer(id, currentUser.id);
      loadData();
    }
  };

  const handlePayBalance = async (cust) => {
    if (!cust.accountBalance || cust.accountBalance <= 0) {
      showToast('No outstanding balance to pay.', 'error');
      return;
    }
    const amountStr = window.prompt(`Enter amount to pay (Max: ${cust.accountBalance}):`, cust.accountBalance);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;
    if (amount > cust.accountBalance) {
      showToast('Cannot pay more than outstanding balance.', 'error');
      return;
    }
    
    if (await askConfirm(`Receive payment of ${amount.toLocaleString()} FRW for ${cust.name}?`)) {
      await window.api.adjustCustomerBalance(cust.id, -amount);
      showToast('Payment received successfully.', 'success');
      loadData();
    }
  };

  return (
    <div className="customers-mgmt">
      <div className="sales-form">
        <h2>{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Phone Number</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-row">
              <label>Address / Notes</label>
              <input name="address" value={form.address} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label>Credit Limit (FRW)</label>
              <input type="number" name="creditLimit" value={form.creditLimit || ''} onChange={handleChange} placeholder="0 = No Credit" />
            </div>
          </div>
          <div className="form-actions">
            {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(defaultCustomer); }}>Cancel</button>}
            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add Customer'}</button>
          </div>
        </form>
      </div>

      <div className="sales-list" style={{ marginTop: '24px' }}>
        <h2>Customer Database</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact Info</th>
                <th>Points Balance</th>
                <th>Store Credit</th>
                <th>Behavior Insights (AI)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => {
                const cSales = sales.filter(s => s.customerId === c.id);
                const totalSpent = cSales.reduce((sum, s) => sum + s.totalPrice, 0);
                
                let favoriteItem = '-';
                let lastPurchase = '-';

                if (cSales.length > 0) {
                  const sortedSales = [...cSales].sort((a,b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
                  lastPurchase = new Date(sortedSales[0].date).toLocaleDateString();

                  const itemCounts = {};
                  cSales.forEach(s => {
                    itemCounts[s.productName] = (itemCounts[s.productName] || 0) + s.quantity;
                  });
                  const bestItem = Object.entries(itemCounts).sort((a,b) => b[1] - a[1])[0];
                  if (bestItem) favoriteItem = bestItem[0];
                }

                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>
                      <div>{c.phone}</div>
                      <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>{c.email}</div>
                    </td>
                    <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{c.points || 0} pts</td>
                    <td>
                      <div style={{ color: c.accountBalance > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        Owes: <strong>{(c.accountBalance || 0).toLocaleString()} FRW</strong>
                      </div>
                      <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>
                        Limit: {(c.creditLimit || 0).toLocaleString()} FRW
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Lifetime Value:</span> <strong>{totalSpent.toLocaleString()} FRW</strong>
                      </div>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Last Visit:</span> <strong>{lastPurchase}</strong>
                      </div>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Favorite:</span> <strong>{favoriteItem}</strong>
                      </div>
                    </td>
                    <td className="actions">
                      {c.accountBalance > 0 && (
                        <button className="btn-sm btn-primary" onClick={() => handlePayBalance(c)} style={{ background: 'var(--success)' }}>Pay</button>
                      )}
                      <button className="btn-sm btn-secondary" onClick={() => setHistoryCustomer(c)}>History</button>
                      <button className="btn-sm" onClick={() => handleEdit(c)}>Edit</button>
                      {currentUser.role === 'Admin' && (
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Del</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr><td colSpan={4} className="empty">No customers added yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {historyCustomer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2>{historyCustomer.name}'s Purchase History</h2>
            <div style={{ marginBottom: '20px', color: 'var(--primary)', fontWeight: 'bold' }}>
              Points Balance: {historyCustomer.points || 0} pts
            </div>
            
            <table className="cat-table" style={{ width: '100%', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total Price</th>
                </tr>
              </thead>
              <tbody>
                {sales.filter(s => s.customerId === historyCustomer.id).sort((a,b) => new Date(b.date) - new Date(a.date)).map(s => (
                  <tr key={s.id}>
                    <td>{new Date(s.date).toLocaleDateString()}</td>
                    <td>{s.quantity}x {s.productName}</td>
                    <td>{s.totalPrice.toLocaleString()} FRW</td>
                  </tr>
                ))}
                {sales.filter(s => s.customerId === historyCustomer.id).length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No purchases yet.</td></tr>
                )}
              </tbody>
            </table>
            
            <div style={{ textAlign: 'right' }}>
              <button className="btn-secondary" onClick={() => setHistoryCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

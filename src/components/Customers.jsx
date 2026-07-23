import React, { useState, useEffect } from 'react';

const defaultCustomer = {
  name: '',
  phone: '',
  email: '',
  address: ''
};

export default function Customers({ currentUser }) {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState(defaultCustomer);
  const [editingId, setEditingId] = useState(null);

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
      if (editingId) {
        await window.api.updateCustomer({ ...form, id: editingId }, currentUser.id);
      } else {
        await window.api.addCustomer(form, currentUser.id);
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
    if (confirm('Delete this customer?')) {
      await window.api.deleteCustomer(id, currentUser.id);
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
          <div className="form-row">
            <label>Address / Notes</label>
            <input name="address" value={form.address} onChange={handleChange} />
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
                <th>Total Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => {
                const totalSpent = sales.filter(s => s.customerId === c.id).reduce((sum, s) => sum + s.totalPrice, 0);
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>
                      <div>{c.phone}</div>
                      <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>{c.email}</div>
                    </td>
                    <td className="interest">{totalSpent.toLocaleString()} FRW</td>
                    <td className="actions">
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
    </div>
  );
}

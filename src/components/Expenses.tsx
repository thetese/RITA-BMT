import React, { useState, useEffect } from 'react';
import { useConfirm } from './ui/Confirm';

const defaultExpense = {
  category: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
  projectId: '',
  status: 'Unbilled'
};

export default function Expenses({ currentUser }) {
  const { askConfirm } = useConfirm();
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(defaultExpense);
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    if (!window.api) return;
    const data = await window.api.getExpenses();
    setExpenses(data || []);
    const projs = await window.api.getProjects();
    setProjects(projs || []);
  };

  useEffect(() => { loadData(); }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount.toString().replace(/,/g, '')) || 0,
      };
      if (editingId) {
        await window.api.updateExpense({ ...payload, id: editingId }, currentUser.id);
      } else {
        await window.api.addExpense(payload, currentUser.id);
      }
      setForm(defaultExpense);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (exp) => {
    setForm({
      ...exp,
      amount: formatMoney(exp.amount)
    });
    setEditingId(exp.id);
  };

  const handleDelete = async (id) => {
    if (await askConfirm('Delete this expense?')) {
      await window.api.deleteExpense(id, currentUser.id);
      loadData();
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="expenses-mgmt">
      <div className="sales-form">
        <h2>{editingId ? 'Edit Expense' : 'Log Daily Expense'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Date *</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Category *</label>
            <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Rent, Salary, Internet" required />
          </div>
          <div className="form-row">
            <label>Amount (FRW) *</label>
            <input name="amount" type="text" inputMode="numeric" value={form.amount} onChange={handleMoney} required />
          </div>
          <div className="form-row">
            <label>Link to Project (Optional)</label>
            <select name="projectId" value={form.projectId || ''} onChange={handleChange}>
              <option value="">None (General Business Expense)</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Notes</label>
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="Optional details..." />
          </div>
          <div className="form-actions">
            {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(defaultExpense); }}>Cancel</button>}
            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add Expense'}</button>
          </div>
        </form>
      </div>

      <div className="sales-list" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Expense History</h2>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Total: {totalExpenses.toLocaleString()} FRW</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Project / Notes</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => {
                const proj = projects.find(p => p.id === e.projectId);
                return (
                  <tr key={e.id}>
                    <td>{e.date}</td>
                    <td><span className="badge">{e.category}</span></td>
                    <td>
                      {proj && <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{proj.name}</div>}
                      <div style={{ fontSize: '0.85rem' }}>{e.notes}</div>
                    </td>
                    <td className="warning">{e.amount.toLocaleString()} FRW</td>
                    <td>
                      {e.projectId ? (
                        <span className="badge" style={{ background: e.status === 'Billed' ? 'var(--success)' : 'var(--warning)', color: '#fff' }}>
                          {e.status || 'Unbilled'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Internal</span>
                      )}
                    </td>
                    <td className="actions">
                      <button className="btn-sm" onClick={() => handleEdit(e)} disabled={e.status === 'Billed'}>Edit</button>
                      {currentUser.role === 'Admin' && (
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(e.id)} disabled={e.status === 'Billed'}>Del</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {expenses.length === 0 && (
                <tr><td colSpan={5} className="empty">No expenses logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

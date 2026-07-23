import React, { useState, useEffect } from 'react';
import { useToast } from './ui/Toast';
import { useConfirm } from './ui/Confirm';

const defaultAccounter = {
  name: '',
  shift: 'Morning',
};

export default function AccountersManagement() {
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const [accounters, setAccounters] = useState([]);
  const [form, setForm] = useState(defaultAccounter);
  const [editingId, setEditingId] = useState(null);

  const loadAccounters = async () => {
    const data = await window.api.getAccounters();
    setAccounters(data);
  };

  useEffect(() => { loadAccounters(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await window.api.updateAccounter({ ...form, id: editingId });
      } else {
        await window.api.addAccounter(form);
      }
      setForm(defaultAccounter);
      setEditingId(null);
      loadAccounters();
      showToast(editingId ? "Accounter updated successfully" : "Accounter added successfully", "success");
    } catch (err) {
      showToast("Error adding accounter: " + err.message + "\n\nIf the error says 'is not a function', please CLOSE the app completely and restart it.", "error");
      console.error(err);
    }
  };

  const handleEdit = (acc) => {
    setForm({ name: acc.name, shift: acc.shift });
    setEditingId(acc.id);
  };

  const handleDelete = async (id) => {
    if (await askConfirm('Delete this accounter?')) {
      await window.api.deleteAccounter(id);
      loadAccounters();
    }
  };

  return (
    <div className="management-page">
      <div className="sales-form">
        <h2>{editingId ? 'Edit Accounter' : 'Add New Accounter'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Shift *</label>
            <select name="shift" value={form.shift} onChange={handleChange} required>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
              <option value="General">General</option>
            </select>
          </div>
          <div className="form-actions">
            {editingId && (
              <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(defaultAccounter); }}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Accounter' : 'Add Accounter'}
            </button>
          </div>
        </form>
      </div>

      <div className="sales-list" style={{ marginTop: '30px' }}>
        <h2>Team Members</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Shift</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounters.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.name}</strong></td>
                  <td><span className="badge">{a.shift}</span></td>
                  <td>
                    <div className="actions">
                      <button className="btn-sm" onClick={() => handleEdit(a)}>Edit</button>
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(a.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {accounters.length === 0 && (
                <tr><td colSpan={3} className="empty">No team members defined.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

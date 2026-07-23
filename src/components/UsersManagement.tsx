// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useToast } from './ui/Toast';
import { useConfirm } from './ui/Confirm';

const defaultUser = {
  username: '',
  password: '',
  role: 'Staff',
  pin: '',
  securityQuestion: '',
  securityAnswer: '',
  hourlyRate: 0,
  commissionRate: 0,
  taxRate: 0
};

export default function UsersManagement({ currentUser }) {
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(defaultUser);
  const [editingId, setEditingId] = useState(null);
  
  // To handle resetting a password instead of normal edit
  const [resettingPasswordId, setResettingPasswordId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const loadUsers = async () => {
    if (!window.api) return;
    const data = await window.api.getUsers();
    setUsers(data);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // We do not change the password via normal update
        const userToUpdate = users.find(u => u.id === editingId);
        // Fetch full user to retain existing securityAnswer
        const fullUser = await window.api.getUserByUsername(userToUpdate.username);
        
        await window.api.updateUser({ 
          ...fullUser,
          username: form.username,
          role: form.role,
          pin: form.pin,
          securityQuestion: form.securityQuestion,
          securityAnswer: form.securityAnswer || fullUser.securityAnswer, // do not clear if empty
          hourlyRate: form.hourlyRate,
          commissionRate: form.commissionRate,
          taxRate: form.taxRate
        }, currentUser?.id);
      } else {
        if (form.password.length < 4) {
          showToast("Password too short", "error");
          return;
        }
        await window.api.addUser({
          username: form.username,
          passwordHash: form.password,
          role: form.role,
          pin: form.pin,
          securityQuestion: form.securityQuestion,
          securityAnswer: form.securityAnswer,
          hourlyRate: form.hourlyRate,
          commissionRate: form.commissionRate,
          taxRate: form.taxRate
        }, currentUser?.id);
      }
      setForm(defaultUser);
      setEditingId(null);
      loadUsers();
      showToast(editingId ? "User updated successfully" : "User added successfully", "success");
    } catch (err) {
      showToast("Error saving user: " + err.message, "error");
      console.error(err);
    }
  };

  const handleEdit = async (u) => {
    const fullUser = await window.api.getUserByUsername(u.username);
    setForm({ 
      username: fullUser.username,
      password: '',
      role: fullUser.role,
      pin: fullUser.pin || '',
      securityQuestion: fullUser.securityQuestion || '',
      securityAnswer: '', // Hidden
      hourlyRate: fullUser.hourlyRate || 0,
      commissionRate: fullUser.commissionRate || 0,
      taxRate: fullUser.taxRate || 0
    });
    setEditingId(fullUser.id);
    setResettingPasswordId(null);
  };

  const handleDelete = async (id, username) => {
    if (id === currentUser.id) {
      showToast("You cannot delete your own account.", "error");
      return;
    }
    if (await askConfirm(`Delete user ${username}?`)) {
      await window.api.deleteUser(id, currentUser?.id);
      loadUsers();
    }
  };

  const handleResetPasswordSubmit = async (e, u) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      showToast("Password too short.", "error");
      return;
    }
    try {
      const fullUser = await window.api.getUserByUsername(u.username);
      await window.api.updateUser({
        ...fullUser,
        passwordHash: newPassword
      }, currentUser?.id);
      showToast(`Password for ${u.username} has been reset.`, "success");
      setResettingPasswordId(null);
      setNewPassword('');
      loadUsers();
    } catch (err) {
      showToast("Error resetting password: " + err.message, "error");
    }
  };

  return (
    <div className="management-page">
      <div className="sales-form">
        <h2>{editingId ? 'Edit User' : 'Add New User'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Username *</label>
            <input name="username" value={form.username} onChange={handleChange} required disabled={editingId && currentUser.username === form.username} />
          </div>
          
          {!editingId && (
            <div className="form-row">
              <label>Initial Password *</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
          )}
          
          <div className="form-row">
            <label>Role *</label>
            <select name="role" value={form.role} onChange={handleChange} required disabled={editingId && currentUser.username === form.username}>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          
          <div className="form-row">
            <label>Security Question (Optional)</label>
            <input name="securityQuestion" value={form.securityQuestion} onChange={handleChange} placeholder="e.g. Favorite color?" />
          </div>

          <div className="form-row">
            <label>POS Cashier PIN (Optional 4-digits)</label>
            <input name="pin" type="text" maxLength="4" value={form.pin || ''} onChange={handleChange} placeholder="e.g. 1234" />
          </div>

          <div className="form-row">
            <label>Security Answer (Leave blank to keep existing)</label>
            <input name="securityAnswer" type="password" value={form.securityAnswer} onChange={handleChange} />
          </div>

          <div className="form-row">
            <label>Hourly Rate (FRW)</label>
            <input name="hourlyRate" type="number" min="0" step="any" value={form.hourlyRate || 0} onChange={handleChange} />
          </div>

          <div className="form-row">
            <label>Commission Rate (%)</label>
            <input name="commissionRate" type="number" min="0" max="100" step="any" value={form.commissionRate || 0} onChange={handleChange} />
          </div>

          <div className="form-row">
            <label>Tax Withholding Rate (%)</label>
            <input name="taxRate" type="number" min="0" max="100" step="any" value={form.taxRate || 0} onChange={handleChange} />
          </div>

          <div className="form-actions">
            {editingId && (
              <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(defaultUser); }}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary">
              {editingId ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </div>

      <div className="sales-list" style={{ marginTop: '30px' }}>
        <h2>System Users</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <React.Fragment key={u.id}>
                  <tr>
                    <td><strong>{u.username}</strong> {u.id === currentUser.id ? '(You)' : ''}</td>
                    <td><span className="badge">{u.role}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="actions">
                        <button className="btn-sm" onClick={() => handleEdit(u)}>Edit</button>
                        <button className="btn-sm" onClick={() => { setResettingPasswordId(resettingPasswordId === u.id ? null : u.id); setNewPassword(''); setEditingId(null); }}>
                          Reset Password
                        </button>
                        {u.id !== currentUser.id && (
                          <button className="btn-sm btn-danger" onClick={() => handleDelete(u.id, u.username)}>Del</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {resettingPasswordId === u.id && (
                    <tr>
                      <td colSpan={4} style={{ background: 'var(--bg-color)', padding: '15px' }}>
                        <form onSubmit={(e) => handleResetPasswordSubmit(e, u)} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input 
                            type="password" 
                            placeholder={`New password for ${u.username}`} 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{ flex: 1 }}
                          />
                          <button type="submit" className="btn-primary btn-sm">Save New Password</button>
                          <button type="button" className="btn-secondary btn-sm" onClick={() => setResettingPasswordId(null)}>Cancel</button>
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} className="empty">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

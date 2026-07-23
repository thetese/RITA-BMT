// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useToast } from './ui/Toast';
import { useConfirm } from './ui/Confirm';
import { 
  Users as UsersIcon, 
  Clock, 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  FileText, 
  CheckCircle, 
  X, 
  DollarSign, 
  RefreshCw, 
  LogOut 
} from 'lucide-react';

const defaultUser = {
  username: '',
  password: '',
  role: 'Staff',
  pin: '',
  securityQuestion: '',
  securityAnswer: '',
  hourlyRate: 0,
  commissionRate: 0
};

const defaultTimecard = {
  id: '',
  userId: '',
  clockIn: '',
  clockOut: '',
  hourlyRate: 0
};

export default function UsersManagement({ currentUser }) {
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(defaultUser);
  const [editingId, setEditingId] = useState(null);
  
  // Tab control: 'users' or 'timecards'
  const [activeTab, setActiveTab] = useState('users');

  // Reset password states
  const [resettingPasswordId, setResettingPasswordId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Timecards states
  const [timecards, setTimecards] = useState([]);
  const [timecardForm, setTimecardForm] = useState(defaultTimecard);
  const [isTimecardModalOpen, setIsTimecardModalOpen] = useState(false);
  const [isEditingTimecard, setIsEditingTimecard] = useState(false);
  const [loadingTimecards, setLoadingTimecards] = useState(false);

  // Timecard filters
  const [filterUser, setFilterUser] = useState('ALL');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const loadUsers = async () => {
    if (!window.api) return;
    const data = await window.api.getUsers();
    setUsers(data);
  };

  const loadTimecards = async () => {
    if (!window.api) return;
    setLoadingTimecards(true);
    try {
      const data = await window.api.getTimecards();
      setTimecards(data);
    } catch (e) {
      console.error("Failed to load timecards:", e);
      showToast("Error loading timecards: " + e.message, "error");
    } finally {
      setLoadingTimecards(false);
    }
  };

  const loadAllData = async () => {
    await loadUsers();
    await loadTimecards();
  };

  useEffect(() => { loadAllData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const userToUpdate = users.find(u => u.id === editingId);
        const fullUser = await window.api.getUserByUsername(userToUpdate.username);
        
        await window.api.updateUser({ 
          ...fullUser,
          username: form.username,
          role: form.role,
          pin: form.pin,
          securityQuestion: form.securityQuestion,
          securityAnswer: form.securityAnswer || fullUser.securityAnswer,
          hourlyRate: parseFloat(form.hourlyRate) || 0,
          commissionRate: parseFloat(form.commissionRate) || 0
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
          hourlyRate: parseFloat(form.hourlyRate) || 0,
          commissionRate: parseFloat(form.commissionRate) || 0
        }, currentUser?.id);
      }
      setForm(defaultUser);
      setEditingId(null);
      loadAllData();
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
      securityAnswer: '',
      hourlyRate: fullUser.hourlyRate || 0,
      commissionRate: fullUser.commissionRate || 0
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
      loadAllData();
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
      loadAllData();
    } catch (err) {
      showToast("Error resetting password: " + err.message, "error");
    }
  };

  // --- Timecards Handlers ---

  const toLocalDatetimeString = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const toISOStringFromLocal = (localString) => {
    if (!localString) return null;
    return new Date(localString).toISOString();
  };

  const handleTimecardEmployeeChange = (e) => {
    const selectedUserId = e.target.value;
    const user = users.find(u => u.id === selectedUserId);
    setTimecardForm(prev => ({
      ...prev,
      userId: selectedUserId,
      hourlyRate: user ? (user.hourlyRate || 0) : 0
    }));
  };

  const handleTimecardFormChange = (e) => {
    const { name, value } = e.target;
    setTimecardForm(prev => ({ ...prev, [name]: value }));
  };

  const openAddTimecardModal = () => {
    const firstUser = users[0];
    setTimecardForm({
      id: '',
      userId: firstUser ? firstUser.id : '',
      clockIn: toLocalDatetimeString(new Date().toISOString()),
      clockOut: '',
      hourlyRate: firstUser ? (firstUser.hourlyRate || 0) : 0
    });
    setIsEditingTimecard(false);
    setIsTimecardModalOpen(true);
  };

  const handleTimecardEdit = (tc) => {
    setTimecardForm({
      id: tc.id,
      userId: tc.userId,
      clockIn: toLocalDatetimeString(tc.clockIn),
      clockOut: toLocalDatetimeString(tc.clockOut),
      hourlyRate: tc.hourlyRate || 0
    });
    setIsEditingTimecard(true);
    setIsTimecardModalOpen(true);
  };

  const handleTimecardSubmit = async (e) => {
    e.preventDefault();
    if (!timecardForm.userId) {
      showToast("Please select an employee", "error");
      return;
    }
    if (!timecardForm.clockIn) {
      showToast("Please select a clock-in time", "error");
      return;
    }

    const payload = {
      id: timecardForm.id,
      userId: timecardForm.userId,
      clockIn: toISOStringFromLocal(timecardForm.clockIn),
      clockOut: toISOStringFromLocal(timecardForm.clockOut),
      hourlyRate: parseFloat(timecardForm.hourlyRate) || 0,
      storeId: 'general' // Default store ID context
    };

    try {
      if (isEditingTimecard) {
        await window.api.updateTimecard(payload, currentUser?.id);
        showToast("Timecard updated successfully", "success");
      } else {
        await window.api.addTimecard(payload, currentUser?.id);
        showToast("Timecard added successfully", "success");
      }
      setIsTimecardModalOpen(false);
      loadTimecards();
    } catch (err) {
      showToast("Failed to save timecard: " + err.message, "error");
    }
  };

  const handleTimecardDelete = async (id) => {
    if (await askConfirm("Are you sure you want to delete this timecard record? This action cannot be undone.")) {
      try {
        await window.api.deleteTimecard(id, currentUser?.id);
        showToast("Timecard deleted successfully", "success");
        loadTimecards();
      } catch (err) {
        showToast("Failed to delete timecard: " + err.message, "error");
      }
    }
  };

  const handleForceClockOut = async (tc) => {
    if (await askConfirm(`Force clock out for employee?`)) {
      try {
        await window.api.clockOut(tc.id);
        showToast("Employee clocked out successfully", "success");
        loadTimecards();
      } catch (err) {
        showToast("Failed to clock out: " + err.message, "error");
      }
    }
  };

  // --- Filtering & Computation ---

  // Build employee username map
  const userMap = {};
  users.forEach(u => {
    userMap[u.id] = u.username;
  });

  const filteredTimecards = timecards.filter(tc => {
    const matchUser = filterUser === 'ALL' || tc.userId === filterUser;
    
    // Convert dates for comparisons
    const tcDate = tc.clockIn.substring(0, 10);
    const matchStart = !filterStart || tcDate >= filterStart;
    const matchEnd = !filterEnd || tcDate <= filterEnd;

    return matchUser && matchStart && matchEnd;
  });

  // Calculate metrics
  let totalHours = 0;
  let totalWages = 0;
  let activeSessionsCount = 0;

  filteredTimecards.forEach(tc => {
    if (tc.clockOut) {
      const hours = (new Date(tc.clockOut) - new Date(tc.clockIn)) / (1000 * 60 * 60);
      if (hours > 0) {
        totalHours += hours;
        totalWages += hours * (tc.hourlyRate || 0);
      }
    } else {
      activeSessionsCount++;
    }
  });

  return (
    <div className="management-page" style={{ padding: '20px' }}>
      {/* CSS Stylesheet Inject */}
      <style>{`
        .nav-tabs {
          display: flex;
          border-bottom: 2px solid var(--border-color, #e2e8f0);
          margin-bottom: 25px;
          gap: 15px;
        }
        .nav-tab-btn {
          background: transparent;
          border: none;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-secondary, #64748b);
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-tab-btn:hover {
          color: var(--primary-color, #db2777);
        }
        .nav-tab-btn.active {
          color: var(--primary-color, #db2777);
          border-bottom-color: var(--primary-color, #db2777);
        }
        
        /* Stats Dashboard Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }
        .stat-card {
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }
        .stat-info h3 {
          font-size: 0.85rem;
          color: var(--text-secondary, #64748b);
          margin: 0 0 5px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-info p {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary, #0f172a);
        }

        /* Filter bar */
        .filters-bar {
          background: var(--bg-secondary, #f8fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 10px;
          padding: 15px 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          align-items: flex-end;
          margin-bottom: 25px;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 150px;
        }
        .filter-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary, #64748b);
        }
        .filter-group select, .filter-group input {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-primary, #ffffff);
          color: var(--text-primary, #0f172a);
          font-size: 0.9rem;
          outline: none;
        }
        .filter-actions {
          display: flex;
          gap: 10px;
          margin-left: auto;
        }

        /* Modal Overlay & Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-box {
          background: var(--bg-primary, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 16px;
          width: 90%;
          max-width: 480px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }
        .modal-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-secondary, #f8fafc);
        }
        .modal-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary, #0f172a);
        }
        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary, #64748b);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-btn:hover {
          background: var(--border-color, #e2e8f0);
          color: var(--text-primary, #0f172a);
        }
        .modal-body {
          padding: 24px;
        }
        
        .badge-active {
          background-color: #dcfce7;
          color: #15803d;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Page Header */}
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Shield size={28} /> Users & Access Settings
      </h1>

      {/* Tabs Menu */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <UsersIcon size={18} /> User Accounts
        </button>
        <button 
          className={`nav-tab-btn ${activeTab === 'timecards' ? 'active' : ''}`}
          onClick={() => setActiveTab('timecards')}
        >
          <Clock size={18} /> Timecard & Attendance Manager
        </button>
      </div>

      {/* USER ACCOUNTS TAB */}
      {activeTab === 'users' && (
        <div className="management-page" style={{ padding: 0 }}>
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
                  <option value="Sales">Sales</option>
                  <option value="Worker">Worker</option>
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
                    <th>Hourly Rate</th>
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
                        <td>{(u.hourlyRate || 0).toLocaleString()} FRW/hr</td>
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
                          <td colSpan={5} style={{ background: 'var(--bg-color)', padding: '15px' }}>
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
                    <tr><td colSpan={5} className="empty">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TIMECARD & ATTENDANCE MANAGER TAB */}
      {activeTab === 'timecards' && (
        <div>
          {/* Summary Dashboard Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#db2777' }}>
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <h3>Total Hours Worked</h3>
                <p>{totalHours.toFixed(1)} hrs</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
                <DollarSign size={24} />
              </div>
              <div className="stat-info">
                <h3>Total Est. Wages</h3>
                <p>{totalWages.toLocaleString()} FRW</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#6366f1' }}>
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <h3>Active Clocked-In</h3>
                <p>{activeSessionsCount} employees</p>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="filters-bar">
            <div className="filter-group">
              <label>Employee</label>
              <select value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                <option value="ALL">All Employees</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Start Date</label>
              <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} />
            </div>
            <div className="filter-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => { setFilterUser('ALL'); setFilterStart(''); setFilterEnd(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
              >
                Reset
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={openAddTimecardModal}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
              >
                <Plus size={16} /> Add Shift Record
              </button>
            </div>
          </div>

          {/* Timecards List */}
          <div className="sales-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2>Attendance Log ({filteredTimecards.length} entries)</h2>
              <button 
                className="btn-secondary btn-sm" 
                onClick={loadTimecards} 
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                disabled={loadingTimecards}
              >
                <RefreshCw size={12} className={loadingTimecards ? 'spin' : ''} /> Refresh
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Duration</th>
                    <th>Hourly Rate</th>
                    <th>Est. Wages</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimecards.map(tc => {
                    const clockInDate = new Date(tc.clockIn);
                    const clockOutDate = tc.clockOut ? new Date(tc.clockOut) : null;
                    let durationStr = 'Active';
                    let wageCost = 0;

                    if (clockOutDate) {
                      const diffMs = clockOutDate - clockInDate;
                      const totalMins = Math.floor(diffMs / (1000 * 60));
                      const hrs = Math.floor(totalMins / 60);
                      const mins = totalMins % 60;
                      durationStr = `${hrs}h ${mins}m`;
                      wageCost = (diffMs / (1000 * 60 * 60)) * (tc.hourlyRate || 0);
                    }

                    return (
                      <tr key={tc.id}>
                        <td><strong>{userMap[tc.userId] || tc.userId}</strong></td>
                        <td>{clockInDate.toLocaleString()}</td>
                        <td>
                          {clockOutDate ? (
                            clockOutDate.toLocaleString()
                          ) : (
                            <span className="badge-active">Active Now</span>
                          )}
                        </td>
                        <td>{durationStr}</td>
                        <td>{(tc.hourlyRate || 0).toLocaleString()} FRW</td>
                        <td>
                          {clockOutDate ? (
                            <strong>{Math.round(wageCost).toLocaleString()} FRW</strong>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>-</span>
                          )}
                        </td>
                        <td>
                          <div className="actions" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                            {!clockOutDate && (
                              <button 
                                className="btn-sm" 
                                style={{ background: '#e0f2fe', color: '#0369a1', borderColor: '#bbae6fd' }}
                                onClick={() => handleForceClockOut(tc)}
                                title="Force employee to Clock Out now"
                              >
                                <LogOut size={12} style={{ marginRight: '4px' }} /> Clock Out
                              </button>
                            )}
                            <button className="btn-sm" onClick={() => handleTimecardEdit(tc)}>
                              <Edit2 size={12} /> Edit
                            </button>
                            <button className="btn-sm btn-danger" onClick={() => handleTimecardDelete(tc.id)}>
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTimecards.length === 0 && (
                    <tr>
                      <td colSpan={7} className="empty" style={{ textAlign: 'center', padding: '30px' }}>
                        No timecard entries found matching the selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TIMECARD MODAL FORM */}
      {isTimecardModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>{isEditingTimecard ? 'Modify Shift Record' : 'Manual Shift Log'}</h3>
              <button className="close-btn" onClick={() => setIsTimecardModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleTimecardSubmit}>
              <div className="modal-body">
                
                {/* Select User (Disable on edit to avoid moving shifts between employees) */}
                <div className="form-row">
                  <label>Employee *</label>
                  <select 
                    name="userId" 
                    value={timecardForm.userId} 
                    onChange={handleTimecardEmployeeChange} 
                    required 
                    disabled={isEditingTimecard}
                  >
                    <option value="" disabled>-- Select Employee --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>

                {/* Clock In Date-Time */}
                <div className="form-row">
                  <label>Clock In Time *</label>
                  <input 
                    name="clockIn" 
                    type="datetime-local" 
                    value={timecardForm.clockIn} 
                    onChange={handleTimecardFormChange} 
                    required 
                  />
                </div>

                {/* Clock Out Date-Time */}
                <div className="form-row">
                  <label>Clock Out Time (Leave blank if currently clocked in)</label>
                  <input 
                    name="clockOut" 
                    type="datetime-local" 
                    value={timecardForm.clockOut} 
                    onChange={handleTimecardFormChange} 
                  />
                </div>

                {/* Hourly Rate */}
                <div className="form-row">
                  <label>Hourly Rate (FRW)</label>
                  <input 
                    name="hourlyRate" 
                    type="number" 
                    min="0" 
                    step="any"
                    value={timecardForm.hourlyRate} 
                    onChange={handleTimecardFormChange} 
                  />
                </div>

                <div className="form-actions" style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setIsTimecardModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {isEditingTimecard ? 'Update Record' : 'Save Record'}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

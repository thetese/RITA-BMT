import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, LogOut } from 'lucide-react';
import { useToast } from './ui/Toast';
import { formatTime } from '../utils/format';

export default function EmployeeTimecards({ currentUser }) {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [timecards, setTimecards] = useState([]);
  const [pinInput, setPinInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const loadData = async () => {
    if (!window.api) return;
    const u = await window.api.getUsers();
    setUsers(u);
    const t = await window.api.getTimecards();
    setTimecards(t);
  };

  useEffect(() => { loadData(); }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setPinInput('');
  };

  const handlePinSubmit = async () => {
    if (!selectedUser) return;
    if (selectedUser.pin && selectedUser.pin !== pinInput) {
      showToast('Incorrect PIN', 'error');
      return;
    }

    // Check if currently clocked in
    const activeTimecard = timecards.find(t => t.userId === selectedUser.id && !t.clockOut);

    try {
      if (activeTimecard) {
        await window.api.clockOut(activeTimecard.id);
        showToast(`Clocked out successfully`, 'success');
      } else {
        await window.api.clockIn(selectedUser.id, selectedUser.hourlyRate);
        showToast(`Clocked in successfully`, 'success');
      }
      setSelectedUser(null);
      setPinInput('');
      await loadData();
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    }
  };

  const getStatus = (userId) => {
    const active = timecards.find(t => t.userId === userId && !t.clockOut);
    return active;
  };

  if (selectedUser) {
    const active = getStatus(selectedUser.id);
    return (
      <div style={{ maxWidth: '400px', margin: '40px auto', background: 'var(--bg-primary)', padding: '30px', borderRadius: '12px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{selectedUser.username}</h2>
        <div style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.2rem', color: active ? 'var(--success)' : 'var(--text-secondary)' }}>
          {active ? `Clocked In at ${formatTime(active.clockIn)}` : 'Currently Clocked Out'}
        </div>
        
        {selectedUser.pin && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', textAlign: 'center' }}>Enter PIN</label>
            <input 
              type="password" 
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              style={{ width: '100%', padding: '15px', fontSize: '24px', textAlign: 'center', borderRadius: '8px', border: '2px solid var(--border-color)', letterSpacing: '8px' }}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handlePinSubmit(); }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" style={{ flex: 1, padding: '15px' }} onClick={() => setSelectedUser(null)}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1, padding: '15px', background: active ? 'var(--danger)' : 'var(--success)' }} onClick={handlePinSubmit}>
            {active ? 'Clock Out' : 'Clock In'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Clock /> Employee Timecards
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {users.map(u => {
          const active = getStatus(u.id);
          return (
            <div 
              key={u.id}
              onClick={() => handleUserSelect(u)}
              style={{ 
                background: 'var(--card-bg)', 
                padding: '20px', 
                borderRadius: '12px', 
                cursor: 'pointer',
                border: `2px solid ${active ? 'var(--success)' : 'var(--border-color)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                {u.username.substring(0,2).toUpperCase()}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{u.username}</div>
              <div style={{ color: active ? 'var(--success)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {active ? <CheckCircle size={16} /> : <LogOut size={16} />}
                {active ? 'Clocked In' : 'Clocked Out'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

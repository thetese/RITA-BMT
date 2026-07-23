import React, { useState, useEffect } from 'react';

const GuestDirectory = ({ api, reload }) => {
  const [guests, setGuests] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', preferences: '', vipStatus: 'Standard' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGuests = async () => {
    try {
      const data = await api.hotelGetGuests();
      setGuests(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleSave = async () => {
    if (!newGuest.name) return;
    await api.hotelAddGuest(newGuest);
    setShowAddForm(false);
    setNewGuest({ name: '', email: '', phone: '', preferences: '', vipStatus: 'Standard' });
    fetchGuests();
  };

  const filteredGuests = guests.filter((g: any) => g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.email?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="hotel-card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Guest Directory (CRM)</h2>
          <p className="hotel-text-muted" style={{ margin: '5px 0 0 0' }}>Manage centralized guest profiles and history</p>
        </div>
        <button className="hotel-btn hotel-btn-primary" onClick={() => setShowAddForm(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8h-4M18 6v4"/></svg>
          Add Guest
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input 
          className="hotel-input" 
          placeholder="Search by name or email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      <table className="hotel-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>VIP Status</th>
            <th>Total Stays</th>
            <th>Preferences</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredGuests.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>No guests found.</td></tr>
          ) : filteredGuests.map((g: any) => (
            <tr key={g.id}>
              <td style={{ fontWeight: 'bold' }}>{g.name}</td>
              <td>
                <div style={{ fontSize: '0.9rem' }}>{g.email || '-'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--hotel-text-muted)' }}>{g.phone || '-'}</div>
              </td>
              <td>
                <span className={`hotel-badge ${g.vipStatus === 'VIP' ? 'hotel-badge-warning' : 'hotel-badge-clean'}`}>
                  {g.vipStatus}
                </span>
              </td>
              <td>{g.totalStays}</td>
              <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.preferences || '-'}</td>
              <td>
                <button className="hotel-btn hotel-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddForm && (
        <>
          <div className="hotel-modal-overlay" onClick={() => setShowAddForm(false)}></div>
          <div className="hotel-modal">
            <h2 style={{ marginTop: 0 }}>Add New Guest</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Full Name</label>
                <input className="hotel-input" value={newGuest.name} onChange={e => setNewGuest({...newGuest, name: e.target.value})} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Email</label>
                <input className="hotel-input" type="email" value={newGuest.email} onChange={e => setNewGuest({...newGuest, email: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Phone</label>
                <input className="hotel-input" type="tel" value={newGuest.phone} onChange={e => setNewGuest({...newGuest, phone: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>VIP Status</label>
                <select className="hotel-input" value={newGuest.vipStatus} onChange={e => setNewGuest({...newGuest, vipStatus: e.target.value})}>
                  <option>Standard</option>
                  <option>Silver</option>
                  <option>Gold</option>
                  <option>VIP</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Preferences / Notes</label>
                <textarea className="hotel-input" rows={3} value={newGuest.preferences} onChange={e => setNewGuest({...newGuest, preferences: e.target.value})} placeholder="e.g. Extra pillows, Late check-out..." />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button className="hotel-btn hotel-btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save Profile</button>
                <button className="hotel-btn hotel-btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GuestDirectory;

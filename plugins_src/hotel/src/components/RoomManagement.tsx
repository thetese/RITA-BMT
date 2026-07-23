import React, { useState } from 'react';

const RoomManagement = ({ rooms, properties, selectedPropertyId, api, reload }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoom, setNewRoom] = useState({ roomNumber: '', type: 'Standard', pricePerNight: 15000, capacity: 2 });

  const handleSave = async () => {
    if (!newRoom.roomNumber) return;
    await api.hotelAddRoom({ ...newRoom, propertyId: selectedPropertyId });
    setShowAddForm(false);
    setNewRoom({ roomNumber: '', type: 'Standard', pricePerNight: 15000, capacity: 2 });
    reload();
  };

  return (
    <div className="hotel-card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Room Inventory</h2>
          <p className="hotel-text-muted" style={{ margin: '5px 0 0 0' }}>Manage physical rooms for the selected property</p>
        </div>
        <button className="hotel-btn hotel-btn-primary" onClick={() => setShowAddForm(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Add Room
        </button>
      </div>

      <table className="hotel-table">
        <thead>
          <tr>
            <th>Room #</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Price/Night</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rooms.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No rooms added to this property yet.</td></tr>
          ) : rooms.map(r => (
            <tr key={r.id}>
              <td style={{ fontWeight: 'bold' }}>{r.roomNumber}</td>
              <td>{r.type}</td>
              <td>{r.capacity || 2} Pax</td>
              <td>{r.pricePerNight.toLocaleString()} FRW</td>
              <td>
                <span className={`hotel-badge hotel-badge-${r.status.toLowerCase().replace(' ', '-')}`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddForm && (
        <>
          <div className="hotel-modal-overlay" onClick={() => setShowAddForm(false)}></div>
          <div className="hotel-modal">
            <h2 style={{ marginTop: 0 }}>Add New Room</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Room Number</label>
                <input className="hotel-input" value={newRoom.roomNumber} onChange={e => setNewRoom({...newRoom, roomNumber: e.target.value})} placeholder="e.g. 101" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Room Type</label>
                <select className="hotel-input" value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})}>
                  <option>Standard</option>
                  <option>Double</option>
                  <option>Suite</option>
                  <option>Presidential</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Capacity (Guests)</label>
                <input type="number" className="hotel-input" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>Base Price / Night (FRW)</label>
                <input type="number" className="hotel-input" value={newRoom.pricePerNight} onChange={e => setNewRoom({...newRoom, pricePerNight: parseFloat(e.target.value)})} />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button className="hotel-btn hotel-btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save Room</button>
                <button className="hotel-btn hotel-btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoomManagement;

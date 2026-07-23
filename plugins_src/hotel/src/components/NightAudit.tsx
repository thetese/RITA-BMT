import React, { useState, useEffect } from 'react';

const NightAudit = ({ api, rooms, reservations }) => {
  const [audits, setAudits] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAudits = async () => {
    try {
      const data = await api.hotelGetNightAudits();
      setAudits(data || []);
    } catch (e) {
      console.error('Failed to fetch audits', e);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const runNightAudit = async () => {
    if (!confirm('Are you sure you want to run the Night Audit? This will roll the business date forward and post daily room charges.')) return;
    
    setIsProcessing(true);
    try {
      const occupiedRooms = rooms.filter((r: any) => r.status === 'Occupied').length;
      const totalRevenue = occupiedRooms * 15000; // Mock calculation for MVP
      
      const today = new Date().toISOString().split('T')[0];
      await api.hotelRunNightAudit({
        date: today,
        roomsOccupied: occupiedRooms,
        totalRevenue: totalRevenue,
        runBy: 'Admin'
      });
      
      await fetchAudits();
      alert('Night Audit completed successfully!');
    } catch (e) {
      console.error('Failed to run night audit', e);
      alert('Failed to process night audit.');
    }
    setIsProcessing(false);
  };

  return (
    <div className="hotel-card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Night Audit & End of Day</h2>
          <p className="hotel-text-muted" style={{ margin: '5px 0 0 0' }}>Process daily room charges and generate trial balances</p>
        </div>
        <button 
          className="hotel-btn hotel-btn-primary" 
          onClick={runNightAudit}
          disabled={isProcessing}
          style={{ background: isProcessing ? 'var(--hotel-text-muted)' : 'var(--hotel-warning)', border: 'none' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
          {isProcessing ? 'Processing...' : 'Run Night Audit'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{ padding: '20px', border: '1px solid var(--hotel-border)', borderRadius: '12px', background: 'var(--hotel-card-bg)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Pre-Audit Checklist</h3>
          <ul style={{ paddingLeft: '20px', color: 'var(--hotel-text-muted)', margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>Verify all arrivals have checked in</li>
            <li>Ensure all departures have checked out</li>
            <li>Post all outstanding POS routing charges</li>
            <li>Reconcile cash drawers</li>
          </ul>
        </div>
        <div style={{ padding: '20px', border: '1px solid var(--hotel-border)', borderRadius: '12px', background: 'var(--hotel-card-bg)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Current Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="hotel-text-muted">Business Date:</span>
              <span style={{ fontWeight: 600 }}>{new Date().toISOString().split('T')[0]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="hotel-text-muted">Occupied Rooms:</span>
              <span style={{ fontWeight: 600 }}>{rooms.filter((r: any) => r.status === 'Occupied').length} / {rooms.length}</span>
            </div>
          </div>
        </div>
      </div>

      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Audit History</h3>
      {audits.length > 0 ? (
        <table className="hotel-table">
          <thead>
            <tr>
              <th>Business Date</th>
              <th>Run Time</th>
              <th>Rooms Occupied</th>
              <th>Total Revenue</th>
              <th>Run By</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((a: any) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.date}</td>
                <td>{new Date(a.createdAt).toLocaleTimeString()}</td>
                <td>{a.roomsOccupied}</td>
                <td>{a.totalRevenue?.toLocaleString()} FRW</td>
                <td>{a.runBy}</td>
                <td><span className="hotel-badge hotel-badge-clean">Completed</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--hotel-text-muted)', border: '1px dashed var(--hotel-border)', borderRadius: '12px' }}>
          No night audits have been run yet.
        </div>
      )}
    </div>
  );
};

export default NightAudit;

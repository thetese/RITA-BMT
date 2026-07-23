const React = (window as any).React;
const { useState, useEffect } = React;

const FrontDesk = ({ api, rooms, reservations, selectedPropertyId, reload, onOpenFolio }) => {
  const [activeView, setActiveView] = useState('arrivals');
  const [walkinForm, setWalkinForm] = useState({ name: '', roomId: '', checkIn: '', checkOut: '', ratePlanId: null });
  const [showWalkin, setShowWalkin] = useState(false);
  const [ratePlans, setRatePlans] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (showWalkin) {
      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setWalkinForm(f => ({
        ...f,
        checkIn: todayStr,
        checkOut: tomorrow.toISOString().split('T')[0]
      }));
      api.hotelGetRatePlans(selectedPropertyId).then(plans => setRatePlans(plans || [])).catch(() => {});
    }
  }, [showWalkin]);

  const arrivals = reservations.filter(r => r.checkInDate === today && r.status === 'Pending');
  const departures = reservations.filter(r => r.checkOutDate === today && r.status === 'Checked-In');
  const inHouse = reservations.filter(r => r.status === 'Checked-In');

  const availableRooms = rooms.filter(r => r.status === 'Clean' || r.status === 'Dirty');

  const handleCheckIn = async (reservation) => {
    setProcessingId(reservation.id);
    try {
      await api.hotelUpdateReservationStatus(reservation.id, 'Checked-In', reservation.roomId);
      await api.hotelUpdateRoomStatus(reservation.roomId, 'Occupied');
      reload();
    } catch (e) {
      console.error('Check-in failed', e);
    }
    setProcessingId(null);
  };

  const handleCheckOut = async (reservation) => {
    if (!confirm(`Check out ${reservation.customerName} from Room ${reservation.roomId}?`)) return;
    setProcessingId(reservation.id);
    try {
      await api.hotelUpdateReservationStatus(reservation.id, 'Checked-Out', reservation.roomId);
      await api.hotelUpdateRoomStatus(reservation.roomId, 'Dirty');
      reload();
    } catch (e) {
      console.error('Check-out failed', e);
    }
    setProcessingId(null);
  };

  const handleNoShow = async (reservation) => {
    if (!confirm(`Mark ${reservation.customerName} as No-Show?`)) return;
    setProcessingId(reservation.id);
    try {
      await api.hotelUpdateReservationStatus(reservation.id, 'No-Show', reservation.roomId);
      reload();
    } catch (e) { console.error(e); }
    setProcessingId(null);
  };

  const handleWalkinSubmit = async () => {
    if (!walkinForm.name || !walkinForm.roomId) return;
    setProcessingId('walkin');
    try {
      await api.hotelAddReservation({
        propertyId: selectedPropertyId, customerId: '', customerName: walkinForm.name,
        roomId: walkinForm.roomId, checkInDate: walkinForm.checkIn, checkOutDate: walkinForm.checkOut,
        status: 'Checked-In', ratePlanId: walkinForm.ratePlanId
      });
      await api.hotelUpdateRoomStatus(walkinForm.roomId, 'Occupied');
      setShowWalkin(false);
      setWalkinForm({ name: '', roomId: '', checkIn: '', checkOut: '', ratePlanId: null });
      reload();
    } catch (e) {
      console.error('Walk-in failed', e);
    }
    setProcessingId(null);
  };

  return (
    <div>
      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div className="hotel-card" style={{ textAlign: 'center', padding: '16px', borderLeft: '3px solid var(--hotel-success)' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--hotel-success)' }}>{arrivals.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase' }}>Arrivals Today</div>
        </div>
        <div className="hotel-card" style={{ textAlign: 'center', padding: '16px', borderLeft: '3px solid var(--hotel-danger)' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--hotel-danger)' }}>{departures.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase' }}>Departures Today</div>
        </div>
        <div className="hotel-card" style={{ textAlign: 'center', padding: '16px', borderLeft: '3px solid var(--hotel-primary)' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--hotel-primary)' }}>{inHouse.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase' }}>In-House</div>
        </div>
        <div className="hotel-card" style={{ textAlign: 'center', padding: '16px', borderLeft: '3px solid var(--hotel-warning)' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--hotel-warning)' }}>{availableRooms.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase' }}>Available Rooms</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="hotel-tabs" style={{ marginBottom: '20px' }}>
        <div className={`hotel-tab ${activeView === 'arrivals' ? 'active' : ''}`} onClick={() => setActiveView('arrivals')}>
          Arrivals ({arrivals.length})
        </div>
        <div className={`hotel-tab ${activeView === 'departures' ? 'active' : ''}`} onClick={() => setActiveView('departures')}>
          Departures ({departures.length})
        </div>
        <div className={`hotel-tab ${activeView === 'inhouse' ? 'active' : ''}`} onClick={() => setActiveView('inhouse')}>
          In-House ({inHouse.length})
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="hotel-btn hotel-btn-primary" onClick={() => setShowWalkin(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Walk-In Reservation
        </button>
      </div>

      {/* Arrivals View */}
      {activeView === 'arrivals' && (
        <div className="hotel-card" style={{ padding: 0, overflow: 'hidden' }}>
          {arrivals.length > 0 ? (
            <table className="hotel-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {arrivals.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.customerName}</td>
                    <td>{r.roomId}</td>
                    <td>{new Date(r.checkInDate).toLocaleDateString()}</td>
                    <td>{new Date(r.checkOutDate).toLocaleDateString()}</td>
                    <td><span className="hotel-badge hotel-badge-warning">Pending</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="hotel-btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--hotel-success)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                          onClick={() => handleCheckIn(r)} disabled={processingId === r.id}>
                          {processingId === r.id ? '...' : 'Check In'}
                        </button>
                        <button className="hotel-btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'transparent', color: 'var(--hotel-text-muted)', border: '1px solid var(--hotel-border)', borderRadius: '8px', cursor: 'pointer' }}
                          onClick={() => onOpenFolio && onOpenFolio(r)}>Folio</button>
                        <button className="hotel-btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'transparent', color: 'var(--hotel-danger)', border: '1px solid var(--hotel-danger)', borderRadius: '8px', cursor: 'pointer' }}
                          onClick={() => handleNoShow(r)} disabled={processingId === r.id}>No-Show</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--hotel-text-muted)' }}>No arrivals scheduled for today.</div>
          )}
        </div>
      )}

      {/* Departures View */}
      {activeView === 'departures' && (
        <div className="hotel-card" style={{ padding: 0, overflow: 'hidden' }}>
          {departures.length > 0 ? (
            <table className="hotel-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departures.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.customerName}</td>
                    <td>{r.roomId}</td>
                    <td>{new Date(r.checkInDate).toLocaleDateString()}</td>
                    <td>{new Date(r.checkOutDate).toLocaleDateString()}</td>
                    <td><span className="hotel-badge hotel-badge-occupied">Checked-In</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="hotel-btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--hotel-danger)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                          onClick={() => handleCheckOut(r)} disabled={processingId === r.id}>
                          {processingId === r.id ? '...' : 'Check Out'}
                        </button>
                        <button className="hotel-btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'transparent', color: 'var(--hotel-text-muted)', border: '1px solid var(--hotel-border)', borderRadius: '8px', cursor: 'pointer' }}
                          onClick={() => onOpenFolio && onOpenFolio(r)}>Folio</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--hotel-text-muted)' }}>No departures scheduled for today.</div>
          )}
        </div>
      )}

      {/* In-House View */}
      {activeView === 'inhouse' && (
        <div className="hotel-card" style={{ padding: 0, overflow: 'hidden' }}>
          {inHouse.length > 0 ? (
            <table className="hotel-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inHouse.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.customerName}</td>
                    <td>{r.roomId}</td>
                    <td>{new Date(r.checkInDate).toLocaleDateString()}</td>
                    <td>{new Date(r.checkOutDate).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="hotel-btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'transparent', color: 'var(--hotel-text-muted)', border: '1px solid var(--hotel-border)', borderRadius: '8px', cursor: 'pointer' }}
                          onClick={() => onOpenFolio && onOpenFolio(r)}>Folio</button>
                        <button className="hotel-btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'transparent', color: 'var(--hotel-danger)', border: '1px solid var(--hotel-danger)', borderRadius: '8px', cursor: 'pointer' }}
                          onClick={() => handleCheckOut(r)} disabled={processingId === r.id}>
                          {processingId === r.id ? '...' : 'Check Out'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--hotel-text-muted)' }}>No guests currently checked in.</div>
          )}
        </div>
      )}

      {/* Walk-In Modal */}
      {showWalkin && (
        <>
          <div className="hotel-modal-overlay" onClick={() => setShowWalkin(false)}></div>
          <div className="hotel-modal">
            <h2 style={{ marginTop: 0 }}>Walk-In Reservation</h2>
            <p className="hotel-text-muted" style={{ fontSize: '0.9rem' }}>Register a guest without a prior reservation</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Guest Name *</label>
                <input className="hotel-input" value={walkinForm.name} onChange={e => setWalkinForm({ ...walkinForm, name: e.target.value })} placeholder="Guest full name" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Assign Room *</label>
                <select className="hotel-input" value={walkinForm.roomId} onChange={e => setWalkinForm({ ...walkinForm, roomId: e.target.value })}>
                  <option value="">Select available room</option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.roomNumber} - {r.type} ({r.status}) - {(r.pricePerNight || 0).toLocaleString()} FRW/night
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Rate Plan</label>
                <select className="hotel-input" value={walkinForm.ratePlanId || ''} onChange={e => setWalkinForm({ ...walkinForm, ratePlanId: e.target.value || null })}>
                  <option value="">Standard Rate (default)</option>
                  {ratePlans.filter(p => p.isActive !== false).map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {(p.basePrice || 0).toLocaleString()} FRW</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Check-In Date</label>
                  <input type="date" className="hotel-input" value={walkinForm.checkIn} onChange={e => setWalkinForm({ ...walkinForm, checkIn: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Check-Out Date</label>
                  <input type="date" className="hotel-input" value={walkinForm.checkOut} onChange={e => setWalkinForm({ ...walkinForm, checkOut: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button className="hotel-btn hotel-btn-primary" style={{ flex: 1 }}
                  onClick={handleWalkinSubmit} disabled={processingId === 'walkin'}>
                  {processingId === 'walkin' ? 'Processing...' : 'Check In Guest'}
                </button>
                <button className="hotel-btn hotel-btn-secondary" style={{ flex: 1 }} onClick={() => setShowWalkin(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FrontDesk;

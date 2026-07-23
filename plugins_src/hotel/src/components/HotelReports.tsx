const React = (window as any).React;
const { useState, useMemo } = React;

const HotelReports = ({ rooms, reservations }) => {
  const [reportPeriod, setReportPeriod] = useState('today');

  const kpis = useMemo(() => {
    const totalRooms = rooms.length;
    const occupied = rooms.filter(r => r.status === 'Occupied').length;
    const occupancyRate = totalRooms === 0 ? 0 : Math.round((occupied / totalRooms) * 100);

    const activeReservations = reservations.filter(r => r.status === 'Checked-In' || r.status === 'Checked-Out');
    const pendingReservations = reservations.filter(r => r.status === 'Pending');

    const today = new Date().toISOString().split('T')[0];
    const arrivals = reservations.filter(r => r.checkInDate === today && r.status === 'Pending');
    const departures = reservations.filter(r => r.checkOutDate === today && r.status === 'Checked-In');

    const totalRevenue = activeReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    const avgRate = activeReservations.length === 0 ? 0 : Math.round(totalRevenue / activeReservations.length);
    const revpar = totalRooms === 0 ? 0 : Math.round(totalRevenue / totalRooms);

    return { totalRooms, occupied, occupancyRate, activeReservations, pendingReservations, totalRevenue, avgRate, revpar, arrivals, departures };
  }, [rooms, reservations]);

  const upcomingArrivals = useMemo(() => {
    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return reservations.filter(r =>
      r.status === 'Pending' &&
      new Date(r.checkInDate) >= today &&
      new Date(r.checkInDate) <= weekFromNow
    ).sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
  }, [reservations]);

  const statusBreakdown = useMemo(() => {
    const counts = {};
    rooms.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [rooms]);

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="hotel-card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Occupancy</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--hotel-primary)' }}>{kpis.occupancyRate}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--hotel-text-muted)', marginTop: '4px' }}>{kpis.occupied} / {kpis.totalRooms} rooms</div>
        </div>
        <div className="hotel-card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>ADR</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--hotel-success)' }}>{kpis.avgRate.toLocaleString()} FRW</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--hotel-text-muted)', marginTop: '4px' }}>Avg Daily Rate</div>
        </div>
        <div className="hotel-card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>RevPAR</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{kpis.revpar.toLocaleString()} FRW</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--hotel-text-muted)', marginTop: '4px' }}>Revenue per Available Room</div>
        </div>
        <div className="hotel-card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Revenue</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#f43f5e' }}>{kpis.totalRevenue.toLocaleString()} FRW</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--hotel-text-muted)', marginTop: '4px' }}>Total Active Revenue</div>
        </div>
      </div>

      {/* Today's Snapshot */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="hotel-card">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--hotel-text-main)' }}>
            <span style={{ color: 'var(--hotel-success)' }}>●</span> Today's Arrivals ({kpis.arrivals.length})
          </h3>
          {kpis.arrivals.length > 0 ? (
            <div>
              {kpis.arrivals.slice(0, 5).map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--hotel-border)', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 500 }}>{r.customerName}</span>
                  <span style={{ color: 'var(--hotel-text-muted)' }}>{r.roomId}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--hotel-text-muted)', fontSize: '0.9rem' }}>No arrivals scheduled for today.</div>
          )}
        </div>
        <div className="hotel-card">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--hotel-text-main)' }}>
            <span style={{ color: 'var(--hotel-danger)' }}>●</span> Today's Departures ({kpis.departures.length})
          </h3>
          {kpis.departures.length > 0 ? (
            <div>
              {kpis.departures.slice(0, 5).map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--hotel-border)', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 500 }}>{r.customerName}</span>
                  <span style={{ color: 'var(--hotel-text-muted)' }}>{r.roomId}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--hotel-text-muted)', fontSize: '0.9rem' }}>No departures scheduled for today.</div>
          )}
        </div>
      </div>

      {/* Room Status Breakdown */}
      <div className="hotel-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--hotel-text-main)' }}>Room Status Breakdown</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {Object.entries(statusBreakdown).map(([status, count]) => {
            const colors = { Clean: '#10b981', Dirty: '#ef4444', Occupied: '#3b82f6', 'Out of Order': '#f59e0b' };
            const pct = kpis.totalRooms > 0 ? Math.round((count / kpis.totalRooms) * 100) : 0;
            return (
              <div key={status} style={{ flex: `${count}`, minWidth: '80px' }}>
                <div style={{
                  height: '32px', background: colors[status] || '#94a3b8', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.8rem', minWidth: `${pct}%`,
                  transition: 'all 0.3s ease'
                }}>{pct}%</div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--hotel-text-muted)', marginTop: '4px' }}>{status} ({count})</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Arrivals */}
      <div className="hotel-card">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--hotel-text-main)' }}>Upcoming Arrivals (Next 7 Days)</h3>
        {upcomingArrivals.length > 0 ? (
          <table className="hotel-table">
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Room</th>
                <th>Status</th>
                <th>Nights</th>
              </tr>
            </thead>
            <tbody>
              {upcomingArrivals.map(r => {
                const nights = Math.round((new Date(r.checkOutDate) - new Date(r.checkInDate)) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.customerName}</td>
                    <td>{new Date(r.checkInDate).toLocaleDateString()}</td>
                    <td>{new Date(r.checkOutDate).toLocaleDateString()}</td>
                    <td>{r.roomId}</td>
                    <td><span className="hotel-badge hotel-badge-warning">{r.status}</span></td>
                    <td>{nights}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--hotel-text-muted)' }}>
            No upcoming arrivals in the next 7 days.
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelReports;

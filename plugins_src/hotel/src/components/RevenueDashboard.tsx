const React = (window as any).React;
const { useState, useMemo } = React;

const RevenueDashboard = ({ rooms, reservations }) => {
  const [period, setPeriod] = useState('7days');

  const analytics = useMemo(() => {
    const totalRooms = rooms.length;
    const occupied = rooms.filter(r => r.status === 'Occupied').length;
    const occupancyRate = totalRooms === 0 ? 0 : Math.round((occupied / totalRooms) * 100);

    const activeRes = reservations.filter(r => r.status === 'Checked-In' || r.status === 'Checked-Out');
    const totalRevenue = activeRes.reduce((sum, r) => sum + (r.totalAmount || (r.ratePlanId ? 15000 : 0)), 0);
    const avgRate = activeRes.length === 0 ? 0 : Math.round(totalRevenue / activeRes.length);
    const revpar = totalRooms === 0 ? 0 : Math.round(totalRevenue / totalRooms);

    const roomTypeRevenue = {};
    rooms.forEach(r => {
      const type = r.type || 'Standard';
      if (!roomTypeRevenue[type]) roomTypeRevenue[type] = { rooms: 0, occupied: 0, revenue: 0 };
      roomTypeRevenue[type].rooms++;
      if (r.status === 'Occupied') {
        roomTypeRevenue[type].occupied++;
        roomTypeRevenue[type].revenue += r.pricePerNight || 15000;
      }
    });

    return { totalRevenue, avgRate, revpar, occupancyRate, totalRooms, occupied, roomTypeRevenue };
  }, [rooms, reservations]);

  const daysData = useMemo(() => {
    const data = [];
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRes = reservations.filter(r =>
        r.checkInDate === dateStr || r.checkOutDate === dateStr);
      data.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        arrivals: reservations.filter(r => r.checkInDate === dateStr).length,
        departures: reservations.filter(r => r.checkOutDate === dateStr).length,
        revenue: dayRes.length * 15000,
      });
    }
    return data;
  }, [reservations, period]);

  const maxRevenue = Math.max(...daysData.map(d => d.revenue), 1);

  return (
    <div>
      {/* Period Selector */}
      <div className="hotel-tabs" style={{ marginBottom: '24px' }}>
        {[
          { key: '7days', label: '7 Days' },
          { key: '30days', label: '30 Days' },
          { key: '90days', label: '90 Days' },
        ].map(p => (
          <div key={p.key} className={`hotel-tab ${period === p.key ? 'active' : ''}`} onClick={() => setPeriod(p.key)}>{p.label}</div>
        ))}
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="hotel-card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--hotel-primary)', marginTop: '6px' }}>{analytics.totalRevenue.toLocaleString()} FRW</div>
        </div>
        <div className="hotel-card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Occupancy</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--hotel-success)', marginTop: '6px' }}>{analytics.occupancyRate}%</div>
        </div>
        <div className="hotel-card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ADR</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f43f5e', marginTop: '6px' }}>{analytics.avgRate.toLocaleString()}</div>
        </div>
        <div className="hotel-card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RevPAR</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#8b5cf6', marginTop: '6px' }}>{analytics.revpar.toLocaleString()}</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="hotel-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--hotel-text-main)' }}>Revenue Trend</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '160px', padding: '0 4px' }}>
          {daysData.map(d => {
            const height = d.revenue > 0 ? Math.max((d.revenue / maxRevenue) * 140, 4) : 4;
            return (
              <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '100%', height: `${height}px`,
                  background: `linear-gradient(to top, var(--hotel-primary), var(--hotel-accent))`,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease', opacity: d.revenue > 0 ? 0.8 : 0.2,
                  minHeight: '4px'
                }} title={`${d.label}: ${d.revenue.toLocaleString()} FRW`}></div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.65rem', color: 'var(--hotel-text-muted)' }}>
          {daysData.filter((_, i) => i % Math.max(1, Math.floor(daysData.length / 7)) === 0).map(d => (
            <span key={d.date}>{d.label}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Room Type Breakdown */}
        <div className="hotel-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--hotel-text-main)' }}>Revenue by Room Type</h3>
          {Object.entries(analytics.roomTypeRevenue).map(([type, data]) => {
            const pct = analytics.totalRevenue > 0 ? Math.round((data.revenue / analytics.totalRevenue) * 100) : 0;
            return (
              <div key={type} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 500 }}>{type}</span>
                  <span style={{ color: 'var(--hotel-text-muted)' }}>{data.revenue.toLocaleString()} FRW ({pct}%)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, var(--hotel-primary), var(--hotel-accent))`, borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)', marginTop: '2px' }}>
                  {data.occupied}/{data.rooms} rooms occupied
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Metrics */}
        <div className="hotel-card">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--hotel-text-main)' }}>Daily Activity (Last {period === '7days' ? 7 : period === '30days' ? 30 : 90} Days)</h3>
          <table className="hotel-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Arrivals</th>
                <th>Departures</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {daysData.slice(-14).map(d => (
                <tr key={d.date}>
                  <td style={{ fontSize: '0.8rem' }}>{d.label}</td>
                  <td>
                    <span className={`hotel-badge ${d.arrivals > 0 ? 'hotel-badge-clean' : ''}`}
                      style={d.arrivals === 0 ? { background: 'transparent', color: 'var(--hotel-text-muted)' } : {}}>
                      {d.arrivals}
                    </span>
                  </td>
                  <td>
                    <span className={`hotel-badge ${d.departures > 0 ? 'hotel-badge-occupied' : ''}`}
                      style={d.departures === 0 ? { background: 'transparent', color: 'var(--hotel-text-muted)' } : {}}>
                      {d.departures}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{(d.revenue || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;

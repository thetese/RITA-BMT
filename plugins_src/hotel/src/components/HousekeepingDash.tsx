const React = (window as any).React;
const { useState, useMemo } = React;

const HousekeepingDash = ({ rooms, updateStatus, tasks }) => {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Clean', 'Dirty', 'Occupied', 'Out of Order'];

  const filteredRooms = filter === 'All' ? rooms : rooms.filter(r => r.status === filter);

  const stats = useMemo(() => ({
    total: rooms.length,
    clean: rooms.filter(r => r.status === 'Clean').length,
    dirty: rooms.filter(r => r.status === 'Dirty').length,
    occupied: rooms.filter(r => r.status === 'Occupied').length,
    ooo: rooms.filter(r => r.status === 'Out of Order').length,
  }), [rooms]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Clean': return 'var(--hotel-success)';
      case 'Dirty': return 'var(--hotel-danger)';
      case 'Occupied': return 'var(--hotel-primary)';
      case 'Out of Order': return 'var(--hotel-warning)';
      default: return 'var(--hotel-text-muted)';
    }
  };

  return (
    <div>
      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: stats.total, color: 'var(--hotel-text-main)' },
          { label: 'Clean', value: stats.clean, color: 'var(--hotel-success)' },
          { label: 'Dirty', value: stats.dirty, color: 'var(--hotel-danger)' },
          { label: 'Occupied', value: stats.occupied, color: 'var(--hotel-primary)' },
          { label: 'Out of Order', value: stats.ooo, color: 'var(--hotel-warning)' },
        ].map(s => (
          <div key={s.label} className="hotel-card" style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--hotel-text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="hotel-tabs" style={{ marginBottom: '20px' }}>
        {filters.map(f => (
          <div key={f} className={`hotel-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</div>
        ))}
      </div>

      {/* Room grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {filteredRooms.map(r => (
          <div key={r.id} className="hotel-card"
            style={{ borderLeft: `4px solid ${r.status === 'Clean' ? '#10b981' : r.status === 'Dirty' ? '#ef4444' : r.status === 'Occupied' ? '#3b82f6' : '#f59e0b'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--hotel-text-main)' }}>Room {r.roomNumber}</h3>
              <span className={`hotel-badge hotel-badge-${r.status.toLowerCase().replace(/ /g, '-')}`}>{r.status}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--hotel-text-muted)', marginBottom: '16px' }}>
              {r.type} · {r.capacity || 2} guests
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => updateStatus(r.id, 'Clean')}
                disabled={r.status === 'Clean'}
                className="hotel-btn"
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: r.status === 'Clean' ? 'var(--hotel-success)' : 'transparent', color: r.status === 'Clean' ? '#fff' : 'var(--hotel-success)', border: '1px solid var(--hotel-success)', borderRadius: '8px', cursor: r.status === 'Clean' ? 'default' : 'pointer', opacity: r.status === 'Clean' ? 1 : 0.8 }}>
                Clean
              </button>
              <button onClick={() => updateStatus(r.id, 'Dirty')}
                disabled={r.status === 'Dirty'}
                className="hotel-btn"
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: r.status === 'Dirty' ? 'var(--hotel-danger)' : 'transparent', color: r.status === 'Dirty' ? '#fff' : 'var(--hotel-danger)', border: '1px solid var(--hotel-danger)', borderRadius: '8px', cursor: r.status === 'Dirty' ? 'default' : 'pointer', opacity: r.status === 'Dirty' ? 1 : 0.8 }}>
                Dirty
              </button>
              <button onClick={() => updateStatus(r.id, 'Occupied')}
                disabled={r.status === 'Occupied'}
                className="hotel-btn"
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: r.status === 'Occupied' ? 'var(--hotel-primary)' : 'transparent', color: r.status === 'Occupied' ? '#fff' : 'var(--hotel-primary)', border: '1px solid var(--hotel-primary)', borderRadius: '8px', cursor: r.status === 'Occupied' ? 'default' : 'pointer', opacity: r.status === 'Occupied' ? 1 : 0.8 }}>
                Occupy
              </button>
            </div>
            <button onClick={() => updateStatus(r.id, 'Out of Order')}
              disabled={r.status === 'Out of Order'}
              className="hotel-btn"
              style={{ width: '100%', marginTop: '8px', padding: '8px', fontSize: '0.8rem', background: r.status === 'Out of Order' ? 'var(--hotel-warning)' : 'transparent', color: r.status === 'Out of Order' ? '#fff' : 'var(--hotel-warning)', border: '1px solid var(--hotel-warning)', borderRadius: '8px', cursor: r.status === 'Out of Order' ? 'default' : 'pointer', opacity: r.status === 'Out of Order' ? 1 : 0.8 }}>
                Maintenance
            </button>
          </div>
        ))}
        {filteredRooms.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--hotel-text-muted)' }}>
            No rooms match the current filter.
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="hotel-card" style={{ marginTop: '32px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--hotel-text-main)' }}>Recent Housekeeping Activity</h3>
        {tasks && tasks.length > 0 ? (
          <table className="hotel-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Action</th>
                <th>Staff</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 20).map(t => (
                <tr key={t.id || Math.random()}>
                  <td style={{ fontWeight: 600 }}>{t.roomNumber || t.roomId}</td>
                  <td><span className={`hotel-badge hotel-badge-${(t.status || '').toLowerCase().replace(/ /g, '-')}`}>{t.status}</span></td>
                  <td style={{ color: 'var(--hotel-text-muted)' }}>{t.assignedTo || '—'}</td>
                  <td style={{ color: 'var(--hotel-text-muted)' }}>{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--hotel-text-muted)' }}>
            No housekeeping activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default HousekeepingDash;

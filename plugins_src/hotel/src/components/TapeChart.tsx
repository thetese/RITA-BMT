const React = (window as any).React;
const { useState, useMemo } = React;

const TapeChart = ({ rooms, reservations, onNewReservation, onSelectReservation }) => {
  const [viewMode, setViewMode] = useState('14days');
  const daysToShow = viewMode === '7days' ? 7 : viewMode === '14days' ? 14 : 31;

  const dates = useMemo(() => {
    const arr = [];
    for (let i = 0; i < daysToShow; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      arr.push(d.toISOString().split('T')[0]);
    }
    return arr;
  }, [daysToShow]);

  const colWidth = viewMode === '31days' ? 60 : 120;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Checked-In': return '#10b981';
      case 'Pending': return '#f59e0b';
      case 'Checked-Out': return '#6b7280';
      case 'No-Show': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="hotel-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '20px 20px 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--hotel-text-main)' }}>Reservation Tape Chart</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['7days', '14days', '31days'].map(m => (
            <button key={m} className={`hotel-tab ${viewMode === m ? 'active' : ''}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setViewMode(m)}>
              {m === '7days' ? '7 Days' : m === '14days' ? '14 Days' : '31 Days'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto', padding: '0 0 12px 0' }}>
        <div style={{ display: 'flex', minWidth: `${150 + dates.length * colWidth}px`, position: 'relative' }}>
          <div style={{ width: '150px', flexShrink: 0, borderRight: '2px solid var(--hotel-border)', background: 'rgba(0,0,0,0.02)', zIndex: 10 }}>
            <div style={{ height: '48px', borderBottom: '1px solid var(--hotel-border)', fontWeight: 'bold', display: 'flex', alignItems: 'center', paddingLeft: '16px', color: 'var(--hotel-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rooms</div>
            {rooms.map(r => (
              <div key={r.id} style={{ height: '60px', borderBottom: '1px solid var(--hotel-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px', background: r.status === 'Out of Order' ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
                <span style={{ fontWeight: '600', color: 'var(--hotel-text-main)' }}>{r.roomNumber}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)' }}>{r.type} · {r.capacity || 2} pax</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', position: 'relative' }}>
            {dates.map(d => {
              const dateObj = new Date(d + 'T00:00:00');
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const isToday = new Date().toISOString().split('T')[0] === d;
              return (
                <div key={d} style={{ width: `${colWidth}px`, flexShrink: 0, borderRight: '1px solid var(--hotel-border)', background: isToday ? 'rgba(14,165,233,0.03)' : 'transparent' }}>
                  <div style={{ height: '48px', borderBottom: '1px solid var(--hotel-border)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 4px', color: isToday ? 'var(--hotel-primary)' : 'var(--hotel-text-muted)' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: isToday ? '700' : '400' }}>{dayName}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: isToday ? '700' : '400' }}>{d.slice(5)}</span>
                  </div>
                  {rooms.map(r => (
                    <div key={r.id + d} style={{ height: '60px', borderBottom: '1px solid var(--hotel-border)', cursor: 'pointer', transition: 'background 0.15s' }}
                         onClick={() => onNewReservation && onNewReservation(r.id, d)}
                         className="tape-cell"
                         onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.06)'}
                         onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                    </div>
                  ))}
                </div>
              );
            })}
            {reservations.map(res => {
              const startDateIndex = dates.indexOf(res.checkInDate);
              const endDateIndex = dates.indexOf(res.checkOutDate);
              if (startDateIndex === -1 && endDateIndex === -1 && res.checkOutDate < dates[0]) return null;
              if (startDateIndex === -1 && endDateIndex === -1 && res.checkInDate > dates[dates.length-1]) return null;
              const roomIndex = rooms.findIndex(r => r.id === res.roomId);
              if (roomIndex === -1) return null;
              const sIdx = startDateIndex === -1 ? 0 : startDateIndex;
              const eIdx = endDateIndex === -1 ? dates.length : endDateIndex;
              const span = eIdx - sIdx || 1;
              const left = sIdx * colWidth;
              const top = 48 + (roomIndex * 60) + 6;
              const width = span * colWidth - 6;
              const bg = getStatusColor(res.status);

              return (
                <div key={res.id} style={{
                  position: 'absolute', left: `${left + 3}px`, top: `${top}px`, width: `${Math.max(width, 24)}px`, height: '48px',
                  background: `linear-gradient(135deg, ${bg}, ${bg}dd)`, color: '#fff', borderRadius: '8px', padding: '6px 10px', fontSize: '0.8rem',
                  cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', zIndex: 5,
                  boxShadow: `0 2px 8px ${bg}44`, transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = `0 4px 14px ${bg}66`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 2px 8px ${bg}44`; }}
                onClick={() => onSelectReservation && onSelectReservation(res)}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: '1.3' }}>{res.customerName}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.85, marginTop: '2px' }}>
                    {res.checkInDate} {res.status !== 'Pending' ? `· ${res.status}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TapeChart;

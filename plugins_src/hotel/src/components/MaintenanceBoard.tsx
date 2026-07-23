const React = (window as any).React;
const { useState, useEffect } = React;

const MaintenanceBoard = ({ api, rooms }) => {
  const [workOrders, setWorkOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ roomId: '', issue: '', priority: 'Medium', description: '', assignedTo: '' });

  const loadWorkOrders = async () => {
    try {
      const orders = await api.hotelGetWorkOrders();
      setWorkOrders(orders || []);
    } catch (e) {
      console.error('Failed to load work orders', e);
    }
  };

  useEffect(() => { loadWorkOrders(); }, []);

  const filteredOrders = filter === 'All' ? workOrders : workOrders.filter(o => o.status === filter);

  const handleCreate = async () => {
    if (!form.issue || !form.roomId) return;
    try {
      await api.hotelAddWorkOrder(form);
      setShowForm(false);
      setForm({ roomId: '', issue: '', priority: 'Medium', description: '', assignedTo: '' });
      loadWorkOrders();
    } catch (e) {
      console.error('Failed to create work order', e);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.hotelUpdateWorkOrder(id, { status });
      loadWorkOrders();
    } catch (e) {
      console.error('Failed to update work order', e);
    }
  };

  const priorityColors = { Low: 'var(--hotel-success)', Medium: 'var(--hotel-warning)', High: 'var(--hotel-danger)', Critical: '#dc2626' };
  const statusColors = { Open: 'hotel-badge-warning', 'In Progress': 'hotel-badge-occupied', Completed: 'hotel-badge-clean', Cancelled: 'hotel-badge-dirty' };

  return (
    <div>
      <div className="hotel-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0 }}>Maintenance & Work Orders</h2>
            <p className="hotel-text-muted" style={{ margin: '5px 0 0 0' }}>Track and manage room maintenance requests</p>
          </div>
          <button className="hotel-btn hotel-btn-primary" onClick={() => setShowForm(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            New Work Order
          </button>
        </div>
      </div>

      {/* Filter + Stats */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="hotel-tabs">
          {['All', 'Open', 'In Progress', 'Completed'].map(f => (
            <div key={f} className={`hotel-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f}
              {f !== 'All' && <span style={{ marginLeft: '6px', fontSize: '0.75rem', opacity: 0.7 }}>({workOrders.filter(o => o.status === f).length})</span>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--hotel-text-muted)' }}>
          <span>Total: <strong>{workOrders.length}</strong></span>
          <span>Open: <strong style={{ color: 'var(--hotel-warning)' }}>{workOrders.filter(o => o.status === 'Open').length}</strong></span>
          <span>Completed: <strong style={{ color: 'var(--hotel-success)' }}>{workOrders.filter(o => o.status === 'Completed').length}</strong></span>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredOrders.map(o => (
            <div key={o.id} className="hotel-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: priorityColors[o.priority] || 'var(--hotel-text-muted)' }}></div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{o.issue}</span>
                  <span className={`hotel-badge ${statusColors[o.status] || 'hotel-badge-warning'}`}>{o.status || 'Open'}</span>
                  {o.priority && <span style={{ fontSize: '0.75rem', color: 'var(--hotel-text-muted)' }}>{o.priority} Priority</span>}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--hotel-text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>Room: <strong>{o.roomNumber || o.roomId}</strong></span>
                  {o.assignedTo && <span>Assigned to: <strong>{o.assignedTo}</strong></span>}
                  {o.createdAt && <span>Opened: {new Date(o.createdAt).toLocaleDateString()}</span>}
                </div>
                {o.description && <div style={{ fontSize: '0.85rem', color: 'var(--hotel-text-muted)', marginTop: '6px' }}>{o.description}</div>}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {o.status === 'Open' && (
                  <button className="hotel-btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--hotel-primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    onClick={() => handleUpdateStatus(o.id, 'In Progress')}>Start Work</button>
                )}
                {o.status === 'In Progress' && (
                  <button className="hotel-btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--hotel-success)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    onClick={() => handleUpdateStatus(o.id, 'Completed')}>Mark Done</button>
                )}
                {o.status !== 'Completed' && o.status !== 'Cancelled' && (
                  <button className="hotel-btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'transparent', color: 'var(--hotel-text-muted)', border: '1px solid var(--hotel-border)', borderRadius: '8px', cursor: 'pointer' }}
                    onClick={() => handleUpdateStatus(o.id, 'Cancelled')}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--hotel-text-muted)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: '16px' }}>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No Work Orders</div>
          <div style={{ fontSize: '0.9rem' }}>Create your first maintenance work order to start tracking.</div>
        </div>
      )}

      {showForm && (
        <>
          <div className="hotel-modal-overlay" onClick={() => setShowForm(false)}></div>
          <div className="hotel-modal">
            <h2 style={{ marginTop: 0 }}>New Work Order</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Room *</label>
                <select className="hotel-input" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })}>
                  <option value="">Select room</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Room {r.roomNumber} - {r.type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Issue Title *</label>
                <input className="hotel-input" value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} placeholder="e.g. Broken AC, Leaky faucet" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Priority</label>
                <select className="hotel-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Description</label>
                <textarea className="hotel-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed description of the issue..."
                  style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Assign To</label>
                <input className="hotel-input" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} placeholder="Staff name" />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button className="hotel-btn hotel-btn-primary" style={{ flex: 1 }} onClick={handleCreate}>Create Work Order</button>
                <button className="hotel-btn hotel-btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MaintenanceBoard;

const React = (window as any).React;
const { useState, useEffect } = React;

const RateManagement = ({ api, selectedPropertyId, reload }) => {
  const [ratePlans, setRatePlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState({ name: '', roomType: 'All', basePrice: 15000, currency: 'FRW', weekendPremium: 20, isActive: true });

  const loadRatePlans = async () => {
    try {
      const plans = await api.hotelGetRatePlans(selectedPropertyId);
      setRatePlans(plans || []);
    } catch (e) {
      console.error('Failed to load rate plans', e);
    }
  };

  useEffect(() => { loadRatePlans(); }, [selectedPropertyId]);

  const handleSave = async () => {
    if (!form.name || !form.basePrice) return;
    try {
      if (editPlan) {
        await api.hotelUpdateRatePlan(editPlan.id, form);
      } else {
        await api.hotelAddRatePlan({ ...form, propertyId: selectedPropertyId });
      }
      setShowForm(false);
      setEditPlan(null);
      setForm({ name: '', roomType: 'All', basePrice: 15000, currency: 'FRW', weekendPremium: 20, isActive: true });
      loadRatePlans();
    } catch (e) {
      console.error('Failed to save rate plan', e);
    }
  };

  const handleEdit = (plan) => {
    setEditPlan(plan);
    setForm({ name: plan.name, roomType: plan.roomType || 'All', basePrice: plan.basePrice, currency: plan.currency || 'FRW', weekendPremium: plan.weekendPremium || 0, isActive: plan.isActive !== false });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this rate plan?')) return;
    try {
      await api.hotelDeleteRatePlan(id);
      loadRatePlans();
    } catch (e) {
      console.error('Failed to delete rate plan', e);
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      await api.hotelUpdateRatePlan(plan.id, { ...plan, isActive: !plan.isActive });
      loadRatePlans();
    } catch (e) {
      console.error('Failed to toggle rate plan', e);
    }
  };

  return (
    <div className="hotel-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Rate Plans & Pricing</h2>
          <p className="hotel-text-muted" style={{ margin: '5px 0 0 0' }}>Manage room rates, seasonal pricing, and promotions</p>
        </div>
        <button className="hotel-btn hotel-btn-primary" onClick={() => { setEditPlan(null); setForm({ name: '', roomType: 'All', basePrice: 15000, currency: 'FRW', weekendPremium: 20, isActive: true }); setShowForm(true); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          New Rate Plan
        </button>
      </div>

      {ratePlans.length > 0 ? (
        <table className="hotel-table">
          <thead>
            <tr>
              <th>Plan Name</th>
              <th>Applies To</th>
              <th>Base Price</th>
              <th>Weekend Premium</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ratePlans.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.roomType || 'All Rooms'}</td>
                <td>{(p.basePrice || 0).toLocaleString()} {p.currency || 'FRW'}</td>
                <td>{p.weekendPremium || 0}%</td>
                <td>
                  <span className={`hotel-badge ${p.isActive !== false ? 'hotel-badge-clean' : 'hotel-badge-dirty'}`}>
                    {p.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="hotel-btn" style={{ padding: '4px 12px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--hotel-border)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => handleEdit(p)}>Edit</button>
                    <button className="hotel-btn" style={{ padding: '4px 12px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--hotel-border)', borderRadius: '8px', cursor: 'pointer' }} onClick={() => handleToggleActive(p)}>
                      {p.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="hotel-btn" style={{ padding: '4px 12px', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--hotel-danger)', borderRadius: '8px', cursor: 'pointer', color: 'var(--hotel-danger)' }} onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--hotel-text-muted)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4, marginBottom: '16px' }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No Rate Plans Defined</div>
          <div style={{ fontSize: '0.9rem' }}>Create your first rate plan to start managing room pricing.</div>
        </div>
      )}

      {showForm && (
        <>
          <div className="hotel-modal-overlay" onClick={() => setShowForm(false)}></div>
          <div className="hotel-modal">
            <h2 style={{ marginTop: 0 }}>{editPlan ? 'Edit Rate Plan' : 'New Rate Plan'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Plan Name</label>
                <input className="hotel-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Standard Rate, Weekend Special" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Room Type</label>
                <select className="hotel-input" value={form.roomType} onChange={e => setForm({ ...form, roomType: e.target.value })}>
                  <option value="All">All Rooms</option>
                  <option value="Standard">Standard</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                  <option value="Presidential">Presidential</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Base Price / Night</label>
                  <input type="number" className="hotel-input" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Weekend Premium (%)</label>
                  <input type="number" className="hotel-input" value={form.weekendPremium} onChange={e => setForm({ ...form, weekendPremium: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button className="hotel-btn hotel-btn-primary" style={{ flex: 1 }} onClick={handleSave}>{editPlan ? 'Update Plan' : 'Create Plan'}</button>
                <button className="hotel-btn hotel-btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RateManagement;

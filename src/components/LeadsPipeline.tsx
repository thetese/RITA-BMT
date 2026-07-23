import React, { useState, useEffect } from 'react';
import { Target, Plus, Phone, Mail, Building, DollarSign, Activity, MessageSquare, Check, UserPlus } from 'lucide-react';
import { useToast } from './ui/Toast';

const PIPELINE_STAGES = [
  { id: 'NEW', label: 'New Lead', color: 'var(--border-color)' },
  { id: 'CONTACTED', label: 'Contacted', color: 'rgba(59, 130, 246, 0.2)' },
  { id: 'QUALIFIED', label: 'Qualified', color: 'rgba(245, 158, 11, 0.2)' },
  { id: 'PROPOSAL', label: 'Proposal Sent', color: 'rgba(139, 92, 246, 0.2)' },
  { id: 'WON', label: 'Won', color: 'rgba(16, 185, 129, 0.2)' },
  { id: 'LOST', label: 'Lost', color: 'rgba(239, 68, 68, 0.2)' }
];

export default function LeadsPipeline({ currentUser }: { currentUser?: any }) {
  const { showToast } = useToast();
  const api = (window as any).api;

  const [leads, setLeads] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', company: '', email: '', phone: '', expectedValue: 0, probability: 10, status: 'NEW' });

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('activity');
  const [newActivity, setNewActivity] = useState({ type: 'NOTE', description: '' });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    if (!api) return;
    try {
      const data = await api.getLeads();
      setLeads(data);
    } catch (e: any) {
      showToast('Error loading leads: ' + e.message, 'error');
    }
  };

  const loadActivities = async (leadId: string) => {
    if (!api) return;
    try {
      const acts = await api.getCrmActivities(leadId);
      setActivities(acts);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    try {
      await api.addLead(newLead);
      showToast('Lead added successfully', 'success');
      setIsAdding(false);
      setNewLead({ name: '', company: '', email: '', phone: '', expectedValue: 0, probability: 10, status: 'NEW' });
      loadLeads();
    } catch (e: any) {
      showToast('Failed to add lead: ' + e.message, 'error');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!api) return;
    try {
      await api.updateLeadStatus(id, status);
      loadLeads();
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, status });
        // Log automatic status change activity
        await api.addCrmActivity({
          leadId: id,
          type: 'SYSTEM',
          description: `Stage changed to ${status}`
        }, currentUser?.id);
        loadActivities(id);
      }
    } catch (e: any) {
      showToast('Failed to update status: ' + e.message, 'error');
    }
  };

  const openLead = (lead: any) => {
    setSelectedLead(lead);
    setActiveTab('activity');
    loadActivities(lead.id);
  };

  const closeLead = () => {
    setSelectedLead(null);
    setActivities([]);
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !selectedLead) return;
    if (!newActivity.description.trim()) return;

    try {
      await api.addCrmActivity({
        leadId: selectedLead.id,
        ...newActivity
      }, currentUser?.id);
      setNewActivity({ type: 'NOTE', description: '' });
      loadActivities(selectedLead.id);
    } catch (e: any) {
      showToast('Failed to log activity: ' + e.message, 'error');
    }
  };

  const convertToCustomer = async () => {
    if (!api || !selectedLead) return;
    try {
      await api.convertLeadToCustomer(selectedLead.id, currentUser?.id);
      showToast('Converted to Customer successfully!', 'success');
      loadLeads();
      closeLead();
    } catch (e: any) {
      showToast('Conversion failed: ' + e.message, 'error');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL': return <Phone size={14} />;
      case 'EMAIL': return <Mail size={14} />;
      case 'MEETING': return <UserPlus size={14} />;
      case 'SYSTEM': return <Activity size={14} />;
      default: return <MessageSquare size={14} />;
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="ui-page-header" style={{ flexShrink: 0 }}>
        <div>
          <h1>Sales Pipeline</h1>
          <p>Track leads and log interactions across the sales cycle.</p>
        </div>
        <button className="ui-btn ui-btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        overflowX: 'auto', 
        flex: 1, 
        paddingBottom: '16px' 
      }}>
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.status === stage.id);
          const stageTotal = stageLeads.reduce((sum, l) => sum + (l.expectedValue || 0), 0);
          
          return (
            <div key={stage.id} style={{
              flex: '0 0 300px',
              background: 'var(--hover-bg)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '100%'
            }}>
              {/* Stage Header */}
              <div style={{ 
                padding: '16px', 
                borderBottom: `3px solid ${stage.color === 'var(--border-color)' ? '#ccc' : stage.color.replace('0.2', '1')}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stage.label} ({stageLeads.length})
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ${stageTotal.toLocaleString()}
                </span>
              </div>
              
              {/* Cards Container */}
              <div style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stageLeads.map(lead => (
                  <div key={lead.id} onClick={() => openLead(lead)} className="ui-panel ui-panel-compact" style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: `3px solid ${stage.color.replace('0.2', '1')}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '1.05rem' }}>{lead.name}</div>
                      <span className="ui-badge ui-badge-neutral">{lead.probability}%</span>
                    </div>
                    
                    {lead.company && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Building size={12} /> {lead.company}
                      </div>
                    )}
                    
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
                      {lead.email && <div><Mail size={10} /> {lead.email}</div>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>
                        <DollarSign size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} />
                        {(lead.expectedValue || 0).toLocaleString()}
                      </span>
                      
                      <select 
                        className="input" 
                        style={{ padding: '2px 6px', fontSize: '0.75rem', height: 'auto', width: 'auto' }}
                        value={lead.status}
                        onClick={e => e.stopPropagation()}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                      >
                        {PIPELINE_STAGES.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                
                {stageLeads.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Lead Modal */}
      {selectedLead && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg" style={{ height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
            
            {/* Modal Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0' }}>{selectedLead.name}</h2>
                {selectedLead.company && <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={14} /> {selectedLead.company}</div>}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {selectedLead.status === 'WON' && (
                  <button className="ui-btn ui-btn-success" onClick={convertToCustomer}>
                    <Check size={16} /> Convert to Customer
                  </button>
                )}
                <button className="close-btn" onClick={closeLead}>&times;</button>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="dashboard-tabs" style={{ margin: '0 24px', transform: 'translateY(-50%)', width: 'max-content' }}>
              <button className={`dashboard-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity Feed</button>
              <button className={`dashboard-tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Lead Details</button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
              
              {activeTab === 'details' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="ui-panel">
                    <h3 style={{ marginTop: 0 }}>Contact Info</h3>
                    <p><strong>Email:</strong> {selectedLead.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedLead.phone || 'N/A'}</p>
                  </div>
                  <div className="ui-panel">
                    <h3 style={{ marginTop: 0 }}>Deal Info</h3>
                    <p><strong>Status:</strong> {PIPELINE_STAGES.find(s => s.id === selectedLead.status)?.label}</p>
                    <p><strong>Expected Value:</strong> ${selectedLead.expectedValue?.toLocaleString()}</p>
                    <p><strong>Probability:</strong> {selectedLead.probability}%</p>
                  </div>
                  {selectedLead.notes && (
                    <div className="ui-panel" style={{ gridColumn: '1 / -1' }}>
                      <h3 style={{ marginTop: 0 }}>Notes</h3>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{selectedLead.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="ui-panel" style={{ marginBottom: '16px' }}>
                    <form onSubmit={handleAddActivity} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <select className="input" value={newActivity.type} onChange={e => setNewActivity({...newActivity, type: e.target.value})} style={{ width: '150px' }}>
                        <option value="NOTE">📝 Note</option>
                        <option value="CALL">📞 Call</option>
                        <option value="EMAIL">✉️ Email</option>
                        <option value="MEETING">🤝 Meeting</option>
                      </select>
                      <input 
                        type="text" 
                        className="input" 
                        placeholder="Log an activity..." 
                        value={newActivity.description} 
                        onChange={e => setNewActivity({...newActivity, description: e.target.value})} 
                        style={{ flex: 1 }}
                      />
                      <button type="submit" className="ui-btn ui-btn-primary">Post</button>
                    </form>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {activities.map(act => (
                      <div key={act.id} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', 
                          background: act.type === 'SYSTEM' ? 'var(--hover-bg)' : 'rgba(79, 70, 229, 0.1)', 
                          color: act.type === 'SYSTEM' ? 'var(--text-secondary)' : 'var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {getActivityIcon(act.type)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.95rem' }}>{act.type}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {new Date(act.date).toLocaleString()}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: act.type === 'SYSTEM' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                            {act.description}
                          </p>
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                        No activities logged yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>New Lead</h2>
              <button className="close-btn" onClick={() => setIsAdding(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddLead}>
              <div className="form-group">
                <label>Contact Name</label>
                <input type="text" className="input" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input type="text" className="input" value={newLead.company} onChange={e => setNewLead({...newLead, company: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="input" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" className="input" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Expected Value ($)</label>
                  <input type="number" className="input" value={newLead.expectedValue} onChange={e => setNewLead({...newLead, expectedValue: parseFloat(e.target.value)})} min="0" />
                </div>
                <div className="form-group">
                  <label>Win Probability (%)</label>
                  <input type="number" className="input" value={newLead.probability} onChange={e => setNewLead({...newLead, probability: parseInt(e.target.value)})} min="0" max="100" />
                </div>
              </div>
              <div className="form-group">
                <label>Initial Status</label>
                <select className="input" value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value})}>
                  {PIPELINE_STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="ui-btn ui-btn-primary">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

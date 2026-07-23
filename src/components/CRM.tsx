import React, { useState, useEffect } from 'react';
import { Target, Plus, Phone, Mail, DollarSign, GripVertical, Trash2 } from 'lucide-react';
import { useToast } from './ui/Toast';

const STAGES = ['New', 'Contacted', 'Quoted', 'Won', 'Lost'];

export default function CRM() {
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    customerName: '',
    contactInfo: '',
    projectDescription: '',
    estimatedValue: 0,
    stage: 'New',
    notes: ''
  });

  const loadData = async () => {
    if (!window.api) return;
    const lds = await window.api.getLeads();
    setLeads(lds || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (lead = null) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        customerName: lead.customerName,
        contactInfo: lead.contactInfo,
        projectDescription: lead.projectDescription,
        estimatedValue: lead.estimatedValue,
        stage: lead.stage,
        notes: lead.notes
      });
    } else {
      setEditingLead(null);
      setFormData({
        customerName: '',
        contactInfo: '',
        projectDescription: '',
        estimatedValue: 0,
        stage: 'New',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const saveLead = async (e) => {
    e.preventDefault();
    if (editingLead) {
      await window.api.updateLead({ ...formData, id: editingLead.id });
      showToast("Lead updated successfully", "success");
    } else {
      await window.api.addLead(formData);
      showToast("New lead added!", "success");
    }
    setIsModalOpen(false);
    loadData();
  };

  const deleteLead = async (id) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      await window.api.deleteLead(id);
      showToast("Lead deleted", "success");
      loadData();
    }
  };

  const onDragStart = (e, id) => {
    e.dataTransfer.setData('leadId', id);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = async (e, targetStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    const lead = leads.find(l => l.id === leadId);
    if (lead && lead.stage !== targetStage) {
      // Optimistic update
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: targetStage } : l));
      await window.api.updateLead({ ...lead, stage: targetStage });
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(val);

  return (
    <div className="card" style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={24} className="text-primary" /> Sales Pipeline & CRM
        </h2>
        <button className="btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={18} /> Add Lead
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', flex: 1, overflowX: 'auto', paddingBottom: '10px' }}>
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage);
          const totalValue = stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

          return (
            <div 
              key={stage} 
              style={{ flex: '1 0 250px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column' }}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, stage)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '0 5px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{stage}</h3>
                <span className="badge" style={{ background: 'var(--primary)', color: '#fff' }}>{stageLeads.length}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px', padding: '0 5px' }}>
                Est: {formatCurrency(totalValue)}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stageLeads.map(lead => (
                  <div 
                    key={lead.id} 
                    draggable 
                    onDragStart={(e) => onDragStart(e, lead.id)}
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', cursor: 'grab', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                    onClick={() => openModal(lead)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>{lead.customerName}</strong>
                      <GripVertical size={14} style={{ color: 'var(--text-secondary)', cursor: 'grab' }} />
                    </div>
                    {lead.contactInfo && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <Phone size={12} /> {lead.contactInfo}
                      </div>
                    )}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {lead.projectDescription || 'No description'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--success)' }}>
                        {formatCurrency(lead.estimatedValue)}
                      </span>
                      <button 
                        className="btn-sm btn-danger" 
                        style={{ padding: '2px 6px' }} 
                        onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingLead ? 'Edit Lead' : 'New Lead'}</h2>
            <form onSubmit={saveLead}>
              <div className="form-group">
                <label>Client Name / Company</label>
                <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Contact Info (Phone/Email)</label>
                <input type="text" value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Project / Request Description</label>
                <textarea rows="3" value={formData.projectDescription} onChange={e => setFormData({...formData, projectDescription: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Estimated Value (RWF)</label>
                  <input type="number" min="0" value={formData.estimatedValue} onChange={e => setFormData({...formData, estimatedValue: Number(e.target.value)})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Stage</label>
                  <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Internal Notes</label>
                <textarea rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

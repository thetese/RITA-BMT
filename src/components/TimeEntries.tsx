import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2, CheckCircle, Timer } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function TimeEntries({ currentUser }) {
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    projectId: '',
    userId: currentUser?.id || '',
    description: '',
    hours: 0,
    billable: 1,
    status: 'Unbilled',
    date: ''
  });

  const loadData = async () => {
    if (!window.api) return;
    const projs = await window.api.getProjects();
    let logs = await window.api.getTimeEntries();
    
    // Non-admins see only their logs
    if (currentUser?.role !== 'admin') {
      logs = logs.filter(l => l.userId === currentUser?.id);
    }
    
    setProjects(projs || []);
    setEntries(logs || []);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const openModal = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        projectId: entry.projectId || '',
        userId: entry.userId,
        description: entry.description,
        hours: entry.hours,
        billable: entry.billable,
        status: entry.status,
        date: entry.date
      });
    } else {
      setEditingEntry(null);
      setFormData({
        projectId: '',
        userId: currentUser?.id || '',
        description: '',
        hours: 1,
        billable: 1,
        status: 'Unbilled',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const saveEntry = async (e) => {
    e.preventDefault();
    if (editingEntry) {
      await window.api.updateTimeEntry({ ...formData, id: editingEntry.id });
      showToast("Time log updated", "success");
    } else {
      await window.api.addTimeEntry(formData);
      showToast("Time logged successfully", "success");
    }
    setIsModalOpen(false);
    loadData();
  };

  const deleteEntry = async (id) => {
    if (confirm("Delete this time entry?")) {
      await window.api.deleteTimeEntry(id);
      showToast("Entry deleted", "success");
      loadData();
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Timer size={24} className="text-primary" /> Time & Timesheets
        </h2>
        <button className="btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={18} /> Log Time
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Project</th>
              <th>Description</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => {
              const proj = projects.find(p => p.id === entry.projectId);
              return (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td style={{ fontWeight: 'bold' }}>{proj ? proj.name : 'Internal / Non-Billable'}</td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {entry.description}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                      <Clock size={16} /> {entry.hours} hrs
                    </div>
                  </td>
                  <td>
                    {entry.billable === 1 ? (
                      <span className="badge" style={{ background: entry.status === 'Billed' ? 'var(--success)' : 'var(--warning)', color: '#fff' }}>
                        {entry.status}
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'var(--bg-card)' }}>Non-Billable</span>
                    )}
                  </td>
                  <td>
                    <button className="btn-sm" onClick={() => openModal(entry)} title="Edit" disabled={entry.status === 'Billed'}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => deleteEntry(entry.id)} style={{ marginLeft: '5px' }} disabled={entry.status === 'Billed'}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No time logged yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingEntry ? 'Edit Time Log' : 'Log Time'}</h2>
            <form onSubmit={saveEntry}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Hours Worked</label>
                  <input required type="number" min="0.25" step="0.25" value={formData.hours} onChange={e => setFormData({...formData, hours: Number(e.target.value)})} />
                </div>
              </div>
              
              <div className="form-group">
                <label>Project</label>
                <select value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                  <option value="">None (Internal / Non-Billable)</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              
              <div className="form-group">
                <label>Description of Work</label>
                <textarea rows="2" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="billable" checked={formData.billable === 1} onChange={e => setFormData({...formData, billable: e.target.checked ? 1 : 0})} />
                <label htmlFor="billable" style={{ margin: 0, cursor: 'pointer' }}>This time is Billable to the client</label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Time Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

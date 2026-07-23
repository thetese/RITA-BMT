import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Calendar, DollarSign, Edit, Trash2, ChevronRight } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function Projects({ setPage, setSelectedProjectId }) {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    status: 'Active',
    startDate: '',
    deadline: '',
    budget: 0,
    description: '',
    managerId: ''
  });

  const loadData = async () => {
    if (!window.api) return;
    const projs = await window.api.getProjects();
    setProjects(projs || []);
    const usrs = await window.api.getUsers();
    setUsers(usrs || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (proj = null) => {
    if (proj) {
      setEditingProject(proj);
      setFormData({
        name: proj.name,
        clientName: proj.clientName,
        status: proj.status,
        startDate: proj.startDate,
        deadline: proj.deadline,
        budget: proj.budget,
        description: proj.description,
        managerId: proj.managerId
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        clientName: '',
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        deadline: '',
        budget: 0,
        description: '',
        managerId: ''
      });
    }
    setIsModalOpen(true);
  };

  const saveProject = async (e) => {
    e.preventDefault();
    if (editingProject) {
      await window.api.updateProject({ ...formData, id: editingProject.id });
      showToast("Project updated successfully", "success");
    } else {
      await window.api.addProject(formData);
      showToast("New project created!", "success");
    }
    setIsModalOpen(false);
    loadData();
  };

  const deleteProject = async (id) => {
    if (confirm("Are you sure you want to delete this project? Associated tasks will also be deleted.")) {
      await window.api.deleteProject(id);
      showToast("Project deleted", "success");
      loadData();
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(val);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={24} className="text-primary" /> Active Projects
        </h2>
        <button className="btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Client</th>
              <th>Timeline</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(proj => (
              <tr key={proj.id}>
                <td>
                  <strong style={{ display: 'block', fontSize: '1.05rem' }}>{proj.name}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{proj.description}</span>
                </td>
                <td>{proj.clientName}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                    <Calendar size={12} /> {proj.startDate} ➔ {proj.deadline || 'Ongoing'}
                  </div>
                </td>
                <td style={{ fontWeight: 'bold' }}>{formatCurrency(proj.budget)}</td>
                <td>
                  <span className="badge" style={{ background: proj.status === 'Completed' ? 'var(--success)' : 'var(--primary)', color: '#fff' }}>
                    {proj.status}
                  </span>
                </td>
                <td>
                  <button className="btn-sm btn-secondary" onClick={() => { setSelectedProjectId(proj.id); setPage('portal'); }} title="Client Portal Snapshot" style={{ marginRight: '5px' }}>
                    <Briefcase size={14} style={{ marginRight: '4px' }} /> Portal
                  </button>
                  <button className="btn-sm btn-success" onClick={() => { setSelectedProjectId(proj.id); setPage('tasks'); }} title="View Tasks" style={{ marginRight: '5px' }}>
                    Tasks <ChevronRight size={14} />
                  </button>
                  <button className="btn-sm" onClick={() => openModal(proj)} title="Edit" style={{ marginRight: '5px' }}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-sm btn-danger" onClick={() => deleteProject(proj.id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>No projects found. Create one from a won quote!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingProject ? 'Edit Project' : 'New Project'}</h2>
            <form onSubmit={saveProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Client Name</label>
                <input required type="text" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Start Date</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Deadline</label>
                  <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Budget (RWF)</label>
                  <input type="number" min="0" value={formData.budget} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Project Manager</label>
                <select value={formData.managerId} onChange={e => setFormData({...formData, managerId: e.target.value})}>
                  <option value="">Select Manager...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Clock, User, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function Tasks({ currentUser, selectedProjectId, setPage, setSelectedProjectId }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    projectId: selectedProjectId || '',
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    assignedTo: currentUser?.id || '',
    dueDate: ''
  });

  const loadData = async () => {
    if (!window.api) return;
    const tsks = await window.api.getTasks();
    const projs = await window.api.getProjects();
    const usrs = await window.api.getUsers();
    setTasks(tsks || []);
    setProjects(projs || []);
    setUsers(usrs || []);
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  const openModal = (tsk = null) => {
    if (tsk) {
      setEditingTask(tsk);
      setFormData({
        projectId: tsk.projectId,
        title: tsk.title,
        description: tsk.description,
        status: tsk.status,
        priority: tsk.priority,
        assignedTo: tsk.assignedTo,
        dueDate: tsk.dueDate
      });
    } else {
      setEditingTask(null);
      setFormData({
        projectId: selectedProjectId || (projects.length > 0 ? projects[0].id : ''),
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        assignedTo: currentUser?.id || '',
        dueDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const saveTask = async (e) => {
    e.preventDefault();
    if (!formData.projectId) {
      showToast("A task must belong to a project.", "error");
      return;
    }

    if (editingTask) {
      await window.api.updateTask({ ...formData, id: editingTask.id });
      showToast("Task updated successfully", "success");
    } else {
      await window.api.addTask(formData);
      showToast("New task created!", "success");
    }
    setIsModalOpen(false);
    loadData();
  };

  const deleteTask = async (id) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await window.api.deleteTask(id);
      showToast("Task deleted", "success");
      loadData();
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    await window.api.updateTask({ ...task, status: newStatus });
    loadData();
  };

  // Filter tasks: if a project is selected, show only those. Otherwise, show user's assigned tasks or all if admin.
  const displayTasks = tasks.filter(t => {
    if (selectedProjectId) return t.projectId === selectedProjectId;
    if (currentUser?.role === 'admin') return true;
    return t.assignedTo === currentUser?.id;
  });

  const activeProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedProjectId && (
            <button className="btn-sm" onClick={() => { setSelectedProjectId(null); setPage('projects'); }} style={{ marginRight: '10px' }}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <CheckSquare size={24} className="text-primary" /> 
          {activeProject ? `Tasks for ${activeProject.name}` : 'My Task List'}
        </h2>
        <button className="btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={18} /> New Task
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {displayTasks.map(task => {
          const proj = projects.find(p => p.id === task.projectId);
          const user = users.find(u => u.id === task.assignedTo);
          const isCompleted = task.status === 'Completed';

          return (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px', borderLeft: isCompleted ? '4px solid var(--success)' : (task.priority === 'High' ? '4px solid var(--danger)' : '4px solid var(--primary)'), opacity: isCompleted ? 0.6 : 1 }}>
              
              <div style={{ marginRight: '15px', cursor: 'pointer' }} onClick={() => toggleStatus(task)}>
                {isCompleted ? <CheckSquare size={24} style={{ color: 'var(--success)' }} /> : <div style={{ width: '24px', height: '24px', border: '2px solid var(--text-secondary)', borderRadius: '4px' }}></div>}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', textDecoration: isCompleted ? 'line-through' : 'none' }}>{task.title}</div>
                {!selectedProjectId && proj && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>{proj.name}</div>
                )}
                {task.description && <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{task.description}</div>}
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginRight: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} /> {user ? user.username : 'Unassigned'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: task.dueDate && task.dueDate < new Date().toISOString().split('T')[0] && !isCompleted ? 'var(--danger)' : 'inherit' }}>
                  <Clock size={14} /> {task.dueDate || 'No due date'}
                </div>
                <div>
                  <span className="badge" style={{ background: 'var(--bg-card)' }}>{task.priority}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '5px' }}>
                <button className="btn-sm" onClick={() => openModal(task)}><Edit size={16} /></button>
                <button className="btn-sm btn-danger" onClick={() => deleteTask(task.id)}><Trash2 size={16} /></button>
              </div>

            </div>
          );
        })}
        {displayTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No tasks found. Take a coffee break! ☕
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={saveTask}>
              {!selectedProjectId && (
                <div className="form-group">
                  <label>Project</label>
                  <select required value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                    <option value="">Select Project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label>Task Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Assignee</label>
                  <select value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

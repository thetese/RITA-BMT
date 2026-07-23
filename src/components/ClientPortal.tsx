import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, FileText, Target, Layout } from 'lucide-react';

export default function ClientPortal({ projectId, setPage, setSelectedProjectId }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (!window.api || !projectId) return;

    const loadData = async () => {
      const allProjs = await window.api.getProjects();
      const proj = allProjs.find(p => p.id === projectId);
      setProject(proj);

      const allTasks = await window.api.getTasks();
      setTasks(allTasks.filter(t => t.projectId === projectId));

      const allTime = await window.api.getTimeEntries();
      setTimeLogs(allTime.filter(t => t.projectId === projectId));

      const allInvoices = await window.api.getInvoices();
      // Heuristic: matching customerName to clientName
      if (proj) {
        setInvoices(allInvoices.filter(i => i.customerName === proj.clientName));
      }
    };

    loadData();
  }, [projectId]);

  if (!project) return <div style={{ padding: '20px' }}>Loading portal data...</div>;

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalHours = timeLogs.reduce((sum, t) => sum + t.hours, 0);
  const billableHours = timeLogs.filter(t => t.billable === 1).reduce((sum, t) => sum + t.hours, 0);

  const formatCurrency = (val) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(val);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', background: 'var(--bg-color)', minHeight: '100vh', padding: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }} className="no-print">
        <button className="btn-sm" onClick={() => { setSelectedProjectId(null); setPage('projects'); }}>
          <ArrowLeft size={16} /> Back to Projects
        </button>
        <button className="btn-primary" onClick={() => window.print()}>
          Print / Export PDF
        </button>
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 10px 0', color: 'var(--primary)' }}>Project Status Report</h1>
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>{project.name}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>Client: <strong>{project.clientName}</strong></p>
        </div>

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          
          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <Target size={24} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{project.status}</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <Layout size={24} style={{ color: 'var(--success)', marginBottom: '10px' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Task Progress</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{progress}%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{completedTasks} of {totalTasks} Tasks Completed</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <Clock size={24} style={{ color: 'var(--warning)', marginBottom: '10px' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Time Logged</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{totalHours} Hours</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{billableHours} Billable</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <FileText size={24} style={{ color: 'var(--danger)', marginBottom: '10px' }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Budget</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formatCurrency(project.budget)}</div>
          </div>

        </div>

        {/* Tasks Section */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>Project Tasks</h3>
          {tasks.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {tasks.map(t => (
                <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <CheckCircle size={18} style={{ color: t.status === 'Completed' ? 'var(--success)' : 'var(--text-secondary)' }} />
                  <span style={{ flex: 1, textDecoration: t.status === 'Completed' ? 'line-through' : 'none', color: t.status === 'Completed' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    {t.title}
                  </span>
                  <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{t.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No tasks assigned yet.</p>
          )}
        </div>

        {/* Invoices Section */}
        <div>
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>Financials & Invoices</h3>
          {invoices.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {invoices.map(inv => (
                <li key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <strong>Invoice #{inv.id.substring(0,6).toUpperCase()}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Date: {new Date(inv.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{formatCurrency(inv.total)}</strong>
                    <div><span className="badge" style={{ background: inv.status === 'PAID' ? 'var(--success)' : 'var(--warning)', color: '#fff', fontSize: '0.7rem' }}>{inv.status}</span></div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No invoices generated for this client yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}

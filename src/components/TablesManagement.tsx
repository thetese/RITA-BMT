// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useConfirm } from './ui/Confirm';

const defaultTable = { name: '', zone: 'Main Hall', seats: 4, posX: 0, posY: 0 };

export default function TablesManagement({ currentUser }) {
  const { askConfirm } = useConfirm();
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState(defaultTable);
  const [editingId, setEditingId] = useState(null);
  const [explicitZones, setExplicitZones] = useState([]);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'plan'
  const [draggingTable, setDraggingTable] = useState(null);
  const containerRef = useRef(null);

  const loadData = async () => {
    if (!window.api) return;
    const data = await window.api.getTables();
    setTables(data);
    const z = await window.api.getSetting('restaurantZones');
    if (z) setExplicitZones(JSON.parse(z));
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await window.api.updateTable({ ...form, id: editingId, seats: parseInt(form.seats, 10) || 4 }, currentUser.id);
      } else {
        await window.api.addTable({ ...form, seats: parseInt(form.seats, 10) || 4 }, currentUser.id);
      }
      setForm(defaultTable);
      setEditingId(null);
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (table) => {
    setForm(table);
    setEditingId(table.id);
  };

  const handleDelete = async (id) => {
    if (await askConfirm('Delete this table from the floor plan?')) {
      await window.api.deleteTable(id, currentUser.id);
      loadData();
    }
  };

  // Drag and Drop Logic
  const handleMouseDown = (table, e) => {
    setDraggingTable({
      id: table.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: table.posX || 0,
      origY: table.posY || 0
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingTable) return;
    const dx = e.clientX - draggingTable.startX;
    const dy = e.clientY - draggingTable.startY;
    
    // Update local state for smooth dragging
    setTables(tables.map(t => {
      if (t.id === draggingTable.id) {
        return { ...t, posX: draggingTable.origX + dx, posY: draggingTable.origY + dy };
      }
      return t;
    }));
  };

  const handleMouseUp = async () => {
    if (!draggingTable) return;
    const table = tables.find(t => t.id === draggingTable.id);
    if (table) {
      await window.api.updateTable(table, currentUser.id);
    }
    setDraggingTable(null);
  };

  const zonesFromTables = tables.map(t => t.zone);
  const activeZones = [...new Set([...zonesFromTables, ...explicitZones])];
  if (activeZones.length === 0) activeZones.push('Main Hall');
  
  const [selectedZone, setSelectedZone] = useState(activeZones[0] || 'Main Hall');

  const handleAddZoneSubmit = async (e) => {
    if (e) e.preventDefault();
    if (newZoneName && newZoneName.trim()) {
      const trimmed = newZoneName.trim();
      const newZones = [...new Set([...explicitZones, trimmed])];
      setExplicitZones(newZones);
      if (window.api) await window.api.setSetting('restaurantZones', JSON.stringify(newZones));
      setSelectedZone(trimmed);
    }
    setNewZoneName('');
    setIsAddingZone(false);
  };

  return (
    <div className="customers-mgmt">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Restaurant Tables & Floor Plan</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={activeTab === 'list' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('list')}>List View</button>
          <button className={activeTab === 'plan' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('plan')}>Floor Plan Designer</button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <>
          <div className="sales-form">
            <h2>{editingId ? 'Edit Table' : 'Add New Table'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Table Name / Number *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Table 1, Bar 4" required />
              </div>
              <div className="form-row">
                <label>Zone / Area *</label>
                <input name="zone" value={form.zone} onChange={handleChange} placeholder="e.g. Main Hall, Patio, VIP" required list="zonesList" />
                <datalist id="zonesList">
                  {activeZones.map(z => <option key={z} value={z} />)}
                </datalist>
              </div>
              <div className="form-row">
                <label>Number of Seats</label>
                <input type="number" name="seats" value={form.seats} onChange={handleChange} min="1" required />
              </div>
              <div className="form-actions">
                {editingId && <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(defaultTable); }}>Cancel</button>}
                <button type="submit" className="btn-primary">{editingId ? 'Update Table' : 'Add Table'}</button>
              </div>
            </form>
          </div>

          <div className="sales-list" style={{ marginTop: '24px' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>Table Name</th>
                    <th>Seats</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map(t => (
                    <tr key={t.id}>
                      <td><span className="badge">{t.zone}</span></td>
                      <td style={{ fontWeight: 600 }}>{t.name}</td>
                      <td>{t.seats}</td>
                      <td className="actions">
                        <button className="btn-sm" onClick={() => handleEdit(t)}>Edit</button>
                        {currentUser.role === 'Admin' && (
                          <button className="btn-sm btn-danger" onClick={() => handleDelete(t.id)}>Del</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tables.length === 0 && (
                    <tr><td colSpan={4} className="empty">No tables defined yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: 'calc(100vh - 150px)' }}>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0', alignItems: 'center' }}>
            {activeZones.map(z => (
              <button 
                key={z} 
                className={selectedZone === z ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setSelectedZone(z)}
              >
                {z}
              </button>
            ))}
            
            {isAddingZone ? (
              <form onSubmit={handleAddZoneSubmit} style={{ display: 'flex', gap: '5px' }}>
                <input 
                  type="text" 
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Zone name..."
                  autoFocus
                  style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
                />
                <button type="submit" className="btn-primary btn-sm" style={{ padding: '6px 12px' }}>Save</button>
                <button type="button" className="btn-secondary btn-sm" onClick={() => setIsAddingZone(false)} style={{ padding: '6px 12px' }}>Cancel</button>
              </form>
            ) : (
              <button className="btn-sm" onClick={() => setIsAddingZone(true)} style={{ padding: '6px 12px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add Zone</button>
            )}
          </div>
          
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ 
              flex: 1, 
              background: 'var(--bg-secondary)', 
              borderRadius: '12px', 
              border: '2px dashed var(--border-color)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {tables.filter(t => t.zone === selectedZone).map(t => (
              <div 
                key={t.id}
                onMouseDown={(e) => handleMouseDown(t, e)}
                style={{
                  position: 'absolute',
                  left: `${t.posX || 0}px`,
                  top: `${t.posY || 0}px`,
                  width: '80px',
                  height: '80px',
                  background: 'var(--primary)',
                  color: '#fff',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: draggingTable?.id === t.id ? 'grabbing' : 'grab',
                  boxShadow: draggingTable?.id === t.id ? '0 8px 16px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
                  transition: draggingTable?.id === t.id ? 'none' : 'box-shadow 0.2s',
                  userSelect: 'none'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{t.name}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.seats} Seats</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 0 }}>
            Drag and drop tables to arrange your floor plan. Changes are saved automatically.
          </p>
        </div>
      )}
    </div>
  );
}

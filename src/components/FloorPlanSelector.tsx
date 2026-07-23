// @ts-nocheck
import React, { useState } from 'react';

export default function FloorPlanSelector({ tables, onSelectTable, onClose }) {
  const zones = [...new Set(tables.map(t => t.zone))];
  const activeZones = zones.length > 0 ? zones : ['Main Hall'];
  const [selectedZone, setSelectedZone] = useState(activeZones[0]);

  const [customName, setCustomName] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px', width: '800px', background: 'var(--card-bg)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Select Table</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Custom Name..." 
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          />
          <button 
            className="btn-primary" 
            onClick={() => onSelectTable(customName)}
            disabled={!customName.trim()}
          >
            Confirm
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
        {activeZones.map(z => (
          <button 
            key={z} 
            className={selectedZone === z ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setSelectedZone(z)}
          >
            {z}
          </button>
        ))}
      </div>
      
      <div 
        style={{ 
          flex: 1, 
          background: 'var(--bg-secondary)', 
          borderRadius: '12px', 
          border: '2px dashed var(--border-color)',
          position: 'relative',
          overflow: 'hidden',
          marginTop: '15px'
        }}
      >
        {tables.filter(t => t.zone === selectedZone).map(t => (
          <div 
            key={t.id}
            onClick={() => onSelectTable(t.name)}
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
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              userSelect: 'none',
              transition: 'transform 0.1s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{t.name}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.seats} Seats</div>
          </div>
        ))}
      </div>
    </div>
  );
}

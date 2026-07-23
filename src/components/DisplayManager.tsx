import React, { useState, useEffect } from 'react';
import { Monitor, CheckCircle2 } from 'lucide-react';

export default function DisplayManager() {
  const [displays, setDisplays] = useState([]);
  const [mapping, setMapping] = useState([]);
  const [mainDisplayId, setMainDisplayId] = useState(null);
  
  useEffect(() => {
    const load = async () => {
      if (!window.api || !window.api.getAllDisplays) return;
      const disps = await window.api.getAllDisplays();
      setDisplays(disps);
      const saved = await window.api.getSetting('displayMapping');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMapping(parsed);
        const main = parsed.find(m => m.isMain);
        if (main) setMainDisplayId(main.displayId);
      }
    };
    load();
  }, []);

  const handleAssignment = (displayId, page) => {
    setMapping(prev => {
      const newMap = prev.filter(m => m.displayId !== displayId);
      if (page !== 'none') {
        newMap.push({ displayId, page, isMain: false });
      }
      return newMap;
    });
  };

  const handleSave = async () => {
    if (window.api) {
      // Ensure only the selected main window gets isMain=true
      const finalMapping = mapping.map(m => ({
        ...m,
        isMain: m.displayId === mainDisplayId
      }));
      await window.api.setSetting('displayMapping', JSON.stringify(finalMapping));
      alert("Display configuration saved! Please fully restart the app for changes to take effect.");
    }
  };

  if (displays.length === 0) return null;

  return (
    <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', marginTop: '30px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Monitor size={20}/> Multi-Monitor Configuration</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Assign different parts of the application to specific monitors. The app will spawn these automatically on launch.</p>
      </div>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {displays.map((disp, i) => {
          const currentMap = mapping.find(m => m.displayId === disp.id);
          const currentAssignment = currentMap ? currentMap.page : 'none';
          
          return (
            <div key={disp.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '15px', borderRadius: '8px' }}>
                <Monitor size={32} color="#3b82f6" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Display {i + 1} {disp.isPrimary && <span style={{ fontSize: '0.75rem', background: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '12px', marginLeft: '5px' }}>PRIMARY</span>}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Resolution: {disp.bounds.width}x{disp.bounds.height}</div>
              </div>
              <select 
                value={currentAssignment}
                onChange={(e) => handleAssignment(disp.id, e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '2px solid var(--border-color)', fontWeight: 'bold', outline: 'none', cursor: 'pointer', minWidth: '200px' }}
              >
                <option value="none">-- Not Used --</option>
                <option value="dashboard">Dashboard (Main UI)</option>
                <option value="pos">Point of Sale</option>
                <option value="kitchen">Kitchen Display</option>
              </select>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px', opacity: currentAssignment !== 'none' ? 1 : 0.5 }}>
                <input 
                  type="radio" 
                  name="mainDisplay" 
                  id={`main-${disp.id}`}
                  checked={mainDisplayId === disp.id}
                  onChange={() => setMainDisplayId(disp.id)}
                  disabled={currentAssignment === 'none'}
                  style={{ cursor: currentAssignment !== 'none' ? 'pointer' : 'default' }}
                />
                <label htmlFor={`main-${disp.id}`} style={{ fontSize: '0.85rem', cursor: currentAssignment !== 'none' ? 'pointer' : 'default', fontWeight: mainDisplayId === disp.id ? 'bold' : 'normal', color: mainDisplayId === disp.id ? 'var(--primary)' : 'inherit' }}>
                  Set as Main Window
                </label>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={handleSave} className="btn-primary" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CheckCircle2 size={18} />
        Save Configuration
      </button>
    </div>
  );
}

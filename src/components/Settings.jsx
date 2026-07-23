import React, { useState, useEffect } from 'react';

export default function Settings({ theme, toggleTheme }) {
  const [message, setMessage] = useState('');
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [tin, setTin] = useState('');

  useEffect(() => {
    const fetchPrinters = async () => {
      if (window.api && window.api.getPrinters) {
        try {
          const prts = await window.api.getPrinters();
          setPrinters(prts);
          const savedPrinter = await window.api.getSetting('receiptPrinter');
          if (savedPrinter) setSelectedPrinter(savedPrinter);
          const savedTin = await window.api.getSetting('tin');
          if (savedTin) setTin(savedTin);
        } catch (e) {
          console.error("Error fetching settings", e);
        }
      }
    };
    fetchPrinters();
  }, []);

  const handleTinChange = (e) => {
    const t = e.target.value;
    setTin(t);
    if (window.api) window.api.setSetting('tin', t);
  };

  const handlePrinterChange = (e) => {
    const p = e.target.value;
    setSelectedPrinter(p);
    if (window.api) window.api.setSetting('receiptPrinter', p);
    setMessage('Printer saved');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleBackup = async () => {
    setMessage('Backing up...');
    try {
      const res = await window.api.backupDatabase();
      if (res.success) {
        setMessage('Backup successful!');
      } else {
        setMessage(res.error === 'Cancelled' ? '' : `Error: ${res.error}`);
      }
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRestore = async () => {
    if (!confirm('WARNING: Restoring will overwrite all current data. Are you sure?')) return;
    setMessage('Restoring...');
    try {
      const res = await window.api.restoreDatabase();
      if (res.success) {
        alert('Restore successful! The app needs to restart.');
        window.location.reload();
      } else {
        setMessage(res.error === 'Cancelled' ? '' : `Error: ${res.error}`);
      }
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="settings-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>System Settings</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Appearance</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Choose between Light and Dark mode for the application interface.</p>
        <button className="btn-secondary" onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

      <div style={{ marginBottom: '30px' }}>
        <h3>Printer Settings</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Select the default printer for thermal receipts from the POS.</p>
        <select value={selectedPrinter} onChange={handlePrinterChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }}>
          <option value="">Select a printer...</option>
          {printers.map(p => (
            <option key={p.name} value={p.name}>{p.name} {p.isDefault ? '(Default)' : ''}</option>
          ))}
        </select>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

      <div style={{ marginBottom: '30px' }}>
        <h3>RRA Configuration</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Enter your Tax Identification Number (TIN) for the VSDC.</p>
        <input 
          type="text" 
          value={tin} 
          onChange={handleTinChange} 
          placeholder="e.g. 100000000" 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }} 
        />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

      <div>
        <h3>Data Management</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Backup your database to a USB drive or restore from a previous backup file.</p>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={handleBackup}>Backup Database</button>
          <button className="btn-secondary btn-danger" onClick={handleRestore}>Restore Database</button>
        </div>
        
        {message && <div style={{ marginTop: '12px', color: 'var(--primary)', fontWeight: 600 }}>{message}</div>}
      </div>
    </div>
  );
}

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useConfirm } from './ui/Confirm';

export default function ShiftManager({ mode, shift, onSubmit, onCancel }) {
  const [cash, setCash] = useState('');
  const [expectedCash, setExpectedCash] = useState(null);
  const { askConfirm } = useConfirm();

  useEffect(() => {
    if (mode === 'close' && shift && shift.id) {
      window.api.getExpectedCash(shift.id).then(setExpectedCash).catch(console.error);
    }
  }, [mode, shift]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cash || isNaN(cash)) return;
    const actual = parseFloat(cash);
    
    if (mode === 'close' && expectedCash !== null) {
      if (actual !== expectedCash) {
        const diff = actual - expectedCash;
        const msg = diff > 0 
          ? `You are OVER by ${diff.toLocaleString()} FRW.` 
          : `You are SHORT by ${Math.abs(diff).toLocaleString()} FRW.`;
        
        const confirmed = await askConfirm(`Discrepancy Detected!\n\nExpected Cash: ${expectedCash.toLocaleString()} FRW\nActual Cash: ${actual.toLocaleString()} FRW\n\n${msg}\n\nAre you sure you want to close this shift with this discrepancy?`);
        if (!confirmed) return;
      }
    }
    
    onSubmit(actual);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <div style={{ background: 'var(--card-bg)', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        {mode === 'open' ? (
          <>
            <h2 style={{ marginBottom: '10px' }}>Open Shift</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Declare your starting cash float to begin selling.</p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Starting Cash (FRW) *</label>
                <input 
                  type="number" 
                  value={cash}
                  onChange={e => setCash(e.target.value)}
                  placeholder="e.g. 10000"
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '1.2rem', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                Open Shift
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: '10px', color: 'var(--danger)' }}>Close Shift</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Shift opened at: {new Date(shift.openedAt).toLocaleTimeString()}<br/>
              Count the physical cash in your drawer.
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Actual Cash Counted (FRW) *</label>
                <input 
                  type="number" 
                  value={cash}
                  onChange={e => setCash(e.target.value)}
                  placeholder="Enter actual cash"
                  style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '1.2rem', boxSizing: 'border-box' }}
                  required
                />
              </div>
              {expectedCash !== null && cash && !isNaN(cash) && parseFloat(cash) !== expectedCash && (
                <div style={{ padding: '10px', background: 'var(--danger)', color: 'white', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem' }}>
                  Warning: The expected cash amount in drawer is {expectedCash.toLocaleString()} FRW. You have a discrepancy of {(parseFloat(cash) - expectedCash).toLocaleString()} FRW.
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={onCancel} style={{ flex: 1, padding: '12px', background: '#e2e8f0', color: '#000', border: 'none', borderRadius: '6px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  Close Shift
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

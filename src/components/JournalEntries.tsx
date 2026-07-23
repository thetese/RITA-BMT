import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function JournalEntries() {
  const { showToast } = useToast();
  const api = (window as any).api;

  const [entries, setEntries] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    referenceId: '',
    lines: [
      { accountId: '', debit: '', credit: '' },
      { accountId: '', debit: '', credit: '' }
    ]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!api) return;
    try {
      const ent = await api.getJournalEntries();
      setEntries(ent);
      const acc = await api.getAccounts();
      setAccounts(acc.filter((a: any) => a.isActive));
    } catch (e: any) {
      showToast('Error loading ledger: ' + e.message, 'error');
    }
  };

  const handleAddLine = () => {
    setNewEntry({
      ...newEntry,
      lines: [...newEntry.lines, { accountId: '', debit: '', credit: '' }]
    });
  };

  const handleRemoveLine = (index: number) => {
    const updated = [...newEntry.lines];
    updated.splice(index, 1);
    setNewEntry({ ...newEntry, lines: updated });
  };

  const handleLineChange = (index: number, field: string, value: string) => {
    const updated = [...newEntry.lines];
    
    // Auto-balance mechanism for UI: If user enters debit, clear credit, and vice-versa.
    if (field === 'debit' && value !== '') updated[index].credit = '';
    if (field === 'credit' && value !== '') updated[index].debit = '';
    
    updated[index][field] = value;
    setNewEntry({ ...newEntry, lines: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    
    // Validation
    let totalDebit = 0;
    let totalCredit = 0;
    
    const processedLines = newEntry.lines.map((l: any) => {
      const d = parseFloat(l.debit) || 0;
      const c = parseFloat(l.credit) || 0;
      totalDebit += d;
      totalCredit += c;
      return { ...l, debit: d, credit: c };
    }).filter((l: any) => l.accountId && (l.debit > 0 || l.credit > 0));

    if (processedLines.length < 2) {
      showToast('A journal entry must have at least two lines.', 'error');
      return;
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      showToast(`Debits (${totalDebit}) and Credits (${totalCredit}) must balance!`, 'error');
      return;
    }

    try {
      await api.addJournalEntry({ ...newEntry, lines: processedLines });
      showToast('Journal Entry recorded successfully.', 'success');
      setIsAdding(false);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        description: '',
        referenceId: '',
        lines: [
          { accountId: '', debit: '', credit: '' },
          { accountId: '', debit: '', credit: '' }
        ]
      });
      loadData();
    } catch (e: any) {
      showToast('Failed to record entry: ' + e.message, 'error');
    }
  };

  const filteredEntries = entries.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.referenceId && e.referenceId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div className="ui-page-header">
        <div>
          <h1>General Ledger</h1>
          <p>View and record manual journal entries.</p>
        </div>
        <button className="ui-btn ui-btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={16} /> New Entry
        </button>
      </div>

      <div className="ui-panel">
        <div className="filter-bar" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="search-box" style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Search by description or ref..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', width: '100%', maxWidth: '400px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredEntries.map(entry => (
            <div key={entry.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--hover-bg)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontWeight: 600, marginRight: '12px' }}>{new Date(entry.date).toLocaleDateString()}</span>
                  <span>{entry.description}</span>
                </div>
                {entry.referenceId && <span className="ui-badge ui-badge-neutral">Ref: {entry.referenceId}</span>}
              </div>
              <table className="table" style={{ margin: 0, border: 'none' }}>
                <thead>
                  <tr>
                    <th>Account</th>
                    <th style={{ textAlign: 'right' }}>Debit</th>
                    <th style={{ textAlign: 'right' }}>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.lines.map((line: any) => (
                    <tr key={line.id}>
                      <td>{line.accountCode} - {line.accountName}</td>
                      <td style={{ textAlign: 'right' }}>{line.debit > 0 ? line.debit.toLocaleString() : ''}</td>
                      <td style={{ textAlign: 'right' }}>{line.credit > 0 ? line.credit.toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          
          {filteredEntries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <BookOpen size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
              <p>No journal entries found.</p>
            </div>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h2>New Journal Entry</h2>
              <button className="close-btn" onClick={() => setIsAdding(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" className="input" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Description / Memo</label>
                  <input type="text" className="input" value={newEntry.description} onChange={e => setNewEntry({...newEntry, description: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Reference # (Optional)</label>
                  <input type="text" className="input" value={newEntry.referenceId} onChange={e => setNewEntry({...newEntry, referenceId: e.target.value})} />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Debit</th>
                      <th>Credit</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newEntry.lines.map((line: any, idx: number) => (
                      <tr key={idx}>
                        <td>
                          <select className="input" value={line.accountId} onChange={e => handleLineChange(idx, 'accountId', e.target.value)} required>
                            <option value="">Select Account...</option>
                            {accounts.map(a => (
                              <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input type="number" step="0.01" min="0" className="input" placeholder="0.00" value={line.debit} onChange={e => handleLineChange(idx, 'debit', e.target.value)} />
                        </td>
                        <td>
                          <input type="number" step="0.01" min="0" className="input" placeholder="0.00" value={line.credit} onChange={e => handleLineChange(idx, 'credit', e.target.value)} />
                        </td>
                        <td>
                          <button type="button" className="ui-btn ui-btn-danger ui-btn-sm" onClick={() => handleRemoveLine(idx)} disabled={newEntry.lines.length <= 2}>&times;</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" className="ui-btn ui-btn-ghost ui-btn-sm" onClick={handleAddLine} style={{ marginTop: '8px' }}>+ Add Line</button>
              </div>
              
              <div className="form-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="ui-btn ui-btn-primary">Post Journal Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

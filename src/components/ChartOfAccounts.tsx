import React, { useState, useEffect } from 'react';
import { BookMarked, Plus, Search } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function ChartOfAccounts() {
  const { showToast } = useToast();
  const api = (window as any).api;

  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState({ code: '', name: '', type: 'Asset' });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    if (!api) return;
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (e: any) {
      showToast('Error loading accounts: ' + e.message, 'error');
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    try {
      await api.addAccount(newAccount);
      showToast('Account added to Chart of Accounts', 'success');
      setIsAdding(false);
      setNewAccount({ code: '', name: '', type: 'Asset' });
      loadAccounts();
    } catch (e: any) {
      showToast('Failed to add account: ' + e.message, 'error');
    }
  };

  const filteredAccounts = accounts.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.code.includes(searchTerm)
  );

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Asset': return 'ui-badge-success';
      case 'Liability': return 'ui-badge-danger';
      case 'Equity': return 'ui-badge-warning';
      case 'Revenue': return 'ui-badge-primary';
      case 'Expense': return 'ui-badge-neutral';
      default: return 'ui-badge-neutral';
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div className="ui-page-header">
        <div>
          <h1>Chart of Accounts</h1>
          <p>Manage your general ledger accounts and standard classifications.</p>
        </div>
        <button className="ui-btn ui-btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={16} /> Add Account
        </button>
      </div>

      <div className="ui-panel">
        <div className="filter-bar" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="search-box" style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', width: '100%', maxWidth: '400px' }}
            />
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Name</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map(acc => (
              <tr key={acc.id}>
                <td style={{ fontWeight: 600 }}>{acc.code}</td>
                <td>{acc.name}</td>
                <td>
                  <span className={`ui-badge ${getBadgeColor(acc.type)}`}>
                    {acc.type}
                  </span>
                </td>
                <td>
                  <span className={`ui-badge ${acc.isActive ? 'ui-badge-success' : 'ui-badge-neutral'}`}>
                    {acc.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {filteredAccounts.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <BookMarked size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
                  <p>No accounts found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAdding && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>Add GL Account</h2>
              <button className="close-btn" onClick={() => setIsAdding(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddAccount}>
              <div className="form-group">
                <label>Account Code</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newAccount.code} 
                  onChange={e => setNewAccount({...newAccount, code: e.target.value})} 
                  placeholder="e.g. 1010"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Account Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newAccount.name} 
                  onChange={e => setNewAccount({...newAccount, name: e.target.value})} 
                  placeholder="e.g. Operating Cash"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Account Type</label>
                <select 
                  className="input"
                  value={newAccount.type}
                  onChange={e => setNewAccount({...newAccount, type: e.target.value})}
                >
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              
              <div className="form-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="ui-btn ui-btn-primary">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

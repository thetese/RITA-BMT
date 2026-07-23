import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, DollarSign } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function FinancialStatements() {
  const { showToast } = useToast();
  const api = (window as any).api;

  const [activeTab, setActiveTab] = useState('pl');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!api) return;
    try {
      const accs = await api.getAccounts();
      const entries = await api.getJournalEntries();
      setAccounts(accs);
      setJournalEntries(entries);
    } catch (e: any) {
      showToast('Failed to load financial data: ' + e.message, 'error');
    }
  };

  // Compute Balances
  const accountBalances: Record<string, number> = {};
  accounts.forEach(acc => { accountBalances[acc.id] = 0; });

  journalEntries.forEach(entry => {
    entry.lines?.forEach((line: any) => {
      const acc = accounts.find(a => a.id === line.accountId);
      if (!acc) return;
      if (acc.type === 'Asset' || acc.type === 'Expense' || acc.type === 'COGS') {
        accountBalances[acc.id] += (line.debit - line.credit);
      } else {
        accountBalances[acc.id] += (line.credit - line.debit);
      }
    });
  });

  const getAccountGroupBalance = (type: string) => {
    return accounts.filter(a => a.type === type).reduce((sum, acc) => sum + (accountBalances[acc.id] || 0), 0);
  };

  const revenue = getAccountGroupBalance('Revenue');
  const cogs = getAccountGroupBalance('COGS');
  const grossProfit = revenue - cogs;
  const expenses = getAccountGroupBalance('Expense');
  const netIncome = grossProfit - expenses;

  const assets = getAccountGroupBalance('Asset');
  const liabilities = getAccountGroupBalance('Liability');
  const equity = getAccountGroupBalance('Equity') + netIncome; // Current year earnings flow to equity

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div className="ui-page-header">
        <div>
          <h1>Financial Statements</h1>
          <p>Real-time accounting reports automatically generated from ledger entries.</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button className={`dashboard-tab ${activeTab === 'pl' ? 'active' : ''}`} onClick={() => setActiveTab('pl')}>
          Profit & Loss
        </button>
        <button className={`dashboard-tab ${activeTab === 'bs' ? 'active' : ''}`} onClick={() => setActiveTab('bs')}>
          Balance Sheet
        </button>
      </div>

      {activeTab === 'pl' && (
        <div className="ui-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ margin: 0 }}>Profit & Loss Statement</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>For all periods</p>
          </div>

          <StatementSection title="Revenue" type="Revenue" accounts={accounts} balances={accountBalances} total={revenue} />
          <StatementSection title="Cost of Goods Sold" type="COGS" accounts={accounts} balances={accountBalances} total={cogs} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '2px solid var(--border-color)', borderBottom: '2px solid var(--border-color)', marginBottom: '24px' }}>
            <strong style={{ fontSize: '1.1rem' }}>Gross Profit</strong>
            <strong style={{ fontSize: '1.1rem' }}>${grossProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
          </div>

          <StatementSection title="Operating Expenses" type="Expense" accounts={accounts} balances={accountBalances} total={expenses} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '2px double var(--border-color)', background: 'var(--hover-bg)' }}>
            <strong style={{ fontSize: '1.3rem' }}>Net Income</strong>
            <strong style={{ fontSize: '1.3rem', color: netIncome >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              ${netIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </strong>
          </div>
        </div>
      )}

      {activeTab === 'bs' && (
        <div className="ui-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ margin: 0 }}>Balance Sheet</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>As of today</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Assets Side */}
            <div>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Assets</h3>
              <StatementSection title="" type="Asset" accounts={accounts} balances={accountBalances} total={assets} hideTotal={true} />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '2px solid var(--border-color)' }}>
                <strong>Total Assets</strong>
                <strong>${assets.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
              </div>
            </div>

            {/* Liabilities & Equity Side */}
            <div>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Liabilities</h3>
              <StatementSection title="" type="Liability" accounts={accounts} balances={accountBalances} total={liabilities} hideTotal={true} />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--border-color)', marginBottom: '24px' }}>
                <strong>Total Liabilities</strong>
                <strong>${liabilities.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
              </div>

              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Equity</h3>
              <StatementSection title="" type="Equity" accounts={accounts} balances={accountBalances} total={equity - netIncome} hideTotal={true} />
              
              {/* Retained Earnings (Net Income plug) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Current Year Earnings</span>
                <span>${netIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
                <strong>Total Equity</strong>
                <strong>${equity.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', marginTop: '24px', borderTop: '2px double var(--border-color)', background: 'var(--hover-bg)', gridColumn: '1 / -1' }}>
            <strong style={{ fontSize: '1.2rem' }}>Total Liabilities & Equity</strong>
            <strong style={{ fontSize: '1.2rem' }}>${(liabilities + equity).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
          </div>
          
          {Math.abs(assets - (liabilities + equity)) > 0.01 && (
            <div style={{ color: 'var(--danger)', textAlign: 'center', marginTop: '16px' }}>
              Warning: Balance Sheet does not balance. Difference: ${(assets - (liabilities + equity)).toFixed(2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatementSection({ title, type, accounts, balances, total, hideTotal = false }: any) {
  const relevantAccounts = accounts.filter((a: any) => a.type === type && balances[a.id] !== 0);
  
  if (relevantAccounts.length === 0 && !hideTotal) return null;

  return (
    <div style={{ marginBottom: '16px' }}>
      {title && <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>{title}</h4>}
      
      {relevantAccounts.map((acc: any) => (
        <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
          <span>{acc.code} - {acc.name}</span>
          <span>${(balances[acc.id] || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
      ))}

      {!hideTotal && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--border-color)', marginTop: '8px' }}>
          <strong>Total {title || type}</strong>
          <strong>${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
        </div>
      )}
    </div>
  );
}

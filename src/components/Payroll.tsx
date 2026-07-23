import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, FileText, CheckCircle } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function Payroll({ currentUser }: { currentUser: any }) {
  const { showToast } = useToast();
  const api = (window as any).api;

  const [users, setUsers] = useState<any[]>([]);
  const [timecards, setTimecards] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  
  const [period, setPeriod] = useState('month'); // week, month
  const [payrollData, setPayrollData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!api) return;
    try {
      const u = await api.getUsers();
      setUsers(u);
      
      const tc = await api.getTimecards();
      setTimecards(tc);
      
      const s = await api.getSales();
      setSales(s);
      
      calculatePayroll(u, tc, s, period);
    } catch (e: any) {
      showToast('Error loading payroll data: ' + e.message, 'error');
    }
  };

  useEffect(() => {
    if (users.length > 0) {
      calculatePayroll(users, timecards, sales, period);
    }
  }, [period]);

  const calculatePayroll = (u: any[], tc: any[], s: any[], currentPeriod: string) => {
    const now = new Date();
    let startDate = new Date();
    
    if (currentPeriod === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (currentPeriod === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    }

    const startIso = startDate.toISOString();

    const data = u.map(user => {
      // Calculate Hours
      const userTimecards = tc.filter(t => t.userId === user.id && t.clockIn >= startIso && t.clockOut);
      let totalHours = 0;
      userTimecards.forEach(t => {
        const inTime = new Date(t.clockIn).getTime();
        const outTime = new Date(t.clockOut).getTime();
        totalHours += (outTime - inTime) / (1000 * 60 * 60);
      });

      // Calculate Sales (for commissions)
      const userSales = s.filter(sale => sale.userId === user.id && sale.createdAt >= startIso);
      const totalSalesValue = userSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      
      const hourlyRate = user.hourlyRate || 0;
      const commissionRate = user.commissionRate || 0; // percentage
      const taxRate = user.taxRate || 0; // percentage
      
      const basePay = totalHours * hourlyRate;
      const commissionPay = totalSalesValue * (commissionRate / 100);
      const grossPay = basePay + commissionPay;
      const taxDeduction = grossPay * (taxRate / 100);
      const netPay = grossPay - taxDeduction;

      return {
        ...user,
        totalHours: totalHours.toFixed(2),
        basePay: basePay,
        totalSalesValue: totalSalesValue,
        commissionPay: commissionPay,
        grossPay: grossPay,
        taxDeduction: taxDeduction,
        netPay: netPay
      };
    }).filter(user => user.totalHours > 0 || user.totalSalesValue > 0);

    setPayrollData(data);
  };

  const handleProcessPayroll = async () => {
    // In a real system, this would write to Journal Entries or a Payroll table
    // For now, we will just record a generic expense and alert success.
    if (!api) return;
    try {
      const totalPayroll = payrollData.reduce((sum, u) => sum + u.netPay, 0);
      const totalTaxes = payrollData.reduce((sum, u) => sum + u.taxDeduction, 0);
      
      // Post Journal Entries for Payroll
      const lines = [];
      if (totalPayroll + totalTaxes > 0) {
        lines.push({ accountId: 'acc-6000', debit: totalPayroll + totalTaxes, credit: 0 }); // Wage Expense
        lines.push({ accountId: 'acc-1000', debit: 0, credit: totalPayroll }); // Cash paid out
        if (totalTaxes > 0) {
          lines.push({ accountId: 'acc-2000', debit: 0, credit: totalTaxes }); // Tax Liability
        }
        await api.addJournalEntry({
          date: new Date().toISOString(),
          description: `Payroll processing for ${period}ly period`,
          referenceId: `PR-${Date.now()}`,
          lines: lines
        });
      }

      showToast(`Successfully processed payroll! Net pay: $${totalPayroll.toLocaleString()}, Taxes Withheld: $${totalTaxes.toLocaleString()}`, 'success');
    } catch (e: any) {
      showToast('Error processing payroll: ' + e.message, 'error');
    }
  };

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div className="ui-page-header">
        <div>
          <h1>Payroll & Wages</h1>
          <p>Calculate wages based on timecards and sales commissions.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select className="input" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>
          <button className="ui-btn ui-btn-primary" onClick={handleProcessPayroll} disabled={payrollData.length === 0}>
            <CheckCircle size={16} /> Process Payroll
          </button>
        </div>
      </div>

      <div className="ui-panel">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Role</th>
              <th style={{ textAlign: 'right' }}>Hours Logged</th>
              <th style={{ textAlign: 'right' }}>Base Pay</th>
              <th style={{ textAlign: 'right' }}>Sales Volume</th>
              <th style={{ textAlign: 'right' }}>Commission Pay</th>
              <th style={{ textAlign: 'right' }}>Gross Pay</th>
              <th style={{ textAlign: 'right' }}>Tax Withheld</th>
              <th style={{ textAlign: 'right' }}>Net Pay</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.map(row => (
              <tr key={row.id}>
                <td style={{ fontWeight: 600 }}>{row.username}</td>
                <td>{row.role}</td>
                <td style={{ textAlign: 'right' }}>{row.totalHours} hrs @ ${row.hourlyRate || 0}/hr</td>
                <td style={{ textAlign: 'right' }}>${row.basePay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ textAlign: 'right' }}>${row.totalSalesValue.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>${row.commissionPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({row.commissionRate || 0}%)</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  ${row.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--danger)' }}>
                  -${row.taxDeduction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({row.taxRate || 0}%)
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>
                  ${row.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {payrollData.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <DollarSign size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
                  <p>No payroll data found for the selected period.</p>
                  <p style={{ fontSize: '0.85rem' }}>Employees must clock in/out and make sales to generate wages.</p>
                </td>
              </tr>
            )}
          </tbody>
          {payrollData.length > 0 && (
            <tfoot>
              <tr style={{ background: 'var(--hover-bg)' }}>
                <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Payroll:</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  ${payrollData.reduce((sum, r) => sum + r.grossPay, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--danger)' }}>
                  -${payrollData.reduce((sum, r) => sum + r.taxDeduction, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--success)' }}>
                  ${payrollData.reduce((sum, r) => sum + r.netPay, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

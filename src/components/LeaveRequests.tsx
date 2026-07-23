import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Check, X } from 'lucide-react';
import { useToast } from './ui/Toast';

export default function LeaveRequests({ currentUser }: { currentUser: any }) {
  const { showToast } = useToast();
  const api = (window as any).api;

  const [requests, setRequests] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newRequest, setNewRequest] = useState({ type: 'PTO', startDate: '', endDate: '', notes: '' });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    if (!api) return;
    try {
      const data = await api.getLeaveRequests();
      setRequests(data);
    } catch (e: any) {
      showToast('Error loading leave requests: ' + e.message, 'error');
    }
  };

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api) return;
    try {
      await api.addLeaveRequest({
        ...newRequest,
        userId: currentUser?.id
      }, currentUser?.id);
      showToast('Leave request submitted successfully', 'success');
      setIsAdding(false);
      setNewRequest({ type: 'PTO', startDate: '', endDate: '', notes: '' });
      loadRequests();
    } catch (e: any) {
      showToast('Failed to submit request: ' + e.message, 'error');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!api) return;
    try {
      await api.updateLeaveRequestStatus(id, status);
      showToast(`Request ${status.toLowerCase()} successfully`, 'success');
      loadRequests();
    } catch (e: any) {
      showToast('Failed to update status: ' + e.message, 'error');
    }
  };

  const myRequests = requests.filter(r => r.userId === currentUser?.id);
  const otherRequests = requests.filter(r => r.userId !== currentUser?.id);

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div className="ui-page-header">
        <div>
          <h1>Leave & PTO Requests</h1>
          <p>Manage time off, sick leave, and vacations.</p>
        </div>
        <button className="ui-btn ui-btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={16} /> Request Time Off
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* My Requests */}
        <div className="ui-panel">
          <h2 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            My Requests
          </h2>
          {myRequests.map(req => (
            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} /> {req.type}
                  <span className={`ui-badge ui-badge-${req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'neutral'}`}>
                    {req.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {req.startDate} to {req.endDate}
                </div>
                {req.notes && <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>"{req.notes}"</div>}
              </div>
            </div>
          ))}
          {myRequests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
              You have no leave requests.
            </div>
          )}
        </div>

        {/* Manager View (Other Requests) */}
        {currentUser?.role === 'Admin' && (
          <div className="ui-panel">
            <h2 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Pending Team Requests
            </h2>
            {otherRequests.filter(r => r.status === 'PENDING').map(req => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {req.employeeName}
                    <span className="ui-badge ui-badge-neutral">{req.type}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {req.startDate} to {req.endDate}
                  </div>
                  {req.notes && <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>"{req.notes}"</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="ui-btn ui-btn-success ui-btn-sm" onClick={() => updateStatus(req.id, 'APPROVED')} title="Approve">
                    <Check size={14} />
                  </button>
                  <button className="ui-btn ui-btn-danger ui-btn-sm" onClick={() => updateStatus(req.id, 'REJECTED')} title="Reject">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
            {otherRequests.filter(r => r.status === 'PENDING').length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                No pending requests to review.
              </div>
            )}
          </div>
        )}
      </div>

      {isAdding && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>Request Time Off</h2>
              <button className="close-btn" onClick={() => setIsAdding(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddRequest}>
              <div className="form-group">
                <label>Leave Type</label>
                <select className="input" value={newRequest.type} onChange={e => setNewRequest({...newRequest, type: e.target.value})}>
                  <option value="PTO">Paid Time Off (PTO)</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" className="input" value={newRequest.startDate} onChange={e => setNewRequest({...newRequest, startDate: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" className="input" value={newRequest.endDate} onChange={e => setNewRequest({...newRequest, endDate: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Notes / Reason</label>
                <textarea className="input" rows={3} value={newRequest.notes} onChange={e => setNewRequest({...newRequest, notes: e.target.value})} />
              </div>
              
              <div className="form-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="ui-btn ui-btn-ghost" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="ui-btn ui-btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

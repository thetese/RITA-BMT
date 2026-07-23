import React, { useState, useEffect } from 'react';

const GuestFolio = ({ reservation, onClose, api, reload }) => {
  const [folios, setFolios] = useState([]);
  const [activeFolio, setActiveFolio] = useState('A');
  const [newCharge, setNewCharge] = useState({ description: '', amount: '' });
  const [newPayment, setNewPayment] = useState({ method: 'Cash', amount: '' });

  const loadFolios = async () => {
    const data = await api.hotelGetFolios(reservation.id);
    setFolios(data);
    if (data.length > 0 && !data.find(f => f.folioType === activeFolio)) {
      setActiveFolio(data[0].folioType);
    }
  };

  useEffect(() => {
    loadFolios();
  }, [reservation.id]);

  const handleAddCharge = async () => {
    if (!newCharge.description || !newCharge.amount) return;
    await api.hotelAddChargeToRoom(reservation.roomId, parseFloat(newCharge.amount), newCharge.description, activeFolio);
    setNewCharge({ description: '', amount: '' });
    loadFolios();
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount) return;
    const folio = folios.find(f => f.folioType === activeFolio);
    if (!folio) return;
    await api.hotelAddPaymentToFolio(folio.id, parseFloat(newPayment.amount), newPayment.method);
    setNewPayment({ method: 'Cash', amount: '' });
    loadFolios();
  };

  const currentFolio = folios.find(f => f.folioType === activeFolio);
  const charges = currentFolio ? JSON.parse(currentFolio.charges || '[]') : [];
  const payments = currentFolio ? JSON.parse(currentFolio.payments || '[]') : [];

  return (
    <div className="hotel-modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="hotel-card" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button className="hotel-btn hotel-btn-secondary" style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={onClose}>Close</button>
        
        <h2 style={{ marginTop: 0 }}>Guest Folio: {reservation.customerName}</h2>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', color: 'var(--hotel-text-muted)' }}>
          <span><strong>Room:</strong> {reservation.roomId}</span>
          <span><strong>Dates:</strong> {new Date(reservation.checkInDate).toLocaleDateString()} - {new Date(reservation.checkOutDate).toLocaleDateString()}</span>
          <span><strong>Status:</strong> {reservation.status}</span>
        </div>

        <div className="hotel-tabs">
          {folios.map(f => (
            <div key={f.id} className={`hotel-tab ${activeFolio === f.folioType ? 'active' : ''}`} onClick={() => setActiveFolio(f.folioType)}>
              Folio {f.folioType}
            </div>
          ))}
          {folios.length < 2 && (
            <div className="hotel-tab" onClick={async () => { await api.hotelAddFolio(reservation.id, 'B'); loadFolios(); }}>
              + Add Folio B
            </div>
          )}
        </div>

        {currentFolio && (
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Left Col: Ledger */}
            <div style={{ flex: 2 }}>
              <h3 style={{ borderBottom: '1px solid var(--hotel-border)', paddingBottom: '10px' }}>Ledger</h3>
              <table className="hotel-table" style={{ fontSize: '0.9rem' }}>
                <thead>
                  <tr><th>Date</th><th>Description</th><th>Amount</th></tr>
                </thead>
                <tbody>
                  {charges.map((c, i) => (
                    <tr key={'c'+i}>
                      <td>{new Date(c.date).toLocaleDateString()}</td>
                      <td>{c.description}</td>
                      <td style={{ color: 'var(--hotel-danger)', textAlign: 'right' }}>+ {c.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {payments.map((p, i) => (
                    <tr key={'p'+i}>
                      <td>{new Date(p.date).toLocaleDateString()}</td>
                      <td>Payment ({p.method})</td>
                      <td style={{ color: 'var(--hotel-success)', textAlign: 'right' }}>- {p.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '1.2rem' }}>
                <strong>Current Balance: </strong>
                <span style={{ color: currentFolio.balance > 0 ? 'var(--hotel-danger)' : 'var(--hotel-success)' }}>
                  {currentFolio.balance.toLocaleString()} FRW
                </span>
              </div>
            </div>

            {/* Right Col: Actions */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'var(--hotel-bg-main)', padding: '16px', borderRadius: '12px' }}>
                <h4>Post Charge</h4>
                <input className="hotel-input" style={{ marginBottom: '8px' }} placeholder="Description" value={newCharge.description} onChange={e => setNewCharge({...newCharge, description: e.target.value})} />
                <input className="hotel-input" style={{ marginBottom: '8px' }} type="number" placeholder="Amount" value={newCharge.amount} onChange={e => setNewCharge({...newCharge, amount: e.target.value})} />
                <button className="hotel-btn hotel-btn-primary" style={{ width: '100%' }} onClick={handleAddCharge}>Add Charge</button>
              </div>

              <div style={{ background: 'var(--hotel-bg-main)', padding: '16px', borderRadius: '12px' }}>
                <h4>Post Payment</h4>
                <select className="hotel-input" style={{ marginBottom: '8px' }} value={newPayment.method} onChange={e => setNewPayment({...newPayment, method: e.target.value})}>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>MoMo</option>
                  <option>Bank Transfer</option>
                </select>
                <input className="hotel-input" style={{ marginBottom: '8px' }} type="number" placeholder="Amount" value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} />
                <button className="hotel-btn hotel-btn-secondary" style={{ width: '100%' }} onClick={handleAddPayment}>Process Payment</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                {reservation.status === 'Pending' && (
                  <button className="hotel-btn hotel-btn-primary" onClick={async () => { await api.hotelUpdateReservationStatus(reservation.id, 'Checked-In', reservation.roomId); reload(); onClose(); }}>Check In Guest</button>
                )}
                {reservation.status === 'Checked-In' && (
                  <button className="hotel-btn" style={{ background: 'var(--hotel-danger)', color: '#fff' }} onClick={async () => { await api.hotelUpdateReservationStatus(reservation.id, 'Checked-Out', reservation.roomId); reload(); onClose(); }}>Execute Check-Out</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestFolio;

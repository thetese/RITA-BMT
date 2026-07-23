// @ts-nocheck
import React, { useState, useRef } from 'react';
import { formatMoney } from '../../utils/format';
import { Banknote, Smartphone, CreditCard } from 'lucide-react';
import Modal from '../ui/Modal';

export default function PaymentModal({
  isOpen, onClose, totalPaid, finalTotalAmount, paymentDetails, setPaymentDetails,
  selectedCustomer, momoPhone, setMomoPhone, isProcessingMomo, handleMomoPay,
  changeDue, handleCheckout
}) {
  const [activeField, setActiveField] = useState('Cash');
  const inputRefs = useRef({});

  const handleNumpadPress = (digit) => {
    const currentVal = String(paymentDetails[activeField] || '');
    let newVal;
    if (digit === 'C') {
      newVal = 0;
    } else if (digit === '⌫') {
      newVal = currentVal.length <= 1 ? 0 : Number(currentVal.slice(0, -1));
    } else {
      newVal = Number(currentVal === '0' ? digit : currentVal + digit);
    }
    setPaymentDetails({ ...paymentDetails, [activeField]: newVal });
  };

  const handlePreset = (amount) => {
    setPaymentDetails({ ...paymentDetails, [activeField]: amount });
  };

  const numpadKeys = ['1','2','3','4','5','6','7','8','9','C','0','⌫'];

  return (
    <Modal title="Payment" isOpen={isOpen} onClose={onClose}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', margin: '16px 0' }}>
        Total: {formatMoney(finalTotalAmount)} FRW
      </div>
      
      {/* Quick method buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => { setPaymentDetails({ Cash: finalTotalAmount, Card: 0, Momo: 0, Credit: 0 }); setActiveField('Cash'); }}>
          <Banknote size={16} /> All Cash
        </button>
        <button className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => { setPaymentDetails({ Cash: 0, Card: 0, Momo: finalTotalAmount, Credit: 0 }); setActiveField('Momo'); }}>
          <Smartphone size={16} /> All MoMo
        </button>
        <button className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => { setPaymentDetails({ Cash: 0, Card: finalTotalAmount, Momo: 0, Credit: 0 }); setActiveField('Card'); }}>
          <CreditCard size={16} /> All Card
        </button>
        {selectedCustomer && (
          <button className="btn-secondary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--primary)', color: 'white', border: 'none' }} onClick={() => { setPaymentDetails({ Cash: 0, Card: 0, Momo: 0, Credit: finalTotalAmount }); setActiveField('Credit'); }}>
            All Credit
          </button>
        )}
      </div>

      {/* MoMo Push section */}
      <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--hover-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>MTN Mobile Money Push</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="e.g. 078xxxxxxx" 
            value={momoPhone || ''} 
            onChange={e => setMomoPhone(e.target.value)} 
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            disabled={isProcessingMomo}
          />
          <button 
            className="btn-primary" 
            style={{ background: '#f5a623', color: '#000', fontWeight: 'bold' }} 
            onClick={handleMomoPay}
            disabled={isProcessingMomo}
          >
            {isProcessingMomo ? 'Processing...' : 'Send Prompt'}
          </button>
        </div>
      </div>

      {/* Payment inputs + Numpad side by side */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {/* Left: payment fields */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { key: 'Cash', label: 'Cash (FRW)' },
            { key: 'Card', label: 'Card (FRW)' },
            { key: 'Momo', label: 'MoMo (FRW)' },
            ...(selectedCustomer ? [{ key: 'Credit', label: 'Credit (FRW)' }] : [])
          ].map(field => (
            <div 
              key={field.key}
              onClick={() => setActiveField(field.key)}
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                border: activeField === field.key ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: activeField === field.key ? 'rgba(79,70,229,0.04)' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <label style={{ fontWeight: '600', fontSize: '0.9rem', color: activeField === field.key ? 'var(--primary)' : 'var(--text-primary)' }}>{field.label}</label>
              <input 
                ref={el => inputRefs.current[field.key] = el}
                type="number" 
                min="0" 
                value={paymentDetails[field.key]} 
                onChange={e => setPaymentDetails({...paymentDetails, [field.key]: e.target.value})} 
                onFocus={() => setActiveField(field.key)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', width: '120px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }} 
              />
            </div>
          ))}
        </div>

        {/* Right: touch numpad */}
        <div style={{ width: '180px', flexShrink: 0 }}>
          {/* Tender presets */}
          <div className="tender-presets" style={{ marginBottom: '8px' }}>
            <button className="tender-preset-btn" onClick={() => handlePreset(finalTotalAmount)}>Exact</button>
            <button className="tender-preset-btn" onClick={() => handlePreset(5000)}>5K</button>
            <button className="tender-preset-btn" onClick={() => handlePreset(10000)}>10K</button>
            <button className="tender-preset-btn" onClick={() => handlePreset(20000)}>20K</button>
            <button className="tender-preset-btn" onClick={() => handlePreset(50000)}>50K</button>
          </div>
          {/* Numpad */}
          <div className="numpad-grid">
            {numpadKeys.map(key => (
              <button 
                key={key} 
                className={`numpad-btn ${key === 'C' ? 'numpad-clear' : ''}`}
                onClick={() => handleNumpadPress(key)}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Change due */}
      <div style={{ padding: '14px', background: changeDue >= 0 ? 'var(--success)' : 'var(--danger)', color: '#fff', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.05rem' }}>
        <span>{changeDue >= 0 ? 'Change Due:' : 'Remaining Balance:'}</span>
        <span>{formatMoney(Math.abs(changeDue))} FRW</span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-secondary" style={{ flex: 1, padding: '14px' }} onClick={onClose}>Cancel</button>
        <button className="btn-primary" style={{ flex: 1, padding: '14px' }} onClick={handleCheckout} disabled={totalPaid < finalTotalAmount}>Complete Sale</button>
      </div>
    </Modal>
  );
}


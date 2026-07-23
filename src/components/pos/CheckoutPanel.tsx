import React from 'react';
import { ChefHat, Printer } from 'lucide-react';
import { Customer, SaleItem } from '../../types';

interface CheckoutPanelProps {
  cart: SaleItem[];
  crmCustomers: Customer[];
  selectedCustomer: string;
  setSelectedCustomer: (id: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  redeemPoints: number;
  setRedeemPoints: (points: number) => void;
  totalAmount: number;
  activeOrderId: string | null;
  handleHoldCart: () => void;
  handlePrintBill: () => void;
  setShowPaymentModal: (show: boolean) => void;
  setPaymentDetails: (details: any) => void;
}

export default function CheckoutPanel({
  cart,
  crmCustomers,
  selectedCustomer,
  setSelectedCustomer,
  notes,
  setNotes,
  redeemPoints,
  setRedeemPoints,
  totalAmount,
  activeOrderId,
  handleHoldCart,
  handlePrintBill,
  setShowPaymentModal,
  setPaymentDetails
}: CheckoutPanelProps) {
  
  const customer = crmCustomers.find(c => c.id === selectedCustomer);
  const maxPoints = (customer as any)?.points || customer?.loyaltyPoints || 0;

  return (
    <div className="pos-checkout-area">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <select 
          value={selectedCustomer} 
          onChange={e => setSelectedCustomer(e.target.value)} 
          className="pos-search-input"
          style={{ padding: '10px 16px' }}
        >
          <option value="">Select Customer (Optional)</option>
          {crmCustomers.map(c => <option key={c.id} value={c.id}>{c.name} ({(c as any).points || c.loyaltyPoints || 0} pts)</option>)}
        </select>
        <input 
          type="text" 
          placeholder="Notes (Optional)" 
          value={notes} 
          onChange={e => setNotes(e.target.value)} 
          className="pos-search-input"
          style={{ padding: '10px 16px' }} 
        />
        
        {selectedCustomer && maxPoints > 0 && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(79, 70, 229, 0.05)', padding: '12px', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', flex: 1, fontWeight: '600' }}>
              Redeem Points (Max {maxPoints})<br/>
              <small style={{ opacity: 0.8 }}>1 pt = 10 FRW off</small>
            </span>
            <input 
              type="number" 
              max={maxPoints} 
              min="0" 
              value={redeemPoints} 
              onChange={e => setRedeemPoints(Math.min(parseInt(e.target.value) || 0, maxPoints))} 
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--primary)', width: '80px', textAlign: 'center', fontWeight: 'bold' }} 
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Total</span>
        <span className="pos-gradient-text">
          {Math.max(0, totalAmount - (redeemPoints * 10)).toLocaleString()} FRW
        </span>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <button 
          className="btn-primary" 
          style={{ flex: '1', padding: '16px', borderRadius: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          onClick={handleHoldCart}
          disabled={cart.length === 0}
        >
          <ChefHat size={18} style={{ marginRight: '8px' }} /> 
          {activeOrderId ? 'Update Kitchen' : 'Send to Kitchen'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          className="btn-secondary" 
          style={{ flex: '0 0 120px', padding: '16px', borderRadius: '16px', fontWeight: 'bold', border: '2px solid var(--border-color)' }}
          onClick={handlePrintBill}
          disabled={cart.length === 0}
        >
          <Printer size={18} style={{ marginRight: '6px' }} /> Bill
        </button>
        <button 
          className="pos-checkout-btn" 
          style={{ flex: '1' }}
          onClick={() => {
            setPaymentDetails({ Cash: 0, Card: 0, Momo: 0 });
            setShowPaymentModal(true);
          }}
          disabled={cart.length === 0}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

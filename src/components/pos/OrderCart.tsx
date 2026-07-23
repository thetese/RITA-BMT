import React from 'react';
import { ArrowLeft, Save, PauseCircle, ShoppingCart } from 'lucide-react';
import { SaleItem } from '../../types';

interface OrderCartProps {
  cart: SaleItem[];
  activeOrderId: string | null;
  activeOrderName: string;
  setView: (view: string) => void;
  handleHoldCart: () => void;
  updateQuantity: (productId: string, delta: number) => void;
  updateDiscount: (productId: string, discountVal: string) => void;
  calculateItemDiscount: (item: any) => number;
}

export default function OrderCart({
  cart,
  activeOrderId,
  activeOrderName,
  setView,
  handleHoldCart,
  updateQuantity,
  updateDiscount,
  calculateItemDiscount
}: OrderCartProps) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 20px 0' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{activeOrderId ? `Table: ${activeOrderName}` : 'New Order'}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary btn-sm" onClick={() => setView('dashboard')} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Home
          </button>
          <button className="btn-secondary btn-sm" onClick={handleHoldCart} disabled={cart.length === 0} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {activeOrderId ? <><Save size={16} /> Update</> : <><PauseCircle size={16} /> Hold</>}
          </button>
        </div>
      </div>
      
      <div className="pos-cart-list">
        {cart.map(item => {
          const cartItem = item as any;
          const dcAmt = calculateItemDiscount(cartItem);
          return (
            <div key={cartItem.productId} className="pos-cart-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, paddingRight: '10px' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {cartItem.productName || cartItem.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {(cartItem.unitPrice || cartItem.price || 0).toLocaleString()} FRW
                    {dcAmt > 0 && <span style={{ color: 'var(--danger)', marginLeft: '5px', fontWeight: 'bold' }}>(-{dcAmt.toLocaleString()})</span>}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => updateQuantity(cartItem.productId, -1)} className="pos-qty-btn">-</button>
                  <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center', fontSize: '1.1rem' }}>{cartItem.quantity}</span>
                  <button onClick={() => updateQuantity(cartItem.productId, 1)} className="pos-qty-btn plus">+</button>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', opacity: 0.8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Disc:</span>
                <input 
                  type="text" 
                  placeholder="% or FRW" 
                  value={cartItem.discount || ''} 
                  onChange={e => updateDiscount(cartItem.productId, e.target.value)} 
                  style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', width: '80px', background: 'transparent' }} 
                />
              </div>
            </div>
          );
        })}
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '60px', fontSize: '1.1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={48} style={{ opacity: 0.3 }} />
            Cart is empty
          </div>
        ) : null}
      </div>
    </>
  );
}

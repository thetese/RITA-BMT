import React, { useState, useEffect } from 'react';
import { formatMoney } from '../utils/format';

export default function SplitCheckModal({ cart, onClose, onConfirmSplit }) {
  const [splitType, setSplitType] = useState('equal'); // 'equal' or 'item'
  const [numWays, setNumWays] = useState(2);
  
  // State for Item Split
  const [mainCart, setMainCart] = useState([]);
  const [guests, setGuests] = useState([{ id: 1, name: 'Guest 1', items: [] }, { id: 2, name: 'Guest 2', items: [] }]);
  const [activeGuestId, setActiveGuestId] = useState(1);

  // Deep copy cart on mount
  useEffect(() => {
    setMainCart(cart.map(item => ({ ...item })));
  }, [cart]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  const handleConfirm = () => {
    if (splitType === 'equal') {
      // Create N identical sub-carts but with divided prices
      const subCarts = [];
      for (let i = 0; i < numWays; i++) {
        subCarts.push(cart.map(item => ({
          ...item,
          unitPrice: item.unitPrice / numWays,
          // We must NOT divide the quantity, because 1 pizza split 3 ways is still 1 pizza on the receipt, just 1/3 price.
        })));
      }
      onConfirmSplit({ type: 'equal', subCarts });
    } else {
      // Split by item
      if (mainCart.length > 0) {
        alert('Please assign all items before confirming.');
        return;
      }
      const activeGuests = guests.filter(g => g.items.length > 0);
      if (activeGuests.length === 0) return;
      
      const subCarts = activeGuests.map(g => g.items);
      onConfirmSplit({ type: 'item', subCarts });
    }
  };

  const moveItem = (item, fromList, toList, setFrom, setTo) => {
    // Decrement from 'fromList'
    const newFrom = [...fromList];
    const fromIdx = newFrom.findIndex(i => i.productId === item.productId && i.unitPrice === item.unitPrice);
    if (fromIdx > -1) {
      if (newFrom[fromIdx].quantity > 1) {
        newFrom[fromIdx].quantity -= 1;
      } else {
        newFrom.splice(fromIdx, 1);
      }
    }
    setFrom(newFrom);

    // Increment in 'toList'
    const newTo = [...toList];
    const toIdx = newTo.findIndex(i => i.productId === item.productId && i.unitPrice === item.unitPrice);
    if (toIdx > -1) {
      newTo[toIdx].quantity += 1;
    } else {
      newTo.push({ ...item, quantity: 1 });
    }
    setTo(newTo);
  };

  const assignToGuest = (item) => {
    const activeGuest = guests.find(g => g.id === activeGuestId);
    if (!activeGuest) return;
    
    moveItem(item, mainCart, activeGuest.items, setMainCart, (newItems) => {
      setGuests(prev => prev.map(g => g.id === activeGuestId ? { ...g, items: newItems } : g));
    });
  };

  const unassignFromGuest = (item, guestId) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    moveItem(item, guest.items, mainCart, (newItems) => {
      setGuests(prev => prev.map(g => g.id === guestId ? { ...g, items: newItems } : g));
    }, setMainCart);
  };

  const addGuest = () => {
    const newId = Math.max(0, ...guests.map(g => g.id)) + 1;
    setGuests([...guests, { id: newId, name: `Guest ${newId}`, items: [] }]);
    setActiveGuestId(newId);
  };

  const removeGuest = (guestId) => {
    const guest = guests.find(g => g.id === guestId);
    if (guest && guest.items.length > 0) {
      alert("Cannot remove a guest that has items assigned. Please unassign items first.");
      return;
    }
    const newGuests = guests.filter(g => g.id !== guestId);
    setGuests(newGuests);
    if (activeGuestId === guestId && newGuests.length > 0) {
      setActiveGuestId(newGuests[0].id);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', padding: '25px', borderRadius: '12px', width: splitType === 'item' ? '800px' : '500px', maxWidth: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Split Check</h2>
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <button 
            className={splitType === 'equal' ? 'btn-primary' : 'btn-secondary'} 
            style={{ flex: 1 }}
            onClick={() => setSplitType('equal')}
          >
            Split Evenly
          </button>
          <button 
            className={splitType === 'item' ? 'btn-primary' : 'btn-secondary'} 
            style={{ flex: 1 }}
            onClick={() => setSplitType('item')}
          >
            Split by Item
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px' }}>
          {splitType === 'equal' ? (
            <div style={{ padding: '20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <label style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Number of ways:</label>
                <button className="btn-secondary" style={{ width: '40px', height: '40px', fontSize: '1.5rem', padding: 0 }} onClick={() => setNumWays(Math.max(2, numWays - 1))}>-</button>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{numWays}</span>
                <button className="btn-secondary" style={{ width: '40px', height: '40px', fontSize: '1.5rem', padding: 0 }} onClick={() => setNumWays(numWays + 1)}>+</button>
              </div>
              <div style={{ fontSize: '1.4rem', marginBottom: '20px', background: 'var(--hover-bg)', padding: '20px', borderRadius: '8px' }}>
                Each person pays: <span style={{ fontWeight: 'bold', color: 'var(--primary)', float: 'right' }}>{formatMoney(totalAmount / numWays)} FRW</span>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>This will generate {numWays} separate sub-orders of identical items, but at divided prices.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
              {/* Left Panel: Unassigned Items */}
              <div style={{ flex: 1, borderRight: '1px solid var(--border-color)', paddingRight: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: 'var(--text-primary)' }}>Unassigned Items ({mainCart.reduce((sum, i) => sum + i.quantity, 0)})</h3>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {mainCart.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => assignToGuest(item)}
                      style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--hover-bg)' }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{item.productName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatMoney(item.unitPrice)} FRW</div>
                      </div>
                      <div style={{ fontWeight: 'bold', background: 'var(--primary)', color: '#fff', padding: '4px 10px', borderRadius: '12px' }}>
                        x{item.quantity}
                      </div>
                    </div>
                  ))}
                  {mainCart.length === 0 && <div style={{ color: 'var(--success)', padding: '20px', textAlign: 'center', fontWeight: 'bold' }}>All items assigned!</div>}
                </div>
              </div>

              {/* Right Panel: Guests */}
              <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ color: 'var(--text-primary)' }}>Guests</h3>
                  <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.9rem' }} onClick={addGuest}>+ Add Guest</button>
                </div>

                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '15px' }}>
                  {guests.map(g => (
                    <div 
                      key={g.id} 
                      onClick={() => setActiveGuestId(g.id)}
                      style={{ 
                        padding: '10px 15px', 
                        borderRadius: '20px', 
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontWeight: 'bold',
                        background: activeGuestId === g.id ? 'var(--primary)' : 'var(--hover-bg)',
                        color: activeGuestId === g.id ? '#fff' : 'var(--text-primary)',
                        border: `1px solid ${activeGuestId === g.id ? 'var(--primary)' : 'var(--border-color)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {g.name}
                      {guests.length > 2 && (
                        <span 
                          onClick={(e) => { e.stopPropagation(); removeGuest(g.id); }}
                          style={{ fontSize: '1.2rem', lineHeight: '1', opacity: 0.7 }}
                        >
                          &times;
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', background: 'var(--hover-bg)', borderRadius: '8px', padding: '15px', border: '1px solid var(--border-color)' }}>
                  {guests.map(g => (
                    <div key={g.id} style={{ display: activeGuestId === g.id ? 'block' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Subtotal:</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{formatMoney(g.items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0))} FRW</span>
                      </div>
                      
                      {g.items.map((item, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => unassignFromGuest(item, g.id)}
                          style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '6px', marginBottom: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)' }}
                        >
                          <div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{item.productName}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatMoney(item.unitPrice)} FRW</div>
                          </div>
                          <div style={{ fontWeight: 'bold', background: 'var(--danger)', color: '#fff', padding: '4px 10px', borderRadius: '12px' }}>
                            x{item.quantity}
                          </div>
                        </div>
                      ))}
                      {g.items.length === 0 && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>Click items on the left to assign them to {g.name}.</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button 
            className="btn-primary" 
            style={{ flex: 1 }} 
            onClick={handleConfirm}
            disabled={splitType === 'item' && mainCart.length > 0}
          >
            Confirm Split
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { BellRing, CheckCircle2 } from 'lucide-react';

export default function KDS() {
  useEffect(() => {
    const enableAudio = () => {
      try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch(e) {}
    };
    document.addEventListener('click', enableAudio, { once: true });
    return () => document.removeEventListener('click', enableAudio);
  }, []);
  const [carts, setCarts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const prevPendingIdsRef = useRef(new Set());
  const initialLoadRef = useRef(true);

  const loadData = async () => {
    if (!window.api) return;
    const data = await window.api.getHeldCarts();
    setCarts(data);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // reduced polling to 30s as a fallback
    
    let removeListener = null;
    if (window.api && window.api.onCloudUpdate) {
       removeListener = window.api.onCloudUpdate((data) => {
         if (data && data.table === 'held_carts') {
           loadData(); // Instantly refresh
         }
       });
    }

    return () => {
      clearInterval(interval);
      if (removeListener) removeListener();
    };
  }, []);

  const handleUpdateStatus = async (cartId, productId, status) => {
    try {
      await window.api.updateHeldCartItemStatus(cartId, productId, status);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const isKitchenItem = (item) => {
    const cat = (item.category || '').toLowerCase();
    const kitchenCategories = ['food', 'milkshake', 'smoothie', 'detox', 'juice'];
    return kitchenCategories.some(keyword => cat.includes(keyword));
  };

  const activeTickets = carts.map(cart => {
    const parsed = JSON.parse(cart.cartData);
    const kitchenItems = parsed.filter(item => isKitchenItem(item) && item.status !== 'ready');
    return { ...cart, kitchenItems };
  }).filter(cart => cart.kitchenItems.length > 0);

  useEffect(() => {
    const getAck = () => JSON.parse(localStorage.getItem('ackNewOrders') || '[]');
    const acked = getAck();

    const currentPendingIds = new Set();
    const newItemsFound = [];

    activeTickets.forEach(t => {
      t.kitchenItems.forEach(i => {
        if (i.status === 'pending') {
          const uniqueId = `${t.id}-${i.productId}`;
          currentPendingIds.add(uniqueId);
          // If it's a pending item we've never seen in previous renders, OR it's not in localStorage yet!
          if (!prevPendingIdsRef.current.has(uniqueId) && !acked.includes(uniqueId)) {
            newItemsFound.push({ cartName: t.name, productName: i.productName, uniqueId });
          }
        }
      });
    });

    prevPendingIdsRef.current = currentPendingIds;
    
    if (initialLoadRef.current) {
       initialLoadRef.current = false;
    }

    if (newItemsFound.length > 0) {
      const playAlarm = () => {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const beep = () => {
            if (ctx.state === 'closed') return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
            if (ctx.state === 'suspended') { ctx.resume(); }
          };
          beep();
          const interval = setInterval(beep, 1000);
          return () => { clearInterval(interval); if (ctx.state !== 'closed') ctx.close(); };
        } catch (e) { return () => {}; }
      };

      const stopAudio = playAlarm();
      setAlerts(prev => [...prev, ...newItemsFound.map(item => ({ ...item, id: Date.now() + Math.random(), stopAudio }))]);
    }
  }, [carts]);

  const handleAcknowledge = (alertId) => {
    setAlerts(prev => {
      const alert = prev.find(a => a.id === alertId);
      if (alert) {
        if (alert.stopAudio) alert.stopAudio();
        const acked = JSON.parse(localStorage.getItem('ackNewOrders') || '[]');
        if (!acked.includes(alert.uniqueId)) {
          acked.push(alert.uniqueId);
          if (acked.length > 500) acked.shift();
          localStorage.setItem('ackNewOrders', JSON.stringify(acked));
        }
      }
      return prev.filter(a => a.id !== alertId);
    });
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto', background: '#111827', color: '#f9fafb', position: 'relative' }}>
      <h1 style={{ marginBottom: '20px', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>Kitchen Display System</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {activeTickets.map(ticket => (
          <div key={ticket.id} style={{ background: '#1f2937', borderRadius: '12px', padding: '15px', border: '1px solid #374151', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #374151', paddingBottom: '10px', marginBottom: '15px' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#60a5fa' }}>{ticket.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Waiter: {ticket.waiterName}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#9ca3af' }}>
                {new Date(ticket.updatedAt).toLocaleTimeString()}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ticket.kitchenItems.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#374151', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      <span style={{ color: '#fbbf24', marginRight: '8px' }}>{item.quantity}x</span> 
                      {item.productName}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {item.status === 'pending' && (
                      <button 
                        onClick={() => handleUpdateStatus(ticket.id, item.productId, 'preparing')}
                        style={{ padding: '8px 12px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Cook
                      </button>
                    )}
                    {(item.status === 'pending' || item.status === 'preparing') && (
                      <button 
                        onClick={() => handleUpdateStatus(ticket.id, item.productId, 'ready')}
                        style={{ padding: '8px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Ready
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {activeTickets.length === 0 && (
          <div style={{ color: '#9ca3af', gridColumn: '1 / -1', textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>
            No active kitchen orders.
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
          zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', width: '100%', maxHeight: '90vh' }}>
              <div key={alerts[0].id} style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '20px', padding: '30px', color: 'white',
                boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4), 0 0 0 4px rgba(245, 158, 11, 0.2)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px',
                animation: 'pulse-warning 1.5s infinite', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%', padding: '15px', animation: 'bounce 2s infinite' }}>
                  <BellRing size={48} color="white" />
                </div>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>NEW ORDER!</h2>
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', padding: '15px 25px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fef08a' }}>{alerts[0].productName}</div>
                  <div style={{ fontSize: '1.1rem', marginTop: '5px' }}>for <span style={{ fontWeight: 'bold' }}>{alerts[0].cartName}</span></div>
                </div>
                <button 
                  onClick={() => handleAcknowledge(alerts[0].id)}
                  style={{ marginTop: '10px', background: 'white', color: '#d97706', border: 'none', padding: '15px 40px', borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                >
                  <CheckCircle2 size={24} />
                  Acknowledge
                </button>
                {alerts.length > 1 && (
                  <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#fef08a', fontWeight: 'bold' }}>
                    + {alerts.length - 1} more new orders pending
                  </div>
                )}
              </div>
          </div>
          <style>{`
            @keyframes pulse-warning { 0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); transform: scale(1); } 50% { transform: scale(1.02); } 70% { box-shadow: 0 0 0 25px rgba(245, 158, 11, 0); } 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); transform: scale(1); } }
            @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          `}</style>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ChefHat, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function FoodReadyAlerts() {
  useEffect(() => {
    const enableAudio = () => {
      try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch(e) {}
    };
    document.addEventListener('click', enableAudio, { once: true });
    return () => document.removeEventListener('click', enableAudio);
  }, []);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!window.api) return;

    const getAck = () => JSON.parse(localStorage.getItem('ackReadyItems') || '[]');
    const saveAck = (list) => localStorage.setItem('ackReadyItems', JSON.stringify(list));

    const playAlarm = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const beep = () => {
          if (ctx.state === 'closed') return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
        };
        beep();
        const interval = setInterval(beep, 1000);
        if (ctx.state === 'suspended') { ctx.resume(); }
        setTimeout(() => { if (ctx.state === 'suspended' && (window as any).showToast) { (window as any).showToast('🔔 Alarm Blocked! Please interact with the page to allow sounds.', 'warning'); } }, 500);
        return () => { clearInterval(interval); if (ctx.state !== 'closed') ctx.close(); };
      } catch (err) { return () => {}; }
    };

    const checkCarts = async () => {
      const carts = await window.api.getHeldCarts();
      const acked = getAck();
      const newAlerts = [];
      carts.forEach(cart => {
        const parsed = JSON.parse(cart.cartData);
        parsed.forEach(item => {
          if (item.status === 'ready') {
            const uniqueId = `${cart.id}-${item.productId}`;
            if (!acked.includes(uniqueId)) {
              newAlerts.push({
                uniqueId,
                cartName: cart.name,
                productName: item.productName
              });
            }
          }
        });
      });

      if (newAlerts.length > 0) {
        setAlerts(prev => {
          const currentIds = prev.map(a => a.uniqueId);
          const toAdd = newAlerts.filter(a => !currentIds.includes(a.uniqueId));
          if (toAdd.length === 0) return prev;
          
          return [...prev, ...toAdd.map(a => ({
            id: Date.now() + Math.random(),
            ...a,
            stopAudio: playAlarm()
          }))];
        });
      }
    };

    // Check immediately on mount
    checkCarts();

    // Still listen to the instant IPC event for realtime updates
    let removeListener = null;
    if (window.api.onFoodReadyAlert) {
      removeListener = window.api.onFoodReadyAlert((data) => {
        // Trigger a check to fetch full state and deduplicate
        checkCarts();
      });
    }

    // Also poll every 15s as a fallback
    const interval = setInterval(checkCarts, 15000);

    return () => {
      if (removeListener) removeListener();
      clearInterval(interval);
    };
  }, []);

  const handleAcknowledge = (alertId) => {
    setAlerts(prev => {
      const alert = prev.find(a => a.id === alertId);
      if (alert) {
        if (alert.stopAudio) alert.stopAudio();
        const acked = JSON.parse(localStorage.getItem('ackReadyItems') || '[]');
        if (!acked.includes(alert.uniqueId)) {
          acked.push(alert.uniqueId);
          // Keep localStorage clean (max 500 items)
          if (acked.length > 500) acked.shift();
          localStorage.setItem('ackReadyItems', JSON.stringify(acked));
        }
      }
      return prev.filter(a => a.id !== alertId);
    });
  };

  if (alerts.length === 0) return null;

  const currentAlert = alerts[0];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh'
      }}>
          <div key={currentAlert.id} className="alarm-card" style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            borderRadius: '20px',
            padding: '30px',
            color: 'white',
            boxShadow: '0 20px 40px rgba(239, 68, 68, 0.4), 0 0 0 4px rgba(239, 68, 68, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '15px',
            animation: 'pulse-danger 1.5s infinite',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20%', right: '-10%',
              width: '150px', height: '150px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              filter: 'blur(20px)'
            }}></div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              padding: '15px',
              animation: 'bounce 2s infinite'
            }}>
              <ChefHat size={48} color="white" />
            </div>
            
            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '1px' }}>
              FOOD IS READY!
            </h2>
            
            <p style={{ margin: 0, fontSize: '1.25rem', opacity: 0.9 }}>
              Kitchen has finished preparing:
            </p>
            
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              padding: '15px 25px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fef08a' }}>
                {currentAlert.productName}
              </div>
              <div style={{ fontSize: '1.1rem', marginTop: '5px' }}>
                for <span style={{ fontWeight: 'bold' }}>{currentAlert.cartName}</span>
              </div>
            </div>
            
            <button 
              onClick={() => handleAcknowledge(currentAlert.id)}
              style={{
                marginTop: '10px',
                background: 'white',
                color: '#b91c1c',
                border: 'none',
                padding: '15px 40px',
                borderRadius: '50px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <CheckCircle2 size={24} />
              Acknowledge & Serve
            </button>
            {alerts.length > 1 && (
              <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#fef08a', fontWeight: 'bold' }}>
                + {alerts.length - 1} more ready in queue
              </div>
            )}
          </div>
      </div>
      
      <style>{`
        @keyframes pulse-danger {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); transform: scale(1); }
          50% { transform: scale(1.02); }
          70% { box-shadow: 0 0 0 25px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

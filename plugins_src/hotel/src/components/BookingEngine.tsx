import React, { useState } from 'react';

const BookingEngine = () => {
  const [config, setConfig] = useState({
    themeColor: '#3b82f6',
    buttonText: 'Book Now',
    showPromoCode: true,
    requireDeposit: false
  });

  const embedCode = `<script src="https://fidelepms.com/widget.js" data-property="default" data-theme="${config.themeColor}"></script>\n<div id="fidele-booking-widget"></div>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  return (
    <div className="hotel-card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Direct Booking Engine</h2>
          <p className="hotel-text-muted" style={{ margin: '5px 0 0 0' }}>Configure the commission-free booking widget for your website</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Configuration Panel */}
        <div>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>Widget Configuration</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Brand Color</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={config.themeColor} 
                  onChange={(e) => setConfig({...config, themeColor: e.target.value})}
                  style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                />
                <input 
                  className="hotel-input" 
                  value={config.themeColor} 
                  onChange={(e) => setConfig({...config, themeColor: e.target.value})}
                  style={{ width: '120px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Button Text</label>
              <input 
                className="hotel-input" 
                value={config.buttonText} 
                onChange={(e) => setConfig({...config, buttonText: e.target.value})}
                placeholder="e.g. Book Now, Check Availability"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className={`hotel-switch ${config.showPromoCode ? 'active' : ''}`} onClick={() => setConfig({...config, showPromoCode: !config.showPromoCode})} style={{
                width: '40px', height: '22px', borderRadius: '11px', background: config.showPromoCode ? 'var(--hotel-primary)' : 'var(--hotel-border)',
                position: 'relative', cursor: 'pointer', transition: '0.3s'
              }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: config.showPromoCode ? '20px' : '2px', transition: '0.3s' }}></div>
              </div>
              <span style={{ fontWeight: 600 }}>Show Promo Code Field</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className={`hotel-switch ${config.requireDeposit ? 'active' : ''}`} onClick={() => setConfig({...config, requireDeposit: !config.requireDeposit})} style={{
                width: '40px', height: '22px', borderRadius: '11px', background: config.requireDeposit ? 'var(--hotel-primary)' : 'var(--hotel-border)',
                position: 'relative', cursor: 'pointer', transition: '0.3s'
              }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: config.requireDeposit ? '20px' : '2px', transition: '0.3s' }}></div>
              </div>
              <span style={{ fontWeight: 600 }}>Require Credit Card Deposit (Stripe)</span>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Website Embed Code</label>
              <div style={{ position: 'relative' }}>
                <textarea 
                  className="hotel-input" 
                  value={embedCode} 
                  readOnly 
                  rows={4} 
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem', background: '#1e293b', color: '#e2e8f0', resize: 'none' }}
                />
                <button 
                  onClick={copyToClipboard}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--hotel-primary)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Copy
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--hotel-text-muted)', marginTop: '8px' }}>Paste this code into the HTML of your website where you want the booking widget to appear.</p>
            </div>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div style={{ padding: '24px', border: '1px dashed var(--hotel-border)', borderRadius: '12px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1rem', color: 'var(--hotel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Widget Preview</h3>
          
          <div style={{ width: '100%', maxWidth: '380px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ height: '120px', background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: '16px', left: '20px', color: '#1e293b', fontWeight: 'bold', fontSize: '1.2rem' }}>Main Hotel</div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Check In</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Oct 12</div>
                </div>
                <div style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Check Out</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Oct 15</div>
                </div>
              </div>
              
              <div style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Guests</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>2 Adults, 0 Children</div>
              </div>

              {config.showPromoCode && (
                <div style={{ marginBottom: '16px' }}>
                  <input type="text" placeholder="Promo Code" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' }} />
                </div>
              )}

              <button style={{ width: '100%', padding: '14px', background: config.themeColor, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'opacity 0.2s' }}>
                {config.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingEngine;

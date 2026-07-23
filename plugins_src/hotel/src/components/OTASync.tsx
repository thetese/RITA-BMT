import React, { useState } from 'react';

const OTASync = () => {
  const [channels, setChannels] = useState([
    { id: 'booking', name: 'Booking.com', connected: true, syncStatus: 'active', lastSync: new Date().toISOString() },
    { id: 'expedia', name: 'Expedia', connected: true, syncStatus: 'active', lastSync: new Date().toISOString() },
    { id: 'airbnb', name: 'Airbnb', connected: false, syncStatus: 'inactive', lastSync: null },
    { id: 'agoda', name: 'Agoda', connected: false, syncStatus: 'inactive', lastSync: null }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);

  const toggleConnection = (id: string) => {
    setChannels(channels.map(c => c.id === id ? { ...c, connected: !c.connected, syncStatus: !c.connected ? 'active' : 'inactive' } : c));
  };

  const forceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setChannels(channels.map(c => c.connected ? { ...c, lastSync: new Date().toISOString() } : c));
      setIsSyncing(false);
      alert('Inventory & Rates successfully synchronized with active channels.');
    }, 1500);
  };

  return (
    <div className="hotel-card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Channel Manager (OTA Sync)</h2>
          <p className="hotel-text-muted" style={{ margin: '5px 0 0 0' }}>Manage two-way synchronization with Online Travel Agencies</p>
        </div>
        <button 
          className="hotel-btn hotel-btn-primary" 
          onClick={forceSync}
          disabled={isSyncing}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }}>
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          {isSyncing ? 'Syncing...' : 'Force Sync All'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {channels.map(channel => (
          <div key={channel.id} style={{ 
            border: `1px solid ${channel.connected ? 'var(--hotel-primary)' : 'var(--hotel-border)'}`,
            borderRadius: '12px', padding: '20px', background: 'var(--hotel-card-bg)',
            position: 'relative', overflow: 'hidden'
          }}>
            {channel.connected && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--hotel-success)' }}></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{channel.name}</h3>
              <div className={`hotel-switch ${channel.connected ? 'active' : ''}`} onClick={() => toggleConnection(channel.id)} style={{
                width: '40px', height: '22px', borderRadius: '11px', background: channel.connected ? 'var(--hotel-success)' : 'var(--hotel-border)',
                position: 'relative', cursor: 'pointer', transition: '0.3s'
              }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: channel.connected ? '20px' : '2px', transition: '0.3s' }}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="hotel-text-muted">Status:</span>
                <span style={{ color: channel.connected ? 'var(--hotel-success)' : 'var(--hotel-text-muted)', fontWeight: 600 }}>
                  {channel.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="hotel-text-muted">Last Sync:</span>
                <span>{channel.lastSync ? new Date(channel.lastSync).toLocaleTimeString() : 'Never'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="hotel-text-muted">Rate Parity:</span>
                <span>{channel.connected ? 'Active' : '-'}</span>
              </div>
            </div>
            
            {channel.connected && (
              <button className="hotel-btn" style={{ width: '100%', marginTop: '16px', padding: '8px', fontSize: '0.85rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--hotel-primary)', border: 'none', borderRadius: '6px' }}>
                Manage Mappings
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '20px', border: '1px solid var(--hotel-border)', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.05)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: 'var(--hotel-warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>
          Parity Alert
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--hotel-text-muted)', lineHeight: '1.5' }}>
          Expedia is currently displaying rates 5% lower than your Direct Booking Engine. 
          To avoid OTA parity penalties, we recommend adjusting your Rate Plans or running a Force Sync.
        </p>
      </div>
    </div>
  );
};

export default OTASync;

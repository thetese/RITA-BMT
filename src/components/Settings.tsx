// @ts-nocheck
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useConfirm } from './ui/Confirm';
import { useToast } from './ui/Toast';
import StoreManager from './StoreManager';
import DisplayManager from './DisplayManager';

export default function Settings({ theme, toggleTheme }) {
  const { askConfirm } = useConfirm();
  const { showToast } = useToast();
  const [message, setMessage] = useState('');
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  
  const [companyDetails, setCompanyDetails] = useState({
    tin: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    ebmUrl: '',
    cmcKey: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    storeId: 'default-store-id'
  });

  useEffect(() => {
    const fetchPrinters = async () => {
      if (window.api && window.api.getPrinters) {
        try {
          const prts = await window.api.getPrinters();
          setPrinters(prts);
          const savedPrinter = await window.api.getSetting('receiptPrinter');
          if (savedPrinter) setSelectedPrinter(savedPrinter);
          
          const tin = await window.api.getSetting('tin') || '';
          const businessName = await window.api.getSetting('businessName') || '';
          const businessAddress = await window.api.getSetting('businessAddress') || '';
          const businessPhone = await window.api.getSetting('businessPhone') || '';
          const stripeSecretKey = await window.api.getSetting('stripeSecretKey') || '';
          const stripePublishableKey = await window.api.getSetting('stripePublishableKey') || '';
          const receiptPrinter = await window.api.getSetting('receiptPrinter') || '';
          const ebmUrl = await window.api.getSetting('ebmUrl') || 'http://localhost:8080';
          const cmcKey = await window.api.getSetting('cmcKey') || '';
          const supabaseUrl = await window.api.getSetting('supabaseUrl') || '';
          const supabaseAnonKey = await window.api.getSetting('supabaseAnonKey') || '';
          const storeId = await window.api.getSetting('storeId') || 'default-store-id';
          
          setCompanyDetails({ tin, businessName, businessAddress, businessPhone, stripeSecretKey, stripePublishableKey, receiptPrinter, ebmUrl, cmcKey, supabaseUrl, supabaseAnonKey, storeId });
        } catch (e) {
          console.error("Error fetching settings", e);
        }
      }
    };
    fetchPrinters();
  }, []);

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyDetails(prev => ({ ...prev, [name]: value }));
    if (window.api) window.api.setSetting(name, value);
  };

  const handlePrinterChange = (e) => {
    const p = e.target.value;
    setSelectedPrinter(p);
    if (window.api) window.api.setSetting('receiptPrinter', p);
    setMessage('Printer saved');
    setTimeout(() => setMessage(''), 2000);
  };



  const handleBackup = async () => {
    setMessage('Backing up...');
    try {
      const res = await window.api.backupDatabase();
      if (res.success) {
        setMessage('Backup successful!');
      } else {
        setMessage(res.error === 'Cancelled' ? '' : `Error: ${res.error}`);
      }
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePingEbm = async () => {
    setMessage('Pinging VSDC...');
    try {
      if (window.api && window.api.pingEbm) {
        const result = await window.api.pingEbm();
        if (result.success) {
          setMessage(`EBM Connected! Version: ${result.data?.systemVersion || 'Unknown'}`);
        } else {
          setMessage(`EBM Error: ${result.error}`);
        }
      }
    } catch (e) {
      setMessage(`EBM Error: ${e.message}`);
    }
    setTimeout(() => setMessage(''), 4000);
  };

  const handleRestore = async () => {
    if (!await askConfirm('WARNING: Restoring will overwrite all current data. Are you sure?')) return;
    setMessage('Restoring...');
    try {
      const res = await window.api.restoreDatabase();
      if (res.success) {
        alert('Restore successful! The app needs to restart.');
        window.location.reload();
      } else {
        setMessage(res.error === 'Cancelled' ? '' : `Error: ${res.error}`);
      }
    } catch (e) {
      setMessage(`Error: ${e.message}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="settings-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>System Settings</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Appearance</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Choose between Light and Dark mode for the application interface.</p>
        <button className="btn-secondary" onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

      <StoreManager />

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

      <div style={{ marginBottom: '30px' }}>
        <h3>Printer Settings</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Select the default printer for thermal receipts from the POS.</p>
        <select value={selectedPrinter} onChange={handlePrinterChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }}>
          <option value="">Select a printer...</option>
          {printers.map(p => (
            <option key={p.name} value={p.name}>{p.name} {p.isDefault ? '(Default)' : ''}</option>
          ))}
        </select>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

      <div style={{ marginBottom: '30px' }}>
        <h3>Company Details (RRA Configuration)</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Enter the details that will be printed on the receipts.</p>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Business Name *</label>
            <input 
              type="text" name="businessName"
              value={companyDetails.businessName} onChange={handleCompanyChange} 
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Store Code (Cloud ID) *</label>
            <input 
              type="text" name="storeId"
              value={companyDetails.storeId} onChange={handleCompanyChange} 
              placeholder="e.g. MAIN-STORE"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }} 
            />
            <small style={{ color: 'var(--text-secondary)' }}>Used to separate your data from other stores in the cloud web portal.</small>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>TIN Number *</label>
            <input 
              type="text" name="tin"
              value={companyDetails.tin} onChange={handleCompanyChange} 
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Business Address</label>
            <input 
              type="text" name="businessAddress"
              value={companyDetails.businessAddress} onChange={handleCompanyChange} 
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number</label>
            <input 
              type="text" name="businessPhone"
              value={companyDetails.businessPhone} onChange={handleCompanyChange} 
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }} 
            />
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

      <div style={{ marginBottom: '30px' }}>
        <h3>RRA EBM Integration</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Configure the local VSDC for EBM version 2.1 compliance.</p>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Local VSDC URL</label>
            <input 
              type="text" name="ebmUrl"
              value={companyDetails.ebmUrl || ''} onChange={handleCompanyChange} 
              placeholder="http://localhost:8080"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }} 
            />
            <small style={{ color: 'var(--text-secondary)' }}>Leave blank to disable EBM sync.</small>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Communication Key (cmcKey)</label>
            <input 
              type="password" name="cmcKey"
              value={companyDetails.cmcKey || ''} onChange={handleCompanyChange} 
              placeholder="Enter your EBM CMC Key"
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }} 
            />
            <small style={{ color: 'var(--text-secondary)' }}>Required for VSDC API authentication.</small>
          </div>
          <div>
            <button className="btn-secondary" onClick={handlePingEbm}>Ping VSDC</button>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />



      <div style={{ marginBottom: '30px' }}>
        <h3>Stripe Payment Integration</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Enter your Stripe API keys to enable credit card processing.</p>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Stripe Secret Key (sk_...)</label>
            <input 
              type="password" name="stripeSecretKey"
              value={companyDetails.stripeSecretKey || ''} onChange={handleCompanyChange} 
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Stripe Publishable Key (pk_...)</label>
            <input 
              type="text" name="stripePublishableKey"
              value={companyDetails.stripePublishableKey || ''} onChange={handleCompanyChange} 
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }} 
            />
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

      <div style={{ marginBottom: '30px' }}>
        <h3>Hardware Integration</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Configure your Receipt Printer.</p>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Receipt Printer</label>
            <select
              name="receiptPrinter"
              value={companyDetails.receiptPrinter || ''}
              onChange={handleCompanyChange}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }}
            >
              <option value="">-- No Printer / Save to PDF --</option>
              {printers.map(p => (
                <option key={p.name} value={p.name}>{p.name} ({p.displayName || p.name})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

      <div>
        <h3>Data Management</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Backup your database to a USB drive or restore from a previous backup file.</p>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={handleBackup}>Backup Database</button>
          <button className="btn-secondary btn-danger" onClick={handleRestore}>Restore Database</button>
        </div>
        
        {message && <div style={{ marginTop: '12px', color: 'var(--primary)', fontWeight: 600 }}>{message}</div>}
      </div>

      <DisplayManager />
    </div>
  );
}

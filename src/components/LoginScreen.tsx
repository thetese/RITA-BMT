// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './ui/Toast';

export default function LoginScreen({ onLogin }) {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [isSetup, setIsSetup] = useState(false);
  
  // Modes: 'login', 'setup', 'forgot'
  const [mode, setMode] = useState('login'); 
  
  const [form, setForm] = useState({ 
    username: '', 
    password: '',
    securityQuestion: '',
    securityAnswer: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    tin: ''
  });
  
  const [error, setError] = useState('');
  const [masterCodeShown, setMasterCodeShown] = useState('');
  
  // Forgot password state
  const [recoveryUser, setRecoveryUser] = useState(null);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [useMasterCode, setUseMasterCode] = useState(false);
  const [showCashierPin, setShowCashierPin] = useState(false);
  const [cashierPinInput, setCashierPinInput] = useState('');

  useEffect(() => {
    const checkUsers = async () => {
      if (!window.api) return;
      const allUsers = await window.api.getUsers();
      setUsers(allUsers);
      if (allUsers.length === 0) {
        setIsSetup(true);
        setMode('setup');
      }
    };
    checkUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'setup') {
        if (form.password.length < 4) {
          setError("Password too short");
          return;
        }
        if (!form.securityQuestion || !form.securityAnswer) {
          setError("Please provide a security question and answer");
          return;
        }
        if (!form.businessName || !form.tin) {
          setError("Please provide Business Name and TIN");
          return;
        }

        // Save company settings
        await window.api.setSetting('businessName', form.businessName);
        await window.api.setSetting('businessAddress', form.businessAddress);
        await window.api.setSetting('businessPhone', form.businessPhone);
        await window.api.setSetting('tin', form.tin);

        const newUser = await window.api.addUser({
          username: form.username,
          passwordHash: form.password,
          role: 'Admin',
          securityQuestion: form.securityQuestion,
          securityAnswer: form.securityAnswer
        });

        const mCode = 'RITA-' + uuidv4().substring(0, 8).toUpperCase();
        await window.api.setSetting('masterRecoveryCode', mCode);
        
        setMasterCodeShown(mCode);
        // We do not immediately log in, we wait for them to acknowledge the master code
      } else if (mode === 'login') {
        const user = await window.api.login(form.username, form.password);
        if (user) {
          onLogin(user);
        } else {
          setError("Invalid username or password");
        }
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred: " + err.message);
    }
  };

  const handleAcknowledgeCode = async () => {
    // Log the user in now that they saw the code
    const user = await window.api.getUserByUsername(form.username);
    onLogin(user);
  };

  const handleCashierLogin = async () => {
    const configuredPin = await window.api.getSetting('cashierPin');
    if (configuredPin && cashierPinInput !== configuredPin) {
      setError("Invalid Cashier PIN.");
      return;
    }
    onLogin({ id: 'cashier', username: 'General Cashier', role: 'Cashier' });
  };

  const handleStartPosClick = async () => {
    const configuredPin = await window.api.getSetting('cashierPin');
    if (configuredPin) {
      setShowCashierPin(true);
    } else {
      // If no PIN is set, instantly login
      onLogin({ id: 'cashier', username: 'General Cashier', role: 'Cashier' });
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!recoveryUser) {
      // Step 1: Check username
      const user = await window.api.getUserByUsername(form.username);
      if (user) {
        setRecoveryUser(user);
      } else {
        setError("User not found.");
      }
      return;
    }

    // Step 2: Verify answer or master code and reset password
    if (newPassword.length < 4) {
      setError("New password is too short.");
      return;
    }

    if (useMasterCode) {
      const savedCode = await window.api.getSetting('masterRecoveryCode');
      if (recoveryAnswer.trim() !== savedCode) {
        setError("Invalid Master Recovery Code.");
        return;
      }
    } else {
      if (!recoveryUser.securityAnswer || recoveryAnswer.trim().toLowerCase() !== recoveryUser.securityAnswer.trim().toLowerCase()) {
        setError("Incorrect security answer.");
        return;
      }
    }

    // Success! Update password
    try {
      await window.api.updateUser({
        ...recoveryUser,
        passwordHash: newPassword
      });
      showToast("Password has been reset successfully. Please log in.", "success");
      setMode('login');
      setRecoveryUser(null);
      setRecoveryAnswer('');
      setNewPassword('');
      setForm({ username: '', password: '', securityQuestion: '', securityAnswer: '' });
    } catch (err) {
      setError("Error resetting password: " + err.message);
    }
  };

  if (masterCodeShown) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h2>Master Recovery Code</h2>
          <p style={{ color: 'var(--danger)', fontWeight: 'bold' }}>IMPORTANT: Save this code now!</p>
          <p style={{ color: 'var(--text-secondary)' }}>This code can be used to reset the Admin password if you forget it. It will not be shown again.</p>
          <div style={{ background: '#f4f4f5', color: '#18181b', padding: '15px', borderRadius: '8px', fontSize: '1.5rem', fontWeight: 'bold', margin: '20px 0', letterSpacing: '2px' }}>
            {masterCodeShown}
          </div>
          <button className="btn-primary" onClick={handleAcknowledgeCode} style={{ width: '100%' }}>
            I Have Saved The Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <img src="./logo.png" alt="Rita Logo" style={{ height: '80px', objectFit: 'contain', marginBottom: '20px' }} />
        
        {mode === 'setup' && (
          <>
            <h2>Initial Setup</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create the Master Admin account.</p>
            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <div className="form-row">
                <label>Username</label>
                <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
              </div>
              <div className="form-row">
                <label>Password</label>
                <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <div className="form-row">
                <label>Security Question (for recovery)</label>
                <input type="text" required placeholder="e.g. What is your pet's name?" value={form.securityQuestion} onChange={e => setForm({...form, securityQuestion: e.target.value})} />
              </div>
              <div className="form-row">
                <label>Security Answer</label>
                <input type="text" required value={form.securityAnswer} onChange={e => setForm({...form, securityAnswer: e.target.value})} />
              </div>
              
              <div style={{ margin: '20px 0', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '15px' }}>Company Details (For Receipts)</h3>
                <div className="form-row">
                  <label>Business Name *</label>
                  <input type="text" required value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} />
                </div>
                <div className="form-row">
                  <label>TIN Number *</label>
                  <input type="text" required value={form.tin} onChange={e => setForm({...form, tin: e.target.value})} />
                </div>
                <div className="form-row">
                  <label>Business Address</label>
                  <input type="text" value={form.businessAddress} onChange={e => setForm({...form, businessAddress: e.target.value})} />
                </div>
                <div className="form-row">
                  <label>Phone Number</label>
                  <input type="text" value={form.businessPhone} onChange={e => setForm({...form, businessPhone: e.target.value})} />
                </div>
              </div>

              {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</div>}
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Complete Setup</button>
            </form>
          </>
        )}

        {mode === 'login' && (
          <>
            <h2>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please log in to continue.</p>
            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <div className="form-row">
                <label>Username</label>
                <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="e.g. admin" />
              </div>
              <div className="form-row">
                <label>Password</label>
                <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="****" />
              </div>
              {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</div>}
              {showCashierPin ? (
                <div style={{ background: 'rgba(0,0,0,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <label>Enter Cashier PIN</label>
                  <input 
                    type="password" 
                    value={cashierPinInput} 
                    onChange={e => setCashierPinInput(e.target.value)} 
                    placeholder="****" 
                    style={{ marginBottom: '10px' }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowCashierPin(false)}>Cancel</button>
                    <button type="button" className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--success)' }} onClick={handleCashierLogin}>Unlock POS</button>
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ width: '100%', marginBottom: '15px', padding: '14px', fontSize: '1.1rem', backgroundColor: 'var(--success)' }} 
                  onClick={handleStartPosClick}
                >
                  Start POS (General Cashier)
                </button>
              )}

              <div style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                &mdash; OR &mdash;
              </div>

              <button type="submit" className="btn-secondary" style={{ width: '100%', marginBottom: '10px' }}>Login as Admin</button>
              
              <div style={{ textAlign: 'center' }}>
                <button type="button" className="btn-sm" style={{ background: 'transparent', color: 'var(--primary-color)', border: 'none', cursor: 'pointer' }} onClick={() => { setMode('forgot'); setError(''); setRecoveryUser(null); }}>
                  Forgot Password?
                </button>
              </div>
            </form>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h2>Recover Password</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Reset your credentials.</p>
            <form onSubmit={handleForgotSubmit} style={{ textAlign: 'left' }}>
              {!recoveryUser ? (
                <>
                  <div className="form-row">
                    <label>Username</label>
                    <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
                  </div>
                  {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</div>}
                  <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '10px' }}>Continue</button>
                </>
              ) : (
                <>
                  <div className="form-row" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                      <input type="checkbox" checked={useMasterCode} onChange={(e) => setUseMasterCode(e.target.checked)} style={{ width: 'auto' }} />
                      Use Master Recovery Code instead
                    </label>
                  </div>

                  <div className="form-row">
                    <label>{useMasterCode ? 'Master Recovery Code' : `Security Question: ${recoveryUser.securityQuestion}`}</label>
                    <input type="text" required value={recoveryAnswer} onChange={e => setRecoveryAnswer(e.target.value)} placeholder={useMasterCode ? 'RITA-...' : 'Your answer...'} />
                  </div>
                  <div className="form-row">
                    <label>New Password</label>
                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</div>}
                  <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '10px' }}>Reset Password</button>
                </>
              )}
              
              <div style={{ textAlign: 'center' }}>
                <button type="button" className="btn-sm" style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }} onClick={() => { setMode('login'); setError(''); }}>
                  Back to Login
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  Target, 
  Briefcase, 
  Users, 
  LineChart, 
  PackageSearch,
  Search,
  ChevronDown,
  ChevronRight,
  Star,
  ShoppingCart,
  ConciergeBell,
  Users2,
  ClipboardList,
  Warehouse,
  UserCircle,
  Database,
  LogOut,
  Moon,
  Sun,
  KeyRound,
  Lock,
  ShieldQuestion,
  X,
  Eye,
  EyeOff,
  Check,
  Upload,
  Settings2,
  Printer
} from 'lucide-react';
import './AppSwitcher.css';

function AccountSettingsModal({ currentUser, onClose }) {
  const [activeTab, setActiveTab] = useState<'password' | 'pin' | 'security'>('password');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // PIN field
  const [newPin, setNewPin] = useState('');

  // Security fields
  const [securityQuestion, setSecurityQuestion] = useState(currentUser?.securityQuestion || '');
  const [securityAnswer, setSecurityAnswer] = useState('');

  const clearMessage = () => setTimeout(() => setMessage(null), 3000);

  const handleChangePassword = async () => {
    if (!currentPassword) { setMessage({ type: 'error', text: 'Enter your current password' }); clearMessage(); return; }
    if (newPassword.length < 4) { setMessage({ type: 'error', text: 'New password must be at least 4 characters' }); clearMessage(); return; }
    if (newPassword !== confirmPassword) { setMessage({ type: 'error', text: 'Passwords do not match' }); clearMessage(); return; }

    setSaving(true);
    try {
      // Verify current password
      const verified = await (window as any).api.login(currentUser.username, currentPassword);
      if (!verified) {
        setMessage({ type: 'error', text: 'Current password is incorrect' });
        clearMessage();
        setSaving(false);
        return;
      }
      await (window as any).api.updateUser({ id: currentUser.id, username: currentUser.username, role: currentUser.role, passwordHash: newPassword, pin: currentUser.pin || '', securityQuestion: currentUser.securityQuestion || '', securityAnswer: currentUser.securityAnswer || '' }, currentUser.id);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      clearMessage();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update password' });
      clearMessage();
    }
    setSaving(false);
  };

  const handleChangePin = async () => {
    if (newPin.length < 4) { setMessage({ type: 'error', text: 'PIN must be at least 4 digits' }); clearMessage(); return; }
    setSaving(true);
    try {
      await (window as any).api.updateUser({ id: currentUser.id, username: currentUser.username, role: currentUser.role, pin: newPin, securityQuestion: currentUser.securityQuestion || '', securityAnswer: currentUser.securityAnswer || '' }, currentUser.id);
      setMessage({ type: 'success', text: 'PIN updated successfully!' });
      setNewPin('');
      clearMessage();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update PIN' });
      clearMessage();
    }
    setSaving(false);
  };

  const handleChangeSecurity = async () => {
    if (!securityQuestion.trim()) { setMessage({ type: 'error', text: 'Enter a security question' }); clearMessage(); return; }
    if (!securityAnswer.trim()) { setMessage({ type: 'error', text: 'Enter a security answer' }); clearMessage(); return; }
    setSaving(true);
    try {
      await (window as any).api.updateUser({ id: currentUser.id, username: currentUser.username, role: currentUser.role, pin: currentUser.pin || '', securityQuestion, securityAnswer }, currentUser.id);
      setMessage({ type: 'success', text: 'Security question updated!' });
      setSecurityAnswer('');
      clearMessage();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update' });
      clearMessage();
    }
    setSaving(false);
  };

  const tabs = [
    { key: 'password' as const, label: 'Password', icon: <Lock size={16} /> },
    { key: 'pin' as const, label: 'PIN', icon: <KeyRound size={16} /> },
    { key: 'security' as const, label: 'Security', icon: <ShieldQuestion size={16} /> },
  ];

  return (
    <div className="as-modal-overlay" onClick={onClose}>
      <div className="as-modal" onClick={(e) => e.stopPropagation()}>
        <div className="as-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="as-avatar" style={{ width: 42, height: 42, fontSize: '1rem' }}>
              {currentUser?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Account Settings</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{currentUser?.username} · {currentUser?.role}</p>
            </div>
          </div>
          <button className="as-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="as-modal-tabs">
          {tabs.map(t => (
            <button key={t.key} className={`as-modal-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => { setActiveTab(t.key); setMessage(null); }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {message && (
          <div className={`as-modal-message ${message.type}`}>
            {message.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {message.text}
          </div>
        )}

        <div className="as-modal-body">
          {activeTab === 'password' && (
            <>
              <div className="as-field">
                <label>Current Password</label>
                <div className="as-field-input-wrap">
                  <input type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                  <button className="as-field-eye" onClick={() => setShowCurrentPw(!showCurrentPw)}>{showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div className="as-field">
                <label>New Password</label>
                <div className="as-field-input-wrap">
                  <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
                  <button className="as-field-eye" onClick={() => setShowNewPw(!showNewPw)}>{showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div className="as-field">
                <label>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
              </div>
              <button className="as-modal-save" onClick={handleChangePassword} disabled={saving}>
                {saving ? 'Saving...' : 'Update Password'}
              </button>
            </>
          )}

          {activeTab === 'pin' && (
            <>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 16 }}>Your PIN is used for quick access and shift operations.</p>
              <div className="as-field">
                <label>New PIN</label>
                <input type="password" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} placeholder="Enter new PIN (4+ digits)" maxLength={8} />
              </div>
              <button className="as-modal-save" onClick={handleChangePin} disabled={saving}>
                {saving ? 'Saving...' : 'Update PIN'}
              </button>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 16 }}>Used to recover your account if you forget your password.</p>
              <div className="as-field">
                <label>Security Question</label>
                <input type="text" value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)} placeholder="e.g. What is your pet's name?" />
              </div>
              <div className="as-field">
                <label>Security Answer</label>
                <input type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} placeholder="Enter your answer" />
              </div>
              <button className="as-modal-save" onClick={handleChangeSecurity} disabled={saving}>
                {saving ? 'Saving...' : 'Update Security Question'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useStoreLocation } from '../context/StoreContext';
import StoreManager from './StoreManager';

export default function AppSwitcher({ setCurrentModule, currentUser, onLogout, toggleTheme, theme, setPage }) {
  const { currentStore, setCurrentStore, availableStores } = useStoreLocation();
  const isAdmin = currentUser?.role === 'Admin';
  const isSales = currentUser?.role === 'Sales';
  const isWorker = currentUser?.role === 'Worker';
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showStoreManager, setShowStoreManager] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const storeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (storeDropdownRef.current && !storeDropdownRef.current.contains(e.target as Node)) {
        setShowStoreDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [apps, setApps] = useState<any[]>([]);

  const fetchModules = async () => {
    try {
      const modules = await (window as any).api.getInstalledModules();
      
      // Map string icons back to JSX and check visibility
      const mappedModules = modules.map((mod: any) => {
        let IconComp = ShoppingBag;
        let WatermarkComp = ShoppingCart;
        
        if (mod.icon === 'UtensilsCrossed' || mod.icon === 'Utensils') IconComp = UtensilsCrossed;
        else if (mod.icon === 'Target') IconComp = Target;
        else if (mod.icon === 'Briefcase' || mod.icon === 'FolderKanban') IconComp = Briefcase;
        else if (mod.icon === 'PackageSearch' || mod.icon === 'Package') IconComp = PackageSearch;
        else if (mod.icon === 'Users') IconComp = Users;
        else if (mod.icon === 'LineChart' || mod.icon === 'Landmark') IconComp = LineChart;
        else if (mod.icon === 'Printer') IconComp = Printer;
        
        if (mod.watermark === 'ConciergeBell') WatermarkComp = ConciergeBell;
        else if (mod.watermark === 'Users2') WatermarkComp = Users2;
        else if (mod.watermark === 'ClipboardList') WatermarkComp = ClipboardList;
        else if (mod.watermark === 'Warehouse') WatermarkComp = Warehouse;
        else if (mod.watermark === 'UserCircle') WatermarkComp = UserCircle;
        else if (mod.watermark === 'Database') WatermarkComp = Database;

        // Check permissions
        const hasPermission = isAdmin || (mod.roles && mod.roles.includes(currentUser?.role));

        return {
          ...mod,
          icon: <IconComp size={24} />,
          watermark: <WatermarkComp size={80} strokeWidth={1} />,
          visible: hasPermission
        };
      });
      
      setApps(mappedModules);
    } catch (err) {
      console.error("Failed to load modules:", err);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [currentUser]);

  const handleInstallPlugin = async () => {
    try {
      const res = await (window as any).api.installPluginZip();
      if (res.success) {
        alert(res.message);
        fetchModules();
      } else if (res.error !== 'Cancelled') {
        alert('Error installing plugin: ' + res.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const visibleApps = apps
    .filter(app => app.visible)
    .filter(app => search === '' || app.name.toLowerCase().includes(search.toLowerCase()));
  
  const initials = currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : 'ME';

  return (
    <div className="app-switcher-page">
      {/* Top Navbar */}
      <div className="as-navbar">
        <div className="as-logo-container">
          <img src="/logo.png" alt="Rita" style={{ height: '36px', width: 'auto' }} />
          <div className="as-logo-text">Rita BMT</div>
        </div>
        
        <div className="as-nav-right">
          {/* Branch Selector (Admins Only) */}
          {isAdmin && (
            <div ref={storeDropdownRef} style={{ position: 'relative', marginRight: '15px' }}>
              <button 
                onClick={() => setShowStoreDropdown(!showStoreDropdown)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                  padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                  color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem'
                }}
              >
                <Warehouse size={16} />
                {currentStore?.name || 'All Branches'}
                <ChevronDown size={14} style={{ opacity: 0.7 }} />
              </button>
              
              {showStoreDropdown && (
                <div className="as-dropdown" style={{ right: 0, top: '100%', marginTop: '8px', minWidth: '200px' }}>
                  <div className="as-dropdown-header" style={{ padding: '10px 15px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Select Branch</div>
                  </div>
                  <div className="as-dropdown-divider" style={{ margin: 0 }}></div>
                  <button 
                    className="as-dropdown-item" 
                    onClick={() => { setCurrentStore({ id: 'ALL', name: 'All Branches', address: '', phone: '' }); setShowStoreDropdown(false); }}
                    style={{ fontWeight: currentStore?.id === 'ALL' ? 'bold' : 'normal', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    All Branches
                    {currentStore?.id === 'ALL' && <Check size={16} color="var(--primary)" />}
                  </button>
                  {availableStores.map(store => (
                    <button 
                      key={store.id}
                      className="as-dropdown-item" 
                      onClick={() => { setCurrentStore(store); setShowStoreDropdown(false); }}
                      style={{ fontWeight: currentStore?.id === store.id ? 'bold' : 'normal', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      {store.name}
                      {currentStore?.id === store.id && <Check size={16} color="var(--primary)" />}
                    </button>
                  ))}
                  <div className="as-dropdown-divider" style={{ margin: 0 }}></div>
                  <button 
                    className="as-dropdown-item" 
                    onClick={() => { setShowStoreManager(true); setShowStoreDropdown(false); }}
                    style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Settings2 size={16} /> Manage Branches
                  </button>
                </div>
              )}
            </div>
          )}

          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <div className="as-user-profile" onClick={() => setShowDropdown(!showDropdown)}>
              <div className="as-avatar">{initials}</div>
              <div className="as-user-info">
                <span className="as-user-name">{currentUser?.username || 'Admin'}</span>
                <span className="as-user-role">{currentUser?.role || 'Admin'}</span>
              </div>
              <ChevronDown size={16} color="#64748b" style={{ transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'none' }} />
            </div>

          {showDropdown && (
            <div className="as-dropdown">
              <div className="as-dropdown-header">
                <div className="as-avatar" style={{ width: 42, height: 42, fontSize: '1rem' }}>{initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentUser?.username}</div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{currentUser?.role}</div>
                </div>
              </div>
              <div className="as-dropdown-divider"></div>
              <button className="as-dropdown-item" onClick={() => { setShowAccountSettings(true); setShowDropdown(false); }}>
                <KeyRound size={16} />
                Account Settings
              </button>
              <button className="as-dropdown-item" onClick={() => { toggleTheme?.(); setShowDropdown(false); }}>
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>
              <div className="as-dropdown-divider"></div>
              <button className="as-dropdown-item as-dropdown-danger" onClick={() => { onLogout?.(); setShowDropdown(false); }}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Main Content */}
      <div className="app-switcher-main">
        <div className="as-header">
          <div>
            <h1 className="as-title">Apps</h1>
            <p className="as-subtitle">Select a module to continue</p>
            <div className="as-underline"></div>
          </div>
          
          <div className="as-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {isAdmin && (
              <button 
                className="btn-install-plugin"
                onClick={handleInstallPlugin}
              >
                <Upload size={16} />
                Install Plugin
              </button>
            )}
            <div className="as-search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search modules..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="as-apps-grid">
          {visibleApps.map(app => (
            <div 
              key={app.id} 
              className="as-app-card"
              style={{ 
                background: app.gradient,
                '--app-shadow': `${app.iconBg}4d`
              } as React.CSSProperties}
              onClick={() => {
                setCurrentModule(app);
                if (app.id === 'service') {
                  setPage('crm');
                } else if (app.id === 'projects') {
                  setPage('management_dash');
                } else if (app.id === 'hr') {
                  setPage('customers');
                } else if (app.id === 'finance') {
                  setPage('reports');
                } else {
                  setPage('dashboard');
                }
              }}
            >
              {app.watermark && (
                <div className="as-card-watermark">
                  {app.watermark}
                </div>
              )}
              <div className="as-app-card-content">
                <div className="as-app-card-header">
                  <div className="as-app-icon-container" style={{ background: app.iconBg }}>
                    {app.icon}
                  </div>
                  <h3 className="as-app-title">{app.name}</h3>
                </div>
                <p className="as-app-desc">{app.desc}</p>
                <div className="as-app-arrow" style={{ background: app.iconBg }}>
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="as-banner">
          <div className="as-banner-left">
            <div className="as-banner-icon">
              <Star size={22} strokeWidth={2.5} />
            </div>
            <div className="as-banner-text">
              <h3>All your business tools. One powerful platform.</h3>
              <p>Seamlessly manage your operations from one place.</p>
            </div>
          </div>
        </div>
      </div>

      {showAccountSettings && (
        <AccountSettingsModal currentUser={currentUser} onClose={() => setShowAccountSettings(false)} />
      )}

      {showStoreManager && (
        <div className="as-modal-overlay" onClick={() => setShowStoreManager(false)}>
          <div className="as-modal" onClick={e => e.stopPropagation()} style={{ width: '800px', maxWidth: '90vw' }}>
            <div className="as-modal-header" style={{ paddingBottom: 0, borderBottom: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Manage Branches</h2>
              </div>
              <button className="as-modal-close" onClick={() => setShowStoreManager(false)}><X size={20} /></button>
            </div>
            <div className="as-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <StoreManager />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

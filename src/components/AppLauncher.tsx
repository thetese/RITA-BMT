import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  PackageSearch, 
  LineChart, 
  Users, 
  Settings2,
  Receipt,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useConfigStore } from '../store/useConfigStore';

export default function AppLauncher() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();
  const { businessType } = useConfigStore();

  const apps = [
    {
      id: 'pos',
      name: 'Point of Sale',
      icon: <Store size={48} />,
      color: 'var(--primary)',
      path: businessType === 'restaurant' ? '/restaurant' : '/retail',
      description: 'Process sales and manage the cash register.'
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: <PackageSearch size={48} />,
      color: '#10b981',
      path: '/products',
      description: 'Track stock, variants, and purchase orders.'
    },
    {
      id: 'finance',
      name: 'Finance & Analytics',
      icon: <LineChart size={48} />,
      color: '#f59e0b',
      path: '/dashboard',
      description: 'Dashboards, P&L, and expense tracking.',
      adminOnly: true
    },
    {
      id: 'crm',
      name: 'Customers & CRM',
      icon: <Users size={48} />,
      color: '#06b6d4',
      path: '/customers',
      description: 'Manage customers and loyalty programs.'
    },
    {
      id: 'hr',
      name: 'Human Resources',
      icon: <FileText size={48} />,
      color: '#ec4899',
      path: '/timecards',
      description: 'Employee timecards, payroll, and shifts.'
    },
    {
      id: 'settings',
      name: 'Administration',
      icon: <Settings2 size={48} />,
      color: '#64748b',
      path: '/settings',
      description: 'System configurations and hardware.',
      adminOnly: true
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-color)',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Welcome back, {currentUser?.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0' }}>
              Select an app to continue managing your business.
            </p>
          </div>
          <button 
            onClick={logout}
            className="ui-btn ui-btn-ghost"
          >
            Logout
          </button>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {apps.map(app => {
            if (app.adminOnly && currentUser?.role?.toLowerCase() !== 'admin') return null;
            
            return (
              <div 
                key={app.id}
                onClick={() => navigate(app.path)}
                style={{
                  background: 'var(--card-bg)',
                  borderRadius: '16px',
                  padding: '32px 24px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = app.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <div style={{ 
                  background: `${app.color}15`, 
                  color: app.color,
                  padding: '16px',
                  borderRadius: '12px',
                  display: 'inline-flex'
                }}>
                  {app.icon}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    {app.name}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {app.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

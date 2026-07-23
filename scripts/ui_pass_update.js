const fs = require('fs');

const write = (file, content) => fs.writeFileSync(file, content.trimStart(), 'utf8');
const read = (file) => fs.readFileSync(file, 'utf8');
const replace = (file, from, to) => {
  const current = read(file);
  if (!current.includes(from)) {
    throw new Error(`Expected snippet not found in ${file}`);
  }
  fs.writeFileSync(file, current.replace(from, to), 'utf8');
};

write('src/components/ui/DesignSystem.tsx', `
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
};

export function Button({ variant = 'secondary', size = 'md', icon, children, className = '', ...props }: ButtonProps) {
  return (
    <button className={\`ui-btn ui-btn-\${variant} ui-btn-\${size} \${className}\`.trim()} {...props}>
      {icon && <span className="ui-btn-icon">{icon}</span>}
      {children && <span className="ui-btn-label">{children}</span>}
    </button>
  );
}

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  actions?: React.ReactNode;
  compact?: boolean;
};

export function Panel({ title, actions, compact = false, className = '', children, ...props }: PanelProps) {
  return (
    <section className={\`ui-panel \${compact ? 'ui-panel-compact' : ''} \${className}\`.trim()} {...props}>
      {(title || actions) && (
        <div className="ui-panel-header">
          {title && <h2>{title}</h2>}
          {actions && <div className="ui-panel-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

type FieldProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export function Field({ label, hint, children, className = '', ...props }: FieldProps) {
  return (
    <label className={\`ui-field \${className}\`.trim()} {...props}>
      <span className="ui-field-label">{label}</span>
      {children}
      {hint && <span className="ui-field-hint">{hint}</span>}
    </label>
  );
}

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'primary';

export function Badge({ tone = 'neutral', children, className = '' }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return <span className={\`ui-badge ui-badge-\${tone} \${className}\`.trim()}>{children}</span>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="ui-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="ui-page-actions">{actions}</div>}
    </header>
  );
}

export function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="ui-segmented" role="tablist">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={value === option.value ? 'active' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
`);

write('src/components/ui/Modal.tsx', `
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './DesignSystem';

export default function Modal({ title, children, onClose, isOpen, size = 'md' }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        ).filter((el: any) => !el.disabled);
        if (focusable.length === 0) return;

        const first: any = focusable[0];
        const last: any = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.classList.add('modal-open');
      setTimeout(() => {
        if (!modalRef.current) return;
        const firstInput = modalRef.current.querySelector('input, textarea, select, button');
        if (firstInput) firstInput.focus();
      }, 50);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={'modal-content modal-' + size}
        onClick={e => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <Button variant="ghost" size="sm" icon={<X size={18} />} onClick={onClose} aria-label="Close" />
        </div>
        {children}
      </div>
    </div>
  );
}
`);

write('src/components/ui/Confirm.tsx', `
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Modal from './Modal';
import { Button } from './DesignSystem';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const resolverRef = useRef(null);

  const askConfirm = useCallback((msg) => {
    return new Promise((resolve) => {
      setMessage(msg);
      setIsOpen(true);
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    if (resolverRef.current) resolverRef.current(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolverRef.current) resolverRef.current(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ askConfirm }}>
      {children}
      <Modal title="Confirmation" isOpen={isOpen} onClose={handleCancel}>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirm}>Confirm</Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
};
`);

write('src/components/ui/POSLayout.tsx', `
import React from 'react';

export default function POSLayout({ leftPanel, rightPanel }) {
  return (
    <div className="pos-container">
      <div className="pos-panel pos-products-panel">
        {leftPanel}
      </div>
      <div className="pos-panel pos-cart-panel">
        {rightPanel}
      </div>
    </div>
  );
}
`);

write('src/components/ui/CartItem.tsx', `
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { formatMoney } from '../../utils/format';
import { Badge } from './DesignSystem';

const statusTone: Record<string, 'neutral' | 'success' | 'warning'> = {
  preparing: 'warning',
  ready: 'success',
  pending: 'neutral'
};

const CartItem = React.memo(({ item, dcAmt, onUpdateQuantity, onUpdateDiscount }: any) => {
  return (
    <div className="pos-cart-item">
      <div className="pos-cart-item-main">
        <div className="pos-cart-item-copy">
          <div className="pos-cart-item-title">
            {item.productName}
            {item.status && <Badge tone={statusTone[item.status] || 'neutral'}>{item.status}</Badge>}
          </div>
          <div className="pos-cart-item-meta">
            {formatMoney(item.unitPrice)} FRW
            {dcAmt > 0 && <span className="pos-cart-discount">-{formatMoney(dcAmt)}</span>}
          </div>
        </div>

        <div className="pos-qty-control" aria-label={'Quantity for ' + item.productName}>
          <button type="button" onClick={() => onUpdateQuantity(item.productId, -1)} className="pos-qty-btn" aria-label="Decrease quantity">
            <Minus size={16} />
          </button>
          <span>{item.quantity}</span>
          <button type="button" onClick={() => onUpdateQuantity(item.productId, 1)} className="pos-qty-btn plus" aria-label="Increase quantity">
            <Plus size={16} />
          </button>
        </div>
      </div>
      <label className="pos-discount-field">
        <span>Discount</span>
        <input
          type="text"
          placeholder="% or FRW"
          value={item.discount}
          onChange={e => onUpdateDiscount(item.productId, e.target.value)}
        />
      </label>
    </div>
  );
});

export default CartItem;
`);

replace(
  'src/App.tsx',
  "        <div \n          className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}\n          onMouseEnter={() => setIsSidebarCollapsed(false)}\n          onMouseLeave={() => setIsSidebarCollapsed(true)}\n        >",
  "        <div className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>"
);

replace(
  'src/App.tsx',
  "            </div>\n          {!isSidebarCollapsed && (",
  "            </div>\n            <button\n              type=\"button\"\n              className=\"sidebar-collapse-btn\"\n              onClick={() => setIsSidebarCollapsed(v => !v)}\n              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}\n              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}\n            >\n              {isSidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}\n            </button>\n          {!isSidebarCollapsed && ("
);

replace(
  'src/components/Dashboard.tsx',
  "import { Sparkles, AlertTriangle, FileDown, Printer, Bot } from 'lucide-react';",
  "import { AlertTriangle, FileDown, Printer, Bot, LayoutDashboard, BarChart3, PackageSearch } from 'lucide-react';"
);

replace(
  'src/components/Dashboard.tsx',
  "import { useToast } from './ui/Toast';",
  "import { useToast } from './ui/Toast';\nimport { PageHeader, SegmentedControl } from './ui/DesignSystem';"
);

replace(
  'src/components/Dashboard.tsx',
  "  const [products, setProducts] = useState([]);\n  const [monthlyTarget, setMonthlyTarget] = useState(1000000); // 1M default",
  "  const [products, setProducts] = useState([]);\n  const [dashboardView, setDashboardView] = useState('overview');\n  const [monthlyTarget, setMonthlyTarget] = useState(1000000); // 1M default"
);

replace(
  'src/components/Dashboard.tsx',
  "    <div className=\"dashboard\">\n      <div className=\"filter-bar\">",
  "    <div className=\"dashboard\">\n      <PageHeader title=\"Dashboard\" subtitle=\"A focused view of sales, reports, and inventory risk.\" />\n      <div className=\"filter-bar dashboard-filter-bar\">"
);

replace(
  'src/components/Dashboard.tsx',
  "      </div>\n\n\n      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', marginBottom: '24px' }}>",
  "      </div>\n\n      <SegmentedControl\n        value={dashboardView}\n        onChange={setDashboardView}\n        options={[\n          { value: 'overview', label: 'Today', icon: <LayoutDashboard size={16} /> },\n          { value: 'reports', label: 'Reports', icon: <BarChart3 size={16} /> },\n          { value: 'inventory', label: 'Inventory', icon: <PackageSearch size={16} /> }\n        ]}\n      />\n\n      <div style={{ display: dashboardView === 'overview' ? 'grid' : 'none', gridTemplateColumns: '1fr 300px', gap: '20px', marginBottom: '24px' }}>"
);

replace(
  'src/components/Dashboard.tsx',
  "        <div className=\"card\" style={{ borderLeft: '4px solid var(--danger)', backgroundColor: 'var(--danger-hover)' }}>",
  "        <div className=\"card\" style={{ display: dashboardView === 'inventory' ? 'block' : 'none', borderLeft: '4px solid var(--danger)', backgroundColor: 'var(--danger-hover)' }}>"
);

replace(
  'src/components/Dashboard.tsx',
  "        <div className=\"card\" style={{ borderLeft: '4px solid #f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.05)', marginBottom: '24px' }}>",
  "        <div className=\"card\" style={{ display: dashboardView === 'inventory' ? 'block' : 'none', borderLeft: '4px solid #f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.05)', marginBottom: '24px' }}>"
);

replace(
  'src/components/Dashboard.tsx',
  "      <div className=\"charts\">",
  "      <div className={dashboardView === 'reports' ? 'charts' : 'charts is-hidden'}>"
);

const cssFile = 'src/styles/App.css';
const css = read(cssFile);
const marker = '/* Codex UI polish pass */';
if (!css.includes(marker)) {
  fs.appendFileSync(cssFile, `

${marker}
:root {
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --surface-border: 1px solid var(--border-color);
}

.is-hidden { display: none !important; }
.modal-open { overflow: hidden; }

.ui-page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}
.ui-page-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.7rem;
  line-height: 1.2;
}
.ui-page-header p {
  margin-top: 4px;
  color: var(--text-secondary);
  max-width: 680px;
}

.ui-btn {
  min-height: 40px;
  border-radius: var(--radius-md);
  border: var(--surface-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease, transform 0.16s ease;
}
.ui-btn-sm { min-height: 34px; padding: 6px 10px; font-size: 0.85rem; }
.ui-btn-md { padding: 10px 16px; font-size: 0.95rem; }
.ui-btn-lg { min-height: 48px; padding: 12px 20px; font-size: 1rem; }
.ui-btn-primary { background: var(--primary); border-color: var(--primary); color: #fff; }
.ui-btn-secondary { background: var(--card-bg); color: var(--text-primary); }
.ui-btn-danger { background: var(--danger); border-color: var(--danger); color: #fff; }
.ui-btn-ghost { background: transparent; color: var(--text-primary); border-color: transparent; }
.ui-btn:hover { transform: translateY(-1px); }
.ui-btn:disabled { cursor: not-allowed; opacity: 0.55; transform: none; }
.ui-btn-icon { display: inline-flex; align-items: center; }

.ui-panel,
.modal-content {
  background: var(--card-bg);
  border: var(--surface-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
.ui-panel { padding: 20px; margin-bottom: 20px; }
.ui-panel-compact { padding: 14px; }
.ui-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.ui-panel-header h2 { margin: 0; font-size: 1.05rem; }

.ui-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ui-field-label {
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}
.ui-field-hint {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.ui-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}
.ui-badge-neutral { background: var(--hover-bg); color: var(--text-secondary); }
.ui-badge-success { background: rgba(16, 185, 129, 0.14); color: var(--success); }
.ui-badge-warning { background: rgba(245, 158, 11, 0.16); color: #b45309; }
.ui-badge-danger { background: rgba(239, 68, 68, 0.14); color: var(--danger); }
.ui-badge-primary { background: rgba(79, 70, 229, 0.12); color: var(--primary); }

.ui-segmented {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  margin-bottom: 20px;
  background: var(--hover-bg);
  border: var(--surface-border);
  border-radius: var(--radius-lg);
}
.ui-segmented button {
  min-height: 38px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  padding: 8px 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 800;
}
.ui-segmented button.active {
  background: var(--card-bg);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.modal-overlay {
  background: rgba(15, 23, 42, 0.52);
  backdrop-filter: blur(4px);
}
.modal-content {
  width: min(92vw, 620px);
  max-height: 88vh;
  overflow-y: auto;
  padding: 20px;
  animation: scaleUp 0.18s ease;
}
.modal-sm { width: min(92vw, 420px); }
.modal-lg { width: min(94vw, 860px); }
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.modal-header h2 { margin: 0; font-size: 1.15rem; }
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.confirm-message {
  color: var(--text-primary);
  font-size: 1rem;
  margin: 0;
}

.sidebar-collapse-btn {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: var(--radius-md);
  background: rgba(255,255,255,0.08);
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sidebar-collapse-btn:hover { background: rgba(255,255,255,0.16); }

.card, .chart-box, .sales-form, .sales-list, .reports, .grid-form-container, .settings-panel {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.card:hover {
  transform: none;
  box-shadow: var(--shadow-md);
}

.dashboard-filter-bar {
  padding: 12px;
  border: var(--surface-border);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
}

.pos-container {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
  height: calc(100vh - 64px) !important;
  gap: 16px !important;
  padding: 16px !important;
  box-sizing: border-box;
}
.pos-panel {
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: var(--surface-border);
  box-shadow: var(--shadow-sm);
  min-height: 0;
}
.pos-products-panel,
.pos-cart-panel {
  width: auto;
  min-width: 0 !important;
  padding: 16px;
}
.pos-search-bar { gap: 10px; margin-bottom: 14px; }
.pos-search-input { border-radius: var(--radius-md); box-shadow: none; }
.pos-search-input:focus { transform: none; }
.pos-product-grid {
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 12px;
}
.pos-product-card {
  min-height: 126px;
  border-radius: var(--radius-md);
  padding: 12px;
}
.pos-product-card:hover { transform: none; }

.pos-cart-item-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.pos-cart-item-copy { min-width: 0; }
.pos-cart-item-title {
  color: var(--text-primary);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  font-weight: 800;
}
.pos-cart-item-meta {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 4px;
}
.pos-cart-discount {
  color: var(--danger);
  margin-left: 6px;
  font-weight: 800;
}
.pos-qty-control {
  display: grid;
  grid-template-columns: 44px 32px 44px;
  align-items: center;
  gap: 6px;
}
.pos-qty-control span {
  text-align: center;
  font-size: 1.05rem;
  font-weight: 900;
}
.pos-qty-btn {
  width: 44px !important;
  height: 44px !important;
  border-radius: var(--radius-md) !important;
}
.pos-discount-field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.pos-discount-field span {
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}
.pos-discount-field input {
  width: 96px;
  padding: 7px 9px;
  font-size: 0.85rem;
}

@media (max-width: 1100px) {
  .pos-container {
    grid-template-columns: 1fr !important;
    height: auto !important;
    min-height: calc(100vh - 64px);
  }
  .pos-cart-panel {
    min-height: 420px;
  }
}

@media (max-width: 768px) {
  .ui-page-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .ui-segmented {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 100%;
  }
  .ui-segmented button {
    justify-content: center;
    padding: 8px;
  }
  .summary-cards { grid-template-columns: 1fr; }
  .pos-container { padding: 10px !important; }
  .pos-search-bar { flex-direction: column; }
  .pos-product-grid { grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); }
}
`, 'utf8');
}

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
    <button className={`ui-btn ui-btn-${variant} ui-btn-${size} ${className}`.trim()} {...props}>
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
    <section className={`ui-panel ${compact ? 'ui-panel-compact' : ''} ${className}`.trim()} {...props}>
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
    <label className={`ui-field ${className}`.trim()} {...props}>
      <span className="ui-field-label">{label}</span>
      {children}
      {hint && <span className="ui-field-hint">{hint}</span>}
    </label>
  );
}

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'primary';

export function Badge({ tone = 'neutral', children, className = '' }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return <span className={`ui-badge ui-badge-${tone} ${className}`.trim()}>{children}</span>;
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

const React = (window as any).React;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[Finance Plugin] Error caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: '#fee2e2', borderRadius: '5px', margin: '20px' }}>
          <h3>Finance Plugin Error</h3>
          <p>Something went wrong in the Finance module.</p>
          <pre style={{ fontSize: '0.8em' }}>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const PluginApp = ({ api, onClose }) => {
  const handleTrack = (e) => {
    // Track clicks everywhere in the finance module
    const target = e.target as HTMLElement;
    console.log('[Finance Tracker] Action:', e.type, 'on', target.tagName, target.innerText || target.className);
  };

  return (
    <ErrorBoundary>
      <div 
        onClickCapture={handleTrack}
        style={{ padding: '20px', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: '#064e3b' }}>Finance (Plugin)</h1>
          <button onClick={onClose} style={{ background: '#e2e8f0', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Close Plugin</button>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button style={{ padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>View Reports</button>
          <button style={{ padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Process Payroll</button>
          <button style={{ padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => { throw new Error('Simulated crash!'); }}>Simulate Crash</button>
        </div>
        <p style={{ marginTop: '20px' }}>This module is now robust with error boundaries and tracks user actions.</p>
      </div>
    </ErrorBoundary>
  );
};

(window as any).RitaPlugin = {
  mount: (container, props) => {
    const ReactDOM = (window as any).ReactDOM;
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(PluginApp, props));
    (window as any).RitaPlugin._root = root;
  },
  unmount: () => {
    const root = (window as any).RitaPlugin._root;
    if (root) root.unmount();
  }
};
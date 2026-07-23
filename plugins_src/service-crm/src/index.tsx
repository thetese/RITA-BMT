const React = (window as any).React;
const PluginApp = ({ api, onClose }) => {
  return (
    <div style={{ padding: '20px', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#1e3a8a' }}>Service CRM (Plugin)</h1>
        <button onClick={onClose} style={{ background: '#e2e8f0', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Close Plugin</button>
      </div>
      <p style={{ marginTop: '20px' }}>This module was dynamically loaded from the plugins directory.</p>
    </div>
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
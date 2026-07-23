const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pluginsDir = path.join(__dirname, 'plugins_src');
const appDataPluginsDir = path.join(process.env.APPDATA || process.env.HOME, 'rita-sales-reports', 'plugins');

if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);
if (!fs.existsSync(appDataPluginsDir)) fs.mkdirSync(appDataPluginsDir, { recursive: true });

const plugins = [
  {
    id: 'rita-plugin-retail',
    folder: 'retail-pos',
    name: 'Retail POS',
    desc: 'Manage sales, customers and transactions',
    icon: 'ShoppingBag',
    iconBg: '#3b82f6',
    gradient: 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
    roles: ['Admin', 'Retail', 'Cashier']
  },
  {
    id: 'rita-plugin-restaurant',
    folder: 'restaurant-pos',
    name: 'Restaurant POS',
    desc: 'Streamline orders, tables and kitchen operations',
    icon: 'UtensilsCrossed',
    iconBg: '#f97316',
    gradient: 'linear-gradient(180deg, #311105 0%, #7c2d12 50%, #ea580c 100%)',
    roles: ['Admin', 'Waiter', 'Kitchen', 'Manager']
  },
  {
    id: 'rita-plugin-service',
    folder: 'service-crm',
    name: 'Service CRM',
    desc: 'Manage clients, services and relationships',
    icon: 'Target',
    iconBg: '#10b981',
    gradient: 'linear-gradient(180deg, #022c22 0%, #065f46 50%, #059669 100%)',
    roles: ['Admin', 'Sales']
  },
  {
    id: 'rita-plugin-projects',
    folder: 'projects-tasks',
    name: 'Projects & Tasks',
    desc: 'Plan, assign and track projects efficiently',
    icon: 'Briefcase',
    iconBg: '#8b5cf6',
    gradient: 'linear-gradient(180deg, #2e1065 0%, #581c87 50%, #7c3aed 100%)',
    roles: ['Admin', 'Worker', 'Sales']
  },
  {
    id: 'rita-plugin-inventory',
    folder: 'inventory',
    name: 'Inventory',
    desc: 'Track stock, products and suppliers',
    icon: 'PackageSearch',
    iconBg: '#f59e0b',
    gradient: 'linear-gradient(180deg, #451a03 0%, #78350f 50%, #d97706 100%)',
    roles: ['Admin']
  },
  {
    id: 'rita-plugin-hr',
    folder: 'hr',
    name: 'People & HR',
    desc: 'Manage employees, attendance and payroll',
    icon: 'Users',
    iconBg: '#ec4899',
    gradient: 'linear-gradient(180deg, #4c0519 0%, #881337 50%, #db2777 100%)',
    roles: ['Admin']
  },
  {
    id: 'rita-plugin-finance',
    folder: 'finance',
    name: 'Finance',
    desc: 'Monitor cash flow, expenses and financial reports',
    icon: 'LineChart',
    iconBg: '#14b8a6',
    gradient: 'linear-gradient(180deg, #042f2e 0%, #115e59 50%, #0d9488 100%)',
    roles: ['Admin']
  }
];

plugins.forEach(plugin => {
  console.log(`Generating ${plugin.name}...`);
  const folderPath = path.join(pluginsDir, plugin.folder);
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
  
  const srcPath = path.join(folderPath, 'src');
  if (!fs.existsSync(srcPath)) fs.mkdirSync(srcPath);

  // package.json
  fs.writeFileSync(path.join(folderPath, 'package.json'), JSON.stringify({
    name: plugin.id,
    version: "1.0.0",
    scripts: { "build": "vite build" },
    devDependencies: {
      "@vitejs/plugin-react": "^4.2.0",
      "vite": "^5.0.0",
      "typescript": "^5.0.0"
    }
  }, null, 2));

  // vite.config.js
  fs.writeFileSync(path.join(folderPath, 'vite.config.js'), `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: 'src/index.tsx', name: '${plugin.folder.replace(/-/g, '')}Plugin', formats: ['iife'], fileName: () => 'plugin.js' },
    rollupOptions: { external: ['react', 'react-dom'], output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } } }
  },
  define: { 'process.env.NODE_ENV': '"production"' }
});`);

  // manifest.json
  fs.writeFileSync(path.join(folderPath, 'manifest.json'), JSON.stringify({
    id: plugin.id,
    name: plugin.name,
    description: plugin.desc,
    version: "1.0.0",
    icon: plugin.icon,
    iconBg: plugin.iconBg,
    gradient: plugin.gradient,
    roles: plugin.roles,
    entryFile: "dist/plugin.js"
  }, null, 2));

  // src/index.tsx
  fs.writeFileSync(path.join(srcPath, 'index.tsx'), `const React = (window as any).React;
const PluginApp = ({ api, onClose }) => {
  return (
    <div style={{ padding: '20px', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '${plugin.iconBg}' }}>${plugin.name} (Plugin)</h1>
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
};`);

  // Build and Install
  console.log(`Building ${plugin.name}...`);
  execSync('npm install && npm run build', { cwd: folderPath, stdio: 'inherit' });

  const targetDir = path.join(appDataPluginsDir, plugin.id);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  
  const targetDist = path.join(targetDir, 'dist');
  if (!fs.existsSync(targetDist)) fs.mkdirSync(targetDist, { recursive: true });

  fs.copyFileSync(path.join(folderPath, 'dist', 'plugin.js'), path.join(targetDist, 'plugin.js'));
  fs.copyFileSync(path.join(folderPath, 'manifest.json'), path.join(targetDir, 'manifest.json'));
  console.log(`Installed ${plugin.name} to AppData.`);
});

console.log("All plugins built and installed successfully.");

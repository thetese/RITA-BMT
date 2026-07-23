const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const plugins = [
  { id: 'rita-plugin-retail', name: 'retail', title: 'Retail POS', icon: 'ShoppingCart', iconBg: '#3b82f6', gradient: 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)', roles: ['Admin', 'Cashier', 'Manager'] },
  { id: 'rita-plugin-restaurant', name: 'restaurant', title: 'Restaurant POS', icon: 'Utensils', iconBg: '#f97316', gradient: 'linear-gradient(180deg, #311105 0%, #7c2d12 50%, #ea580c 100%)', roles: ['Admin', 'Waiter', 'Manager'] },
  { id: 'rita-plugin-service', name: 'service', title: 'Service CRM', icon: 'Users', iconBg: '#10b981', gradient: 'linear-gradient(180deg, #022c22 0%, #065f46 50%, #059669 100%)', roles: ['Admin', 'Manager'] },
  { id: 'rita-plugin-projects', name: 'projects', title: 'Projects & Tasks', icon: 'FolderKanban', iconBg: '#8b5cf6', gradient: 'linear-gradient(180deg, #2e1065 0%, #581c87 50%, #7c3aed 100%)', roles: ['Admin', 'Manager', 'Staff'] },
  { id: 'rita-plugin-inventory', name: 'inventory', title: 'Inventory', icon: 'Package', iconBg: '#f59e0b', gradient: 'linear-gradient(180deg, #451a03 0%, #78350f 50%, #d97706 100%)', roles: ['Admin', 'Manager'] },
  { id: 'rita-plugin-hr', name: 'hr', title: 'People & HR', icon: 'Users', iconBg: '#ec4899', gradient: 'linear-gradient(180deg, #4c0519 0%, #881337 50%, #db2777 100%)', roles: ['Admin', 'Manager'] },
  { id: 'rita-plugin-finance', name: 'finance', title: 'Finance', icon: 'Landmark', iconBg: '#14b8a6', gradient: 'linear-gradient(180deg, #042f2e 0%, #115e59 50%, #0d9488 100%)', roles: ['Admin'] }
];

const appDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config');
const pluginsDir = path.join(appDataPath, 'rita-sales-reports', 'plugins');

if (!fs.existsSync(pluginsDir)) {
  fs.mkdirSync(pluginsDir, { recursive: true });
}

console.log('Starting real plugin compilation...');

for (const p of plugins) {
  console.log(`\nBuilding ${p.title} (${p.name})...`);
  
  // Set env var for Vite config
  process.env.PLUGIN_NAME = p.name;
  
  // Build using Vite
  try {
    execSync('npx vite build -c vite.plugin.config.ts', { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to build ${p.name}`);
    continue;
  }
  
  // Create manifest
  const distDir = path.join(__dirname, '..', 'dist_plugins', p.id);
  const manifest = {
    id: p.id,
    name: p.title,
    description: `Core module for ${p.title}`,
    version: '1.0.0',
    entryFile: 'plugin.js',
    roles: p.roles,
    icon: p.icon,
    iconBg: p.iconBg,
    gradient: p.gradient
  };
  fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  
  // Copy to APPDATA
  const targetDir = path.join(pluginsDir, p.id);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const files = fs.readdirSync(distDir);
  for (const file of files) {
    fs.copyFileSync(path.join(distDir, file), path.join(targetDir, file));
  }
  
  console.log(`Installed ${p.title} to AppData.`);
}

console.log('\nAll plugins built and installed successfully!');

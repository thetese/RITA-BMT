const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbFiles = ['sales_general.db', 'sales_retail.db', 'sales.db'];
const dbs = dbFiles.map(file => {
  const p = path.join(__dirname, '..', file);
  if (fs.existsSync(p)) {
    return { name: file, db: new Database(p) };
  }
  return null;
}).filter(Boolean);

const pluginsDir = path.join(process.env.APPDATA || process.env.HOME + '/.config', 'rita-sales-reports', 'plugins');

console.log(`Scanning for plugins in ${pluginsDir}...`);
if (fs.existsSync(pluginsDir)) {
  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const pluginPath = path.join(pluginsDir, entry.name);
      const manifestPath = path.join(pluginPath, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        const entryUrl = `rita-plugin://${entry.name}/${manifest.entryFile}`;
        
        for (const { name, db } of dbs) {
          try {
            const stmt = db.prepare(`
              INSERT INTO installed_modules (id, name, description, version, icon, iconBg, gradient, entry_file, path, roles, is_active)
              VALUES (@id, @name, @description, @version, @icon, @iconBg, @gradient, @entry_file, @path, @roles, 1)
              ON CONFLICT(id) DO UPDATE SET
                name = @name,
                description = @description,
                version = @version,
                icon = @icon,
                iconBg = @iconBg,
                gradient = @gradient,
                entry_file = @entry_file,
                path = @path,
                roles = @roles,
                is_active = 1
            `);
            
            stmt.run({
              id: manifest.id,
              name: manifest.name,
              description: manifest.description || '',
              version: manifest.version || '1.0.0',
              icon: manifest.icon || 'Box',
              iconBg: manifest.iconBg || '#64748b',
              gradient: manifest.gradient || 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
              entry_file: entryUrl,
              path: pluginPath,
              roles: JSON.stringify(manifest.roles || ['Admin'])
            });
            console.log(`Registered ${manifest.name} in ${name}`);
          } catch (err) {
            console.error(`Failed to register ${manifest.name} in ${name}:`, err.message);
          }
        }
      }
    }
  }
}
console.log('Done!');

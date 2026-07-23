import fs from 'fs';
import path from 'path';
import { app, protocol } from 'electron';
import url from 'url';

export class PluginService {
  store: any;
  pluginsDir: string;

  constructor(store: any) {
    this.store = store;
    this.pluginsDir = path.join(app.getPath('userData'), 'plugins');
    
    // Ensure plugins directory exists
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }
  }

  // Register custom protocol to serve plugin files securely
  registerProtocol() {
    const { net } = require('electron');
    protocol.handle('rita-plugin', (request) => {
      // rita-plugin://plugin-id/asset.js
      try {
        const parsedUrl = new url.URL(request.url);
        // Hostname is the plugin folder name, pathname is the file inside it
        const requestPath = path.join(parsedUrl.hostname, decodeURIComponent(parsedUrl.pathname.replace(/^\//, '')));
        const absolutePath = path.normalize(path.join(this.pluginsDir, requestPath));

        // Security check: ensure the resolved path is actually inside the plugins directory
        if (!absolutePath.startsWith(this.pluginsDir)) {
          console.error('[Plugin] Blocked directory traversal attempt:', request.url);
          return new Response('Access Denied', { status: 403 });
        }

        if (!fs.existsSync(absolutePath)) {
          if (absolutePath.endsWith('.css')) {
            return new Response('', { status: 200, headers: { 'Content-Type': 'text/css' } });
          }
          return new Response('Not Found', { status: 404 });
        }

        const content = fs.readFileSync(absolutePath);
        
        let contentType = 'application/javascript';
        if (absolutePath.endsWith('.css')) contentType = 'text/css';
        else if (absolutePath.endsWith('.json')) contentType = 'application/json';
        else if (absolutePath.endsWith('.png')) contentType = 'image/png';
        else if (absolutePath.endsWith('.svg')) contentType = 'image/svg+xml';

        return new Response(content, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
          }
        });
      } catch (e) {
        console.error('[Plugin] Error resolving protocol URL:', request.url, e);
        return new Response('Internal Server Error', { status: 500 });
      }
    });
  }

  // Scan the plugins directory and install/update modules in the DB
  scanAndRegisterPlugins() {
    console.log(`[Plugin] Scanning for plugins in ${this.pluginsDir}...`);
    try {
      const entries = fs.readdirSync(this.pluginsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginPath = path.join(this.pluginsDir, entry.name);
          const manifestPath = path.join(pluginPath, 'manifest.json');
          
          if (fs.existsSync(manifestPath)) {
            try {
              const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
              const manifest = JSON.parse(manifestContent);
              
              if (manifest.id && manifest.name && manifest.entryFile) {
                // Construct the plugin URL for the frontend
                // e.g., rita-plugin://my-plugin/dist/plugin.js
                const entryUrl = `rita-plugin://${entry.name}/${manifest.entryFile}`;
                
                this.store.installModule({
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
                
                console.log(`[Plugin] Registered module: ${manifest.name} (${manifest.id})`);
              } else {
                console.error(`[Plugin] Invalid manifest in ${entry.name}: missing id, name, or entryFile`);
              }
            } catch (err) {
              console.error(`[Plugin] Failed to parse manifest in ${entry.name}:`, err);
            }
          }
        }
      }
    } catch (e) {
      console.error("[Plugin] Failed to scan plugins directory:", e);
    }
  }
}

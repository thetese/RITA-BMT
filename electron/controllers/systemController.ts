import { IpcMain, dialog } from 'electron';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

export const registerSystemControllers = (ipcMain: IpcMain, store: any, reportScheduler: any, pluginService: any) => {
  // Database
  ipcMain.handle('db:backup', (event) => store.backupDatabase(event.sender));
  ipcMain.handle('db:restore', (event) => store.restoreDatabase(event.sender));

  // Modules
  ipcMain.handle('modules:getAll', () => store.getInstalledModules());
  ipcMain.handle('modules:install', (_, moduleData) => store.installModule(moduleData));

  // Plugins
  ipcMain.handle('plugin:installZip', async (event) => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Select Plugin ZIP File',
        filters: [{ name: 'ZIP Files', extensions: ['zip'] }],
        properties: ['openFile']
      });

      if (canceled || filePaths.length === 0) return { success: false, error: 'Cancelled' };
      
      const zipPath = filePaths[0];
      const zip = new AdmZip(zipPath);
      
      const tempExtractedPath = path.join(pluginService.pluginsDir, '_temp_extract_' + Date.now());
      zip.extractAllTo(tempExtractedPath, true);
      
      let manifestPath = path.join(tempExtractedPath, 'manifest.json');
      let pluginRoot = tempExtractedPath;
      
      if (!fs.existsSync(manifestPath)) {
        const entries = fs.readdirSync(tempExtractedPath, { withFileTypes: true });
        const subfolders = entries.filter(e => e.isDirectory());
        if (subfolders.length === 1) {
          const subfolderPath = path.join(tempExtractedPath, subfolders[0].name);
          const subManifestPath = path.join(subfolderPath, 'manifest.json');
          if (fs.existsSync(subManifestPath)) {
            manifestPath = subManifestPath;
            pluginRoot = subfolderPath;
          }
        }
      }

      if (!fs.existsSync(manifestPath)) {
        fs.rmSync(tempExtractedPath, { recursive: true, force: true });
        return { success: false, error: 'Invalid plugin format: missing manifest.json' };
      }
      
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (!manifest.id) {
        fs.rmSync(tempExtractedPath, { recursive: true, force: true });
        return { success: false, error: 'Invalid manifest: missing plugin id' };
      }

      const finalPluginPath = path.join(pluginService.pluginsDir, manifest.id);
      
      if (fs.existsSync(finalPluginPath)) {
        fs.rmSync(finalPluginPath, { recursive: true, force: true });
      }
      
      fs.renameSync(pluginRoot, finalPluginPath);
      
      if (pluginRoot !== tempExtractedPath) {
        fs.rmSync(tempExtractedPath, { recursive: true, force: true });
      }
      
      pluginService.scanAndRegisterPlugins();
      
      return { success: true, message: `Successfully installed ${manifest.name || manifest.id}` };
    } catch (err: any) {
      console.error('Failed to install plugin:', err);
      return { success: false, error: err.message };
    }
  });

  // Stores
  ipcMain.handle('stores:getAll', () => store.getStores());
  ipcMain.handle('stores:add', (_, data) => store.addStore(data));
  ipcMain.handle('stores:update', (_, data) => store.updateStore(data));
  ipcMain.handle('stores:delete', (_, id) => store.deleteStore(id));

  // Settings
  ipcMain.handle('settings:get', (_, key) => store.getSetting(key));
  ipcMain.handle('settings:set', (_, key, value) => store.setSetting(key, value));
  ipcMain.handle('settings:getAll', () => store.getAllSettings ? store.getAllSettings() : {});

  // Displays
  ipcMain.handle('displays:getAll', () => {
    const { screen } = require('electron');
    return screen.getAllDisplays().map(d => ({
      id: d.id,
      bounds: d.bounds,
      scaleFactor: d.scaleFactor,
      isPrimary: d.id === screen.getPrimaryDisplay().id
    }));
  });

  // Reports
  ipcMain.handle('reports:generate', (_, timeframe) => reportScheduler.generateReport(timeframe));

  // Stripe
  ipcMain.handle('stripe:createCheckout', async (_, payload) => {
    try {
      const stripeSecretKey = store.getSetting('stripeSecretKey');
      if (!stripeSecretKey) return { success: false, error: 'Stripe Secret Key not configured in Settings' };
      
      const stripe = new Stripe(stripeSecretKey);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: payload.currency || 'rwf',
            product_data: { name: payload.description || 'POS Order' },
            unit_amount: Math.round(payload.amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `http://localhost:4000/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:4000/api/stripe/cancel`,
      });
      return { success: true, url: session.url, id: session.id };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
};

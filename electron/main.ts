const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const Store = require('./store');
const { startServer, startCloudSync } = require('./server');
const setupReportScheduler = require('./reportScheduler');
import { registerSystemControllers } from './controllers/systemController';
import { registerSalesControllers } from './controllers/salesController';
import { registerUserControllers } from './controllers/userController';
import { initPrinterService } from './services/printerService';
import { SupabaseSyncService } from './services/supabaseSyncService';

// Global error handlers to prevent silent crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

let store;
let reportScheduler;
let mainAppWindow = null; // reference for 'main' window to close app on exit

function launchWindows() {
  const { screen } = require('electron');
  const displays = screen.getAllDisplays();
  
  let mapping = [];
  try {
    const raw = store.getSetting('displayMapping');
    if (raw) mapping = JSON.parse(raw);
  } catch(e) {}

  if (!mapping || mapping.length === 0) {
    // Default fallback: open one window on primary display
    createSingleWindow(displays[0].id, displays[0].bounds, 'dashboard', true);
  } else {
    let windowCreated = false;
    mapping.forEach(m => {
      const d = displays.find(disp => disp.id === m.displayId);
      if (d) {
        createSingleWindow(d.id, d.bounds, m.page, m.isMain);
        windowCreated = true;
      }
    });
    // Failsafe: if display IDs changed and no window was created
    if (!windowCreated) {
      createSingleWindow(displays[0].id, displays[0].bounds, 'dashboard', true);
    }
  }
}

function createSingleWindow(displayId, bounds, page, isMain) {
  const win = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '..', 'build', 'icon-256.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isMain) {
    mainAppWindow = win;
    win.on('closed', () => {
      app.quit(); // If main window is closed, close the whole app
    });
  }

  // Maximize by default for POS/KDS systems
  win.maximize();

  const query = `?page=${page}&isMain=${isMain}`;
  
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    win.loadURL(`http://localhost:5173/${query}`);
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), { search: `page=${page}` });
  }
}

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const { protocol } = require('electron');
protocol.registerSchemesAsPrivileged([
  { scheme: 'rita-plugin', privileges: { bypassCSP: true, supportFetchAPI: true, secure: true, standard: true, corsEnabled: true } }
]);

app.whenReady().then(() => {
  app.setAppUserModelId('com.rita.salesreports');
  const { session } = require('electron');
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' rita-plugin:; script-src 'self' 'unsafe-inline' 'unsafe-eval' rita-plugin:; connect-src 'self' http://localhost:* ws://localhost:* rita-plugin:; img-src 'self' data: blob: rita-plugin:;"]
      }
    });
  });

  store = new Store();
  reportScheduler = setupReportScheduler(store);
  
  const supabaseSync = new SupabaseSyncService(store);
  supabaseSync.start();

  const { PluginService } = require('./services/pluginService');
  const pluginService = new PluginService(store);
  pluginService.registerProtocol();
  pluginService.scanAndRegisterPlugins();
  
  // Register Controllers
  registerSystemControllers(ipcMain, store, reportScheduler, pluginService);
  registerSalesControllers(ipcMain, store);
  registerUserControllers(ipcMain, store);
  initPrinterService(ipcMain, store);
  
  // Enforce mode from installer if present
  try {
    const isPackaged = app.isPackaged;
    const installDir = isPackaged ? path.dirname(app.getPath('exe')) : path.join(__dirname, '..');
    const modeFilePath = path.join(installDir, 'mode.txt');
    
    if (fs.existsSync(modeFilePath)) {
      const mode = fs.readFileSync(modeFilePath, 'utf-8').trim();
      if (mode === 'restaurant' || mode === 'retail') {
        store.setSetting('businessType', mode);
      }
    }
  } catch (err) {
    console.error("Error reading installer mode file:", err);
  }

  // Start local API server for sync & mobile app
  startServer(store, 4000);

  // Initialize Cloud Sync Engine Background Worker
  startCloudSync(store, (event, data) => {
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) win.webContents.send(event, data);
    });
  });

  // Initialize EBM Sync Background Worker
  const { EbmService } = require('./services/ebmService');
  const ebmService = new EbmService(store);
  setInterval(async () => {
    try {
      await ebmService.syncPendingSales();
    } catch (e) {
      console.error("EBM Sync Worker Error:", e);
    }
  }, 60000); // 1 minute interval

  // Load third-party Plugins
  try {
    const pluginsDir = path.join(__dirname, 'plugins');
    if (fs.existsSync(pluginsDir)) {
      const files = fs.readdirSync(pluginsDir);
      files.forEach(file => {
        if (file.endsWith('.js')) {
          console.log(`Loading plugin: ${file}`);
          try {
            require(path.join(pluginsDir, file))(app, ipcMain, store);
          } catch(e) {
            console.error(`Failed to load plugin ${file}:`, e);
          }
        }
      });
    }
  } catch (e) {
    console.error("Plugin loader error:", e);
  }

  launchWindows();
  
  // Check for updates
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) launchWindows();
});

// Controllers registered inside whenReady

// Printing (moved here temporarily, will be refactored into a service later)
ipcMain.handle('print:getPrinters', async (event) => {
  return await event.sender.getPrintersAsync();
});

ipcMain.handle('print:receipt', async (event, htmlContent, printerName) => {
  const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  
  // Log queue status
  try {
    if (store && store.db) {
      const tableCheck = store.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='printer_jobs'").get();
      if (tableCheck) {
        store.db.prepare(`
          INSERT INTO printer_jobs (id, printerName, type, status, createdAt, data)
          VALUES (?, ?, ?, 'printing', datetime('now'), ?)
        `).run(jobId, printerName || 'Default Printer', 'Receipt', JSON.stringify({ htmlLength: htmlContent.length }));
      }
    }
  } catch (e) {
    console.error('Error queuing print job in main.ts:', e);
  }

  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
  
  return new Promise(async (resolve) => {
    // If the selected printer is a PDF printer, use printToPDF and prompt user to save
    if (printerName && printerName.toLowerCase().includes('pdf')) {
      try {
        const data = await printWindow.webContents.printToPDF({
          printBackground: true,
          pageSize: 'A4'
        });
        const { dialog } = require('electron');
        const fs = require('fs');
        const { filePath } = await dialog.showSaveDialog({
          title: 'Save Receipt as PDF',
          defaultPath: 'receipt.pdf',
          filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
        });
        
        if (filePath) {
          fs.writeFileSync(filePath, data);
          printWindow.close();
          
          // Log completion
          try {
            if (store && store.db) {
              store.db.prepare(`
                UPDATE printer_jobs SET status = 'completed', completedAt = datetime('now') WHERE id = ?
              `).run(jobId);
            }
          } catch (e) {}

          resolve({ success: true });
        } else {
          printWindow.close();

          // Log cancellation
          try {
            if (store && store.db) {
              store.db.prepare(`
                UPDATE printer_jobs SET status = 'failed', completedAt = datetime('now'), error = 'Cancelled by user' WHERE id = ?
              `).run(jobId);
            }
          } catch (e) {}

          resolve({ success: false, errorType: 'cancelled' });
        }
      } catch (err: any) {
        printWindow.close();

        // Log failure
        try {
          if (store && store.db) {
            store.db.prepare(`
              UPDATE printer_jobs SET status = 'failed', completedAt = datetime('now'), error = ? WHERE id = ?
            `).run(err.message, jobId);
          }
        } catch (e) {}

        resolve({ success: false, errorType: err.message });
      }
      return;
    }

    // Normal thermal/hardware printer logic
    printWindow.webContents.print({ silent: true, deviceName: printerName }, (success, errorType) => {
      printWindow.close();
      
      // Update job status in database
      try {
        if (store && store.db) {
          const status = success ? 'completed' : 'failed';
          const errorMsg = success ? null : (errorType || 'Unknown error');
          store.db.prepare(`
            UPDATE printer_jobs SET status = ?, completedAt = datetime('now'), error = ? WHERE id = ?
          `).run(status, errorMsg, jobId);
        }
      } catch (e) {
        console.error('Error updating print job status in main.ts:', e);
      }

      resolve({ success, errorType });
    });
  });
});

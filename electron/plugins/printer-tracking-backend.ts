import { App, IpcMain } from 'electron';

module.exports = function (app: App, ipcMain: IpcMain, store: any) {
  console.log('Printer Tracking Backend Plugin Loaded!');

  try {
    store.db.prepare(`
      CREATE TABLE IF NOT EXISTS printer_jobs (
        id TEXT PRIMARY KEY,
        printerName TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'queued',
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        completedAt TEXT,
        error TEXT,
        data TEXT
      )
    `).run();

    store.db.prepare(`
      CREATE TABLE IF NOT EXISTS printers (
        name TEXT PRIMARY KEY,
        interface TEXT DEFAULT 'USB',
        online INTEGER DEFAULT 0,
        busy INTEGER DEFAULT 0,
        error TEXT,
        lastChecked TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `).run();

    try {
      store.db.prepare(`ALTER TABLE printers ADD COLUMN connectionString TEXT`).run();
    } catch (e) {
      // Column may already exist
    }

    console.log('Printer tracking tables initialized');
  } catch (e) {
    console.error('Failed to initialize printer tracking tables:', e);
  }

  ipcMain.handle('plugin:printer:getJobs', () => {
    try {
      return store.db.prepare('SELECT * FROM printer_jobs ORDER BY createdAt DESC LIMIT 100').all();
    } catch (e) {
      console.error('Error fetching print jobs:', e);
      return [];
    }
  });

  ipcMain.handle('plugin:printer:getStatus', () => {
    try {
      return store.db.prepare('SELECT * FROM printers').all();
    } catch (e) {
      console.error('Error fetching printer status:', e);
      return [];
    }
  });

  ipcMain.handle('plugin:printer:logJob', (_event, job) => {
    try {
      store.db.prepare(`
        INSERT INTO printer_jobs (id, printerName, type, status, createdAt, data)
        VALUES (?, ?, ?, 'queued', datetime('now'), ?)
      `).run(job.id, job.printerName, job.type, JSON.stringify(job.data || {}));
      return { success: true };
    } catch (e) {
      console.error('Error logging print job:', e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('plugin:printer:updateJobStatus', (_event, jobId, status, error) => {
    try {
      const completedAt = status === 'completed' || status === 'failed' ? "datetime('now')" : null;
      store.db.prepare(`
        UPDATE printer_jobs SET status = ?, completedAt = ${completedAt ? 'datetime(\'now\')' : 'NULL'}, error = ? WHERE id = ?
      `).run(status, error || null, jobId);
      return { success: true };
    } catch (e) {
      console.error('Error updating job status:', e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('plugin:printer:updatePrinterStatus', (_event, name, status) => {
    try {
      store.db.prepare(`
        INSERT INTO printers (name, online, busy, error, lastChecked)
        VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(name) DO UPDATE SET
          online = excluded.online,
          busy = excluded.busy,
          error = excluded.error,
          lastChecked = excluded.lastChecked
      `).run(name, status.online ? 1 : 0, status.busy ? 1 : 0, status.error || null);
      return { success: true };
    } catch (e) {
      console.error('Error updating printer status:', e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('plugin:printer:savePrinter', (_event, printer) => {
    try {
      store.db.prepare(`
        INSERT INTO printers (name, interface, connectionString, online, busy, lastChecked)
        VALUES (?, ?, ?, 0, 0, datetime('now'))
        ON CONFLICT(name) DO UPDATE SET
          interface = excluded.interface,
          connectionString = excluded.connectionString,
          lastChecked = datetime('now')
      `).run(printer.name, printer.interface || 'USB', printer.connectionString || null);
      return { success: true };
    } catch (e) {
      console.error('Error saving printer:', e);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('plugin:printer:deletePrinter', (_event, name) => {
    try {
      store.db.prepare('DELETE FROM printers WHERE name = ?').run(name);
      return { success: true };
    } catch (e) {
      console.error('Error deleting printer:', e);
      return { success: false, error: e.message };
    }
  });
};

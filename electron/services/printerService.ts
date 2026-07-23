import escpos from 'escpos';
import escposUsb from 'escpos-usb';

// Register USB adapter
escpos.USB = escposUsb;

export const initPrinterService = (ipcMain: Electron.IpcMain, store?: any) => {
  ipcMain.handle('printer:getUSBPrinters', async () => {
    try {
      const devices = escpos.USB.findPrinter();
      return devices;
    } catch (error: any) {
      console.error('Error finding USB printers:', error);
      return [];
    }
  });

  ipcMain.handle('printer:printRawReceipt', async (_, printerConfig: any, lines: any[]) => {
    const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const printerName = `USB (VID:${printerConfig.vendorId} PID:${printerConfig.productId})`;

    // Log queued status
    try {
      if (store && store.db) {
        const tableCheck = store.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='printer_jobs'").get();
        if (tableCheck) {
          store.db.prepare(`
            INSERT INTO printer_jobs (id, printerName, type, status, createdAt, data)
            VALUES (?, ?, ?, 'printing', datetime('now'), ?)
          `).run(jobId, printerName, 'Raw (USB)', JSON.stringify({ linesCount: lines.length }));
        }
      }
    } catch (e) {
      console.error('Error writing raw print job to db:', e);
    }

    try {
      // Find the specific printer or use the first one
      const device = new escpos.USB(printerConfig.vendorId, printerConfig.productId);
      const printer = new escpos.Printer(device);

      return new Promise((resolve) => {
        device.open((err: any) => {
          if (err) {
            // Log failure
            try {
              if (store && store.db) {
                store.db.prepare(`
                  UPDATE printer_jobs SET status = 'failed', completedAt = datetime('now'), error = ? WHERE id = ?
                `).run(err.message, jobId);
              }
            } catch (e) {}
            resolve({ success: false, error: err.message });
            return;
          }
          
          try {
            printer.font('a').align('ct').style('b').size(1, 1);
            
            for (const line of lines) {
              if (line.type === 'text') {
                if (line.align) printer.align(line.align);
                if (line.style) printer.style(line.style);
                printer.text(line.content);
              } else if (line.type === 'barcode') {
                printer.barcode(line.content, 'EAN13');
              } else if (line.type === 'cut') {
                printer.cut();
              }
            }
            
            printer.close();

            // Log completion
            try {
              if (store && store.db) {
                store.db.prepare(`
                  UPDATE printer_jobs SET status = 'completed', completedAt = datetime('now') WHERE id = ?
                `).run(jobId);
              }
            } catch (e) {}

            resolve({ success: true });
          } catch (execErr: any) {
            // Log execution error
            try {
              if (store && store.db) {
                store.db.prepare(`
                  UPDATE printer_jobs SET status = 'failed', completedAt = datetime('now'), error = ? WHERE id = ?
                `).run(execErr.message, jobId);
              }
            } catch (e) {}
            resolve({ success: false, error: execErr.message });
          }
        });
      });
    } catch (error: any) {
      console.error('Print raw receipt error:', error);
      // Log immediate failure
      try {
        if (store && store.db) {
          store.db.prepare(`
            UPDATE printer_jobs SET status = 'failed', completedAt = datetime('now'), error = ? WHERE id = ?
          `).run(error.message, jobId);
        }
      } catch (e) {}
      return { success: false, error: error.message };
    }
  });
};

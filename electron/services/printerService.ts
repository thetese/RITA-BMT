import escpos from 'escpos';
import escposUsb from 'escpos-usb';

// Register USB adapter
escpos.USB = escposUsb;

export const initPrinterService = (ipcMain: Electron.IpcMain) => {
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
    try {
      // Find the specific printer or use the first one
      const device = new escpos.USB(printerConfig.vendorId, printerConfig.productId);
      const printer = new escpos.Printer(device);

      device.open((err: any) => {
        if (err) throw err;
        
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
      });
      return { success: true };
    } catch (error: any) {
      console.error('Print raw receipt error:', error);
      return { success: false, error: error.message };
    }
  });
};

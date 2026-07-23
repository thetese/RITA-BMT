const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('./store');

let store;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  store = new Store();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Database Backup/Restore
ipcMain.handle('db:backup', () => store.backupDatabase(mainWindow));
ipcMain.handle('db:restore', () => store.restoreDatabase(mainWindow));

// Settings
ipcMain.handle('settings:get', (_, key) => store.getSetting(key));
ipcMain.handle('settings:set', (_, key, value) => store.setSetting(key, value));

// Users
ipcMain.handle('users:getAll', () => store.getUsers());
ipcMain.handle('users:getByUsername', (_, username) => store.getUserByUsername(username));
ipcMain.handle('users:add', (_, user) => store.addUser(user));
ipcMain.handle('users:update', (_, user) => store.updateUser(user));
ipcMain.handle('users:delete', (_, id, currentUserId) => store.deleteUser(id, currentUserId));

// Sales
ipcMain.handle('sales:getAll', () => store.getSales());
ipcMain.handle('sales:add', (_, sale, userId) => store.addSale(sale, userId));
ipcMain.handle('sales:update', (_, sale, userId) => store.updateSale(sale, userId));
ipcMain.handle('sales:delete', (_, id, userId) => store.deleteSale(id, userId));

// Products
ipcMain.handle('products:getAll', () => store.getProducts());
ipcMain.handle('products:add', (_, product, userId) => store.addProduct(product, userId));
ipcMain.handle('products:update', (_, product, userId) => store.updateProduct(product, userId));
ipcMain.handle('products:delete', (_, id, userId) => store.deleteProduct(id, userId));

// Accounters
ipcMain.handle('accounters:getAll', () => store.getAccounters());
ipcMain.handle('accounters:add', (_, accounter) => store.addAccounter(accounter));
ipcMain.handle('accounters:update', (_, accounter) => store.updateAccounter(accounter));
ipcMain.handle('accounters:delete', (_, id) => store.deleteAccounter(id));

// Expenses
ipcMain.handle('expenses:getAll', () => store.getExpenses());
ipcMain.handle('expenses:add', (_, expense, userId) => store.addExpense(expense, userId));
ipcMain.handle('expenses:update', (_, expense, userId) => store.updateExpense(expense, userId));
ipcMain.handle('expenses:delete', (_, id, userId) => store.deleteExpense(id, userId));

// Customers
ipcMain.handle('customers:getAll', () => store.getCustomers());
ipcMain.handle('customers:add', (_, customer, userId) => store.addCustomer(customer, userId));
ipcMain.handle('customers:update', (_, customer, userId) => store.updateCustomer(customer, userId));
ipcMain.handle('customers:delete', (_, id, userId) => store.deleteCustomer(id, userId));

// Printing
ipcMain.handle('print:getPrinters', async (event) => {
  return await event.sender.getPrintersAsync();
});

ipcMain.handle('print:receipt', async (event, htmlContent, printerName) => {
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
  
  return new Promise((resolve) => {
    printWindow.webContents.print({ silent: true, deviceName: printerName }, (success, errorType) => {
      printWindow.close();
      resolve({ success, errorType });
    });
  });
});

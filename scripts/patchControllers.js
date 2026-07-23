const fs = require('fs');
const path = require('path');

// --- Preload ---
const preloadPath = path.join(__dirname, 'electron', 'preload.ts');
let preloadCode = fs.readFileSync(preloadPath, 'utf8');

// Add stores
if (!preloadCode.includes('getStores:')) {
  preloadCode = preloadCode.replace('contextBridge.exposeInMainWorld(\'api\', {', 
`contextBridge.exposeInMainWorld('api', {
  // Stores
  getStores: () => ipcRenderer.invoke('stores:getAll'),
  addStore: (store) => ipcRenderer.invoke('stores:add', store),
  updateStore: (store) => ipcRenderer.invoke('stores:update', store),
  deleteStore: (id) => ipcRenderer.invoke('stores:delete', id),
`);
}

// Update getters to accept storeId
const getters = [
  'getUsers', 'getSales', 'getHeldCarts', 'getProducts', 'getStockMovements',
  'getExpenses', 'getCustomers', 'getInvoices', 'getProjects', 'getTasks', 
  'getTimeEntries', 'getLeads', 'getAppointments', 'getTimecards'
];

getters.forEach(getter => {
  const regex = new RegExp(`${getter}: \\(\\([^)]*\\)\\) => ipcRenderer\\.invoke\\('([^']+)'\\)`);
  preloadCode = preloadCode.replace(regex, `${getter}: (storeId) => ipcRenderer.invoke('$1', storeId)`);
});

// For getters without empty parens, wait, all above have empty parens: getSales: () => ...
// Let's use string replace for each
getters.forEach(g => {
  preloadCode = preloadCode.replace(`${g}: () =>`, `${g}: (storeId) =>`);
  // And fix invoke call if it didn't pass storeId
  preloadCode = preloadCode.replace(new RegExp(`ipcRenderer\\.invoke\\('([^']+)'\\)`), `ipcRenderer.invoke('$1', storeId)`);
  // Wait, the regex above is too broad.
});

fs.writeFileSync(preloadPath, preloadCode, 'utf8');

// A better way to patch preload getters:
preloadCode = fs.readFileSync(preloadPath, 'utf8');
getters.forEach(g => {
  const lineRegex = new RegExp(`${g}: \\(\\) => ipcRenderer\\.invoke\\('([^']+)'\\)`);
  preloadCode = preloadCode.replace(lineRegex, `${g}: (storeId) => ipcRenderer.invoke('$1', storeId)`);
});
fs.writeFileSync(preloadPath, preloadCode, 'utf8');


// --- Controllers ---
// systemController.ts
const systemPath = path.join(__dirname, 'electron', 'controllers', 'systemController.ts');
let systemCode = fs.readFileSync(systemPath, 'utf8');

if (!systemCode.includes('stores:getAll')) {
  systemCode = systemCode.replace('// Settings', 
`// Stores
  ipcMain.handle('stores:getAll', () => store.getStores());
  ipcMain.handle('stores:add', (_, data) => store.addStore(data));
  ipcMain.handle('stores:update', (_, data) => store.updateStore(data));
  ipcMain.handle('stores:delete', (_, id) => store.deleteStore(id));

  // Settings`);
  fs.writeFileSync(systemPath, systemCode, 'utf8');
}

// salesController.ts
const salesPath = path.join(__dirname, 'electron', 'controllers', 'salesController.ts');
let salesCode = fs.readFileSync(salesPath, 'utf8');
// replace getters to accept storeId
const salesGetters = [
  'sales:getAll', 'heldCarts:getAll', 'products:getAll', 'inventory:getLowStock',
  'stock:getAll', 'accounters:getAll', 'expenses:getAll', 'customers:getAll',
  'suppliers:getAll', 'purchaseOrders:getAll', 'invoices:getAll', 'ingredients:getAll',
  'tables:getAll', 'shifts:getActive', 'shifts:getExpectedCash'
];

salesGetters.forEach(g => {
  salesCode = salesCode.replace(
    new RegExp(`ipcMain\\.handle\\('${g}', \\(\\) => store\\.([A-Za-z0-9]+)\\(\\)`),
    `ipcMain.handle('${g}', (_, storeId) => store.$1(storeId)`
  );
});

fs.writeFileSync(salesPath, salesCode, 'utf8');

// userController.ts
const userPath = path.join(__dirname, 'electron', 'controllers', 'userController.ts');
let userCode = fs.readFileSync(userPath, 'utf8');
const userGetters = [
  'users:getAll', 'waiters:getAll', 'timecards:getAll', 'appointments:getAll',
  'leads:getAll', 'projects:getAll', 'tasks:getAll', 'timeEntries:getAll'
];

userGetters.forEach(g => {
  userCode = userCode.replace(
    new RegExp(`ipcMain\\.handle\\('${g}', \\(\\) => store\\.([A-Za-z0-9]+)\\(\\)`),
    `ipcMain.handle('${g}', (_, storeId) => store.$1(storeId)`
  );
});

fs.writeFileSync(userPath, userCode, 'utf8');

console.log("Controllers patched successfully!");

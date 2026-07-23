const fs = require('fs');
const path = require('path');

const preloadPath = path.join(__dirname, 'electron', 'preload.ts');
let preloadCode = fs.readFileSync(preloadPath, 'utf8');

// I will just prepend to all invoke calls: 
// `const activeStore = storeId || localStorage.getItem('currentStoreId') || 'ALL';`
// Actually, it's easier to just do it via regex replace for `(storeId) => ipcRenderer.invoke('...', storeId)`
// to `(storeId) => ipcRenderer.invoke('...', storeId || localStorage.getItem('currentStoreId') || 'ALL')`

const getters = [
  'getUsers', 'getSales', 'getHeldCarts', 'getProducts', 'getStockMovements',
  'getExpenses', 'getCustomers', 'getInvoices', 'getProjects', 'getTasks', 
  'getTimeEntries', 'getLeads', 'getAppointments', 'getTimecards'
];

getters.forEach(g => {
  const lineRegex = new RegExp(`${g}: \\(storeId\\) => ipcRenderer\\.invoke\\('([^']+)', storeId\\)`);
  preloadCode = preloadCode.replace(lineRegex, `${g}: (storeId) => ipcRenderer.invoke('$1', storeId || localStorage.getItem('currentStoreId') || 'ALL')`);
});

// Also addStore, addSale etc. should pass activeStore if not provided?
// Actually, addSale already has `sale` object, we can add `storeId` to it inside the frontend logic, or here in preload.
// In preload:
// addSale: (sale, userId) => { sale.storeId = sale.storeId || localStorage.getItem('currentStoreId') || 'ALL'; return ipcRenderer.invoke('sales:add', sale, userId); }
const adders = [
  ['addSale', 'sales:add', 'sale, userId'],
  ['addProduct', 'products:add', 'product, userId'],
  ['addCustomer', 'customers:add', 'customer, userId'],
  ['addHeldCart', 'heldCarts:add', 'cart'],
  ['addExpense', 'expenses:add', 'expense, userId'],
  ['addStockMovement', 'stock:add', 'movement, userId'],
  ['addInvoice', 'invoices:add', 'inv'],
  ['addProject', 'projects:add', 'project'],
  ['addTask', 'tasks:add', 'task'],
  ['addTimeEntry', 'timeEntries:add', 'entry'],
  ['addLead', 'leads:add', 'lead'],
  ['addAppointment', 'appointments:add', 'apt']
];

adders.forEach(([method, ipc, args]) => {
  const arg1 = args.split(',')[0].trim();
  const lineRegex = new RegExp(`${method}: \\(${args.replace(/,/g, ',')}\\) => ipcRenderer\\.invoke\\('${ipc}', ${args.replace(/,/g, ',')}\\)`);
  preloadCode = preloadCode.replace(lineRegex, `${method}: (${args}) => { ${arg1}.storeId = ${arg1}.storeId || localStorage.getItem('currentStoreId') || 'default-store-id'; return ipcRenderer.invoke('${ipc}', ${args}); }`);
});

fs.writeFileSync(preloadPath, preloadCode, 'utf8');

console.log("Preload storeId fallback patched!");

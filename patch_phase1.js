const fs = require('fs');

// Patch coreStore.ts to remove duplicate suppliers & POs
let core = fs.readFileSync('electron/store/coreStore.ts', 'utf8');
const startIdx = core.indexOf('// Suppliers & POs');
const endIdx = core.indexOf('// --- Invoices ---');
if (startIdx !== -1 && endIdx !== -1) {
  core = core.slice(0, startIdx) + core.slice(endIdx);
  fs.writeFileSync('electron/store/coreStore.ts', core);
  console.log('Removed duplicate suppliers/POs from coreStore.ts');
}

// Patch salesController.ts to fix IPC names
let sales = fs.readFileSync('electron/controllers/salesController.ts', 'utf8');
sales = sales.replace(/'po:getAll'/g, "'purchaseOrders:getAll'");
sales = sales.replace(/'po:add'/g, "'purchaseOrders:add'");
sales = sales.replace(/'po:delete'/g, "'purchaseOrders:delete'");
fs.writeFileSync('electron/controllers/salesController.ts', sales);
console.log('Patched salesController.ts IPC names');

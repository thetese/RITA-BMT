const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'electron', 'store', 'coreStore.ts');
let code = fs.readFileSync(targetPath, 'utf8');

// 1. Add Stores CRUD
const storesCRUD = `
  // --- Stores ---
  getStores() {
    return this.db.prepare('SELECT * FROM stores ORDER BY name ASC').all();
  },
  addStore(store) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO stores (id, name, address, phone, createdAt) VALUES (?, ?, ?, ?, datetime('now'))");
    stmt.run(id, store.name, store.address || '', store.phone || '');
    return { ...store, id };
  },
  updateStore(store) {
    const stmt = this.db.prepare("UPDATE stores SET name=?, address=?, phone=? WHERE id=?");
    const info = stmt.run(store.name, store.address || '', store.phone || '', store.id);
    return info.changes > 0;
  },
  deleteStore(id) {
    if (id === 'default-store-id') throw new Error("Cannot delete default store");
    const stmt = this.db.prepare("DELETE FROM stores WHERE id=?");
    const info = stmt.run(id);
    return info.changes > 0;
  },
`;

code = code.replace(/module\.exports\s*=\s*\{/, "module.exports = {\n" + storesCRUD);

// A helper regex replacer for getters
function patchGetter(regex, replacement) {
  code = code.replace(regex, replacement);
}

// 2. Patch Getters
patchGetter(/getUsers\(\)\s*\{[\s\S]*?return this\.db\.prepare\('SELECT id, username, role, createdAt FROM users'\)\.all\(\);\s*\}/, 
`getUsers(storeId) {
    return this.db.prepare('SELECT id, username, role, createdAt, storeId FROM users').all();
  }`);

patchGetter(/getSales\(\)\s*\{[\s\S]*?const stmt = this\.db\.prepare\('SELECT \* FROM sales ORDER BY date DESC'\);\s*return stmt\.all\(\);\s*\}/,
`getSales(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM sales ORDER BY date DESC').all();
    return this.db.prepare('SELECT * FROM sales WHERE storeId = ? ORDER BY date DESC').all(storeId);
  }`);

patchGetter(/getHeldCarts\(\)\s*\{[\s\S]*?return this\.db\.prepare\('SELECT \* FROM held_carts ORDER BY updatedAt DESC, createdAt DESC'\)\.all\(\);\s*\}/,
`getHeldCarts(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM held_carts ORDER BY updatedAt DESC, createdAt DESC').all();
    return this.db.prepare('SELECT * FROM held_carts WHERE storeId = ? ORDER BY updatedAt DESC, createdAt DESC').all(storeId);
  }`);

patchGetter(/getProducts\(\)\s*\{[\s\S]*?const stmt = this\.db\.prepare\('SELECT \* FROM products ORDER BY category ASC, productName ASC'\);\s*return stmt\.all\(\);\s*\}/,
`getProducts(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM products ORDER BY category ASC, productName ASC').all();
    return this.db.prepare('SELECT * FROM products WHERE storeId = ? ORDER BY category ASC, productName ASC').all(storeId);
  }`);

patchGetter(/getStockMovements\(\)\s*\{[\s\S]*?return this\.db\.prepare\('SELECT \* FROM stock_movements ORDER BY date DESC, createdAt DESC'\)\.all\(\);\s*\}/,
`getStockMovements(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM stock_movements ORDER BY date DESC, createdAt DESC').all();
    return this.db.prepare('SELECT * FROM stock_movements WHERE storeId = ? ORDER BY date DESC, createdAt DESC').all(storeId);
  }`);

patchGetter(/getAccounters\(\)\s*\{[\s\S]*?const stmt = this\.db\.prepare\('SELECT \* FROM accounters ORDER BY shift ASC, name ASC'\);\s*return stmt\.all\(\);\s*\}/,
`getAccounters() {
    return this.db.prepare('SELECT * FROM accounters ORDER BY shift ASC, name ASC').all();
  }`); // Kept as is if not needed, wait accounters has no storeId in tablesWithStoreId. Oh wait we didn't add it. We only added to expenses etc. 

patchGetter(/getExpenses\(\)\s*\{[\s\S]*?return this\.db\.prepare\('SELECT \* FROM expenses ORDER BY date DESC'\)\.all\(\);\s*\}/,
`getExpenses(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM expenses ORDER BY date DESC').all();
    return this.db.prepare('SELECT * FROM expenses WHERE storeId = ? ORDER BY date DESC').all(storeId);
  }`);

patchGetter(/getCustomers\(\)\s*\{[\s\S]*?return this\.db\.prepare\('SELECT \* FROM customers ORDER BY name ASC'\)\.all\(\);\s*\}/,
`getCustomers(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM customers ORDER BY name ASC').all();
    return this.db.prepare('SELECT * FROM customers WHERE storeId = ? ORDER BY name ASC').all(storeId);
  }`);

patchGetter(/getInvoices\(\)\s*\{[\s\S]*?return this\.db\.prepare\('SELECT \* FROM invoices ORDER BY createdAt DESC'\)\.all\(\);\s*\}/,
`getInvoices(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM invoices ORDER BY createdAt DESC').all();
    return this.db.prepare('SELECT * FROM invoices WHERE storeId = ? ORDER BY createdAt DESC').all(storeId);
  }`);

patchGetter(/getProjects\(\)\s*\{[\s\S]*?return this\.db\.prepare\('SELECT \* FROM projects ORDER BY createdAt DESC'\)\.all\(\);\s*\}/,
`getProjects(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all();
    return this.db.prepare('SELECT * FROM projects WHERE storeId = ? ORDER BY createdAt DESC').all(storeId);
  }`);

patchGetter(/getTasks\(\)\s*\{[\s\S]*?return this\.db\.prepare\('SELECT \* FROM tasks ORDER BY createdAt DESC'\)\.all\(\);\s*\}/,
`getTasks(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
    return this.db.prepare('SELECT * FROM tasks WHERE storeId = ? ORDER BY createdAt DESC').all(storeId);
  }`);

patchGetter(/getTimeEntries\(\)\s*\{[\s\S]*?return this\.db\.prepare\('SELECT \* FROM time_entries ORDER BY date DESC, createdAt DESC'\)\.all\(\);\s*\}/,
`getTimeEntries(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM time_entries ORDER BY date DESC, createdAt DESC').all();
    return this.db.prepare('SELECT * FROM time_entries WHERE storeId = ? ORDER BY date DESC, createdAt DESC').all(storeId);
  }`);

patchGetter(/getLeads\(\)\s*\{[\s\S]*?return this\.db\.prepare\('SELECT \* FROM leads ORDER BY createdAt DESC'\)\.all\(\);\s*\}/,
`getLeads(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM leads ORDER BY createdAt DESC').all();
    return this.db.prepare('SELECT * FROM leads WHERE storeId = ? ORDER BY createdAt DESC').all(storeId);
  }`);

patchGetter(/getAppointments\(\)\s*\{[\s\S]*?return this\.db\.prepare\('SELECT \* FROM appointments ORDER BY appointmentDate ASC, startTime ASC'\)\.all\(\);\s*\}/,
`getAppointments(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM appointments ORDER BY appointmentDate ASC, startTime ASC').all();
    return this.db.prepare('SELECT * FROM appointments WHERE storeId = ? ORDER BY appointmentDate ASC, startTime ASC').all(storeId);
  }`);

patchGetter(/getTimecards\(\)\s*\{[\s\S]*?return this\.db\.prepare\('SELECT \* FROM timecards ORDER BY createdAt DESC'\)\.all\(\);\s*\}/,
`getTimecards(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM timecards ORDER BY createdAt DESC').all();
    return this.db.prepare('SELECT * FROM timecards WHERE storeId = ? ORDER BY createdAt DESC').all(storeId);
  }`);

// 3. Patch Adders (Set storeId on insert)
function replaceInsert(code, funcName, table, insertRegex, replacer) {
  return code.replace(insertRegex, replacer);
}

// sales
code = replaceInsert(code, 'addSale', 'sales',
  /INSERT INTO sales \(([^)]+)\)\s*VALUES \(([^)]+)\)/,
  "INSERT INTO sales ($1, storeId)\n       VALUES ($2, ?)"
);
// Inside addSale, we need to pass storeId to stmt.run.
code = code.replace(/sale\.waiterName \|\| null, userId \|\| null\s*\);/g, "sale.waiterName || null, userId || null, sale.storeId || 'default-store-id'\n    );");

// held_carts
code = replaceInsert(code, 'addHeldCart', 'held_carts',
  /INSERT INTO held_carts \(([^)]+)\) VALUES \(([^)]+)\)/,
  "INSERT INTO held_carts ($1, storeId) VALUES ($2, ?)"
);
code = code.replace(/stmt\.run\(id, heldCart\.name, heldCart\.cartData, heldCart\.waiterName \|\| 'Unknown'\);/g,
  "stmt.run(id, heldCart.name, heldCart.cartData, heldCart.waiterName || 'Unknown', heldCart.storeId || 'default-store-id');");

// products
code = replaceInsert(code, 'addProduct', 'products',
  /INSERT INTO products \(([^)]+)\)\s*VALUES \(([^)]+)\)/,
  "INSERT INTO products ($1, storeId)\n       VALUES ($2, ?)"
);
code = code.replace(/product\.type \|\| 'standard', product\.comboItems \|\| null, product\.unit \|\| 'Pcs'\s*\);/g,
  "product.type || 'standard', product.comboItems || null, product.unit || 'Pcs', product.storeId || 'default-store-id'\n    );");

// stock_movements
code = replaceInsert(code, 'addStockMovement', 'stock_movements',
  /INSERT INTO stock_movements \(([^)]+)\)\s*VALUES \(([^)]+)\)/,
  "INSERT INTO stock_movements ($1, storeId)\n       VALUES ($2, ?)"
);
code = code.replace(/movement\.date, userId \|\| null\);/g,
  "movement.date, userId || null, movement.storeId || 'default-store-id');");

// expenses
code = replaceInsert(code, 'addExpense', 'expenses',
  /INSERT INTO expenses \(([^)]+)\) VALUES \(([^)]+)\)/,
  "INSERT INTO expenses ($1, storeId) VALUES ($2, ?)"
);
code = code.replace(/expense\.projectId \|\| null, expense\.status \|\| 'Unbilled'\);/g,
  "expense.projectId || null, expense.status || 'Unbilled', expense.storeId || 'default-store-id');");

// customers
code = replaceInsert(code, 'addCustomer', 'customers',
  /INSERT INTO customers \(([^)]+)\) VALUES \(([^)]+)\)/,
  "INSERT INTO customers ($1, storeId) VALUES ($2, ?)"
);
code = code.replace(/customer\.accountBalance \|\| 0, customer\.creditLimit \|\| 0\);/g,
  "customer.accountBalance || 0, customer.creditLimit || 0, customer.storeId || 'default-store-id');");

// invoices
code = replaceInsert(code, 'addInvoice', 'invoices',
  /INSERT INTO invoices \(([^)]+)\)\s*VALUES \(([^)]+)\)/,
  "INSERT INTO invoices ($1, storeId)\n       VALUES ($2, ?)"
);
code = code.replace(/inv\.subtotal \|\| 0, inv\.tax \|\| 0, inv\.total \|\| 0, inv\.status \|\| 'PENDING'\);/g,
  "inv.subtotal || 0, inv.tax || 0, inv.total || 0, inv.status || 'PENDING', inv.storeId || 'default-store-id');");

// projects
code = replaceInsert(code, 'addProject', 'projects',
  /INSERT INTO projects \(([^)]+)\)\s*VALUES \(([^)]+)\)/,
  "INSERT INTO projects ($1, storeId)\n       VALUES ($2, ?)"
);
code = code.replace(/project\.budget \|\| 0, project\.description \|\| '', project\.managerId \|\| null\);/g,
  "project.budget || 0, project.description || '', project.managerId || null, project.storeId || 'default-store-id');");

// tasks
code = replaceInsert(code, 'addTask', 'tasks',
  /INSERT INTO tasks \(([^)]+)\)\s*VALUES \(([^)]+)\)/,
  "INSERT INTO tasks ($1, storeId)\n       VALUES ($2, ?)"
);
code = code.replace(/task\.priority \|\| 'Medium', task\.assignedTo \|\| null, task\.dueDate \|\| null\);/g,
  "task.priority || 'Medium', task.assignedTo || null, task.dueDate || null, task.storeId || 'default-store-id');");

// time_entries
code = replaceInsert(code, 'addTimeEntry', 'time_entries',
  /INSERT INTO time_entries \(([^)]+)\)\s*VALUES \(([^)]+)\)/,
  "INSERT INTO time_entries ($1, storeId)\n       VALUES ($2, ?)"
);
code = code.replace(/entry\.status \|\| 'Unbilled', entry\.date\);/g,
  "entry.status || 'Unbilled', entry.date, entry.storeId || 'default-store-id');");

// leads
code = replaceInsert(code, 'addLead', 'leads',
  /INSERT INTO leads \(([^)]+)\)\s*VALUES \(([^)]+)\)/,
  "INSERT INTO leads ($1, storeId)\n       VALUES ($2, ?)"
);
code = code.replace(/lead\.assignedTo \|\| null, lead\.notes \|\| ''\);/g,
  "lead.assignedTo || null, lead.notes || '', lead.storeId || 'default-store-id');");

// appointments
code = replaceInsert(code, 'addAppointment', 'appointments',
  /INSERT INTO appointments \(([^)]+)\)\s*VALUES \(([^)]+)\)/,
  "INSERT INTO appointments ($1, storeId)\n       VALUES ($2, ?)"
);
code = code.replace(/apt\.status \|\| 'Scheduled', apt\.notes \|\| ''\);/g,
  "apt.status || 'Scheduled', apt.notes || '', apt.storeId || 'default-store-id');");

// timecards
code = replaceInsert(code, 'clockIn', 'timecards',
  /INSERT INTO timecards \(([^)]+)\) VALUES \(([^)]+)\)/,
  "INSERT INTO timecards ($1, storeId) VALUES ($2, ?)"
);
code = code.replace(/stmt\.run\(id, userId, clockIn, hourlyRate \|\| 0, clockIn\);/g,
  "stmt.run(id, userId, clockIn, hourlyRate || 0, clockIn, arguments[2] || 'default-store-id');");

fs.writeFileSync(targetPath, code, 'utf8');
console.log("coreStore.ts patched successfully!");

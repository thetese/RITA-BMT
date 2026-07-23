const path = require('path');
const { app, dialog } = require('electron');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const fs = require('fs');

class Store {
  constructor() {
    this.dbPath = path.join(app.getPath('userData'), 'sales.db');
    this.db = new Database(this.dbPath);
    this.init();
  }

  init() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      productName TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      totalPrice REAL NOT NULL,
      costPrice REAL DEFAULT 0,
      date TEXT NOT NULL,
      customerName TEXT DEFAULT '',
      notes TEXT DEFAULT ''
    )`);

    try {
      this.db.exec("ALTER TABLE sales ADD COLUMN createdAt TEXT");
      this.db.exec("UPDATE sales SET createdAt = datetime('now') WHERE createdAt IS NULL");
    } catch (err) {}
    
    try {
      this.db.exec("ALTER TABLE sales ADD COLUMN paymentMethod TEXT DEFAULT 'Cash'");
    } catch (err) {}

    try {
      this.db.exec("ALTER TABLE sales ADD COLUMN customerId TEXT");
    } catch (err) {}

    try {
      this.db.exec("ALTER TABLE sales ADD COLUMN receiptId TEXT");
    } catch (err) {}

    try {
      this.db.exec("ALTER TABLE sales ADD COLUMN receiptSignature TEXT");
    } catch (err) {}

    try {
      this.db.exec("ALTER TABLE sales ADD COLUMN internalData TEXT");
    } catch (err) {}

    try {
      this.db.exec("ALTER TABLE sales ADD COLUMN receiptNo INTEGER");
    } catch (err) {}

    this.db.exec(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      productName TEXT NOT NULL,
      category TEXT NOT NULL,
      unitPrice REAL NOT NULL,
      costPrice REAL DEFAULT 0
    )`);

    try {
      this.db.exec("ALTER TABLE products ADD COLUMN stockQuantity INTEGER DEFAULT 0");
    } catch (err) {}

    try {
      this.db.exec("ALTER TABLE products ADD COLUMN taxTyCd TEXT DEFAULT 'B'");
    } catch (err) {}

    try {
      this.db.exec("ALTER TABLE products ADD COLUMN itemCd TEXT");
    } catch (err) {}

    try {
      this.db.exec("ALTER TABLE products ADD COLUMN itemClsCd TEXT DEFAULT '5059690800'");
    } catch (err) {}

    this.db.exec(`CREATE TABLE IF NOT EXISTS accounters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      shift TEXT NOT NULL
    )`);

    this.db.exec(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`);

    this.db.exec(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )`);

    try {
      this.db.exec("ALTER TABLE users ADD COLUMN securityQuestion TEXT");
    } catch (err) {}

    try {
      this.db.exec("ALTER TABLE users ADD COLUMN securityAnswer TEXT");
    } catch (err) {}

    this.db.exec(`CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    )`);

    this.db.exec(`CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      address TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    )`);

    this.db.exec(`CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      action TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL
    )`);
  }

  logAudit(userId, action, details) {
    try {
      const stmt = this.db.prepare("INSERT INTO audit_logs (id, userId, action, details, timestamp) VALUES (?, ?, ?, ?, datetime('now'))");
      stmt.run(crypto.randomUUID(), userId || 'system', action, details || '');
    } catch (e) {
      console.error("Audit log error:", e);
    }
  }

  // Backup & Restore
  async backupDatabase(window) {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog(window, {
        title: 'Save Database Backup',
        defaultPath: 'rita-sales-backup.sqlite',
        filters: [{ name: 'SQLite Database', extensions: ['sqlite'] }]
      });
      if (canceled || !filePath) return { success: false, error: 'Cancelled' };
      
      await this.db.backup(filePath);
      this.logAudit('system', 'DATABASE_BACKUP', `Backed up to ${filePath}`);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async restoreDatabase(window) {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        title: 'Restore Database Backup',
        filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }],
        properties: ['openFile']
      });
      if (canceled || filePaths.length === 0) return { success: false, error: 'Cancelled' };
      
      const sourcePath = filePaths[0];
      this.db.close();
      fs.copyFileSync(sourcePath, this.dbPath);
      this.db = new Database(this.dbPath);
      this.init();
      this.logAudit('system', 'DATABASE_RESTORE', `Restored from ${sourcePath}`);
      
      return { success: true, restartRequired: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  getSetting(key) {
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get(key);
    return result ? result.value : null;
  }

  setSetting(key, value) {
    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    stmt.run(key, value);
    return true;
  }

  // Users
  getUsers() {
    return this.db.prepare('SELECT id, username, role, createdAt FROM users').all();
  }

  getUserByUsername(username) {
    return this.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }

  addUser(user) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO users (id, username, passwordHash, role, createdAt, securityQuestion, securityAnswer) VALUES (?, ?, ?, ?, datetime('now'), ?, ?)");
    stmt.run(id, user.username, user.passwordHash, user.role, user.securityQuestion || '', user.securityAnswer || '');
    this.logAudit(id, 'USER_CREATED', `Created user ${user.username}`);
    return { ...user, id };
  }

  updateUser(user) {
    const stmt = this.db.prepare('UPDATE users SET username=?, passwordHash=?, role=?, securityQuestion=?, securityAnswer=? WHERE id=?');
    const info = stmt.run(user.username, user.passwordHash, user.role, user.securityQuestion || '', user.securityAnswer || '', user.id);
    return info.changes > 0;
  }

  deleteUser(id, currentUserId) {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const info = stmt.run(id);
    this.logAudit(currentUserId, 'USER_DELETED', `Deleted user ${id}`);
    return info.changes > 0;
  }

  // Sales
  getSales() {
    const stmt = this.db.prepare('SELECT * FROM sales ORDER BY date DESC');
    return stmt.all();
  }

  addSale(sale, userId) {
    const id = crypto.randomUUID();
    
    const stmt = this.db.prepare(
      `INSERT INTO sales (id, productName, category, quantity, unitPrice, totalPrice, costPrice, date, customerName, notes, createdAt, paymentMethod, customerId, receiptId, receiptSignature, internalData, receiptNo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?)`
    );
    
    if (sale.productId) {
      const prod = this.db.prepare('SELECT stockQuantity FROM products WHERE id=?').get(sale.productId);
      if (prod && prod.stockQuantity > 0) {
        this.db.prepare('UPDATE products SET stockQuantity = stockQuantity - ? WHERE id=?').run(sale.quantity, sale.productId);
      }
    }

    stmt.run(
      id, sale.productName, sale.category, sale.quantity, sale.unitPrice, 
      sale.totalPrice, sale.costPrice || 0, sale.date, sale.customerName || '', sale.notes || '',
      sale.paymentMethod || 'Cash', sale.customerId || null, sale.receiptId || null,
      sale.receiptSignature || '', sale.internalData || '', sale.receiptNo || 0
    );
    
    this.logAudit(userId, 'SALE_ADDED', `Added sale ${id} for ${sale.totalPrice}`);
    return { ...sale, id };
  }

  updateSale(sale, userId) {
    const stmt = this.db.prepare(
      `UPDATE sales SET productName=?, category=?, quantity=?, unitPrice=?, totalPrice=?, costPrice=?, date=?, customerName=?, notes=?, paymentMethod=?, customerId=?
       WHERE id=?`
    );
    const info = stmt.run(
      sale.productName, sale.category, sale.quantity, sale.unitPrice, 
      sale.totalPrice, sale.costPrice || 0, sale.date, sale.customerName || '', sale.notes || '', sale.paymentMethod || 'Cash', sale.customerId || null, sale.id
    );
    this.logAudit(userId, 'SALE_UPDATED', `Updated sale ${sale.id}`);
    return info.changes > 0;
  }

  deleteSale(id, userId) {
    const stmt = this.db.prepare(`DELETE FROM sales WHERE id = ?`);
    const info = stmt.run(id);
    this.logAudit(userId, 'SALE_DELETED', `Deleted sale ${id}`);
    return info.changes > 0;
  }

  // Products
  getProducts() {
    const stmt = this.db.prepare('SELECT * FROM products ORDER BY category ASC, productName ASC');
    return stmt.all();
  }

  addProduct(product, userId) {
    const id = crypto.randomUUID();
    const itemCd = product.itemCd || ('RW2NTBA' + Date.now().toString().slice(-7));
    const stmt = this.db.prepare(
      `INSERT INTO products (id, productName, category, unitPrice, costPrice, stockQuantity, taxTyCd, itemCd, itemClsCd)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      id, product.productName, product.category, product.unitPrice, product.costPrice || 0, 
      product.stockQuantity || 0, product.taxTyCd || 'B', itemCd, product.itemClsCd || '5059690800'
    );
    return { ...product, id, itemCd };
  }

  updateProduct(product, userId) {
    const stmt = this.db.prepare(
      `UPDATE products SET productName=?, category=?, unitPrice=?, costPrice=?, stockQuantity=?, taxTyCd=?, itemCd=?, itemClsCd=?
       WHERE id=?`
    );
    const info = stmt.run(
      product.productName, product.category, product.unitPrice, product.costPrice || 0, 
      product.stockQuantity || 0, product.taxTyCd || 'B', product.itemCd || '', product.itemClsCd || '5059690800', product.id
    );
    return info.changes > 0;
  }

  deleteProduct(id, userId) {
    const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }

  // Accounters
  getAccounters() {
    const stmt = this.db.prepare('SELECT * FROM accounters ORDER BY shift ASC, name ASC');
    return stmt.all();
  }

  addAccounter(accounter) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare('INSERT INTO accounters (id, name, shift) VALUES (?, ?, ?)');
    stmt.run(id, accounter.name, accounter.shift || 'General');
    return { ...accounter, id };
  }

  updateAccounter(accounter) {
    const stmt = this.db.prepare('UPDATE accounters SET name=?, shift=? WHERE id=?');
    const info = stmt.run(accounter.name, accounter.shift || 'General', accounter.id);
    return info.changes > 0;
  }

  deleteAccounter(id) {
    const stmt = this.db.prepare('DELETE FROM accounters WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }

  // Expenses
  getExpenses() {
    return this.db.prepare('SELECT * FROM expenses ORDER BY date DESC').all();
  }
  
  addExpense(expense, userId) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO expenses (id, category, amount, date, notes, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))");
    stmt.run(id, expense.category, expense.amount, expense.date, expense.notes || '');
    this.logAudit(userId, 'EXPENSE_ADDED', `Added expense ${id} for ${expense.amount}`);
    return { ...expense, id };
  }
  
  updateExpense(expense, userId) {
    const stmt = this.db.prepare('UPDATE expenses SET category=?, amount=?, date=?, notes=? WHERE id=?');
    const info = stmt.run(expense.category, expense.amount, expense.date, expense.notes || '', expense.id);
    this.logAudit(userId, 'EXPENSE_UPDATED', `Updated expense ${expense.id}`);
    return info.changes > 0;
  }
  
  deleteExpense(id, userId) {
    const stmt = this.db.prepare('DELETE FROM expenses WHERE id = ?');
    const info = stmt.run(id);
    this.logAudit(userId, 'EXPENSE_DELETED', `Deleted expense ${id}`);
    return info.changes > 0;
  }

  // Customers
  getCustomers() {
    return this.db.prepare('SELECT * FROM customers ORDER BY name ASC').all();
  }
  
  addCustomer(customer, userId) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO customers (id, name, phone, email, address, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))");
    stmt.run(id, customer.name, customer.phone || '', customer.email || '', customer.address || '');
    return { ...customer, id };
  }
  
  updateCustomer(customer, userId) {
    const stmt = this.db.prepare('UPDATE customers SET name=?, phone=?, email=?, address=? WHERE id=?');
    const info = stmt.run(customer.name, customer.phone || '', customer.email || '', customer.address || '', customer.id);
    return info.changes > 0;
  }
  
  deleteCustomer(id, userId) {
    const stmt = this.db.prepare('DELETE FROM customers WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }
}

module.exports = Store;

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { dialog } = require('electron');
const fs = require('fs');
const Database = require('better-sqlite3');

module.exports = {
  logAudit(userId, action, details) {
    try {
      const stmt = this.db.prepare("INSERT INTO audit_logs (id, userId, action, details, timestamp) VALUES (?, ?, ?, ?, datetime('now'))");
      stmt.run(crypto.randomUUID(), userId || 'system', action, details || '');
    } catch (e) {
      console.error("Audit log error:", e);
    }
  },

  // Sync Queue
  addSyncJob(endpoint, payload) {
    try {
      const stmt = this.db.prepare("INSERT INTO sync_queue (id, endpoint, payload, createdAt) VALUES (?, ?, ?, datetime('now'))");
      stmt.run(crypto.randomUUID(), endpoint, JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to add to sync queue:", e);
    }
  },

  getPendingSyncJobs() {
    return this.db.prepare("SELECT * FROM sync_queue WHERE status = 'PENDING' ORDER BY createdAt ASC").all();
  },

  markSyncJobComplete(id) {
    const stmt = this.db.prepare("DELETE FROM sync_queue WHERE id = ?");
    stmt.run(id);
  },

  incrementSyncJobRetry(id) {
    const stmt = this.db.prepare("UPDATE sync_queue SET retryCount = retryCount + 1 WHERE id = ?");
    stmt.run(id);
  },

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
  },

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
  },

  getSetting(key) {
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get(key);
    return result ? result.value : null;
  },

  setSetting(key, value) {
    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    stmt.run(key, value);
    return true;
  },

  // Users
  getUsers() {
    return this.db.prepare('SELECT id, username, role, createdAt FROM users').all();
  },

  getUserByUsername(username) {
    return this.db.prepare('SELECT id, username, role, pin, createdAt, securityQuestion, securityAnswer FROM users WHERE username = ?').get(username);
  },

  verifyLogin(username, password) {
    const user = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return null;

    let isValid = false;
    // Check if the hash is a bcrypt hash (starts with $2a$ or $2b$ or $2y$)
    if (user.passwordHash.startsWith('$2')) {
      isValid = bcrypt.compareSync(password, user.passwordHash);
    } else {
      // Legacy plaintext password check
      if (user.passwordHash === password) {
        isValid = true;
        // Transparently upgrade to bcrypt
        try {
          const newHash = bcrypt.hashSync(password, 10);
          this.db.prepare('UPDATE users SET passwordHash = ? WHERE id = ?').run(newHash, user.id);
        } catch (err) {
          console.error("Failed to upgrade password hash:", err);
        }
      }
    }

    if (isValid) {
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    }
    return null;
  },

  addUser(user) {
    const id = crypto.randomUUID();
    const hash = bcrypt.hashSync(user.passwordHash, 10);
    const stmt = this.db.prepare("INSERT INTO users (id, username, passwordHash, role, pin, createdAt, securityQuestion, securityAnswer, hourlyRate, commissionRate) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?)");
    stmt.run(id, user.username, hash, user.role, user.pin || '', user.securityQuestion || '', user.securityAnswer || '', user.hourlyRate || 0, user.commissionRate || 0);
    this.logAudit(id, 'USER_CREATED', `Created user ${user.username}`);
    this.addSyncJob('users:upsert', { ...user, id, passwordHash: hash });
    return { ...user, id };
  },

  updateUser(user) {
    let stmt, info;
    if (user.passwordHash) {
      const hash = bcrypt.hashSync(user.passwordHash, 10);
      stmt = this.db.prepare('UPDATE users SET username=?, passwordHash=?, role=?, pin=?, securityQuestion=?, securityAnswer=?, hourlyRate=?, commissionRate=? WHERE id=?');
      info = stmt.run(user.username, hash, user.role, user.pin || '', user.securityQuestion || '', user.securityAnswer || '', user.hourlyRate || 0, user.commissionRate || 0, user.id);
    } else {
      stmt = this.db.prepare('UPDATE users SET username=?, role=?, pin=?, securityQuestion=?, securityAnswer=?, hourlyRate=?, commissionRate=? WHERE id=?');
      info = stmt.run(user.username, user.role, user.pin || '', user.securityQuestion || '', user.securityAnswer || '', user.hourlyRate || 0, user.commissionRate || 0, user.id);
    }
    if (info.changes > 0) {
      this.addSyncJob('users:upsert', user);
    }
    return info.changes > 0;
  },

  deleteUser(id, currentUserId) {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.logAudit(currentUserId, 'USER_DELETED', `Deleted user ${id}`);
      this.addSyncJob('users:delete', { id });
    }
    return info.changes > 0;
  },


  // Sales
  getSales() {
    const stmt = this.db.prepare('SELECT * FROM sales ORDER BY date DESC');
    return stmt.all();
  },

  addSale(sale, userId) {
    const id = crypto.randomUUID();
    
    const stmt = this.db.prepare(
      `INSERT INTO sales (id, productName, category, quantity, unitPrice, totalPrice, costPrice, date, customerName, notes, createdAt, paymentMethod, customerId, receiptId, receiptSignature, internalData, receiptNo, status, paymentDetails, discountAmount, discountRate, waiterName, userId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    
    if (sale.productId) {
      const prod = this.db.prepare('SELECT stockQuantity, type, comboItems FROM products WHERE id=?').get(sale.productId);
      if (prod) {
        if (prod.type === 'combo' && prod.comboItems) {
          try {
            const comboItems = JSON.parse(prod.comboItems);
            for (const item of comboItems) {
              const totalRequired = item.quantity * sale.quantity;
              this.db.prepare('UPDATE products SET stockQuantity = stockQuantity - ? WHERE id = ?').run(totalRequired, item.productId);
            }
          } catch(err) {
            console.error("Error deducting combo items:", err);
          }
        } else if (prod.stockQuantity > 0) {
          this.db.prepare('UPDATE products SET stockQuantity = stockQuantity - ? WHERE id=?').run(sale.quantity, sale.productId);
        }
      }
      
      // Deduct ingredients based on recipe
      try {
        const recipes = this.db.prepare('SELECT ingredientId, quantityRequired FROM recipes WHERE productId = ?').all(sale.productId);
        for (const recipe of recipes) {
          const totalRequired = recipe.quantityRequired * sale.quantity;
          this.db.prepare('UPDATE ingredients SET stockQuantity = stockQuantity - ? WHERE id = ?').run(totalRequired, recipe.ingredientId);
        }
      } catch (err) {
        console.error("Error deducting ingredients:", err);
      }
    }

    stmt.run(
      id, sale.productName, sale.category, sale.quantity, sale.unitPrice, 
      sale.totalPrice, sale.costPrice || 0, sale.date, sale.customerName || '', sale.notes || '',
      sale.paymentMethod || 'Cash', sale.customerId || null, sale.receiptId || null,
      sale.receiptSignature || '', sale.internalData || '', sale.receiptNo || 0,
      sale.status || 'COMPLETED', sale.paymentDetails || null, sale.discountAmount || 0, sale.discountRate || 0, sale.waiterName || null, userId || null
    );
    
    // Add loyalty points if customerId exists
    if (sale.customerId && sale.totalPrice > 0) {
      const earnedPoints = Math.floor(sale.totalPrice / 1000);
      if (earnedPoints > 0) {
        try {
          this.db.prepare('UPDATE customers SET points = COALESCE(points, 0) + ? WHERE id=?').run(earnedPoints, sale.customerId);
        } catch (err) { console.error("Error adding points:", err); }
      }
    }

    this.logAudit(userId, 'SALE_ADDED', `Added sale ${id} for ${sale.totalPrice}`);
    
    // Enqueue for cloud sync
    this.addSyncJob('sales:upsert', { ...sale, id });

    return { ...sale, id };
  },


  
  checkoutTransaction(payload) {
    const { items, customerId, customerName, paymentMethod, paymentDetails, discountAmount, discountRate, waiterName, userId, receiptId, notes, date, status, receiptSignature, internalData, receiptNo } = payload;
    
    // SQLite transaction
    const transaction = this.db.transaction(() => {
      const results = [];
      let totalEarnedPoints = 0;
      
      for (const item of items) {
        const id = crypto.randomUUID();
        const sale = { ...item };
        
        const stmt = this.db.prepare(
          `INSERT INTO sales (id, productName, category, quantity, unitPrice, totalPrice, costPrice, date, customerName, notes, createdAt, paymentMethod, customerId, receiptId, receiptSignature, internalData, receiptNo, status, paymentDetails, discountAmount, discountRate, waiterName, userId)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        
        if (sale.productId) {
          const prod = this.db.prepare('SELECT stockQuantity, type, comboItems FROM products WHERE id=?').get(sale.productId);
          if (prod) {
            if (prod.type === 'combo' && prod.comboItems) {
              const comboItems = JSON.parse(prod.comboItems);
              for (const cItem of comboItems) {
                const totalRequired = cItem.quantity * sale.quantity;
                this.db.prepare('UPDATE products SET stockQuantity = stockQuantity - ? WHERE id = ?').run(totalRequired, cItem.productId);
              }
            } else if (prod.stockQuantity > 0) {
              this.db.prepare('UPDATE products SET stockQuantity = stockQuantity - ? WHERE id=?').run(sale.quantity, sale.productId);
            }
          }
          
          // Deduct ingredients based on recipe
          const recipes = this.db.prepare('SELECT ingredientId, quantityRequired FROM recipes WHERE productId = ?').all(sale.productId);
          for (const recipe of recipes) {
            const totalRequired = recipe.quantityRequired * sale.quantity;
            this.db.prepare('UPDATE ingredients SET stockQuantity = stockQuantity - ? WHERE id = ?').run(totalRequired, recipe.ingredientId);
          }
        }

        stmt.run(
          id, sale.productName, sale.category, sale.quantity, sale.unitPrice, 
          sale.totalPrice, sale.costPrice || 0, date || sale.date || new Date().toISOString(), customerName || '', notes || sale.notes || '',
          paymentMethod || 'Cash', customerId || null, receiptId || null,
          receiptSignature || '', internalData || '', receiptNo || 0,
          status || 'COMPLETED', paymentDetails ? JSON.stringify(paymentDetails) : null, discountAmount || 0, discountRate || 0, waiterName || null, userId || null
        );
        
        if (customerId && sale.totalPrice > 0) {
          totalEarnedPoints += Math.floor(sale.totalPrice / 1000);
        }
        
        results.push({ ...sale, id });
      }
      
      if (customerId && totalEarnedPoints > 0) {
        this.db.prepare('UPDATE customers SET points = COALESCE(points, 0) + ? WHERE id=?').run(totalEarnedPoints, customerId);
      }
      
      return results;
    });

    try {
      const savedItems = transaction();
      
      // Audit and sync
      this.logAudit(userId, 'CHECKOUT_COMPLETED', `Checkout completed with ${savedItems.length} items`);
      for (const sale of savedItems) {
        this.addSyncJob('sales:upsert', sale);
      }
      
      return savedItems;
    } catch (e) {
      console.error("Checkout transaction failed:", e);
      throw e;
    }
  },

  updateSale(sale, userId) {
    const stmt = this.db.prepare(
      `UPDATE sales SET productName=?, category=?, quantity=?, unitPrice=?, totalPrice=?, costPrice=?, date=?, customerName=?, notes=?, paymentMethod=?, customerId=?, status=?, paymentDetails=?, discountAmount=?, discountRate=?, waiterName=?
       WHERE id=?`
    );
    const info = stmt.run(
      sale.productName, sale.category, sale.quantity, sale.unitPrice, 
      sale.totalPrice, sale.costPrice || 0, sale.date, sale.customerName || '', sale.notes || '', sale.paymentMethod || 'Cash', sale.customerId || null, 
      sale.status || 'COMPLETED', sale.paymentDetails || null, sale.discountAmount || 0, sale.discountRate || 0, sale.waiterName || null,
      sale.id
    );
    if (info.changes > 0) {
      this.logAudit(userId, 'SALE_UPDATED', `Updated sale ${sale.id}`);
      this.addSyncJob('sales:upsert', sale);
    }
    return info.changes > 0;
  },

  deleteSale(id, userId) {
    const sale = this.db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
    if (sale) {
      // Restore product stock
      const prod = this.db.prepare('SELECT type, comboItems FROM products WHERE id=?').get(sale.productId);
      if (prod && prod.type === 'combo' && prod.comboItems) {
        try {
          const comboItems = JSON.parse(prod.comboItems);
          for (const item of comboItems) {
            const totalRequired = item.quantity * sale.quantity;
            this.db.prepare('UPDATE products SET stockQuantity = stockQuantity + ? WHERE id = ?').run(totalRequired, item.productId);
          }
        } catch(err) {
          console.error("Error restoring combo items:", err);
        }
      } else {
        this.db.prepare('UPDATE products SET stockQuantity = stockQuantity + ? WHERE id=?').run(sale.quantity, sale.productId);
      }
        
      // Restore ingredients based on recipe
      try {
        const recipes = this.db.prepare('SELECT ingredientId, quantityRequired FROM recipes WHERE productId = ?').all(sale.productId);
        for (const recipe of recipes) {
          const totalRequired = recipe.quantityRequired * sale.quantity;
          this.db.prepare('UPDATE ingredients SET stockQuantity = stockQuantity + ? WHERE id = ?').run(totalRequired, recipe.ingredientId);
        }
      } catch (err) {
        console.error("Error restoring ingredients:", err);
      }
      
      // Deduct loyalty points if applicable
      if (sale.customerId && sale.totalPrice > 0) {
        const earnedPoints = Math.floor(sale.totalPrice / 1000);
        if (earnedPoints > 0) {
          try {
            this.db.prepare('UPDATE customers SET points = MAX(0, COALESCE(points, 0) - ?) WHERE id=?').run(earnedPoints, sale.customerId);
          } catch (err) { console.error("Error deducting points:", err); }
        }
      }
    }

    const stmt = this.db.prepare(`DELETE FROM sales WHERE id = ?`);
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.logAudit(userId, 'SALE_DELETED', `Deleted sale ${id}`);
      this.addSyncJob('sales:delete', { id });
    }
    return info.changes > 0;
  },

  refundSale(id, userId) {
    const sale = this.db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
    if (!sale) return false;
    if (sale.status === 'REFUNDED') return true; // Already refunded

    // Restore product stock
    if (sale.productId) {
      const prod = this.db.prepare('SELECT type, comboItems FROM products WHERE id=?').get(sale.productId);
      if (prod && prod.type === 'combo' && prod.comboItems) {
        try {
          const comboItems = JSON.parse(prod.comboItems);
          for (const item of comboItems) {
            const totalRequired = item.quantity * sale.quantity;
            this.db.prepare('UPDATE products SET stockQuantity = stockQuantity + ? WHERE id = ?').run(totalRequired, item.productId);
          }
        } catch(err) {
          console.error("Error restoring combo items:", err);
        }
      } else {
        this.db.prepare('UPDATE products SET stockQuantity = stockQuantity + ? WHERE id=?').run(sale.quantity, sale.productId);
      }
      
      // Restore ingredients based on recipe
      try {
        const recipes = this.db.prepare('SELECT ingredientId, quantityRequired FROM recipes WHERE productId = ?').all(sale.productId);
        for (const recipe of recipes) {
          const totalRequired = recipe.quantityRequired * sale.quantity;
          this.db.prepare('UPDATE ingredients SET stockQuantity = stockQuantity + ? WHERE id = ?').run(totalRequired, recipe.ingredientId);
        }
      } catch (err) {
        console.error("Error restoring ingredients:", err);
      }
    }
    
    // Deduct loyalty points if applicable
    if (sale.customerId && sale.totalPrice > 0) {
      const earnedPoints = Math.floor(sale.totalPrice / 1000);
      if (earnedPoints > 0) {
        try {
          this.db.prepare('UPDATE customers SET points = MAX(0, COALESCE(points, 0) - ?) WHERE id=?').run(earnedPoints, sale.customerId);
        } catch (err) { console.error("Error deducting points:", err); }
      }
    }

    const stmt = this.db.prepare(`UPDATE sales SET status = 'REFUNDED' WHERE id = ?`);
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.logAudit(userId, 'SALE_REFUNDED', `Refunded sale ${id}`);
      this.addSyncJob('sales:upsert', { ...sale, status: 'REFUNDED' });
    }
    return info.changes > 0;
  },

  // Held Carts
  getHeldCarts() {
    return this.db.prepare('SELECT * FROM held_carts ORDER BY updatedAt DESC, createdAt DESC').all();
  },

  addHeldCart(heldCart) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO held_carts (id, name, cartData, createdAt, updatedAt, waiterName) VALUES (?, ?, ?, datetime('now'), datetime('now'), ?)");
    stmt.run(id, heldCart.name, heldCart.cartData, heldCart.waiterName || 'Unknown');
    const newCart = { ...heldCart, id };
    this.addSyncJob('held_carts:upsert', newCart);
    return newCart;
  },

  updateHeldCart(id, heldCart) {
    const stmt = this.db.prepare("UPDATE held_carts SET cartData = ?, updatedAt = datetime('now') WHERE id = ?");
    const info = stmt.run(heldCart.cartData, id);
    if (info.changes > 0) {
      const updated = this.db.prepare("SELECT * FROM held_carts WHERE id = ?").get(id);
      this.addSyncJob('held_carts:upsert', updated);
    }
    return info.changes > 0;
  },

  updateCartItemStatus(cartId, productId, status) {
    const cart = this.db.prepare("SELECT cartData, name FROM held_carts WHERE id = ?").get(cartId);
    if (!cart) return { success: false };
    let cartData = JSON.parse(cart.cartData);
    let updated = false;
    let productName = '';
    cartData = cartData.map(item => {
      if (item.productId === productId) {
        updated = true;
        productName = item.productName;
        return { ...item, status };
      }
      return item;
    });
    if (updated) {
      const stmt = this.db.prepare("UPDATE held_carts SET cartData = ?, updatedAt = datetime('now') WHERE id = ?");
      stmt.run(JSON.stringify(cartData), cartId);
      const fullCart = this.db.prepare("SELECT * FROM held_carts WHERE id = ?").get(cartId);
      this.addSyncJob('held_carts:upsert', fullCart);
      return { success: true, productName, cartName: cart.name, newStatus: status };
    }
    return { success: false };
  },

  deleteHeldCart(id) {
    const stmt = this.db.prepare('DELETE FROM held_carts WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.addSyncJob('held_carts:delete', { id });
    }
    return info.changes > 0;
  },

  // Products
  getProducts() {
    const stmt = this.db.prepare('SELECT * FROM products ORDER BY category ASC, productName ASC');
    return stmt.all();
  },

  addProduct(product, userId) {
    const id = crypto.randomUUID();
    const itemCd = product.itemCd || ('RW2NTBA' + Date.now().toString().slice(-7));
    const stmt = this.db.prepare(
      `INSERT INTO products (id, productName, category, unitPrice, costPrice, stockQuantity, taxTyCd, itemCd, itemClsCd, barcode, lowStockThreshold, type, comboItems)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      id, product.productName, product.category, product.unitPrice, product.costPrice || 0, 
      product.stockQuantity || 0, product.taxTyCd || 'B', itemCd, product.itemClsCd || '5059690800', product.barcode || null, product.lowStockThreshold || 5,
      product.type || 'standard', product.comboItems || null
    );
    const newProduct = { ...product, id, itemCd, type: product.type || 'standard', comboItems: product.comboItems || null };
    this.addSyncJob('products:upsert', newProduct);
    return newProduct;
  },

  updateProduct(product, userId) {
    const stmt = this.db.prepare(
      `UPDATE products SET productName=?, category=?, unitPrice=?, costPrice=?, stockQuantity=?, taxTyCd=?, itemCd=?, itemClsCd=?, barcode=?, lowStockThreshold=?, type=?, comboItems=?
       WHERE id=?`
    );
    const info = stmt.run(
      product.productName, product.category, product.unitPrice, product.costPrice || 0, 
      product.stockQuantity || 0, product.taxTyCd || 'B', product.itemCd || '', product.itemClsCd || '5059690800', product.barcode || null, product.lowStockThreshold || 5,
      product.type || 'standard', product.comboItems || null,
      product.id
    );
    if (info.changes > 0) {
      this.addSyncJob('products:upsert', product);
    }
    return info.changes > 0;
  },

  deleteProduct(id, userId) {
    const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.addSyncJob('products:delete', { id });
    }
    return info.changes > 0;
  },

  // Stock Movements
  getStockMovements() {
    return this.db.prepare('SELECT * FROM stock_movements ORDER BY date DESC, createdAt DESC').all();
  },

  addStockMovement(movement, userId) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(
      `INSERT INTO stock_movements (id, productId, productName, quantity, type, reason, date, userId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    );
    stmt.run(id, movement.productId, movement.productName, movement.quantity, movement.type, movement.reason || '', movement.date, userId || null);

    // Update actual stock
    if (movement.productId) {
      if (movement.type === 'IN') {
        this.db.prepare('UPDATE products SET stockQuantity = stockQuantity + ? WHERE id=?').run(movement.quantity, movement.productId);
      } else if (movement.type === 'OUT') {
        this.db.prepare('UPDATE products SET stockQuantity = stockQuantity - ? WHERE id=?').run(movement.quantity, movement.productId);
      }
    }
    this.logAudit(userId, 'STOCK_MOVEMENT', `${movement.type} ${movement.quantity} of ${movement.productName} for ${movement.reason}`);
    
    const newMovement = { ...movement, id };
    this.addSyncJob('stock_movements:upsert', newMovement);
    return newMovement;
  },

  // Accounters
  getAccounters() {
    const stmt = this.db.prepare('SELECT * FROM accounters ORDER BY shift ASC, name ASC');
    return stmt.all();
  },

  addAccounter(accounter) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare('INSERT INTO accounters (id, name, shift) VALUES (?, ?, ?)');
    stmt.run(id, accounter.name, accounter.shift || 'General');
    const newAccounter = { ...accounter, id };
    this.addSyncJob('accounters:upsert', newAccounter);
    return newAccounter;
  },

  updateAccounter(accounter) {
    const stmt = this.db.prepare('UPDATE accounters SET name=?, shift=? WHERE id=?');
    const info = stmt.run(accounter.name, accounter.shift || 'General', accounter.id);
    if (info.changes > 0) {
      this.addSyncJob('accounters:upsert', accounter);
    }
    return info.changes > 0;
  },

  deleteAccounter(id) {
    const stmt = this.db.prepare('DELETE FROM accounters WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.addSyncJob('accounters:delete', { id });
    }
    return info.changes > 0;
  },

  // Expenses
  getExpenses() {
    return this.db.prepare('SELECT * FROM expenses ORDER BY date DESC').all();
  },
  
  addExpense(expense, userId) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO expenses (id, category, amount, date, notes, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))");
    stmt.run(id, expense.category, expense.amount, expense.date, expense.notes || '');
    this.logAudit(userId, 'EXPENSE_ADDED', `Added expense ${id} for ${expense.amount}`);
    const newExpense = { ...expense, id };
    this.addSyncJob('expenses:upsert', newExpense);
    return newExpense;
  },
  
  updateExpense(expense, userId) {
    const stmt = this.db.prepare('UPDATE expenses SET category=?, amount=?, date=?, notes=? WHERE id=?');
    const info = stmt.run(expense.category, expense.amount, expense.date, expense.notes || '', expense.id);
    if (info.changes > 0) {
      this.logAudit(userId, 'EXPENSE_UPDATED', `Updated expense ${expense.id}`);
      this.addSyncJob('expenses:upsert', expense);
    }
    return info.changes > 0;
  },
  
  deleteExpense(id, userId) {
    const stmt = this.db.prepare('DELETE FROM expenses WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.logAudit(userId, 'EXPENSE_DELETED', `Deleted expense ${id}`);
      this.addSyncJob('expenses:delete', { id });
    }
    return info.changes > 0;
  },

  // Customers
  getCustomers() {
    return this.db.prepare('SELECT * FROM customers ORDER BY name ASC').all();
  },
  
  addCustomer(customer, userId) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO customers (id, name, phone, email, address, accountBalance, creditLimit, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))");
    stmt.run(id, customer.name, customer.phone || '', customer.email || '', customer.address || '', customer.accountBalance || 0, customer.creditLimit || 0);
    const newCustomer = { ...customer, id, accountBalance: customer.accountBalance || 0, creditLimit: customer.creditLimit || 0 };
    this.addSyncJob('customers:upsert', newCustomer);
    return newCustomer;
  },
  
  updateCustomer(customer, userId) {
    const stmt = this.db.prepare('UPDATE customers SET name=?, phone=?, email=?, address=?, accountBalance=?, creditLimit=? WHERE id=?');
    const info = stmt.run(customer.name, customer.phone || '', customer.email || '', customer.address || '', customer.accountBalance || 0, customer.creditLimit || 0, customer.id);
    if (info.changes > 0) {
      this.addSyncJob('customers:upsert', customer);
    }
    return info.changes > 0;
  },
  
  adjustCustomerBalance(id, amount) {
    const stmt = this.db.prepare('UPDATE customers SET accountBalance = COALESCE(accountBalance, 0) + ? WHERE id=?');
    const info = stmt.run(amount, id);
    if (info.changes > 0) {
      const customer = this.db.prepare('SELECT * FROM customers WHERE id=?').get(id);
      this.addSyncJob('customers:upsert', customer);
    }
    return info.changes > 0;
  },
  
  deductCustomerPoints(id, points) {
    const stmt = this.db.prepare('UPDATE customers SET points = MAX(0, COALESCE(points, 0) - ?) WHERE id=?');
    const info = stmt.run(points, id);
    if (info.changes > 0) {
      const customer = this.db.prepare('SELECT * FROM customers WHERE id=?').get(id);
      this.addSyncJob('customers:upsert', customer);
    }
    return info.changes > 0;
  },
  
  deleteCustomer(id, userId) {
    const stmt = this.db.prepare('DELETE FROM customers WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.addSyncJob('customers:delete', { id });
    }
    return info.changes > 0;
  },

  // --- Invoices ---
  getInvoices() {
    return this.db.prepare('SELECT * FROM invoices ORDER BY createdAt DESC').all();
  },

  addInvoice(inv) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO invoices (id, customerName, customerAddress, items, subtotal, tax, total, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(id, inv.customerName || '', inv.customerAddress || '', inv.items || '[]', inv.subtotal || 0, inv.tax || 0, inv.total || 0, inv.status || 'PENDING');
    return { ...inv, id };
  },

  updateInvoice(inv) {
    const stmt = this.db.prepare(`
      UPDATE invoices SET customerName=?, customerAddress=?, items=?, subtotal=?, tax=?, total=? WHERE id=?
    `);
    const info = stmt.run(inv.customerName || '', inv.customerAddress || '', inv.items || '[]', inv.subtotal || 0, inv.tax || 0, inv.total || 0, inv.id);
    return info.changes > 0;
  },

  updateInvoiceStatus(id, status) {
    const stmt = this.db.prepare('UPDATE invoices SET status = ? WHERE id = ?');
    const info = stmt.run(status, id);
    return info.changes > 0;
  },

  deleteInvoice(id) {
    const stmt = this.db.prepare('DELETE FROM invoices WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  },

  // --- Low Stock ---
  getLowStockItems() {
    const lowProducts = this.db.prepare("SELECT id, productName as name, stockQuantity, lowStockThreshold, 'product' as type FROM products WHERE stockQuantity <= lowStockThreshold").all();
    let lowIngredients = [];
    try {
      lowIngredients = this.db.prepare("SELECT id, name, stockQuantity, lowStockThreshold, 'ingredient' as type FROM ingredients WHERE stockQuantity <= lowStockThreshold").all();
    } catch (e) {
      // Ingredients table might not exist in a pure retail environment, ignore
    }
    return [...lowProducts, ...lowIngredients];
  },

  // Mobile API Helpers
  getRecentSales(limit = 10) {
    const stmt = this.db.prepare('SELECT * FROM sales ORDER BY createdAt DESC LIMIT ?');
    return stmt.all(limit);
  },

  // --- Timecards ---
  getTimecards() {
    return this.db.prepare('SELECT * FROM timecards ORDER BY createdAt DESC').all();
  },
  
  clockIn(userId, hourlyRate) {
    const id = require('uuid').v4();
    const clockIn = new Date().toISOString();
    const stmt = this.db.prepare('INSERT INTO timecards (id, userId, clockIn, hourlyRate, createdAt) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, userId, clockIn, hourlyRate || 0, clockIn);
    const tc = this.db.prepare('SELECT * FROM timecards WHERE id=?').get(id);
    this.addSyncJob('timecards:upsert', tc);
    return tc;
  },

  clockOut(id) {
    const clockOut = new Date().toISOString();
    const stmt = this.db.prepare('UPDATE timecards SET clockOut = ?, updatedAt = ? WHERE id = ?');
    stmt.run(clockOut, clockOut, id);
    const tc = this.db.prepare('SELECT * FROM timecards WHERE id=?').get(id);
    this.addSyncJob('timecards:upsert', tc);
    return tc;
  },
  
  updateUserRates(userId, hourlyRate, commissionRate) {
    const stmt = this.db.prepare('UPDATE users SET hourlyRate = ?, commissionRate = ? WHERE id = ?');
    stmt.run(hourlyRate, commissionRate, userId);
    return true;
  }
};
export {};

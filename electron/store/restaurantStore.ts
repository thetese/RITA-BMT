const crypto = require('crypto');

module.exports = {
  // Waiters
  getWaiters(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM waiters ORDER BY name ASC').all();
    return this.db.prepare('SELECT * FROM waiters WHERE storeId = ? ORDER BY name ASC').all(storeId);
  },

  addWaiter(waiter) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO waiters (id, name, createdAt, storeId) VALUES (?, ?, datetime('now'), ?)");
    stmt.run(id, waiter.name, waiter.storeId || 'default-store-id');
    const newWaiter = { ...waiter, id };
    this.addSyncJob('waiters:upsert', newWaiter);
    return newWaiter;
  },

  updateWaiter(waiter) {
    const stmt = this.db.prepare("UPDATE waiters SET name = ? WHERE id = ?");
    const info = stmt.run(waiter.name, waiter.id);
    if (info.changes > 0) {
      this.addSyncJob('waiters:upsert', waiter);
    }
    return info.changes > 0;
  },

  deleteWaiter(id) {
    const stmt = this.db.prepare('DELETE FROM waiters WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.addSyncJob('waiters:delete', { id });
    }
    return info.changes > 0;
  },

  // --- Ingredients ---
  getIngredients() {
    const stmt = this.db.prepare('SELECT * FROM ingredients ORDER BY name ASC');
    return stmt.all();
  },
  
  addIngredient(ingredient, userId) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO ingredients (id, name, unit, stockQuantity, costPerUnit, lowStockThreshold, createdAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))");
    stmt.run(id, ingredient.name, ingredient.unit, ingredient.stockQuantity || 0, ingredient.costPerUnit || 0, ingredient.lowStockThreshold || 5);
    this.logAudit(userId, 'CREATE_INGREDIENT', `Created ingredient ${ingredient.name}`);
    const newIngredient = { ...ingredient, id };
    this.addSyncJob('ingredients:upsert', newIngredient);
    return newIngredient;
  },
  
  updateIngredient(ingredient, userId) {
    const stmt = this.db.prepare('UPDATE ingredients SET name=?, unit=?, stockQuantity=?, costPerUnit=?, lowStockThreshold=? WHERE id=?');
    const info = stmt.run(ingredient.name, ingredient.unit, ingredient.stockQuantity || 0, ingredient.costPerUnit || 0, ingredient.lowStockThreshold || 5, ingredient.id);
    if (info.changes > 0) {
      this.logAudit(userId, 'UPDATE_INGREDIENT', `Updated ingredient ${ingredient.name}`);
      this.addSyncJob('ingredients:upsert', ingredient);
    }
    return info.changes > 0;
  },
  
  deleteIngredient(id, userId) {
    // Delete related recipes first
    this.db.prepare('DELETE FROM recipes WHERE ingredientId = ?').run(id);
    const stmt = this.db.prepare('DELETE FROM ingredients WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.logAudit(userId, 'DELETE_INGREDIENT', `Deleted ingredient ID ${id}`);
      this.addSyncJob('ingredients:delete', { id });
    }
    return info.changes > 0;
  },

  // --- Recipes ---
  getRecipes(productId) {
    if (productId) {
      const stmt = this.db.prepare('SELECT r.*, i.name as ingredientName, i.unit FROM recipes r JOIN ingredients i ON r.ingredientId = i.id WHERE r.productId = ?');
      return stmt.all(productId);
    }
    const stmt = this.db.prepare('SELECT r.*, i.name as ingredientName, i.unit FROM recipes r JOIN ingredients i ON r.ingredientId = i.id');
    return stmt.all();
  },
  
  addRecipe(recipe, userId) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO recipes (id, productId, ingredientId, quantityRequired) VALUES (?, ?, ?, ?)");
    stmt.run(id, recipe.productId, recipe.ingredientId, recipe.quantityRequired);
    this.logAudit(userId, 'CREATE_RECIPE', `Created recipe for product ${recipe.productId}`);
    const newRecipe = { ...recipe, id };
    this.addSyncJob('recipes:upsert', newRecipe);
    return newRecipe;
  },
  
  deleteRecipe(id, userId) {
    const stmt = this.db.prepare('DELETE FROM recipes WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.addSyncJob('recipes:delete', { id });
    }
    return info.changes > 0;
  },

  // --- Tables ---
  getTables(storeId) {
    if (!storeId || storeId === 'general') return this.db.prepare('SELECT * FROM restaurant_tables ORDER BY zone ASC, name ASC').all();
    return this.db.prepare('SELECT * FROM restaurant_tables WHERE storeId = ? ORDER BY zone ASC, name ASC').all(storeId);
  },

  addTable(table, userId) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO restaurant_tables (id, name, zone, seats, posX, posY, createdAt, storeId) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?)");
    stmt.run(id, table.name, table.zone, table.seats || 4, table.posX || 0, table.posY || 0, table.storeId || 'default-store-id');
    this.logAudit(userId, 'CREATE_TABLE', `Created table ${table.name} in zone ${table.zone}`);
    const newTable = { ...table, id };
    this.addSyncJob('restaurant_tables:upsert', newTable);
    return newTable;
  },

  updateTable(table, userId) {
    const stmt = this.db.prepare('UPDATE restaurant_tables SET name=?, zone=?, seats=?, posX=?, posY=? WHERE id=?');
    const info = stmt.run(table.name, table.zone, table.seats || 4, table.posX || 0, table.posY || 0, table.id);
    if (info.changes > 0) {
      this.logAudit(userId, 'UPDATE_TABLE', `Updated table ${table.name}`);
      this.addSyncJob('restaurant_tables:upsert', table);
    }
    return info.changes > 0;
  },

  deleteTable(id, userId) {
    const stmt = this.db.prepare('DELETE FROM restaurant_tables WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.logAudit(userId, 'DELETE_TABLE', `Deleted table ID ${id}`);
      this.addSyncJob('restaurant_tables:delete', { id });
    }
    return info.changes > 0;
  },

  // --- Shifts ---
  getActiveShift(userId) {
    return this.db.prepare("SELECT * FROM shifts WHERE userId = ? AND status = 'OPEN'").get(userId);
  },

  openShift(userId, startingCash) {
    const existing = this.getActiveShift(userId);
    if (existing) return existing;

    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO shifts (id, userId, startingCash, openedAt, status) VALUES (?, ?, ?, datetime('now'), 'OPEN')");
    stmt.run(id, userId, startingCash);
    this.logAudit(userId, 'SHIFT_OPENED', `Opened shift with starting cash ${startingCash}`);
    const shift = this.getActiveShift(userId);
    this.addSyncJob('shifts:upsert', shift);
    return shift;
  },

  getExpectedCash(shiftId) {
    const shift = this.db.prepare("SELECT * FROM shifts WHERE id = ?").get(shiftId);
    if (!shift) throw new Error("Shift not found");
    
    const sales = this.db.prepare(`
      SELECT SUM(totalPrice) as totalCashSales 
      FROM sales 
      WHERE userId = ? AND paymentMethod = 'Cash' AND createdAt >= ?
    `).get(shift.userId, shift.openedAt);

    const totalCashSales = sales.totalCashSales || 0;
    return shift.startingCash + totalCashSales;
  },

  closeShift(shiftId, actualCash) {
    const shift = this.db.prepare("SELECT * FROM shifts WHERE id = ? AND status = 'OPEN'").get(shiftId);
    if (!shift) throw new Error("Shift not found or already closed");

    const expectedCash = this.getExpectedCash(shiftId);

    const stmt = this.db.prepare("UPDATE shifts SET endingCashExpected = ?, endingCashActual = ?, closedAt = datetime('now'), status = 'CLOSED' WHERE id = ?");
    stmt.run(expectedCash, actualCash, shiftId);
    
    this.logAudit(shift.userId, 'SHIFT_CLOSED', `Closed shift. Expected: ${expectedCash}, Actual: ${actualCash}`);
    const closedShift = this.db.prepare("SELECT * FROM shifts WHERE id = ?").get(shiftId);
    this.addSyncJob('shifts:upsert', closedShift);
    return closedShift;
  }
};
export {};

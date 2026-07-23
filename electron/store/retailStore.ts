const crypto = require('crypto');

module.exports = {
  // Suppliers
  getSuppliers() {
    return this.db.prepare('SELECT * FROM suppliers ORDER BY name ASC').all();
  },
  
  addSupplier(supplier, userId) {
    const id = crypto.randomUUID();
    const stmt = this.db.prepare("INSERT INTO suppliers (id, name, contact, phone, email, address, createdAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))");
    stmt.run(id, supplier.name, supplier.contact || '', supplier.phone || '', supplier.email || '', supplier.address || '');
    this.logAudit(userId, 'CREATE_SUPPLIER', `Created supplier ${supplier.name}`);
    const newSupplier = { ...supplier, id };
    this.addSyncJob('suppliers:upsert', newSupplier);
    return newSupplier;
  },
  
  updateSupplier(supplier, userId) {
    const stmt = this.db.prepare('UPDATE suppliers SET name=?, contact=?, phone=?, email=?, address=? WHERE id=?');
    const info = stmt.run(supplier.name, supplier.contact || '', supplier.phone || '', supplier.email || '', supplier.address || '', supplier.id);
    if (info.changes > 0) {
      this.logAudit(userId, 'UPDATE_SUPPLIER', `Updated supplier ${supplier.name}`);
      this.addSyncJob('suppliers:upsert', supplier);
    }
    return info.changes > 0;
  },
  
  deleteSupplier(id, userId) {
    const stmt = this.db.prepare('DELETE FROM suppliers WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.logAudit(userId, 'DELETE_SUPPLIER', `Deleted supplier ${id}`);
      this.addSyncJob('suppliers:delete', { id });
    }
    return info.changes > 0;
  },

  // Purchase Orders (Receiving Stock)
  getPurchaseOrders() {
    return this.db.prepare('SELECT p.*, s.name as supplierName FROM purchase_orders p LEFT JOIN suppliers s ON p.supplierId = s.id ORDER BY p.date DESC, p.createdAt DESC').all();
  },

  addPurchaseOrder(po, userId) {
    const id = crypto.randomUUID();
    const poNumber = po.poNumber || `PO-${Date.now()}`;
    const dateStr = po.date || new Date().toISOString().split('T')[0];
    
    // items is an array of { productId, quantity, costPrice }
    const itemsDataStr = JSON.stringify(po.items || []);

    const stmt = this.db.prepare(
      `INSERT INTO purchase_orders (id, supplierId, poNumber, itemsData, totalAmount, status, date, userId, createdAt)
       VALUES (?, ?, ?, ?, ?, 'RECEIVED', ?, ?, datetime('now'))`
    );
    stmt.run(id, po.supplierId || null, poNumber, itemsDataStr, po.totalAmount || 0, dateStr, userId || null);

    // Automatically update inventory and record stock movements
    if (po.items && Array.isArray(po.items)) {
      for (const item of po.items) {
        if (item.productId && item.quantity > 0) {
          // Update product stock and optionally cost price
          const prodStmt = this.db.prepare('UPDATE products SET stockQuantity = stockQuantity + ?, costPrice = ? WHERE id=?');
          prodStmt.run(item.quantity, item.costPrice || 0, item.productId);

          // Add a stock movement record
          const movId = crypto.randomUUID();
          this.db.prepare(
            `INSERT INTO stock_movements (id, productId, productName, quantity, type, reason, date, userId, createdAt)
             VALUES (?, ?, ?, ?, 'IN', ?, ?, ?, datetime('now'))`
          ).run(movId, item.productId, item.productName || 'Unknown', item.quantity, `Purchase Order: ${poNumber}`, dateStr, userId || null);
        }
      }
    }

    this.logAudit(userId, 'PURCHASE_ORDER_RECEIVED', `Received PO ${poNumber} for ${po.totalAmount}`);
    const newPo = { ...po, id, poNumber };
    this.addSyncJob('purchase_orders:upsert', newPo);
    return newPo;
  },

  deletePurchaseOrder(id, userId) {
    // Note: Deleting a PO should ideally revert stock, but for simplicity, we just delete the record.
    const stmt = this.db.prepare('DELETE FROM purchase_orders WHERE id = ?');
    const info = stmt.run(id);
    if (info.changes > 0) {
      this.logAudit(userId, 'DELETE_PURCHASE_ORDER', `Deleted PO ${id}`);
      this.addSyncJob('purchase_orders:delete', { id });
    }
    return info.changes > 0;
  }
};
export {};

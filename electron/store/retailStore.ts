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
    const status = po.status || 'DRAFT';
    
    // items is an array of { productId, quantity, costPrice }
    const itemsDataStr = JSON.stringify(po.items || []);

    const stmt = this.db.prepare(
      `INSERT INTO purchase_orders (id, supplierId, poNumber, itemsData, totalAmount, status, date, userId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    );
    stmt.run(id, po.supplierId || null, poNumber, itemsDataStr, po.totalAmount || 0, status, dateStr, userId || null);

    // If instantly received, update inventory immediately
    if (status === 'RECEIVED' && po.items && Array.isArray(po.items)) {
      this._receivePurchaseOrderItems(poNumber, po.items, dateStr, userId);
    }

    this.logAudit(userId, 'PURCHASE_ORDER_ADDED', `Added PO ${poNumber} for ${po.totalAmount} (${status})`);
    const newPo = { ...po, id, poNumber, status };
    this.addSyncJob('purchase_orders:upsert', newPo);
    return newPo;
  },

  updatePurchaseOrderStatus(id, status, userId) {
    const po = this.db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);
    if (!po) throw new Error('PO not found');
    if (po.status === 'RECEIVED') throw new Error('PO is already received');

    const stmt = this.db.prepare('UPDATE purchase_orders SET status = ? WHERE id = ?');
    const info = stmt.run(status, id);

    if (info.changes > 0) {
      if (status === 'RECEIVED') {
        const items = JSON.parse(po.itemsData);
        this._receivePurchaseOrderItems(po.poNumber, items, po.date, userId);
      }
      this.logAudit(userId, 'PURCHASE_ORDER_STATUS_UPDATE', `Updated PO ${po.poNumber} status to ${status}`);
      po.status = status;
      this.addSyncJob('purchase_orders:upsert', po);
    }
    return info.changes > 0;
  },

  _receivePurchaseOrderItems(poNumber, items, dateStr, userId) {
    for (const item of items) {
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

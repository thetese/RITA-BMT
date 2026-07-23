export const up = async ({ context: db }: { context: any }) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      isDefault INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS warehouse_stock (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      warehouseId TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      lastUpdated TEXT,
      FOREIGN KEY (productId) REFERENCES products(id),
      FOREIGN KEY (warehouseId) REFERENCES warehouses(id)
    );
  `);

  // Create default warehouse if none exists
  const existing = db.prepare(`SELECT * FROM warehouses WHERE isDefault = 1`).get();
  if (!existing) {
    const defaultId = 'warehouse-' + Date.now();
    db.prepare(`INSERT INTO warehouses (id, name, location, isDefault) VALUES (?, ?, ?, ?)`).run(
      defaultId, 'Main Warehouse', 'HQ', 1
    );

    // Migrate existing stock to this warehouse
    const products = db.prepare(`SELECT id, stockQuantity FROM products`).all();
    const insertStock = db.prepare(`INSERT INTO warehouse_stock (id, productId, warehouseId, quantity, lastUpdated) VALUES (?, ?, ?, ?, ?)`);
    
    db.transaction(() => {
      for (const p of products) {
        insertStock.run('ws-' + Date.now() + Math.random().toString(36).substr(2, 5), p.id, defaultId, p.stockQuantity || 0, new Date().toISOString());
      }
    })();
  }
};

export const down = async ({ context: db }: { context: any }) => {
  db.exec(`
    DROP TABLE IF EXISTS warehouse_stock;
    DROP TABLE IF EXISTS warehouses;
  `);
};

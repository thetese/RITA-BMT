export const up = async ({ context: db }) => {
  // Fix suppliers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers_new (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      createdAt TEXT
    )
  `);

  try {
    db.exec(`INSERT INTO suppliers_new (id, name, contact) SELECT id, name, waiterName FROM suppliers`);
  } catch (e) {
    console.error("Migration 002: Could not migrate old supplier data, continuing.", e);
  }

  db.exec(`DROP TABLE IF EXISTS suppliers`);
  db.exec(`ALTER TABLE suppliers_new RENAME TO suppliers`);

  // Fix purchase_orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_orders_new (
      id TEXT PRIMARY KEY,
      supplierId TEXT,
      poNumber TEXT,
      itemsData TEXT,
      totalAmount REAL DEFAULT 0,
      status TEXT,
      date TEXT,
      userId TEXT,
      createdAt TEXT
    )
  `);

  try {
    db.exec(`INSERT INTO purchase_orders_new (id, supplierId, poNumber, date, itemsData, totalAmount, status, createdAt) 
             SELECT id, supplierId, poNumber, date, items, totalAmount, status, createdAt FROM purchase_orders`);
  } catch (e) {
    console.error("Migration 002: Could not migrate old po data, continuing.", e);
  }

  db.exec(`DROP TABLE IF EXISTS purchase_orders`);
  db.exec(`ALTER TABLE purchase_orders_new RENAME TO purchase_orders`);
};

export const down = async ({ context: db }) => {
  // Not fully reversible safely, but we can restore structure
  db.exec(`DROP TABLE IF EXISTS suppliers`);
  db.exec(`CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    waiterName TEXT,
    userId TEXT
  )`);

  db.exec(`DROP TABLE IF EXISTS purchase_orders`);
  db.exec(`CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      supplierId TEXT,
      supplierName TEXT,
      poNumber TEXT,
      date TEXT,
      items TEXT, 
      totalAmount REAL DEFAULT 0,
      status TEXT,
      createdAt TEXT
  )`);
};

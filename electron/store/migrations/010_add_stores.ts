export const up = async ({ context: db }) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // Insert a default store if it doesn't exist
  const existingStore = db.prepare("SELECT * FROM stores LIMIT 1").get();
  if (!existingStore) {
    db.exec(`
      INSERT INTO stores (id, name, address, phone, createdAt) 
      VALUES ('default-store-id', 'Main Branch', '', '', datetime('now'))
    `);
  }

  // Add storeId column to tables that need it but don't have it
  const tablesToAddStoreId = [
    'expenses', 'stock_movements', 'ingredients', 'recipes', 
    'invoices', 'appointments', 'tasks', 'projects', 'leads'
  ];

  for (const table of tablesToAddStoreId) {
    try {
      // Check if storeId exists
      const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all();
      if (!tableInfo.some(col => col.name === 'storeId')) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN storeId TEXT`);
      }
    } catch (e) {
      console.warn(`Could not add storeId to ${table}:`, e);
    }
  }

  // Update existing rows in core tables to map to the default store if they lack one
  const tablesWithStoreId = [
    'sales', 'held_carts', 'products', 'users', 'timecards', 
    'customers', 'restaurant_tables', 'shifts', ...tablesToAddStoreId
  ];

  for (const table of tablesWithStoreId) {
    try {
      db.exec(`UPDATE ${table} SET storeId = 'default-store-id' WHERE storeId IS NULL OR storeId = 'local' OR storeId = ''`);
    } catch (err) {
      console.warn(`Could not update storeId for ${table}`, err);
    }
  }
};

export const down = async ({ context: db }) => {
  db.exec(`DROP TABLE IF EXISTS stores`);
};

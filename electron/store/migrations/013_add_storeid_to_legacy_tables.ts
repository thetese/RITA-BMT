export const up = async ({ context: db }) => {
  const tablesToAddStoreId = ['accounters', 'waiters', 'restaurant_tables'];

  for (const table of tablesToAddStoreId) {
    try {
      // Check if table exists
      const tableExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
      if (!tableExists) continue;

      // Check if storeId exists
      const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all();
      if (!tableInfo.some(col => col.name === 'storeId')) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN storeId TEXT`);
      }
      
      // Update existing rows to map to default store if they lack one
      db.exec(`UPDATE ${table} SET storeId = 'default-store-id' WHERE storeId IS NULL OR storeId = 'local' OR storeId = ''`);
    } catch (e) {
      console.warn(`Could not add storeId to ${table}:`, e);
    }
  }
};

export const down = async ({ context: db }) => {
  // SQLite doesn't easily support dropping columns, so down migration is intentionally left minimal or empty.
};

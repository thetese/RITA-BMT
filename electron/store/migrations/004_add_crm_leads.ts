export const up = async ({ context: db }) => {
  db.exec(`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    contactInfo TEXT DEFAULT '',
    projectDescription TEXT DEFAULT '',
    estimatedValue REAL DEFAULT 0,
    stage TEXT DEFAULT 'New',
    assignedTo TEXT,
    notes TEXT DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT,
    storeId TEXT,
    syncStatus TEXT DEFAULT 'PENDING'
  )`);
};

export const down = async ({ context: db }) => {
  db.exec(`DROP TABLE IF EXISTS leads`);
};

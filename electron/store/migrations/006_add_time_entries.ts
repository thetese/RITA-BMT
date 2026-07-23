export const up = async ({ context: db }) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      projectId TEXT,
      userId TEXT NOT NULL,
      description TEXT DEFAULT '',
      hours REAL NOT NULL DEFAULT 0,
      billable INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Unbilled',
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT,
      storeId TEXT,
      syncStatus TEXT DEFAULT 'PENDING',
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);
  
  try {
    db.exec(`ALTER TABLE expenses ADD COLUMN projectId TEXT`);
  } catch (e) {}
  
  try {
    db.exec(`ALTER TABLE expenses ADD COLUMN status TEXT DEFAULT 'Unbilled'`);
  } catch (e) {}
};

export const down = async ({ context: db }) => {
  db.exec(`
    DROP TABLE IF EXISTS time_entries;
  `);
};

export const up = async ({ context: db }: { context: any }) => {
  // Add taxRate to users
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasTaxRate = tableInfo.some((col: any) => col.name === 'taxRate');
    if (!hasTaxRate) {
      db.exec(`ALTER TABLE users ADD COLUMN taxRate REAL DEFAULT 0;`);
    }
  } catch (e) {
    console.error("Error adding taxRate to users", e);
  }

  // Create Leave Requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS hr_leave_requests (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL, -- e.g., 'PTO', 'SICK', 'UNPAID'
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
      notes TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);
};

export const down = async ({ context: db }: { context: any }) => {
  db.exec(`DROP TABLE IF EXISTS hr_leave_requests;`);
};

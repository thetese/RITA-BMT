export const up = async ({ context: db }) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      clientName TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      startDate TEXT,
      deadline TEXT,
      budget REAL DEFAULT 0,
      description TEXT DEFAULT '',
      managerId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT,
      storeId TEXT,
      syncStatus TEXT DEFAULT 'PENDING'
    );
    
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'To Do',
      priority TEXT DEFAULT 'Medium',
      assignedTo TEXT,
      dueDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT,
      storeId TEXT,
      syncStatus TEXT DEFAULT 'PENDING',
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);
};

export const down = async ({ context: db }) => {
  db.exec(`
    DROP TABLE IF EXISTS tasks;
    DROP TABLE IF EXISTS projects;
  `);
};

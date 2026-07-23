export function up({ context: db }: { context: any }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS installed_modules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      version TEXT,
      icon TEXT,
      iconBg TEXT,
      gradient TEXT,
      entry_file TEXT,
      is_active BOOLEAN DEFAULT 1,
      path TEXT
    );
  `);
}

export function down({ context: db }: { context: any }) {
  db.exec(`DROP TABLE IF EXISTS installed_modules;`);
}

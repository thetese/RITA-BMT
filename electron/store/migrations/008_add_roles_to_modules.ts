export function up({ context: db }: { context: any }) {
  // SQLite doesn't support IF NOT EXISTS for ADD COLUMN directly, but we can try/catch
  try {
    db.exec(`ALTER TABLE installed_modules ADD COLUMN roles TEXT;`);
  } catch (e: any) {
    if (!e.message.includes('duplicate column name')) {
      throw e;
    }
  }
}

export function down({ context: db }: { context: any }) {
  // SQLite ALTER TABLE DROP COLUMN is only supported in newer versions, 
  // so we leave it empty for down migration.
}

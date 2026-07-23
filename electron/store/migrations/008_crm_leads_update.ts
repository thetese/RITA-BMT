export const up = async ({ context: db }: { context: any }) => {
  // Add probability column to crm_leads if it doesn't exist
  try {
    const tableInfo = db.prepare("PRAGMA table_info(crm_leads)").all();
    const hasProbability = tableInfo.some((col: any) => col.name === 'probability');
    if (!hasProbability) {
      db.exec(`ALTER TABLE crm_leads ADD COLUMN probability REAL DEFAULT 10;`);
    }
  } catch (e) {
    console.error("Error adding probability to crm_leads", e);
  }
};

export const down = async ({ context: db }: { context: any }) => {
  // SQLite doesn't easily support dropping columns without recreating the table.
  // We'll leave it as a no-op for down migration.
};

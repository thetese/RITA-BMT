export const up = async ({ context: db }: { context: any }) => {
  db.exec(`
    ALTER TABLE products ADD COLUMN unit TEXT DEFAULT 'Pcs';
  `);
};

export const down = async ({ context: db }: { context: any }) => {
  try {
    db.exec(`
      ALTER TABLE products DROP COLUMN unit;
    `);
  } catch (e) {
    console.log("Could not drop column unit (SQLite version might not support it).");
  }
};

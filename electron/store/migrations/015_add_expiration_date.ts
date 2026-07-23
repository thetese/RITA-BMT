export const up = async ({ context: db }: { context: any }) => {
  db.exec(`
    ALTER TABLE products ADD COLUMN expirationDate TEXT;
  `);
};

export const down = async ({ context: db }: { context: any }) => {
  // SQLite doesn't easily support dropping columns without recreating the table.
};

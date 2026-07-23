import { Umzug } from 'umzug';

export const up = async ({ context: db }: { context: any }) => {
  // Add EBM columns to products table
  db.exec(`
    ALTER TABLE products ADD COLUMN ebm_status TEXT DEFAULT 'PENDING';
  `);
};

export const down = async ({ context: db }: { context: any }) => {
  // Rollback logic
};

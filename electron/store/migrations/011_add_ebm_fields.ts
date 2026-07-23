import { Umzug } from 'umzug';

export const up = async ({ context: db }: { context: any }) => {
  // Add EBM columns to sales table
  db.exec(`
    ALTER TABLE sales ADD COLUMN ebm_receipt_number TEXT;
    ALTER TABLE sales ADD COLUMN ebm_qr_url TEXT;
    ALTER TABLE sales ADD COLUMN ebm_signature TEXT;
    ALTER TABLE sales ADD COLUMN ebm_internal_data TEXT;
    ALTER TABLE sales ADD COLUMN ebm_status TEXT DEFAULT 'PENDING';
  `);
};

export const down = async ({ context: db }: { context: any }) => {
  // SQLite doesn't easily support dropping columns without recreating the table.
  // For rollback, we generally leave them or write a complex recreation script.
};

export const up = async ({ context: db }: { context: any }) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stock_transfers (
      id TEXT PRIMARY KEY,
      transferNumber TEXT NOT NULL,
      fromWarehouseId TEXT NOT NULL,
      toWarehouseId TEXT NOT NULL,
      itemsData TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      notes TEXT,
      date TEXT NOT NULL,
      userId TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (fromWarehouseId) REFERENCES warehouses(id),
      FOREIGN KEY (toWarehouseId) REFERENCES warehouses(id)
    );
  `);
};

export const down = async ({ context: db }: { context: any }) => {
  db.exec(`
    DROP TABLE IF EXISTS stock_transfers;
  `);
};

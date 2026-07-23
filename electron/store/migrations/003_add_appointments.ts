export const up = async ({ context: db }) => {
  db.exec(`CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    customerPhone TEXT,
    serviceId TEXT NOT NULL,
    serviceName TEXT NOT NULL,
    providerId TEXT NOT NULL,
    providerName TEXT NOT NULL,
    appointmentDate TEXT NOT NULL,
    startTime TEXT NOT NULL,
    duration INTEGER DEFAULT 60,
    status TEXT DEFAULT 'Scheduled',
    notes TEXT DEFAULT '',
    createdAt TEXT NOT NULL,
    storeId TEXT,
    updatedAt TEXT,
    deletedAt TEXT,
    syncStatus TEXT DEFAULT 'PENDING'
  )`);
};

export const down = async ({ context: db }) => {
  db.exec(`DROP TABLE IF EXISTS appointments`);
};

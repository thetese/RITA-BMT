export const up = async ({ context: db }) => {
  db.exec(`CREATE TABLE IF NOT EXISTS loyalty_points (
    customerId TEXT PRIMARY KEY,
    points INTEGER NOT NULL DEFAULT 0,
    updatedAt TEXT
  );`);
};

export const down = async ({ context: db }) => {
  db.exec('DROP TABLE IF EXISTS loyalty_points;');
};

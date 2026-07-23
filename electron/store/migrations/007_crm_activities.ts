export const up = async ({ context: db }: { context: any }) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS crm_activities (
      id TEXT PRIMARY KEY,
      leadId TEXT NOT NULL,
      type TEXT NOT NULL, -- e.g., 'CALL', 'EMAIL', 'MEETING', 'NOTE'
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      userId TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (leadId) REFERENCES crm_leads(id)
    );
  `);
};

export const down = async ({ context: db }: { context: any }) => {
  db.exec(`
    DROP TABLE IF EXISTS crm_activities;
  `);
};

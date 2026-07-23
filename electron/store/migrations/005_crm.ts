export const up = async ({ context: db }: { context: any }) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS crm_leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'NEW',
      expectedValue REAL DEFAULT 0,
      notes TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // Seed sample leads if empty
  const existing = db.prepare(`SELECT count(*) as count FROM crm_leads`).get();
  if (existing.count === 0) {
    const defaultLeads = [
      { name: 'John Doe', company: 'Acme Corp', email: 'john@acme.com', phone: '555-0100', status: 'NEW', expectedValue: 5000 },
      { name: 'Jane Smith', company: 'TechFlow', email: 'jane@techflow.io', phone: '555-0101', status: 'CONTACTED', expectedValue: 12000 },
      { name: 'Bob Johnson', company: 'Global Ind.', email: 'bob@global.com', phone: '555-0102', status: 'QUALIFIED', expectedValue: 8500 }
    ];

    const insertLead = db.prepare(`INSERT INTO crm_leads (id, name, company, email, phone, status, expectedValue, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    db.transaction(() => {
      for (const lead of defaultLeads) {
        insertLead.run('lead-' + Date.now() + Math.random().toString(36).substring(2, 6), lead.name, lead.company, lead.email, lead.phone, lead.status, lead.expectedValue, new Date().toISOString());
      }
    })();
  }
};

export const down = async ({ context: db }: { context: any }) => {
  db.exec(`
    DROP TABLE IF EXISTS crm_leads;
  `);
};

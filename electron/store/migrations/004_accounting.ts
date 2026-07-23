export const up = async ({ context: db }: { context: any }) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      isActive INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      referenceId TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS journal_lines (
      id TEXT PRIMARY KEY,
      entryId TEXT NOT NULL,
      accountId TEXT NOT NULL,
      debit REAL NOT NULL DEFAULT 0,
      credit REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (entryId) REFERENCES journal_entries(id) ON DELETE CASCADE,
      FOREIGN KEY (accountId) REFERENCES accounts(id)
    );
  `);

  // Seed default Chart of Accounts if empty
  const existing = db.prepare(`SELECT count(*) as count FROM accounts`).get();
  if (existing.count === 0) {
    const defaultAccounts = [
      { code: '1000', name: 'Cash', type: 'Asset' },
      { code: '1100', name: 'Accounts Receivable', type: 'Asset' },
      { code: '1200', name: 'Inventory', type: 'Asset' },
      { code: '2000', name: 'Accounts Payable', type: 'Liability' },
      { code: '3000', name: 'Owner Equity', type: 'Equity' },
      { code: '4000', name: 'Sales Revenue', type: 'Revenue' },
      { code: '5000', name: 'Cost of Goods Sold', type: 'Expense' },
      { code: '6000', name: 'Operating Expenses', type: 'Expense' }
    ];

    const insertAccount = db.prepare(`INSERT INTO accounts (id, code, name, type) VALUES (?, ?, ?, ?)`);
    db.transaction(() => {
      for (const acc of defaultAccounts) {
        insertAccount.run('acc-' + acc.code, acc.code, acc.name, acc.type);
      }
    })();
  }
};

export const down = async ({ context: db }: { context: any }) => {
  db.exec(`
    DROP TABLE IF EXISTS journal_lines;
    DROP TABLE IF EXISTS journal_entries;
    DROP TABLE IF EXISTS accounts;
  `);
};

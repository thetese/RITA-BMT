export const up = async ({ context: db }) => {
  db.exec(`CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    productName TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unitPrice REAL NOT NULL,
    totalPrice REAL NOT NULL,
    costPrice REAL DEFAULT 0,
    date TEXT NOT NULL,
    customerName TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    createdAt TEXT,
    paymentMethod TEXT DEFAULT 'Cash',
    customerId TEXT,
    receiptId TEXT,
    receiptSignature TEXT,
    internalData TEXT,
    receiptNo INTEGER,
    status TEXT DEFAULT 'COMPLETED',
    waiterName TEXT,
    paymentDetails TEXT,
    discountAmount REAL DEFAULT 0,
    discountRate REAL DEFAULT 0,
    userId TEXT,
    storeId TEXT,
    updatedAt TEXT,
    deletedAt TEXT,
    syncStatus TEXT DEFAULT 'PENDING'
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS held_carts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cartData TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    waiterName TEXT,
    storeId TEXT,
    updatedAt TEXT,
    deletedAt TEXT,
    syncStatus TEXT DEFAULT 'PENDING'
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    productName TEXT NOT NULL,
    category TEXT NOT NULL,
    unitPrice REAL NOT NULL,
    costPrice REAL DEFAULT 0,
    stockQuantity INTEGER DEFAULT 0,
    taxTyCd TEXT DEFAULT 'B',
    itemCd TEXT,
    itemClsCd TEXT DEFAULT '5059690800',
    barcode TEXT,
    lowStockThreshold REAL DEFAULT 5,
    type TEXT DEFAULT 'standard',
    comboItems TEXT,
    storeId TEXT,
    updatedAt TEXT,
    deletedAt TEXT,
    syncStatus TEXT DEFAULT 'PENDING'
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    productName TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    type TEXT NOT NULL,
    reason TEXT,
    date TEXT NOT NULL,
    userId TEXT,
    createdAt TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS accounters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    shift TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    securityQuestion TEXT,
    securityAnswer TEXT,
    pin TEXT,
    hourlyRate REAL DEFAULT 0,
    commissionRate REAL DEFAULT 0,
    storeId TEXT,
    updatedAt TEXT,
    deletedAt TEXT,
    syncStatus TEXT DEFAULT 'PENDING'
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS timecards (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    clockIn TEXT NOT NULL,
    clockOut TEXT,
    hourlyRate REAL DEFAULT 0,
    createdAt TEXT NOT NULL,
    storeId TEXT DEFAULT 'local',
    updatedAt TEXT,
    deletedAt TEXT,
    syncStatus TEXT DEFAULT 'pending'
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    notes TEXT DEFAULT '',
    createdAt TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS waiters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    createdAt TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    accountBalance REAL DEFAULT 0,
    creditLimit REAL DEFAULT 0,
    storeId TEXT,
    updatedAt TEXT,
    deletedAt TEXT,
    syncStatus TEXT DEFAULT 'PENDING'
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    userId TEXT,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS ingredients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    stockQuantity REAL DEFAULT 0,
    costPerUnit REAL DEFAULT 0,
    createdAt TEXT NOT NULL,
    lowStockThreshold REAL DEFAULT 5
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    endpoint TEXT NOT NULL,
    payload TEXT NOT NULL,
    retryCount INTEGER DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    createdAt TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    ingredientId TEXT NOT NULL,
    quantityRequired REAL NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(id),
    FOREIGN KEY (ingredientId) REFERENCES ingredients(id)
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS restaurant_tables (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    zone TEXT NOT NULL,
    seats INTEGER DEFAULT 4,
    posX REAL DEFAULT 0,
    posY REAL DEFAULT 0,
    createdAt TEXT NOT NULL,
    storeId TEXT,
    updatedAt TEXT,
    deletedAt TEXT,
    syncStatus TEXT DEFAULT 'PENDING'
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS shifts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    startingCash REAL NOT NULL,
    endingCashExpected REAL DEFAULT 0,
    endingCashActual REAL DEFAULT 0,
    openedAt TEXT NOT NULL,
    closedAt TEXT,
    status TEXT DEFAULT 'OPEN',
    storeId TEXT,
    updatedAt TEXT,
    deletedAt TEXT,
    syncStatus TEXT DEFAULT 'PENDING'
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    waiterName TEXT,
    userId TEXT
  )`);

  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      supplierId TEXT,
      supplierName TEXT,
      poNumber TEXT,
      date TEXT,
      items TEXT, 
      totalAmount REAL DEFAULT 0,
      status TEXT,
      createdAt TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      customerName TEXT,
      customerAddress TEXT,
      items TEXT, 
      subtotal REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'PENDING',
      createdAt TEXT
    )
  `);
};

export const down = async ({ context: db }) => {
  const tables = [
    'sales', 'held_carts', 'products', 'stock_movements', 'accounters',
    'settings', 'users', 'timecards', 'expenses', 'waiters', 'customers',
    'audit_logs', 'ingredients', 'sync_queue', 'recipes', 'restaurant_tables',
    'shifts', 'suppliers', 'purchase_orders', 'invoices'
  ];
  for (const table of tables) {
    db.exec(`DROP TABLE IF EXISTS ${table}`);
  }
};

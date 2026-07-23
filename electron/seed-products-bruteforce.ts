const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const dbs = [
  'C:/Users/pc/AppData/Roaming/Electron/sales.db',
  'C:/Users/pc/AppData/Roaming/fidele-sales-reports/sales.db',
  'C:/Users/pc/AppData/Roaming/rita-sales-reports/sales.db'
];

const defaultProducts = [
  // --- Restaurant Categories ---
  { category: "Starters", name: "Spring Rolls", price: 3500, cost: 1000 },
  { category: "Starters", name: "Garlic Bread", price: 2500, cost: 500 },
  { category: "Main Course", name: "Grilled Chicken", price: 8000, cost: 3500 },
  { category: "Main Course", name: "Beef Steak", price: 12000, cost: 6000 },
  { category: "Fast Food", name: "Cheeseburger", price: 5000, cost: 2000 },
  { category: "Fast Food", name: "Margherita Pizza", price: 6500, cost: 2500 },
  { category: "Desserts", name: "Chocolate Cake", price: 4000, cost: 1500 },
  { category: "Desserts", name: "Vanilla Ice Cream", price: 2500, cost: 800 },
  { category: "Hot Beverages", name: "Espresso", price: 1500, cost: 300 },
  { category: "Hot Beverages", name: "Cappuccino", price: 2500, cost: 500 },
  { category: "Cold Beverages", name: "Fresh Orange Juice", price: 2000, cost: 800 },
  { category: "Cold Beverages", name: "Soda (Coke/Fanta)", price: 1000, cost: 400 },
  { category: "Alcoholic Drinks", name: "Local Beer (Mutzig)", price: 1500, cost: 800 },
  { category: "Alcoholic Drinks", name: "Red Wine (Glass)", price: 4000, cost: 1500 },

  // --- Supermarket Categories ---
  { category: "Groceries", name: "Basmati Rice 1kg", price: 2500, cost: 1500 },
  { category: "Groceries", name: "Spaghetti 500g", price: 1200, cost: 800 },
  { category: "Groceries", name: "Wheat Flour 2kg", price: 3000, cost: 2000 },
  { category: "Dairy & Eggs", name: "Fresh Milk 1L", price: 1000, cost: 700 },
  { category: "Dairy & Eggs", name: "Tray of Eggs (30)", price: 3500, cost: 2500 },
  { category: "Snacks & Sweets", name: "Potato Chips", price: 1500, cost: 900 },
  { category: "Snacks & Sweets", name: "Milk Chocolate Bar", price: 1200, cost: 600 },
  { category: "Household Items", name: "Dishwashing Liquid", price: 2000, cost: 1200 },
  { category: "Household Items", name: "Toilet Paper (4 Pack)", price: 1800, cost: 1000 },
  { category: "Personal Care", name: "Shampoo 400ml", price: 4500, cost: 2800 },
  { category: "Personal Care", name: "Toothpaste", price: 1500, cost: 800 },
  { category: "Bakery", name: "Sliced Bread", price: 1200, cost: 700 },
  { category: "Bakery", name: "Butter Croissant", price: 800, cost: 400 },
  { category: "Frozen Foods", name: "Frozen Mixed Veggies", price: 3000, cost: 1800 }
];

console.log("Seeding products...");

for (const dbPath of dbs) {
  try {
    const db = new Database(dbPath);
    
    // Ensure table exists
    db.exec(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      productName TEXT NOT NULL,
      category TEXT NOT NULL,
      unitPrice REAL NOT NULL,
      costPrice REAL DEFAULT 0,
      stockQuantity INTEGER DEFAULT 0,
      lowStockThreshold REAL DEFAULT 5
    )`);

    const insertStmt = db.prepare(`
      INSERT INTO products (id, productName, category, unitPrice, costPrice, stockQuantity, lowStockThreshold)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    let added = 0;
    for (const p of defaultProducts) {
      const existing = db.prepare("SELECT id FROM products WHERE productName = ?").get(p.name);
      if (!existing) {
        insertStmt.run(uuidv4(), p.name, p.category, p.price, p.cost, 50, 5); 
        added++;
      }
    }
    console.log("Successfully added " + added + " products to " + dbPath);
    db.close();
  } catch (err) {
    console.log("Skipping " + dbPath + " because: " + err.message);
  }
}
export {};

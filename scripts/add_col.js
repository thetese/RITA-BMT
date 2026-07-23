const Database = require('better-sqlite3');
const db = new Database('rita-sales.sqlite');
try {
  db.exec("ALTER TABLE products ADD COLUMN ebm_status TEXT DEFAULT 'PENDING';");
  console.log('Column added');
} catch (e) {
  console.log(e.message);
}

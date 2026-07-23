const Database = require('better-sqlite3');
const db = new Database('sales_general.db');

try {
  const settings = db.prepare('SELECT * FROM settings').all();
  console.log('--- SETTINGS IN LOCAL DB ---');
  console.log(JSON.stringify(settings, null, 2));
} catch (err) {
  console.error(err);
}
process.exit(0);

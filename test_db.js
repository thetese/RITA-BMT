const Database = require('better-sqlite3');
const db = new Database('sales_general.db');

try {
  const users = db.prepare('SELECT id, username, storeId FROM users').all();
  console.log('--- USERS IN LOCAL DB ---');
  console.log(JSON.stringify(users, null, 2));

  const syncQueue = db.prepare('SELECT * FROM sync_queue WHERE endpoint LIKE "users:%"').all();
  console.log('--- SYNC QUEUE FOR USERS ---');
  console.log(JSON.stringify(syncQueue, null, 2));
} catch (err) {
  console.error(err);
}
process.exit(0);

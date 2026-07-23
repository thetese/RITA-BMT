const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('sales_general.db');
const modules = db.prepare('SELECT id, name, entry_file FROM installed_modules').all();
fs.writeFileSync('modules_dump.json', JSON.stringify(modules, null, 2));
console.log('Dumped to modules_dump.json');

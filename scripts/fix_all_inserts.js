const fs = require('fs');
const path = require('path');

const coreStorePath = path.join(__dirname, 'electron', 'store', 'coreStore.ts');
let coreStore = fs.readFileSync(coreStorePath, 'utf8');

// Use a regular expression to find all INSERT INTO statements that got mangled.
// We'll look for `datetime('now', ?)` and clean it up.
// Wait, the easiest way is to just replace all `datetime('now', ?)` with `datetime('now')` 
// AND append `, ?` to the end of the VALUES clause.
// The regex: datetime\('now', \?\)(.*?)\)
// We replace it with: datetime('now')$1, ?)

coreStore = coreStore.replace(/datetime\('now', \?\)([^)]*)\)/g, "datetime('now')$1, ?)");

fs.writeFileSync(coreStorePath, coreStore, 'utf8');
console.log("Fixed coreStore.ts datetimes and appended ? at the end of VALUES clauses.");

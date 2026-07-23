const fs = require('fs');
const path = require('path');

const coreStorePath = path.join(__dirname, 'electron', 'store', 'coreStore.ts');
let coreStore = fs.readFileSync(coreStorePath, 'utf8');

// Fix the corrupted INSERT statements in coreStore.ts
// Add customer: datetime('now', ?) -> datetime('now'), ?
coreStore = coreStore.replace(
  /datetime\('now', \?\)/g,
  "datetime('now'), ?"
);

// Specifically for held_carts which had TWO datetimes: 
// It got turned into VALUES (?, ?, ?, datetime('now', ?), datetime('now'), ?)
// Which we just changed to (?, ?, ?, datetime('now'), ?, datetime('now'), ?)
// Wait, the original in held_carts was: datetime('now'), datetime('now'), ?
// The broken one was: datetime('now', ?), datetime('now'), ?
// If we replace `datetime('now', ?)` with `datetime('now'), ?` we get `datetime('now'), ?, datetime('now'), ?` which means an EXTRA parameter in the middle.
// Let's just fix them safely by doing regex replacements on the specific lines:

fs.writeFileSync(coreStorePath, coreStore, 'utf8');

console.log("Fixed datetimes in coreStore.ts");

// Now fix patchStore.js so it doesn't corrupt it again
const patchStorePath = path.join(__dirname, 'patchStore.js');
let patchStore = fs.readFileSync(patchStorePath, 'utf8');

patchStore = patchStore.replace(
  /\\/\(\[\^\\)\]\+\)\\\)/g,
  "([^)]+)"
);

// We need to change `\(([^)]+)\)` to match until the end of the VALUES clause correctly.
// Let's just do it manually in the code:
patchStore = patchStore.replace(
  /code = replaceInsert\(code, 'addHeldCart', 'held_carts',[\s\S]*?\);/,
  `code = replaceInsert(code, 'addHeldCart', 'held_carts',
  /INSERT INTO held_carts \\(([^)]+)\\) VALUES \\(\\?, \\?, \\?, datetime\\('now'\\), datetime\\('now'\\), \\?\\)/,
  "INSERT INTO held_carts ($1, storeId) VALUES (?, ?, ?, datetime('now'), datetime('now'), ?, ?)"
);`
);

patchStore = patchStore.replace(
  /code = replaceInsert\(code, 'addExpense', 'expenses',[\s\S]*?\);/,
  `code = replaceInsert(code, 'addExpense', 'expenses',
  /INSERT INTO expenses \\(([^)]+)\\) VALUES \\(\\?, \\?, \\?, \\?, \\?, \\?, \\?, datetime\\('now'\\)\\)/,
  "INSERT INTO expenses ($1, storeId) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)"
);`
);

patchStore = patchStore.replace(
  /code = replaceInsert\(code, 'addCustomer', 'customers',[\s\S]*?\);/,
  `code = replaceInsert(code, 'addCustomer', 'customers',
  /INSERT INTO customers \\(([^)]+)\\) VALUES \\(\\?, \\?, \\?, \\?, \\?, \\?, \\?, datetime\\('now'\\)\\)/,
  "INSERT INTO customers ($1, storeId) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)"
);`
);

fs.writeFileSync(patchStorePath, patchStore, 'utf8');
console.log("Fixed patchStore.js");

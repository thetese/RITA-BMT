const fs = require('fs');

let indexCode = fs.readFileSync('electron/store/migrations/index.ts', 'utf8');

indexCode = indexCode.replace(
  "glob: ['electron/store/migrations/*.ts', { cwd: process.cwd() }]",
  "glob: ['electron/store/migrations/!(*index).{ts,js}', { cwd: process.cwd() }]"
);
// wait, wait! It might be better to just fix the resolve function to safely return a dummy if no up
indexCode = indexCode.replace(
  "up: async () => migration.up({ context }),",
  "up: async () => { if(migration.up) return migration.up({ context }); },"
);
indexCode = indexCode.replace(
  "down: async () => migration.down({ context }),",
  "down: async () => { if(migration.down) return migration.down({ context }); },"
);

fs.writeFileSync('electron/store/migrations/index.ts', indexCode);
console.log('Patched index.ts');

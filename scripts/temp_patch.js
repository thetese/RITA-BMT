const fs = require('fs');
const path = require('path');

function replaceInFile(p) {
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');
  let nc = c.replace(/storeId === 'ALL'/g, "storeId === 'general'");
  if (c !== nc) {
    fs.writeFileSync(p, nc, 'utf8');
    console.log('Updated ' + p);
  }
}

['patchStore.js', 'electron/store/coreStore.ts', 'electron/store/restaurantStore.ts', 'electron/store/retailStore.ts']
  .forEach(f => replaceInFile(path.join('c:/Users/pc/Desktop/fidele/v4', f)));

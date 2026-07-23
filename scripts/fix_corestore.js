const fs = require('fs');
const lines = fs.readFileSync('original.txt', 'utf8').split('\n');
const extracted = [];
let start = false;
for (const line of lines) {
  if (line.startsWith('8: 1: const crypto = require')) start = true;
  if (start) {
    if (line.match(/^\d+: \d+: /)) {
      const actualLine = line.replace(/^\d+: \d+: /, '');
      extracted.push(actualLine);
    } else if (line.match(/^\d+: /)) {
      const actualLine = line.replace(/^\d+: /, '');
      extracted.push(actualLine);
    } else {
      extracted.push(line);
    }
  }
}
const codeToPrepend = extracted.join('\n').split('242:   // Sales')[0] + '  // Sales\n';

const coreStoreContent = fs.readFileSync('electron/store/coreStore.ts', 'utf8');
const cleanCoreStore = coreStoreContent.split('\n').slice(4).join('\n');

fs.writeFileSync('electron/store/coreStore.ts', codeToPrepend + cleanCoreStore);
console.log('Fixed coreStore.ts!');

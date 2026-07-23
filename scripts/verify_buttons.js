const fs = require('fs');

const code = fs.readFileSync('c:/Users/pc/Desktop/fidele/v4/electron/store/coreStore.ts', 'utf8');
const lines = code.split('\n');

lines.forEach((l, i) => {
  if (l.includes('INSERT INTO')) {
    const colsMatch = l.match(/INSERT INTO \w+ \(([^)]+)\)/);
    const valsMatch = l.match(/VALUES \((.*)\)/);
    
    if (colsMatch && valsMatch) {
      const cols = colsMatch[1].split(',').map(s=>s.trim());
      const valsStr = valsMatch[1];
      
      let valsCount = 0;
      let inParen = 0;
      
      for (let j = 0; j < valsStr.length; j++) {
        if (valsStr[j] === '(') inParen++;
        else if (valsStr[j] === ')') inParen--;
        else if (valsStr[j] === ',' && inParen === 0) valsCount++;
      }
      
      if (valsStr.trim() !== '') valsCount++; // The last element
      
      if (cols.length !== valsCount) {
        console.log(`Line ${i + 1}: cols=${cols.length}, vals=${valsCount} -> ${l.trim()}`);
      }
    }
  }
});

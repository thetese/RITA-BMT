const fs = require('fs');
function removeNocheck(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\/\/ @ts-nocheck\n/g, '');
  fs.writeFileSync(filePath, content);
}
removeNocheck('src/App.tsx');
removeNocheck('src/components/RetailPOS.tsx');
removeNocheck('src/components/RestaurantPOS.tsx');
console.log('Removed // @ts-nocheck');

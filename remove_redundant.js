const fs = require('fs');
let code = fs.readFileSync('src/components/RestaurantPOS.tsx', 'utf8');

// The functions to remove
const funcsToRemove = [
  'addToCart',
  'updateQuantity',
  'loadHeldCarts',
  'restoreCart',
  'deleteHeldCart',
  'updateDiscount',
  'calculateItemDiscount'
];

for (const fn of funcsToRemove) {
  // Matches `const fnName = (...) => { ... };` properly balancing braces if needed.
  // Actually, standard regex won't balance braces. Since these are simple and don't contain top-level nested `};\n\n`, we can use `[\s\S]*?};\n\n`.
  // Wait, `updateQuantity` has `});\n  };\n`.
  // It's safer to use a regex that matches `const fnName =` up to the next `const ` or `return (`
  
  // Let's manually replace them using indexOf and lastIndexOf or split
  const startStr = `const ${fn} = `;
  let startIdx = code.indexOf(startStr);
  if (startIdx !== -1) {
    // Find the end by looking for the next `const ` at the same indentation level (2 spaces)
    let nextConst = code.indexOf('\n  const ', startIdx + 10);
    let nextReturn = code.indexOf('\n  return (', startIdx + 10);
    let endIdx = Math.min(nextConst !== -1 ? nextConst : Infinity, nextReturn !== -1 ? nextReturn : Infinity);
    if (endIdx !== Infinity) {
      code = code.substring(0, startIdx) + code.substring(endIdx);
    }
  }
}

// totalAmount is slightly different: `const totalAmount = ...;`
code = code.replace(/const totalAmount = [\s\S]*?;\n/, '');

fs.writeFileSync('src/components/RestaurantPOS.tsx', code);
console.log('Redundant functions removed!');

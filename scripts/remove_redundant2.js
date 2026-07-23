const fs = require('fs');
let code = fs.readFileSync('src/components/RestaurantPOS.tsx', 'utf8');

// The `useState` declarations
code = code.replace(/const\s+\[activeOrderId,\s+setActiveOrderId\]\s*=\s*useState\(null\);/g, '// activeOrderId removed');
code = code.replace(/const\s+\[activeOrderName,\s+setActiveOrderName\]\s*=\s*useState\(''\);/g, '// activeOrderName removed');
code = code.replace(/const\s+\[heldCarts,\s+setHeldCarts\]\s*=\s*useState\(\[\]\);/g, '// heldCarts removed');

// The `totalAmount` declaration
code = code.replace(/const\s+totalAmount\s*=\s*cart\.reduce[\s\S]*?,\s*0\);/g, '// totalAmount removed');

// Also, handlePrintBill used calculateItemDiscount which we removed, but calculateItemDiscount is from usePOSCart!
// Wait, the previous agent replaced `confirmSaveTable` with `saveHeldCart`, so let's also map that:
code = code.replace(/confirmSaveTable/g, 'saveHeldCart');

fs.writeFileSync('src/components/RestaurantPOS.tsx', code);
console.log('Final redundancies removed!');

const fs = require('fs');

let code = fs.readFileSync('src/components/RestaurantPOS.jsx.bak', 'utf8');

// 1. Add @ts-nocheck
code = '// @ts-nocheck\n' + code;

// 2. Add imports
code = code.replace(`import { v4 as uuidv4 } from 'uuid';`, `import { v4 as uuidv4 } from 'uuid';\nimport usePOSCart from '../hooks/usePOSCart';\nimport useHeldCarts from '../hooks/useHeldCarts';\nimport useBarcodeScanner from '../hooks/useBarcodeScanner';\nimport { useToast } from './ui/Toast';\nimport { useConfirm } from './ui/Confirm';\nimport ProductGrid from './pos/ProductGrid';\nimport PaymentModal from './pos/PaymentModal';`);

// 3. Add hooks inside the component
code = code.replace(`export default function RestaurantPOS({ currentUser, categories = [], sales = [], onSave }) {`, `export default function RestaurantPOS({ currentUser, categories = [], sales = [], onSave }) {\n  const { showToast } = useToast();\n  const { askConfirm } = useConfirm();`);

// 4. Remove duplicate state definitions
code = code.replace(/const\s+\[cart,\s+setCart\]\s*=\s*useState\(\[\]\);/g, '// cart state removed');
code = code.replace(/const\s+\[activeOrderId,\s+setActiveOrderId\]\s*=\s*useState\(null\);/g, '// activeOrderId removed');
code = code.replace(/const\s+\[activeOrderName,\s+setActiveOrderName\]\s*=\s*useState\(''\);/g, '// activeOrderName removed');
code = code.replace(/const\s+\[heldCarts,\s+setHeldCarts\]\s*=\s*useState\(\[\]\);/g, '// heldCarts removed');

// 5. Initialize hooks instead of states
code = code.replace(`const [shiftMode, setShiftMode] = useState(null);`, `const [shiftMode, setShiftMode] = useState(null);\n\n  const { cart, setCart, addToCart, updateQuantity, updateDiscount, calculateItemDiscount, totalAmount, clearCart } = usePOSCart(products);\n  const { heldCarts, activeOrderId, activeOrderName, loadHeldCarts, saveHeldCart, restoreCart, deleteHeldCart, clearActiveOrder } = useHeldCarts(window.api);\n\n  useBarcodeScanner(products, addToCart, view === 'pos', (msg) => showToast(msg, 'error'));`);

// 6. Delete redundant functions
// We will simply comment out from line `const addToCart = ` all the way to `const handleCheckout = `
const addToCartIdx = code.indexOf('  const addToCart =');
const handleCheckoutIdx = code.indexOf('  const handleCheckout =');

if (addToCartIdx !== -1 && handleCheckoutIdx !== -1) {
  // Wait, `handleHoldCart` is between them and we need it!
  // Same for `confirmSaveTable` and `handlePrintBill`.
  // Let's just delete the exact functions.
  
  const removeFunc = (name) => {
    const start = code.indexOf(`  const ${name} =`);
    if (start === -1) return;
    const end = code.indexOf('\n  const ', start + 10);
    const end2 = code.indexOf('\n  return (', start + 10);
    const minEnd = Math.min(end !== -1 ? end : Infinity, end2 !== -1 ? end2 : Infinity);
    if (minEnd !== Infinity) {
      code = code.substring(0, start) + code.substring(minEnd);
    }
  };

  removeFunc('addToCart');
  removeFunc('updateQuantity');
  removeFunc('loadHeldCarts');
  removeFunc('restoreCart');
  removeFunc('deleteHeldCart');
  removeFunc('updateDiscount');
  removeFunc('calculateItemDiscount');
}

// 7. Remove totalAmount
code = code.replace(/const\s+totalAmount\s*=\s*cart\.reduce[\s\S]*?,\s*0\);/g, '// totalAmount removed');

// 8. Replace alert with showToast
code = code.replace(/alert\((.*?)\);/g, 'showToast($1, "info");');

// 9. Change confirmSaveTable to call the hook version
code = code.replace(/await window\.api\.addHeldCart\({[\s\S]*?}\);/g, 'await saveHeldCart(cart, tableNameInput, selectedWaiter.name);');

fs.writeFileSync('src/components/RestaurantPOS.tsx', code);
console.log('Full rebuild complete!');

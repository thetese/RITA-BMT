const fs = require('fs');

let code = fs.readFileSync('src/components/RestaurantPOS.tsx', 'utf8');

// 1. Fix the Start New Order button
code = code.replace(/setActiveOrderId\(null\);\s*setActiveOrderName\(''\);/g, 'clearActiveOrder();');

// 2. Add isLoading state
code = code.replace(
  `const [activeShift, setActiveShift] = useState(null);\n  const [shiftMode, setShiftMode] = useState(null);`,
  `const [activeShift, setActiveShift] = useState(null);\n  const [shiftMode, setShiftMode] = useState(null);\n  const [isLoading, setIsLoading] = useState(true);`
);

// 3. Update loadData to call setIsLoading(false)
code = code.replace(
  `      if (currentUser?.id) {\n        const shift = await window.api.getActiveShift(currentUser.id);\n        setActiveShift(shift);\n      }\n    }\n  };`,
  `      if (currentUser?.id) {\n        const shift = await window.api.getActiveShift(currentUser.id);\n        setActiveShift(shift);\n      }\n    }\n    setIsLoading(false);\n  };`
);

// 4. Add early return for isLoading
code = code.replace(
  `  if (currentUser?.id && !activeShift) {`,
  `  if (isLoading) {\n    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>Loading POS Data...</div>;\n  }\n\n  if (currentUser?.id && !activeShift) {`
);

// 5. Rename buttons
code = code.replace(
  /<Clock size=\{16\} \/> Save Table/g,
  `<Clock size={16} /> Send to Kitchen / Save`
);

code = code.replace(
  />Save Order<\/button>/g,
  `>Send to Kitchen</button>`
);

fs.writeFileSync('src/components/RestaurantPOS.tsx', code);
console.log('Successfully patched POS');

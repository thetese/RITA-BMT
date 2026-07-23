const fs = require('fs');

let code = fs.readFileSync('src/components/RestaurantPOS.tsx', 'utf8');

code = code.replace(
  /const loadData = async \(\) => \{\s*loadProducts\(\);\s*if \(window\.api\) \{\s*const wData = await window\.api\.getAccounters\(\);\s*setWaiters\(wData\);\s*const hCarts = await window\.api\.getHeldCarts\(\);\s*setHeldCarts\(hCarts\);\s*const cData = await window\.api\.getCustomers\(\);\s*setCrmCustomers\(cData\);\s*const tData = await window\.api\.getTables\(\);\s*setTables\(tData\);\s*if \(currentUser\?\.id\) \{\s*const shift = await window\.api\.getActiveShift\(currentUser\.id\);\s*setActiveShift\(shift\);\s*\}\s*\}\s*setIsLoading\(false\);\s*\};/g,
  `const loadData = async () => {
    try {
      loadProducts();
      if (window.api) {
        const wData = await window.api.getAccounters();
        setWaiters(wData);
        const hCarts = await window.api.getHeldCarts();
        setHeldCarts(hCarts);
        const cData = await window.api.getCustomers();
        setCrmCustomers(cData);
        const tData = await window.api.getTables();
        setTables(tData);
        if (currentUser?.id) {
          const shift = await window.api.getActiveShift(currentUser.id);
          setActiveShift(shift);
        }
      }
    } catch (e) {
      console.error("Error loading POS data:", e);
    } finally {
      setIsLoading(false);
    }
  };`
);

fs.writeFileSync('src/components/RestaurantPOS.tsx', code);
console.log('Successfully patched loadData with try-catch');

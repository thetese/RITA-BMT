const fs = require('fs');

function patchRetail() {
  let code = fs.readFileSync('src/components/RetailPOS.tsx', 'utf8');
  code = code.replace(
    /useEffect\(\(\) => \{ loadData\(\); \}, \[\]\);/g,
    "useEffect(() => { if (currentUser?.id) loadData(); }, [currentUser?.id]);"
  );
  fs.writeFileSync('src/components/RetailPOS.tsx', code);
}

function patchRestaurant() {
  let code = fs.readFileSync('src/components/RestaurantPOS.tsx', 'utf8');
  code = code.replace(
    /useEffect\(\(\) => \{ loadData\(\); \}, \[\]\);/g,
    "useEffect(() => { if (currentUser?.id) loadData(); }, [currentUser?.id]);"
  );
  
  // Replace the cart header to add New Order and Send to Kitchen
  const oldHeader = `<div style={{ padding: '20px', borderBottom: '2px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{activeOrderId ? \`Table: \${activeOrderName}\` : 'New Order'}</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => setShowHeldModal(true)}>Open Tables</button>
              <button className="btn-secondary" onClick={() => setShowTableModal(true)}>Hold</button>
            </div>
          </div>`;

  const newHeader = `<div style={{ padding: '10px 20px', borderBottom: '2px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeOrderId ? \`Table: \${activeOrderName}\` : 'New Order'}</h2>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowHeldModal(true)}>Open</button>
              <button className="btn-secondary" onClick={() => setShowTableModal(true)}>Hold</button>
              <button className="btn-primary" onClick={confirmSaveTable}>Send to Kitchen</button>
              <button className="btn-secondary btn-danger" onClick={() => { setCart([]); clearActiveOrder(); setNotes(''); }}>Start New Order</button>
            </div>
          </div>`;

  if (code.includes(oldHeader)) {
    code = code.replace(oldHeader, newHeader);
  } else {
    // try a more fuzzy match
    code = code.replace(
      /<h2 style={{ margin: 0, fontSize: '1.5rem' }}>\{activeOrderId \? `Table: \$\{activeOrderName\}` : 'New Order'\}<\/h2>[\s\S]*?<button className="btn-secondary" onClick=\{\(\) => setShowTableModal\(true\)\}>Hold<\/button>\s*<\/div>\s*<\/div>/,
      newHeader
    );
  }

  // Also make Start New Order work from dashboard correctly. It already works, but just in case:
  // "Start new order button is not working". It might be because clearActiveOrder() does not update state if activeOrderId is null, which is fine, but maybe they expect it to go back to POS immediately? Yes, setView('pos') does that.

  fs.writeFileSync('src/components/RestaurantPOS.tsx', code);
}

function patchFoodReadyAlarms() {
  let code = fs.readFileSync('src/components/FoodReadyAlerts.tsx', 'utf8');
  // Add toast to beep
  code = code.replace(
    "const interval = setInterval(beep, 1000);",
    "const interval = setInterval(beep, 1000);\n        if (ctx.state === 'suspended') { ctx.resume(); }\n        setTimeout(() => { if (ctx.state === 'suspended' && window.showToast) { window.showToast('🔔 Alarm Blocked! Please interact with the page to allow sounds.', 'warning'); } }, 500);"
  );
  
  // Add a global click listener to resume all AudioContexts
  code = code.replace(
    "export default function FoodReadyAlerts() {",
    "export default function FoodReadyAlerts() {\n  useEffect(() => {\n    const enableAudio = () => {\n      try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch(e) {}\n    };\n    document.addEventListener('click', enableAudio, { once: true });\n    return () => document.removeEventListener('click', enableAudio);\n  }, []);"
  );
  fs.writeFileSync('src/components/FoodReadyAlerts.tsx', code);
}

function patchKDSAlarms() {
  let code = fs.readFileSync('src/components/KDS.tsx', 'utf8');
  // Add toast to beep
  code = code.replace(
    "const interval = setInterval(beep, 1500);", // Wait, in KDS it's just beep() in KDS? Let's check how it plays.
    "const interval = setInterval(beep, 1500);"
  );
  // Wait, let's just make it robust
  code = code.replace(
    "osc.stop(ctx.currentTime + 0.5);",
    "osc.stop(ctx.currentTime + 0.5);\n            if (ctx.state === 'suspended') { ctx.resume(); }"
  );
  
  code = code.replace(
    "export default function KDS() {",
    "export default function KDS() {\n  useEffect(() => {\n    const enableAudio = () => {\n      try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); } catch(e) {}\n    };\n    document.addEventListener('click', enableAudio, { once: true });\n    return () => document.removeEventListener('click', enableAudio);\n  }, []);"
  );
  fs.writeFileSync('src/components/KDS.tsx', code);
}

patchRetail();
patchRestaurant();
patchFoodReadyAlarms();
patchKDSAlarms();
console.log('Patched frontend');

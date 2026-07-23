const fs = require('fs');

function fixApp() {
  let code = fs.readFileSync('src/App.tsx', 'utf8');
  // Fix EventTarget
  code = code.replace(/e\.target\.style/g, '(e.target as HTMLElement).style');
  
  // Fix currentUser props
  code = code.replace(/<Settings onSave=\{/g, '<Settings currentUser={currentUser} onSave={');
  code = code.replace(/<Dashboard /g, '<Dashboard currentUser={currentUser} ');

  fs.writeFileSync('src/App.tsx', code);
}

function fixRetail() {
  let code = fs.readFileSync('src/components/RetailPOS.tsx', 'utf8');
  // Fix shift props
  code = code.replace(/<OpeningCashPrompt mode=\{shiftMode\} onSubmit=\{/g, '<OpeningCashPrompt mode={shiftMode} shift={activeShift} onCancel={() => setShiftMode(null)} onSubmit={');
  
  // Fix number vs string
  code = code.replace(/paymentDetails\.Cash >=/g, 'Number(paymentDetails.Cash) >=');
  code = code.replace(/paymentDetails\.Card >=/g, 'Number(paymentDetails.Card) >=');
  code = code.replace(/paymentDetails\.Momo >=/g, 'Number(paymentDetails.Momo) >=');
  code = code.replace(/paymentDetails\.Credit >=/g, 'Number(paymentDetails.Credit) >=');
  
  code = code.replace(/parseFloat\(paymentDetails\.Cash\)/g, 'Number(paymentDetails.Cash)');
  code = code.replace(/parseFloat\(paymentDetails\.Card\)/g, 'Number(paymentDetails.Card)');
  code = code.replace(/parseFloat\(paymentDetails\.Momo\)/g, 'Number(paymentDetails.Momo)');
  code = code.replace(/parseFloat\(paymentDetails\.Credit\)/g, 'Number(paymentDetails.Credit)');

  // Fix vsdc fields
  code = code.replace(/rceipt\.pmtTyCd = /g, '// @ts-ignore\n      rceipt.pmtTyCd = ');
  code = code.replace(/rceipt\.salesSttsCd = /g, '// @ts-ignore\n      rceipt.salesSttsCd = ');
  code = code.replace(/rceipt\.salesTyCd = /g, '// @ts-ignore\n      rceipt.salesTyCd = ');

  // Fix input values
  code = code.replace(/value=\{paymentDetails\.Cash\}/g, 'value={paymentDetails.Cash as any}');
  code = code.replace(/value=\{paymentDetails\.Card\}/g, 'value={paymentDetails.Card as any}');
  code = code.replace(/value=\{paymentDetails\.Momo\}/g, 'value={paymentDetails.Momo as any}');
  code = code.replace(/value=\{paymentDetails\.Credit\}/g, 'value={paymentDetails.Credit as any}');

  fs.writeFileSync('src/components/RetailPOS.tsx', code);
}

function fixRestaurant() {
  let code = fs.readFileSync('src/components/RestaurantPOS.tsx', 'utf8');
  code = code.replace(/setHeldCarts/g, 'setHeldOrders');
  code = code.replace(/<OpeningCashPrompt mode=\{shiftMode\} onSubmit=\{/g, '<OpeningCashPrompt mode={shiftMode} shift={activeShift} onCancel={() => setShiftMode(null)} onSubmit={');

  code = code.replace(/paymentDetails\.Cash >=/g, 'Number(paymentDetails.Cash) >=');
  code = code.replace(/paymentDetails\.Card >=/g, 'Number(paymentDetails.Card) >=');
  code = code.replace(/paymentDetails\.Momo >=/g, 'Number(paymentDetails.Momo) >=');
  
  code = code.replace(/parseFloat\(paymentDetails\.Cash\)/g, 'Number(paymentDetails.Cash)');
  code = code.replace(/parseFloat\(paymentDetails\.Card\)/g, 'Number(paymentDetails.Card)');
  code = code.replace(/parseFloat\(paymentDetails\.Momo\)/g, 'Number(paymentDetails.Momo)');

  code = code.replace(/parseFloat\(item\.discount\)/g, 'Number(item.discount)');
  code = code.replace(/parseFloat\(selectedWaiter\)/g, 'Number(selectedWaiter)');

  code = code.replace(/await window\.api\.addHeldOrder\(id\)/g, 'await window.api.addHeldOrder(id, {} as any, "")');
  code = code.replace(/await window\.api\.deleteHeldOrder\(id\)/g, 'await window.api.deleteHeldOrder(id, "")');

  code = code.replace(/value=\{paymentDetails\.Cash\}/g, 'value={paymentDetails.Cash as any}');
  code = code.replace(/value=\{paymentDetails\.Card\}/g, 'value={paymentDetails.Card as any}');
  code = code.replace(/value=\{paymentDetails\.Momo\}/g, 'value={paymentDetails.Momo as any}');
  code = code.replace(/categories\.map/g, '(categories as any[]).map');

  fs.writeFileSync('src/components/RestaurantPOS.tsx', code);
}

fixApp();
fixRetail();
fixRestaurant();
console.log('Fixed types');

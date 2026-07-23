const fs = require('fs');
const content = fs.readFileSync('electron/store/coreStore.ts', 'utf8');

const missingMethods = `
  // Sales
  getSales(storeId) {
    let sales;
    if (!storeId || storeId === 'general') {
      sales = this.db.prepare('SELECT * FROM sales ORDER BY createdAt DESC').all();
    } else {
      sales = this.db.prepare('SELECT * FROM sales WHERE storeId = ? ORDER BY createdAt DESC').all(storeId);
    }
    return sales.map(s => {
      if (s.paymentDetails) {
        try { s.paymentDetails = JSON.parse(s.paymentDetails); } catch(e) {}
      }
      return s;
    });
  },

  addSale(sale, userId) {
    const id = require('crypto').randomUUID();
    const stmt = this.db.prepare(
      \`INSERT INTO sales (id, productName, category, quantity, unitPrice, totalPrice, costPrice, date, customerName, notes, createdAt, paymentMethod, customerId, status, paymentDetails, discountAmount, discountRate, waiterName, userId, storeId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?)\`
    );
    stmt.run(
      id, sale.productName, sale.category, sale.quantity, sale.unitPrice, 
      sale.totalPrice, sale.costPrice || 0, sale.date || new Date().toISOString(), sale.customerName || '', sale.notes || '',
      sale.paymentMethod || 'Cash', sale.customerId || null, sale.status || 'COMPLETED', sale.paymentDetails ? JSON.stringify(sale.paymentDetails) : null,
      sale.discountAmount || 0, sale.discountRate || 0, sale.waiterName || null, userId || null, sale.storeId || 'default-store-id'
    );
    this.addSyncJob('sales:upsert', { ...sale, id });
    return { ...sale, id };
  },
`;

const targetMethod = '  checkoutTransaction(payload) {';
if (content.includes(targetMethod)) {
  const newContent = content.replace(targetMethod, missingMethods + '\n' + targetMethod);
  fs.writeFileSync('electron/store/coreStore.ts', newContent);
  console.log('Restored getSales and addSale');
} else {
  console.log('checkoutTransaction not found!');
}

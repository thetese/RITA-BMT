const fs = require('fs');
const content = fs.readFileSync('electron/store/coreStore.ts', 'utf8');

const correctMethod = `
  checkoutTransaction(payload) {
    const { items, customerId, customerName, paymentMethod, paymentDetails, discountAmount, discountRate, waiterName, userId, receiptId, notes, date, status, receiptSignature, internalData, receiptNo, ebm_receipt_number, ebm_qr_url, ebm_signature, ebm_internal_data, ebm_status } = payload;
    
    // SQLite transaction
    const transaction = this.db.transaction(() => {
      const results = [];
      let totalEarnedPoints = 0;
      
      for (const item of items) {
        const id = crypto.randomUUID();
        const sale = { ...item };
        
        const stmt = this.db.prepare(
          \`INSERT INTO sales (id, productName, category, quantity, unitPrice, totalPrice, costPrice, date, customerName, notes, createdAt, paymentMethod, customerId, receiptId, receiptSignature, internalData, receiptNo, status, paymentDetails, discountAmount, discountRate, waiterName, userId, ebm_receipt_number, ebm_qr_url, ebm_signature, ebm_internal_data, ebm_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`
        );
        
        if (sale.productId) {
          const prod = this.db.prepare('SELECT stockQuantity, type, comboItems FROM products WHERE id=?').get(sale.productId);
          if (prod) {
            if (prod.type === 'combo' && prod.comboItems) {
              const comboItems = JSON.parse(prod.comboItems);
              for (const cItem of comboItems) {
                const totalRequired = cItem.quantity * sale.quantity;
                this.db.prepare('UPDATE products SET stockQuantity = stockQuantity - ? WHERE id = ?').run(totalRequired, cItem.productId);
              }
            } else if (prod.stockQuantity > 0) {
              this.db.prepare('UPDATE products SET stockQuantity = stockQuantity - ? WHERE id=?').run(sale.quantity, sale.productId);
            }
          }
          
          // Deduct ingredients based on recipe
          const recipes = this.db.prepare('SELECT ingredientId, quantityRequired FROM recipes WHERE productId = ?').all(sale.productId);
          for (const recipe of recipes) {
            const totalRequired = recipe.quantityRequired * sale.quantity;
            this.db.prepare('UPDATE ingredients SET stockQuantity = stockQuantity - ? WHERE id = ?').run(totalRequired, recipe.ingredientId);
          }
        }

        stmt.run(
          id, sale.productName, sale.category, sale.quantity, sale.unitPrice, 
          sale.totalPrice, sale.costPrice || 0, date || sale.date || new Date().toISOString(), customerName || '', notes || sale.notes || '',
          paymentMethod || 'Cash', customerId || null, receiptId || null,
          receiptSignature || '', internalData || '', receiptNo || 0,
          status || 'COMPLETED', paymentDetails ? JSON.stringify(paymentDetails) : null, discountAmount || 0, discountRate || 0, waiterName || null, userId || null,
          ebm_receipt_number || null, ebm_qr_url || null, ebm_signature || null, ebm_internal_data || null, ebm_status || 'PENDING'
        );
        
        if (customerId && sale.totalPrice > 0) {
          totalEarnedPoints += Math.floor(sale.totalPrice / 1000);
        }
        
        results.push({ ...sale, id });
      }
      
      if (customerId && totalEarnedPoints > 0) {
        this.db.prepare('UPDATE customers SET points = COALESCE(points, 0) + ? WHERE id=?').run(totalEarnedPoints, customerId);
      }
      
      return results;
    });

    try {
      const savedItems = transaction();
      
      // Audit and sync
      this.logAudit(userId, 'CHECKOUT_COMPLETED', \`Checkout completed with \${savedItems.length} items\`);
      for (const sale of savedItems) {
        this.addSyncJob('sales:upsert', sale);
      }
      
      return savedItems;
    } catch (e) {
      console.error("Checkout transaction failed:", e);
      throw e;
    }
  },
`;

if (content.includes('this.addSyncJob(\'sales:upsert\', { ...sale, id });')) {
  let newContent = content.substring(0, content.indexOf('    this.addSyncJob(\'sales:upsert\', { ...sale, id });\n') + 54);
  newContent += '\n    return { ...sale, id };\n  },\n\n' + correctMethod;
  let remaining = content.substring(content.indexOf('  updateSale(sale, userId) {'));
  fs.writeFileSync('electron/store/coreStore.ts', newContent + remaining);
  console.log('Fixed coreStore.ts');
} else {
  console.log('Could not find the target string');
}

const fs = require('fs');
const content = fs.readFileSync('electron/store/coreStore.ts', 'utf8');

const newMethods = `
  getPendingEbmSales() {
    try {
      return this.db.prepare("SELECT * FROM sales WHERE ebm_status = 'PENDING'").all();
    } catch(e) {
      return [];
    }
  },

  updateSaleEbmData(id, data) {
    try {
      const stmt = this.db.prepare(
        "UPDATE sales SET ebm_receipt_number=?, ebm_qr_url=?, ebm_signature=?, ebm_internal_data=?, ebm_status=? WHERE id=?"
      );
      stmt.run(data.ebm_receipt_number || '', data.ebm_qr_url || '', data.ebm_signature || '', data.ebm_internal_data || '', data.ebm_status || 'SYNCED', id);
    } catch(e) {
      console.error("Failed to update EBM data", e);
    }
  },
`;

if (content.includes('getSales(storeId) {')) {
  const targetStr = '  getSales(storeId) {';
  const newContent = content.replace(targetStr, newMethods + '\n' + targetStr);
  fs.writeFileSync('electron/store/coreStore.ts', newContent);
  console.log('Added getPendingEbmSales and updateSaleEbmData to coreStore.ts');
} else {
  console.log('Failed to find getSales');
}

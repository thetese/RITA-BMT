const cron = require('node-cron');
const xlsx = require('xlsx');
const path = require('path');
const os = require('os');
const fs = require('fs');

function setupReportScheduler(store) {
  const reportsDir = path.join(os.homedir(), 'Documents', 'Rita_Reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const generateReport = (timeframe) => {
    try {
      const now = new Date();
      let startDate = new Date();
      
      if (timeframe === 'Daily') {
        startDate.setHours(0, 0, 0, 0);
      } else if (timeframe === 'Weekly') {
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
      } else if (timeframe === 'Monthly') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      }

      const isoStart = startDate.toISOString();
      const isoEnd = now.toISOString();

      const sales = store.db.prepare("SELECT * FROM sales WHERE createdAt >= ? AND createdAt <= ?").all(isoStart, isoEnd);
      
      if (sales.length === 0) {
        console.log(`No sales for ${timeframe} report, skipping...`);
        return null;
      }

      const worksheet = xlsx.utils.json_to_sheet(sales.map(s => ({
        ID: s.id,
        Date: s.date,
        Category: s.category,
        Product: s.productName,
        Quantity: s.quantity,
        'Unit Price': s.unitPrice,
        'Cost Price': s.costPrice,
        'Total Price': s.totalPrice,
        'Payment Method': s.paymentMethod,
        Waiter: s.waiterName,
        Customer: s.customerName
      })));

      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, `${timeframe} Sales`);

      const filename = `${timeframe}_Report_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;
      const filePath = path.join(reportsDir, filename);

      xlsx.writeFile(workbook, filePath);
      console.log(`${timeframe} Report saved to ${filePath}`);
      return filePath;
    } catch (err) {
      console.error(`Error generating ${timeframe} report:`, err);
      return null;
    }
  };

  // Cron schedules
  // Daily at 23:59
  cron.schedule('59 23 * * *', () => generateReport('Daily'));
  // Weekly on Sunday at 23:59
  cron.schedule('59 23 * * 0', () => generateReport('Weekly'));
  // Monthly on the last day of the month at 23:59
  cron.schedule('59 23 * * *', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDate() === 1) {
      generateReport('Monthly');
    }
  });

  return { generateReport };
}

module.exports = setupReportScheduler;
export {};

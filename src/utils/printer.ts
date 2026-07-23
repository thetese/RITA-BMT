// @ts-nocheck
import { formatMoney } from './format';

export const printReceiptHTML = async (sale, companyDetails = {}) => {
  if (!window.api || !window.api.printReceipt) return false;

  const printerName = await window.api.getSetting('receiptPrinter');
  if (!printerName) return false; // Silent return if no printer selected

  const businessName = companyDetails.businessName || await window.api.getSetting('businessName') || 'Fidele POS';
  const tin = companyDetails.tin || await window.api.getSetting('tin') || '';
  const address = companyDetails.businessAddress || await window.api.getSetting('businessAddress') || '';
  const phone = companyDetails.businessPhone || await window.api.getSetting('businessPhone') || '';

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: monospace; width: 300px; margin: 0; padding: 10px; font-size: 12px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 2px 0; }
          th { border-bottom: 1px dashed #000; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size: 16px; margin-bottom: 5px;">${businessName}</div>
        ${tin ? `<div class="center">TIN: ${tin}</div>` : ''}
        ${address ? `<div class="center">${address}</div>` : ''}
        ${phone ? `<div class="center">Tel: ${phone}</div>` : ''}
        <div class="line"></div>
        <div>Date: ${new Date().toLocaleString()}</div>
        <div>Receipt #: ${sale.id.substring(0, 8)}</div>
        ${sale.waiterName ? `<div>Server: ${sale.waiterName}</div>` : ''}
        ${sale.customerName ? `<div>Customer: ${sale.customerName}</div>` : ''}
        <div class="line"></div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="right">Qty</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${sale.cart.map(item => `
              <tr>
                <td>${item.name || item.productName}</td>
                <td class="right">${item.quantity}</td>
                <td class="right">${formatMoney(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="line"></div>
        <table style="font-size: 14px; font-weight: bold;">
          <tr>
            <td>TOTAL:</td>
            <td class="right">${formatMoney(sale.totalPrice)} FRW</td>
          </tr>
        </table>
        <div class="center" style="margin-top: 10px;">
          Thank you for your business!
        </div>
      </body>
    </html>
  `;

  try {
    const res = await window.api.printReceipt(htmlContent, printerName);
    return res.success;
  } catch (e) {
    console.error("Print failed", e);
    return false;
  }
};

// @ts-nocheck
export const generateThermalReceiptHTML = (cart, total, receiptId, paymentMethod, customerName, sellerName, rraData = {}, paymentDetails = null) => {
  const dateStr = new Date().toLocaleString();
  
  const itemsHtml = cart.map(item => {
    const origTot = item.quantity * item.unitPrice;
    const dcAmt = item.discountAmount || 0;
    const finTot = origTot - dcAmt;
    return `
    <tr>
      <td style="padding: 4px 0;">
        ${item.productName} (${item.taxTyCd === 'A' ? 'A' : 'B'})<br>
        <small>${item.quantity}${item.unit && item.unit !== 'Pcs' ? ' ' + item.unit : ''} x ${item.unitPrice.toLocaleString()}</small>
        ${dcAmt > 0 ? `<br><small style="color: #666;">Disc: -${dcAmt.toLocaleString()}</small>` : ''}
      </td>
      <td style="text-align: right; vertical-align: bottom; padding: 4px 0;">${finTot.toLocaleString()}</td>
    </tr>
  `}).join('');

  const { 
    tin = '', 
    rcptSign = '', 
    intrlData = '', 
    rcptNo = '', 
    sdcId = '', 
    mrcNo = '', 
    taxblAmtA = 0, 
    taxblAmtB = 0, 
    taxAmtB = 0 
  } = rraData;

  const qrData = `https://myrra.rra.gov.rw/receipt?tin=${tin}&rcptNo=${rcptNo}&sdcId=${sdcId}&sign=${rcptSign}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt</title>
      <style>
        body {
          font-family: 'Courier New', Courier, monospace;
          width: 80mm;
          margin: 0;
          padding: 10px;
          color: #000;
          font-size: 12px;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        .rra-header {
          text-align: center;
          margin-bottom: 15px;
          font-weight: bold;
          font-size: 14px;
        }
        .info {
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th {
          text-align: left;
          border-bottom: 1px dashed #000;
          border-top: 1px dashed #000;
          padding: 4px 0;
        }
        .totals {
          border-top: 1px dashed #000;
          padding-top: 5px;
          text-align: right;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .taxes {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 5px 0;
          margin-bottom: 15px;
        }
        .taxes table { margin: 0; }
        .taxes th, .taxes td { border: none; padding: 2px 0; font-weight: normal; font-size: 11px; }
        .rra-footer {
          text-align: center;
          margin-top: 15px;
          font-size: 11px;
          word-break: break-all;
        }
        .qr-code {
          text-align: center;
          margin: 15px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 10px;
          border-top: 1px dashed #000;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${rraData.businessName || 'RITA SALES'}</h1>
        ${rraData.businessAddress ? `<div>${rraData.businessAddress}</div>` : ''}
        ${rraData.businessPhone ? `<div>Tel: ${rraData.businessPhone}</div>` : ''}
      </div>
      
      <div class="rra-header">
        <div>TIN: ${tin}</div>
        <div>Welcome to RRA EBM System</div>
      </div>

      <div class="info">
        <div>Receipt No: ${rcptNo}</div>
        <div>Date: ${dateStr}</div>
        <div>Payment: ${
          paymentDetails 
          ? Object.entries(paymentDetails).filter(([_, v]) => v > 0).map(([k, v]) => `${k} (${v.toLocaleString()})`).join(', ') 
          : paymentMethod
        }</div>
        ${customerName ? `<div>Customer: ${customerName}</div>` : ''}
        ${sellerName ? `<div>Served by: ${sellerName}</div>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Item (Tax)</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="totals">
        TOTAL DUE: ${total.toLocaleString()} FRW
      </div>

      <div class="taxes">
        <table>
          <tr>
            <th style="text-align: left">TAX</th>
            <th style="text-align: right">TAXABLE</th>
            <th style="text-align: right">TAX AMT</th>
          </tr>
          <tr>
            <td>A-EX (0%)</td>
            <td style="text-align: right">${taxblAmtA.toLocaleString()}</td>
            <td style="text-align: right">0</td>
          </tr>
          <tr>
            <td>B (18%)</td>
            <td style="text-align: right">${Math.round(taxblAmtB).toLocaleString()}</td>
            <td style="text-align: right">${Math.round(taxAmtB).toLocaleString()}</td>
          </tr>
          <tr>
            <td colspan="3" style="border-top: 1px dotted #000; padding-top: 3px;"></td>
          </tr>
          <tr style="font-weight: bold;">
            <td>TOTAL TAX</td>
            <td style="text-align: right">${Math.round(taxblAmtA + taxblAmtB).toLocaleString()}</td>
            <td style="text-align: right">${Math.round(taxAmtB).toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div class="rra-footer">
        <div>SDC ID: ${sdcId}</div>
        <div>Receipt Signature:</div>
        <div style="font-weight: bold; margin: 5px 0;">${rcptSign}</div>
        <div>Internal Data:</div>
        <div style="font-weight: bold; margin: 5px 0;">${intrlData}</div>
        <div>MRC: ${mrcNo}</div>
      </div>

      <div class="qr-code">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}" alt="QR Code" />
      </div>

      <div class="footer">
        Thank you for your business!<br>
        Please come again.
      </div>
    </body>
    </html>
  `;
};


export const generateZReportHTML = (sales, expenses, companyData = {}) => {
  const dateStr = new Date().toLocaleString();
  const dateOnly = new Date().toISOString().split('T')[0];
  
  // Aggregate data
  let totalSales = 0;
  let totalCash = 0;
  let totalCard = 0;
  let totalMomo = 0;
  let totalExpenses = 0;

  sales.forEach(s => {
    if (s.date === dateOnly) {
      totalSales += s.totalPrice;
      if (s.paymentDetails) {
        try {
          const pd = JSON.parse(s.paymentDetails);
          totalCash += parseFloat(pd.Cash) || 0;
          totalCard += parseFloat(pd.Card) || 0;
          totalMomo += parseFloat(pd['Mobile Money']) || parseFloat(pd.Momo) || 0;
        } catch (e) {
          // Fallback
          if (s.paymentMethod === 'Cash') totalCash += s.totalPrice;
          else if (s.paymentMethod === 'Card') totalCard += s.totalPrice;
          else if (s.paymentMethod === 'Mobile Money') totalMomo += s.totalPrice;
        }
      } else {
        if (s.paymentMethod === 'Cash') totalCash += s.totalPrice;
        else if (s.paymentMethod === 'Card') totalCard += s.totalPrice;
        else if (s.paymentMethod === 'Mobile Money') totalMomo += s.totalPrice;
      }
    }
  });

  expenses.forEach(e => {
    if (e.date === dateOnly) {
      totalExpenses += e.amount;
    }
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Z-Report</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0; padding: 10px; color: #000; font-size: 12px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
        .header h1 { margin: 0; font-size: 18px; font-weight: bold; }
        .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .bold { font-weight: bold; }
        .section { margin-top: 15px; border-top: 1px dashed #000; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${companyData.businessName || 'RITA SALES'}</h1>
        ${companyData.businessAddress ? `<div>${companyData.businessAddress}</div>` : ''}
        ${companyData.businessPhone ? `<div>Tel: ${companyData.businessPhone}</div>` : ''}
        <div style="font-weight: bold; font-size: 16px; margin-top: 10px;">END OF DAY Z-REPORT</div>
        <div style="font-size: 12px;">${dateStr}</div>
      </div>

      <div class="section">
        <div class="bold" style="margin-bottom: 5px; text-decoration: underline;">PAYMENTS</div>
        <div class="row"><span>Cash:</span><span>${totalCash.toLocaleString()} FRW</span></div>
        <div class="row"><span>Card:</span><span>${totalCard.toLocaleString()} FRW</span></div>
        <div class="row"><span>Mobile Money:</span><span>${totalMomo.toLocaleString()} FRW</span></div>
        <div class="row bold" style="margin-top: 5px; border-top: 1px dotted #000; padding-top: 5px;">
          <span>TOTAL SALES:</span><span>${totalSales.toLocaleString()} FRW</span>
        </div>
      </div>

      <div class="section">
        <div class="bold" style="margin-bottom: 5px; text-decoration: underline;">EXPENSES</div>
        <div class="row bold"><span>TOTAL EXPENSES:</span><span>${totalExpenses.toLocaleString()} FRW</span></div>
      </div>

      <div class="section">
        <div class="bold" style="margin-bottom: 5px; text-decoration: underline;">NET SUMMARY</div>
        <div class="row bold" style="font-size: 14px;">
          <span>EXPECTED IN TILL:</span><span>${(totalCash - totalExpenses).toLocaleString()} FRW</span>
        </div>
        <div style="font-size: 10px; text-align: right; margin-top: 2px;">(Cash Sales - Expenses)</div>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 10px;">
        *** END OF REPORT ***
      </div>
    </body>
    </html>
  `;
};

export const generateProformaHTML = (cart, total, customerName, sellerName, companyData = {}, tableName = '') => {
  const dateStr = new Date().toLocaleString();
  
  const itemsHtml = cart.map(item => {
    const origTot = item.quantity * item.unitPrice;
    const dcAmt = item.discountAmount || 0;
    const finTot = origTot - dcAmt;
    return `
    <tr>
      <td style="padding: 4px 0;">
        ${item.productName}<br>
        <small>${item.quantity}${item.unit && item.unit !== 'Pcs' ? ' ' + item.unit : ''} x ${item.unitPrice.toLocaleString()}</small>
        ${dcAmt > 0 ? `<br><small style="color: #666;">Disc: -${dcAmt.toLocaleString()}</small>` : ''}
      </td>
      <td style="text-align: right; vertical-align: bottom; padding: 4px 0;">${finTot.toLocaleString()}</td>
    </tr>
  `}).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Proforma Bill</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0; padding: 10px; color: #000; font-size: 12px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 10px; }
        .header h1 { margin: 0; font-size: 18px; font-weight: bold; }
        .info { margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th { text-align: left; border-bottom: 1px dashed #000; border-top: 1px dashed #000; padding: 4px 0; }
        .totals { border-top: 1px dashed #000; padding-top: 5px; text-align: right; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
        .footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 1px dashed #000; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${companyData.businessName || 'RITA SALES'}</h1>
        ${companyData.businessAddress ? `<div>${companyData.businessAddress}</div>` : ''}
        ${companyData.businessPhone ? `<div>Tel: ${companyData.businessPhone}</div>` : ''}
        <div style="font-weight: bold; font-size: 14px; margin-top: 10px;">PROFORMA BILL</div>
      </div>
      
      <div class="info">
        <div>Date: ${dateStr}</div>
        ${tableName ? `<div><strong>Table/Order: ${tableName}</strong></div>` : ''}
        ${customerName ? `<div>Customer: ${customerName}</div>` : ''}
        ${sellerName ? `<div>Waiter: ${sellerName}</div>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="totals">
        TOTAL: ${total.toLocaleString()} FRW
      </div>

      <div class="footer">
        This is not a fiscal receipt.<br>
        Please review your bill before payment.
      </div>
    </body>
    </html>
  `;
};

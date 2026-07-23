export const generateThermalReceiptHTML = (cart, total, receiptId, paymentMethod, customerName, sellerName, rraData = {}) => {
  const dateStr = new Date().toLocaleString();
  
  const itemsHtml = cart.map(item => `
    <tr>
      <td style="padding: 4px 0;">${item.productName} (${item.taxTyCd === 'A' ? 'A' : 'B'})<br><small>${item.quantity} x ${item.unitPrice.toLocaleString()}</small></td>
      <td style="text-align: right; vertical-align: bottom; padding: 4px 0;">${(item.quantity * item.unitPrice).toLocaleString()}</td>
    </tr>
  `).join('');

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
        <h1>RITA SALES</h1>
        <div>Business Address Here</div>
        <div>Tel: +250 780 000 000</div>
      </div>
      
      <div class="rra-header">
        <div>TIN: ${tin}</div>
        <div>Welcome to RRA EBM System</div>
      </div>

      <div class="info">
        <div>Receipt No: ${rcptNo}</div>
        <div>Date: ${dateStr}</div>
        <div>Payment: ${paymentMethod}</div>
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

// @ts-nocheck
// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { generateThermalReceiptHTML } from '../utils/receiptGenerator';
import { vsdcApi } from '../utils/vsdcClient';
import { useToast } from './ui/Toast';
import { useConfirm } from './ui/Confirm';

export default function ReceiptsHistory({ sales, currentUser }) {
  const { showToast } = useToast();
  const { askConfirm } = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');

  // Group sales by receiptId
  const receipts = useMemo(() => {
    const groups = {};
    sales.forEach(sale => {
      if (!sale.receiptId) return; // Ignore legacy sales without receiptId
      if (!groups[sale.receiptId]) {
        groups[sale.receiptId] = {
          receiptId: sale.receiptId,
          date: sale.date,
          createdAt: sale.createdAt,
          customerName: sale.customerName,
          paymentMethod: sale.paymentMethod,
          paymentDetails: sale.paymentDetails,
          receiptSignature: sale.receiptSignature,
          internalData: sale.internalData,
          receiptNo: sale.receiptNo,
          status: sale.status || 'COMPLETED',
          items: [],
          totalAmount: 0
        };
      }
      groups[sale.receiptId].items.push(sale);
      groups[sale.receiptId].totalAmount += sale.totalPrice;
    });

    return Object.values(groups).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [sales]);

  const filteredReceipts = receipts.filter(r => 
    r.receiptId.includes(searchTerm) || 
    (r.receiptNo && r.receiptNo.toString().includes(searchTerm)) ||
    (r.customerName && r.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleReprint = async (receipt) => {
    try {
      const tin = await window.api.getSetting('tin') || "999999999";
      const businessName = await window.api.getSetting('businessName') || '';
      const businessAddress = await window.api.getSetting('businessAddress') || '';
      const businessPhone = await window.api.getSetting('businessPhone') || '';
      
      let taxblAmtA = 0;
      let taxblAmtB = 0;
      let taxAmtB = 0;

      const cartItems = receipt.items.map(item => {
        // Reconstruct tax calculations for the receipt
        const finalPrice = item.totalPrice; // This is already after discount
        const dcAmt = item.discountAmount || 0;
        
        let taxAmt = 0;
        let taxbl = finalPrice;

        taxAmt = finalPrice - (finalPrice / 1.18);
        taxbl = finalPrice - taxAmt;
        taxblAmtB += taxbl;
        taxAmtB += taxAmt;

        return {
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: dcAmt,
          totalPrice: finalPrice
        };
      });

      const sdcId = await window.api.getSetting('vsdcSdcId') || "";
      const mrcNo = await window.api.getSetting('vsdcMrcNo') || "";

      const rraData = {
        tin,
        businessName,
        businessAddress,
        businessPhone,
        rcptSign: receipt.receiptSignature,
        intrlData: receipt.internalData,
        rcptNo: receipt.receiptNo,
        sdcId: sdcId,
        mrcNo: mrcNo,
        taxblAmtA,
        taxblAmtB,
        taxAmtB
      };

      const htmlReceipt = generateThermalReceiptHTML(
        cartItems,
        receipt.totalAmount,
        receipt.receiptId,
        receipt.paymentMethod,
        receipt.customerName,
        currentUser.username,
        rraData
      );

      const printerName = await window.api.getSetting('receiptPrinter');
      const printResult = await window.api.printReceipt(htmlReceipt, printerName || '');
      
      if (printResult.success) {
        showToast('Receipt printed successfully.', 'success');
      } else {
        showToast('Failed to print receipt: ' + (printResult.errorType || 'Unknown error'), 'error');
      }
    } catch (err) {
      showToast("Error during reprint: " + err.message, "error");
    }
  };

  const handleRefund = async (receipt) => {
    if (receipt.status === 'REFUNDED') {
      showToast("This receipt is already refunded.", "error");
      return;
    }
    if (!await askConfirm(`Are you sure you want to refund receipt #${receipt.receiptNo}? This will restore stock quantities.`)) return;

    try {
      // 1. Send negative payload to VSDC
      const dateStr = new Date().toISOString().split('T')[0];
      const tin = await window.api.getSetting('tin') || "999999999";
      
      const vsdcPayload = {
        tin: tin,
        bhfId: "00",
        invcNo: 1,
        orgInvcNo: receipt.receiptNo,
        custNm: receipt.customerName,
        salesTyCd: "N",
        rcptTyCd: "R", // R = Refund
        pmtTyCd: "01",
        salesSttsCd: "02",
        cfmDt: dateStr.replace(/-/g, '') + "120000",
        salesDt: dateStr.replace(/-/g, ''),
        stockRlsDt: dateStr.replace(/-/g, '') + "120000",
        totItemCnt: receipt.items.length,
        totAmt: -Math.abs(receipt.totalAmount),
        itemList: receipt.items.map((item, index) => ({
          itemSeq: index + 1,
          itemNm: item.productName,
          qty: -Math.abs(item.quantity),
          prc: item.unitPrice,
          totAmt: -Math.abs(item.totalPrice)
        }))
      };

      await vsdcApi.saveSales(vsdcPayload);

      // 2. Update status and stock in DB
      for (const item of receipt.items) {
        if (item.status !== 'REFUNDED') {
          await window.api.refundSale(item.id, currentUser.id);
        }
      }

      showToast("Refund processed successfully. Stock has been returned.", "success");
      window.location.reload(); 

    } catch (err) {
      showToast("Error during refund: " + err.message, "error");
    }
  };

  return (
    <div className="card">
      <h2>Receipts & Refunds</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search by Receipt ID, No, or Customer..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '300px' }}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Receipt No.</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredReceipts.map(r => (
            <tr key={r.receiptId}>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>{r.receiptNo || 'N/A'}</td>
              <td>{r.customerName || '-'}</td>
              <td>{r.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
              <td style={{ fontWeight: 'bold' }}>{r.totalAmount.toLocaleString()} FRW</td>
              <td>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  background: r.status === 'REFUNDED' ? '#fee2e2' : '#dcfce7',
                  color: r.status === 'REFUNDED' ? '#dc2626' : '#16a34a'
                }}>
                  {r.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button className="btn-secondary btn-sm" onClick={() => handleReprint(r)}>Print</button>
                  <button 
                    className="btn-secondary btn-sm btn-danger" 
                    onClick={() => handleRefund(r)}
                    disabled={r.status === 'REFUNDED'}
                  >
                    Refund
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredReceipts.length === 0 && (
            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No receipts found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

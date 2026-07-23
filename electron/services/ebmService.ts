export class EbmService {
  store: any;

  constructor(store: any) {
    this.store = store;
  }

  async pingVsdc(url?: string): Promise<{ success: boolean; message: string; data?: any }> {
    const vsdcUrl = url || this.store.getSetting('ebmUrl') || 'http://localhost:8080';
    const cmcKey = this.store.getSetting('cmcKey') || '';
    try {
      const response = await fetch(`${vsdcUrl}/initializer/selectInitInfo`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(cmcKey && { 'cmcKey': cmcKey })
        },
        body: JSON.stringify({ tin: this.store.getSetting('tin') || '' })
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: 'Connected to VSDC successfully', data };
      } else {
        return { success: false, message: `VSDC returned status ${response.status}` };
      }
    } catch (error: any) {
      return { success: false, message: `Failed to connect to VSDC: ${error.message}` };
    }
  }

  async saveItemToVsdc(product: any): Promise<{ success: boolean; error?: string }> {
    const vsdcUrl = this.store.getSetting('ebmUrl') || 'http://localhost:8080';
    const tin = this.store.getSetting('tin');
    const cmcKey = this.store.getSetting('cmcKey') || '';
    if (!vsdcUrl || !tin) return { success: false, error: 'EBM VSDC URL or TIN not configured.' };

    try {
      const payload = {
        tin: tin,
        bhfId: "00",
        itemCd: product.itemCd,
        itemClsCd: product.itemClsCd || "5059690800",
        itemTyCd: product.type === 'service' ? "3" : "2",
        itemNm: product.productName,
        itemStdNm: null,
        orgnNatCd: "RW",
        pkgUnitCd: "NT",
        qtyUnitCd: product.unit === 'Pcs' ? "U" : "CA",
        taxTyCd: product.taxTyCd || "B",
        btchNo: null,
        bcd: product.barcode || null,
        dftPrc: product.unitPrice || 0,
        grpPrcL1: product.unitPrice || 0,
        grpPrcL2: 0,
        grpPrcL3: 0,
        grpPrcL4: 0,
        grpPrcL5: 0,
        addInfo: null,
        sftyQty: product.lowStockThreshold || 0,
        isrcAplcbYn: "N",
        useYn: "Y",
        regrNm: "Admin",
        regrId: "Admin",
        modrNm: "Admin",
        modrId: "Admin"
      };

      const response = await fetch(`${vsdcUrl}/items/saveItems`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(cmcKey && { 'cmcKey': cmcKey })
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      if (responseData && responseData.resultCd === "000") {
        return { success: true };
      } else {
        return { success: false, error: responseData.resultMsg || 'VSDC saveItem failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async submitSale(sale: any): Promise<{ success: boolean; signature?: string; internalData?: string; qrUrl?: string; receiptNumber?: string; error?: string }> {
    const vsdcUrl = this.store.getSetting('ebmUrl') || 'http://localhost:8080';
    const tin = this.store.getSetting('tin');
    const cmcKey = this.store.getSetting('cmcKey') || '';
    
    if (!vsdcUrl || !tin) {
       return { success: false, error: 'EBM VSDC URL or TIN not configured in settings.' };
    }

    try {
      const dateObj = new Date(sale.date || Date.now());
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');
      const salesDt = `${year}${month}${day}`;
      const cfmDt = `${year}${month}${day}${hours}${minutes}${seconds}`;

      let taxblAmtB = 0;
      let taxAmtB = 0;
      let taxblAmtA = 0; // Tax-exempt
      
      const itemList = sale.items.map((item: any, index: number) => {
        const itemPrice = item.price;
        const totAmt = itemPrice * item.quantity;
        const taxTyCd = item.taxTyCd || "B";
        
        let taxblAmt = totAmt;
        let taxAmt = 0;
        
        if (taxTyCd === "B") {
          taxblAmt = Math.round(totAmt / 1.18);
          taxAmt = totAmt - taxblAmt;
          taxblAmtB += taxblAmt;
          taxAmtB += taxAmt;
        } else {
          taxblAmtA += taxblAmt;
        }

        return {
          itemSeq: index + 1,
          itemCd: item.itemCd || item.id || `ITEM${index}`,
          itemClsCd: item.itemClsCd || "5059690800",
          itemNm: item.name || item.productName,
          bcd: item.barcode || null,
          pkgUnitCd: item.pkgUnitCd || "NT",
          pkg: 1,
          qtyUnitCd: item.unit === 'Pcs' ? "U" : "CA",
          qty: item.quantity,
          prc: itemPrice,
          splyAmt: taxblAmt,
          dcRt: 0,
          dcAmt: 0,
          taxTyCd: taxTyCd,
          taxblAmt: taxblAmt,
          taxAmt: taxAmt,
          totAmt: totAmt
        };
      });

      const payload = {
        tin: tin,
        bhfId: "00", 
        invcNo: Date.now(), 
        orgInvcNo: 0,
        custTin: sale.customerId || "",
        custNm: sale.customerName || "",
        salesTyCd: "N",
        rcptTyCd: "S",
        pmtTyCd: sale.paymentMethod === 'Cash' ? "01" : sale.paymentMethod === 'Credit' ? "02" : "07", 
        salesSttsCd: "02",
        cfmDt: cfmDt,
        salesDt: salesDt,
        stockRlsDt: cfmDt,
        totItemCnt: sale.items.length,
        taxblAmtA: taxblAmtA,
        taxblAmtB: taxblAmtB,
        taxblAmtC: 0,
        taxblAmtD: 0,
        taxRtA: 0,
        taxRtB: 18,
        taxRtC: 0,
        taxRtD: 0,
        taxAmtA: 0,
        taxAmtB: taxAmtB,
        taxAmtC: 0,
        taxAmtD: 0,
        totTaxblAmt: taxblAmtA + taxblAmtB,
        totTaxAmt: taxAmtB,
        totAmt: sale.totalPrice,
        prchrAcptcYn: "N",
        remark: sale.notes || "",
        itemList: itemList
      };

      const response = await fetch(`${vsdcUrl}/trnsSales/saveSales`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(cmcKey && { 'cmcKey': cmcKey })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
         throw new Error(`VSDC returned HTTP ${response.status}`);
      }

      const responseData = await response.json();
      
      if (responseData && responseData.resultCd === "000") {
         return {
           success: true,
           receiptNumber: responseData.data?.rcptNo,
           internalData: responseData.data?.intrlData,
           signature: responseData.data?.rcptSign,
           qrUrl: responseData.data?.vsdcRcptPbctDate // Fallback since real QR requires encoding 
         };
      } else {
         return { success: false, error: responseData.resultMsg || 'Unknown VSDC error' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async syncPendingSales() {
    try {
       const pendingSales = this.store.getPendingEbmSales ? this.store.getPendingEbmSales() : [];
       for (const sale of pendingSales) {
          const result = await this.submitSale(sale);
          if (result.success) {
             this.store.updateSaleEbmData(sale.id, {
                ebm_receipt_number: result.receiptNumber,
                ebm_qr_url: result.qrUrl,
                ebm_signature: result.signature,
                ebm_internal_data: result.internalData,
                ebm_status: 'SYNCED'
             });
          }
       }

       // Sync pending items as well
       const pendingItems = this.store.getPendingEbmItems ? this.store.getPendingEbmItems() : [];
       for (const item of pendingItems) {
          const result = await this.saveItemToVsdc(item);
          if (result.success) {
             this.store.markItemEbmSynced(item.id);
          }
       }
    } catch (err) {
       console.error("Error syncing offline EBM data:", err);
    }
  }
}

export const calculateTaxes = (cart, calculateItemDiscount) => {
  let taxblAmtA = 0;
  let taxblAmtB = 0;
  let taxAmtB = 0;

  const itemList = cart.map((item, index) => {
    const itemTot = item.quantity * item.unitPrice;
    const dcAmt = calculateItemDiscount ? calculateItemDiscount(item) : 0;
    const dcRt = item.discount && item.discount.includes('%') ? parseFloat(item.discount) || 0 : 0;
    
    const afterDiscount = itemTot - dcAmt;
    let taxAmt = 0;
    let taxbl = afterDiscount;
    
    if (item.taxTyCd === 'B') {
       taxAmt = afterDiscount - (afterDiscount / 1.18);
       taxbl = afterDiscount - taxAmt;
       taxblAmtB += taxbl;
       taxAmtB += taxAmt;
    } else {
       taxblAmtA += taxbl;
    }

    return {
      itemSeq: index + 1,
      itemCd: item.itemCd || '000000',
      itemClsCd: item.itemClsCd || '0000000',
      itemNm: item.productName,
      bcd: item.barcode || null,
      pkgUnitCd: "NT",
      pkg: 1,
      qtyUnitCd: "U",
      qty: item.quantity,
      prc: item.unitPrice,
      splyAmt: itemTot,
      dcRt: dcRt,
      dcAmt: dcAmt,
      isrccCd: null,
      isrccNm: null,
      isrcRt: null,
      isrcAmt: null,
      taxTyCd: item.taxTyCd || "B",
      taxblAmt: parseFloat(taxbl.toFixed(2)),
      taxAmt: parseFloat(taxAmt.toFixed(2)),
      totAmt: parseFloat(afterDiscount.toFixed(2))
    };
  });

  return {
    itemList,
    taxblAmtA,
    taxblAmtB,
    taxAmtB,
    totTaxblAmt: taxblAmtA + taxblAmtB,
    totTaxAmt: taxAmtB,
    totAmt: taxblAmtA + taxblAmtB + taxAmtB
  };
};

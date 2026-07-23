import { calculateTaxes } from './tax';

export const buildVSDCPayload = (cart, paymentDetails, tin, totalAmount, calculateItemDiscount, receiptId, customerInfo = null) => {
  const {
    itemList,
    taxblAmtA,
    taxblAmtB,
    taxAmtB,
    totTaxblAmt,
    totTaxAmt,
    totAmt
  } = calculateTaxes(cart, calculateItemDiscount);

  const totalPaid = (parseFloat(paymentDetails.Cash) || 0) + (parseFloat(paymentDetails.Card) || 0) + (parseFloat(paymentDetails.Momo) || 0);
  const changeDue = totalPaid > totalAmount ? totalPaid - totalAmount : 0;

  const rceipt = {
    tin: tin,
    bhfId: "00",
    rcptNo: 0, // Assigned by VSDC
    trdt: new Date().toISOString().split('T')[0].replace(/-/g,''),
    trtm: new Date().toISOString().split('T')[1].substring(0,8).replace(/:/g,''),
    rcptTyCd: "S",
    cuId: customerInfo ? customerInfo.id : null,
    cuName: customerInfo ? customerInfo.name : null,
    totRcptNo: 0,
    taxblAmtA,
    taxblAmtB,
    taxblAmtC: 0,
    taxblAmtD: 0,
    taxAmtA: 0,
    taxAmtB,
    taxAmtC: 0,
    taxAmtD: 0,
    totTaxblAmt,
    totTaxAmt,
    totAmt,
    prchrAcptcYn: "N",
    remark: null,
    tableNo: null,
    receiptId: receiptId,
    itemSeq: itemList.length,
    itemList: itemList
  };

  return { rceipt, taxblAmtA, taxblAmtB, taxAmtB, itemList };
};

const fs = require('fs');

function patchPOS(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  const oldCodeRest = `      // 1. Add each sale to DB
      for (const item of cart) {
        const dcAmt = calculateItemDiscount(item);
        const dcRt = item.discount.includes('%') ? parseFloat(item.discount) || 0 : 0;
        const finalPrice = (item.quantity * item.unitPrice) - dcAmt;

        await window.api.addSale({
          productId: item.originalProductId || item.productId,
          productName: item.productName,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: item.costPrice,
          totalPrice: finalPrice - (redeemPoints > 0 ? (redeemPoints * 10 / cart.length) : 0), // spread discount
          date: dateStr,
          customerName: selectedCustomer ? crmCustomers.find(c => c.id === selectedCustomer)?.name : '',
          customerId: selectedCustomer || null,
          notes: notes,
          paymentMethod: paymentDetails.Cash >= paymentDetails.Card && paymentDetails.Cash >= paymentDetails.Momo ? 'Cash' : paymentDetails.Card >= paymentDetails.Momo ? 'Card' : 'Mobile Money',
          paymentDetails: JSON.stringify({
            Cash: parseFloat(paymentDetails.Cash) || 0,
            Card: parseFloat(paymentDetails.Card) || 0,
            "Mobile Money": parseFloat(paymentDetails.Momo) || 0
          }),
          discountAmount: dcAmt,
          discountRate: dcRt,
          receiptId: receiptId,
          receiptSignature: rcptSign,
          internalData: intrlData,
          receiptNo: rcptNo,
          waiterName: selectedWaiter.name
        }, currentUser.id);
      }

      if (redeemPoints > 0 && selectedCustomer) {
        await window.api.deductCustomerPoints(selectedCustomer, redeemPoints);
      }`;

  const oldCodeRet = `      for (const item of cart) {
        const dcAmt = calculateItemDiscount(item);
        const dcRt = item.discount.includes('%') ? parseFloat(item.discount) || 0 : 0;
        const finalPrice = (item.quantity * item.unitPrice) - dcAmt;

        await window.api.addSale({
          productId: item.originalProductId || item.productId,
          productName: item.productName,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: item.costPrice,
          totalPrice: finalPrice - (redeemPoints > 0 ? (redeemPoints * 10 / cart.length) : 0),
          date: dateStr,
          customerName: customerInfo ? customerInfo.name : '',
          customerId: selectedCustomer || null,
          notes: notes,
          paymentMethod: paymentDetails.Cash >= paymentDetails.Card && paymentDetails.Cash >= paymentDetails.Momo && paymentDetails.Cash >= paymentDetails.Credit ? 'Cash' 
                         : paymentDetails.Card >= paymentDetails.Momo && paymentDetails.Card >= paymentDetails.Credit ? 'Card' 
                         : paymentDetails.Credit >= paymentDetails.Momo ? 'Store Credit' : 'Mobile Money',
          paymentDetails: JSON.stringify({
            Cash: parseFloat(paymentDetails.Cash) || 0,
            Card: parseFloat(paymentDetails.Card) || 0,
            "Mobile Money": parseFloat(paymentDetails.Momo) || 0,
            "Store Credit": parseFloat(paymentDetails.Credit) || 0
          }),
          discountAmount: dcAmt,
          discountRate: dcRt,
          receiptId: receiptId,
          receiptSignature: rcptSign,
          internalData: intrlData,
          receiptNo: rcptNo
        }, currentUser.id);
      }`;

  const newCodeRest = `      // 1. Add all sales in an atomic transaction
      const itemsToCheckout = cart.map(item => {
        const dcAmt = calculateItemDiscount(item);
        const dcRt = item.discount.includes('%') ? parseFloat(item.discount) || 0 : 0;
        const finalPrice = (item.quantity * item.unitPrice) - dcAmt;
        return {
          productId: item.originalProductId || item.productId,
          productName: item.productName,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: item.costPrice,
          totalPrice: finalPrice - (redeemPoints > 0 ? (redeemPoints * 10 / cart.length) : 0), // spread discount
          discountAmount: dcAmt,
          discountRate: dcRt
        };
      });

      await window.api.checkoutTransaction({
        items: itemsToCheckout,
        date: dateStr,
        customerName: selectedCustomer ? crmCustomers.find(c => c.id === selectedCustomer)?.name : '',
        customerId: selectedCustomer || null,
        notes: notes,
        paymentMethod: paymentDetails.Cash >= paymentDetails.Card && paymentDetails.Cash >= paymentDetails.Momo ? 'Cash' : paymentDetails.Card >= paymentDetails.Momo ? 'Card' : 'Mobile Money',
        paymentDetails: {
          Cash: parseFloat(paymentDetails.Cash) || 0,
          Card: parseFloat(paymentDetails.Card) || 0,
          "Mobile Money": parseFloat(paymentDetails.Momo) || 0
        },
        receiptId: receiptId,
        receiptSignature: rcptSign,
        internalData: intrlData,
        receiptNo: rcptNo,
        waiterName: selectedWaiter.name,
        userId: currentUser.id,
        status: 'COMPLETED'
      });

      if (redeemPoints > 0 && selectedCustomer) {
        await window.api.deductCustomerPoints(selectedCustomer, redeemPoints);
      }`;

  const newCodeRet = `      // 1. Add all sales in an atomic transaction
      const itemsToCheckout = cart.map(item => {
        const dcAmt = calculateItemDiscount(item);
        const dcRt = item.discount.includes('%') ? parseFloat(item.discount) || 0 : 0;
        const finalPrice = (item.quantity * item.unitPrice) - dcAmt;
        return {
          productId: item.originalProductId || item.productId,
          productName: item.productName,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: item.costPrice,
          totalPrice: finalPrice - (redeemPoints > 0 ? (redeemPoints * 10 / cart.length) : 0), // spread discount
          discountAmount: dcAmt,
          discountRate: dcRt
        };
      });

      await window.api.checkoutTransaction({
        items: itemsToCheckout,
        date: dateStr,
        customerName: customerInfo ? customerInfo.name : '',
        customerId: selectedCustomer || null,
        notes: notes,
        paymentMethod: paymentDetails.Cash >= paymentDetails.Card && paymentDetails.Cash >= paymentDetails.Momo && paymentDetails.Cash >= paymentDetails.Credit ? 'Cash' 
                         : paymentDetails.Card >= paymentDetails.Momo && paymentDetails.Card >= paymentDetails.Credit ? 'Card' 
                         : paymentDetails.Credit >= paymentDetails.Momo ? 'Store Credit' : 'Mobile Money',
        paymentDetails: {
          Cash: parseFloat(paymentDetails.Cash) || 0,
          Card: parseFloat(paymentDetails.Card) || 0,
          "Mobile Money": parseFloat(paymentDetails.Momo) || 0,
          "Store Credit": parseFloat(paymentDetails.Credit) || 0
        },
        receiptId: receiptId,
        receiptSignature: rcptSign,
        internalData: intrlData,
        receiptNo: rcptNo,
        userId: currentUser.id,
        status: 'COMPLETED'
      });`;

  if (filePath.includes('RestaurantPOS')) {
    code = code.replace(oldCodeRest, newCodeRest);
  } else {
    code = code.replace(oldCodeRet, newCodeRet);
  }

  fs.writeFileSync(filePath, code);
  console.log('Patched ' + filePath);
}

patchPOS('src/components/RestaurantPOS.tsx');
patchPOS('src/components/RetailPOS.tsx');

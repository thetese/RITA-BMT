import { IpcMain, BrowserWindow, Notification } from 'electron';

export const registerSalesControllers = (ipcMain: IpcMain, store: any) => {
  // Sales
  ipcMain.handle('sales:getAll', () => store.getSales());
  ipcMain.handle('sales:add', (_, sale, userId) => store.addSale(sale, userId));
  ipcMain.handle('sales:checkout', (_, payload) => store.checkoutTransaction(payload));
  ipcMain.handle('sales:update', (_, sale, userId) => store.updateSale(sale, userId));
  ipcMain.handle('sales:delete', (_, id, userId) => store.deleteSale(id, userId));
  ipcMain.handle('sales:refund', (_, id, userId) => store.refundSale(id, userId));

  // Held Carts
  const notifyHeldCartsChanged = () => {
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) win.webContents.send('held-carts-changed');
    });
  };

  ipcMain.handle('heldCarts:getAll', () => store.getHeldCarts());
  ipcMain.handle('heldCarts:add', (_, cart) => {
    const res = store.addHeldCart(cart);
    notifyHeldCartsChanged();
    return res;
  });
  ipcMain.handle('heldCarts:update', (_, id, cart) => {
    const res = store.updateHeldCart(id, cart);
    notifyHeldCartsChanged();
    return res;
  });
  ipcMain.handle('heldCarts:updateItemStatus', (_, cartId, productId, status) => {
    const result = store.updateCartItemStatus(cartId, productId, status);
    if (result && result.success && result.newStatus === 'ready') {
      if (Notification.isSupported()) {
        new Notification({
          title: '🍽️ Food is Ready!',
          body: `${result.productName} for ${result.cartName} is ready in the kitchen.`
        }).show();
      }
      
      BrowserWindow.getAllWindows().forEach(win => {
        if (!win.isDestroyed()) {
          win.webContents.send('food-ready-alert', {
            productName: result.productName,
            cartName: result.cartName
          });
        }
      });
    }
    return result ? result.success : false;
  });
  ipcMain.handle('heldCarts:delete', (_, id) => {
    const res = store.deleteHeldCart(id);
    notifyHeldCartsChanged();
    return res;
  });

  // Products & Inventory
  ipcMain.handle('products:getAll', () => store.getProducts());
  ipcMain.handle('products:add', (_, product, userId) => store.addProduct(product, userId));
  ipcMain.handle('products:update', (_, product, userId) => store.updateProduct(product, userId));
  ipcMain.handle('products:delete', (_, id, userId) => store.deleteProduct(id, userId));
  ipcMain.handle('inventory:getLowStock', () => store.getLowStockItems());

  // Stock Movements
  ipcMain.handle('stock:getAll', () => store.getStockMovements());
  ipcMain.handle('stock:add', (_, movement, userId) => store.addStockMovement(movement, userId));

  // Expenses
  ipcMain.handle('expenses:getAll', () => store.getExpenses());
  ipcMain.handle('expenses:add', (_, expense, userId) => store.addExpense(expense, userId));
  ipcMain.handle('expenses:update', (_, expense, userId) => store.updateExpense(expense, userId));
  ipcMain.handle('expenses:delete', (_, id, userId) => store.deleteExpense(id, userId));

  // Invoices
  ipcMain.handle('invoices:getAll', () => store.getInvoices());
  ipcMain.handle('invoices:add', (_, inv) => store.addInvoice(inv));
  ipcMain.handle('invoices:update', (_, inv) => store.updateInvoice(inv));
  ipcMain.handle('invoices:updateStatus', (_, id, status) => store.updateInvoiceStatus(id, status));
  ipcMain.handle('invoices:delete', (_, id) => store.deleteInvoice(id));

  // Ingredients & Recipes
  ipcMain.handle('ingredients:getAll', () => store.getIngredients());
  ipcMain.handle('ingredients:add', (_, ingredient, userId) => store.addIngredient(ingredient, userId));
  ipcMain.handle('ingredients:update', (_, ingredient, userId) => store.updateIngredient(ingredient, userId));
  ipcMain.handle('ingredients:delete', (_, id, userId) => store.deleteIngredient(id, userId));
  
  ipcMain.handle('recipes:get', (_, productId) => store.getRecipes(productId));
  ipcMain.handle('recipes:add', (_, recipe, userId) => store.addRecipe(recipe, userId));
  ipcMain.handle('recipes:delete', (_, id, userId) => store.deleteRecipe(id, userId));

  // Purchase Orders
  ipcMain.handle('purchaseOrders:getAll', () => store.getPurchaseOrders());
  ipcMain.handle('purchaseOrders:add', (_, po, userId) => store.addPurchaseOrder(po, userId));
  ipcMain.handle('purchaseOrders:delete', (_, id, userId) => store.deletePurchaseOrder(id, userId));
};

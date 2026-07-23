import { IpcMain, BrowserWindow, Notification } from 'electron';
import { EbmService } from '../services/ebmService';

export const registerSalesControllers = (ipcMain: IpcMain, store: any) => {
  const ebmService = new EbmService(store);

  // Sales
  ipcMain.handle('sales:getAll', (_, storeId) => store.getSales(storeId));
  ipcMain.handle('sales:add', (_, sale, userId) => store.addSale(sale, userId));
  
  ipcMain.handle('sales:checkout', async (_, payload) => {
    // Attempt EBM Sync before finalizing checkout locally
    const ebmResult = await ebmService.submitSale(payload);
    
    if (ebmResult.success) {
      payload.ebm_receipt_number = ebmResult.receiptNumber;
      payload.ebm_qr_url = ebmResult.qrUrl;
      payload.ebm_signature = ebmResult.signature;
      payload.ebm_internal_data = ebmResult.internalData;
      payload.ebm_status = 'SYNCED';
    } else {
      console.warn("EBM Sync failed, queueing for later:", ebmResult.error);
      payload.ebm_status = 'PENDING';
    }

    // Process local checkout with attached EBM data
    return store.checkoutTransaction(payload);
  });

  ipcMain.handle('sales:update', (_, sale, userId) => store.updateSale(sale, userId));
  ipcMain.handle('sales:delete', (_, id, userId) => store.deleteSale(id, userId));
  ipcMain.handle('sales:refund', (_, id, userId) => store.refundSale(id, userId));

  // EBM
  ipcMain.handle('ebm:ping', () => ebmService.pingVsdc());

  // Held Carts
  const notifyHeldCartsChanged = () => {
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) win.webContents.send('held-carts-changed');
    });
  };

  ipcMain.handle('heldCarts:getAll', (_, storeId) => store.getHeldCarts(storeId));
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
  ipcMain.handle('products:getAll', (_, storeId) => store.getProducts(storeId));
  ipcMain.handle('products:add', (_, product, userId) => store.addProduct(product, userId));
  ipcMain.handle('products:update', (_, product, userId) => store.updateProduct(product, userId));
  ipcMain.handle('products:delete', (_, id, userId) => store.deleteProduct(id, userId));
  ipcMain.handle('inventory:getLowStock', (_, storeId) => store.getLowStockItems(storeId));

  // Stock Movements
  ipcMain.handle('stock:getAll', (_, storeId) => store.getStockMovements(storeId));
  ipcMain.handle('stock:add', (_, movement, userId) => store.addStockMovement(movement, userId));

  // Expenses
  ipcMain.handle('expenses:getAll', (_, storeId) => store.getExpenses(storeId));
  ipcMain.handle('expenses:add', (_, expense, userId) => store.addExpense(expense, userId));
  ipcMain.handle('expenses:update', (_, expense, userId) => store.updateExpense(expense, userId));
  ipcMain.handle('expenses:delete', (_, id, userId) => store.deleteExpense(id, userId));

  // Invoices
  ipcMain.handle('invoices:getAll', (_, storeId) => store.getInvoices(storeId));
  ipcMain.handle('invoices:add', (_, inv) => store.addInvoice(inv));
  ipcMain.handle('invoices:update', (_, inv) => store.updateInvoice(inv));
  ipcMain.handle('invoices:updateStatus', (_, id, status) => store.updateInvoiceStatus(id, status));
  ipcMain.handle('invoices:delete', (_, id) => store.deleteInvoice(id));

  // Ingredients & Recipes
  ipcMain.handle('ingredients:getAll', (_, storeId) => store.getIngredients(storeId));
  ipcMain.handle('ingredients:add', (_, ingredient, userId) => store.addIngredient(ingredient, userId));
  ipcMain.handle('ingredients:update', (_, ingredient, userId) => store.updateIngredient(ingredient, userId));
  ipcMain.handle('ingredients:delete', (_, id, userId) => store.deleteIngredient(id, userId));
  
  ipcMain.handle('recipes:get', (_, productId) => store.getRecipes(productId));
  ipcMain.handle('recipes:add', (_, recipe, userId) => store.addRecipe(recipe, userId));
  ipcMain.handle('recipes:delete', (_, id, userId) => store.deleteRecipe(id, userId));

  // Purchase Orders
  ipcMain.handle('purchaseOrders:getAll', (_, storeId) => store.getPurchaseOrders(storeId));
  ipcMain.handle('purchaseOrders:add', (_, po, userId) => store.addPurchaseOrder(po, userId));
  ipcMain.handle('purchaseOrders:delete', (_, id, userId) => store.deletePurchaseOrder(id, userId));

  // Appointments
  ipcMain.handle('appointments:getAll', () => store.getAppointments());
  ipcMain.handle('appointments:add', (_, apt) => store.addAppointment(apt));
  ipcMain.handle('appointments:update', (_, apt) => store.updateAppointment(apt));
  ipcMain.handle('appointments:delete', (_, id) => store.deleteAppointment(id));

  // Leads
  ipcMain.handle('leads:getAll', () => store.getLeads());
  ipcMain.handle('leads:add', (_, lead) => store.addLead(lead));
  ipcMain.handle('leads:update', (_, lead) => store.updateLead(lead));
  ipcMain.handle('leads:delete', (_, id) => store.deleteLead(id));

  // Projects
  ipcMain.handle('projects:getAll', () => store.getProjects());
  ipcMain.handle('projects:add', (_, project) => store.addProject(project));
  ipcMain.handle('projects:update', (_, project) => store.updateProject(project));
  ipcMain.handle('projects:delete', (_, id) => store.deleteProject(id));

  // Tasks
  ipcMain.handle('tasks:getAll', () => store.getTasks());
  ipcMain.handle('tasks:add', (_, task) => store.addTask(task));
  ipcMain.handle('tasks:update', (_, task) => store.updateTask(task));
  ipcMain.handle('tasks:delete', (_, id) => store.deleteTask(id));

  // Time Entries
  ipcMain.handle('timeEntries:getAll', () => store.getTimeEntries());
  ipcMain.handle('timeEntries:add', (_, entry) => store.addTimeEntry(entry));
  ipcMain.handle('timeEntries:update', (_, entry) => store.updateTimeEntry(entry));
  ipcMain.handle('timeEntries:delete', (_, id) => store.deleteTimeEntry(id));
};

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // DB
  backupDatabase: () => ipcRenderer.invoke('db:backup'),
  restoreDatabase: () => ipcRenderer.invoke('db:restore'),

  // Settings
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  getAllSettings: () => ipcRenderer.invoke('settings:getAll'),
  getAllDisplays: () => ipcRenderer.invoke('displays:getAll'),

  // Waiters
  getWaiters: () => ipcRenderer.invoke('waiters:getAll'),
  addWaiter: (waiter) => ipcRenderer.invoke('waiters:add', waiter),
  updateWaiter: (waiter) => ipcRenderer.invoke('waiters:update', waiter),
  deleteWaiter: (id) => ipcRenderer.invoke('waiters:delete', id),

  // Users
  getUsers: () => ipcRenderer.invoke('users:getAll'),
  getUserByUsername: (username) => ipcRenderer.invoke('users:getByUsername', username),
  login: (username, password) => ipcRenderer.invoke('users:login', { username, password }),
  addUser: (user, callerId) => ipcRenderer.invoke('users:add', user, callerId),
  updateUser: (user, callerId) => ipcRenderer.invoke('users:update', user, callerId),
  deleteUser: (id, currentUserId) => ipcRenderer.invoke('users:delete', id, currentUserId),

  // Sales
  getSales: () => ipcRenderer.invoke('sales:getAll'),
  addSale: (sale, userId) => ipcRenderer.invoke('sales:add', sale, userId),
  checkoutTransaction: (payload) => ipcRenderer.invoke('sales:checkout', payload),
  updateSale: (sale, userId) => ipcRenderer.invoke('sales:update', sale, userId),
  deleteSale: (id, userId) => ipcRenderer.invoke('sales:delete', id, userId),
  refundSale: (id, userId) => ipcRenderer.invoke('sales:refund', id, userId),
  // Held Carts
  getHeldCarts: () => ipcRenderer.invoke('heldCarts:getAll'),
  addHeldCart: (cart) => ipcRenderer.invoke('heldCarts:add', cart),
  updateHeldCart: (id, cart) => ipcRenderer.invoke('heldCarts:update', id, cart),
  updateHeldCartItemStatus: (cartId, productId, status) => ipcRenderer.invoke('heldCarts:updateItemStatus', cartId, productId, status),
  deleteHeldCart: (id) => ipcRenderer.invoke('heldCarts:delete', id),
  onFoodReadyAlert: (callback) => {
    const listener = (_, data) => callback(data);
    ipcRenderer.on('food-ready-alert', listener);
    return () => ipcRenderer.removeListener('food-ready-alert', listener);
  },
  onHeldCartsChanged: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('held-carts-changed', listener);
    return () => ipcRenderer.removeListener('held-carts-changed', listener);
  },

  // Products
  getProducts: () => ipcRenderer.invoke('products:getAll'),
  addProduct: (product, userId) => ipcRenderer.invoke('products:add', product, userId),
  updateProduct: (product, userId) => ipcRenderer.invoke('products:update', product, userId),
  deleteProduct: (id, userId) => ipcRenderer.invoke('products:delete', id, userId),
  getLowStockItems: () => ipcRenderer.invoke('inventory:getLowStock'),

  // Stock Movements
  getStockMovements: () => ipcRenderer.invoke('stock:getAll'),
  addStockMovement: (movement, userId) => ipcRenderer.invoke('stock:add', movement, userId),

  // Accounters
  getAccounters: () => ipcRenderer.invoke('accounters:getAll'),
  addAccounter: (accounter) => ipcRenderer.invoke('accounters:add', accounter),
  updateAccounter: (accounter) => ipcRenderer.invoke('accounters:update', accounter),
  deleteAccounter: (id) => ipcRenderer.invoke('accounters:delete', id),

  // Expenses
  getExpenses: () => ipcRenderer.invoke('expenses:getAll'),
  addExpense: (expense, userId) => ipcRenderer.invoke('expenses:add', expense, userId),
  updateExpense: (expense, userId) => ipcRenderer.invoke('expenses:update', expense, userId),
  deleteExpense: (id, userId) => ipcRenderer.invoke('expenses:delete', id, userId),

  // Customers
  getCustomers: () => ipcRenderer.invoke('customers:getAll'),
  addCustomer: (customer, userId) => ipcRenderer.invoke('customers:add', customer, userId),
  updateCustomer: (customer, userId) => ipcRenderer.invoke('customers:update', customer, userId),
  deleteCustomer: (id, userId) => ipcRenderer.invoke('customers:delete', id, userId),
  adjustCustomerBalance: (id, amount) => ipcRenderer.invoke('customers:adjustBalance', id, amount),
  deductCustomerPoints: (id, points) => ipcRenderer.invoke('customers:deductPoints', id, points),

  // Suppliers
  getSuppliers: () => ipcRenderer.invoke('suppliers:getAll'),
  addSupplier: (supplier, userId) => ipcRenderer.invoke('suppliers:add', supplier, userId),
  updateSupplier: (supplier, userId) => ipcRenderer.invoke('suppliers:update', supplier, userId),
  deleteSupplier: (id, userId) => ipcRenderer.invoke('suppliers:delete', id, userId),

  // Purchase Orders
  getPurchaseOrders: () => ipcRenderer.invoke('purchaseOrders:getAll'),
  addPurchaseOrder: (po, userId) => ipcRenderer.invoke('purchaseOrders:add', po, userId),

  // Invoices
  getInvoices: () => ipcRenderer.invoke('invoices:getAll'),
  addInvoice: (inv) => ipcRenderer.invoke('invoices:add', inv),
  updateInvoice: (inv) => ipcRenderer.invoke('invoices:update', inv),
  updateInvoiceStatus: (id, status) => ipcRenderer.invoke('invoices:updateStatus', id, status),
  deleteInvoice: (id) => ipcRenderer.invoke('invoices:delete', id),

  // Printing
  getPrinters: () => ipcRenderer.invoke('print:getPrinters'),
  printReceipt: (htmlContent, printerName) => ipcRenderer.invoke('print:receipt', htmlContent, printerName),

  // Ingredients
  getIngredients: () => ipcRenderer.invoke('ingredients:getAll'),
  addIngredient: (ingredient, userId) => ipcRenderer.invoke('ingredients:add', ingredient, userId),
  updateIngredient: (ingredient, userId) => ipcRenderer.invoke('ingredients:update', ingredient, userId),
  deleteIngredient: (id, userId) => ipcRenderer.invoke('ingredients:delete', id, userId),

  // Recipes
  getRecipes: (productId) => ipcRenderer.invoke('recipes:get', productId),
  addRecipe: (recipe, userId) => ipcRenderer.invoke('recipes:add', recipe, userId),
  deleteRecipe: (id, userId) => ipcRenderer.invoke('recipes:delete', id, userId),

  // Tables
  getTables: () => ipcRenderer.invoke('tables:getAll'),
  addTable: (table, userId) => ipcRenderer.invoke('tables:add', table, userId),
  updateTable: (table, userId) => ipcRenderer.invoke('tables:update', table, userId),
  deleteTable: (id, userId) => ipcRenderer.invoke('tables:delete', id, userId),

  // Shifts
  getActiveShift: (userId) => ipcRenderer.invoke('shifts:getActive', userId),
  openShift: (userId, startingCash) => ipcRenderer.invoke('shifts:open', userId, startingCash),
  closeShift: (shiftId, actualCash) => ipcRenderer.invoke('shifts:close', shiftId, actualCash),
  getExpectedCash: (shiftId) => ipcRenderer.invoke('shifts:getExpectedCash', shiftId),

  // Reports Maker
  generateReport: (timeframe) => ipcRenderer.invoke('reports:generate', timeframe),

  // Stripe
  createStripeCheckout: (payload) => ipcRenderer.invoke('stripe:createCheckout', payload),

  // Timecards
  getTimecards: () => ipcRenderer.invoke('timecards:getAll'),
  clockIn: (userId, hourlyRate) => ipcRenderer.invoke('timecards:clockIn', userId, hourlyRate),
  clockOut: (id) => ipcRenderer.invoke('timecards:clockOut', id),
  updateUserRates: (userId, hourlyRate, commissionRate, callerId) => ipcRenderer.invoke('users:updateRates', userId, hourlyRate, commissionRate, callerId),
  // Purchase Orders - extra method
  deletePurchaseOrder: (id: any, userId: any) => ipcRenderer.invoke('po:delete', id, userId),

  // Appointments
  getAppointments: () => ipcRenderer.invoke('appointments:getAll'),
  addAppointment: (apt) => ipcRenderer.invoke('appointments:add', apt),
  updateAppointment: (apt) => ipcRenderer.invoke('appointments:update', apt),
  deleteAppointment: (id) => ipcRenderer.invoke('appointments:delete', id),

  // Leads
  getLeads: () => ipcRenderer.invoke('leads:getAll'),
  addLead: (lead) => ipcRenderer.invoke('leads:add', lead),
  updateLead: (lead) => ipcRenderer.invoke('leads:update', lead),
  deleteLead: (id) => ipcRenderer.invoke('leads:delete', id),

  // Projects
  getProjects: () => ipcRenderer.invoke('projects:getAll'),
  addProject: (project) => ipcRenderer.invoke('projects:add', project),
  updateProject: (project) => ipcRenderer.invoke('projects:update', project),
  deleteProject: (id) => ipcRenderer.invoke('projects:delete', id),

  // Tasks
  getTasks: () => ipcRenderer.invoke('tasks:getAll'),
  addTask: (task) => ipcRenderer.invoke('tasks:add', task),
  updateTask: (task) => ipcRenderer.invoke('tasks:update', task),
  deleteTask: (id) => ipcRenderer.invoke('tasks:delete', id),

  // Time Entries
  getTimeEntries: () => ipcRenderer.invoke('timeEntries:getAll'),
  addTimeEntry: (entry) => ipcRenderer.invoke('timeEntries:add', entry),
  updateTimeEntry: (entry) => ipcRenderer.invoke('timeEntries:update', entry),
  deleteTimeEntry: (id) => ipcRenderer.invoke('timeEntries:delete', id),
});

const { contextBridge, ipcRenderer } = require('electron');

const getStoreId = () => {
  const stored = localStorage.getItem('currentStoreId');
  if (stored && stored !== 'ALL') return stored;
  if (window.location.protocol === 'rita-plugin:') {
    return window.location.hostname;
  }
  return 'general';
};

contextBridge.exposeInMainWorld('api', {
  // Modules
  getInstalledModules: () => ipcRenderer.invoke('modules:getAll'),
  installPluginZip: () => ipcRenderer.invoke('plugin:installZip'),

  // DB
  backupDatabase: () => ipcRenderer.invoke('db:backup'),
  restoreDatabase: () => ipcRenderer.invoke('db:restore'),

  // Settings
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  getAllSettings: () => ipcRenderer.invoke('settings:getAll'),
  getAllDisplays: () => ipcRenderer.invoke('displays:getAll'),
  pingEbm: () => ipcRenderer.invoke('ebm:ping'),

  // Waiters
  getWaiters: () => ipcRenderer.invoke('waiters:getAll', getStoreId()),
  addWaiter: (waiter) => { waiter.storeId = waiter.storeId || getStoreId(); return ipcRenderer.invoke('waiters:add', waiter); },
  updateWaiter: (waiter) => ipcRenderer.invoke('waiters:update', waiter),
  deleteWaiter: (id) => ipcRenderer.invoke('waiters:delete', id),

  // Users
  getUsers: () => ipcRenderer.invoke('users:getAll', getStoreId()),
  getUserByUsername: (username) => ipcRenderer.invoke('users:getByUsername', username),
  login: (username, password) => ipcRenderer.invoke('users:login', { username, password }),
  addUser: (user, callerId) => { user.storeId = user.storeId || getStoreId(); return ipcRenderer.invoke('users:add', user, callerId); },
  updateUser: (user, callerId) => ipcRenderer.invoke('users:update', user, callerId),
  deleteUser: (id, currentUserId) => ipcRenderer.invoke('users:delete', id, currentUserId),
  resetPassword: (username, newPassword, recoveryCode) => ipcRenderer.invoke('users:resetPassword', username, newPassword, recoveryCode),

  // Sales
  getSales: () => ipcRenderer.invoke('sales:getAll', getStoreId()),
  addSale: (sale, userId) => { sale.storeId = sale.storeId || getStoreId(); return ipcRenderer.invoke('sales:add', sale, userId); },
  checkoutTransaction: (payload) => ipcRenderer.invoke('sales:checkout', payload),
  updateSale: (sale, userId) => ipcRenderer.invoke('sales:update', sale, userId),
  deleteSale: (id, userId) => ipcRenderer.invoke('sales:delete', id, userId),
  refundSale: (id, userId) => ipcRenderer.invoke('sales:refund', id, userId),
  
  // Held Carts
  getHeldCarts: () => ipcRenderer.invoke('heldCarts:getAll', getStoreId()),
  addHeldCart: (cart) => { cart.storeId = cart.storeId || getStoreId(); return ipcRenderer.invoke('heldCarts:add', cart); },
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
  getProducts: () => ipcRenderer.invoke('products:getAll', getStoreId()),
  addProduct: (product, userId) => { product.storeId = product.storeId || getStoreId(); return ipcRenderer.invoke('products:add', product, userId); },
  updateProduct: (product, userId) => ipcRenderer.invoke('products:update', product, userId),
  deleteProduct: (id, userId) => ipcRenderer.invoke('products:delete', id, userId),
  getLowStockItems: () => ipcRenderer.invoke('inventory:getLowStock', getStoreId()),

  // Stock Movements
  getStockMovements: () => ipcRenderer.invoke('stock:getAll', getStoreId()),
  addStockMovement: (movement, userId) => { movement.storeId = movement.storeId || getStoreId(); return ipcRenderer.invoke('stock:add', movement, userId); },

  // Accounters
  getAccounters: () => ipcRenderer.invoke('accounters:getAll', getStoreId()),
  addAccounter: (accounter) => { accounter.storeId = accounter.storeId || getStoreId(); return ipcRenderer.invoke('accounters:add', accounter); },
  updateAccounter: (accounter) => ipcRenderer.invoke('accounters:update', accounter),
  deleteAccounter: (id) => ipcRenderer.invoke('accounters:delete', id),

  // Expenses
  getExpenses: () => ipcRenderer.invoke('expenses:getAll', getStoreId()),
  addExpense: (expense, userId) => { expense.storeId = expense.storeId || getStoreId(); return ipcRenderer.invoke('expenses:add', expense, userId); },
  updateExpense: (expense, userId) => ipcRenderer.invoke('expenses:update', expense, userId),
  deleteExpense: (id, userId) => ipcRenderer.invoke('expenses:delete', id, userId),

  // Customers
  getCustomers: () => ipcRenderer.invoke('customers:getAll', getStoreId()),
  addCustomer: (customer, userId) => { customer.storeId = customer.storeId || getStoreId(); return ipcRenderer.invoke('customers:add', customer, userId); },
  updateCustomer: (customer, userId) => ipcRenderer.invoke('customers:update', customer, userId),
  deleteCustomer: (id, userId) => ipcRenderer.invoke('customers:delete', id, userId),
  adjustCustomerBalance: (id, amount) => ipcRenderer.invoke('customers:adjustBalance', id, amount),
  deductCustomerPoints: (id, points) => ipcRenderer.invoke('customers:deductPoints', id, points),

  // Suppliers
  getSuppliers: () => ipcRenderer.invoke('suppliers:getAll', getStoreId()),
  addSupplier: (supplier, userId) => { supplier.storeId = supplier.storeId || getStoreId(); return ipcRenderer.invoke('suppliers:add', supplier, userId); },
  updateSupplier: (supplier, userId) => ipcRenderer.invoke('suppliers:update', supplier, userId),
  deleteSupplier: (id, userId) => ipcRenderer.invoke('suppliers:delete', id, userId),

  // Purchase Orders
  getPurchaseOrders: () => ipcRenderer.invoke('purchaseOrders:getAll', getStoreId()),
  addPurchaseOrder: (po, userId) => { po.storeId = po.storeId || getStoreId(); return ipcRenderer.invoke('purchaseOrders:add', po, userId); },
  deletePurchaseOrder: (id, userId) => ipcRenderer.invoke('po:delete', id, userId),

  // Invoices
  getInvoices: () => ipcRenderer.invoke('invoices:getAll', getStoreId()),
  addInvoice: (inv) => { inv.storeId = inv.storeId || getStoreId(); return ipcRenderer.invoke('invoices:add', inv); },
  updateInvoice: (inv) => ipcRenderer.invoke('invoices:update', inv),
  updateInvoiceStatus: (id, status) => ipcRenderer.invoke('invoices:updateStatus', id, status),
  deleteInvoice: (id) => ipcRenderer.invoke('invoices:delete', id),

  // Printing
  getPrinters: () => ipcRenderer.invoke('print:getPrinters'),
  printReceipt: (htmlContent, printerName) => ipcRenderer.invoke('print:receipt', htmlContent, printerName),

  // Ingredients
  getIngredients: () => ipcRenderer.invoke('ingredients:getAll', getStoreId()),
  addIngredient: (ingredient, userId) => { ingredient.storeId = ingredient.storeId || getStoreId(); return ipcRenderer.invoke('ingredients:add', ingredient, userId); },
  updateIngredient: (ingredient, userId) => ipcRenderer.invoke('ingredients:update', ingredient, userId),
  deleteIngredient: (id, userId) => ipcRenderer.invoke('ingredients:delete', id, userId),

  // Recipes
  getRecipes: (productId) => ipcRenderer.invoke('recipes:get', productId),
  addRecipe: (recipe, userId) => { recipe.storeId = recipe.storeId || getStoreId(); return ipcRenderer.invoke('recipes:add', recipe, userId); },
  deleteRecipe: (id, userId) => ipcRenderer.invoke('recipes:delete', id, userId),

  // Tables
  getTables: () => ipcRenderer.invoke('tables:getAll', getStoreId()),
  addTable: (table, userId) => { table.storeId = table.storeId || getStoreId(); return ipcRenderer.invoke('tables:add', table, userId); },
  updateTable: (table, userId) => ipcRenderer.invoke('tables:update', table, userId),
  deleteTable: (id, userId) => ipcRenderer.invoke('tables:delete', id, userId),

  // Shifts
  getActiveShift: (userId) => ipcRenderer.invoke('shifts:getActive', userId, getStoreId()),
  openShift: (userId, startingCash) => ipcRenderer.invoke('shifts:open', userId, startingCash),
  closeShift: (shiftId, actualCash) => ipcRenderer.invoke('shifts:close', shiftId, actualCash),
  getExpectedCash: (shiftId) => ipcRenderer.invoke('shifts:getExpectedCash', shiftId),

  // Reports
  generateReport: (timeframe) => ipcRenderer.invoke('reports:generate', timeframe),

  // Stripe
  createStripeCheckout: (payload) => ipcRenderer.invoke('stripe:createCheckout', payload),

  // Timecards
  getTimecards: () => ipcRenderer.invoke('timecards:getAll', getStoreId()),
  clockIn: (userId, hourlyRate) => ipcRenderer.invoke('timecards:clockIn', userId, hourlyRate),
  clockOut: (id) => ipcRenderer.invoke('timecards:clockOut', id),
  addTimecard: (timecard, callerId) => ipcRenderer.invoke('timecards:add', timecard, callerId),
  updateTimecard: (timecard, callerId) => ipcRenderer.invoke('timecards:update', timecard, callerId),
  deleteTimecard: (id, callerId) => ipcRenderer.invoke('timecards:delete', id, callerId),
  updateUserRates: (userId, hourlyRate, commissionRate, callerId) => ipcRenderer.invoke('users:updateRates', userId, hourlyRate, commissionRate, callerId),

  // Printer Tracking
  getPrintJobs: () => ipcRenderer.invoke('plugin:printer:getJobs'),
  getPrinterJobs: () => ipcRenderer.invoke('plugin:printer:getJobs'),
  getPrinterStatus: () => ipcRenderer.invoke('plugin:printer:getStatus'),
  logPrintJob: (job) => ipcRenderer.invoke('plugin:printer:logJob', job),
  updatePrintJobStatus: (jobId, status, error) => ipcRenderer.invoke('plugin:printer:updateJobStatus', jobId, status, error),
  updatePrinterStatus: (name, status) => ipcRenderer.invoke('plugin:printer:updatePrinterStatus', name, status),
  savePrinter: (printer) => ipcRenderer.invoke('plugin:printer:savePrinter', printer),
  deletePrinter: (name) => ipcRenderer.invoke('plugin:printer:deletePrinter', name),

  // Appointments
  getAppointments: () => ipcRenderer.invoke('appointments:getAll', getStoreId()),
  addAppointment: (apt) => { apt.storeId = apt.storeId || getStoreId(); return ipcRenderer.invoke('appointments:add', apt); },
  updateAppointment: (apt) => ipcRenderer.invoke('appointments:update', apt),
  deleteAppointment: (id) => ipcRenderer.invoke('appointments:delete', id),

  // Leads
  getLeads: () => ipcRenderer.invoke('leads:getAll', getStoreId()),
  addLead: (lead) => { lead.storeId = lead.storeId || getStoreId(); return ipcRenderer.invoke('leads:add', lead); },
  updateLead: (lead) => ipcRenderer.invoke('leads:update', lead),
  deleteLead: (id) => ipcRenderer.invoke('leads:delete', id),

  // Projects
  getProjects: () => ipcRenderer.invoke('projects:getAll', getStoreId()),
  addProject: (project) => { project.storeId = project.storeId || getStoreId(); return ipcRenderer.invoke('projects:add', project); },
  updateProject: (project) => ipcRenderer.invoke('projects:update', project),
  deleteProject: (id) => ipcRenderer.invoke('projects:delete', id),

  // Tasks
  getTasks: () => ipcRenderer.invoke('tasks:getAll', getStoreId()),
  addTask: (task) => { task.storeId = task.storeId || getStoreId(); return ipcRenderer.invoke('tasks:add', task); },
  updateTask: (task) => ipcRenderer.invoke('tasks:update', task),
  deleteTask: (id) => ipcRenderer.invoke('tasks:delete', id),

  // Time Entries
  getTimeEntries: () => ipcRenderer.invoke('timeEntries:getAll', getStoreId()),
  addTimeEntry: (entry) => { entry.storeId = entry.storeId || getStoreId(); return ipcRenderer.invoke('timeEntries:add', entry); },
  updateTimeEntry: (entry) => ipcRenderer.invoke('timeEntries:update', entry),
  deleteTimeEntry: (id) => ipcRenderer.invoke('timeEntries:delete', id),

  // Stores
  getStores: () => ipcRenderer.invoke('stores:getAll'),
  addStore: (store) => ipcRenderer.invoke('stores:add', store),
  updateStore: (store) => ipcRenderer.invoke('stores:update', store),
  deleteStore: (id) => ipcRenderer.invoke('stores:delete', id),

  // Hotel
  hotelGetProperties: () => ipcRenderer.invoke('hotel:getProperties'),
  hotelGetRooms: (propertyId) => ipcRenderer.invoke('hotel:getRooms', propertyId),
  hotelAddRoom: (room) => ipcRenderer.invoke('hotel:addRoom', room),
  hotelUpdateRoomStatus: (id, status) => ipcRenderer.invoke('hotel:updateRoomStatus', id, status),
  hotelGetRatePlans: () => ipcRenderer.invoke('hotel:getRatePlans'),
  hotelAddRatePlan: (plan) => ipcRenderer.invoke('hotel:addRatePlan', plan),
  hotelUpdateRatePlan: (id, plan) => ipcRenderer.invoke('hotel:updateRatePlan', id, plan),
  hotelDeleteRatePlan: (id) => ipcRenderer.invoke('hotel:deleteRatePlan', id),
  hotelGetReservations: (propertyId) => ipcRenderer.invoke('hotel:getReservations', propertyId),
  hotelAddReservation: (res) => ipcRenderer.invoke('hotel:addReservation', res),
  hotelUpdateReservationStatus: (id, status, roomId) => ipcRenderer.invoke('hotel:updateReservationStatus', id, status, roomId),
  hotelGetFolios: (reservationId) => ipcRenderer.invoke('hotel:getFolios', reservationId),
  hotelAddFolio: (reservationId, folioType) => ipcRenderer.invoke('hotel:addFolio', reservationId, folioType),
  hotelAddChargeToRoom: (roomId, amount, desc, folioType) => ipcRenderer.invoke('hotel:addChargeToRoom', roomId, amount, desc, folioType),
  hotelAddPaymentToFolio: (folioId, amount, method) => ipcRenderer.invoke('hotel:addPaymentToFolio', folioId, amount, method),
  hotelGetHousekeepingTasks: () => ipcRenderer.invoke('hotel:getHousekeepingTasks'),
  
  // Guests
  hotelGetGuests: () => ipcRenderer.invoke('hotel:getGuests'),
  hotelAddGuest: (guest) => ipcRenderer.invoke('hotel:addGuest', guest),
  hotelUpdateGuest: (id, data) => ipcRenderer.invoke('hotel:updateGuest', id, data),

  // Night Audit
  hotelRunNightAudit: (data) => ipcRenderer.invoke('hotel:runNightAudit', data),
  hotelGetNightAudits: () => ipcRenderer.invoke('hotel:getNightAudits')
});

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // DB
  backupDatabase: () => ipcRenderer.invoke('db:backup'),
  restoreDatabase: () => ipcRenderer.invoke('db:restore'),

  // Settings
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),

  // Users
  getUsers: () => ipcRenderer.invoke('users:getAll'),
  getUserByUsername: (username) => ipcRenderer.invoke('users:getByUsername', username),
  addUser: (user) => ipcRenderer.invoke('users:add', user),
  updateUser: (user) => ipcRenderer.invoke('users:update', user),
  deleteUser: (id, currentUserId) => ipcRenderer.invoke('users:delete', id, currentUserId),

  // Sales
  getSales: () => ipcRenderer.invoke('sales:getAll'),
  addSale: (sale, userId) => ipcRenderer.invoke('sales:add', sale, userId),
  updateSale: (sale, userId) => ipcRenderer.invoke('sales:update', sale, userId),
  deleteSale: (id, userId) => ipcRenderer.invoke('sales:delete', id, userId),
  
  // Products
  getProducts: () => ipcRenderer.invoke('products:getAll'),
  addProduct: (product, userId) => ipcRenderer.invoke('products:add', product, userId),
  updateProduct: (product, userId) => ipcRenderer.invoke('products:update', product, userId),
  deleteProduct: (id, userId) => ipcRenderer.invoke('products:delete', id, userId),

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

  // Printing
  getPrinters: () => ipcRenderer.invoke('print:getPrinters'),
  printReceipt: (htmlContent, printerName) => ipcRenderer.invoke('print:receipt', htmlContent, printerName),
});

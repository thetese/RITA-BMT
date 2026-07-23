import { IpcMain } from 'electron';

export const registerUserControllers = (ipcMain: IpcMain, store: any) => {
  // Waiters
  ipcMain.handle('waiters:getAll', () => store.getWaiters());
  ipcMain.handle('waiters:add', (_, waiter) => store.addWaiter(waiter));
  ipcMain.handle('waiters:update', (_, waiter) => store.updateWaiter(waiter));
  ipcMain.handle('waiters:delete', (_, id) => store.deleteWaiter(id));

  // Users
  ipcMain.handle('users:getAll', () => store.getUsers());
  ipcMain.handle('users:getByUsername', (_, username) => store.getUserByUsername(username));
  ipcMain.handle('users:login', (_, creds) => store.verifyLogin(creds.username, creds.password));
  ipcMain.handle('users:add', (_, user, callerId) => { store.requireAdmin(callerId); return store.addUser(user); });
  ipcMain.handle('users:update', (_, user, callerId) => { store.requireAdmin(callerId); return store.updateUser(user); });
  ipcMain.handle('users:delete', (_, id, currentUserId) => { store.requireAdmin(currentUserId); return store.deleteUser(id, currentUserId); });
  ipcMain.handle('users:updateRates', (_, userId, hourlyRate, commissionRate, callerId) => { store.requireAdmin(callerId); return store.updateUserRates(userId, hourlyRate, commissionRate); });

  // Accounters
  ipcMain.handle('accounters:getAll', () => store.getAccounters());
  ipcMain.handle('accounters:add', (_, accounter) => store.addAccounter(accounter));
  ipcMain.handle('accounters:update', (_, accounter) => store.updateAccounter(accounter));
  ipcMain.handle('accounters:delete', (_, id) => store.deleteAccounter(id));

  // Customers
  ipcMain.handle('customers:getAll', () => store.getCustomers());
  ipcMain.handle('customers:add', (_, c, userId) => store.addCustomer(c, userId));
  ipcMain.handle('customers:update', (_, c, userId) => store.updateCustomer(c, userId));
  ipcMain.handle('customers:delete', (_, id, userId) => store.deleteCustomer(id, userId));
  ipcMain.handle('customers:deductPoints', (_, id, points) => store.deductCustomerPoints(id, points));
  ipcMain.handle('customers:adjustBalance', (_, id, amount) => store.adjustCustomerBalance(id, amount));

  // Suppliers
  ipcMain.handle('suppliers:getAll', () => store.getSuppliers());
  ipcMain.handle('suppliers:add', (_, supplier, userId) => store.addSupplier(supplier, userId));
  ipcMain.handle('suppliers:update', (_, supplier, userId) => store.updateSupplier(supplier, userId));
  ipcMain.handle('suppliers:delete', (_, id, userId) => store.deleteSupplier(id, userId));

  // Tables
  ipcMain.handle('tables:getAll', () => store.getTables());
  ipcMain.handle('tables:add', (_, table, userId) => store.addTable(table, userId));
  ipcMain.handle('tables:update', (_, table, userId) => store.updateTable(table, userId));
  ipcMain.handle('tables:delete', (_, id, userId) => store.deleteTable(id, userId));

  // Shifts
  ipcMain.handle('shifts:getActive', (_, userId) => store.getActiveShift(userId));
  ipcMain.handle('shifts:open', (_, userId, startingCash) => store.openShift(userId, startingCash));
  ipcMain.handle('shifts:close', (_, shiftId, actualCash) => store.closeShift(shiftId, actualCash));
  ipcMain.handle('shifts:getExpectedCash', (_, shiftId) => store.getExpectedCash(shiftId));

  // Timecards
  ipcMain.handle('timecards:getAll', () => store.getTimecards());
  ipcMain.handle('timecards:clockIn', (_, userId, hourlyRate) => store.clockIn(userId, hourlyRate));
  ipcMain.handle('timecards:clockOut', (_, id) => store.clockOut(id));
};

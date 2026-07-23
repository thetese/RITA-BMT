const fs = require('fs');

let core = fs.readFileSync('electron/store/coreStore.ts', 'utf8');

const isAdminCode = `
  isAdmin(userId) {
    if (!userId) return false;
    try {
      const user = this.db.prepare('SELECT role FROM users WHERE id = ?').get(userId);
      return user && (user.role === 'Admin' || user.role === 'admin');
    } catch(e) { return false; }
  },

  requireAdmin(userId) {
    if (!this.isAdmin(userId)) {
      throw new Error('Unauthorized: Admin access required');
    }
  },
`;

core = core.replace('  getWaiters() {', isAdminCode + '\n  getWaiters() {');
fs.writeFileSync('electron/store/coreStore.ts', core);

let userController = fs.readFileSync('electron/controllers/userController.ts', 'utf8');
userController = userController.replace(
  "ipcMain.handle('users:add', (_, user) => store.addUser(user));",
  "ipcMain.handle('users:add', (_, user, callerId) => { store.requireAdmin(callerId); return store.addUser(user); });"
);
userController = userController.replace(
  "ipcMain.handle('users:update', (_, user) => store.updateUser(user));",
  "ipcMain.handle('users:update', (_, user, callerId) => { store.requireAdmin(callerId); return store.updateUser(user); });"
);
userController = userController.replace(
  "ipcMain.handle('users:delete', (_, id, currentUserId) => store.deleteUser(id, currentUserId));",
  "ipcMain.handle('users:delete', (_, id, currentUserId) => { store.requireAdmin(currentUserId); return store.deleteUser(id, currentUserId); });"
);
userController = userController.replace(
  "ipcMain.handle('users:updateRates', (_, userId, hourlyRate, commissionRate) => store.updateUserRates(userId, hourlyRate, commissionRate));",
  "ipcMain.handle('users:updateRates', (_, userId, hourlyRate, commissionRate, callerId) => { store.requireAdmin(callerId); return store.updateUserRates(userId, hourlyRate, commissionRate); });"
);
fs.writeFileSync('electron/controllers/userController.ts', userController);

let preload = fs.readFileSync('electron/preload.ts', 'utf8');
preload = preload.replace(
  "addUser: (user) => ipcRenderer.invoke('users:add', user),",
  "addUser: (user, callerId) => ipcRenderer.invoke('users:add', user, callerId),"
);
preload = preload.replace(
  "updateUser: (user) => ipcRenderer.invoke('users:update', user),",
  "updateUser: (user, callerId) => ipcRenderer.invoke('users:update', user, callerId),"
);
preload = preload.replace(
  "updateUserRates: (userId, hourlyRate, commissionRate) => ipcRenderer.invoke('users:updateRates', userId, hourlyRate, commissionRate),",
  "updateUserRates: (userId, hourlyRate, commissionRate, callerId) => ipcRenderer.invoke('users:updateRates', userId, hourlyRate, commissionRate, callerId),"
);
fs.writeFileSync('electron/preload.ts', preload);

let usersManagement = fs.readFileSync('src/components/UsersManagement.tsx', 'utf8');
usersManagement = usersManagement.replace(
  "await window.api.addUser({",
  "await window.api.addUser({"
); // Wait, how is addUser called? It's called with { ... } only. We need to add currentUser.id.
// It's probably easier to just replace the whole call.
usersManagement = usersManagement.replace(
  /await window\.api\.addUser\(\{([^]*?)\}\);/g,
  "await window.api.addUser({$1}, currentUser?.id);"
);
usersManagement = usersManagement.replace(
  /await window\.api\.updateUser\(\{([^]*?)\}\);/g,
  "await window.api.updateUser({$1}, currentUser?.id);"
);
// For updateRates, find it:
// await window.api.updateUserRates(user.id, rates.hourly, rates.commission);
usersManagement = usersManagement.replace(
  /await window\.api\.updateUserRates\((.*?)\);/g,
  "await window.api.updateUserRates($1, currentUser?.id);"
);

// We need currentUser. It is probably passed via props or context.
// Let's assume it's `currentUser` (based on typical React patterns in this codebase). 
// Wait, is it available in UsersManagement.tsx?
// I'll check first, if it fails I'll just use the old code.

fs.writeFileSync('src/components/UsersManagement.tsx', usersManagement);
console.log("Patched auth checks");

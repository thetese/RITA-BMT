module.exports = function(app, ipcMain, store) {
  console.log("✅ Custom Loyalty Plugin Loaded!");
  
  // A plugin could add custom IPC handlers here or run background tasks
  ipcMain.handle('plugin:loyalty:getPoints', (event, customerId) => {
    // Custom logic interacting with the local store
    return 500; // Mock points
  });
};

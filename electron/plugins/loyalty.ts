module.exports = function(app, ipcMain, store) {
  console.log("🌟 Custom Loyalty Plugin Loaded!");
  
  ipcMain.handle('plugin:loyalty:getPoints', (event, customerId) => {
    try {
      const row = store.db.prepare('SELECT points FROM loyalty_points WHERE customerId = ?').get(customerId);
      return row ? row.points : 0;
    } catch (e) {
      console.error('Error fetching loyalty points:', e);
      return 0;
    }
  });

  ipcMain.handle('plugin:loyalty:addPoints', (event, customerId, pointsToAdd) => {
    try {
      store.db.prepare(`
        INSERT INTO loyalty_points (customerId, points, updatedAt) 
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(customerId) DO UPDATE SET 
        points = points + excluded.points,
        updatedAt = excluded.updatedAt
      `).run(customerId, pointsToAdd);
      return true;
    } catch (e) {
      console.error('Error adding loyalty points:', e);
      return false;
    }
  });

  ipcMain.handle('plugin:loyalty:redeemPoints', (event, customerId, pointsToRedeem) => {
    try {
      const row = store.db.prepare('SELECT points FROM loyalty_points WHERE customerId = ?').get(customerId);
      if (row && row.points >= pointsToRedeem) {
        store.db.prepare(`
          UPDATE loyalty_points SET points = points - ?, updatedAt = datetime('now') WHERE customerId = ?
        `).run(pointsToRedeem, customerId);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error redeeming loyalty points:', e);
      return false;
    }
  });
};

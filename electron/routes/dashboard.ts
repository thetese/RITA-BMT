const express = require('express');

module.exports = (store) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    try {
      const sales = store.getSales();
      const today = new Date().toISOString().split('T')[0];
      const todaySales = sales.filter(s => s.date === today);
      const totalToday = todaySales.reduce((acc, s) => acc + s.totalPrice, 0);
      
      res.json({
        totalSalesToday: totalToday,
        transactionsToday: todaySales.length,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};

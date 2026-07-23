const express = require('express');

module.exports = (store, io) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    try {
      res.json(store.getSales());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/', (req, res) => {
    try {
      const sale = req.body;
      const result = store.addSale(sale, req.user?.role || 'api-sync');
      
      if (io) io.emit('data-update', { type: 'sale', data: result });
      
      res.json({ success: true, result });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get('/recent', (req, res) => {
    try {
      res.json(store.getRecentSales(15));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};

const express = require('express');

module.exports = (store) => {
  const router = express.Router();

  router.get('/low-stock', (req, res) => {
    try {
      res.json(store.getLowStockItems ? store.getLowStockItems() : []);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  router.get('/warehouses', (req: any, res: any) => {
    try {
      res.json(store.getWarehouses ? store.getWarehouses() : []);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  router.post('/warehouses', (req: any, res: any) => {
    try {
      res.json(store.addWarehouse ? store.addWarehouse(req.body) : null);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  router.get('/warehouses/:id/stock', (req: any, res: any) => {
    try {
      res.json(store.getWarehouseStock ? store.getWarehouseStock(req.params.id) : []);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};

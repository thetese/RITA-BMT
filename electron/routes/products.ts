const express = require('express');

module.exports = (store) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    try {
      res.json(store.getProducts());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};

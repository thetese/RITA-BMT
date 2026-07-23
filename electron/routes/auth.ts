const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = (store) => {
  const router = express.Router();

  const getJwtSecret = () => {
    let secret = store.getSetting('jwtSecret');
    if (!secret) {
      secret = require('crypto').randomBytes(64).toString('hex');
      store.updateSetting('jwtSecret', secret, 'System');
    }
    return secret;
  };

  router.post('/login', (req, res) => {
    const { apiKey } = req.body;
    const configuredKey = store.getSetting('serverApiKey');
    
    if (apiKey === configuredKey) {
      const token = jwt.sign({ role: 'admin' }, getJwtSecret(), { expiresIn: '7d' });
      return res.json({ token });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  });

  return router;
};

const jwt = require('jsonwebtoken');

module.exports = (store) => {
  return (req, res, next) => {
    if (req.path === '/ping' || req.path === '/auth/login' || req.path.startsWith('/stripe')) {
      return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    const providedKey = req.headers['x-api-key'];
    let configuredKey = store.getSetting('serverApiKey');

    if (providedKey && providedKey === configuredKey) {
      req.user = { role: 'mobile-app' };
      return next();
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    let secret = store.getSetting('jwtSecret');
    if (!secret) {
        secret = require('crypto').randomBytes(64).toString('hex');
        store.updateSetting('jwtSecret', secret, 'System');
    }

    jwt.verify(token, secret, (err, user) => {
      if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
      req.user = user;
      next();
    });
  };
};

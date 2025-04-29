// middleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const secret = process.env.SECRET_KEY;

const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer token
  if (!token) return res.status(401).json({ error: 'Access Denied: No Token' });

  try {
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or Expired Token' });
  }
};

module.exports = auth;

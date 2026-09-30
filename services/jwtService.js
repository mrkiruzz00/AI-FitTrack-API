const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a given payload.
 * @param {object} payload 
 * @param {string} expiresIn 
 * @returns {string} Signed JWT
 */
const generateToken = (payload, expiresIn = '7d') => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT token.
 * @param {string} token 
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken,
};

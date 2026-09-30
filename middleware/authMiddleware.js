const jwtService = require('../services/jwtService');
const User = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * Protect routes by verifying JWT token and attaching authenticated user.
 */
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    // Verify token
    const decoded = jwtService.verifyToken(token);
    
    // Find user by ID in payload (check decoded.id or decoded.userId)
    const userId = decoded.id || decoded.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return sendError(res, 401, 'User associated with token no longer exists.');
    }

    // Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Invalid or expired token.');
    }
    return sendError(res, 500, 'Authentication error: ' + error.message);
  }
};

module.exports = { protect };

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userModel = require('../models/userModel');
const apiResponse = require('../utils/apiResponse');

const auth = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiResponse.unauthorized(res, 'Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = userModel.findById(decoded.id);
      if (!user) {
        return apiResponse.unauthorized(res, 'User account no longer exists');
      }
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return apiResponse.unauthorized(res, 'Authentication token expired');
      }
      return apiResponse.unauthorized(res, 'Invalid authentication token');
    }
  },

  optionalAuth: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        const user = userModel.findById(decoded.id);
        if (user) req.user = user;
      } catch (err) {
        // Optional auth: ignore token errors
      }
    }
    next();
  },

  requireAdmin: (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return apiResponse.forbidden(res, 'Access denied: Administrator privileges required');
    }
    next();
  },
};

module.exports = auth;

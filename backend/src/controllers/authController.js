const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userModel = require('../models/userModel');
const auditLogModel = require('../models/auditLogModel');
const apiResponse = require('../utils/apiResponse');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

const authController = {
  register: async (req, res, next) => {
    try {
      const { name, email, password, role = 'merchant', merchant_vpa, business_name } = req.body;

      const existing = userModel.findByEmail(email);
      if (existing) {
        return apiResponse.badRequest(res, 'An account with this email address already exists.');
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = userModel.create({
        name,
        email,
        passwordHash,
        role: role === 'admin' ? 'admin' : 'merchant',
        merchantVpa: merchant_vpa || env.DEFAULT_MERCHANT_VPA,
        businessName: business_name || `${name}'s Terminal`,
      });

      const token = generateToken(user);

      auditLogModel.log({
        userId: user.id,
        action: 'USER_REGISTER',
        details: `Registered new ${user.role} account [${user.email}]`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      return apiResponse.created(
        res,
        {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            merchant_vpa: user.merchant_vpa,
            business_name: user.business_name,
            created_at: user.created_at,
          },
        },
        'Merchant terminal registered successfully'
      );
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = userModel.findByEmail(email);
      if (!user) {
        return apiResponse.unauthorized(res, 'Invalid credentials provided');
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return apiResponse.unauthorized(res, 'Invalid credentials provided');
      }

      const token = generateToken(user);

      auditLogModel.log({
        userId: user.id,
        action: 'USER_LOGIN',
        details: `User logged in [${user.email}]`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      return apiResponse.success(
        res,
        {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            merchant_vpa: user.merchant_vpa,
            business_name: user.business_name,
            created_at: user.created_at,
          },
        },
        'Authentication successful'
      );
    } catch (err) {
      next(err);
    }
  },

  getProfile: async (req, res, next) => {
    try {
      return apiResponse.success(res, req.user, 'Current user profile retrieved');
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const { name, merchant_vpa, business_name } = req.body;
      const updated = userModel.update(req.user.id, {
        name,
        merchant_vpa,
        business_name,
      });

      return apiResponse.success(res, updated, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;

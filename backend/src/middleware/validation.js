const apiResponse = require('../utils/apiResponse');

const validation = {
  validateRegister: (req, res, next) => {
    const { name, email, password, merchant_vpa } = req.body;
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long.');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('A valid email address is required.');
    }

    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }

    if (merchant_vpa && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(merchant_vpa.trim())) {
      errors.push('Merchant VPA must follow UPI format (e.g. store@okhdfcbank).');
    }

    if (errors.length > 0) {
      return apiResponse.badRequest(res, 'Validation failed for registration', errors);
    }

    next();
  },

  validateLogin: (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !email.trim()) {
      errors.push('Email is required.');
    }

    if (!password) {
      errors.push('Password is required.');
    }

    if (errors.length > 0) {
      return apiResponse.badRequest(res, 'Validation failed for login', errors);
    }

    next();
  },

  validateVerification: (req, res, next) => {
    const { utr_number, amount } = req.body;
    const errors = [];

    if (!utr_number || typeof utr_number !== 'string' || !utr_number.trim()) {
      errors.push('UTR number is required.');
    }

    const numAmount = parseFloat(amount);
    if (amount === undefined || isNaN(numAmount) || numAmount <= 0) {
      errors.push('Amount must be a positive number.');
    }

    if (errors.length > 0) {
      return apiResponse.badRequest(res, 'Validation failed for transaction verification', errors);
    }

    next();
  },

  validateBlacklist: (req, res, next) => {
    const { vpa, reason } = req.body;
    const errors = [];

    if (!vpa || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(vpa.trim())) {
      errors.push('A valid UPI VPA handle is required (e.g. scammer@bank).');
    }

    if (!reason || reason.trim().length < 4) {
      errors.push('A descriptive reason is required (at least 4 characters).');
    }

    if (errors.length > 0) {
      return apiResponse.badRequest(res, 'Validation failed for blacklist entry', errors);
    }

    next();
  },
};

module.exports = validation;

require('dotenv').config();
const path = require('path');

const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_development_secret_do_not_use_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_PATH: process.env.DB_PATH
    ? path.resolve(__dirname, '..', '..', process.env.DB_PATH)
    : path.resolve(__dirname, '..', '..', 'database', 'upishield.sqlite'),
  ENABLE_OCR: process.env.ENABLE_OCR !== 'false',
  MAX_UPLOAD_SIZE_MB: process.env.MAX_UPLOAD_SIZE_MB ? parseInt(process.env.MAX_UPLOAD_SIZE_MB, 10) : 5,
  DEFAULT_MERCHANT_VPA: process.env.DEFAULT_MERCHANT_VPA || 'apex.retail@okhdfcbank',
  AUTO_QUARANTINE_THRESHOLD: process.env.AUTO_QUARANTINE_THRESHOLD ? parseInt(process.env.AUTO_QUARANTINE_THRESHOLD, 10) : 70,
  NPCI_SIMULATION_ACTIVE: process.env.NPCI_SIMULATION_ACTIVE !== 'false',
};

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable is required in production mode!');
}

module.exports = env;

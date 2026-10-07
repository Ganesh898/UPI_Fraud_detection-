/**
 * UPI Shield Backend - Main Server Entry Point
 * REST API for Real-time Fake UPI Payment Detection
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const db = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const alertRoutes = require('./routes/alertRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded screenshots as static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Request Logger (Development) ─────────────────────────────────────────────
if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'UPI Shield Fraud Detection Gateway',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: 'SQLite (Connected)',
    ocr: env.ENABLE_OCR ? 'Enabled (Tesseract.js)' : 'Disabled',
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 & Global Error Handlers ──────────────────────────────────────────────
app.use(errorHandler.notFoundHandler);
app.use(errorHandler.globalErrorHandler);

// ─── Database Initialization & Server Start ────────────────────────────────────
function startServer() {
  try {
    console.log('⚡ Initializing UPI Shield database schema...');
    db.initSchema();
    console.log('✅ Database schema initialized (SQLite WAL mode enabled)');

    app.listen(env.PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║         UPI SHIELD - Fraud Detection Gateway             ║');
      console.log('╠══════════════════════════════════════════════════════════╣');
      console.log(`║  🚀  Server running on: http://localhost:${env.PORT}           ║`);
      console.log(`║  🌐  Frontend origin:   ${env.CLIENT_URL.padEnd(30)} ║`);
      console.log(`║  🗄️   Database:         SQLite (WAL mode)                 ║`);
      console.log(`║  🔒  JWT Auth:          Enabled                           ║`);
      console.log(`║  📸  OCR Engine:        ${env.ENABLE_OCR ? 'Tesseract.js' : 'Disabled'}                    ║`);
      console.log(`║  🌍  Environment:       ${env.NODE_ENV.padEnd(31)} ║`);
      console.log('╚══════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('API Endpoints:');
      console.log(`  POST  /api/auth/register      - Register merchant terminal`);
      console.log(`  POST  /api/auth/login         - Authenticate user`);
      console.log(`  GET   /api/auth/me            - Get current user profile`);
      console.log(`  POST  /api/verify/manual      - Manual UTR verification`);
      console.log(`  POST  /api/verify/screenshot  - OCR screenshot analysis`);
      console.log(`  GET   /api/transactions       - Transaction history`);
      console.log(`  GET   /api/alerts             - Active fraud alerts`);
      console.log(`  GET   /api/dashboard/stats    - Dashboard statistics`);
      console.log(`  GET   /api/admin/rules        - Fraud rule management`);
      console.log(`  GET   /api/health             - Server health check`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Fatal error during startup:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;

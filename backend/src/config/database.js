const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const env = require('./env');

// Ensure database directory exists
const dbDir = path.dirname(env.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance = null;

function getDatabase() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(env.DB_PATH);
    // Enable WAL mode for high concurrency
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

function initSchema() {
  const db = getDatabase();
  const schemaPath = path.resolve(__dirname, '..', '..', '..', 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  } else {
    console.warn(`Schema file not found at ${schemaPath}, checking fallback path`);
  }
}

// Database helper utilities
const db = {
  getInstance: getDatabase,
  initSchema,
  
  query: (sql, params = []) => {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.all(...params);
  },

  get: (sql, params = []) => {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.get(...params);
  },

  run: (sql, params = []) => {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.run(...params);
  },

  exec: (sql) => {
    const database = getDatabase();
    return database.exec(sql);
  },
};

module.exports = db;

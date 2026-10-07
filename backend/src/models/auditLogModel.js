const db = require('../config/database');

const auditLogModel = {
  log: ({ userId = null, action, details = null, ipAddress = null }) => {
    const result = db.run(
      'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [userId, action, details, ipAddress]
    );
    return db.get('SELECT * FROM audit_logs WHERE id = ?', [result.lastInsertRowid]);
  },

  findAll: (limit = 50) => {
    return db.query(`
      SELECT a.*, u.name as user_name, u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.id DESC
      LIMIT ?
    `, [parseInt(limit, 10)]);
  },
};

module.exports = auditLogModel;

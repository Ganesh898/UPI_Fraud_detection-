const db = require('../config/database');

const blacklistModel = {
  findAll: () => {
    return db.query(`
      SELECT b.*, u.name as reporter_name, u.business_name as reporter_business
      FROM blacklist_vpas b
      LEFT JOIN users u ON b.reported_by = u.id
      ORDER BY b.id DESC
    `);
  },

  findByVpa: (vpa) => {
    return db.get('SELECT * FROM blacklist_vpas WHERE LOWER(vpa) = LOWER(?)', [vpa.trim()]);
  },

  findById: (id) => {
    return db.get('SELECT * FROM blacklist_vpas WHERE id = ?', [id]);
  },

  create: ({ vpa, reason, reportedBy = null }) => {
    const cleanVpa = vpa.trim().toLowerCase();
    const existing = blacklistModel.findByVpa(cleanVpa);
    if (existing) return existing;

    const result = db.run(
      'INSERT INTO blacklist_vpas (vpa, reason, reported_by) VALUES (?, ?, ?)',
      [cleanVpa, reason, reportedBy]
    );
    return blacklistModel.findById(result.lastInsertRowid);
  },

  deleteById: (id) => {
    const item = blacklistModel.findById(id);
    if (item) {
      db.run('DELETE FROM blacklist_vpas WHERE id = ?', [id]);
    }
    return item;
  },
};

module.exports = blacklistModel;

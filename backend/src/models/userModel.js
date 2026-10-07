const db = require('../config/database');

const userModel = {
  findByEmail: (email) => {
    return db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
  },

  findById: (id) => {
    return db.get(
      'SELECT id, name, email, role, merchant_vpa, business_name, created_at FROM users WHERE id = ?',
      [id]
    );
  },

  create: ({ name, email, passwordHash, role = 'merchant', merchantVpa = null, businessName = null }) => {
    const result = db.run(
      `INSERT INTO users (name, email, password_hash, role, merchant_vpa, business_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email.toLowerCase().trim(), passwordHash, role, merchantVpa, businessName]
    );
    return userModel.findById(result.lastInsertRowid);
  },

  update: (id, fields = {}) => {
    const updates = [];
    const values = [];

    if (fields.name !== undefined) {
      updates.push('name = ?');
      values.push(fields.name);
    }
    if (fields.merchant_vpa !== undefined) {
      updates.push('merchant_vpa = ?');
      values.push(fields.merchant_vpa);
    }
    if (fields.business_name !== undefined) {
      updates.push('business_name = ?');
      values.push(fields.business_name);
    }

    if (updates.length === 0) return userModel.findById(id);

    values.push(id);
    db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    return userModel.findById(id);
  },
};

module.exports = userModel;

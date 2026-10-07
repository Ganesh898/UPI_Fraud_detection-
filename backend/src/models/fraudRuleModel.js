const db = require('../config/database');

const fraudRuleModel = {
  findAll: () => {
    return db.query('SELECT * FROM fraud_rules ORDER BY id ASC');
  },

  findByCode: (code) => {
    return db.get('SELECT * FROM fraud_rules WHERE rule_code = ?', [code]);
  },

  findById: (id) => {
    return db.get('SELECT * FROM fraud_rules WHERE id = ?', [id]);
  },

  updateWeight: (id, weight) => {
    db.run('UPDATE fraud_rules SET weight = ? WHERE id = ?', [parseInt(weight, 10), id]);
    return fraudRuleModel.findById(id);
  },

  toggleRule: (id, isEnabled) => {
    db.run('UPDATE fraud_rules SET is_enabled = ? WHERE id = ?', [isEnabled ? 1 : 0, id]);
    return fraudRuleModel.findById(id);
  },
};

module.exports = fraudRuleModel;

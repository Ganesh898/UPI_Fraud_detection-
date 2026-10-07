const db = require('../config/database');

const transactionModel = {
  create: ({
    userId = null,
    utrNumber,
    amount,
    senderVpa = null,
    receiverVpa = null,
    verificationMode = 'manual',
    riskScore,
    riskLevel,
    verdict,
    riskFactors = [],
    status = 'verified',
    screenshotUrl = null,
    notes = null,
  }) => {
    const factorsJson = typeof riskFactors === 'string' ? riskFactors : JSON.stringify(riskFactors);

    const result = db.run(
      `INSERT INTO transactions (
        user_id, utr_number, amount, sender_vpa, receiver_vpa,
        verification_mode, risk_score, risk_level, verdict,
        risk_factors, status, screenshot_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        utrNumber,
        parseFloat(amount),
        senderVpa,
        receiverVpa,
        verificationMode,
        parseInt(riskScore, 10),
        riskLevel,
        verdict,
        factorsJson,
        status,
        screenshotUrl,
        notes,
      ]
    );

    return transactionModel.findById(result.lastInsertRowid);
  },

  findById: (id) => {
    const row = db.get('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!row) return null;
    return {
      ...row,
      risk_factors: row.risk_factors ? JSON.parse(row.risk_factors) : [],
    };
  },

  findByUtr: (utr) => {
    return db.query('SELECT * FROM transactions WHERE utr_number = ? ORDER BY id DESC', [utr.trim()]);
  },

  findAll: ({
    userId = null,
    riskLevel = null,
    status = null,
    search = null,
    page = 1,
    limit = 20,
  } = {}) => {
    const conditions = [];
    const params = [];

    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }
    if (riskLevel && riskLevel !== 'ALL') {
      conditions.push('risk_level = ?');
      params.push(riskLevel);
    }
    if (status && status !== 'ALL') {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      const term = `%${search.trim()}%`;
      conditions.push('(utr_number LIKE ? OR sender_vpa LIKE ? OR receiver_vpa LIKE ? OR notes LIKE ?)');
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (Math.max(1, page) - 1) * limit;

    const sql = `SELECT * FROM transactions ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`;
    const rows = db.query(sql, [...params, limit, offset]);

    return rows.map((r) => ({
      ...r,
      risk_factors: r.risk_factors ? JSON.parse(r.risk_factors) : [],
    }));
  },

  countAll: ({
    userId = null,
    riskLevel = null,
    status = null,
    search = null,
  } = {}) => {
    const conditions = [];
    const params = [];

    if (userId) {
      conditions.push('user_id = ?');
      params.push(userId);
    }
    if (riskLevel && riskLevel !== 'ALL') {
      conditions.push('risk_level = ?');
      params.push(riskLevel);
    }
    if (status && status !== 'ALL') {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      const term = `%${search.trim()}%`;
      conditions.push('(utr_number LIKE ? OR sender_vpa LIKE ? OR receiver_vpa LIKE ? OR notes LIKE ?)');
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const row = db.get(`SELECT COUNT(*) as count FROM transactions ${whereClause}`, params);
    return row ? row.count : 0;
  },

  updateStatus: (id, status, notes = null) => {
    if (notes) {
      db.run('UPDATE transactions SET status = ?, notes = notes || ? WHERE id = ?', [
        status,
        ` | ${notes}`,
        id,
      ]);
    } else {
      db.run('UPDATE transactions SET status = ? WHERE id = ?', [status, id]);
    }
    return transactionModel.findById(id);
  },

  getStats: (userId = null) => {
    const userClause = userId ? 'WHERE user_id = ?' : '';
    const params = userId ? [userId] : [];

    const totalRow = db.get(
      `SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(amount), 0) as total_volume,
        COUNT(CASE WHEN risk_level = 'HIGH' THEN 1 END) as high_risk_count,
        COUNT(CASE WHEN risk_level = 'MEDIUM' THEN 1 END) as medium_risk_count,
        COUNT(CASE WHEN risk_level = 'LOW' THEN 1 END) as low_risk_count,
        COALESCE(SUM(CASE WHEN risk_level = 'HIGH' OR status = 'flagged' OR status = 'rejected' THEN amount ELSE 0 END), 0) as prevented_loss
       FROM transactions ${userClause}`,
      params
    );

    return totalRow || {
      total_count: 0,
      total_volume: 0,
      high_risk_count: 0,
      medium_risk_count: 0,
      low_risk_count: 0,
      prevented_loss: 0,
    };
  },

  getSenderMetrics: (senderVpa, receiverVpa = null) => {
    if (!senderVpa) {
      return { avgAmount: 850, count1h: 1, count5m: 1, isNewRecipient: false, disputeCount: 0 };
    }
    const cleanSender = senderVpa.trim().toLowerCase();
    const cleanReceiver = receiverVpa ? receiverVpa.trim().toLowerCase() : null;

    try {
      const pastTxns = db.query(
        'SELECT amount, receiver_vpa, timestamp, status, risk_level FROM transactions WHERE LOWER(sender_vpa) = ? ORDER BY id DESC LIMIT 50',
        [cleanSender]
      );
      if (!pastTxns || pastTxns.length === 0) {
        return { avgAmount: 850, count1h: 1, count5m: 1, isNewRecipient: true, disputeCount: 0 };
      }

      const sum = pastTxns.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
      const avg = sum / pastTxns.length;
      const isNew = cleanReceiver
        ? !pastTxns.some((t) => (t.receiver_vpa || '').toLowerCase() === cleanReceiver)
        : false;
      const disputes = pastTxns.filter((t) => t.status === 'rejected' || t.status === 'disputed').length;

      const now = Date.now();
      const count1h = pastTxns.filter((t) => {
        const diff = now - new Date(t.timestamp).getTime();
        return diff >= 0 && diff <= 3600000;
      }).length + 1;

      const count5m = pastTxns.filter((t) => {
        const diff = now - new Date(t.timestamp).getTime();
        return diff >= 0 && diff <= 300000;
      }).length + 1;

      return {
        avgAmount: avg,
        count1h,
        count5m,
        isNewRecipient: isNew,
        disputeCount: disputes,
      };
    } catch (_) {
      return { avgAmount: 850, count1h: 1, count5m: 1, isNewRecipient: false, disputeCount: 0 };
    }
  },
};

module.exports = transactionModel;

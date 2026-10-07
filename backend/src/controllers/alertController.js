const transactionModel = require('../models/transactionModel');
const blacklistModel = require('../models/blacklistModel');
const auditLogModel = require('../models/auditLogModel');
const apiResponse = require('../utils/apiResponse');

const alertController = {
  getAlerts: async (req, res, next) => {
    try {
      const flagged = transactionModel.findAll({
        status: 'flagged',
        limit: 50,
      });

      const highRisk = transactionModel.findAll({
        riskLevel: 'HIGH',
        limit: 50,
      });

      // Combine unique IDs
      const map = new Map();
      [...flagged, ...highRisk].forEach((t) => map.set(t.id, t));
      const alerts = Array.from(map.values()).sort((a, b) => b.id - a.id);

      return apiResponse.success(
        res,
        {
          activeThreatCount: alerts.length,
          alerts,
        },
        'Active fraud alerts queue retrieved'
      );
    } catch (err) {
      next(err);
    }
  },

  confirmFraudAndBlacklist: async (req, res, next) => {
    try {
      const { id } = req.params;
      const transaction = transactionModel.findById(id);

      if (!transaction) {
        return apiResponse.notFound(res, `Transaction #${id} does not exist`);
      }

      // Mark transaction as rejected
      transactionModel.updateStatus(id, 'rejected', 'Confirmed fraud by operator');

      // If counterparty sender VPA exists, blacklist it
      let blacklisted = null;
      if (transaction.sender_vpa) {
        blacklisted = blacklistModel.create({
          vpa: transaction.sender_vpa,
          reason: `Flagged in transaction #${id} (${transaction.verdict})`,
          reportedBy: req.user ? req.user.id : null,
        });
      }

      auditLogModel.log({
        userId: req.user ? req.user.id : null,
        action: 'CONFIRM_FRAUD_BLACKLIST',
        details: `Confirmed fraud on #${id} (UTR: ${transaction.utr_number}) and blacklisted [${transaction.sender_vpa}]`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      return apiResponse.success(
        res,
        {
          transactionId: id,
          status: 'rejected',
          blacklistedVpa: blacklisted,
        },
        'Transaction confirmed as fraudulent and counterparty blacklisted'
      );
    } catch (err) {
      next(err);
    }
  },

  resolveAlert: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { resolution = 'verified', reason = 'Manual cashier release' } = req.body;

      const updated = transactionModel.updateStatus(id, resolution, reason);

      auditLogModel.log({
        userId: req.user ? req.user.id : null,
        action: 'RESOLVE_ALERT',
        details: `Resolved alert on transaction #${id} to [${resolution}]: ${reason}`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      return apiResponse.success(res, updated, `Alert on #${id} resolved successfully`);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = alertController;

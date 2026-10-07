const fraudRuleModel = require('../models/fraudRuleModel');
const blacklistModel = require('../models/blacklistModel');
const auditLogModel = require('../models/auditLogModel');
const apiResponse = require('../utils/apiResponse');

const adminController = {
  getFraudRules: async (req, res, next) => {
    try {
      const rules = fraudRuleModel.findAll();
      return apiResponse.success(res, rules, 'Fraud rules retrieved');
    } catch (err) {
      next(err);
    }
  },

  updateRuleWeight: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { weight } = req.body;

      if (weight === undefined || isNaN(weight) || weight < 0 || weight > 100) {
        return apiResponse.badRequest(res, 'Weight must be an integer between 0 and 100');
      }

      const updated = fraudRuleModel.updateWeight(id, weight);
      if (!updated) {
        return apiResponse.notFound(res, `Rule with ID #${id} not found`);
      }

      auditLogModel.log({
        userId: req.user ? req.user.id : null,
        action: 'RULE_WEIGHT_CHANGE',
        details: `Updated rule #${id} (${updated.rule_name}) weight to ${weight}`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      return apiResponse.success(res, updated, 'Rule penalty weight updated');
    } catch (err) {
      next(err);
    }
  },

  toggleRule: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { is_enabled } = req.body;

      const updated = fraudRuleModel.toggleRule(id, !!is_enabled);
      if (!updated) {
        return apiResponse.notFound(res, `Rule with ID #${id} not found`);
      }

      auditLogModel.log({
        userId: req.user ? req.user.id : null,
        action: 'RULE_TOGGLE',
        details: `Set rule #${id} (${updated.rule_name}) active status to ${is_enabled}`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      return apiResponse.success(res, updated, `Rule ${is_enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      next(err);
    }
  },

  getBlacklist: async (req, res, next) => {
    try {
      const list = blacklistModel.findAll();
      return apiResponse.success(res, list, 'National blacklist registry retrieved');
    } catch (err) {
      next(err);
    }
  },

  addBlacklist: async (req, res, next) => {
    try {
      const { vpa, reason } = req.body;
      const entry = blacklistModel.create({
        vpa,
        reason,
        reportedBy: req.user ? req.user.id : null,
      });

      auditLogModel.log({
        userId: req.user ? req.user.id : null,
        action: 'BLACKLIST_ADD',
        details: `Added VPA [${vpa}] to blacklist: ${reason}`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      return apiResponse.created(res, entry, 'VPA added to national fraud registry');
    } catch (err) {
      next(err);
    }
  },

  removeBlacklist: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = blacklistModel.deleteById(id);

      if (!deleted) {
        return apiResponse.notFound(res, `Blacklist entry #${id} not found`);
      }

      auditLogModel.log({
        userId: req.user ? req.user.id : null,
        action: 'BLACKLIST_REMOVE',
        details: `Removed VPA [${deleted.vpa}] from blacklist`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      return apiResponse.success(res, deleted, 'VPA removed from fraud registry');
    } catch (err) {
      next(err);
    }
  },

  getAuditLogs: async (req, res, next) => {
    try {
      const { limit = 50 } = req.query;
      const logs = auditLogModel.findAll(limit);
      return apiResponse.success(res, logs, 'System audit logs retrieved');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = adminController;

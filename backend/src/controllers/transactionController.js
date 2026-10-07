const transactionModel = require('../models/transactionModel');
const auditLogModel = require('../models/auditLogModel');
const apiResponse = require('../utils/apiResponse');

const transactionController = {
  getTransactions: async (req, res, next) => {
    try {
      const {
        risk_level,
        status,
        search,
        page = 1,
        limit = 20,
      } = req.query;

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;

      // If user is regular merchant, optionally restrict or list their store transactions
      const userId = req.user && req.user.role !== 'admin' ? req.user.id : null;

      const transactions = transactionModel.findAll({
        userId,
        riskLevel: risk_level,
        status,
        search,
        page: pageNum,
        limit: limitNum,
      });

      const total = transactionModel.countAll({
        userId,
        riskLevel: risk_level,
        status,
        search,
      });

      return apiResponse.paginated(
        res,
        transactions,
        pageNum,
        limitNum,
        total,
        'Transactions retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  },

  getTransactionById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const transaction = transactionModel.findById(id);

      if (!transaction) {
        return apiResponse.notFound(res, `Transaction record with ID #${id} not found`);
      }

      return apiResponse.success(res, transaction, 'Transaction details retrieved');
    } catch (err) {
      next(err);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const validStatuses = ['verified', 'flagged', 'rejected', 'disputed'];
      if (!validStatuses.includes(status)) {
        return apiResponse.badRequest(
          res,
          `Invalid status value. Must be one of: ${validStatuses.join(', ')}`
        );
      }

      const existing = transactionModel.findById(id);
      if (!existing) {
        return apiResponse.notFound(res, `Transaction #${id} does not exist`);
      }

      const updated = transactionModel.updateStatus(id, status, notes);

      auditLogModel.log({
        userId: req.user ? req.user.id : null,
        action: 'TXN_STATUS_UPDATE',
        details: `Updated Transaction #${id} status from ${existing.status} to ${status}`,
        ipAddress: req.ip || req.socket.remoteAddress,
      });

      return apiResponse.success(res, updated, `Transaction #${id} status updated to ${status}`);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = transactionController;

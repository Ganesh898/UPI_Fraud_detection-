const transactionModel = require('../models/transactionModel');
const fraudRuleModel = require('../models/fraudRuleModel');
const blacklistModel = require('../models/blacklistModel');
const apiResponse = require('../utils/apiResponse');

const dashboardController = {
  getStats: async (req, res, next) => {
    try {
      const userId = req.user && req.user.role !== 'admin' ? req.user.id : null;
      const stats = transactionModel.getStats(userId);
      const rules = fraudRuleModel.findAll();
      const blacklist = blacklistModel.findAll();
      const recent = transactionModel.findAll({ userId, limit: 5 });

      return apiResponse.success(
        res,
        {
          overview: {
            totalCount: stats.total_count,
            totalVolume: stats.total_volume,
            highRiskCount: stats.high_risk_count,
            mediumRiskCount: stats.medium_risk_count,
            lowRiskCount: stats.low_risk_count,
            preventedLoss: stats.prevented_loss,
            activeRulesCount: rules.filter((r) => r.is_enabled === 1).length,
            blacklistCount: blacklist.length,
            julianIntegrityPercentage: '98.8%',
          },
          recentTransactions: recent,
        },
        'Dashboard telemetry statistics retrieved'
      );
    } catch (err) {
      next(err);
    }
  },

  getTrajectory: async (req, res, next) => {
    try {
      // 24-hour simulation curve data points
      const trajectoryData = [
        { time: '10:00 AM', volume: 4200, threats: 0 },
        { time: '12:00 PM', volume: 8500, threats: 1 },
        { time: '02:00 PM', volume: 14200, threats: 2 },
        { time: '04:00 PM', volume: 18900, threats: 1 },
      ];

      return apiResponse.success(res, trajectoryData, 'Trajectory analytics retrieved');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dashboardController;

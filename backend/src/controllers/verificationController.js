const fraudDetectionService = require('../services/fraudDetectionService');
const ocrService = require('../services/ocrService');
const transactionModel = require('../models/transactionModel');
const auditLogModel = require('../models/auditLogModel');
const apiResponse = require('../utils/apiResponse');
const env = require('../config/env');

const verificationController = {
  verifyPayment: async (req, res, next) => {
    try {
      const {
        utr_number,
        amount,
        sender_vpa,
        receiver_vpa,
        mode = 'manual',
        notes,
        device_info = {},
        custom_features = {},
        scoring_mode = 'RULE_BASED',
      } = req.body;

      const merchantVpa = req.user?.merchant_vpa || receiver_vpa || env.DEFAULT_MERCHANT_VPA;

      const evaluation = await fraudDetectionService.evaluateRisk({
        utr: utr_number,
        amount,
        senderVpa: sender_vpa,
        receiverVpa: receiver_vpa || merchantVpa,
        merchantRegisteredVpa: merchantVpa,
        deviceInfo: device_info,
        customFeatures: custom_features,
        scoringMode: scoring_mode,
      });

      // Save transaction in database
      const transaction = transactionModel.create({
        userId: req.user ? req.user.id : null,
        utrNumber: (utr_number || '').trim(),
        amount: parseFloat(amount) || 0,
        senderVpa: sender_vpa || null,
        receiverVpa: receiver_vpa || merchantVpa,
        verificationMode: mode,
        riskScore: evaluation.score,
        riskLevel: evaluation.level, // 'LOW', 'MEDIUM', 'HIGH'
        verdict: evaluation.verdict,
        riskFactors: evaluation.factors,
        status: evaluation.status,
        notes: notes || `Verified via ${mode}`,
      });

      // Write security audit log if flagged or high risk
      if (evaluation.level === 'HIGH') {
        auditLogModel.log({
          userId: req.user ? req.user.id : null,
          action: 'FRAUD_FLAGGED',
          details: `Flagged fraudulent transaction UTR [${utr_number}] (Score: ${evaluation.score})`,
          ipAddress: req.ip || req.socket.remoteAddress,
        });
      }

      return apiResponse.success(
        res,
        {
          transaction,
          evaluation,
        },
        evaluation.verdict
      );
    } catch (err) {
      next(err);
    }
  },

  /**
   * Fast dry-run simulation endpoint for testing the Fraud Detection Engine
   * Does not persist transaction in database. Ideal for interactive simulators.
   */
  evaluateSimulation: async (req, res, next) => {
    try {
      const {
        utr_number = '628109482914',
        amount = 1450,
        sender_vpa = 'customer@okaxis',
        receiver_vpa = env.DEFAULT_MERCHANT_VPA,
        device_info = {},
        custom_features = {},
        scoring_mode = 'RULE_BASED',
      } = req.body;

      const evaluation = await fraudDetectionService.evaluateRisk({
        utr: utr_number,
        amount,
        senderVpa: sender_vpa,
        receiverVpa: receiver_vpa,
        merchantRegisteredVpa: req.user?.merchant_vpa || env.DEFAULT_MERCHANT_VPA,
        deviceInfo: device_info,
        customFeatures: custom_features,
        scoringMode: scoring_mode,
      });

      return apiResponse.success(
        res,
        {
          evaluation,
          simulatedInput: {
            utr_number,
            amount,
            sender_vpa,
            receiver_vpa,
            device_info,
            custom_features,
            scoring_mode,
          },
        },
        'Simulation evaluated successfully'
      );
    } catch (err) {
      next(err);
    }
  },

  verifyScreenshot: async (req, res, next) => {
    try {
      if (!req.file) {
        return apiResponse.badRequest(res, 'Screenshot image receipt file is required');
      }

      const filePath = req.file.path;
      const extracted = await ocrService.extractReceiptData(filePath);

      const utr = req.body.utr_number || extracted.extractedUtr || '';
      const amount = req.body.amount || extracted.extractedAmount || 0;
      const senderVpa = req.body.sender_vpa || extracted.extractedSenderVpa;
      const receiverVpa = req.body.receiver_vpa || extracted.extractedReceiverVpa || req.user?.merchant_vpa || env.DEFAULT_MERCHANT_VPA;

      const evaluation = await fraudDetectionService.evaluateRisk({
        utr,
        amount,
        senderVpa,
        receiverVpa,
        merchantRegisteredVpa: req.user?.merchant_vpa || env.DEFAULT_MERCHANT_VPA,
      });

      const transaction = transactionModel.create({
        userId: req.user ? req.user.id : null,
        utrNumber: utr || 'UNREADABLE_UTR',
        amount: parseFloat(amount) || 0,
        senderVpa,
        receiverVpa,
        verificationMode: 'ocr_screenshot',
        riskScore: evaluation.score,
        riskLevel: evaluation.level,
        verdict: evaluation.verdict,
        riskFactors: evaluation.factors,
        status: evaluation.status,
        screenshotUrl: `/uploads/${req.file.filename}`,
        notes: `OCR Scanned Receipt: ${req.file.originalname}`,
      });

      return apiResponse.success(
        res,
        {
          transaction,
          evaluation,
          ocrMetadata: {
            extractedUtr: extracted.extractedUtr,
            extractedAmount: extracted.extractedAmount,
            extractedReceiverVpa: extracted.extractedReceiverVpa,
            confidence: extracted.confidence,
          },
        },
        'Screenshot OCR analysis completed'
      );
    } catch (err) {
      next(err);
    }
  },
};

module.exports = verificationController;

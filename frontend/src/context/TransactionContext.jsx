import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { verifyApi, transactionApi, alertApi, dashboardApi, adminApi } from '../services/api';
import { evaluateTransactionRisk, generateAuthenticUtr } from '../services/fraudEngine';
import { INITIAL_TRANSACTIONS, INITIAL_FRAUD_RULES, INITIAL_BLACKLIST_VPAS } from '../constants/initialData';
import { useSound } from './SoundContext';
import { useAuth } from './AuthContext';

const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const { user } = useAuth();
  const { triggerSafeAlert, triggerFraudAlert, triggerWarningAlert } = useSound();

  // ─── State ────────────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [blacklist, setBlacklist] = useState(INITIAL_BLACKLIST_VPAS);
  const [fraudRules, setFraudRules] = useState(INITIAL_FRAUD_RULES);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'SYSTEM_BOOT', details: 'UPI Shield Heuristic Engine v2.0 initialized', ip_address: '127.0.0.1', created_at: new Date().toISOString() },
    { id: 2, action: 'RULE_SYNC', details: 'Loaded 5 active fraud rules and Julian syntax matrix', ip_address: '10.0.4.12', created_at: new Date().toISOString() },
  ]);
  const [toasts, setToasts] = useState([]);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoadingTxns, setIsLoadingTxns] = useState(false);
  const [txnPagination, setTxnPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // ─── Toast Helpers ────────────────────────────────────────────────────────────
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addAuditLog = useCallback((action, details) => {
    const newLog = {
      id: Date.now(),
      action,
      details,
      ip_address: '192.168.1.104',
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // ─── Backend Sync: Load transactions ─────────────────────────────────────────
  const loadTransactions = useCallback(async (filters = {}) => {
    if (!isBackendConnected) return;
    setIsLoadingTxns(true);
    try {
      const res = await transactionApi.getAll(filters);
      if (res?.data) {
        setTransactions(res.data);
        if (res.pagination) setTxnPagination(res.pagination);
      }
    } catch (err) {
      // Silently fall back to local state
    } finally {
      setIsLoadingTxns(false);
    }
  }, [isBackendConnected]);

  const loadDashboardStats = useCallback(async () => {
    if (!isBackendConnected) return;
    try {
      const res = await dashboardApi.getStats();
      if (res?.data) setDashboardStats(res.data);
    } catch (_) {}
  }, [isBackendConnected]);

  const loadFraudRules = useCallback(async () => {
    if (!isBackendConnected) return;
    try {
      const res = await adminApi.getRules();
      if (res?.data?.length > 0) setFraudRules(res.data);
    } catch (_) {}
  }, [isBackendConnected]);

  const loadBlacklist = useCallback(async () => {
    if (!isBackendConnected) return;
    try {
      const res = await adminApi.getBlacklist();
      if (res?.data?.length > 0) setBlacklist(res.data);
    } catch (_) {}
  }, [isBackendConnected]);

  const loadAuditLogs = useCallback(async () => {
    if (!isBackendConnected) return;
    try {
      const res = await adminApi.getAuditLogs(50);
      if (res?.data?.length > 0) setAuditLogs(res.data);
    } catch (_) {}
  }, [isBackendConnected]);

  // ─── Backend Health Check on Mount ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    fetch('http://localhost:5000/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.status === 'online') {
          setIsBackendConnected(true);
        }
      })
      .catch(() => {
        if (!cancelled) setIsBackendConnected(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Load data when backend comes online
  useEffect(() => {
    if (isBackendConnected && user) {
      loadTransactions();
      loadDashboardStats();
      loadFraudRules();
      loadBlacklist();
      loadAuditLogs();
    }
  }, [isBackendConnected, user, loadTransactions, loadDashboardStats, loadFraudRules, loadBlacklist, loadAuditLogs]);

  // ─── Core: Verify Payment ─────────────────────────────────────────────────────
  const verifyPayment = async ({
    utr,
    amount,
    senderVpa = '',
    receiverVpa = '',
    mode = 'manual',
    notes = '',
    screenshotUrl = null,
    screenshotFile = null,
    customFeatures = {},
  }) => {
    const merchantVpa = user?.merchant_vpa || 'apex.retail@okhdfcbank';

    try {
      if (isBackendConnected) {
        // ─── Backend verification ─────────────────────────────────────────────
        const res = screenshotFile
          ? await verifyApi.screenshot(screenshotFile)
          : await verifyApi.manual({
            utr_number: utr,
            amount: parseFloat(amount),
            sender_vpa: senderVpa || undefined,
            receiver_vpa: receiverVpa || merchantVpa,
            mode,
            notes: notes || `Verified via ${mode}`,
            custom_features: customFeatures,
          });

        const { transaction, evaluation } = res.data;

        setTransactions((prev) => [transaction, ...prev]);

        const currentScore = evaluation.riskScore ?? evaluation.score ?? 0;
        const isHigh = currentScore >= 71 || evaluation.riskLevel === 'HIGH' || evaluation.riskLevel === 'High Risk';
        const isMed = !isHigh && (currentScore >= 31 || evaluation.riskLevel === 'MEDIUM' || evaluation.riskLevel === 'Medium Risk');

        if (isHigh) {
          triggerFraudAlert();
          addToast({ type: 'danger', title: '🚨 HIGH RISK FRAUD DETECTED', message: `UTR ${utr}: Score ${currentScore}/100. Quarantined.` });
        } else if (isMed) {
          triggerWarningAlert();
          addToast({ type: 'warning', title: '⚠️ SUSPICIOUS TRANSACTION', message: `UTR ${utr}: Score ${currentScore}/100. Verify bank SMS.` });
        } else {
          triggerSafeAlert(amount);
          addToast({ type: 'success', title: '✅ LOW RISK — CONFIRM BANK CREDIT', message: `₹${parseFloat(amount || 0).toLocaleString('en-IN')} is low risk. This score does not confirm bank settlement.` });
        }

        // Refresh dashboard stats
        loadDashboardStats();
        return {
          transaction,
          evaluation: res.data.ocrMetadata
            ? { ...evaluation, ocrMetadata: res.data.ocrMetadata }
            : evaluation,
        };
      }
    } catch (err) {
      if (screenshotFile) {
        addToast({
          type: 'danger',
          title: 'Receipt OCR failed',
          message: err.message || 'Could not analyze this image. Please verify its fields manually.',
        });
        throw err;
      }
      addToast({ type: 'warning', title: 'Backend Unavailable', message: 'Running offline analysis.' });
    }

    if (screenshotFile) {
      const error = new Error('Receipt OCR requires a connection to the backend. Please reconnect and try again.');
      addToast({ type: 'danger', title: 'Receipt OCR unavailable', message: error.message });
      throw error;
    }

    // ─── Offline fallback using local fraud engine ──────────────────────────
    const evaluation = evaluateTransactionRisk({
      utr,
      amount,
      senderVpa,
      receiverVpa: receiverVpa || merchantVpa,
      existingTransactions: transactions,
      blacklist,
      merchantRegisteredVpa: merchantVpa,
      customFeatures,
    });

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: user?.id || 1,
      utr_number: utr,
      amount: parseFloat(amount) || 0,
      sender_vpa: senderVpa || 'counterparty@upi',
      receiver_vpa: receiverVpa || merchantVpa,
      created_at: new Date().toISOString(),
      verification_mode: mode,
      risk_score: evaluation.riskScore ?? evaluation.score,
      risk_level: evaluation.riskLevel,
      verdict: evaluation.verdict,
      status: evaluation.status,
      risk_factors: evaluation.factors,
      screenshot_url: screenshotUrl,
      notes: notes || (mode === 'ocr_screenshot' ? 'Verified via OCR Screenshot' : 'Manual POS Entry'),
    };

    setTransactions((prev) => [newTxn, ...prev]);

    const fallbackScore = evaluation.riskScore ?? evaluation.score ?? 0;
    const isFallbackHigh = fallbackScore >= 71 || evaluation.riskLevel === 'HIGH' || evaluation.riskLevel === 'High Risk';
    const isFallbackMed = !isFallbackHigh && (fallbackScore >= 31 || evaluation.riskLevel === 'MEDIUM' || evaluation.riskLevel === 'Medium Risk');

    if (isFallbackHigh) {
      triggerFraudAlert();
      addToast({ type: 'danger', title: '🚨 HIGH RISK FRAUD DETECTED', message: `UTR ${utr}: Score ${fallbackScore}/100. Quarantined.` });
      addAuditLog('FRAUD_INTERCEPTED', `Flagged fake payment UTR ${utr} (Risk: ${fallbackScore})`);
    } else if (isFallbackMed) {
      triggerWarningAlert();
      addToast({ type: 'warning', title: '⚠️ SUSPICIOUS TRANSACTION', message: `UTR ${utr}: Score ${fallbackScore}/100. Verify bank SMS.` });
      addAuditLog('SUSPICIOUS_TXN', `Investigating UTR ${utr} (Risk: ${fallbackScore})`);
    } else {
      triggerSafeAlert(amount);
      addToast({ type: 'success', title: '✅ LOW RISK — CONFIRM BANK CREDIT', message: `₹${parseFloat(amount || 0).toLocaleString('en-IN')} is low risk. This score does not confirm bank settlement.` });
      addAuditLog('TXN_LOW_RISK', `Low-risk UTR ${utr} (₹${amount}); bank credit still requires confirmation`);
    }

    return { transaction: newTxn, evaluation };
  };

  // ─── Update Transaction Status ────────────────────────────────────────────────
  const updateTransactionStatus = async (txnId, newStatus, reason = '') => {
    try {
      if (isBackendConnected) {
        await transactionApi.updateStatus(txnId, newStatus, reason);
      }
    } catch (_) {}

    setTransactions((prev) =>
      prev.map((tx) =>
        (tx.id === txnId || String(tx.id) === String(txnId))
          ? { ...tx, status: newStatus, notes: reason ? `${tx.notes || ''} | ${reason}` : tx.notes }
          : tx
      )
    );
    addToast({ type: 'info', title: 'Status Updated', message: `Transaction marked as ${newStatus.toUpperCase()}` });
    addAuditLog('STATUS_CHANGE', `Transaction ${txnId} moved to ${newStatus}`);
  };

  // ─── Blacklist Management ─────────────────────────────────────────────────────
  const addBlacklistVpa = async (vpa, reason) => {
    const clean = vpa.trim().toLowerCase();
    if (!clean) return;

    try {
      if (isBackendConnected) {
        const res = await adminApi.addBlacklist(clean, reason);
        if (res?.data) {
          setBlacklist((prev) => [res.data, ...prev]);
          addToast({ type: 'danger', title: 'Blacklist Updated', message: `${vpa} added to fraud registry.` });
          addAuditLog('BLACKLIST_ADD', `Added VPA ${vpa} to national blacklist`);
          return;
        }
      }
    } catch (_) {}

    // Offline fallback
    if (blacklist.some((b) => b.vpa.toLowerCase() === clean)) {
      addToast({ type: 'warning', title: 'Already Blacklisted', message: `${vpa} is already in the blacklist.` });
      return;
    }
    const newEntry = {
      id: Date.now(), vpa: clean, reason: reason || 'Manual merchant report',
      reported_by: user?.id || null, created_at: new Date().toISOString(),
    };
    setBlacklist((prev) => [newEntry, ...prev]);
    addToast({ type: 'danger', title: 'Blacklist Updated', message: `${vpa} added to fraud registry.` });
    addAuditLog('BLACKLIST_ADD', `Added VPA ${vpa} to national blacklist`);
  };

  const removeBlacklistVpa = async (id) => {
    try {
      if (isBackendConnected) {
        await adminApi.removeBlacklist(id);
      }
    } catch (_) {}
    setBlacklist((prev) => prev.filter((b) => b.id !== id));
    addToast({ type: 'info', title: 'Blacklist Entry Removed', message: 'VPA removed from fraud registry.' });
    addAuditLog('BLACKLIST_REMOVE', `Removed blacklist record ID ${id}`);
  };

  // ─── Fraud Rules Management ───────────────────────────────────────────────────
  const updateRuleWeight = async (ruleId, newWeight) => {
    try {
      if (isBackendConnected) {
        await adminApi.updateRuleWeight(ruleId, parseInt(newWeight, 10));
      }
    } catch (_) {}
    setFraudRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, weight: parseInt(newWeight, 10) } : r)));
    addAuditLog('RULE_UPDATED', `Adjusted weight for rule ID ${ruleId} to ${newWeight}`);
  };

  const toggleRule = async (ruleId) => {
    const rule = fraudRules.find((r) => r.id === ruleId);
    if (!rule) return;
    const newState = !rule.is_enabled;
    try {
      if (isBackendConnected) {
        await adminApi.toggleRule(ruleId, newState);
      }
    } catch (_) {}
    setFraudRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, is_enabled: newState } : r)));
  };

  // ─── Confirm Fraud & Blacklist from Alerts ────────────────────────────────────
  const confirmFraud = async (txnId) => {
    try {
      if (isBackendConnected) {
        await alertApi.confirmFraud(txnId);
        await loadBlacklist();
      }
    } catch (_) {}
    updateTransactionStatus(txnId, 'rejected', 'Confirmed fraud by operator');
  };

  const resolveAlert = async (txnId, resolution, reason) => {
    try {
      if (isBackendConnected) {
        await alertApi.resolve(txnId, resolution, reason);
      }
    } catch (_) {}
    updateTransactionStatus(txnId, resolution, reason);
  };

  // ─── Reset ────────────────────────────────────────────────────────────────────
  const resetToFactoryDefaults = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBlacklist(INITIAL_BLACKLIST_VPAS);
    setFraudRules(INITIAL_FRAUD_RULES);
    addToast({ type: 'info', title: 'Database Reset', message: 'Reset to initial factory state.' });
  };

  // ─── Live Simulation ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLiveStreamActive) return;

    const interval = setInterval(() => {
      const isFraud = Math.random() < 0.25;
      const amounts = [450, 890, 1200, 3500, 150, 2400, 780];
      const selectedAmount = amounts[Math.floor(Math.random() * amounts.length)];

      if (isFraud) {
        verifyPayment({ utr: '9281029481', amount: selectedAmount, senderVpa: 'scammer.bot@ybl', mode: 'ocr_screenshot', notes: 'Simulated Threat Stream Attack' });
      } else {
        verifyPayment({ utr: generateAuthenticUtr(), amount: selectedAmount, senderVpa: `customer.${Math.floor(Math.random() * 899 + 100)}@oksbi`, mode: 'manual', notes: 'Live Stream Inflow' });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isLiveStreamActive, transactions, blacklist]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        blacklist,
        fraudRules,
        auditLogs,
        toasts,
        dashboardStats,
        isLiveStreamActive,
        isBackendConnected,
        isLoadingTxns,
        txnPagination,
        setIsLiveStreamActive,
        verifyPayment,
        updateTransactionStatus,
        addBlacklistVpa,
        removeBlacklistVpa,
        updateRuleWeight,
        toggleRule,
        confirmFraud,
        resolveAlert,
        resetToFactoryDefaults,
        loadTransactions,
        loadDashboardStats,
        loadFraudRules,
        loadBlacklist,
        loadAuditLogs,
        addToast,
        removeToast,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

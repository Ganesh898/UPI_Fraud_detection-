/**
 * UPI Shield - Backend API Service
 * Handles all HTTP communication with the Express REST API
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Token Management ─────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('upishield_token');
}

function setToken(token) {
  localStorage.setItem('upishield_token', token);
}

function clearToken() {
  localStorage.removeItem('upishield_token');
  localStorage.removeItem('upishield_user');
}

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────

async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body) } : {}),
  };

  // For FormData (file uploads) — don't set Content-Type header
  if (options.formData) {
    delete headers['Content-Type'];
    config.body = options.formData;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || `HTTP ${response.status} Error`,
        errors: data.errors || null,
      };
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    // Network error
    throw {
      status: 0,
      message: 'Cannot connect to UPI Shield server. Make sure the backend is running on port 5000.',
      errors: null,
    };
  }
}

// ─── Health Check ─────────────────────────────────────────────────────────────

export const healthCheck = () => apiRequest('/health');

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: async (payload) => {
    const res = await apiRequest('/auth/register', { method: 'POST', body: payload });
    if (res.data?.token) setToken(res.data.token);
    return res;
  },

  login: async (email, password) => {
    const res = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
    if (res.data?.token) setToken(res.data.token);
    return res;
  },

  logout: () => {
    clearToken();
  },

  getProfile: () => apiRequest('/auth/me'),

  updateProfile: (payload) => apiRequest('/auth/me', { method: 'PUT', body: payload }),
};

// ─── Verification API ─────────────────────────────────────────────────────────

export const verifyApi = {
  manual: (payload) =>
    apiRequest('/verify/manual', { method: 'POST', body: payload }),

  screenshot: (file, extraFields = {}) => {
    const formData = new FormData();
    formData.append('receipt', file);
    Object.entries(extraFields).forEach(([k, v]) => formData.append(k, v));
    return apiRequest('/verify/screenshot', { method: 'POST', formData });
  },
};

// ─── Transactions API ─────────────────────────────────────────────────────────

export const transactionApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
    ).toString();
    return apiRequest(`/transactions${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => apiRequest(`/transactions/${id}`),

  updateStatus: (id, status, notes) =>
    apiRequest(`/transactions/${id}/status`, { method: 'PATCH', body: { status, notes } }),
};

// ─── Alerts API ───────────────────────────────────────────────────────────────

export const alertApi = {
  getAll: () => apiRequest('/alerts'),

  confirmFraud: (id) =>
    apiRequest(`/alerts/${id}/confirm-fraud`, { method: 'POST' }),

  resolve: (id, resolution, reason) =>
    apiRequest(`/alerts/${id}/resolve`, { method: 'POST', body: { resolution, reason } }),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: () => apiRequest('/dashboard/stats'),
  getTrajectory: () => apiRequest('/dashboard/trajectory'),
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  getRules: () => apiRequest('/admin/rules'),
  updateRuleWeight: (id, weight) =>
    apiRequest(`/admin/rules/${id}/weight`, { method: 'PUT', body: { weight } }),
  toggleRule: (id, is_enabled) =>
    apiRequest(`/admin/rules/${id}/toggle`, { method: 'PUT', body: { is_enabled } }),

  getBlacklist: () => apiRequest('/admin/blacklist'),
  addBlacklist: (vpa, reason) =>
    apiRequest('/admin/blacklist', { method: 'POST', body: { vpa, reason } }),
  removeBlacklist: (id) =>
    apiRequest(`/admin/blacklist/${id}`, { method: 'DELETE' }),

  getAuditLogs: (limit = 50) => apiRequest(`/admin/audit-logs?limit=${limit}`),
};

// ─── Token helpers (exported for AuthContext) ─────────────────────────────────
export { getToken, setToken, clearToken };

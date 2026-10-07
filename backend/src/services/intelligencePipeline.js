const net = require('node:net');

const URL_PATTERN = /\bhttps?:\/\/[^\s<>"'`]+/gi;
const DOMAIN_PATTERN = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\b/gi;
const VPA_PATTERN = /\b[a-z0-9._-]{2,100}@[a-z][a-z0-9.-]{1,30}\b/gi;
const SHA256_PATTERN = /\b[a-f0-9]{64}\b/gi;
const IPV4_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const URL_SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly']);
const HIGH_RISK_TERMS = /\b(?:otp|upi\s*pin|urgent|account\s+(?:blocked|suspended)|payment\s+failed|refund|verify\s+account|screen\s*share|remote\s+access)\b/i;
const VPA_MATCHER = /^[a-z0-9._-]{2,100}@[a-z][a-z0-9.-]{1,30}$/i;

const trimUrlPunctuation = (value) => value.replace(/[),.;!?}\]]+$/, '');

const normalizedDomain = (value) => {
  try {
    return new URL(value.includes('://') ? value : `https://${value}`).hostname.toLowerCase();
  } catch {
    return null;
  }
};

const extractUrl = (value) => {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    const error = new Error('URL source must be a valid absolute http or https URL.');
    error.statusCode = 400;
    throw error;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    const error = new Error('Only http and https URLs are accepted for analysis.');
    error.statusCode = 400;
    throw error;
  }
  if (parsed.username || parsed.password) {
    const error = new Error('URLs containing embedded credentials are not accepted.');
    error.statusCode = 400;
    throw error;
  }

  return parsed;
};

const extractIndicators = (sourceType, sourceValue) => {
  const text = sourceValue;
  const observed = new Map();
  const add = (type, value, evidence) => {
    const normalized = type === 'domain' ? normalizedDomain(value) : value.toLowerCase();
    if (!normalized) return;
    const key = `${type}:${normalized}`;
    const existing = observed.get(key);
    if (existing) {
      existing.evidence.add(evidence);
      return;
    }
    observed.set(key, {
      type,
      normalizedValue: normalized,
      displayValue: value,
      evidence: new Set([evidence]),
    });
  };

  for (const match of text.matchAll(URL_PATTERN)) {
    const value = trimUrlPunctuation(match[0]);
    const domain = normalizedDomain(value);
    if (domain) add('url', value, 'URL observed in submitted source');
    if (domain) add('domain', domain, 'Host extracted from URL');
  }

  for (const match of text.matchAll(DOMAIN_PATTERN)) {
    add('domain', match[0], 'Domain observed in submitted source');
  }
  for (const match of text.matchAll(VPA_PATTERN)) {
    add('vpa', match[0], 'UPI VPA observed in submitted source');
  }
  for (const match of text.matchAll(SHA256_PATTERN)) {
    add('sha256', match[0], 'SHA-256 hash observed in submitted source');
  }
  for (const match of text.matchAll(IPV4_PATTERN)) {
    if (net.isIP(match[0]) === 4) add('ip', match[0], 'IPv4 address observed in submitted source');
  }

  const upiUris = text.match(/\bupi:\/\/[^\s<>"'`]+/gi) || [];
  for (const uri of upiUris) {
    try {
      const parsed = new URL(uri);
      const payee = parsed.searchParams.get('pa');
      if (payee && VPA_MATCHER.test(payee)) {
        add('vpa', payee, 'Payee address extracted from UPI URI');
      }
    } catch {
      // Malformed UPI URIs are retained as source text but not treated as parsed indicators.
    }
  }

  const indicators = [...observed.values()].map((indicator) => ({
    ...indicator,
    evidence: [...indicator.evidence],
  }));

  const factors = [];
  if (sourceType === 'url') {
    const domain = normalizedDomain(sourceValue);
    if (domain && URL_SHORTENERS.has(domain)) {
      factors.push({ code: 'URL_SHORTENER', points: 20, description: 'Shortened URL hides its final destination; analyst review is recommended.' });
    }
  }
  if (HIGH_RISK_TERMS.test(text)) {
    factors.push({ code: 'SOCIAL_ENGINEERING_LANGUAGE', points: 20, description: 'Message contains common credential-harvesting or payment-pressure language.' });
  }
  if (indicators.some((indicator) => indicator.type === 'url')) {
    factors.push({ code: 'URL_INDICATOR_PRESENT', points: 10, description: 'A URL was extracted; presence alone does not establish that it is malicious.' });
  }
  if (indicators.some((indicator) => indicator.type === 'vpa')) {
    factors.push({ code: 'UPI_VPA_PRESENT', points: 5, description: 'A UPI VPA was extracted for correlation; presence alone does not establish abuse.' });
  }

  const score = Math.min(100, factors.reduce((total, factor) => total + factor.points, 0));
  return {
    pipeline: sourceType === 'url' ? 'web_url_intake' : 'text_feed_intake',
    indicators,
    factors,
    riskScore: score,
    riskLevel: score >= 71 ? 'HIGH' : score >= 31 ? 'MEDIUM' : 'LOW',
    assessment: 'Heuristic triage only. No remote URL fetch, CT-log lookup, APK analysis, bank verification, or external threat-intelligence lookup was performed.',
  };
};

module.exports = { extractIndicators, extractUrl, isValidIp: (value) => net.isIP(value) !== 0 };

import React, { useState } from 'react';
import {
  User,
  Building,
  AtSign,
  Phone,
  Mail,
  Key,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  Save,
  Radio,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useTransactions } from '../context/TransactionContext';
import { speakAlert } from '../services/soundEffects';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useTransactions();
  const { soundEnabled, triggerSafeAlert, triggerFraudAlert } = useSound();

  const [businessName, setBusinessName] = useState(user?.business_name || 'Apex Supermart & Electronics');
  const [merchantVpa, setMerchantVpa] = useState(user?.merchant_vpa || 'apex.retail@okhdfcbank');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      business_name: businessName,
      merchant_vpa: merchantVpa,
      phone,
    });
    setIsSaved(true);
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Merchant terminal configuration saved successfully.',
    });
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCopyApiKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleTestSoundbox = (type) => {
    if (type === 'safe') {
      triggerSafeAlert(750);
      speakAlert(`Payment of 750 rupees received and verified safely on UPI Shield`);
    } else {
      triggerFraudAlert();
      speakAlert(`Warning! Fraudulent payment attempt intercepted!`);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
          Merchant Terminal Profile & Hardware Hub
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Terminal identity, registered bank beneficiary VPA, and audio soundbox hardware settings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Left Column: Business Details Form */}
        <div className="cyber-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Building size={18} color="#00f2fe" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Store Identity Details</h3>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Store Legal Business Name</label>
              <input
                type="text"
                className="input-field"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                <span>Registered Merchant Bank VPA</span>
                <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Active Payee Address</span>
              </label>
              <input
                type="text"
                className="input-field mono"
                value={merchantVpa}
                onChange={(e) => setMerchantVpa(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                All in-store QR code receipts must strictly match this payee VPA.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Terminal ID</label>
                <input
                  type="text"
                  className="input-field mono"
                  value={user?.terminal_id || 'POS-DEL-9821'}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-md" style={{ marginTop: 8, gap: 8 }}>
              {isSaved ? <Check size={16} /> : <Save size={16} />}
              <span>{isSaved ? 'Changes Saved' : 'Save Terminal Settings'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Soundbox Hardware Speaker Simulator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="cyber-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Volume2 size={18} color="#10b981" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>POS Soundbox Speaker Simulator</h3>
              </div>
              <span className="badge badge-safe" style={{ fontSize: '0.68rem' }}>
                AUDIO READY
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Emulates the acoustic behavior of physical Paytm/PhonePe soundbox speakers directly via browser Web Audio API and Speech Synthesis.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={() => handleTestSoundbox('safe')}
                style={{ flexDirection: 'column', padding: '14px 10px', gap: 6, borderColor: 'rgba(16, 185, 129, 0.4)' }}
              >
                <Volume2 size={20} color="#10b981" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>Play Safe Soundbox</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>"₹750 Verified Safely"</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={() => handleTestSoundbox('fraud')}
                style={{ flexDirection: 'column', padding: '14px 10px', gap: 6, borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                <Volume2 size={20} color="#ef4444" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>Play Fraud Alarm</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>"Warning: Fake Payment"</span>
              </button>
            </div>
          </div>

          {/* API Key & Webhooks */}
          <div className="cyber-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Key size={18} color="#00f2fe" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>POS API & Webhook Integration</h3>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">
                <span>Secret API Key</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Bearer Token</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="password"
                  className="input-field mono"
                  value={user?.apiKey || 'sk_live_upi_98a7f230e9d145c8'}
                  disabled
                  style={{ opacity: 0.8 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyApiKey}
                  title="Copy API Key"
                >
                  {copiedKey ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">POS Webhook URL</label>
              <input
                type="text"
                className="input-field mono"
                defaultValue={user?.webhookUrl || 'https://api.apexmart.in/webhooks/upi-shield'}
                placeholder="https://yourdomain.com/webhook"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

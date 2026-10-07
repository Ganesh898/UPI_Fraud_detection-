import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertOctagon, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { OCR_SAMPLE_RECEIPTS } from '../../constants/initialData';

export const OcrInspector = ({ onSelectReceipt, onAnalyze, isScanning }) => {
  const [selectedSampleId, setSelectedSampleId] = useState(OCR_SAMPLE_RECEIPTS[0].id);
  const [customFile, setCustomFile] = useState(null);

  const activeSample = OCR_SAMPLE_RECEIPTS.find((s) => s.id === selectedSampleId) || OCR_SAMPLE_RECEIPTS[0];

  const handleSelectSample = (sample) => {
    setSelectedSampleId(sample.id);
    setCustomFile(null);
    onSelectReceipt(sample);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        url: URL.createObjectURL(file),
      });
      // Generate synthetic extracted data for uploaded image
      onSelectReceipt({
        id: 'custom_upload',
        name: `Uploaded Receipt: ${file.name}`,
        amount: '₹1,500.00',
        utr: '9481029482', // Suspicious 10 digit to demonstrate detection
        sender: 'user.receipt@paytm',
        receiver: 'apex.retail@okhdfcbank',
        date: '2026-10-07 15:40',
        app: 'Custom Uploaded Screenshot',
        description: 'User uploaded payment screenshot scanned via OCR pipeline.',
        artifacts: [
          'OCR text extraction confidence: 94.2%',
          'Checking layout alignment with NPCI template',
        ],
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 3 Clickable Preset Receipts for quick testing */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Choose Preset Test Receipt or Upload Custom
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
            ★ One-Click Judge Demo Scenarios
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
          {OCR_SAMPLE_RECEIPTS.map((sample) => {
            const isSelected = selectedSampleId === sample.id && !customFile;
            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="cyber-card"
                style={{
                  padding: '12px 14px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'var(--bg-surface-elevated)',
                  border: isSelected ? '1px solid #00f2fe' : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 0 15px rgba(0, 242, 254, 0.2)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: sample.color === '#ef4444' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: sample.color,
                      border: `1px solid ${sample.color}`,
                    }}
                  >
                    {sample.badge}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                    {sample.amount}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                  {sample.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  UTR: <span className="text-mono" style={{ color: 'var(--text-secondary)' }}>{sample.utr}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screenshot Preview & Scanning Laser Box */}
      <div
        className="cyber-card"
        style={{
          padding: '20px',
          backgroundColor: 'rgba(10, 16, 29, 0.9)',
          border: '1px solid var(--border-medium)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Holographic Laser Animation during scanning */}
        {isScanning && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: '#00f2fe',
              boxShadow: '0 0 15px #00f2fe, 0 0 25px #00f2fe',
              zIndex: 10,
              animation: 'scan-line 1.8s ease-in-out infinite',
            }}
          />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'center' }}>
          {/* Simulated Mobile Receipt Screen */}
          <div
            style={{
              backgroundColor: '#050811',
              borderRadius: 16,
              border: '2px solid rgba(255, 255, 255, 0.1)',
              padding: '18px',
              maxWidth: 320,
              margin: '0 auto',
              width: '100%',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
              position: 'relative',
            }}
          >
            {/* Top Phone speaker notch */}
            <div style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '0 auto 14px' }} />

            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: activeSample.color === '#ef4444' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: activeSample.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  border: `1px solid ${activeSample.color}`,
                }}
              >
                {activeSample.color === '#ef4444' ? <AlertOctagon size={24} /> : <CheckCircle2 size={24} />}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>
                Payment Successful
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                {activeSample.amount}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {activeSample.app}
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>UPI Ref (UTR):</span>
                <span style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{activeSample.utr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>To:</span>
                <span style={{ color: '#ffffff', wordBreak: 'break-all' }}>{activeSample.receiver}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>From:</span>
                <span style={{ color: '#ffffff' }}>{activeSample.sender}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Time:</span>
                <span style={{ color: '#ffffff' }}>{activeSample.date}</span>
              </div>
            </div>

            {/* Custom file upload input */}
            <div style={{ marginTop: 12 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px dashed var(--border-medium)',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <Upload size={13} />
                <span>Upload Custom Image</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* OCR Heuristic Extraction Insights */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#00f2fe" />
              <span>OCR Anomaly & Forensic Breakdown</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              {activeSample.description}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {activeSample.artifacts.map((art, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: '0.75rem',
                    padding: '8px 10px',
                    borderRadius: 6,
                    backgroundColor: activeSample.color === '#ef4444' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                    border: `1px solid ${activeSample.color === '#ef4444' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
                    color: activeSample.color === '#ef4444' ? '#fca5a5' : '#86efac',
                  }}
                >
                  <span style={{ fontWeight: 800 }}>•</span>
                  <span>{art}</span>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={() => onAnalyze(activeSample)}
              disabled={isScanning}
              style={{ width: '100%', gap: 10 }}
            >
              {isScanning ? (
                <>
                  <RefreshCw size={18} className="animate-radar" />
                  <span>Scanning Pixels & Validating Julian Syntax...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Analyze Receipt & Calculate Risk</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

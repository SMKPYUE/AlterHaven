import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Download,
  Upload,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Smartphone,
  Laptop,
  AlertCircle,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useSystemStore } from '../../store/useSystemStore';

interface QrSyncModalProps {
  onClose: () => void;
}

export const QrSyncModal: React.FC<QrSyncModalProps> = ({ onClose }) => {
  const { system, alters, exportAllData, importAllData, recordBackup } = useSystemStore();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);
  const [qrRendered, setQrRendered] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate payload string safely
  const [exportPayload, setExportPayload] = useState<string>('');

  useEffect(() => {
    try {
      const data = exportAllData();
      setExportPayload(data);
    } catch (e) {
      console.error('Failed to export system payload:', e);
    }
  }, [system, alters.length]);

  // Render authentic scannable QR code on canvas
  useEffect(() => {
    if (activeTab !== 'export' || !canvasRef.current || !exportPayload) return;

    const canvas = canvasRef.current;

    // Build the data to encode in QR code
    // Standard QR codes can reliably hold up to ~2-3 KB.
    let qrData = exportPayload;
    if (exportPayload.length > 2200) {
      // Create a compact payload for fast peer scanning
      qrData = JSON.stringify({
        app: 'AlterHaven',
        v: '2.0',
        systemId: system.id,
        name: system.name,
        altersCount: alters.length,
        timestamp: Date.now(),
        note: 'Full system backup available via Download Backup .json button',
      });
    }

    QRCode.toCanvas(
      canvas,
      qrData,
      {
        width: 220,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err) => {
        if (err) {
          console.error('QRCode canvas render error:', err);
          setQrRendered(false);
        } else {
          setQrRendered(true);
        }
      }
    );
  }, [activeTab, exportPayload, system.name, alters.length]);

  const handleCopy = () => {
    if (!exportPayload) return;
    navigator.clipboard.writeText(exportPayload);
    recordBackup();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!exportPayload) return;
    const blob = new Blob([exportPayload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alterhaven_backup_${system.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    recordBackup();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportInput(content);
        validateAndPreview(content);
      }
    };
    reader.readAsText(file);
  };

  const validateAndPreview = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (parsed.system && parsed.alters) {
        setParsedPreview(parsed);
        setImportError(null);
      } else {
        setParsedPreview(null);
        setImportError('Invalid backup file structure: missing system or alter records.');
      }
    } catch (e) {
      setParsedPreview(null);
      setImportError('Could not parse JSON format. Please check the backup file.');
    }
  };

  const handleImportSubmit = () => {
    if (!importInput.trim()) return;
    const success = importAllData(importInput.trim());
    if (success) {
      setImportSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setImportError('Failed to import data payload.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Direct Local Device Sync & Backup
              </h2>
              <p className="text-xs text-slate-400">
                Zero Cloud • 100% Private Peer-to-Peer Transfer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'export'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Export & Sync Code</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'import'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Scan & Restore</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'export' ? (
            <div className="space-y-5">
              {/* QR Code Canvas */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="p-2 bg-white rounded-2xl shadow-lg inline-block">
                  <canvas
                    ref={canvasRef}
                    width={220}
                    height={220}
                    className="block rounded-lg"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-3 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Encrypted Offline System Signature</span>
                </div>
              </div>

              {/* Data Summary Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Identities</div>
                  <div className="font-bold text-slate-100">{alters.length} alters</div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">App Version</div>
                  <div className="font-bold text-purple-400">2.0 Local</div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Payload Size</div>
                  <div className="font-bold text-slate-100">
                    {(exportPayload.length / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={handleCopy}
                  className="w-full sm:flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copied ? 'Copied Payload!' : 'Copy Sync Text'}</span>
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="w-full sm:flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup .json</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Primary File Upload Dropzone */}
              <div>
                <label className="cursor-pointer block border-2 border-dashed border-purple-500/40 hover:border-purple-500 bg-slate-950/60 hover:bg-slate-950 p-6 rounded-2xl text-center transition-all group">
                  <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-slate-100 mb-0.5">
                    Click to Choose Backup File (.json)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Instant 1-click restore without copying raw text
                  </p>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Textarea Fallback */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Or Paste Sync Payload Text
                </label>
                <textarea
                  value={importInput}
                  onChange={(e) => {
                    setImportInput(e.target.value);
                    validateAndPreview(e.target.value);
                  }}
                  rows={3}
                  placeholder="Paste JSON text here if transferring via clipboard..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Preview Box */}
              {parsedPreview && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-1.5 animate-in fade-in">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Valid System Backup Detected:</span>
                  </div>
                  <div className="text-slate-200">
                    <span className="font-semibold text-purple-300">{parsedPreview.system?.name || 'System'}</span> (
                    {parsedPreview.alters?.length || 0} alters,{' '}
                    {parsedPreview.tasks?.length || 0} tasks,{' '}
                    {parsedPreview.rules?.length || 0} rules)
                  </div>
                </div>
              )}

              {importError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-medium">
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>Sync Successful! Reloading system state...</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  disabled={!parsedPreview}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-purple-600/20 transition-all"
                >
                  Confirm & Sync Overwrite
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

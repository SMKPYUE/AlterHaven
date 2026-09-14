import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  WifiOff,
  Sparkles,
} from 'lucide-react';

interface PwaInstallModalProps {
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect if already installed / standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Listen for native install prompt event (Chrome / Edge / Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 to-purple-950/40 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold text-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Install AlterHaven App</h2>
              <p className="text-xs text-indigo-300">
                Run as a standalone app on your Phone, Tablet, or PC
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Key Advantages */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto" />
              <p className="text-[11px] font-bold text-slate-200">100% Private</p>
              <p className="text-[9px] text-slate-500">Zero tracking or fees</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
              <WifiOff className="w-4 h-4 text-sky-400 mx-auto" />
              <p className="text-[11px] font-bold text-slate-200">Offline Ready</p>
              <p className="text-[9px] text-slate-500">Works without WiFi</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
              <Zap className="w-4 h-4 text-amber-400 mx-auto" />
              <p className="text-[11px] font-bold text-slate-200">Instant Launch</p>
              <p className="text-[9px] text-slate-500">No browser URL bars</p>
            </div>
          </div>

          {/* Installation Instructions / Action Button */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-emerald-200">AlterHaven is already installed!</p>
              <p className="text-[11px] text-slate-400">
                You can launch it directly from your device home screen or app launcher.
              </p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-pink-400" />
                <span>How to Install on iPhone / iPad (Safari):</span>
              </p>
              <ol className="space-y-2 text-xs text-slate-300 pl-1">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> icon <Share2 className="w-3.5 h-3.5 inline text-sky-400" /> at the bottom of Safari.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-indigo-400" />.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                  <span>Tap <strong>Add</strong> in the top right. Done!</span>
                </li>
              </ol>
            </div>
          ) : deferredPrompt ? (
            /* Android / Chrome / Edge 1-Tap Install Button */
            <button
              onClick={handleNativeInstall}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Download className="w-5 h-5" />
              <span>Install to Home Screen / Desktop</span>
            </button>
          ) : (
            /* Android / Chrome Manual Instructions fallback */
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>How to Install on Android / Chrome:</span>
              </p>
              <ol className="space-y-2 text-xs text-slate-300 pl-1">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                  <span>Tap the <strong>three dots (⋮)</strong> menu in the browser.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                  <span>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                </li>
              </ol>
            </div>
          )}

          {/* Footer Close */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

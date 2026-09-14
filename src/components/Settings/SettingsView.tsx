import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSystemStore } from '../../store/useSystemStore';
import type { SwitchWebhookConfig, WebhookPreset } from '../../types';
import { SoundEngine } from '../../utils/soundEffects';
import { processImageFile } from '../../utils/imageUtils';
import {
  Settings,
  Radio,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Shield,
  HelpCircle,
  ExternalLink,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Laptop,
  X,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    system,
    updateSystem,
    webhooks,
    addWebhook,
    updateWebhook,
    deleteWebhook,
    triggerWebhookTest,
    devicePrefs,
    updateDevicePrefs,
    resetToDefaultData,
    openSetupWizard,
  } = useSystemStore();


  const [systemName, setSystemName] = useState(system.name);
  const [systemTagline, setSystemTagline] = useState(system.tagline || '');
  const [avatarUrl, setAvatarUrl] = useState(system.avatarUrl || '');

  // Add Webhook Modal
  const [isAddWhModalOpen, setIsAddWhModalOpen] = useState(false);
  const [whName, setWhName] = useState('');
  const [whPreset, setWhPreset] = useState<WebhookPreset>('discord_webhook');
  const [whUrl, setWhUrl] = useState('');
  const [testStatus, setTestStatus] = useState<Record<string, { loading: boolean; result?: string }>>({});

  const handleSaveSystem = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystem({
      name: systemName.trim(),
      tagline: systemTagline.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
    });
    alert('System profile saved!');
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whUrl.trim()) return;

    addWebhook({
      systemId: system.id,
      isEnabled: true,
      name: whName.trim() || (whPreset === 'discord_webhook' ? 'Discord Switch Channel' : 'API Webhook'),
      preset: whPreset,
      url: whUrl.trim(),
      triggerOnEvents: ['front_changed', 'co_front_changed'],
    });

    setWhName('');
    setWhUrl('');
    setIsAddWhModalOpen(false);
  };

  const handleTestPing = async (whId: string) => {
    setTestStatus((prev) => ({ ...prev, [whId]: { loading: true } }));
    const res = await triggerWebhookTest(whId);
    setTestStatus((prev) => ({
      ...prev,
      [whId]: {
        loading: false,
        result: res.success ? '✅ Test ping sent successfully!' : `❌ Failed: ${res.error}`,
      },
    }));
  };

  const handleExportBackup = () => {
    const data = localStorage.getItem('alterhaven_data_v1') || localStorage.getItem('systemboard_data_v1');
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alterhaven_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.system && json.alters) {
          localStorage.setItem('alterhaven_data_v1', JSON.stringify(json));
          alert('Backup restored successfully! Reloading...');
          window.location.reload();
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>System Settings & External Webhook Broadcasts</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize system metadata, optional Discord switch alerts, and backup data.
        </p>
      </div>

      {/* 1. System Metadata Editor */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100">System Identity & Profile</h3>

        <form onSubmit={handleSaveSystem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">System Name</label>
              <input
                type="text"
                required
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline / Motto</label>
              <input
                type="text"
                value={systemTagline}
                onChange={(e) => setSystemTagline(e.target.value)}
                placeholder="e.g. Living in cooperative harmony"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">System Avatar Image</label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/30 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="System Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                )}
              </div>

              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Local Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const dataUrl = await processImageFile(file);
                        setAvatarUrl(dataUrl);
                      } catch {
                        alert('Failed to process image file.');
                      }
                    }
                  }}
                />
              </label>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Remove Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Or paste image URL (https://...)"
              className="w-full mt-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
            >
              Save System Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. Device Audio & Interaction Sounds Customizer */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Interaction Audio & Haptic Feedback
              </h3>
              <p className="text-xs text-slate-400">
                Procedural, calming acoustic feedback customizable per device.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={devicePrefs.soundEnabled}
              onChange={(e) => updateDevicePrefs({ soundEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {devicePrefs.soundEnabled && (
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            {/* Sound Pack Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Sound Theme Pack
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'chimes', name: 'Calm Chimes', desc: 'Harmonic bells' },
                  { id: 'wood_taps', name: 'Soft Wood Taps', desc: 'Acoustic cork thuds' },
                  { id: 'subtle_clicks', name: 'Subtle Clicks', desc: 'Clean UI ticks' },
                  { id: 'ethereal', name: 'Ethereal', desc: 'Healing 432Hz tone' },
                ].map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => {
                      updateDevicePrefs({ soundPack: pack.id as any });
                      SoundEngine.playClick(pack.id as any, devicePrefs.soundVolume);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      devicePrefs.soundPack === pack.id
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-100 block">{pack.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{pack.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Slider */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Volume Level</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {Math.round(devicePrefs.soundVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={devicePrefs.soundVolume}
                onChange={(e) => updateDevicePrefs({ soundVolume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Live Audio Test Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Preview Audio FX:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => SoundEngine.playClick(devicePrefs.soundPack, devicePrefs.soundVolume)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                >
                  Test Click
                </button>
                <button
                  type="button"
                  onClick={() => SoundEngine.playPinDrop(devicePrefs.soundPack, devicePrefs.soundVolume)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                >
                  Test Pin Drop
                </button>
                <button
                  type="button"
                  onClick={() => SoundEngine.playSwitch(devicePrefs.soundPack, devicePrefs.soundVolume)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                >
                  Test Switch Sound
                </button>
                <button
                  type="button"
                  onClick={() => SoundEngine.playComplete(devicePrefs.soundPack, devicePrefs.soundVolume)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-800/60"
                >
                  Test Task Done
                </button>
                <button
                  type="button"
                  onClick={() => SoundEngine.playBreathingChime(devicePrefs.soundVolume)}
                  className="px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 text-xs font-semibold border border-sky-800/60"
                >
                  Test 432Hz Bell
                </button>
              </div>
            </div>

            {/* Haptics */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Haptic Touch Feedback (Mobile)
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Gentle tactile vibrations on touch actions on supported mobile devices
                </span>
              </div>
              <input
                type="checkbox"
                checked={devicePrefs.hapticsEnabled}
                onChange={(e) => updateDevicePrefs({ hapticsEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Device & Screen Layout Preference (Desktop vs Mobile) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-pink-400" />
            <span>Device Layout Mode (Desktop PC vs Mobile)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Optimize the navigation and board controls for PC wide displays or handheld mobile touch screens.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'auto',
              title: 'Auto-Detect',
              desc: 'Automatically adapts based on device screen width.',
              icon: Laptop,
            },
            {
              id: 'desktop',
              title: '🖥️ Desktop PC View',
              desc: 'Full sidebar workspace, widescreen spatial corkboard, and dual-pane chat.',
              icon: Monitor,
            },
            {
              id: 'mobile',
              title: '📱 Mobile Touch View',
              desc: 'Ergonomic bottom navigation, full-screen touch modals, and compact cards.',
              icon: Smartphone,
            },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = devicePrefs.viewMode === mode.id;

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  updateDevicePrefs({ viewMode: mode.id as any });
                  if (devicePrefs.soundEnabled) SoundEngine.playClick(devicePrefs.soundPack, devicePrefs.soundVolume);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-100">{mode.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{mode.desc}</p>
              </button>
            );
          })}
        </div>
      </div>


      {/* 3. Data Backup & Local Storage */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Local Storage & Backup Management</span>
        </h3>
        <p className="text-xs text-slate-400">
          Save your complete AlterHaven offline backup JSON file, transfer via QR code, or restore onto another browser/device with zero cloud risk.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => useSystemStore.getState().openQrSyncModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Launch QR / Direct Peer Sync</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Backup (.json)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (confirm('Start from scratch? This will launch the Setup Wizard to customize your system name and first alter with a fresh, clean slate.')) {
                openSetupWizard();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/50 text-indigo-300 text-xs font-semibold transition-all shadow-lg shadow-indigo-600/10"
            title="Start from scratch with a guided setup wizard"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Start from Scratch (Setup Wizard)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset system and re-populate all default demo data (alters, boards, medications, rules, polls, contacts)?')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 text-xs font-semibold transition-all"
            title="Re-populate all default sample alters, boards, medications, and rules"
          >
            <RefreshCw className="w-4 h-4 text-rose-400" />
            <span>Reset to Full Demo Defaults</span>
          </button>
        </div>
      </div>

      {/* Add Webhook Modal */}
      {isAddWhModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddWhModalOpen(false);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Add Switch Broadcast Webhook</h3>
              <button
                onClick={() => setIsAddWhModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhook} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preset Template</label>
                <select
                  value={whPreset}
                  onChange={(e) => setWhPreset(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="discord_webhook">Discord Webhook (Rich Embed Notification)</option>
                  <option value="pluralkit">PluralKit / SimplyPlural API Format</option>
                  <option value="custom_json">Custom JSON HTTP Endpoint</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Webhook Name</label>
                <input
                  type="text"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  placeholder="e.g. Main Server Alerts"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Webhook URL *</label>
                <input
                  type="url"
                  required
                  value={whUrl}
                  onChange={(e) => setWhUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddWhModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow"
                >
                  Save Webhook
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

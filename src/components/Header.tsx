import React, { useState, useEffect } from 'react';
import { useSystemStore } from '../store/useSystemStore';
import { SoundEngine } from '../utils/soundEffects';
import {
  Users,
  Activity,
  Bell,
  Sparkles,
  Heart,
  Droplets,
  Zap,
  Lock,
  ChevronDown,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Laptop,
  QrCode,
  RefreshCw,
  Download,
} from 'lucide-react';

interface HeaderProps {
  onOpenFrontModal: () => void;
  onOpenBriefingModal: (alterId: string) => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFrontModal,
  onOpenBriefingModal,
  onOpenInstallModal,
}) => {
  const { system, alters, activeFronts, bodyNeeds, tasks, openBriefingModal, openQrSyncModal, devicePrefs, updateDevicePrefs } = useSystemStore();

  const mainFrontMember = activeFronts.find((f) => f.status === 'front') || activeFronts[0];
  const mainFrontAlter = alters.find((a) => a.id === mainFrontMember?.alterId);
  const coFrontAlters = alters.filter((a) =>
    activeFronts.some((f) => f.alterId === a.id && f.alterId !== mainFrontMember?.alterId)
  );

  // Time elapsed since front started
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateElapsed = () => {
      if (!mainFrontMember) {
        setElapsed('No active front');
        return;
      }
      const diffMs = Date.now() - mainFrontMember.startedAt;
      const mins = Math.floor(diffMs / 60000);
      const hours = Math.floor(mins / 60);
      if (hours > 0) {
        setElapsed(`${hours}h ${mins % 60}m`);
      } else {
        setElapsed(`${mins}m`);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 30000);
    return () => clearInterval(interval);
  }, [mainFrontMember]);

  // Check pending tasks for active front alter
  const pendingTasksForActive = tasks.filter(
    (t) => t.assignedAlterId === mainFrontAlter?.id && t.status === 'requested'
  );

  const toggleSound = () => {
    const willEnable = !devicePrefs.soundEnabled;
    updateDevicePrefs({ soundEnabled: willEnable });
    if (willEnable) {
      SoundEngine.playClick(devicePrefs.soundPack, devicePrefs.soundVolume);
    }
  };

  const cycleViewMode = () => {
    const nextMode =
      devicePrefs.viewMode === 'auto'
        ? 'desktop'
        : devicePrefs.viewMode === 'desktop'
        ? 'mobile'
        : 'auto';
    updateDevicePrefs({ viewMode: nextMode });
    if (devicePrefs.soundEnabled) SoundEngine.playClick(devicePrefs.soundPack, devicePrefs.soundVolume);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
      {/* Left: System Title & Icon */}
      <div className="flex items-center gap-2.5">
        <div className="relative shrink-0">
          <img
            src={system.avatarUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=80&auto=format&fit=crop&q=80'}
            alt={system.name}
            className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/30 shadow-md"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs sm:text-sm font-semibold text-slate-100 tracking-tight leading-none">
              {system.name}
            </h1>
            <span className="hidden md:inline-block px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
              {alters.length} alters
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate max-w-[160px] md:max-w-xs mt-0.5">
            {system.tagline || 'AlterHaven Hub'}
          </p>
        </div>
      </div>

      {/* Middle: Active Front Indicator & Quick Switcher Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (devicePrefs.soundEnabled) SoundEngine.playClick(devicePrefs.soundPack, devicePrefs.soundVolume);
            onOpenFrontModal();
          }}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 transition-all shadow-sm hover:border-slate-600 group"
          title="Click to Switch Front or Log Co-Front"
        >
          {mainFrontAlter ? (
            <>
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-inner relative overflow-hidden ring-1 ring-white/20 shrink-0"
                style={{ backgroundColor: mainFrontAlter.colorHex }}
              >
                {mainFrontAlter.avatarUrl ? (
                  <img
                    src={mainFrontAlter.avatarUrl}
                    alt={mainFrontAlter.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  mainFrontAlter.name.slice(0, 2).toUpperCase()
                )}
                {mainFrontAlter.isVaultLocked && (
                  <div className="absolute bottom-0 right-0 bg-slate-900/90 p-0.5 rounded-tl">
                    <Lock className="w-2 h-2 text-amber-300" />
                  </div>
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                    {mainFrontAlter.name}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    ({mainFrontAlter.pronouns.join('/')})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{elapsed}</span>
                  {coFrontAlters.length > 0 && (
                    <span className="text-indigo-400 font-medium">
                      +{coFrontAlters.length} co-front
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Users className="w-4 h-4 text-slate-500" />
              <span>No front recorded (Click to set)</span>
            </div>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors ml-0.5" />
        </button>
      </div>

      {/* Right: Sound Toggle, View Mode Switcher, and Switch-in Briefing Alert */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Device View Mode Toggle */}
        <button
          onClick={cycleViewMode}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
          title={`View Mode: ${devicePrefs.viewMode.toUpperCase()} (Click to toggle Mobile/Desktop/Auto)`}
        >
          {devicePrefs.viewMode === 'mobile' ? (
            <Smartphone className="w-3.5 h-3.5 text-pink-400" />
          ) : devicePrefs.viewMode === 'desktop' ? (
            <Monitor className="w-3.5 h-3.5 text-sky-400" />
          ) : (
            <Laptop className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="hidden xl:inline text-[10px] font-mono capitalize">{devicePrefs.viewMode}</span>
        </button>

        {/* Audio Sound FX Toggle */}
        <button
          onClick={toggleSound}
          className={`p-1.5 rounded-lg border transition-colors ${
            devicePrefs.soundEnabled
              ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/60'
              : 'bg-slate-800/80 border-slate-700 text-slate-500 hover:bg-slate-700'
          }`}
          title={devicePrefs.soundEnabled ? `Sound FX Enabled (${devicePrefs.soundPack})` : 'Sound FX Muted'}
        >
          {devicePrefs.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Install App Button */}
        {onOpenInstallModal && (
          <button
            onClick={onOpenInstallModal}
            className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-500/40 text-xs flex items-center gap-1 transition-all"
            title="Install AlterHaven to Home Screen or Desktop"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline text-[10px] font-bold">Install</span>
          </button>
        )}

        {/* Local P2P QR Device Sync Button */}
        <button
          onClick={openQrSyncModal}
          className="p-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 text-xs flex items-center gap-1 transition-all"
          title="Direct Local Device Sync & QR Transfer"
        >
          <QrCode className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline text-[10px] font-bold">Sync</span>
        </button>

        {/* Force Hard Reload / Clear Cache */}
        <button
          onClick={async () => {
            if ('caches' in window) {
              const keys = await caches.keys();
              await Promise.all(keys.map((k) => caches.delete(k)));
            }
            if ('serviceWorker' in navigator) {
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (const registration of registrations) {
                await registration.unregister();
              }
            }
            window.location.reload();
          }}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 border border-slate-700 text-xs flex items-center transition-colors"
          title="Clear App Cache & Reload Latest Updates"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Switch-in Briefing Trigger */}
        {mainFrontAlter && (
          <button
            onClick={() => {
              if (devicePrefs.soundEnabled) SoundEngine.playClick(devicePrefs.soundPack, devicePrefs.soundVolume);
              openBriefingModal(mainFrontAlter.id);
            }}
            className={`relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              pendingTasksForActive.length > 0
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 animate-pulse'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
            }`}
            title="Open Switch-In Handoff Briefing"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Briefing</span>
            {pendingTasksForActive.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                {pendingTasksForActive.length}
              </span>
            )}
          </button>
        )}

        {/* Quick Body Vitals Badge */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700/60 text-xs">
          <div className="flex items-center gap-1 text-slate-300" title="Body Energy">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">{bodyNeeds.energyScore}/10</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300" title="Hydration">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-medium">{bodyNeeds.hydrationScore}/10</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300" title="Meds status">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-medium">
              {bodyNeeds.medications.filter((m) => m.takenToday).length}/
              {bodyNeeds.medications.length}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};


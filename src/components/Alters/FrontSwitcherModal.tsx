import React, { useState } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import {
  X,
  Zap,
  Activity,
  UserCheck,
  Users,
  Radio,
  Sparkles,
  Lock,
  Check,
} from 'lucide-react';

interface FrontSwitcherModalProps {
  onClose: () => void;
}

export const FrontSwitcherModal: React.FC<FrontSwitcherModalProps> = ({ onClose }) => {
  const { alters, activeFronts, setFront, removeFromFront, webhooks, bodyNeeds } = useSystemStore();

  const [selectedAlterId, setSelectedAlterId] = useState<string>(
    activeFronts.find((f) => f.status === 'front')?.alterId || alters[0]?.id || ''
  );
  const [switchMode, setSwitchMode] = useState<'front' | 'co-front' | 'co-conscious'>('front');
  const [energyLevel, setEnergyLevel] = useState<number>(bodyNeeds.energyScore || 7);
  const [switchNote, setSwitchNote] = useState<string>('');

  const selectedAlter = alters.find((a) => a.id === selectedAlterId);
  const isCurrentlyFronting = activeFronts.some((f) => f.alterId === selectedAlterId);
  const activeWebhookCount = webhooks.filter((w) => w.isEnabled).length;

  const handleApplySwitch = () => {
    if (!selectedAlterId) return;
    setFront(selectedAlterId, switchMode, switchNote.trim() || undefined, energyLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Log Front Switch & Co-Consciousness
              </h2>
              <p className="text-[11px] text-slate-400">
                Update who is currently in front, co-fronting, or lurking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Select Alter Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Alter / System Member
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {alters.map((alter) => {
                const isSelected = selectedAlterId === alter.id;
                const frontStatus = activeFronts.find((f) => f.alterId === alter.id)?.status;

                return (
                  <button
                    key={alter.id}
                    type="button"
                    onClick={() => setSelectedAlterId(alter.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                        : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 relative overflow-hidden shadow-inner"
                      style={{ backgroundColor: alter.colorHex }}
                    >
                      {alter.avatarUrl ? (
                        <img src={alter.avatarUrl} alt={alter.name} className="w-full h-full object-cover" />
                      ) : (
                        alter.name.slice(0, 2).toUpperCase()
                      )}
                      {alter.isVaultLocked && (
                        <div className="absolute bottom-0 right-0 bg-slate-950/80 p-0.5 rounded-tl">
                          <Lock className="w-2.5 h-2.5 text-amber-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-100 truncate">{alter.name}</p>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {alter.pronouns.join('/')}
                      </p>
                      {frontStatus && (
                        <span className="inline-block mt-0.5 px-1 py-0.2 rounded text-[9px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {frontStatus}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fronting Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Fronting Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSwitchMode('front')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  switchMode === 'front'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Primary Front</span>
              </button>

              <button
                type="button"
                onClick={() => setSwitchMode('co-front')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  switchMode === 'co-front'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Co-Fronting</span>
              </button>

              <button
                type="button"
                onClick={() => setSwitchMode('co-conscious')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  switchMode === 'co-conscious'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Co-Conscious</span>
              </button>
            </div>
          </div>

          {/* Energy Slider */}
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Current Energy / Clarity Level</span>
              </div>
              <span className="font-bold text-amber-400 text-sm font-mono">{energyLevel}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 (Fatigued / Foggy)</span>
              <span>5 (Moderate)</span>
              <span>10 (Fully Clear & Alert)</span>
            </div>
          </div>

          {/* Switch Trigger Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Switch Reason / Activity Note (Optional)
            </label>
            <input
              type="text"
              value={switchNote}
              onChange={(e) => setSwitchNote(e.target.value)}
              placeholder="e.g. Taking over for math exam, Going on walk, Sensory rest"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Webhook Broadcast Notice */}
          {activeWebhookCount > 0 && selectedAlter?.allowExternalBroadcast && (
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/50 flex items-center justify-between text-xs text-indigo-200">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Discord & Webhook broadcast active ({activeWebhookCount} webhook configured)</span>
              </div>
            </div>
          )}

          {/* If already fronting, provide button to step down */}
          {isCurrentlyFronting && (
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">This alter is currently logged in front.</span>
              <button
                type="button"
                onClick={() => {
                  removeFromFront(selectedAlterId);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-800/40 transition-colors"
              >
                Step Down / Remove from Front
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplySwitch}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Apply Switch & Open Briefing</span>
          </button>
        </div>
      </div>
    </div>
  );
};

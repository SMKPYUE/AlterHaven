import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSystemStore } from '../../store/useSystemStore';
import { AlterRole } from '../../types';
import { processImageFile } from '../../utils/imageUtils';
import {
  Sparkles,
  Users,
  Shield,
  Upload,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  Palette,
  Layers,
} from 'lucide-react';

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ROLES: AlterRole[] = [
  'Host',
  'Co-Host',
  'Protector',
  'Caretaker',
  'Gatekeeper',
  'Little',
  'Internal Self Helper (ISH)',
  'Memory Holder',
  'Social',
  'Academic / Work',
  'Other',
];

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#eab308', // Amber
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#64748b', // Slate
];

export const SetupWizardModal: React.FC<SetupWizardModalProps> = ({ isOpen, onClose }) => {
  const { initializeNewSystem } = useSystemStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: System Info
  const [systemName, setSystemName] = useState('');
  const [tagline, setTagline] = useState('Cooperative internal harmony & shared living');
  const [systemAvatarUrl, setSystemAvatarUrl] = useState('');

  // Step 2: First Alter Info
  const [alterName, setAlterName] = useState('');
  const [pronouns, setPronouns] = useState<string[]>(['they', 'them']);
  const [pronounInput, setPronounInput] = useState('');
  const [colorHex, setColorHex] = useState('#6366f1');
  const [alterAvatarUrl, setAlterAvatarUrl] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<AlterRole[]>(['Host']);
  const [ageAppearance, setAgeAppearance] = useState('');
  const [description, setDescription] = useState('Primary Host / Day Planner');

  if (!isOpen) return null;

  const toggleRole = (role: AlterRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleAddPronoun = () => {
    if (pronounInput.trim() && !pronouns.includes(pronounInput.trim().toLowerCase())) {
      setPronouns([...pronouns, pronounInput.trim().toLowerCase()]);
      setPronounInput('');
    }
  };

  const handleFinishSetup = () => {
    initializeNewSystem(systemName, tagline, systemAvatarUrl, {
      name: alterName.trim() || 'Host',
      pronouns: pronouns.length > 0 ? pronouns : ['they', 'them'],
      colorHex,
      avatarUrl: alterAvatarUrl,
      roles: selectedRoles.length > 0 ? selectedRoles : ['Host'],
      ageAppearance,
      description,
    });
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-indigo-950/60 to-purple-950/40 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Setup New System
              </h2>
              <p className="text-xs text-indigo-300">
                Start with a fresh, customized clean slate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[11px] ${
                step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'text-slate-100 font-semibold' : 'text-slate-500'}>
              System Details
            </span>
          </div>

          <div className="h-0.5 w-8 bg-slate-800" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[11px] ${
                step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'text-slate-100 font-semibold' : 'text-slate-500'}>
              First Alter / Host
            </span>
          </div>

          <div className="h-0.5 w-8 bg-slate-800" />

          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[11px] ${
                step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              3
            </span>
            <span className={step === 3 ? 'text-slate-100 font-semibold' : 'text-slate-500'}>
              Ready!
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* STEP 1: System Info */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  System Name *
                </label>
                <input
                  type="text"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  placeholder="e.g. The Kaleidoscope System, Solaris System..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  System Tagline / Motto
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Cooperative internal harmony and shared living"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* System Avatar */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  System Avatar Image (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/30 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                    {systemAvatarUrl ? (
                      <img
                        src={systemAvatarUrl}
                        alt="System Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-indigo-400" />
                    )}
                  </div>

                  <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-colors">
                    <Upload className="w-4 h-4" />
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
                            setSystemAvatarUrl(dataUrl);
                          } catch {
                            alert('Failed to process image file.');
                          }
                        }
                      }}
                    />
                  </label>

                  {systemAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setSystemAvatarUrl('')}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: First Alter */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alter / Member Name *
                  </label>
                  <input
                    type="text"
                    value={alterName}
                    onChange={(e) => setAlterName(e.target.value)}
                    placeholder="e.g. Alex, Maya, Sam..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Age Appearance (Optional)
                  </label>
                  <input
                    type="text"
                    value={ageAppearance}
                    onChange={(e) => setAgeAppearance(e.target.value)}
                    placeholder="e.g. 24, Teen, Ageless..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Signature Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Signature Color Theme</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColorHex(c)}
                      className={`w-7 h-7 rounded-xl border-2 transition-transform ${
                        colorHex === c ? 'scale-110 border-white ring-2 ring-indigo-500' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    title="Custom Color"
                  />
                </div>
              </div>

              {/* Alter Avatar */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alter Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-inner relative overflow-hidden ring-1 ring-white/20 shrink-0"
                    style={{ backgroundColor: colorHex }}
                  >
                    {alterAvatarUrl ? (
                      <img
                        src={alterAvatarUrl}
                        alt="Alter Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      alterName.slice(0, 2).toUpperCase() || '?'
                    )}
                  </div>

                  <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const dataUrl = await processImageFile(file);
                            setAlterAvatarUrl(dataUrl);
                          } catch {
                            alert('Failed to process image file.');
                          }
                        }
                      }}
                    />
                  </label>

                  {alterAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAlterAvatarUrl('')}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Roles */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  System Roles
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_ROLES.map((role) => {
                    const isSelected = selectedRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Responsibilities
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Notes on role, habits, or responsibilities..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Summary / Ready */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Ready to launch {systemName || 'your system'}!
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  We will configure your workspace with a shared Corkboard, a private desk for{' '}
                  <strong className="text-slate-200">{alterName || 'Host'}</strong>, and clean channels.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left max-w-md mx-auto space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">System:</span>
                  <span className="font-semibold text-slate-200">{systemName || 'My System'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">First Alter:</span>
                  <span className="font-semibold text-slate-200">{alterName || 'Host'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Roles:</span>
                  <span className="font-semibold text-slate-200">{selectedRoles.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Storage:</span>
                  <span className="font-semibold text-emerald-400">100% Offline & Private</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !systemName.trim()) {
                  alert('Please enter a system name.');
                  return;
                }
                if (step === 2 && !alterName.trim()) {
                  alert('Please enter a name for your first alter.');
                  return;
                }
                setStep((prev) => (prev + 1) as any);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishSetup}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              <span>Initialize System</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

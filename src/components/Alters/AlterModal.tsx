import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Alter, AlterRole } from '../../types';
import { useSystemStore } from '../../store/useSystemStore';
import { X, Sparkles, Shield, Lock, Radio, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { processImageFile } from '../../utils/imageUtils';

interface AlterModalProps {
  alter?: Alter | null;
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
  'Persecutor / Reformed',
  'Fragment',
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
  '#64748b', // Slate
  '#14b8a6', // Teal
];

export const AlterModal: React.FC<AlterModalProps> = ({ alter, onClose }) => {
  const { system, addAlter, updateAlter } = useSystemStore();

  const [name, setName] = useState(alter?.name || '');
  const [pronouns, setPronouns] = useState(
    alter?.pronouns && Array.isArray(alter.pronouns)
      ? alter.pronouns.join(', ')
      : 'they/them'
  );
  const [colorHex, setColorHex] = useState(alter?.colorHex || PRESET_COLORS[0]);
  const [avatarUrl, setAvatarUrl] = useState(alter?.avatarUrl || '');
  const [ageAppearance, setAgeAppearance] = useState(alter?.ageAppearance || '');
  const [description, setDescription] = useState(alter?.description || '');
  const [selectedRoles, setSelectedRoles] = useState<AlterRole[]>(
    alter?.roles && Array.isArray(alter.roles) ? alter.roles : ['Host']
  );

  // Sensory Anchors (Safe navigation)
  const [positiveTriggers, setPositiveTriggers] = useState(
    alter?.sensoryAnchors?.positiveTriggers && Array.isArray(alter.sensoryAnchors.positiveTriggers)
      ? alter.sensoryAnchors.positiveTriggers.join('\n')
      : ''
  );
  const [distressTriggers, setDistressTriggers] = useState(
    alter?.sensoryAnchors?.distressTriggers && Array.isArray(alter.sensoryAnchors.distressTriggers)
      ? alter.sensoryAnchors.distressTriggers.join('\n')
      : ''
  );

  // Security & Webhook Settings
  const [isVaultLocked, setIsVaultLocked] = useState(alter?.isVaultLocked || false);
  const [pinCode, setPinCode] = useState(alter?.pinCode || '');
  const [allowExternalBroadcast, setAllowExternalBroadcast] = useState(
    alter ? (alter.allowExternalBroadcast ?? true) : true
  );

  useEffect(() => {
    setName(alter?.name || '');
    setPronouns(
      alter?.pronouns && Array.isArray(alter.pronouns)
        ? alter.pronouns.join(', ')
        : 'they/them'
    );
    setColorHex(alter?.colorHex || PRESET_COLORS[0]);
    setAvatarUrl(alter?.avatarUrl || '');
    setAgeAppearance(alter?.ageAppearance || '');
    setDescription(alter?.description || '');
    setSelectedRoles(alter?.roles && Array.isArray(alter.roles) ? alter.roles : ['Host']);
    setPositiveTriggers(
      alter?.sensoryAnchors?.positiveTriggers && Array.isArray(alter.sensoryAnchors.positiveTriggers)
        ? alter.sensoryAnchors.positiveTriggers.join('\n')
        : ''
    );
    setDistressTriggers(
      alter?.sensoryAnchors?.distressTriggers && Array.isArray(alter.sensoryAnchors.distressTriggers)
        ? alter.sensoryAnchors.distressTriggers.join('\n')
        : ''
    );
    setIsVaultLocked(alter?.isVaultLocked || false);
    setPinCode(alter?.pinCode || '');
    setAllowExternalBroadcast(alter ? (alter.allowExternalBroadcast ?? true) : true);
  }, [alter]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleRole = (role: AlterRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPronouns = pronouns
      .split(/[\/, ]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const parsedPositive = positiveTriggers
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedDistress = distressTriggers
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const alterPayload = {
      systemId: system?.id || 'sys_1',
      name: name.trim(),
      pronouns: parsedPronouns.length > 0 ? parsedPronouns : ['they', 'them'],
      colorHex,
      avatarUrl: avatarUrl.trim() || undefined,
      roles: selectedRoles.length > 0 ? selectedRoles : ['Host' as AlterRole],
      ageAppearance: ageAppearance.trim() || undefined,
      description: description.trim() || undefined,
      sensoryAnchors: {
        positiveTriggers: parsedPositive,
        distressTriggers: parsedDistress,
      },
      isVaultLocked,
      pinCode: isVaultLocked ? pinCode : undefined,
      allowExternalBroadcast,
    };

    if (alter && alter.id) {
      updateAlter(alter.id, alterPayload);
    } else {
      addAlter(alterPayload);
    }
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded-full ring-2 ring-white/20"
              style={{ backgroundColor: colorHex }}
            />
            <h2 className="text-base font-semibold text-slate-100">
              {alter ? `Edit Alter: ${alter.name}` : 'Add New Alter / System Member'}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {/* Identity Basics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Name / Identity Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya, Alex, Sunny"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pronouns (comma or slash separated)
              </label>
              <input
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                placeholder="e.g. she/her, they/them"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Color & Avatar */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Signature Theme Color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColorHex(color)}
                  className={`w-7 h-7 rounded-lg transition-transform ${
                    colorHex === color
                      ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-md'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="flex items-center gap-1.5 ml-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  title="Custom Color"
                />
                <span className="text-xs text-slate-400 font-mono">{colorHex}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Avatar Profile Picture (Optional)
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-inner relative overflow-hidden ring-1 ring-white/20 shrink-0"
                  style={{ backgroundColor: colorHex }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    name.slice(0, 2).toUpperCase() || '?'
                  )}
                </div>

                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
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
                          setAvatarUrl(dataUrl);
                        } catch {
                          alert('Failed to process image.');
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
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Or paste web image URL..."
                className="w-full mt-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Age Appearance / Inner Age
              </label>
              <input
                type="text"
                value={ageAppearance}
                onChange={(e) => setAgeAppearance(e.target.value)}
                placeholder="e.g. 24, 7-8, Ageless"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* System Roles */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              System Roles (Select all that apply)
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
                        : 'bg-slate-800 text-slate-400 border border-slate-700/80 hover:text-slate-200'
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
              Internal Profile & Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this alter do? Any specific responsibilities or preferences?"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Sensory Anchors (Positive vs Distress) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Positive Sensory Anchors (1 per line)
              </label>
              <textarea
                rows={3}
                value={positiveTriggers}
                onChange={(e) => setPositiveTriggers(e.target.value)}
                placeholder="Peppermint tea&#10;Weighted blanket&#10;Lo-fi playlist&#10;Soft teddy bear"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono resize-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-1">
                <Shield className="w-3.5 h-3.5" />
                Distress Triggers to Avoid (1 per line)
              </label>
              <textarea
                rows={3}
                value={distressTriggers}
                onChange={(e) => setDistressTriggers(e.target.value)}
                placeholder="Sudden loud alarms&#10;Crowded stores&#10;Aggressive tone&#10;Fluorescent lights"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono resize-none"
              />
            </div>
          </div>

          {/* Privacy & Webhook Broadcast Controls */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Privacy & Integration Controls
            </h3>

            {/* Vault Lock */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Private Vault & PIN Protection</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Requires PIN code to open this alter's private board & journal
                </p>
              </div>
              <input
                type="checkbox"
                checked={isVaultLocked}
                onChange={(e) => setIsVaultLocked(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>

            {isVaultLocked && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Private 4-Digit PIN Code
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-32 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* External Broadcast Opt-In */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                  <Radio className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Allow External Switch Broadcast (Discord / Webhooks)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  When enabled, front switches to this alter can ping configured Discord/API webhooks.
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowExternalBroadcast}
                onChange={(e) => setAllowExternalBroadcast(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              {alter ? 'Save Changes' : 'Create Alter Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

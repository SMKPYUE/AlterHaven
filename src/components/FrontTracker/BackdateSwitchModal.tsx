import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSystemStore } from '../../store/useSystemStore';
import { FrontStatus } from '../../types';
import { X, Calendar, Clock, Zap, History, Sparkles } from 'lucide-react';

interface BackdateSwitchModalProps {
  onClose: () => void;
}

export const BackdateSwitchModal: React.FC<BackdateSwitchModalProps> = ({ onClose }) => {
  const { alters, logBackdatedSwitch } = useSystemStore();

  const now = new Date();
  // Default startedAt to 1 hour ago
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const formatDateTimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [alterId, setAlterId] = useState<string>(alters[0]?.id || '');
  const [status, setStatus] = useState<FrontStatus>('front');
  const [startedAtStr, setStartedAtStr] = useState<string>(formatDateTimeLocal(oneHourAgo));
  const [endedAtStr, setEndedAtStr] = useState<string>(formatDateTimeLocal(now));
  const [hasEnded, setHasEnded] = useState<boolean>(true);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alterId || !startedAtStr) return;

    const startedAt = new Date(startedAtStr).getTime();
    const endedAt = hasEnded && endedAtStr ? new Date(endedAtStr).getTime() : undefined;

    logBackdatedSwitch({
      alterId,
      status,
      startedAt,
      endedAt,
      energyLevel,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const selectedAlter = alters.find((a) => a.id === alterId);

  const modalContent = (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Log Past / Backdated Switch
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Alter Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Who Was Fronting? *
            </label>
            <select
              value={alterId}
              onChange={(e) => setAlterId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {alters.map((alter) => (
                <option key={alter.id} value={alter.id}>
                  {alter.name} ({alter.pronouns.join('/')}) - {alter.roles.join(', ')}
                </option>
              ))}
            </select>
          </div>

          {/* Front Consciousness Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Consciousness Role / State
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'front', label: 'Primary Front' },
                { id: 'co_front', label: 'Co-Fronting' },
                { id: 'co_conscious', label: 'Co-Conscious' },
                { id: 'lurking', label: 'Lurking / Passive' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatus(item.id as FrontStatus)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left ${
                    status === item.id
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Switch Start Date & Time *</span>
            </label>
            <input
              type="datetime-local"
              required
              value={startedAtStr}
              onChange={(e) => setStartedAtStr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          {/* End Date & Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Switch End Date & Time</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEnded}
                  onChange={(e) => setHasEnded(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Session Concluded</span>
              </label>
            </div>

            {hasEnded && (
              <input
                type="datetime-local"
                value={endedAtStr}
                onChange={(e) => setEndedAtStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            )}
          </div>

          {/* Energy Rating */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Energy Level During Front (1-10)</span>
              </label>
              <span className="text-xs font-bold text-amber-400 font-mono">{energyLevel} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Notes / Trigger */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Trigger / Activity Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Switched in during work presentation, triggered by positive music, study session"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              <span>Save Past Switch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

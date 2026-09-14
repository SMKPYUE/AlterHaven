import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSystemStore } from '../../store/useSystemStore';
import { X, CheckSquare, Clock, Users, AlertCircle } from 'lucide-react';

interface CreateTaskModalProps {
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose }) => {
  const { system, alters, activeFronts, addTask } = useSystemStore();

  const mainFrontId = activeFronts.find((f) => f.status === 'front')?.alterId || alters[0]?.id || '';
  const defaultAssigneeId = alters.find((a) => a.id !== mainFrontId)?.id || alters[0]?.id || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creatorAlterId, setCreatorAlterId] = useState(mainFrontId);
  const [assignedAlterId, setAssignedAlterId] = useState(defaultAssigneeId);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [preferredFrontTimeWindow, setPreferredFrontTimeWindow] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      systemId: system?.id || 'sys_1',
      creatorAlterId,
      assignedAlterId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      preferredFrontTimeWindow: preferredFrontTimeWindow.trim() || undefined,
      status: 'requested',
      isPrivate,
    });

    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Create Cross-Identity Mission / Task
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
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Task Title / Mission *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule doctor appointment, Buy groceries, Complete physics homework"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Alter Delegation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Requested By (Author)
              </label>
              <select
                value={creatorAlterId}
                onChange={(e) => setCreatorAlterId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {alters.map((alter) => (
                  <option key={alter.id} value={alter.id}>
                    {alter.name} ({alter.pronouns.join('/')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assigned Alter
              </label>
              <select
                value={assignedAlterId}
                onChange={(e) => setAssignedAlterId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {alters.map((alter) => (
                  <option key={alter.id} value={alter.id}>
                    {alter.name} ({alter.pronouns.join('/')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Details / Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Context, Instructions & Safety Boundaries
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this assigned? Any special boundaries or instructions for when you switch in?"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Preferred Front Time Window */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Preferred Fronting Time Window (Optional)
            </label>
            <input
              type="text"
              value={preferredFrontTimeWindow}
              onChange={(e) => setPreferredFrontTimeWindow(e.target.value)}
              placeholder="e.g. Thursday morning, When calm and alone, Weekend"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                    priority === p
                      ? p === 'urgent'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                        : p === 'high'
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Private Task Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <label htmlFor="isPrivate" className="text-xs text-slate-300 cursor-pointer">
              Private / Secret Mission (Only visible to Author & Assignee)
            </label>
          </div>

          {/* Footer Buttons */}
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
              Request Task Handoff
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

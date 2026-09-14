import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Vote, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import type { PollCategory, PollOption } from '../../types';

interface CreatePollModalProps {
  onClose: () => void;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({ onClose }) => {
  const { alters, activeFronts, createPoll } = useSystemStore();

  const currentFrontAlterId =
    activeFronts.find((f) => f.status === 'front')?.alterId || alters[0]?.id || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PollCategory>('general');
  const [creatorAlterId, setCreatorAlterId] = useState(currentFrontAlterId);
  const [allowVeto, setAllowVeto] = useState(true);
  const [options, setOptions] = useState<string[]>([
    'Option 1',
    'Option 2',
  ]);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, `Option ${options.length + 1}`]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const defaultOptionColors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formattedOptions: PollOption[] = options
      .filter((opt) => opt.trim().length > 0)
      .map((opt, idx) => ({
        id: 'opt_' + idx + '_' + Date.now(),
        text: opt.trim(),
        color: defaultOptionColors[idx % defaultOptionColors.length],
      }));

    if (formattedOptions.length < 2) return;

    createPoll({
      systemId: 'sys_1',
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      creatorAlterId,
      options: formattedOptions,
      allowVeto,
      status: 'active',
    });

    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Create System Decision Poll</h2>
              <p className="text-xs text-slate-400">
                Collect system votes, alter opinions, and reach consensus.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Decision Question / Topic *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Should we dye our hair emerald green?"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Context / Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide context, budget limits, or timelines..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PollCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="general">🗳️ General System Decision</option>
                <option value="appearance">💇 Appearance & Hair/Clothes</option>
                <option value="financial">💰 Large Purchase / Budget</option>
                <option value="social">👥 Social Plans & Outings</option>
                <option value="schedule">📅 Time / Front Scheduling</option>
                <option value="inner_world">🌌 Inner World Dynamics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Proposed By
              </label>
              <select
                value={creatorAlterId}
                onChange={(e) => setCreatorAlterId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {alters.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.roles.join(', ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Poll Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Voting Options (2 to 6)
              </label>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Choice</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: defaultOptionColors[idx % defaultOptionColors.length] }}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Veto Option */}
          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={allowVeto}
              onChange={(e) => setAllowVeto(e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-slate-900 border-slate-700"
            />
            <div className="text-xs">
              <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Enable Safety / Protector Veto</span>
              </span>
              <p className="text-slate-400">
                Allows any alter (especially protectors) to raise a safety veto with an explanation.
              </p>
            </div>
          </label>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20"
            >
              Launch Decision Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

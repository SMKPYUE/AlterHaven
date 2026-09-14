import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen } from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import type { RuleCategory, RuleSeverity, SystemRule } from '../../types';

interface AddRuleModalProps {
  onClose: () => void;
  ruleToEdit?: SystemRule | null;
}

export const AddRuleModal: React.FC<AddRuleModalProps> = ({ onClose, ruleToEdit }) => {
  const { alters, activeFronts, addRule, updateRule } = useSystemStore();

  const currentFrontAlterId =
    activeFronts.find((f) => f.status === 'front')?.alterId || alters[0]?.id || '';

  const [title, setTitle] = useState(ruleToEdit?.title || '');
  const [description, setDescription] = useState(ruleToEdit?.description || '');
  const [category, setCategory] = useState<RuleCategory>(ruleToEdit?.category || 'safety');
  const [severity, setSeverity] = useState<RuleSeverity>(ruleToEdit?.severity || 'critical');
  const [creatorAlterId, setCreatorAlterId] = useState(
    ruleToEdit?.creatorAlterId || currentFrontAlterId
  );
  const [isLocked, setIsLocked] = useState(ruleToEdit?.isLocked ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (ruleToEdit) {
      updateRule(ruleToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        creatorAlterId,
        isLocked,
      });
    } else {
      addRule({
        systemId: 'sys_1',
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        creatorAlterId,
        isLocked,
      });
    }
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
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {ruleToEdit ? 'Edit System Rule / Agreement' : 'New System Agreement / Boundary'}
              </h2>
              <p className="text-xs text-slate-400">
                Establish consensus, safety boundaries, and house protocols.
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
              Agreement Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Spending Limit Over $50, Bedtime Wind-Down"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description & Full Stipulations
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Detail the exact boundary, exception rules, or steps to follow..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RuleCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="safety">🛡️ Safety & Protection</option>
                <option value="finances">💰 Finances & Purchases</option>
                <option value="fronting">🎭 Fronting & Masking</option>
                <option value="health">💊 Health & Sleep</option>
                <option value="inner_world">🌌 Inner World & Privacy</option>
                <option value="general">📜 General House Rule</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as RuleSeverity)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="critical">🔴 Critical (Strict Boundary)</option>
                <option value="standard">🟡 Standard Agreement</option>
                <option value="guideline">🟢 General Guideline</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Proposed By
            </label>
            <select
              value={creatorAlterId}
              onChange={(e) => setCreatorAlterId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {alters.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.roles.join(', ')})
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-200">System Protected Agreement</span>
              <p className="text-slate-400">
                Marks as a protected rule that cannot be casually modified without discussion.
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
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20"
            >
              {ruleToEdit ? 'Save Changes' : 'Publish Agreement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

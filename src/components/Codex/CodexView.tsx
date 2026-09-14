import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Tag,
  MessageSquareQuote,
  Filter,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { AddRuleModal } from './AddRuleModal';
import type { RuleCategory, SystemRule } from '../../types';

export const CodexView: React.FC = () => {
  const { rules, alters, activeFronts, acknowledgeRule, deleteRule } = useSystemStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<SystemRule | null>(null);
  const [stipulationInput, setStipulationInput] = useState<{ [ruleId: string]: string }>({});
  const [editingStipulationRuleId, setEditingStipulationRuleId] = useState<string | null>(null);

  const currentFrontAlterId =
    activeFronts.find((f) => f.status === 'front')?.alterId || alters[0]?.id || '';
  const currentFrontAlter = alters.find((a) => a.id === currentFrontAlterId);

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Agreements', icon: '📜' },
    { id: 'safety', label: 'Safety & Protection', icon: '🛡️' },
    { id: 'finances', label: 'Finances & Purchases', icon: '💰' },
    { id: 'fronting', label: 'Fronting & Masking', icon: '🎭' },
    { id: 'health', label: 'Health & Sleep', icon: '💊' },
    { id: 'inner_world', label: 'Inner World', icon: '🌌' },
    { id: 'general', label: 'General Rules', icon: '📋' },
  ];

  const filteredRules = rules.filter((rule) => {
    if (selectedCategory === 'all') return true;
    return rule.category === selectedCategory;
  });

  const criticalCount = rules.filter((r) => r.severity === 'critical').length;
  const signedByMeCount = rules.filter(
    (r) => r.acknowledgements[currentFrontAlterId]?.acknowledged
  ).length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wider uppercase mb-2">
              <BookOpen className="w-4 h-4" />
              <span>System Constitution & Agreements</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100">
              The System Codex
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Explicit boundaries, house rules, and mutual covenants established across all alters.
              Sign off as the current fronting identity to maintain system transparency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setRuleToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Agreement</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5">
            <div className="text-xs text-slate-400 font-medium">Total Agreements</div>
            <div className="text-xl font-bold text-slate-100 mt-0.5">{rules.length}</div>
          </div>
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5">
            <div className="text-xs text-slate-400 font-medium">Signed by {currentFrontAlter?.name || 'Active Front'}</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {signedByMeCount} / {rules.length}
            </div>
          </div>
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5 col-span-2 sm:col-span-1">
            <div className="text-xs text-slate-400 font-medium">Critical Boundaries</div>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{criticalCount}</div>
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRules.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">No agreements found in this category.</p>
            <button
              onClick={() => {
                setRuleToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="mt-4 px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-xl hover:bg-amber-500/30"
            >
              Add First Agreement
            </button>
          </div>
        ) : (
          filteredRules.map((rule) => {
            const creator = alters.find((a) => a.id === rule.creatorAlterId);
            const myAck = rule.acknowledgements[currentFrontAlterId];
            const signedAltersCount = Object.values(rule.acknowledgements).filter(
              (a) => a.acknowledged
            ).length;
            const isCritical = rule.severity === 'critical';

            return (
              <div
                key={rule.id}
                className={`bg-slate-900/90 border rounded-2xl p-5 md:p-6 transition-all relative overflow-hidden shadow-lg ${
                  isCritical
                    ? 'border-rose-500/30 hover:border-rose-500/50 shadow-rose-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Severity Ribbon */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                        rule.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : rule.severity === 'standard'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {rule.severity}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                      {rule.category}
                    </span>

                    {rule.isLocked && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Protected</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setRuleToEdit(rule);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
                      title="Edit Rule"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!rule.isLocked && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this system agreement?')) {
                            deleteRule(rule.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div className="mt-3">
                  <h3 className="text-base md:text-lg font-bold text-slate-100">{rule.title}</h3>
                  <p className="text-xs md:text-sm text-slate-300 mt-1.5 leading-relaxed whitespace-pre-line">
                    {rule.description}
                  </p>
                </div>

                {/* Alter Acknowledgements Progress & Signatures */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">System Signatures</span>
                    <span className="text-slate-300 font-bold">
                      {signedAltersCount} / {alters.length} alters confirmed
                    </span>
                  </div>

                  {/* Signatures Avatar Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    {alters.map((alter) => {
                      const ack = rule.acknowledgements[alter.id];
                      const isSigned = ack?.acknowledged;
                      return (
                        <div
                          key={alter.id}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                            isSigned
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                              : 'bg-slate-950/60 border-slate-800 text-slate-500'
                          }`}
                          title={
                            isSigned
                              ? `${alter.name} signed${ack.comment ? `: "${ack.comment}"` : ''}`
                              : `${alter.name} has not signed yet`
                          }
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                            style={{ backgroundColor: alter.colorHex }}
                          >
                            {alter.name.slice(0, 1)}
                          </div>
                          <span className="font-medium text-[11px]">{alter.name}</span>
                          {isSigned ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Comments / Stipulations from alters */}
                  {Object.values(rule.acknowledgements).some((a) => a.comment) && (
                    <div className="mt-3 space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                        <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" />
                        <span>Alter Stipulations & Notes:</span>
                      </div>
                      {Object.values(rule.acknowledgements)
                        .filter((a) => a.comment)
                        .map((a) => {
                          const author = alters.find((alt) => alt.id === a.alterId);
                          return (
                            <div key={a.alterId} className="text-xs text-slate-300 flex items-baseline gap-2">
                              <span
                                className="font-semibold"
                                style={{ color: author?.colorHex || '#94a3b8' }}
                              >
                                {author?.name || 'Alter'}:
                              </span>
                              <span className="italic text-slate-300">"{a.comment}"</span>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Active Front Alter Sign Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-400">
                      Proposed by <span className="text-slate-200 font-semibold">{creator?.name || 'System'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {editingStipulationRuleId === rule.id ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Add your stipulation / condition..."
                            value={stipulationInput[rule.id] || ''}
                            onChange={(e) =>
                              setStipulationInput({ ...stipulationInput, [rule.id]: e.target.value })
                            }
                            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                          <button
                            onClick={() => {
                              acknowledgeRule(
                                rule.id,
                                currentFrontAlterId,
                                stipulationInput[rule.id]?.trim() || undefined
                              );
                              setEditingStipulationRuleId(null);
                            }}
                            className="px-3 py-1.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl"
                          >
                            Save & Sign
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingStipulationRuleId(rule.id)}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-xl"
                          >
                            Add Stipulation
                          </button>
                          <button
                            onClick={() =>
                              acknowledgeRule(
                                rule.id,
                                currentFrontAlterId,
                                myAck?.comment
                              )
                            }
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              myAck?.acknowledged
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                            }`}
                          >
                            {myAck?.acknowledged ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Signed as {currentFrontAlter?.name || 'Front'}</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Sign as {currentFrontAlter?.name || 'Front'}</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <AddRuleModal
          ruleToEdit={ruleToEdit}
          onClose={() => {
            setIsAddModalOpen(false);
            setRuleToEdit(null);
          }}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import {
  History,
  Activity,
  Users,
  Clock,
  Zap,
  TrendingUp,
  Sparkles,
  Calendar,
  Filter,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import { BackdateSwitchModal } from './BackdateSwitchModal';

interface FrontTrackerViewProps {
  onOpenFrontModal: () => void;
}

export const FrontTrackerView: React.FC<FrontTrackerViewProps> = ({ onOpenFrontModal }) => {
  const { alters, activeFronts, frontLogs, deleteFrontLog } = useSystemStore();

  const [filterAlterId, setFilterAlterId] = useState<string>('all');
  const [isBackdateModalOpen, setIsBackdateModalOpen] = useState(false);

  const mainFrontMember = activeFronts.find((f) => f.status === 'front');
  const mainFrontAlter = alters.find((a) => a.id === mainFrontMember?.alterId);
  const coFrontMembers = activeFronts.filter((f) => f.alterId !== mainFrontMember?.alterId);

  const filteredLogs = frontLogs.filter((log) =>
    filterAlterId === 'all' ? true : log.alterId === filterAlterId
  );

  // Front Distribution stats calculation (approximate from logs)
  const alterCounts: Record<string, number> = {};
  frontLogs.forEach((l) => {
    alterCounts[l.alterId] = (alterCounts[l.alterId] || 0) + 1;
  });
  const totalLogCount = frontLogs.length || 1;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Fronting Tracker & Pattern Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time consciousness tracking, switch history, and internal cooperation metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsBackdateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Log Past Switch</span>
          </button>
          <button
            onClick={onOpenFrontModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Activity className="w-4 h-4" />
            <span>Record / Switch Front</span>
          </button>
        </div>
      </div>

      {/* Active Front Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main Fronting Alter */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Primary Front
              </span>

              {mainFrontAlter ? (
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-xl ring-2 ring-white/20 relative overflow-hidden"
                    style={{ backgroundColor: mainFrontAlter.colorHex }}
                  >
                    {mainFrontAlter.avatarUrl ? (
                      <img src={mainFrontAlter.avatarUrl} alt={mainFrontAlter.name} className="w-full h-full object-cover" />
                    ) : (
                      mainFrontAlter.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{mainFrontAlter.name}</h3>
                    <p className="text-xs text-slate-400">{mainFrontAlter.pronouns.join('/')}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mainFrontAlter.roles.map((r) => (
                        <span key={r} className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No primary front logged.</p>
              )}
            </div>

            {mainFrontMember && (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-right">
                <span className="text-[10px] text-slate-500 block">Session Started</span>
                <span className="text-xs font-mono font-semibold text-slate-200">
                  {new Date(mainFrontMember.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>

          {/* Co-Front Members */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Co-Conscious / Lurking Members:
            </span>
            {coFrontMembers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {coFrontMembers.map((member) => {
                  const alter = alters.find((a) => a.id === member.alterId);
                  if (!alter) return null;
                  return (
                    <div
                      key={member.alterId}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: alter.colorHex }}
                      />
                      <span className="font-medium text-slate-200">{alter.name}</span>
                      <span className="text-[10px] text-slate-400">({member.status})</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs text-slate-500">Solo fronting (no co-conscious members)</span>
            )}
          </div>
        </div>

        {/* Front Distribution Overview */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              Front Frequency Breakdown
            </span>

            <div className="space-y-2.5">
              {alters.map((alter) => {
                const count = alterCounts[alter.id] || 0;
                const pct = Math.round((count / totalLogCount) * 100);

                return (
                  <div key={alter.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">{alter.name}</span>
                      <span className="text-slate-400 font-mono">{pct}% ({count} switches)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: alter.colorHex }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Switch History Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Switch Log & Consciousness Timeline</span>
          </h3>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterAlterId}
              onChange={(e) => setFilterAlterId(e.target.value)}
              className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Alters ({frontLogs.length})</option>
              {alters.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline list */}
        <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {filteredLogs.map((log) => {
            const alter = alters.find((a) => a.id === log.alterId);
            if (!alter) return null;

            return (
              <div key={log.id} className="relative flex items-start gap-4 pl-1">
                {/* Node icon */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md ring-4 ring-slate-900 z-10 shrink-0 mt-0.5"
                  style={{ backgroundColor: alter.colorHex }}
                >
                  {alter.name.slice(0, 1)}
                </div>

                {/* Log Details Box */}
                <div className="flex-1 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{alter.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-300 uppercase tracking-wider">
                        {log.status}
                      </span>
                      {log.energyLevel && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-0.5 font-mono">
                          <Zap className="w-3 h-3" /> {log.energyLevel}/10
                        </span>
                      )}
                    </div>
                    {log.notes && (
                      <p className="text-xs text-slate-400 mt-1 italic">"{log.notes}"</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="text-[11px] text-slate-500 sm:text-right">
                      <div>{new Date(log.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                      <div className="font-mono">
                        {new Date(log.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete front log for ${alter.name}?`)) {
                          deleteFrontLog(log.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isBackdateModalOpen && (
        <BackdateSwitchModal onClose={() => setIsBackdateModalOpen(false)} />
      )}
    </div>
  );
};

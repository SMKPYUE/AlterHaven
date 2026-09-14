import React from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import {
  Sparkles,
  X,
  Clock,
  Heart,
  Droplets,
  Zap,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HandoffBriefingModalProps {
  alterId: string;
  onClose: () => void;
}

export const HandoffBriefingModal: React.FC<HandoffBriefingModalProps> = ({
  alterId,
  onClose,
}) => {
  const { alters, tasks, frontLogs, bodyNeeds, messages, widgets, updateTaskStatus } = useSystemStore();

  const alter = alters.find((a) => a.id === alterId);

  // Calculate last front time
  const previousLogs = frontLogs.filter((l) => l.alterId === alterId && l.endedAt);
  const lastFrontLog = previousLogs.length > 0 ? previousLogs[0] : null;

  const getAwayTimeText = () => {
    if (!lastFrontLog || !lastFrontLog.endedAt) return 'Welcome to your front session!';
    const diffMs = Date.now() - lastFrontLog.endedAt;
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    if (hours > 0) return `You last fronted ${hours} hour${hours > 1 ? 's' : ''} and ${mins} min ago.`;
    return `You last fronted ${mins} minutes ago.`;
  };

  // Pending tasks requested for this alter
  const pendingTasks = tasks.filter(
    (t) => t.assignedAlterId === alterId && t.status === 'requested'
  );

  // Urgent ribbons on corkboard
  const urgentRibbons = widgets.filter((w) => w.type === 'urgent_ribbon');

  // Recent 3 chat messages
  const recentChat = messages.slice(-3);

  const handleDismiss = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // safe fallback
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Banner Header */}
        <div
          className="p-6 text-white relative overflow-hidden shrink-0"
          style={{
            background: `linear-gradient(135deg, ${alter?.colorHex || '#6366f1'}cc, #0f172a 90%)`,
          }}
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-xl ring-2 ring-white/30"
                style={{ backgroundColor: alter?.colorHex }}
              >
                {alter?.avatarUrl ? (
                  <img src={alter.avatarUrl} alt={alter.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  alter?.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                    Switch-In Handoff Briefing
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <h2 className="text-lg font-bold text-white">
                  Welcome back, {alter?.name}!
                </h2>
                <p className="text-xs text-indigo-100/80 mt-0.5">{getAwayTimeText()}</p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Briefing Sections Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* 1. Body Maintenance & Vitals */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Body Status Check</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Updated {new Date(bodyNeeds.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-center">
                <span className="text-slate-400 text-[10px] block">Energy Level</span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  {bodyNeeds.energyScore}/10
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-center">
                <span className="text-slate-400 text-[10px] block">Hydration</span>
                <span className="text-base font-bold text-sky-400 font-mono">
                  {bodyNeeds.hydrationScore}/10
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-center">
                <span className="text-slate-400 text-[10px] block">Sensory Load</span>
                <span className="text-base font-bold text-indigo-400 font-mono">
                  {bodyNeeds.sensoryOverloadScore}/10
                </span>
              </div>
            </div>

            {/* Meds Status */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-300">
              <span>Medications taken today:</span>
              <span className="font-semibold text-emerald-400">
                {bodyNeeds.medications.filter((m) => m.takenToday).map((m) => m.name).join(', ') || 'None logged yet'}
              </span>
            </div>
          </div>

          {/* 2. Tasks Requested Specifically for this Alter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Tasks Requested For You ({pendingTasks.length})</span>
              </h3>
            </div>

            {pendingTasks.length > 0 ? (
              <div className="space-y-2">
                {pendingTasks.map((t) => {
                  const creator = alters.find((a) => a.id === t.creatorAlterId);
                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">{t.title}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-700 text-slate-300">
                            by {creator?.name || 'Alter'}
                          </span>
                        </div>
                        {t.description && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateTaskStatus(t.id, 'accepted', alterId)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() =>
                            updateTaskStatus(
                              t.id,
                              'declined',
                              alterId,
                              'Declined during switch-in handoff briefing'
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-400 text-center">
                ✨ No pending task requests right now. Enjoy your front!
              </div>
            )}
          </div>

          {/* 3. Urgent Corkboard Pins (if any) */}
          {urgentRibbons.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Urgent Board Ribbons</span>
              </h3>
              {urgentRibbons.map((ribbon) => (
                <div
                  key={ribbon.id}
                  className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200"
                >
                  <p className="font-bold text-xs">{ribbon.title}</p>
                  <p className="text-[11px] text-rose-300/90 mt-0.5">{ribbon.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* 4. Recent Inner Chat Catchup */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Recent Inner Messages</span>
            </h3>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              {recentChat.map((msg) => {
                const sender = alters.find((a) => a.id === msg.senderAlterId);
                return (
                  <div key={msg.id} className="flex items-start gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 mt-0.5"
                      style={{ backgroundColor: sender?.colorHex || '#6366f1' }}
                    >
                      {sender?.name.slice(0, 1) || 'A'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-300 mr-1.5">{sender?.name}:</span>
                      <span className="text-slate-400">{msg.content}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end shrink-0">
          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

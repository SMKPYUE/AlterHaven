import React, { useState } from 'react';
import { Task, TaskNegotiationStatus } from '../../types';
import { useSystemStore } from '../../store/useSystemStore';
import {
  CheckSquare,
  Clock,
  UserCheck,
  AlertCircle,
  XCircle,
  CheckCircle2,
  ArrowRight,
  Pin,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Trash2,
  Share2,
  Repeat,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onOpenDeclineModal: (task: Task) => void;
  onOpenHandoffModal: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onOpenDeclineModal,
  onOpenHandoffModal,
}) => {
  const { alters, activeFronts, updateTaskStatus, deleteTask, activeBoardId, addWidget } = useSystemStore();

  const [showHistory, setShowHistory] = useState(false);

  const creator = alters.find((a) => a.id === task.creatorAlterId);
  const assignee = alters.find((a) => a.id === task.assignedAlterId);
  const mainFrontId = activeFronts.find((f) => f.status === 'front')?.alterId;

  const isAssignedToCurrentFront = mainFrontId === task.assignedAlterId;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'medium':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusBadge = (status: TaskNegotiationStatus) => {
    switch (status) {
      case 'requested':
        return { label: 'Pending Request', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'accepted':
        return { label: 'Accepted', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      case 'in_progress':
        return { label: 'In Progress', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'needs_handoff':
        return { label: 'Needs Handoff', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' };
      case 'declined':
        return { label: 'Declined', bg: 'bg-red-950/60 text-red-400 border-red-800/40' };
      case 'completed':
        return { label: 'Completed', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      default:
        return { label: status, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const handlePinToCorkboard = () => {
    addWidget({
      boardId: activeBoardId,
      authorAlterId: task.creatorAlterId,
      type: 'sticky_note',
      position: { x: 80, y: 80, zIndex: 10, rotation: 1 },
      size: { width: 300, height: 180 },
      color: '#fef3c7',
      title: `📋 Mission: ${task.title}`,
      content: `Assigned: ${assignee?.name || 'Alter'}\nPreferred Time: ${task.preferredFrontTimeWindow || 'Any'}\nStatus: ${task.status}`,
      isPinned: true,
    });
    alert('Task successfully pinned to the active Corkboard!');
  };

  const statusInfo = getStatusBadge(task.status);

  return (
    <div
      className={`bg-slate-900 border rounded-2xl p-4.5 flex flex-col justify-between transition-all hover:border-slate-700 shadow-lg relative overflow-hidden ${
        task.status === 'completed'
          ? 'border-slate-800/60 opacity-80'
          : task.status === 'needs_handoff'
          ? 'border-rose-500/50 ring-1 ring-rose-500/30'
          : 'border-slate-800'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getPriorityBadge(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusInfo.bg}`}
            >
              {statusInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePinToCorkboard}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
              title="Pin Mission to Corkboard"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this task?')) deleteTask(task.id);
              }}
              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task Title */}
        <h3
          className={`text-sm font-bold text-slate-100 mb-1.5 leading-snug ${
            task.status === 'completed' ? 'line-through text-slate-400' : ''
          }`}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Delegation Flow: Creator -> Assignee */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3 text-xs">
          {/* Creator */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ backgroundColor: creator?.colorHex || '#64748b' }}
            >
              {creator?.name.slice(0, 1) || 'A'}
            </div>
            <span className="text-[11px] text-slate-400 truncate">{creator?.name || 'System'}</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          {/* Assignee */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ backgroundColor: assignee?.colorHex || '#64748b' }}
            >
              {assignee?.name.slice(0, 1) || 'A'}
            </div>
            <span className="text-[11px] font-semibold text-slate-200 truncate">
              {assignee?.name || 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Time Window Details */}
        {task.preferredFrontTimeWindow && (
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-300/90 mb-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Target Front: <strong>{task.preferredFrontTimeWindow}</strong></span>
          </div>
        )}

        {/* Decline Reason Banner if present */}
        {task.status === 'declined' && task.declineReason && (
          <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-200 mb-3">
            <div className="flex items-center gap-1 font-semibold text-red-300 mb-0.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Decline Reason / Negotiation Note:</span>
            </div>
            <p className="text-[11px] text-red-200/90 italic">"{task.declineReason}"</p>
          </div>
        )}
      </div>

      {/* Task Negotiation Action Bar */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        {/* Actions when Requested */}
        {task.status === 'requested' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateTaskStatus(task.id, 'accepted', mainFrontId || task.assignedAlterId)}
              className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Accept Mission</span>
            </button>
            <button
              onClick={() => onOpenDeclineModal(task)}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              Decline / Reason
            </button>
          </div>
        )}

        {/* Actions when Accepted */}
        {task.status === 'accepted' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateTaskStatus(task.id, 'in_progress', mainFrontId || task.assignedAlterId)}
              className="flex-1 py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Start (In Progress)</span>
            </button>
            <button
              onClick={() => updateTaskStatus(task.id, 'completed', mainFrontId || task.assignedAlterId)}
              className="py-1.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-colors"
            >
              Mark Done
            </button>
          </div>
        )}

        {/* Actions when In Progress */}
        {task.status === 'in_progress' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateTaskStatus(task.id, 'completed', mainFrontId || task.assignedAlterId)}
              className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete Mission</span>
            </button>
            <button
              onClick={() => onOpenHandoffModal(task)}
              className="py-1.5 px-3 rounded-xl bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 text-xs font-medium border border-rose-800/50 transition-colors flex items-center gap-1"
              title="Request another alter to take over"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Handoff</span>
            </button>
          </div>
        )}

        {/* Actions when Needs Handoff */}
        {task.status === 'needs_handoff' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                updateTaskStatus(
                  task.id,
                  'in_progress',
                  mainFrontId || alters[0].id,
                  'Taken over during front switch'
                )
              }
              className="flex-1 py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-all flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Take Over Mission</span>
            </button>
          </div>
        )}

        {/* Handoff History Toggle */}
        {task.handoffHistory && task.handoffHistory.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between text-[10px] text-slate-500 hover:text-slate-400 py-0.5"
            >
              <span>Negotiation Trail ({task.handoffHistory.length} events)</span>
              {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showHistory && (
              <div className="mt-1.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-[10px]">
                {task.handoffHistory.map((h) => {
                  const author = alters.find((a) => a.id === h.fromAlterId);
                  return (
                    <div key={h.id} className="text-slate-400 border-l-2 border-indigo-500/40 pl-1.5 py-0.5">
                      <span className="font-semibold text-slate-200">{author?.name || 'Alter'}:</span>{' '}
                      {h.notes || h.action}{' '}
                      <span className="text-slate-600">
                        ({new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

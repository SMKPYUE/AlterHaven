import React, { useState } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';
import {
  CheckSquare,
  Plus,
  Filter,
  Users,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  X,
  Repeat,
} from 'lucide-react';

export const TaskManager: React.FC = () => {
  const { tasks, alters, activeFronts, updateTaskStatus } = useSystemStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'my_requests' | 'in_progress' | 'handoffs' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Decline Modal State
  const [decliningTask, setDecliningTask] = useState<Task | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [suggestedReassignAlterId, setSuggestedReassignAlterId] = useState('');

  // Handoff Modal State
  const [handoffTask, setHandoffTask] = useState<Task | null>(null);
  const [handoffNotes, setHandoffNotes] = useState('');
  const [handoffToAlterId, setHandoffToAlterId] = useState('');

  const mainFrontAlter = alters.find((a) => a.id === activeFronts.find((f) => f.status === 'front')?.alterId);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'my_requests') {
      return mainFrontAlter
        ? (task.assignedAlterId === mainFrontAlter.id || task.assignedAlterId === 'anyone') && task.status === 'requested'
        : task.status === 'requested';
    }
    if (activeFilter === 'in_progress') {
      return task.status === 'in_progress' || task.status === 'accepted';
    }
    if (activeFilter === 'handoffs') {
      return task.status === 'needs_handoff';
    }
    if (activeFilter === 'completed') {
      return task.status === 'completed';
    }
    return true;
  });

  const handleConfirmDecline = () => {
    if (!decliningTask) return;
    updateTaskStatus(
      decliningTask.id,
      'declined',
      mainFrontAlter?.id || decliningTask.assignedAlterId,
      declineReason.trim() || 'Declined due to energy / boundary constraints',
      suggestedReassignAlterId || undefined
    );
    setDecliningTask(null);
    setDeclineReason('');
    setSuggestedReassignAlterId('');
  };

  const handleConfirmHandoff = () => {
    if (!handoffTask) return;
    updateTaskStatus(
      handoffTask.id,
      'needs_handoff',
      mainFrontAlter?.id || handoffTask.assignedAlterId,
      handoffNotes.trim() || 'Front switch occurred; requesting takeover',
      handoffToAlterId || undefined
    );
    setHandoffTask(null);
    setHandoffNotes('');
    setHandoffToAlterId('');
  };

  const requestedCount = tasks.filter((t) => t.status === 'requested').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress' || t.status === 'accepted').length;
  const handoffCount = tasks.filter((t) => t.status === 'needs_handoff').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-400" />
            <span>Cross-Identity Mission & Task Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Delegate responsibilities across fronting schedules with structured negotiation & handoffs.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Mission Request</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Missions ({tasks.length})
          </button>

          <button
            onClick={() => setActiveFilter('my_requests')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'my_requests'
                ? 'bg-amber-500 text-slate-950 shadow font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Requested ({requestedCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeFilter === 'in_progress'
                ? 'bg-sky-600 text-white shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            In Progress ({inProgressCount})
          </button>

          <button
            onClick={() => setActiveFilter('handoffs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'handoffs'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Needs Handoff ({handoffCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search missions..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onOpenDeclineModal={(t) => setDecliningTask(t)}
            onOpenHandoffModal={(t) => setHandoffTask(t)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No missions found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Create a task above to request cooperation from another alter.
          </p>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <CreateTaskModal onClose={() => setIsCreateModalOpen(false)} />
      )}

      {/* Decline Reason Modal */}
      {decliningTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Decline / Propose Alternative</h3>
              <button
                onClick={() => setDecliningTask(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Please explain why you cannot take <strong>"{decliningTask.title}"</strong> so the system can adapt or reassign.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reason / Feedback *
              </label>
              <textarea
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g. Phone calls cause high distress; please make it an email task or reassign to Maya."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Suggest Reassignment To (Optional)
              </label>
              <select
                value={suggestedReassignAlterId}
                onChange={(e) => setSuggestedReassignAlterId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- No suggestion --</option>
                {alters.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDecliningTask(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecline}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow"
              >
                Submit Decline & Reason
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handoff Modal */}
      {handoffTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <Repeat className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-100">Request Sudden Handoff</h3>
              </div>
              <button
                onClick={() => setHandoffTask(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Flag <strong>"{handoffTask.title}"</strong> as incomplete due to unexpected switch, fatigue, or sensory limits.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Handoff Note for Next Fronting Alter
              </label>
              <textarea
                rows={3}
                value={handoffNotes}
                onChange={(e) => setHandoffNotes(e.target.value)}
                placeholder="e.g. Completed questions 1 and 2, but feeling dizzy. Please finish question 3 when possible!"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setHandoffTask(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHandoff}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow"
              >
                Flag for Handoff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

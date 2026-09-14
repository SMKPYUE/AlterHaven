import React, { useState } from 'react';
import {
  Vote,
  Plus,
  CheckCircle2,
  ShieldAlert,
  Archive,
  MessageSquare,
  Sparkles,
  Trash2,
  Check,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { CreatePollModal } from './CreatePollModal';
import type { PollCategory, SystemPoll } from '../../types';

export const PollsView: React.FC = () => {
  const { polls, alters, activeFronts, castVote, resolvePoll, deletePoll } = useSystemStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('active');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [voteComments, setVoteComments] = useState<{ [pollId: string]: string }>({});
  const [activeCommentInputPollId, setActiveCommentInputPollId] = useState<string | null>(null);

  const currentFrontAlterId =
    activeFronts.find((f) => f.status === 'front')?.alterId || alters[0]?.id || '';
  const currentFrontAlter = alters.find((a) => a.id === currentFrontAlterId);

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Polls', icon: '🗳️' },
    { id: 'appearance', label: 'Appearance', icon: '💇' },
    { id: 'financial', label: 'Finances', icon: '💰' },
    { id: 'social', label: 'Social Plans', icon: '👥' },
    { id: 'schedule', label: 'Schedules', icon: '📅' },
    { id: 'inner_world', label: 'Inner World', icon: '🌌' },
    { id: 'general', label: 'General', icon: '📋' },
  ];

  const filteredPolls = polls.filter((poll) => {
    if (statusFilter !== 'all' && poll.status !== statusFilter) return false;
    if (selectedCategory !== 'all' && poll.category !== selectedCategory) return false;
    return true;
  });

  const activePollsCount = polls.filter((p) => p.status === 'active').length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-wider uppercase mb-2">
              <Vote className="w-4 h-4" />
              <span>Internal Consensus & Voting</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100">
              System Decisions & Polls
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Democratic decision making for shared body choices, large expenditures, and social plans.
              Every alter can cast their vote or raise safety concerns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Poll</span>
            </button>
          </div>
        </div>

        {/* Status Filters & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            {(['active', 'resolved', 'all'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'active' ? `Active (${activePollsCount})` : st}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Active Voter:{' '}
            <span className="text-slate-200 font-bold">{currentFrontAlter?.name || 'Front'}</span>
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
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Polls List */}
      <div className="space-y-5">
        {filteredPolls.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
            <Vote className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">No polls found in this view.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-xl hover:bg-indigo-500/30"
            >
              Launch First Decision Poll
            </button>
          </div>
        ) : (
          filteredPolls.map((poll) => {
            const creator = alters.find((a) => a.id === poll.creatorAlterId);
            const myVote = poll.votes[currentFrontAlterId];
            const totalVotesCount = Object.keys(poll.votes).length;

            const vetoVote = Object.values(poll.votes).find((v) => v.isVeto);
            const vetoAlter = vetoVote ? alters.find((a) => a.id === vetoVote.alterId) : null;

            return (
              <div
                key={poll.id}
                className={`bg-slate-900/90 border rounded-2xl p-5 md:p-6 transition-all relative overflow-hidden shadow-lg ${
                  vetoVote
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : poll.status === 'resolved'
                    ? 'border-slate-800/80 opacity-80'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-wider">
                      {poll.category}
                    </span>

                    {poll.status === 'resolved' ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Resolved</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Active Voting</span>
                      </span>
                    )}

                    {poll.allowVeto && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-400">
                        Veto Enabled
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {poll.status === 'active' && (
                      <button
                        onClick={() => {
                          const winningOpt = poll.options.reduce((prev, curr) => {
                            const prevVotes = Object.values(poll.votes).filter(
                              (v) => v.optionId === prev.id
                            ).length;
                            const currVotes = Object.values(poll.votes).filter(
                              (v) => v.optionId === curr.id
                            ).length;
                            return currVotes > prevVotes ? curr : prev;
                          });
                          resolvePoll(poll.id, winningOpt.id);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 rounded-lg flex items-center gap-1"
                        title="Resolve & Close Poll"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Delete this poll?')) deletePoll(poll.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                      title="Delete Poll"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="mt-3">
                  <h3 className="text-base md:text-lg font-bold text-slate-100">{poll.title}</h3>
                  {poll.description && (
                    <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
                      {poll.description}
                    </p>
                  )}
                </div>

                {/* Veto Alert Banner */}
                {vetoVote && (
                  <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-rose-300">
                        Safety / Protector Veto Raised by {vetoAlter?.name || 'Protector'}
                      </div>
                      <div className="mt-0.5 italic text-rose-200/90">
                        "{vetoVote.comment || 'Safety concern raised regarding this decision.'}"
                      </div>
                    </div>
                  </div>
                )}

                {/* Options Voting Progress & Chips */}
                <div className="mt-5 space-y-3">
                  {poll.options.map((option) => {
                    const votesForThisOption = Object.values(poll.votes).filter(
                      (v) => v.optionId === option.id && !v.isVeto
                    );
                    const voteCount = votesForThisOption.length;
                    const percentage =
                      totalVotesCount > 0
                        ? Math.round((voteCount / totalVotesCount) * 100)
                        : 0;
                    const isMyChoice = myVote?.optionId === option.id && !myVote?.isVeto;
                    const isWinning = poll.resolvedOptionId === option.id;

                    return (
                      <div
                        key={option.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isWinning
                            ? 'bg-emerald-950/30 border-emerald-500/50'
                            : isMyChoice
                            ? 'bg-indigo-950/30 border-indigo-500/50'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-xs mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200 text-sm">
                              {option.text}
                            </span>
                            {isWinning && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                                Consensus Winner
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-slate-400 font-medium">
                              {voteCount} vote{voteCount !== 1 ? 's' : ''}
                            </span>
                            <span className="font-bold text-slate-200 w-9 text-right">
                              {percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: option.color || '#6366f1',
                            }}
                          />
                        </div>

                        {/* Alter Avatar Chips for this option */}
                        {votesForThisOption.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60">
                            {votesForThisOption.map((v) => {
                              const voter = alters.find((a) => a.id === v.alterId);
                              return (
                                <div
                                  key={v.alterId}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700/80 text-[11px] text-slate-300"
                                  title={v.comment ? `"${v.comment}"` : undefined}
                                >
                                  <div
                                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                                    style={{ backgroundColor: voter?.colorHex || '#6366f1' }}
                                  >
                                    {voter?.name.slice(0, 1)}
                                  </div>
                                  <span>{voter?.name}</span>
                                  {v.comment && (
                                    <MessageSquare className="w-2.5 h-2.5 text-indigo-400" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Cast Vote button for active poll */}
                        {poll.status === 'active' && (
                          <div className="mt-2.5 flex justify-end">
                            <button
                              onClick={() => {
                                castVote(
                                  poll.id,
                                  currentFrontAlterId,
                                  option.id,
                                  voteComments[poll.id]?.trim() || myVote?.comment
                                );
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                                isMyChoice
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              {isMyChoice ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Voted by {currentFrontAlter?.name}</span>
                                </>
                              ) : (
                                <span>Vote as {currentFrontAlter?.name}</span>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Optional Comment / Veto Bar for Active Poll */}
                {poll.status === 'active' && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={`Reason or stipulation from ${currentFrontAlter?.name}...`}
                        value={voteComments[poll.id] ?? (myVote?.comment || '')}
                        onChange={(e) =>
                          setVoteComments({ ...voteComments, [poll.id]: e.target.value })
                        }
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {poll.allowVeto && (
                      <button
                        onClick={() => {
                          const reason = prompt('Enter Protector / Safety Veto reason:');
                          if (reason !== null) {
                            castVote(
                              poll.id,
                              currentFrontAlterId,
                              poll.options[0]?.id || '',
                              reason || 'Safety veto',
                              true
                            );
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-500/30 rounded-xl flex items-center justify-center gap-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Raise Veto</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreatePollModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
};

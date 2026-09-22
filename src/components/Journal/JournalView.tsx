import React, { useState } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import { JournalEntry, JournalCategory } from '../../types';
import { JournalCard } from './JournalCard';
import { JournalModal } from './JournalModal';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Users,
  Sparkles,
  Lock,
  Heart,
} from 'lucide-react';

export const JournalView: React.FC = () => {
  const { journals, alters } = useSystemStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterAlterId, setFilterAlterId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const handleOpenCreateModal = () => {
    setEditingEntry(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const filteredJournals = journals.filter((entry) => {
    const matchesCategory = activeCategory === 'all' || entry.category === activeCategory;
    const matchesAuthor = filterAlterId === 'all' || entry.authorAlterId === filterAlterId || entry.coAuthorAlterIds?.includes(filterAlterId);
    const matchesSearch =
      searchQuery.trim() === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesAuthor && matchesSearch;
  });

  const categoryTabs: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Entries', icon: '🌟' },
    { id: 'daily_reflection', label: 'Daily Reflections', icon: '📔' },
    { id: 'therapy_notes', label: 'Therapy & Healing', icon: '🩺' },
    { id: 'vent_grounding', label: 'Vent & Grounding', icon: '💭' },
    { id: 'memory_cocon', label: 'Memories & Co-Con', icon: '🌸' },
    { id: 'alter_private', label: 'Private Vault', icon: '🔒' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>System Journal & Structured Reflections</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-section journaling, therapy prep, daily check-ins, and alter-private vaults.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Category Section Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categoryTabs.map((tab) => {
          const count =
            tab.id === 'all'
              ? journals.length
              : journals.filter((j) => j.category === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search & Author Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries by title, notes, or tags..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filterAlterId}
            onChange={(e) => setFilterAlterId(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Author Alters ({alters.length})</option>
            {alters.map((alt) => (
              <option key={alt.id} value={alt.id}>
                {alt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Journal Cards Grid */}
      {filteredJournals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJournals.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onEdit={handleOpenEditModal}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800/80 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">No Journal Entries Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || activeCategory !== 'all' || filterAlterId !== 'all'
              ? 'No entries match your current category or search filters.'
              : 'Begin logging daily switch reflections, therapy preparation, or emotional release notes.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Write First Entry</span>
          </button>
        </div>
      )}

      {/* Journal Modal */}
      {isModalOpen && (
        <JournalModal
          entry={editingEntry}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
};

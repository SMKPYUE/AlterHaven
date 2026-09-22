import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSystemStore } from '../../store/useSystemStore';
import { JournalEntry, JournalCategory, JournalMood } from '../../types';
import {
  X,
  BookOpen,
  Calendar,
  Sparkles,
  Lock,
  Tag,
  Smile,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface JournalModalProps {
  entry?: JournalEntry | null;
  onClose: () => void;
}

const CATEGORIES: { id: JournalCategory; label: string; icon: string; desc: string }[] = [
  { id: 'daily_reflection', label: 'Daily Reflection', icon: '📔', desc: 'Routine switches, daily events, check-ins' },
  { id: 'therapy_notes', label: 'Therapy & Healing', icon: '🩺', desc: 'Session prep, trauma processing, clinical insights' },
  { id: 'vent_grounding', label: 'Vent & Emotional Release', icon: '💭', desc: 'Safe space to release distress or express hard feelings' },
  { id: 'memory_cocon', label: 'Memories & Co-Con', icon: '🌸', desc: 'Shared experiences, inner world doodles, milestones' },
  { id: 'alter_private', label: 'Alter-Private Vault', icon: '🔒', desc: 'Private to author alter only' },
  { id: 'general', label: 'General System Note', icon: '📝', desc: 'Announcements, thoughts, ideas' },
];

const MOODS: { id: JournalMood; label: string; emoji: string }[] = [
  { id: 'grounded', label: 'Grounded', emoji: '🌿' },
  { id: 'calm', label: 'Calm', emoji: '🌊' },
  { id: 'joyful', label: 'Joyful', emoji: '✨' },
  { id: 'co_conscious', label: 'Co-Con', emoji: '🤝' },
  { id: 'blurry', label: 'Blurry', emoji: '🌫️' },
  { id: 'foggy', label: 'Brain Fog', emoji: '☁️' },
  { id: 'anxious', label: 'Anxious', emoji: '⚡' },
  { id: 'triggered', label: 'Triggered', emoji: '🛡️' },
  { id: 'exhausted', label: 'Exhausted', emoji: '🔋' },
];

export const JournalModal: React.FC<JournalModalProps> = ({ entry, onClose }) => {
  const { system, alters, activeFronts, addJournal, updateJournal } = useSystemStore();

  const mainFrontId = activeFronts.find((f) => f.status === 'front')?.alterId || alters[0]?.id || '';

  const formatDateTimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [title, setTitle] = useState(entry?.title || '');
  const [authorAlterId, setAuthorAlterId] = useState(entry?.authorAlterId || mainFrontId);
  const [coAuthorAlterIds, setCoAuthorAlterIds] = useState<string[]>(entry?.coAuthorAlterIds || []);
  const [category, setCategory] = useState<JournalCategory>(entry?.category || 'daily_reflection');
  const [mood, setMood] = useState<JournalMood | undefined>(entry?.mood || 'grounded');
  const [content, setContent] = useState(entry?.content || '');
  const [tagsInput, setTagsInput] = useState(entry?.tags?.join(', ') || '');
  const [isPrivate, setIsPrivate] = useState(entry?.isPrivate || false);
  const [dateStr, setDateStr] = useState(
    entry ? formatDateTimeLocal(new Date(entry.date)) : formatDateTimeLocal(new Date())
  );

  const toggleCoAuthor = (altId: string) => {
    if (coAuthorAlterIds.includes(altId)) {
      setCoAuthorAlterIds(coAuthorAlterIds.filter((id) => id !== altId));
    } else {
      setCoAuthorAlterIds([...coAuthorAlterIds, altId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const entryDate = new Date(dateStr).getTime() || Date.now();

    if (entry) {
      updateJournal(entry.id, {
        title: title.trim(),
        authorAlterId,
        coAuthorAlterIds: coAuthorAlterIds.filter((id) => id !== authorAlterId),
        category,
        mood,
        content: content.trim(),
        tags,
        isPrivate: category === 'alter_private' ? true : isPrivate,
        date: entryDate,
      });
    } else {
      addJournal({
        systemId: system.id,
        title: title.trim(),
        authorAlterId,
        coAuthorAlterIds: coAuthorAlterIds.filter((id) => id !== authorAlterId),
        category,
        mood,
        content: content.trim(),
        tags,
        isPrivate: category === 'alter_private' ? true : isPrivate,
        date: entryDate,
      });
    }

    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {entry ? 'Edit Journal Reflection' : 'New Journal & Reflection Entry'}
              </h2>
              <p className="text-xs text-slate-400">
                Encrypted & stored 100% locally on your device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Entry Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wednesday Therapy Takeaways, Evening Switch Debrief, Grounding with Art"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold placeholder:font-normal"
            />
          </div>

          {/* Author & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Primary Author Alter</span>
              </label>
              <select
                value={authorAlterId}
                onChange={(e) => setAuthorAlterId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                {alters.map((alt) => (
                  <option key={alt.id} value={alt.id}>
                    {alt.name} ({alt.pronouns.join('/')}) - {alt.roles.join(', ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>Entry Date & Time (Backdate Supported)</span>
              </label>
              <input
                type="datetime-local"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Co-Authors Multi-select */}
          {alters.length > 1 && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                Co-Authors / Co-Conscious Members Present (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {alters
                  .filter((a) => a.id !== authorAlterId)
                  .map((alt) => {
                    const isSelected = coAuthorAlterIds.includes(alt.id);
                    return (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() => toggleCoAuthor(alt.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: alt.colorHex }}
                        />
                        <span>{alt.name}</span>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Section / Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Journal Section / Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    category === cat.id
                      ? 'bg-indigo-600/25 border-indigo-500 text-indigo-100 shadow-sm'
                      : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Mood / Internal State Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              <span>Consciousness / Emotional State</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                    mood === m.id
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Journal Reflection & Details *
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts, internal conversations, switch notes, or reflections here..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y font-sans"
            />
          </div>

          {/* Tags & Private Lock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Tags (comma separated)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Switch, Therapy, Grounding, Art"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer w-full hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={isPrivate || category === 'alter_private'}
                  disabled={category === 'alter_private'}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Private / Author-Locked</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Flag as sensitive or alter-private
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{entry ? 'Save Changes' : 'Publish Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

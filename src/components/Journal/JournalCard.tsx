import React, { useState } from 'react';
import { JournalEntry } from '../../types';
import { useSystemStore } from '../../store/useSystemStore';
import {
  Calendar,
  Lock,
  Pin,
  Edit2,
  Trash2,
  Copy,
  Check,
  Tag,
  Users,
} from 'lucide-react';

interface JournalCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string; bg: string }> = {
  daily_reflection: { label: 'Daily Reflection', icon: '📔', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  therapy_notes: { label: 'Therapy & Healing', icon: '🩺', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  vent_grounding: { label: 'Vent & Emotional', icon: '💭', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  memory_cocon: { label: 'Memories & Co-Con', icon: '🌸', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  alter_private: { label: 'Private Vault', icon: '🔒', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  general: { label: 'General Note', icon: '📝', bg: 'bg-slate-800 text-slate-300 border-slate-700' },
};

const MOOD_EMOJIS: Record<string, { label: string; emoji: string }> = {
  grounded: { label: 'Grounded', emoji: '🌿' },
  calm: { label: 'Calm', emoji: '🌊' },
  joyful: { label: 'Joyful', emoji: '✨' },
  co_conscious: { label: 'Co-Con', emoji: '🤝' },
  blurry: { label: 'Blurry', emoji: '🌫️' },
  foggy: { label: 'Foggy', emoji: '☁️' },
  anxious: { label: 'Anxious', emoji: '⚡' },
  triggered: { label: 'Triggered', emoji: '🛡️' },
  exhausted: { label: 'Exhausted', emoji: '🔋' },
};

export const JournalCard: React.FC<JournalCardProps> = ({ entry, onEdit }) => {
  const { alters, deleteJournal, activeBoardId, addWidget } = useSystemStore();

  const [copied, setCopied] = useState(false);

  const author = alters.find((a) => a.id === entry.authorAlterId);
  const coAuthors = alters.filter((a) => entry.coAuthorAlterIds?.includes(a.id));

  const catInfo = CATEGORY_LABELS[entry.category] || CATEGORY_LABELS.general;
  const moodInfo = entry.mood ? MOOD_EMOJIS[entry.mood] : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${entry.title}\nBy: ${author?.name || 'Alter'}\n\n${entry.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePinToCorkboard = () => {
    addWidget({
      boardId: activeBoardId,
      authorAlterId: entry.authorAlterId,
      type: 'sticky_note',
      position: { x: 100, y: 100, zIndex: 10, rotation: 0 },
      size: { width: 320, height: 220 },
      color: '#e0e7ff',
      title: `📔 ${entry.title}`,
      content: `${entry.content}\n\n— ${author?.name || 'System'} (${new Date(entry.date).toLocaleDateString()})`,
      isPinned: true,
    });
    alert('Journal entry pinned to the active Corkboard!');
  };

  return (
    <div
      className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between relative group"
      style={{
        borderLeft: `4px solid ${author?.colorHex || '#6366f1'}`,
      }}
    >
      <div>
        {/* Top Meta Bar */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Author Avatar */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-inner ring-2 ring-white/10 shrink-0 overflow-hidden"
              style={{ backgroundColor: author?.colorHex || '#6366f1' }}
            >
              {author?.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                author?.name.slice(0, 2).toUpperCase() || 'SY'
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs text-slate-100">{author?.name || 'System'}</span>
                {author && (
                  <span className="text-[10px] text-slate-400">
                    ({author.pronouns.join('/')})
                  </span>
                )}
                {coAuthors.length > 0 && (
                  <div className="flex items-center gap-1 ml-1 text-[10px] text-slate-400">
                    <span>+</span>
                    {coAuthors.map((ca) => (
                      <span
                        key={ca.id}
                        className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                      >
                        {ca.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>
                  {new Date(entry.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                  {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handlePinToCorkboard}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
              title="Pin to active Corkboard"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
              title="Copy entry text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onEdit(entry)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
              title="Edit entry"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete journal entry "${entry.title}"?`)) {
                  deleteJournal(entry.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Delete entry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Badges: Category & Mood */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${catInfo.bg}`}>
            <span>{catInfo.icon}</span>
            <span>{catInfo.label}</span>
          </span>

          {moodInfo && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1">
              <span>{moodInfo.emoji}</span>
              <span>{moodInfo.label}</span>
            </span>
          )}

          {entry.isPrivate && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-950/40 text-amber-300 border border-amber-800/40 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Private</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-100 mb-2 leading-snug">
          {entry.title}
        </h3>

        {/* Content */}
        <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed space-y-2 max-h-60 overflow-y-auto">
          {entry.content}
        </div>
      </div>

      {/* Tags Footer */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
          {entry.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5 text-indigo-400" />
              <span>{tag}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

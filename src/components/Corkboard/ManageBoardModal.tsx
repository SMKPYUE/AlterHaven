import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Board, BoardTheme } from '../../types';
import { useSystemStore } from '../../store/useSystemStore';
import { X, Trash2, Edit3, Plus, LayoutDashboard, Palette, User, AlertTriangle } from 'lucide-react';

interface ManageBoardModalProps {
  mode: 'create' | 'edit';
  board?: Board | null;
  onClose: () => void;
}

export const ManageBoardModal: React.FC<ManageBoardModalProps> = ({
  mode,
  board,
  onClose,
}) => {
  const { system, alters, boards, addBoard, updateBoard, deleteBoard } = useSystemStore();

  const [title, setTitle] = useState(board?.title || '');
  const [theme, setTheme] = useState<BoardTheme>(board?.theme || 'cork');
  const [ownerAlterId, setOwnerAlterId] = useState<string>(board?.ownerAlterId || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setTitle(board?.title || (mode === 'create' ? '' : ''));
    setTheme(board?.theme || 'cork');
    setOwnerAlterId(board?.ownerAlterId || '');
    setShowDeleteConfirm(false);
  }, [board, mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (mode === 'create') {
      addBoard({
        systemId: system?.id || 'sys_1',
        title: title.trim(),
        scope: ownerAlterId ? 'alter_private' : 'common',
        theme,
        ownerAlterId: ownerAlterId ? ownerAlterId : undefined,
      });
    } else if (board && board.id) {
      updateBoard(board.id, {
        title: title.trim(),
        scope: ownerAlterId ? 'alter_private' : 'common',
        theme,
        ownerAlterId: ownerAlterId ? ownerAlterId : undefined,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!board || boards.length <= 1) return;
    deleteBoard(board.id);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              {mode === 'create' ? 'Create New Corkboard' : `Edit Board: ${board?.title}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Board Name / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily Schedule, Maya's Art Wall, System Rules"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Theme Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Board Background Theme</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('cork')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  theme === 'cork'
                    ? 'border-indigo-500 bg-amber-950/40 text-amber-200 ring-1 ring-indigo-500 shadow-md'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="w-6 h-6 rounded-md cork-pattern border border-amber-800/60" />
                <span>Cork Texture</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('slate')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  theme === 'slate'
                    ? 'border-indigo-500 bg-slate-800 text-slate-200 ring-1 ring-indigo-500 shadow-md'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="w-6 h-6 rounded-md slate-pattern border border-slate-700" />
                <span>Slate Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('whiteboard')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                  theme === 'whiteboard'
                    ? 'border-indigo-500 bg-slate-200 text-slate-900 ring-1 ring-indigo-500 shadow-md'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="w-6 h-6 rounded-md whiteboard-pattern border border-slate-300" />
                <span>Whiteboard</span>
              </button>
            </div>
          </div>

          {/* Owner Alter (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Assigned Alter / Sanctuary Owner (Optional)</span>
            </label>
            <select
              value={ownerAlterId}
              onChange={(e) => setOwnerAlterId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Shared Common Board (All Alters)</option>
              {alters.map((alter) => (
                <option key={alter.id} value={alter.id}>
                  {alter.name} ({alter.pronouns.join('/')})
                </option>
              ))}
            </select>
          </div>

          {/* Delete Danger Zone (in edit mode) */}
          {mode === 'edit' && board && (
            <div className="pt-3 border-t border-slate-800">
              {showDeleteConfirm ? (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Delete this entire board and its pinned widgets?</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1 rounded-lg text-xs text-slate-300 hover:bg-slate-800"
                    >
                      Keep Board
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {boards.length <= 1
                      ? 'Cannot delete the only board.'
                      : 'Remove this board and its contents.'}
                  </span>
                  {boards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-800/40 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Board</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              {mode === 'create' ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              <span>{mode === 'create' ? 'Create Board' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

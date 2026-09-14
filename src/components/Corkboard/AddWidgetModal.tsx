import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WidgetType, ChecklistItem } from '../../types';
import { useSystemStore } from '../../store/useSystemStore';
import {
  X,
  FileText,
  ListTodo,
  AlertTriangle,
  Shield,
  Mic,
  Plus,
  Trash2,
} from 'lucide-react';

interface AddWidgetModalProps {
  boardId: string;
  onClose: () => void;
}

const STICKY_COLORS = [
  { name: 'Warm Yellow', hex: '#fef3c7' },
  { name: 'Rose Pink', hex: '#ffe4e6' },
  { name: 'Mint Green', hex: '#ecfdf5' },
  { name: 'Soft Lavender', hex: '#ede9fe' },
  { name: 'Sky Blue', hex: '#e0f2fe' },
  { name: 'Peach Orange', hex: '#ffedd5' },
];

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ boardId, onClose }) => {
  const { alters, activeFronts, widgets, addWidget } = useSystemStore();


  const mainFrontId = activeFronts.find((f) => f.status === 'front')?.alterId || alters[0]?.id || '';

  const [type, setType] = useState<WidgetType>('sticky_note');
  const [authorAlterId, setAuthorAlterId] = useState<string>(mainFrontId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(STICKY_COLORS[0].hex);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', text: 'Item 1', done: false },
    { id: '2', text: 'Item 2', done: false },
  ]);

  const handleAddChecklistItem = () => {
    setChecklist([...checklist, { id: Date.now().toString(), text: '', done: false }]);
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleChecklistTextChange = (id: string, text: string) => {
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    const existingCount = widgets.filter((w) => w.boardId === boardId).length;
    const col = existingCount % 4;
    const row = Math.floor(existingCount / 4) % 4;
    const safeX = Math.min(1800 - 360, 40 + col * 350 + Math.floor(Math.random() * 20));
    const safeY = Math.min(1200 - 240, 40 + row * 230 + Math.floor(Math.random() * 20));


    const newWidget = {
      boardId,
      authorAlterId,
      type,
      position: {
        x: safeX,
        y: safeY,
        zIndex: 10,
        rotation: Number(((Math.random() - 0.5) * 4).toFixed(1)),
      },
      size: {
        width: type === 'urgent_ribbon' ? 360 : 310,
        height: type === 'checklist' ? 220 : 180,
      },
      color,
      title: title.trim() || undefined,
      content: content.trim() || undefined,
      checklistItems:
        type === 'checklist'
          ? checklist.filter((item) => item.text.trim().length > 0)
          : undefined,
      urgencyLevel: type === 'urgent_ribbon' ? ('urgent' as const) : undefined,
      isPinned: true,
    };

    addWidget(newWidget);
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-100">Add Item to Corkboard</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Widget Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Item Type</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setType('sticky_note')}
                className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  type === 'sticky_note'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Sticky</span>
              </button>

              <button
                type="button"
                onClick={() => setType('checklist')}
                className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  type === 'checklist'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListTodo className="w-4 h-4" />
                <span>Checklist</span>
              </button>

              <button
                type="button"
                onClick={() => setType('urgent_ribbon')}
                className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  type === 'urgent_ribbon'
                    ? 'bg-rose-600 text-white border-rose-500 shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Urgent</span>
              </button>

              <button
                type="button"
                onClick={() => setType('rule_card')}
                className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  type === 'rule_card'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Rule</span>
              </button>
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Author Alter</label>
            <select
              value={authorAlterId}
              onChange={(e) => setAuthorAlterId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
            >
              {alters.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.pronouns.join('/')})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Title / Header (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Remember to eat lunch, System Rule #3"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Color Selection for Sticky & Checklist */}
          {(type === 'sticky_note' || type === 'checklist') && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Note Color</label>
              <div className="flex gap-2">
                {STICKY_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={`w-7 h-7 rounded-lg transition-transform ${
                      color === c.hex ? 'scale-110 ring-2 ring-white shadow' : 'opacity-80'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Body or Checklist editor */}
          {type !== 'checklist' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Note Content *
              </label>
              <textarea
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note, reminder, or handoff thought here..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Checklist Items</label>
              {checklist.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-4">{index + 1}.</span>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => handleChecklistTextChange(item.id, e.target.value)}
                    placeholder="Task item description..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  {checklist.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Checklist Item</span>
              </button>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              Pin to Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

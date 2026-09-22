import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { BoardWidget, ChecklistItem, WidgetType } from '../../types';
import { useSystemStore } from '../../store/useSystemStore';
import { processImageFile } from '../../utils/imageUtils';
import {
  X,
  FileText,
  ListTodo,
  AlertTriangle,
  Shield,
  Image,
  Plus,
  Trash2,
  Upload,
  Palette,
  Maximize2,
} from 'lucide-react';

interface EditWidgetModalProps {
  widget: BoardWidget;
  isOpen: boolean;
  onClose: () => void;
}

const STICKY_COLORS = [
  { name: 'Warm Yellow', hex: '#fef08a' },
  { name: 'Rose Pink', hex: '#fbcfe8' },
  { name: 'Mint Green', hex: '#bbf7d0' },
  { name: 'Soft Lavender', hex: '#ddd6fe' },
  { name: 'Sky Blue', hex: '#bae6fd' },
  { name: 'Sunset Peach', hex: '#fed7aa' },
  { name: 'Coral Red', hex: '#fecaca' },
  { name: 'Slate Dark', hex: '#334155' },
];

const NOTE_SIZES = [
  { name: 'Compact', width: 260, height: 180 },
  { name: 'Standard', width: 320, height: 220 },
  { name: 'Expanded', width: 420, height: 280 },
  { name: 'Wide', width: 480, height: 220 },
  { name: 'Square', width: 320, height: 320 },
];

export const EditWidgetModal: React.FC<EditWidgetModalProps> = ({ widget, isOpen, onClose }) => {
  const { alters, updateWidget } = useSystemStore();

  const [type, setType] = useState<WidgetType>(widget.type || 'sticky_note');
  const [authorAlterId, setAuthorAlterId] = useState<string>(widget.authorAlterId || alters[0]?.id || '');
  const [title, setTitle] = useState(widget.title || '');
  const [content, setContent] = useState(widget.content || '');
  const [color, setColor] = useState(widget.color || STICKY_COLORS[0].hex);
  const [imageUrl, setImageUrl] = useState(widget.imageUrl || '');
  const [size, setSize] = useState(widget.size || { width: 320, height: 220 });
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    widget.checklistItems && widget.checklistItems.length > 0
      ? widget.checklistItems
      : [
          { id: '1', text: '', done: false },
          { id: '2', text: '', done: false },
        ]
  );

  if (!isOpen) return null;

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

    updateWidget(widget.id, {
      authorAlterId,
      type,
      color,
      size,
      title: title.trim() || undefined,
      content: content.trim() || undefined,
      imageUrl: type === 'photo_pin' ? imageUrl : widget.imageUrl,
      checklistItems:
        type === 'checklist'
          ? checklist.filter((item) => item.text.trim().length > 0)
          : undefined,
      urgencyLevel: type === 'urgent_ribbon' ? 'urgent' : undefined,
    });

    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>Edit Corkboard Item</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Widget Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Item Type</label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'sticky_note', label: 'Sticky', icon: FileText },
                { id: 'checklist', label: 'Checklist', icon: ListTodo },
                { id: 'photo_pin', label: 'Photo Pin', icon: Image },
                { id: 'urgent_ribbon', label: 'Urgent', icon: AlertTriangle },
                { id: 'rule_card', label: 'Rule', icon: Shield },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as WidgetType)}
                    className={`p-2 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                );
              })}
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
              Title / Header
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Remember to eat lunch, System Notice"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Note Size Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Note Size</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {NOTE_SIZES.map((s) => {
                const isSelected = size.width === s.width && size.height === s.height;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSize({ width: s.width, height: s.height })}
                    className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          {(type === 'sticky_note' || type === 'checklist' || type === 'photo_pin') && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Note Color Theme</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {STICKY_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={`w-7 h-7 rounded-xl border-2 transition-transform ${
                      color === c.hex ? 'scale-110 border-white ring-2 ring-indigo-500 shadow' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-7 h-7 rounded-xl cursor-pointer bg-transparent border-0"
                  title="Custom Color"
                />
              </div>
            </div>
          )}

          {/* Photo Pin image upload */}
          {type === 'photo_pin' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Photo Pin Image
              </label>
              <div className="flex items-center gap-3">
                {imageUrl && (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                    <img src={imageUrl} alt="Pin Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload Local Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const dataUrl = await processImageFile(file, 600, 0.85);
                          setImageUrl(dataUrl);
                        } catch {
                          alert('Failed to process image file.');
                        }
                      }
                    }}
                  />
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Note Content / Checklist */}
          {type !== 'checklist' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Note Content
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note, reminder, or handoff thought here..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 resize-none"
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
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 pt-1 font-semibold"
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
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

import React, { useState, useRef } from 'react';
import type { BoardWidget } from '../../types';
import { useSystemStore } from '../../store/useSystemStore';
import { EditWidgetModal } from './EditWidgetModal';
import {
  Pin,
  Check,
  Trash2,
  Volume2,
  AlertTriangle,
  Shield,
  Square,
  CheckSquare,
  Play,
  Pause,
  Lock,
  GripHorizontal,
  Edit2,
  Image as ImageIcon,
} from 'lucide-react';

interface StickyWidgetProps {
  widget: BoardWidget;
  zoom?: number;
}

export const StickyWidget: React.FC<StickyWidgetProps> = ({ widget, zoom = 1 }) => {
  const { alters, updateWidget, deleteWidget } = useSystemStore();

  const author = alters.find((a) => a.id === widget.authorAlterId);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number; startLeft: number; startTop: number }>({
    x: 0,
    y: 0,
    startLeft: 0,
    startTop: 0,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore interactive inner elements
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.closest('button') ||
      target.closest('input')
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // safe fallback
    }

    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      startLeft: widget.position.x,
      startTop: widget.position.y,
    };

    // Bring to front
    updateWidget(widget.id, {
      position: {
        ...widget.position,
        zIndex: 50,
      },
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();

    const dx = (e.clientX - dragStartPos.current.x) / zoom;
    const dy = (e.clientY - dragStartPos.current.y) / zoom;

    const rawNewX = dragStartPos.current.startLeft + dx;
    const rawNewY = dragStartPos.current.startTop + dy;

    // Canvas boundary clamp: [20, 1800 - width - 20] and [35, 1200 - height - 20]
    const clampedX = Math.max(20, Math.min(1800 - widget.size.width - 20, Math.round(rawNewX)));
    const clampedY = Math.max(35, Math.min(1200 - widget.size.height - 20, Math.round(rawNewY)));


    updateWidget(widget.id, {
      position: {
        ...widget.position,
        x: clampedX,
        y: clampedY,
      },
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // safe fallback
      }
      setIsDragging(false);
      updateWidget(widget.id, {
        position: {
          ...widget.position,
          zIndex: 10,
        },
      });
    }
  };

  const toggleChecklistItem = (itemId: string) => {
    if (!widget.checklistItems) return;
    const updated = widget.checklistItems.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    updateWidget(widget.id, { checklistItems: updated });
  };

  const getWidgetStyle = () => {
    switch (widget.type) {
      case 'urgent_ribbon':
        return 'bg-gradient-to-r from-red-950/95 to-rose-900/95 border-2 border-red-500 shadow-xl shadow-red-500/20 text-rose-100';
      case 'rule_card':
        return 'bg-slate-900/95 border-2 border-indigo-500/50 shadow-xl text-slate-100';
      case 'voice_memo':
        return 'bg-indigo-950/95 border border-indigo-500/50 shadow-lg text-indigo-100';
      default:
        return 'shadow-xl text-slate-900';
    }
  };

  const isLightBackground = widget.type === 'sticky_note' || widget.type === 'checklist';

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute select-none rounded-2xl p-4 transition-shadow group ${
        isDragging ? 'cursor-grabbing shadow-2xl scale-[1.02] ring-2 ring-indigo-400 z-50' : 'cursor-grab hover:shadow-2xl'
      } ${getWidgetStyle()}`}
      style={{
        left: `${widget.position.x}px`,
        top: `${widget.position.y}px`,
        width: `${widget.size.width}px`,
        minHeight: `${widget.size.height}px`,
        transform: `rotate(${isDragging ? 0 : widget.position.rotation || 0}deg)`,
        backgroundColor: isLightBackground ? widget.color : undefined,
        zIndex: widget.position.zIndex || 10,
        touchAction: 'none',
      }}
    >
      {/* Top Pin & Drag Grip Graphic */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center pointer-events-none">
        <div
          className="w-6 h-6 rounded-full ring-2 ring-black/40 shadow-lg flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: author?.colorHex || '#ef4444' }}
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full opacity-90" />
        </div>
      </div>


      {/* Widget Header */}
      <div className="flex items-center justify-between gap-2 mb-2 pt-1 border-b border-black/10 pb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {widget.type === 'urgent_ribbon' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />}
          {widget.type === 'rule_card' && <Shield className="w-4 h-4 text-indigo-400 shrink-0" />}
          {widget.type === 'voice_memo' && <Volume2 className="w-4 h-4 text-indigo-300 shrink-0" />}
          {widget.type === 'photo_pin' && <ImageIcon className="w-4 h-4 text-pink-500 shrink-0" />}

          <h4 className={`text-xs font-bold truncate ${isLightBackground ? 'text-slate-900' : 'text-slate-100'}`}>
            {widget.title || (widget.type === 'urgent_ribbon' ? 'Urgent Alert' : widget.type === 'photo_pin' ? 'Photo Pin' : 'Note')}
          </h4>
        </div>

        {/* Action Buttons (Edit & Delete) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
            className="p-1 rounded hover:bg-black/10 text-slate-600 hover:text-indigo-600 transition-colors"
            title="Edit Note"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteWidget(widget.id);
            }}
            className="p-1 rounded hover:bg-black/10 text-slate-600 hover:text-rose-600 transition-colors"
            title="Delete Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="space-y-2 text-xs">
        {/* Photo Pin Image */}
        {widget.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-black/10 shadow-inner max-h-56 bg-black/5 flex items-center justify-center">
            <img
              src={widget.imageUrl}
              alt={widget.title || 'Corkboard photo'}
              className="w-full h-full object-cover max-h-56 select-none pointer-events-none"
            />
          </div>
        )}

        {widget.content && (
          <p
            className={`whitespace-pre-line leading-relaxed ${
              isLightBackground ? 'text-slate-800 font-medium' : 'text-slate-200'
            }`}
          >
            {widget.content}
          </p>
        )}

        {/* Checklists */}
        {widget.type === 'checklist' && widget.checklistItems && (
          <div className="space-y-1.5 pt-1">
            {widget.checklistItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleChecklistItem(item.id)}
                className="w-full flex items-start gap-2 text-left hover:opacity-80 transition-opacity"
              >
                {item.done ? (
                  <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                )}
                <span
                  className={`text-xs ${
                    item.done
                      ? 'line-through text-slate-500'
                      : 'text-slate-900 font-medium'
                  }`}
                >
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Voice Memo Player */}
        {widget.type === 'voice_memo' && (
          <div className="p-2.5 rounded-lg bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-between gap-3">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center shadow transition-all"
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-1 h-3">
                {[40, 70, 25, 90, 50, 80, 60, 30, 95, 45, 85, 30].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-all ${
                      isPlayingAudio ? 'bg-indigo-300 animate-pulse' : 'bg-indigo-500/50'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-indigo-300 font-mono mt-1 block">
                {widget.audioDurationSec ? `0:${widget.audioDurationSec.toString().padStart(2, '0')}` : '0:18'} Audio Memo
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Widget Author Footer */}
      <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[10px]">
        {author && (
          <div className="flex items-center gap-1.5">
            <div
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-xs"
              style={{ backgroundColor: author.colorHex }}
            >
              {author.name.slice(0, 1)}
            </div>
            <span className={`font-semibold ${isLightBackground ? 'text-slate-700' : 'text-slate-300'}`}>
              {author.name}
            </span>
          </div>
        )}
        <span className={`${isLightBackground ? 'text-slate-500' : 'text-slate-400'}`}>
          {new Date(widget.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Edit Widget Modal */}
      {isEditModalOpen && (
        <EditWidgetModal
          widget={widget}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

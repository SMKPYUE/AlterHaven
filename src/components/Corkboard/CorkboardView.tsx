import React, { useState, useRef, useEffect } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import { StickyWidget } from './StickyWidget';
import { AddWidgetModal } from './AddWidgetModal';
import { ManageBoardModal } from './ManageBoardModal';
import {
  LayoutDashboard,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Layers,
  Grid,
  Edit2,
  Settings,
} from 'lucide-react';

export const CorkboardView: React.FC = () => {
  const { boards, activeBoardId, setActiveBoardId, widgets, updateWidget, updateBoard, alters, devicePrefs } =
    useSystemStore();

  const [zoom, setZoom] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);

  // Pinch-to-zoom tracking refs
  const initialTouchDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  const currentBoard = boards.find((b) => b.id === activeBoardId) || boards[0];
  const boardWidgets = widgets.filter((w) => w.boardId === currentBoard?.id);

  const handleZoomIn = () => setZoom((z) => Math.min(Number((z + 0.15).toFixed(2)), 2.0));
  const handleZoomOut = () => setZoom((z) => Math.max(Number((z - 0.15).toFixed(2)), 0.45));
  const handleResetZoom = () => setZoom(1);

  // Auto-Tidy / Arrange All Pins onto visible grid
  const handleTidyPins = () => {
    const colWidth = 360;
    const rowHeight = 250;
    const cols = 4;
    const startX = 60;
    const startY = 70;

    boardWidgets.forEach((widget, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      updateWidget(widget.id, {
        position: {
          x: startX + col * colWidth,
          y: startY + row * rowHeight,
          zIndex: 10,
          rotation: Number(((index % 3 - 1) * 1.5).toFixed(1)),
        },
      });
    });
  };

  // Touch handlers for 2-finger pinch to zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      initialTouchDistanceRef.current = dist;
      initialZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDist = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      const factor = currentDist / initialTouchDistanceRef.current;
      const newZoom = Math.min(Math.max(Number((initialZoomRef.current * factor).toFixed(2)), 0.4), 2.0);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialTouchDistanceRef.current = null;
    }
  };

  const activeTheme = currentBoard?.theme || 'cork';

  const getThemeClass = () => {
    switch (activeTheme) {
      case 'slate':
        return 'slate-pattern';
      case 'whiteboard':
        return 'whiteboard-pattern';
      default:
        return 'cork-pattern';
    }
  };

  const handleChangeTheme = (theme: 'cork' | 'slate' | 'whiteboard') => {
    if (currentBoard) {
      updateBoard(currentBoard.id, { theme });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden relative select-none">
      {/* Top Toolbar */}
      <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 z-30 shrink-0 shadow-sm">
        {/* Board Switcher Tabs + Add Board */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1">
          {boards.map((b) => {
            const isActive = b.id === (currentBoard?.id || activeBoardId);
            const alter = b.ownerAlterId ? alters.find((a) => a.id === b.ownerAlterId) : null;

            return (
              <div key={b.id} className="flex items-center shrink-0">
                <button
                  onClick={() => setActiveBoardId(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {alter && (
                    <div
                      className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20"
                      style={{ backgroundColor: alter.colorHex }}
                    />
                  )}
                  <span>{b.title}</span>
                </button>

                {/* If active board, show quick edit button */}
                {isActive && (
                  <button
                    onClick={() => setIsEditBoardOpen(true)}
                    className="ml-1 p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                    title={`Edit or Rename "${b.title}"`}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add New Board Button */}
          <button
            onClick={() => setIsCreateBoardOpen(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-dashed border-slate-700 hover:border-indigo-500/50 flex items-center gap-1 transition-all shrink-0"
            title="Create a New Corkboard"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Board</span>
          </button>
        </div>

        {/* Right Tools (Theme, Auto-Arrange, Zoom & Add Pin) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Tidy Pins Layout */}
          <button
            onClick={handleTidyPins}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            title="Auto-Arrange all pins into a clean grid on the board"
          >
            <Grid className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Tidy</span>
          </button>

          {/* Theme Selector (Desktop only) */}
          <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/80 text-xs">
            <button
              onClick={() => handleChangeTheme('cork')}
              className={`px-2 py-1 rounded-md transition-all ${
                activeTheme === 'cork' ? 'bg-amber-900/60 text-amber-200 font-medium' : 'text-slate-400'
              }`}
            >
              Cork
            </button>
            <button
              onClick={() => handleChangeTheme('slate')}
              className={`px-2 py-1 rounded-md transition-all ${
                activeTheme === 'slate' ? 'bg-slate-700 text-slate-100 font-medium' : 'text-slate-400'
              }`}
            >
              Slate
            </button>
            <button
              onClick={() => handleChangeTheme('whiteboard')}
              className={`px-2 py-1 rounded-md transition-all ${
                activeTheme === 'whiteboard' ? 'bg-slate-200 text-slate-900 font-medium' : 'text-slate-400'
              }`}
            >
              White
            </button>
          </div>

          {/* Desktop Zoom Controls */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/80 text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-400 hover:text-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-400 hover:text-slate-200"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 text-slate-400 hover:text-slate-200 border-l border-slate-700 ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Add Pin Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Add Pin</span>
          </button>
        </div>
      </div>

      {/* Spatial Canvas Container with Touch Events */}
      <div
        ref={canvasContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 relative overflow-auto p-4 sm:p-8 pt-6 sm:pt-8 bg-slate-950/80 touch-pan-x touch-pan-y"
      >
        <div
          className={`w-[1800px] h-[1200px] rounded-3xl border-4 border-amber-950/40 shadow-2xl relative transition-transform duration-75 ${getThemeClass()}`}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            marginBottom: `${Math.max(0, (1 - zoom) * 200)}px`,
          }}
        >
          {/* Subtle Canvas Watermark */}
          <div className="absolute bottom-6 right-6 pointer-events-none select-none text-slate-500/20 font-bold text-2xl tracking-widest uppercase">
            {currentBoard?.title}
          </div>

          {/* Empty Canvas Prompt */}
          {boardWidgets.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none space-y-2">
              <LayoutDashboard className="w-10 h-10 text-slate-600" />
              <p className="text-sm font-semibold">This board is currently empty</p>
              <p className="text-xs text-slate-500">
                Click "Add Pin" above to post your first sticky note or checklist.
              </p>
            </div>
          )}

          {/* Render All Pinned Widgets with zoom support */}
          {boardWidgets.map((widget) => (
            <StickyWidget key={widget.id} widget={widget} zoom={zoom} />
          ))}
        </div>
      </div>

      {/* Floating Touch / Mobile Zoom Pill (Bottom Right) */}
      <div className="fixed bottom-20 right-4 z-40 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1">
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-300 hover:text-white bg-slate-800/80 active:bg-slate-700 rounded-xl"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="px-2 py-1 text-[11px] font-mono font-bold text-indigo-300 hover:text-white bg-indigo-950/60 border border-indigo-500/40 rounded-xl"
          title="Reset to 100%"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-300 hover:text-white bg-slate-800/80 active:bg-slate-700 rounded-xl"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Add Widget Modal */}
      {isAddModalOpen && currentBoard && (
        <AddWidgetModal
          boardId={currentBoard.id}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Create New Board Modal */}
      {isCreateBoardOpen && (
        <ManageBoardModal
          mode="create"
          onClose={() => setIsCreateBoardOpen(false)}
        />
      )}

      {/* Edit Current Board Modal */}
      {isEditBoardOpen && currentBoard && (
        <ManageBoardModal
          mode="edit"
          board={currentBoard}
          onClose={() => setIsEditBoardOpen(false)}
        />
      )}
    </div>
  );
};

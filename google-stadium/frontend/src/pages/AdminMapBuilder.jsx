import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Save, Plus, Trash2, Type } from 'lucide-react';

/**
 * Toolbox item types with default colors matching the stadium theme.
 * Admin drags these onto the canvas to build the map layout.
 */
const TOOL_TYPES = [
  { type: 'gate', label: 'Gate', color: '#34A853', emoji: '🚪' },
  { type: 'block', label: 'Block', color: '#4285F4', emoji: '🪑' },
  { type: 'vendor', label: 'Vendor Stall', color: '#F97316', emoji: '🍔' },
  { type: 'restroom', label: 'Restroom', color: '#FBBC05', emoji: '🚻' },
  { type: 'field', label: 'Field', color: '#166534', emoji: '⚽' },
  { type: 'custom', label: 'Custom', color: '#9333EA', emoji: '📍' },
];

let idCounter = 0;

export default function AdminMapBuilder() {
  const { token } = useAuthStore();
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const canvasRef = useRef(null);
  // Tracks active drag state for both mouse and touch
  const dragRef = useRef({ active: false, itemId: null, offsetX: 0, offsetY: 0 });

  // Load existing layout on mount
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/map/stadium/layout`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.items && res.data.items.length > 0) {
          setItems(res.data.items);
          // Sync the counter so new IDs don't collide
          idCounter = res.data.items.length + 1;
        }
      } catch (e) {
        console.error('Failed to load layout', e);
      }
    };
    fetchLayout();
  }, [token]);

  /**
   * Adds a new item of the given type to the canvas center.
   * Each item gets a unique id and defaults to position (50, 50).
   */
  const addItem = (toolType) => {
    idCounter++;
    const newItem = {
      id: `item-${idCounter}-${Date.now()}`,
      type: toolType.type,
      label: `${toolType.label} ${idCounter}`,
      x: 50,
      y: 50,
      color: toolType.color
    };
    setItems(prev => [...prev, newItem]);
    setSelectedId(newItem.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setItems(prev => prev.filter(i => i.id !== selectedId));
    setSelectedId(null);
  };

  /**
   * Converts a mouse or touch event's page coordinates to canvas-relative
   * percentage coordinates (0-100 range), enabling responsive positioning.
   */
  const getCanvasCoords = useCallback((pageX, pageY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((pageX - rect.left) / rect.width) * 100;
    const y = ((pageY - rect.top) / rect.height) * 100;
    // Clamp coordinates within canvas bounds
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  }, []);

  // --- Mouse event handlers ---
  const handleMouseDown = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(itemId);
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    dragRef.current = {
      active: true,
      itemId,
      offsetX: coords.x - item.x,
      offsetY: coords.y - item.y
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const { itemId, offsetX, offsetY } = dragRef.current;
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, x: coords.x - offsetX, y: coords.y - offsetY } : i
    ));
  }, [getCanvasCoords]);

  const handleMouseUp = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  // --- Touch event handlers (mobile drag-and-drop) ---
  const handleTouchStart = (e, itemId) => {
    e.stopPropagation();
    setSelectedId(itemId);
    const touch = e.touches[0];
    const coords = getCanvasCoords(touch.clientX, touch.clientY);
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    dragRef.current = {
      active: true,
      itemId,
      offsetX: coords.x - item.x,
      offsetY: coords.y - item.y
    };
  };

  const handleTouchMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    e.preventDefault(); // Prevent scroll during drag
    const touch = e.touches[0];
    const coords = getCanvasCoords(touch.clientX, touch.clientY);
    const { itemId, offsetX, offsetY } = dragRef.current;
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, x: coords.x - offsetX, y: coords.y - offsetY } : i
    ));
  }, [getCanvasCoords]);

  const handleTouchEnd = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  // Attach global mouse/touch listeners for drag operations
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Inline label editing
  const updateLabel = (itemId, newLabel) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, label: newLabel } : i));
  };

  // Save to backend
  const saveLayout = async () => {
    try {
      setSaveStatus('saving');
      await axios.post(`${import.meta.env.VITE_API_URL}/map/stadium/layout`, {
        name: 'default',
        items
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (e) {
      console.error('Save failed', e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full pb-24">
      <header className="mb-6 border-b border-gray-300 dark:border-gray-800 pb-4 mt-2 md:mt-6">
        <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Map Builder
        </h1>
        <p className="text-gray-400 mt-2 font-medium">
          Drag elements to design the stadium layout. Tap an item to edit its label.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Toolbox (left side) */}
        <div className="hidden lg:flex flex-col gap-3 w-52 shrink-0">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Toolbox</h3>
          {TOOL_TYPES.map(tool => (
            <button
              key={tool.type}
              onClick={() => addItem(tool)}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg transition-all active:scale-95 min-h-[48px]"
            >
              <span className="text-xl">{tool.emoji}</span>
              <span className="font-medium text-sm text-gray-700 dark:text-gray-200">{tool.label}</span>
              <Plus size={16} className="ml-auto text-gray-400" />
            </button>
          ))}

          {selectedId && (
            <button
              onClick={deleteSelected}
              className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition min-h-[48px]"
            >
              <Trash2 size={16} />
              Delete Selected
            </button>
          )}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Mobile Toolbox (horizontal scrollable, top) */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 snap-x">
            {TOOL_TYPES.map(tool => (
              <button
                key={tool.type}
                onClick={() => addItem(tool)}
                className="shrink-0 flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm transition active:scale-95 snap-start min-h-[48px] min-w-[48px]"
              >
                <span className="text-lg">{tool.emoji}</span>
                <span className="font-medium text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">{tool.label}</span>
              </button>
            ))}
            {selectedId && (
              <button
                onClick={deleteSelected}
                className="shrink-0 flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-500 text-xs font-medium snap-start min-h-[48px]"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>

          {/* The Map Canvas */}
          <div
            ref={canvasRef}
            className="relative w-full bg-gray-900 border-2 border-gray-700 rounded-3xl shadow-2xl overflow-hidden select-none"
            style={{ aspectRatio: '16 / 10', touchAction: 'none' }}
            onClick={() => { setSelectedId(null); setEditingId(null); }}
          >
            {/* Grid background pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '10% 10%'
              }}
            />

            {items.map(item => {
              const isSelected = item.id === selectedId;
              const isEditing = item.id === editingId;
              return (
                <div
                  key={item.id}
                  className={`absolute flex flex-col items-center justify-center rounded-2xl cursor-grab active:cursor-grabbing transition-shadow ${
                    isSelected ? 'ring-2 ring-white shadow-xl z-20' : 'z-10 shadow-sm'
                  }`}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: item.color + '33',
                    borderColor: item.color + '88',
                    borderWidth: '2px',
                    minWidth: '64px',
                    minHeight: '52px',
                    padding: '6px 12px'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item.id)}
                  onTouchStart={(e) => handleTouchStart(e, item.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(item.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(item.id);
                  }}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      value={item.label}
                      onChange={(e) => updateLabel(item.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      className="bg-transparent text-white text-xs font-semibold text-center outline-none border-b border-white/50 w-full min-w-[40px]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className="text-white text-xs font-semibold text-center leading-tight select-none"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Empty state */}
            {items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 text-sm font-medium">
                  Add elements from the toolbox to start building
                </p>
              </div>
            )}
          </div>

          {/* Info bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>{items.length} item{items.length !== 1 ? 's' : ''} on canvas</span>
            <span className="flex items-center gap-1">
              <Type size={12} />
              Double-click to edit label
            </span>
          </div>
        </div>
      </div>

      {/* FAB — Save Button (Google Material style) */}
      <button
        onClick={saveLayout}
        disabled={saveStatus === 'saving'}
        className={`fixed bottom-8 right-8 z-40 flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold text-white shadow-2xl transition-all active:scale-95 min-h-[48px] ${
          saveStatus === 'saved' ? 'bg-googleGreen'
          : saveStatus === 'error' ? 'bg-googleRed'
          : 'bg-googleBlue hover:bg-blue-600'
        }`}
      >
        <Save size={20} />
        {saveStatus === 'saving' ? 'Saving...'
          : saveStatus === 'saved' ? 'Saved ✓'
          : saveStatus === 'error' ? 'Error!'
          : 'Save Map'}
      </button>
    </div>
  );
}

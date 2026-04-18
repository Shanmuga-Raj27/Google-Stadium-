import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import StadiumSVG, { getResolvedSections } from '../components/StadiumSVG';
import { Save, X } from 'lucide-react';

/**
 * Color preset palette for the admin color picker.
 * Clean, Material-aligned values.
 */
const COLOR_PRESETS = [
  '#4285F4', '#34A853', '#FBBC05', '#EA4335',
  '#F97316', '#9333EA', '#EC4899', '#06B6D4',
  '#166534', '#78716C',
];

export default function AdminMapEditor() {
  const { token } = useAuthStore();
  const [overrides, setOverrides] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // Load existing config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/map/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOverrides(res.data.overrides || {});
      } catch (e) {
        console.error('Failed to load map config', e);
      }
    };
    fetchConfig();
  }, [token]);

  // Resolved sections for current label/color display in the edit panel
  const resolved = getResolvedSections(overrides);

  const handleSectionClick = (sectionId) => {
    setSelectedId(sectionId);
  };

  const updateOverride = (field, value) => {
    if (!selectedId) return;
    setOverrides(prev => ({
      ...prev,
      [selectedId]: {
        ...(prev[selectedId] || {}),
        [field]: value,
      }
    }));
  };

  const saveConfig = async () => {
    try {
      setSaveStatus('saving');
      await axios.post('http://127.0.0.1:8000/map/config', { overrides }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (e) {
      console.error('Save failed', e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const currentSection = selectedId ? resolved[selectedId] : null;
  const currentOverride = selectedId ? (overrides[selectedId] || {}) : {};

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full pb-32">
      <header className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4 mt-2 md:mt-6">
        <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Map Editor
        </h1>
        <p className="text-gray-400 mt-2 font-medium">
          Click any section to rename or recolor it. Changes are saved to the database.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* SVG Canvas */}
        <div className="flex-1 bg-gray-900 border-2 border-gray-700 rounded-3xl p-4 md:p-6 shadow-2xl">
          <StadiumSVG
            overrides={overrides}
            onSectionClick={handleSectionClick}
            selectedId={selectedId}
            interactive={true}
          />
        </div>

        {/* Desktop Edit Panel (right sidebar) */}
        {selectedId && currentSection && (
          <div className="hidden lg:flex flex-col w-72 shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6 gap-5 self-start sticky top-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Section</h3>
              <button onClick={() => setSelectedId(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition min-w-[48px] min-h-[48px] flex items-center justify-center">
                <X size={18} />
              </button>
            </div>

            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-xl text-sm font-mono text-gray-500">
              ID: {selectedId}
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium uppercase tracking-wider">Label</label>
              <input
                type="text"
                value={currentOverride.label || currentSection.label}
                onChange={(e) => updateOverride('label', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-base text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-googleBlue"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block font-medium uppercase tracking-wider">Color</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c}
                    onClick={() => updateOverride('color', c)}
                    className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 min-w-[48px] min-h-[48px] flex items-center justify-center ${
                      (currentOverride.color || currentSection.color) === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <input
                type="text"
                placeholder="#HEX"
                value={currentOverride.color || ''}
                onChange={(e) => updateOverride('color', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-base text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-googleBlue font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet Panel with Backdrop */}
      {selectedId && currentSection && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedId(null)}
          />
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-t-3xl shadow-2xl p-5 pb-8 animate-slide-up">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit: {currentSection.label}</h3>
              <button 
                onClick={() => setSelectedId(null)} 
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium uppercase tracking-wider">Label</label>
                <input
                  type="text"
                  value={currentOverride.label || currentSection.label}
                  onChange={(e) => updateOverride('label', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-base text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-googleBlue"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium uppercase tracking-wider">Color Swatches</label>
                <div className="grid grid-cols-5 gap-2 pb-2">
                  {COLOR_PRESETS.map(c => (
                    <button
                      key={c}
                      onClick={() => updateOverride('color', c)}
                      className={`w-full aspect-square rounded-lg border-2 transition-transform active:scale-90 ${
                        (currentOverride.color || currentSection.color) === c ? 'border-googleBlue scale-105' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Select color ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* FAB — Save Button */}
      <button
        onClick={saveConfig}
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

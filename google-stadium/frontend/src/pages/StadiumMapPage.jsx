import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import StadiumSVG, { MAP_COORDS, getResolvedSections } from '../components/StadiumSVG';

export default function StadiumMapPage() {
  const { token } = useAuthStore();
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/map/config`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOverrides(res.data.overrides || {});
      } catch (e) {
        console.error('Failed to load map config', e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [token]);

  const resolved = getResolvedSections(overrides);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto w-full pb-24">
      <header className="mb-6 border-b border-gray-300 dark:border-gray-800 pb-5 mt-2 md:mt-6">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent uppercase tracking-tight">
          Stadium Map
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 font-semibold">
          Interactive venue layout — find your way around the stadium.
        </p>
      </header>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs font-medium text-blue-300 uppercase tracking-wider">Blocks</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-500/30 bg-green-500/10">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-green-300 uppercase tracking-wider">Gates</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-xs font-medium text-orange-300 uppercase tracking-wider">Food</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-xs font-medium text-yellow-300 uppercase tracking-wider">Restrooms</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-4 border-googleBlue border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="bg-gray-900 border-2 border-gray-700 rounded-3xl p-4 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-googleBlue via-googleGreen to-googleYellow opacity-50"></div>
            <StadiumSVG overrides={overrides} />
          </div>

          {/* Section directory */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(resolved).map(([id, sec]) => (
              <div
                key={id}
                className="p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm flex items-center gap-3"
              >
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: sec.color }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{sec.label}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{id}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

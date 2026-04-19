import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API = import.meta.env.VITE_API_URL || "https://google-stadium-backend.onrender.com";

export default function AdminGates() {
  const token = useAuthStore((state) => state.token);
  const [loadingGate, setLoadingGate] = useState(null);

  const updateGateStatus = async (gateId, newStatus) => {
    setLoadingGate(gateId);
    try {
      await axios.put(`${API}/gates/${gateId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to update gate:", err);
    }
    setLoadingGate(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto w-full">
      <header className="mb-8 border-b border-gray-300 dark:border-gray-800 pb-5 mt-2 md:mt-6">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Live Gate Controls</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 font-semibold">Manage incoming crowd traffic globally. Updates are instantly broadcasted to fans.</p>
      </header>

      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-300 dark:border-gray-700 h-max mb-6">
        <h2 className="text-2xl font-black mb-6 text-gray-900 dark:text-white uppercase tracking-tight">Gate Traffic Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((gateNum) => (
            <div key={gateNum} className="p-5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col gap-4 shadow-inner">
              <div>
                <p className="font-black text-gray-900 dark:text-white text-lg">Gate {gateNum}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live status</p>
              </div>
              <select 
                className={`w-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-xs font-black rounded-xl p-3 focus:ring-2 focus:ring-googleBlue outline-none hover:bg-gray-50 dark:hover:bg-gray-700 transition appearance-none cursor-pointer ${loadingGate === gateNum ? 'opacity-50 cursor-wait' : ''}`}
                onChange={(e) => updateGateStatus(gateNum, e.target.value)}
                disabled={loadingGate === gateNum}
                defaultValue="Low Traffic"
              >
                <option value="Low Traffic">Low Traffic</option>
                <option value="Medium Traffic">Medium Traffic</option>
                <option value="High Traffic">High Traffic</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

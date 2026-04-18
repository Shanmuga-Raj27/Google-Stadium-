import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export default function AdminGates() {
  const token = useAuthStore((state) => state.token);
  const [loadingGate, setLoadingGate] = useState(null);

  const updateGateStatus = async (gateId, newStatus) => {
    setLoadingGate(gateId);
    try {
      await axios.put(`http://127.0.0.1:8000/gates/${gateId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to update gate:", err);
    }
    setLoadingGate(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <header className="mb-8 border-b border-gray-800 pb-4 mt-6">
        <h1 className="text-4xl font-semibold text-white">Live Gate Controls</h1>
        <p className="text-gray-400 mt-2">Manage incoming crowd traffic globally. Updates are instantly broadcasted to fans.</p>
      </header>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 h-max mb-6">
        <h2 className="text-xl font-bold mb-4 text-white">Gate Traffic Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((gateNum) => (
            <div key={gateNum} className="p-4 bg-gray-900 border border-gray-700 rounded-xl flex flex-col gap-3">
              <div>
                <p className="font-semibold text-white">Gate {gateNum}</p>
                <p className="text-xs text-gray-400">Manage live congestion</p>
              </div>
              <select 
              className={`bg-gray-800 border border-gray-600 text-white text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-700 transition ${loadingGate === gateNum ? 'opacity-50 cursor-wait' : ''}`}
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

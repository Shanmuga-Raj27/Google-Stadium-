import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import ChatWidget from '../components/ChatWidget';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://google-stadium-backend.onrender.com";
        const res = await axios.get(`${apiUrl}/vendors/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [token]);

  const roleBadge = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'vendor': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
      <header className="mb-8 border-b border-gray-300 dark:border-gray-800 pb-5 mt-2 md:mt-6">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent uppercase tracking-tight">
          Admin Console
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 font-semibold">Manage system users, vendors, and global stadium configurations.</p>
      </header>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-3xl shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mb-1">Total Users</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{users.length}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-3xl shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mb-1">Fans</p>
          <p className="text-3xl font-black text-googleBlue mt-1">{users.filter(u => u.role === 'fan').length}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-3xl shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mb-1">Vendors</p>
          <p className="text-3xl font-black text-orange-500 mt-1">{users.filter(u => u.role === 'vendor').length}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-3xl shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mb-1">Admins</p>
          <p className="text-3xl font-black text-purple-600 mt-1">{users.filter(u => u.role === 'admin').length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-300 dark:border-gray-700">
        <h2 className="text-2xl font-black mb-6 text-gray-900 dark:text-white uppercase tracking-tight">System Users & Vendors</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700 text-gray-500">
                <th className="py-3 px-4 font-semibold uppercase text-xs">ID</th>
                <th className="py-3 px-4 font-semibold uppercase text-xs">Username</th>
                <th className="py-3 px-4 font-semibold uppercase text-xs">Email</th>
                <th className="py-3 px-4 font-semibold uppercase text-xs">Role</th>
                <th className="py-3 px-4 font-semibold uppercase text-xs">Store Name</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.id}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{u.username}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.email || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${roleBadge(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.vendor_profile?.store_name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}

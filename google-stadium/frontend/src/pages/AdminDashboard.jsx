import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/vendors/admin/users', {
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
      <header className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 mt-2 md:mt-6">
        <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Admin Console
        </h1>
        <p className="text-gray-400 mt-2 font-medium">Manage users and global stadium settings.</p>
      </header>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md">
          <p className="text-sm text-gray-500 font-medium">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{users.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md">
          <p className="text-sm text-gray-500 font-medium">Fans</p>
          <p className="text-3xl font-bold text-googleBlue mt-1">{users.filter(u => u.role === 'fan').length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md">
          <p className="text-sm text-gray-500 font-medium">Vendors</p>
          <p className="text-3xl font-bold text-orange-400 mt-1">{users.filter(u => u.role === 'vendor').length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md">
          <p className="text-sm text-gray-500 font-medium">Admins</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{users.filter(u => u.role === 'admin').length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">System Users & Vendors</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500">
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
    </div>
  );
}

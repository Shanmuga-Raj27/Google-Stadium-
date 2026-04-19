import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export default function VendorWallet() {
  const { token, user } = useAuthStore();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://google-stadium-backend.onrender.com";
        const res = await axios.get(`${apiUrl}/vendors/${user.id}/wallet`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWallet(res.data);
      } catch (e) {
        console.error('Failed to fetch wallet', e);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [token, user.id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-googleBlue border-t-transparent"></div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="p-6">
        <p className="text-gray-400 text-center py-20 italic">Unable to load wallet data.</p>
      </div>
    );
  }

  const kpis = [
    { 
      label: 'Total Revenue', 
      value: `₹${wallet.total_sales.toFixed(2)}`, 
      icon: '💰',
      colorBg: 'bg-emerald-500/10 border-emerald-500/30',
      colorText: 'text-emerald-400',
      colorValue: 'text-emerald-300'
    },
    { 
      label: 'Total Orders', 
      value: wallet.total_orders, 
      icon: '📦',
      colorBg: 'bg-blue-500/10 border-blue-500/30',
      colorText: 'text-blue-400',
      colorValue: 'text-blue-300'
    },
    { 
      label: 'Pending Orders', 
      value: wallet.pending_orders, 
      icon: '⏳',
      colorBg: 'bg-orange-500/10 border-orange-500/30',
      colorText: 'text-orange-400',
      colorValue: 'text-orange-300'
    },
    { 
      label: 'Completed', 
      value: wallet.completed_orders, 
      icon: '✅',
      colorBg: 'bg-googleGreen/10 border-googleGreen/30',
      colorText: 'text-googleGreen',
      colorValue: 'text-googleGreen'
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'preparing': return 'bg-googleYellow/20 text-googleYellow border-googleYellow/30';
      case 'ready': return 'bg-googleBlue/20 text-googleBlue border-googleBlue/30';
      case 'delivered': return 'bg-googleGreen/20 text-googleGreen border-googleGreen/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full pb-24">
      <header className="mb-8 border-b border-gray-300 dark:border-gray-800 pb-4 mt-2 md:mt-6">
        <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Vendor Wallet</h1>
        <p className="text-gray-400 mt-2 font-medium">Your financial overview and order history</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`p-5 border-2 rounded-2xl ${kpi.colorBg} transition hover:scale-[1.02]`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{kpi.icon}</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${kpi.colorText}`}>{kpi.label}</span>
            </div>
            <p className={`text-3xl md:text-4xl font-bold ${kpi.colorValue}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Order History Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            📋 Order History
            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">{wallet.order_history.length} records</span>
          </h2>
        </div>
        
        {wallet.order_history.length === 0 ? (
          <div className="p-12 text-center text-gray-400 italic">
            No orders yet. Orders will appear here once fans start ordering.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Order ID</th>
                  <th className="text-left p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Item</th>
                  <th className="text-left p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Seat</th>
                  <th className="text-right p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Total Paid</th>
                  <th className="text-center p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {wallet.order_history.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="p-4 font-bold text-gray-900 dark:text-white">#{order.id}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 font-medium">{order.item}</td>
                    <td className="p-4 text-gray-500 text-xs">
                      {order.block && order.row && order.seat 
                        ? `${order.block}-${order.row}-${order.seat}` 
                        : '—'
                      }
                    </td>
                    <td className="p-4 text-right font-bold text-googleGreen">₹{order.total_price.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

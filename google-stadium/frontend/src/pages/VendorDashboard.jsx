import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import ChatWidget from '../components/ChatWidget';

const API = import.meta.env.VITE_API_URL || "https://google-stadium-backend.onrender.com";

export default function VendorDashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const { token, user, logout } = useAuthStore();
  const [menuForm, setMenuForm] = useState({ name: '', price: '', icon: '🍔' });
  // Vendor message modal state
  const [messageModal, setMessageModal] = useState({ open: false, orderIdx: null, orderId: null, nextStatus: null });
  const [vendorMessage, setVendorMessage] = useState('');

  const QUICK_MESSAGES = [
    'Ready at Counter 2',
    'Out for delivery',
    'Pickup at Gate A',
    'Coming to your seat now!',
    'Please collect from stall'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/vendors/`, { headers: { Authorization: `Bearer ${token}` }});
        const myProfile = res.data.find(v => v.id === user.id);
        if (myProfile && myProfile.vendor_profile) {
          setMenuItems(myProfile.vendor_profile.menu_items || []);
        }
      } catch(e) {}
    };
    // Fetch persistent active orders from API (fixes state-loss on refresh)
    const fetchActiveOrders = async () => {
      try {
        const res = await axios.get(`${API}/orders/vendor/${user.id}/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const mapped = res.data.map(o => ({
          order_id: o.id,
          item: o.item,
          block: o.block,
          row: o.row,
          seat: o.seat,
          user_id: o.user_id,
          delivery_method: o.delivery_method,
          total_price: o.total_price,
          freebies: o.freebies,
          _localStatus: o.status,
          _vendorMessage: o.vendor_message,
          type: 'NEW_ORDER'
        }));
        setOrders(mapped);
      } catch (e) {
        console.error('Failed to fetch active orders', e);
      }
    };
    fetchData();
    fetchActiveOrders();
  }, [token, user.id]);

  // Block-scoped WebSocket — strict StrictMode cleanup pattern
  useEffect(() => {
    if (!user) return;
    let isCancelled = false;
    
    // Dynamic protocol: Convert http/https API URL to ws/wss
    const apiUrl = import.meta.env.VITE_API_URL || "https://google-stadium-backend.onrender.com";
    const wsBase = apiUrl.replace(/^http/, 'ws');
    const wsUrl = `${wsBase}/ws/${user.id}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      if (!isCancelled) console.log("Vendor WS Connected");
    };

    socket.onmessage = (event) => {
      if (isCancelled) return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'NEW_ORDER') {
          setOrders(prev => [{ ...msg, _localStatus: 'pending' }, ...prev]);
        }
      } catch (e) { console.error("Vendor WS parse error", e); }
    };

    socket.onerror = (error) => {
      if (!isCancelled) console.error("Vendor WS Error:", error);
    };

    return () => {
      isCancelled = true;
      // Strict cleanup: guard against null/already-closed sockets
      if (socket && socket.readyState === 1) {
        socket.close();
      }
    };
  }, [user]);

  const handleAddMenu = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/vendors/menu`, {
        name: menuForm.name,
        description: '',
        price: parseFloat(menuForm.price),
        icon: menuForm.icon
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMenuItems([...menuItems, res.data]);
      setMenuForm({ name: '', price: '', icon: '🍔' });
    } catch(err) {
      console.error(err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, idx, message = null) => {
    try {
      await axios.put(`${API}/orders/${orderId}/${newStatus}`, 
        message ? { vendor_message: message } : {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newOrders = [...orders];
      newOrders[idx]._localStatus = newStatus;
      if (message) newOrders[idx]._vendorMessage = message;
      setOrders(newOrders);
    } catch(e) {
      console.error(e);
    }
  };

  const handleStatusAction = (orderId, nextStatus, idx) => {
    // Open message modal for "ready" status — vendor can attach a message
    if (nextStatus === 'ready') {
      setMessageModal({ open: true, orderIdx: idx, orderId, nextStatus });
      setVendorMessage('');
    } else {
      updateOrderStatus(orderId, nextStatus, idx);
    }
  };

  const submitWithMessage = () => {
    const { orderId, nextStatus, orderIdx } = messageModal;
    updateOrderStatus(orderId, nextStatus, orderIdx, vendorMessage || null);
    setMessageModal({ open: false, orderIdx: null, orderId: null, nextStatus: null });
    setVendorMessage('');
  };

  const getNextAction = (status) => {
    switch (status) {
      case 'pending': return { label: 'Start Preparing', next: 'preparing', color: 'bg-googleYellow hover:bg-yellow-500 text-black' };
      case 'preparing': return { label: 'Mark as Ready', next: 'ready', color: 'bg-googleBlue hover:bg-blue-600 text-white' };
      case 'ready': return { label: 'Confirm Delivered', next: 'delivered', color: 'bg-googleGreen hover:bg-green-600 text-white' };
      default: return null;
    }
  };

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
    <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
      <header className="mb-8 border-b border-gray-300 dark:border-gray-800 pb-4 mt-2 md:mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-tight">Vendor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-semibold">Store Node: <span className="text-gray-900 dark:text-white">{user.username}</span> | Manage live orders and menu availability.</p>
        </div>
      </header>

      {/* Vendor Message Modal Overlay */}
      {messageModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">💬 Add Message for Fan</h3>
            <p className="text-sm text-gray-500 mb-4">Optional: Attach a delivery instruction or pickup note.</p>
            
            {/* Quick-select templates */}
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_MESSAGES.map(msg => (
                <button 
                  key={msg}
                  onClick={() => setVendorMessage(msg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    vendorMessage === msg 
                      ? 'bg-googleBlue/10 border-googleBlue text-googleBlue' 
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {msg}
                </button>
              ))}
            </div>
            
            <textarea
              value={vendorMessage}
              onChange={(e) => setVendorMessage(e.target.value)}
              placeholder="Or type a custom message..."
              rows={3}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-googleBlue resize-none"
            />
            
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setMessageModal({ open: false, orderIdx: null, orderId: null, nextStatus: null })}
                className="flex-1 p-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition"
              >
                Cancel
              </button>
              <button 
                onClick={submitWithMessage}
                className="flex-1 p-3 rounded-xl font-bold bg-googleBlue hover:bg-blue-600 text-white shadow-lg transition active:scale-95"
              >
                Mark as Ready
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Menu Manager */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 border border-gray-300 dark:border-gray-700 rounded-3xl shadow-sm flex flex-col gap-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">🛒 Menu Admin</h2>
          <form className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-300 dark:border-gray-700 flex flex-col gap-5" onSubmit={handleAddMenu}>
            <h3 className="font-bold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700 pb-3 uppercase text-xs tracking-widest">Add New Item</h3>
            <div className="flex flex-wrap gap-4">
              <div className="w-20">
                <label className="text-[10px] text-gray-500 mb-1 block font-black uppercase tracking-widest">Icon</label>
                <input required type="text" className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-center text-2xl shadow-inner focus:ring-2 focus:ring-googleBlue outline-none" value={menuForm.icon} onChange={e=>setMenuForm({...menuForm, icon: e.target.value})} />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="text-[10px] text-gray-500 mb-1 block font-black uppercase tracking-widest">Item Name</label>
                <input required type="text" className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white font-bold placeholder:text-gray-400 shadow-inner focus:ring-2 focus:ring-googleBlue outline-none" value={menuForm.name} onChange={e=>setMenuForm({...menuForm, name: e.target.value})} placeholder="Spicy Nachos" />
              </div>
              <div className="w-32">
                <label className="text-[10px] text-gray-500 mb-1 block font-black uppercase tracking-widest">Price (₹)</label>
                <input required type="number" step="0.01" className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white font-bold shadow-inner focus:ring-2 focus:ring-googleBlue outline-none" value={menuForm.price} onChange={e=>setMenuForm({...menuForm, price: e.target.value})} placeholder="199" />
              </div>
            </div>
            <button type="submit" className="p-4 bg-googleBlue hover:bg-blue-600 rounded-xl font-black text-white mt-2 transition-all shadow-lg active:scale-95 text-sm uppercase tracking-widest">+ Publish to Menu</button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
            {menuItems.map(m => (
              <div key={m.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center gap-4">
                <span className="text-4xl drop-shadow-lg">{m.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{m.name}</h4>
                  <p className="text-sm font-semibold text-emerald-500">₹{Number(m.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Queue */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 border border-gray-300 dark:border-gray-700 rounded-3xl shadow-sm min-h-[500px]">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-gray-900 dark:text-white uppercase tracking-tight">
             ⚡ Live Queue 
             <span className="flex h-4 w-4 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
             </span>
          </h2>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-gray-400 italic border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
              <span className="text-5xl mb-4 opacity-20">📥</span>
              Awaiting incoming orders...
            </div>
          ) : (
            <ul className="space-y-5">
              {orders.map((o, i) => {
                const action = getNextAction(o._localStatus);
                return (
                  <li key={i} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-sm transition-all hover:border-gray-400">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-black text-2xl text-gray-900 dark:text-white">#{o.order_id}</span>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${getStatusBadge(o._localStatus)}`}>
                            {o._localStatus}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">{o.item}</p>
                        {o.total_price > 0 && (
                          <p className="text-sm font-bold text-googleGreen mt-1">₹{o.total_price.toFixed(2)}</p>
                        )}
                        {(o.block || o.row || o.seat) && (
                          <p className="text-sm text-googleBlue font-bold mt-2 flex items-center gap-1">
                            📍 Deliver to: Block {o.block}, Row {o.row}, Seat {o.seat}
                          </p>
                        )}
                        {o.delivery_method && (
                          <p className="text-xs text-gray-500 mt-1 font-medium">
                            {o.delivery_method === 'seat_delivery' ? '🛵 Seat Delivery' : '🚶 Pickup'}
                          </p>
                        )}
                        {o._vendorMessage && (
                          <p className="text-xs text-googleBlue mt-1 italic">💬 "{o._vendorMessage}"</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {action ? (
                          <button 
                            onClick={() => handleStatusAction(o.order_id, action.next, i)} 
                            className={`p-3 md:px-5 md:py-3 rounded-xl font-bold shadow-md transition active:scale-95 text-sm ${action.color}`}
                          >
                            {action.label}
                          </button>
                        ) : (
                          <span className="px-4 py-2 bg-googleGreen/20 text-googleGreen border border-googleGreen/30 rounded-lg font-bold uppercase tracking-wider text-sm">
                            ✓ Delivered
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
      <ChatWidget />
    </div>
  );
}

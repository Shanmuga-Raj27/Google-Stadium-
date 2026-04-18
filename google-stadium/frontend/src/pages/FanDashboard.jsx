import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import StadiumSVG, { MAP_COORDS } from '../components/StadiumSVG';

const ORDER_STEPS = ['pending', 'preparing', 'ready', 'delivered'];

function OrderStepper({ status }) {
  const currentIdx = ORDER_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3">
      {ORDER_STEPS.map((step, idx) => {
        const isActive = idx <= currentIdx;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${
                isActive ? 'bg-googleBlue border-googleBlue text-white' : 'bg-gray-700 border-gray-600 text-gray-400'
              }`}>
                {idx + 1}
              </div>
              <span className={`text-[10px] mt-1 capitalize font-medium ${isActive ? 'text-googleBlue' : 'text-gray-500'}`}>{step}</span>
            </div>
            {idx < ORDER_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 transition-colors duration-300 ${idx < currentIdx ? 'bg-googleBlue' : 'bg-gray-600'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Resolves a user-typed block string (e.g. "A", "Block A", "block-A")
 * to the corresponding MAP_COORDS key.
 */
function resolveBlockKey(blockStr) {
  if (!blockStr) return null;
  const normalized = blockStr.trim().toUpperCase();
  // Direct match: "A" -> "block-A"
  if (MAP_COORDS[`block-${normalized}`]) return `block-${normalized}`;
  // Match typed "Block A" -> "block-A"
  const match = normalized.match(/^BLOCK\s*([A-D])$/);
  if (match && MAP_COORDS[`block-${match[1]}`]) return `block-${match[1]}`;
  // Full key match: "block-A"
  const lower = blockStr.trim().toLowerCase();
  if (MAP_COORDS[lower]) return lower;
  return null;
}

export default function FanDashboard() {
  const [vendors, setVendors] = useState([]);
  const [activeVendor, setActiveVendor] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [location, setLocation] = useState({ block: '', row: '', seat: '' });
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [mapOverrides, setMapOverrides] = useState({});
  const [gates, setGates] = useState({
    1: 'Low Traffic',
    2: 'Medium Traffic',
    3: 'High Traffic',
    4: 'Low Traffic'
  });
  const { token, user } = useAuthStore();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/vendors/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVendors(res.data);
      } catch(e) {}
    };
    fetchVendors();
  }, [token]);

  // Fetch admin map config for custom labels/colors
  useEffect(() => {
    const fetchMapConfig = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/map/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMapOverrides(res.data.overrides || {});
      } catch (e) {}
    };
    fetchMapConfig();
  }, [token]);

  useEffect(() => {
    const fetchGates = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/gates/status');
        setGates(res.data);
      } catch (e) {}
    };
    fetchGates();
  }, []);

  // Block-scoped WebSocket — strict StrictMode cleanup pattern
  useEffect(() => {
    if (!user) return;
    let isCancelled = false;
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/${user.id}`);

    socket.onopen = () => {
      if (!isCancelled) console.log("Fan WS Connected");
    };
    
    socket.onmessage = (event) => {
      if (isCancelled) return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ORDER_STATUS_UPDATE') {
          const d = msg.data;
          setActiveOrders(prev => prev.map(o => o.order_id === d.order_id ? { ...o, status: d.status, vendor_message: d.vendor_message } : o));
          if (d.status === 'ready') {
            alert(`🚀 Your order "${d.item}" is READY! ${d.vendor_message ? 'Message: ' + d.vendor_message : `Block ${d.block}, Row ${d.row}`}`);
          }
        } else if (msg.type === 'GATE_UPDATE') {
          setGates(prev => ({
            ...prev,
            [msg.data.gate_id]: msg.data.status
          }));
        }
      } catch (e) { console.error("WS parse error", e); }
    };

    socket.onerror = (error) => {
      if (!isCancelled) console.error("Fan WS Error:", error);
    };

    return () => {
      isCancelled = true;
      if (socket && socket.readyState === 1) {
        socket.close();
      }
    };
  }, [user]);

  const placeOrder = async (menuItem) => {
    if (!location.block || !location.row || !location.seat) {
      alert("Please enter your seat location (Block, Row, Seat) before ordering.");
      return;
    }
    try {
      setOrderStatus(`Placing order for ${menuItem.name}...`);
      const res = await axios.post('http://127.0.0.1:8000/orders/', {
        user_id: user.id,
        vendor_id: activeVendor.id,
        menu_item_id: menuItem.id,
        item: menuItem.name,
        block: location.block,
        row: location.row,
        seat: location.seat,
        delivery_method: deliveryMethod
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      const orderData = res.data;
      setActiveOrders(prev => [...prev, { 
        order_id: orderData.id, 
        item: menuItem.name, 
        status: 'pending',
        total_price: orderData.total_price,
        delivery_fee: orderData.delivery_fee,
        freebies: orderData.freebies,
        delivery_method: orderData.delivery_method,
        vendor_message: null,
        block: location.block
      }]);
      
      let statusMsg = `Order #${orderData.id} placed! Total: ₹${orderData.total_price.toFixed(2)}`;
      if (orderData.freebies && orderData.freebies.length > 0) {
        statusMsg += ` | 🎉 Freebies: ${orderData.freebies.join(', ')}!`;
      }
      setOrderStatus(statusMsg);
    } catch(e) {
      setOrderStatus('Error placing order.');
    }
  };

  // Compute preview pricing (client-side mirror for display only)
  const getPreviewPricing = (price) => {
    const subtotal = Number(price);
    let fee = deliveryMethod === 'seat_delivery' ? 60 : 0;
    let freebies = [];
    if (subtotal > 500) { fee = 0; freebies = ['Water Bottle', 'Snacks']; }
    else if (subtotal > 200) { fee = deliveryMethod === 'seat_delivery' ? 30 : 0; freebies = ['Water Bottle', 'Snacks']; }
    else if (subtotal > 150) { freebies = ['Water Bottle', 'Snacks']; }
    else if (subtotal > 100) { freebies = ['Water Bottle']; }
    return { subtotal, fee, total: subtotal + fee, freebies };
  };

  // Resolve tracking coordinates for the first active non-delivered order
  const trackingOrder = activeOrders.find(o => o.status !== 'delivered');
  const fanKey = trackingOrder ? resolveBlockKey(trackingOrder.block || location.block) : resolveBlockKey(location.block);
  const fanCoords = fanKey ? MAP_COORDS[fanKey] : null;
  
  // Dynamic vendor mapping: get the stall_id from the active vendor's profile
  const vendorStallKey = activeVendor?.vendor_profile?.stall_id || 'stall-1';
  const vendorCoords = trackingOrder ? MAP_COORDS[vendorStallKey] : null;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full pb-24">
      <header className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 mt-2 md:mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Google Stadium v3</h1>
          <p className="text-gray-400 mt-2 font-medium">Hello, {user?.username}! Order directly to your seat.</p>
        </div>
      </header>

      {/* Seat Location Input */}
      <div className="mb-8 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">📍 Your Seat Location</h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[80px]">
            <label className="text-xs text-gray-500 mb-1 block font-medium">Block</label>
            <input type="text" placeholder="A" value={location.block} onChange={e => setLocation({...location, block: e.target.value})}
              className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-base text-gray-900 dark:text-white text-center font-bold uppercase outline-none focus:ring-2 focus:ring-googleBlue" />
          </div>
          <div className="flex-1 min-w-[80px]">
            <label className="text-xs text-gray-500 mb-1 block font-medium">Row</label>
            <input type="text" placeholder="3" value={location.row} onChange={e => setLocation({...location, row: e.target.value})}
              className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-base text-gray-900 dark:text-white text-center font-bold outline-none focus:ring-2 focus:ring-googleBlue" />
          </div>
          <div className="flex-1 min-w-[80px]">
            <label className="text-xs text-gray-500 mb-1 block font-medium">Seat</label>
            <input type="text" placeholder="12" value={location.seat} onChange={e => setLocation({...location, seat: e.target.value})}
              className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-base text-gray-900 dark:text-white text-center font-bold outline-none focus:ring-2 focus:ring-googleBlue" />
          </div>
        </div>
        
        {/* Delivery Method Toggle */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <label className="text-xs text-gray-500 mb-2 block font-medium uppercase tracking-wider">Delivery Method</label>
          <div className="flex gap-3">
            <button 
              onClick={() => setDeliveryMethod('pickup')}
              className={`flex-1 p-3 rounded-xl font-bold text-sm border-2 transition-all duration-200 min-h-[48px] ${
                deliveryMethod === 'pickup' 
                  ? 'bg-googleGreen/10 border-googleGreen text-googleGreen shadow-lg shadow-googleGreen/10' 
                  : 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-gray-400'
              }`}
            >
              🚶 Pickup <span className="block text-xs font-medium mt-0.5 opacity-70">Free</span>
            </button>
            <button 
              onClick={() => setDeliveryMethod('seat_delivery')}
              className={`flex-1 p-3 rounded-xl font-bold text-sm border-2 transition-all duration-200 min-h-[48px] ${
                deliveryMethod === 'seat_delivery' 
                  ? 'bg-googleBlue/10 border-googleBlue text-googleBlue shadow-lg shadow-googleBlue/10' 
                  : 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-500 hover:border-gray-400'
              }`}
            >
              🛵 Seat Delivery <span className="block text-xs font-medium mt-0.5 opacity-70">+₹60</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Order Tracker */}
      {orderStatus && (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-900/50 to-blue-900/50 border border-emerald-500/50 rounded-xl shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-emerald-100 font-semibold">{orderStatus}</span>
            </div>
            <button onClick={() => setOrderStatus(null)} className="text-emerald-400 hover:text-emerald-300 font-bold p-2 min-w-[48px] min-h-[48px]">Dismiss</button>
        </div>
      )}

      {/* Live Tracking Map — shown when there's an active order */}
      {trackingOrder && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📡 Live Delivery Tracking</h2>
          <div className="relative bg-gray-900 border-2 border-gray-700 rounded-3xl p-3 md:p-4 shadow-2xl">
            {/* SVG stadium with admin overrides applied */}
            <StadiumSVG overrides={mapOverrides} />

            {/* Tracking overlays — positioned absolutely on top of the SVG */}
            {/* The SVG viewBox is 800x800, so we use percentage positioning */}

            {/* Animated SVG route line */}
            {fanCoords && vendorCoords && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 800 800"
                preserveAspectRatio="xMidYMid meet"
                style={{ top: 0, left: 0 }}
              >
                <line
                  x1={fanCoords.x} y1={fanCoords.y}
                  x2={vendorCoords.x} y2={vendorCoords.y}
                  stroke="#4285F4"
                  strokeWidth="3"
                  strokeDasharray="12 6"
                  strokeLinecap="round"
                  opacity="0.7"
                >
                  <animate attributeName="stroke-dashoffset" from="0" to="36" dur="1.5s" repeatCount="indefinite" />
                </line>
              </svg>
            )}

            {/* Blue dot — Fan location */}
            {fanCoords && (
              <div
                className="absolute z-30 pointer-events-none"
                style={{
                  left: `${(fanCoords.x / 800) * 100}%`,
                  top: `${(fanCoords.y / 800) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <span className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 border-2 border-white/50" />
                </span>
              </div>
            )}

            {/* Orange dot — Vendor location */}
            {vendorCoords && (
              <div
                className="absolute z-30 pointer-events-none"
                style={{
                  left: `${(vendorCoords.x / 800) * 100}%`,
                  top: `${(vendorCoords.y / 800) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <span className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-orange-500 border-2 border-white/50" />
                </span>
              </div>
            )}
          </div>

          {/* Tracking legend */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
              </span>
              <span className="text-gray-400 font-medium">Your Location ({fanKey || 'Unknown'})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
              </span>
              <span className="text-gray-400 font-medium">Vendor (Food Court 1)</span>
            </div>
          </div>
        </div>
      )}

      {/* My Active Orders */}
      {activeOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🛵 My Active Orders</h2>
          <div className="space-y-4">
            {activeOrders.filter(o => o.status !== 'delivered').map(o => (
              <div key={o.order_id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">Order #{o.order_id}</span>
                    <p className="text-sm text-gray-500 mt-0.5">{o.item}</p>
                    {o.total_price > 0 && (
                      <p className="text-sm font-semibold text-googleGreen mt-1">₹{o.total_price.toFixed(2)}
                        {o.delivery_fee > 0 && <span className="text-gray-400 font-normal ml-2">(incl. ₹{o.delivery_fee.toFixed(2)} delivery)</span>}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    o.status === 'ready' ? 'bg-googleGreen/20 text-googleGreen border border-googleGreen/30' :
                    o.status === 'preparing' ? 'bg-googleYellow/20 text-googleYellow border border-googleYellow/30' :
                    'bg-googleBlue/20 text-googleBlue border border-googleBlue/30'
                  }`}>{o.status}</span>
                </div>
                
                {/* Freebies Banner */}
                {o.freebies && o.freebies.length > 0 && (
                  <div className="mt-3 p-2.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2">
                    <span className="text-lg">🎉</span>
                    <span className="text-sm font-bold text-amber-500">Free: {o.freebies.join(' + ')}</span>
                  </div>
                )}
                
                {/* Vendor Message */}
                {o.vendor_message && (o.status === 'ready' || o.status === 'delivered') && (
                  <div className="mt-3 p-3 bg-googleBlue/5 border border-googleBlue/20 rounded-xl">
                    <p className="text-sm font-semibold text-googleBlue flex items-center gap-2">
                      💬 <span>Message from Vendor:</span>
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 ml-7 italic">{o.vendor_message}</p>
                  </div>
                )}
                
                <OrderStepper status={o.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gate Status UI */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🏟️ Gate Status</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4 snap-x">
          {[1, 2, 3, 4].map(gateNum => {
            const status = gates[gateNum] || 'Low Traffic';
            const themeMap = {
                'Low Traffic': { bg: 'bg-googleGreen/10 border-googleGreen/30', text: 'text-googleGreen', badge: 'bg-googleGreen/20 text-googleGreen' },
                'Medium Traffic': { bg: 'bg-googleYellow/10 border-googleYellow/30', text: 'text-googleYellow', badge: 'bg-googleYellow/20 text-googleYellow' },
                'High Traffic': { bg: 'bg-googleRed/10 border-googleRed/30', text: 'text-googleRed', badge: 'bg-googleRed/20 text-googleRed' },
                'Closed': { bg: 'bg-gray-500/10 border-gray-500/30', text: 'text-gray-500', badge: 'bg-gray-500/20 text-gray-500' }
            };
            const theme = themeMap[status] || themeMap['Low Traffic'];
            
            return (
              <div key={gateNum} className={`snap-start shrink-0 w-56 md:w-64 border ${theme.bg} p-5 rounded-2xl shadow-md transition-colors duration-500`}>
                <h3 className={`text-lg font-semibold ${theme.text}`}>Gate {gateNum}</h3>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">Live status tracked</p>
                <div className={`mt-3 px-3 py-1 ${theme.badge} text-xs font-bold rounded-lg inline-block uppercase tracking-wide`}>{status}</div>
              </div>
            );
          })}
        </div>
      </div>

      {!activeVendor ? (
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">🍔 Available Vendors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map(v => (
              <div key={v.id} onClick={() => setActiveVendor(v)} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md cursor-pointer hover:shadow-lg transition hover:-translate-y-1 group">
                <div className="h-32 bg-gray-100 dark:bg-gray-900 rounded-xl mb-4 flex items-center justify-center text-5xl">
                    🏪
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-googleBlue transition">{v.vendor_profile?.store_name || v.username}</h3>
                <p className="text-sm text-gray-500 mt-2 flex justify-between items-center">
                    <span>{v.vendor_profile?.menu_items?.length || 0} items</span>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md font-bold text-xs uppercase tracking-wider border border-emerald-500/20">OPEN</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
           <button onClick={() => setActiveVendor(null)} className="mb-6 flex items-center p-3 gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold transition min-h-[48px]">
               ← Back to Vendors
           </button>
           <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">{activeVendor.vendor_profile?.store_name || activeVendor.username} Menu</h2>
           
           <div className="space-y-4">
               {(activeVendor.vendor_profile?.menu_items || []).map(item => {
                 const preview = getPreviewPricing(item.price);
                 return (
                   <div key={item.id} className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md">
                       <div className="flex items-center gap-4 md:gap-6">
                           <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-4xl md:text-6xl shrink-0 drop-shadow-xl">{item.icon}</div>
                           <div className="flex-1 min-w-0">
                               <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">{item.name}</h3>
                               <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 hidden md:block">{item.description || "Fresh and delicious. Order straight to your seat!"}</p>
                               <p className="text-lg font-semibold text-googleGreen">₹{Number(item.price).toFixed(2)}</p>
                           </div>
                           <div className="shrink-0">
                               <button onClick={() => placeOrder(item)} className="px-4 md:px-6 py-3 bg-googleBlue hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition active:scale-95 min-h-[48px]">
                                   Order
                               </button>
                           </div>
                       </div>
                       {/* Pricing Preview */}
                       <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                         <span>Subtotal: ₹{preview.subtotal.toFixed(2)}</span>
                         {preview.fee > 0 && <span className="text-orange-500">+ Delivery: ₹{preview.fee.toFixed(2)}</span>}
                         {preview.fee === 0 && deliveryMethod === 'seat_delivery' && <span className="text-googleGreen">🚚 Free Delivery!</span>}
                         <span className="font-bold text-gray-900 dark:text-white">Total: ₹{preview.total.toFixed(2)}</span>
                         {preview.freebies.length > 0 && (
                           <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-md">
                             🎁 {preview.freebies.join(' + ')}
                           </span>
                         )}
                       </div>
                   </div>
                 );
               })}
               {(!activeVendor.vendor_profile?.menu_items || activeVendor.vendor_profile.menu_items.length === 0) && (
                   <p className="text-gray-500 italic text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">This vendor has not added any menu items yet.</p>
               )}
           </div>
        </>
      )}
    </div>
  );
}

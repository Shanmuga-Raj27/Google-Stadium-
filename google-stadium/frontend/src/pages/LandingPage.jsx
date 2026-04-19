import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-googleBlue to-googleGreen flex items-center justify-center text-white font-black text-lg shadow-lg">
            G
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Google Stadium</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-5 py-2.5 text-gray-300 hover:text-white font-medium transition text-sm">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-googleBlue hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-googleBlue/20 transition text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-googleBlue/10 border border-googleBlue/20 rounded-full text-googleBlue text-sm font-bold mb-8">
            <span className="w-2 h-2 rounded-full bg-googleBlue animate-pulse" />
            Live Stadium Experience Platform
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
            Order Food.
            <br />
            <span className="bg-gradient-to-r from-googleBlue via-googleGreen to-googleYellow bg-clip-text text-transparent">
              Right to Your Seat.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one event experience platform. Browse vendor menus, place orders, 
            track deliveries in real-time, and never miss a moment of the action.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-googleBlue hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-googleBlue/25 transition active:scale-95 text-lg"
            >
              🎟️ Get Started — It's Free
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition text-lg"
            >
              Sign In →
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full pb-16">
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-left">
            <div className="text-3xl mb-3">🍔</div>
            <h3 className="text-white font-bold text-lg mb-2">Browse & Order</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Explore live vendor menus with real-time pricing, promotions, and seat delivery options.
            </p>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-left">
            <div className="text-3xl mb-3">📡</div>
            <h3 className="text-white font-bold text-lg mb-2">Live Tracking</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Watch your order progress with real-time status updates from pending to delivered.
            </p>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-left">
            <div className="text-3xl mb-3">🏟️</div>
            <h3 className="text-white font-bold text-lg mb-2">Stadium Map</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Interactive SVG stadium map with live gate status, vendor locations, and crowd data.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-600 text-sm py-6 border-t border-white/5">
        Built with Google Material Design · © 2024 Google Stadium
      </footer>
    </div>
  );
}

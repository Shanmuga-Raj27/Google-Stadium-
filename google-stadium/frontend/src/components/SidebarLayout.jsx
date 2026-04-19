import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../store/ThemeContext';
import { LayoutDashboard, LogOut, Moon, Sun, User as UserIcon, Menu, Shield, Map, Wallet, PenTool } from 'lucide-react';

export default function SidebarLayout() {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-3 rounded-xl font-bold transition-all ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3'} ${
      isActive 
        ? 'bg-googleBlue text-white shadow-lg shadow-googleBlue/30' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
    }`;

  return (
    <div className="flex h-screen w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors overflow-hidden relative">
      {/* Mobile Top Header */}
      <header className="md:hidden absolute top-0 left-0 w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-800 flex items-center justify-between px-4 z-40">
        <h2 className="text-xl font-bold bg-gradient-to-r from-googleBlue to-googleGreen bg-clip-text text-transparent">
          Google Stadium
        </h2>
        <button className="p-2 text-gray-600 dark:text-gray-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu size={28} />
        </button>
      </header>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'md:w-20 w-72' : 'w-72 md:w-64'} 
          border-r border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col shrink-0 overflow-hidden
        `}
      >
        <div className={`p-4 border-b border-gray-300 dark:border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <h2 className="text-2xl font-bold bg-gradient-to-r from-googleBlue to-googleGreen bg-clip-text text-transparent truncate cursor-default">
              Google Stadium
            </h2>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors hidden md:block"
            title="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className={`p-4 mt-2 border-b border-gray-300 dark:border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 shrink-0 bg-googleBlue/10 dark:bg-googleBlue/20 text-googleBlue flex items-center justify-center rounded-full">
            <UserIcon size={20} className="font-bold" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <p className="font-bold text-sm truncate">{user?.username}</p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider truncate">{user?.role}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          <NavLink
            to={`/${user?.role || 'fan'}-dashboard`}
            end
            className={navLinkClass}
            title="Dashboard"
          >
            <LayoutDashboard size={20} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Dashboard</span>}
          </NavLink>
          
          {/* Stadium Map — accessible to all roles */}
          <NavLink
            to="/map"
            className={navLinkClass}
            title="Stadium Map"
          >
            <Map size={20} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Stadium Map</span>}
          </NavLink>

          {/* Vendor Wallet — vendor only (financials belong to vendors, not admin) */}
          {user?.role === 'vendor' && (
            <NavLink
              to="/vendor/wallet"
              className={navLinkClass}
              title="Wallet & Financials"
            >
              <Wallet size={20} className="shrink-0" />
              {!isCollapsed && <span className="truncate">Wallet</span>}
            </NavLink>
          )}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin/gates"
              className={navLinkClass}
              title="Gate Controls"
            >
              <Shield size={20} className="shrink-0" />
              {!isCollapsed && <span className="truncate">Gate Controls</span>}
            </NavLink>
          )}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin/map-editor"
              className={navLinkClass}
              title="Map Editor"
            >
              <PenTool size={20} className="shrink-0" />
              {!isCollapsed && <span className="truncate">Map Editor</span>}
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-gray-300 dark:border-gray-800 space-y-2">
          <button
            onClick={toggleTheme}
            className={`flex w-full items-center rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'}`}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun size={20} className="text-googleYellow shrink-0" /> : <Moon size={20} className="text-googleBlue shrink-0" />}
            {!isCollapsed && <span className="truncate">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          
          <button
            onClick={logout}
            className={`flex w-full items-center rounded-xl font-bold text-googleRed hover:bg-googleRed/10 transition-all ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'}`}
            title="Sign Out"
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Right Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-black/50 relative pt-16 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

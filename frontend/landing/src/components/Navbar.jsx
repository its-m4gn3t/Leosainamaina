import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Navbar(){
  const [isOpen, setIsOpen] = useState(false);
  const { isMemberAuthenticated, memberUser, memberLogout, darkMode, toggleDarkMode } = useStore();
  const location = useLocation();

  // Hide navbar on member dashboard pages
  const hiddenPaths = ['/member-dashboard', '/chat', '/messages'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-lg dark:shadow-gray-900/20 transition-all duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-xl">🦁</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">Leo Club Of Sainamaina</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Menu Links */}
            <div className="flex items-center space-x-1">
              <Link to="/" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-all duration-300 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20">
                🏠 Home
              </Link>
              <Link to="/events" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-all duration-300 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20">
                📅 Events
              </Link>
              <Link to="/announcements" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-all duration-300 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20">
                📢 News
              </Link>
              <Link to="/members" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-all duration-300 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20">
                👥 Members
              </Link>

              <Link to="/contact" className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-all duration-300 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20">
                📞 Contact
              </Link>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">

              
              {/* Donate Button */}
              <Link 
                to="/donate" 
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="animate-pulse">💝</span>
                <span>Donate</span>
              </Link>

              {/* Member Authentication */}
              {isMemberAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/chat" 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    💬 Messages
                  </Link>
                  <Link 
                    to="/member-dashboard" 
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                      {memberUser?.firstName?.[0]}
                    </div>
                    <span>Dashboard</span>
                  </Link>
                  <button 
                    onClick={memberLogout}
                    className="p-3 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Logout"
                  >
                    🚪
                  </button>
                </div>
              ) : (
                <Link 
                  to="/member-login" 
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <span>👤</span>
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 mt-1 ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 mt-1 ${isOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-2xl transition-all duration-500 transform ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Link to="/" className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all duration-300" onClick={() => setIsOpen(false)}>
                <span className="text-2xl">🏠</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Home</span>
              </Link>
              <Link to="/events" className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300" onClick={() => setIsOpen(false)}>
                <span className="text-2xl">📅</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Events</span>
              </Link>
              <Link to="/announcements" className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-300" onClick={() => setIsOpen(false)}>
                <span className="text-2xl">📢</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">News</span>
              </Link>
              <Link to="/members" className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-300" onClick={() => setIsOpen(false)}>
                <span className="text-2xl">👥</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Members</span>
              </Link>

              <Link to="/contact" className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-900/30 dark:hover:to-cyan-900/30 transition-all duration-300" onClick={() => setIsOpen(false)}>
                <span className="text-2xl">📞</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Contact</span>
              </Link>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <Link 
                to="/donate" 
                className="flex items-center justify-center gap-3 w-full p-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300" 
                onClick={() => setIsOpen(false)}
              >
                <span className="text-2xl animate-pulse">💝</span>
                <span>Support Our Mission</span>
              </Link>
              
              {isMemberAuthenticated ? (
                <div className="space-y-3">
                  <Link 
                    to="/chat" 
                    className="flex items-center justify-center gap-3 w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-lg transition-all duration-300" 
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-2xl">💬</span>
                    <span>Messages</span>
                  </Link>
                  <Link 
                    to="/member-dashboard" 
                    className="flex items-center justify-center gap-3 w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-2xl shadow-lg transition-all duration-300" 
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                      {memberUser?.firstName?.[0]}
                    </div>
                    <span>Dashboard</span>
                  </Link>
                  <button 
                    onClick={() => { memberLogout(); setIsOpen(false); }}
                    className="flex items-center justify-center gap-3 w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-lg transition-all duration-300"
                  >
                    <span className="text-2xl">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link 
                  to="/member-login" 
                  className="flex items-center justify-center gap-3 w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300" 
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-2xl">👤</span>
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
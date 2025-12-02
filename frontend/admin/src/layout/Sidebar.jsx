import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/useAdminStore';

export default function Sidebar({ isOpen, onClose }){
  const { logout } = useAdminStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white min-h-screen p-4 md:p-6 transform transition-transform duration-300 ease-in-out md:transform-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
            LCS
          </div>
          <h2 className="text-xl font-bold">Leo Admin</h2>
        </div>
        <p className="text-gray-400 text-sm">Management System</p>
      </div>
      
      <nav className="flex flex-col gap-2">
        <Link to="/" className="hover:bg-gray-800 p-3 rounded-lg transition-colors flex items-center gap-2">
          <span>📊</span> Dashboard
        </Link>
        <Link to="/announcements" className="hover:bg-gray-800 p-3 rounded-lg transition-colors flex items-center gap-2">
          <span>📢</span> Announcements
        </Link>
        <Link to="/events" className="hover:bg-gray-800 p-3 rounded-lg transition-colors flex items-center gap-2">
          <span>📅</span> Events
        </Link>
        <Link to="/members" className="hover:bg-gray-800 p-3 rounded-lg transition-colors flex items-center gap-2">
          <span>👥</span> Members
        </Link>
        <Link to="/attendance" className="hover:bg-gray-800 p-3 rounded-lg transition-colors flex items-center gap-2">
          <span>✅</span> Attendance
        </Link>
        <Link to="/certificates" className="hover:bg-gray-800 p-3 rounded-lg transition-colors flex items-center gap-2">
          <span>🏆</span> Certificates
        </Link>
        <Link to="/contacts" className="hover:bg-gray-800 p-3 rounded-lg transition-colors flex items-center gap-2">
          <span>📧</span> Contact Forms
        </Link>
        <Link to="/messages" className="hover:bg-gray-800 p-3 rounded-lg transition-colors flex items-center gap-2">
          <span>💬</span> Messages
        </Link>
        <Link to="/gallery" className="hover:bg-gray-800 p-3 rounded-lg transition-colors flex items-center gap-2">
          <span>📸</span> Photo Gallery
        </Link>
        <Link to="/admin-management" className="hover:bg-gray-800 p-3 rounded-lg transition-colors flex items-center gap-2">
          <span>👥</span> Admin Users
        </Link>
      </nav>
      
      <div className="mt-auto pt-4 md:pt-6">
        <button
          onClick={handleLogout}
          className="w-full text-left hover:bg-red-800 p-3 rounded-lg transition-colors flex items-center gap-2 text-red-300"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
    </>
  );
}

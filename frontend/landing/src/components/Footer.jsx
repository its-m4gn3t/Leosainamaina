import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer(){
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full translate-x-40 translate-y-40 blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-xl">🦁</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Leo Club of Sainamaina
                </h3>
                <p className="text-blue-200 text-sm">Building Leaders, Serving Community</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Empowering youth through community service, leadership development, and positive social impact. 
              Together, we're building a brighter future for Sainamaina and beyond.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">Active Community</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <span>📍</span>
                <span className="text-sm">Sainamaina, Nepal</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2"><span>🏠</span> Home</Link></li>
              <li><Link to="/events" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2"><span>📅</span> Events</Link></li>
              <li><Link to="/members" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2"><span>👥</span> Members</Link></li>
              <li><Link to="/announcements" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2"><span>📢</span> News</Link></li>
              <li><Link to="/gallery" className="text-gray-300 hover:text-orange-400 transition-colors duration-300 flex items-center gap-2"><span>📸</span> Gallery</Link></li>
            </ul>
          </div>
          
          {/* Get Involved */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Get Involved</h4>
            <ul className="space-y-3">
              <li><Link to="/member-login" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2"><span>👤</span> Member Login</Link></li>
              <li><Link to="/donate" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center gap-2"><span>💝</span> Donate</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-green-400 transition-colors duration-300 flex items-center gap-2"><span>📞</span> Contact Us</Link></li>
              <li><a href="mailto:info@leosainamaina.org" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center gap-2"><span>📧</span> Email</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-300">
                © 2025 Leo Club of Sainamaina. All rights reserved.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Chartered under Lions Clubs International
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-orange-400">
                <span>🌟</span>
                <span className="text-sm font-medium">Making a Difference</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <span>🤝</span>
                <span className="text-sm font-medium">Community First</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

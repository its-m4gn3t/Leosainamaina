import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../api/axios';
import EventCalendar from '../components/EventCalendar';

export default function MemberDashboardNew() {
  const { memberUser, isMemberAuthenticated, logout } = useStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEvents: 0,
    attendedEvents: 0,
    totalHours: 0,
    totalPoints: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isMemberAuthenticated) {
      navigate('/member-login');
      return;
    }
    fetchDashboardData();
  }, [isMemberAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, attendanceRes, announcementsRes] = await Promise.all([
        api.get('/events'),
        api.get('/attendance'),
        api.get('/announcements')
      ]);

      const events = eventsRes.data;
      const attendance = attendanceRes.data;
      const memberAttendance = attendance.filter(a => a.member === memberUser._id);

      setStats({
        totalEvents: events.length,
        attendedEvents: memberAttendance.length,
        totalHours: memberUser.totalHours || 0,
        totalPoints: memberUser.totalPoints || 0
      });

      setRecentEvents(events.slice(0, 3));
      setAnnouncements(announcementsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Header Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Leo Club</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {memberUser.firstName[0]}
                </div>
                <span>Welcome, <span className="font-semibold">{memberUser.firstName}</span></span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {memberUser.firstName}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening in your Leo Club journey.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Events Attended</p>
                <p className="text-2xl font-bold text-gray-900">{stats.attendedEvents}/{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Service Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Points Earned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPoints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Badge Level</p>
                <p className="text-2xl font-bold text-gray-900">{memberUser.badge || 'Bronze'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/instagram-chat"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center">
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">💬</span>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Messages</h3>
                <p className="text-blue-100 text-sm">Chat with fellow members</p>
              </div>
            </div>
          </Link>

          <Link
            to="/events"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center">
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📅</span>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Events</h3>
                <p className="text-green-100 text-sm">View upcoming events</p>
              </div>
            </div>
          </Link>

          <Link
            to="/attendance"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center">
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">✅</span>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Attendance</h3>
                <p className="text-purple-100 text-sm">Check your attendance</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Event Calendar */}
        <div className="mb-8">
          <EventCalendar />
        </div>

        {/* Recent Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Events */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
              <Link to="/events" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {recentEvents.length > 0 ? (
                recentEvents.map(event => (
                  <div key={event._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {new Date(event.startDate).getDate()}
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent events</p>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
              <Link to="/announcements" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map(announcement => (
                  <div key={announcement._id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <h3 className="font-medium text-gray-900 mb-1">{announcement.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent announcements</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
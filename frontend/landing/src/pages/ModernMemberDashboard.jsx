import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function ModernMemberDashboard() {
  const { 
    memberUser, 
    memberAttendance, 
    fetchMemberAttendance, 
    memberLogout, 
    loading,
    events,
    fetchEvents
  } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const token = localStorage.getItem('leo_member_token');
    if (!token || !memberUser) {
      navigate('/member-login');
      return;
    }
    fetchMemberAttendance(memberUser._id);
    fetchEvents();
  }, [memberUser, fetchMemberAttendance, fetchEvents, navigate]);

  const handleLogout = () => {
    memberLogout();
    navigate('/');
  };

  if (!memberUser) return null;

  const totalHours = memberAttendance?.reduce((sum, record) => sum + record.hours, 0) || 0;
  const totalPoints = memberAttendance?.reduce((sum, record) => sum + record.points, 0) || 0;
  const eventsAttended = memberAttendance?.length || 0;
  const upcomingEvents = events?.filter(event => new Date(event.startDate || event.date) > new Date()) || [];

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const StatCard = ({ icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
        <div className={`text-${color}-500 text-sm font-medium`}>
          {subtitle}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-gray-600 text-sm">{title}</div>
      </div>
    </div>
  );

  const QuickAction = ({ icon, title, description, onClick, color = "blue" }) => (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-left group"
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>
        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
          →
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Leo Club</h1>
                <p className="text-sm text-gray-500">Member Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/messages"
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-xl">💬</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Link>
              
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {getInitials(memberUser.firstName, memberUser.lastName)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{memberUser.firstName} {memberUser.lastName}</div>
                  <div className="text-xs text-gray-500">{memberUser.position || 'Member'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <span className="text-lg">🚪</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome back, {memberUser.firstName}! 👋</h2>
                  <p className="text-blue-100 text-lg">Ready to make a difference today?</p>
                </div>
                <div className="hidden md:block">
                  <div className="text-right">
                    <div className="text-sm text-blue-200">Member since</div>
                    <div className="text-lg font-semibold">{formatDate(memberUser.joinedAt || memberUser.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="📅"
            title="Events Attended"
            value={eventsAttended}
            subtitle="Total"
            color="blue"
          />
          <StatCard
            icon="⏰"
            title="Service Hours"
            value={`${totalHours}h`}
            subtitle="Completed"
            color="green"
          />
          <StatCard
            icon="🏆"
            title="Points Earned"
            value={totalPoints}
            subtitle="Total"
            color="orange"
          />
          <StatCard
            icon="🎯"
            title="Upcoming Events"
            value={upcomingEvents.length}
            subtitle="This month"
            color="purple"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">⚡ Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickAction
                  icon="📱"
                  title="Scan QR Code"
                  description="Mark attendance for events"
                  onClick={() => navigate('/qr-attendance')}
                  color="blue"
                />
                <QuickAction
                  icon="💬"
                  title="Messages"
                  description="Chat with other members"
                  onClick={() => navigate('/messages')}
                  color="green"
                />
                <QuickAction
                  icon="📅"
                  title="View Events"
                  description="Browse upcoming activities"
                  onClick={() => navigate('/events')}
                  color="orange"
                />
                <QuickAction
                  icon="📊"
                  title="My Progress"
                  description="Track your achievements"
                  onClick={() => setActiveTab('progress')}
                  color="purple"
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">📋 Recent Activity</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : memberAttendance?.length > 0 ? (
                <div className="space-y-4">
                  {memberAttendance.slice(0, 5).map((record) => (
                    <div key={record._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                        ✓
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{record.event?.title || 'Unknown Event'}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(record.event?.date)} • {record.hours}h • {record.points} pts
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.attendanceMethod === 'qr' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {record.attendanceMethod === 'qr' ? '📱 QR' : '✋ Manual'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-gray-600 font-medium">No activity yet</p>
                  <p className="text-sm text-gray-500 mt-1">Attend events to see your activity here</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {getInitials(memberUser.firstName, memberUser.lastName)}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{memberUser.firstName} {memberUser.lastName}</h3>
                <p className="text-gray-600">{memberUser.position || 'Member'}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900 text-sm">{memberUser.email}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Member ID</span>
                  <span className="font-medium text-gray-900">#{memberUser._id?.slice(-6)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Upcoming Events</h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-900 text-sm mb-1">{event.title}</div>
                      <div className="text-xs text-gray-500">{formatDate(event.startDate || event.date)}</div>
                    </div>
                  ))}
                  <Link
                    to="/events"
                    className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-4"
                  >
                    View All Events →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">📅</div>
                  <p className="text-gray-600 text-sm">No upcoming events</p>
                </div>
              )}
            </div>

            {/* Achievement Badge */}
            <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white">
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-bold text-lg mb-2">Achievement Level</h3>
                <div className="text-2xl font-bold mb-1">
                  {totalHours >= 50 ? 'Gold' : totalHours >= 25 ? 'Silver' : 'Bronze'}
                </div>
                <p className="text-sm opacity-90">
                  {totalHours >= 50 ? 'Outstanding service!' : `${50 - totalHours}h to Gold level`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function MemberDashboard() {
  const { 
    memberUser, 
    memberAttendance, 
    fetchMemberAttendance, 
    memberLogout, 
    loading 
  } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('leo_member_token');
    if (!token || !memberUser) {
      navigate('/member-login');
      return;
    }
    fetchMemberAttendance(memberUser._id);
  }, [memberUser, fetchMemberAttendance, navigate]);

  const handleLogout = () => {
    memberLogout();
    navigate('/');
  };

  if (!memberUser) return null;

  const totalHours = memberAttendance?.reduce((sum, record) => sum + record.hours, 0) || 0;
  const totalPoints = memberAttendance?.reduce((sum, record) => sum + record.points, 0) || 0;
  const eventsAttended = memberAttendance?.length || 0;

  const formatDate = (date) => new Date(date).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Member Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {memberUser.firstName}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/messages"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
              >
                💬 Messages
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Events Attended</p>
                <p className="text-2xl font-bold text-gray-900">{eventsAttended}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Service Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Points Earned</p>
                <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">👤 My Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold">{memberUser.firstName} {memberUser.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{memberUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-semibold">{memberUser.position || 'Member'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-semibold">{formatDate(memberUser.joinedAt || memberUser.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Attendance History</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading attendance...</p>
            </div>
          ) : memberAttendance?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {memberAttendance.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{record.event?.title || 'Unknown Event'}</div>
                        <div className="text-sm text-gray-500">{record.event?.category || 'No Category'}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {record.event?.date ? formatDate(record.event.date) : 'No Date'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {record.hours}h
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {record.points} pts
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          record.attendanceMethod === 'qr' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {record.attendanceMethod === 'qr' ? '📱 QR Scan' : '✋ Manual'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📅</div>
              <p className="text-gray-600">No attendance records yet</p>
              <p className="text-sm text-gray-500 mt-2">Attend events to see your history here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
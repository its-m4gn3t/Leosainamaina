import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function QRAttendance() {
  const [searchParams] = useSearchParams();
  const { members, events, fetchMembers, fetchEvents, markQRAttendance, loading } = useStore();
  const [selectedMember, setSelectedMember] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const qrToken = searchParams.get('token');
  const eventId = searchParams.get('event');
  
  useEffect(() => {
    fetchMembers();
    fetchEvents();
  }, [fetchMembers, fetchEvents]);
  
  const event = events?.find(e => e._id === eventId || e.qrCode === qrToken);
  
  const handleMarkAttendance = async () => {
    if (!selectedMember) {
      setError('Please select a member');
      return;
    }
    
    if (!qrToken) {
      setError('Invalid QR code');
      return;
    }
    
    try {
      setError('');
      await markQRAttendance(qrToken, selectedMember);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to mark attendance');
    }
  };
  
  if (!qrToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid QR Code</h2>
          <p className="text-gray-600">This QR code is not valid or has expired.</p>
        </div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Attendance Marked!</h2>
          <p className="text-gray-600 mb-6">
            Your attendance for <strong>{event?.title}</strong> has been successfully recorded.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-green-800">
              <div><strong>Event:</strong> {event?.title}</div>
              <div><strong>Date:</strong> {new Date(event?.date).toLocaleDateString()}</div>
              <div><strong>Hours:</strong> {event?.totalHours}h</div>
              <div><strong>Points Earned:</strong> {(event?.totalHours || 0) * 10} pts</div>
            </div>
          </div>
          <a 
            href="/" 
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Attendance</h2>
          <p className="text-gray-600">Mark your attendance for the event</p>
        </div>
        
        {event && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-orange-800 mb-2">{event.title}</h3>
            <div className="text-sm text-orange-700">
              <div><strong>Category:</strong> {event.category}</div>
              <div><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</div>
              <div><strong>Duration:</strong> {event.totalHours} hours</div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Your Name
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Choose your name</option>
              {members?.map(member => (
                <option key={member._id} value={member._id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleMarkAttendance}
            disabled={loading || !selectedMember}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Marking Attendance...' : 'Mark Attendance'}
          </button>
          
          <div className="text-center">
            <a 
              href="/" 
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
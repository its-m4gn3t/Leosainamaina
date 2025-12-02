import React, { useState, useEffect } from 'react';
import Sidebar from '../layout/Sidebar';
import Topbar from '../layout/Topbar';
import Modal from '../components/Modal';
import QRCodeGenerator from '../components/QRCodeGenerator';
import { useAdminStore } from '../store/useAdminStore';

export default function Attendance() {
  const { 
    attendance, 
    events, 
    members, 
    fetchAttendance, 
    fetchEvents, 
    fetchMembers,
    markAttendance,
    deleteAttendance,
    generateEventQR,
    loading 
  } = useAdminStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [form, setForm] = useState({ memberId: '', eventId: '', notes: '' });
  const [filter, setFilter] = useState({ eventId: '', memberId: '' });
  const [scannedQR, setScannedQR] = useState('');

  useEffect(() => {
    fetchAttendance();
    fetchEvents();
    fetchMembers();
  }, [fetchAttendance, fetchEvents, fetchMembers]);

  const filteredAttendance = attendance?.filter(record => {
    return (!filter.eventId || record.event._id === filter.eventId) &&
           (!filter.memberId || record.member._id === filter.memberId);
  }) || [];

  const openMarkAttendance = () => {
    setForm({ memberId: '', eventId: '', notes: '' });
    setModalOpen(true);
  };

  const handleMarkAttendance = async () => {
    if (!form.memberId || !form.eventId) {
      alert('Please select both member and event');
      return;
    }
    
    try {
      await markAttendance(form);
      setModalOpen(false);
      setForm({ memberId: '', eventId: '', notes: '' });
    } catch (error) {
      alert('Failed to mark attendance');
    }
  };

  const handleGenerateQR = async (event) => {
    try {
      const qrResult = await generateEventQR(event._id);
      setQrData({ ...qrResult, event });
      setQrModalOpen(true);
    } catch (error) {
      alert('Failed to generate QR code');
    }
  };

  const handleQRScan = async () => {
    if (!scannedQR || !form.memberId) {
      alert('Please enter QR token and select member');
      return;
    }
    
    try {
      // This would typically use the QR attendance endpoint
      // For now, we'll simulate it by finding the event with matching QR code
      const event = events.find(e => e.qrCode === scannedQR);
      if (!event) {
        alert('Invalid QR code');
        return;
      }
      
      await markAttendance({ 
        memberId: form.memberId, 
        eventId: event._id, 
        notes: 'QR Scan Attendance' 
      });
      
      setScanModalOpen(false);
      setScannedQR('');
      setForm({ ...form, memberId: '' });
    } catch (error) {
      alert('Failed to process QR attendance');
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (window.confirm('Delete this attendance record?')) {
      try {
        await deleteAttendance(id);
      } catch (error) {
        alert('Failed to delete attendance');
      }
    }
  };

  const copyQRUrl = () => {
    if (qrData?.qrUrl) {
      navigator.clipboard?.writeText(qrData.qrUrl);
      alert('QR URL copied to clipboard!');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
            <div className="flex gap-2">
              <button
                onClick={openMarkAttendance}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                + Mark Attendance
              </button>
              <button
                onClick={() => setScanModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                📱 QR Scan
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Event</label>
                <select
                  value={filter.eventId}
                  onChange={(e) => setFilter({ ...filter, eventId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Events</option>
                  {events?.map(event => (
                    <option key={event._id} value={event._id}>{event.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Member</label>
                <select
                  value={filter.memberId}
                  onChange={(e) => setFilter({ ...filter, memberId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Members</option>
                  {members?.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilter({ eventId: '', memberId: '' })}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendance.map(record => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {record.member.firstName} {record.member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{record.member.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{record.event?.title || 'Unknown Event'}</div>
                      <div className="text-sm text-gray-500">{record.event?.category || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        record.attendanceMethod === 'qr' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {record.attendanceMethod === 'qr' ? '📱 QR Scan' : '✋ Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.checkInTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.hours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.points} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleGenerateQR(record.event)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-100 px-3 py-1 rounded"
                      >
                        QR
                      </button>
                      <button
                        onClick={() => handleDeleteAttendance(record._id)}
                        className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAttendance.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Mark Attendance">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
            <select
              value={form.memberId}
              onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose a member</option>
              {members?.map(member => (
                <option key={member._id} value={member._id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
            <select
              value={form.eventId}
              onChange={(e) => setForm({ ...form, eventId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose an event</option>
              {events?.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title} - {new Date(event.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkAttendance}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Marking...' : 'Mark Attendance'}
            </button>
          </div>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title={`QR Code - ${qrData?.event?.title}`}>
        {qrData && (
          <div className="text-center">
            <div className="mb-4">
              <QRCodeGenerator 
                value={qrData.qrUrl}
                size={300}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Attendance QR URL</label>
              <input
                type="text"
                value={qrData.qrUrl}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">QR Token</label>
              <input
                type="text"
                value={qrData.qrToken}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <button
              onClick={copyQRUrl}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Copy URL
            </button>
          </div>
        )}
      </Modal>

      {/* QR Scan Modal */}
      <Modal isOpen={scanModalOpen} onClose={() => setScanModalOpen(false)} title="QR Scan Attendance">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
            <select
              value={form.memberId}
              onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose a member</option>
              {members?.map(member => (
                <option key={member._id} value={member._id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">QR Token</label>
            <input
              type="text"
              value={scannedQR}
              onChange={(e) => setScannedQR(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter or scan QR token"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setScanModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleQRScan}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Mark Attendance'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
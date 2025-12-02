import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import Modal from '../components/Modal';
import { useAdminStore } from '../store/useAdminStore';

export default function Certificates(){
  const { certificates, events, generateCertificate, fetchEvents, fetchCertificates, loading, error } = useAdminStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ recipientName: '', eventId: '', certificateType: 'participation' });
  const [generating, setGenerating] = useState(false);
  
  useEffect(() => {
    fetchEvents();
    fetchCertificates();
  }, [fetchEvents, fetchCertificates]);

  const handleGenerate = async () => {
    if (!form.recipientName.trim()) {
      alert('Recipient name is required');
      return;
    }
    
    try {
      setGenerating(true);
      await generateCertificate(form.recipientName, form.eventId, form.certificateType);
      setModalOpen(false);
      setForm({ recipientName: '', eventId: '', certificateType: 'participation' });
      alert('Certificate generated successfully!');
    } catch (error) {
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (cert) => {
    if (cert.fileUrl) {
      const a = document.createElement('a');
      a.href = cert.fileUrl;
      a.download = `${cert.recipientName.replace(/\s+/g, '_')}_certificate.pdf`;
      a.click();
    } else {
      alert('Certificate file not available');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🏆 Certificates</h1>
            <p className="text-gray-600 mt-1">Generate and manage certificates</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <span>➕</span>
            Generate Certificate
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(certificates || []).map(cert => {
                  const event = events?.find(e => e._id === cert.eventId);
                  return (
                    <tr key={cert._id || cert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{cert.recipientName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                          {cert.certificateType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event ? event.title : 'General Certificate'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(cert.issuedAt || cert.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDownload(cert)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded transition-colors"
                        >
                          📥 Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {(!certificates || certificates.length === 0) && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2">🏆</span>
                        <p className="font-medium">No certificates generated yet</p>
                        <p className="text-sm">Create your first certificate!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {(certificates || []).map(cert => {
            const event = events?.find(e => e._id === cert.eventId);
            return (
              <div key={cert._id || cert.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{cert.recipientName}</h3>
                    <p className="text-sm text-gray-600">{event ? event.title : 'General Certificate'}</p>
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                    {cert.certificateType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {new Date(cert.issuedAt || cert.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDownload(cert)}
                    className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-sm transition-colors"
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            );
          })}
          {(!certificates || certificates.length === 0) && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <span className="text-4xl mb-2 block">🏆</span>
              <p className="font-medium text-gray-900 mb-1">No certificates generated yet</p>
              <p className="text-sm text-gray-500">Create your first certificate!</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Generate Certificate">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name *</label>
            <input
              type="text"
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter recipient name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event (Optional)</label>
            <select
              value={form.eventId}
              onChange={(e) => setForm({ ...form, eventId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">-- Select Event --</option>
              {(events || []).map(event => (
                <option key={event._id} value={event._id}>{event.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type</label>
            <select
              value={form.certificateType}
              onChange={(e) => setForm({ ...form, certificateType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="participation">Participation</option>
              <option value="appreciation">Appreciation</option>
              <option value="achievement">Achievement</option>
              <option value="completion">Completion</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={generating}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating || !form.recipientName.trim()}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>🏆 Generate & Download</>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
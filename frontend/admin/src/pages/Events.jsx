import React, { useState, useEffect } from 'react';
import Sidebar from '../layout/Sidebar';
import Topbar from '../layout/Topbar';
import Modal from '../components/Modal';
import QRCodeGenerator from '../components/QRCodeGenerator';
import ModernDateTimePicker from '../components/ModernDateTimePicker';
import { useAdminStore } from '../store/useAdminStore';

export default function Events(){
  const { 
    events, 
    eventCategories, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    fetchEvents, 
    fetchEventCategories,
    addEventCategory,
    updateEventCategory,
    deleteEventCategory,
    generateEventQR, 
    loading 
  } = useAdminStore();
  
  useEffect(() => {
    fetchEvents();
    fetchEventCategories();
  }, [fetchEvents, fetchEventCategories]);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', startDate: '', endDate: '', totalHours: 1, banner: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', color: '#3B82F6' });

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', category: (eventCategories && eventCategories[0])?._id || '', startDate: '', endDate: '', totalHours: 1, banner: '' });
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setEditing(event._id);
    setForm({
      title: event.title,
      category: event.category?._id || '',
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      totalHours: event.totalHours || 1,
      banner: event.banner || ''
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.title || !form.startDate || !form.endDate || !form.category || !form.totalHours) {
      alert('All fields are required');
      return;
    }
    
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      alert('End date must be after start date');
      return;
    }
    
    try {
      const eventData = {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        totalHours: parseInt(form.totalHours)
      };
      
      let savedEvent;
      if (editing) {
        savedEvent = await updateEvent(editing, eventData);
      } else {
        savedEvent = await addEvent(eventData);
        // Auto-generate QR code for new events
        if (savedEvent && savedEvent._id) {
          try {
            await generateEventQR(savedEvent._id);
          } catch (qrError) {
            console.warn('Failed to generate QR code:', qrError);
          }
        }
      }
      setModalOpen(false);
    } catch (error) {
      alert('Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this event?')) {
      try {
        await deleteEvent(id);
      } catch (error) {
        alert('Failed to delete event');
      }
    }
  };

  const showQR = (event) => {
    setSelectedEvent(event);
    setQrModalOpen(true);
  };

  const generateQRUrl = (event) => {
    const baseUrl = 'http://192.168.100.6:3000';
    return `${baseUrl}/attendance/qr?token=${event.qrCode}&event=${event._id}`;
  };

  const copyQRUrl = (event) => {
    const url = generateQRUrl(event);
    navigator.clipboard?.writeText(url);
    alert('QR URL copied to clipboard!');
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <div className="space-x-3">
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', description: '', color: '#3B82F6' });
                  setCategoryModalOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                + Category
              </button>
              <button
                onClick={openAdd}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                + Add Event
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map(event => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span 
                        className="px-2 py-1 rounded text-xs text-white"
                        style={{ backgroundColor: event.category?.color || '#3B82F6' }}
                      >
                        {typeof event.category === 'object' ? event.category?.name : event.category || 'No Category'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(event.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(event.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.totalHours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        event.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : event.status === 'ongoing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {event.status === 'completed' ? '✅ Completed' : 
                         event.status === 'ongoing' ? '🔄 Ongoing' : '📅 Upcoming'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEdit(event)}
                        className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => showQR(event)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-100 px-3 py-1 rounded"
                      >
                        QR
                      </button>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No events yet. Create your first event!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Event' : 'Add Event'}>
        <div className="space-y-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 rounded-xl">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Event Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-md"
              placeholder="Enter event title"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-md"
              >
                <option value="" className="bg-gray-800 text-white">Select Category</option>
                {eventCategories.map(cat => (
                  <option key={cat._id} value={cat._id} className="bg-gray-800 text-white">{cat?.name || 'Unknown Category'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Service Hours</label>
              <input
                type="number"
                min="1"
                value={form.totalHours}
                onChange={(e) => setForm({ ...form, totalHours: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-md"
                placeholder="Hours"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModernDateTimePicker
              label="Start Date & Time"
              value={form.startDate}
              onChange={(value) => setForm({ ...form, startDate: value })}
              placeholder="Select start date and time"
              required
            />
            <ModernDateTimePicker
              label="End Date & Time"
              value={form.endDate}
              onChange={(value) => setForm({ ...form, endDate: value })}
              placeholder="Select end date and time"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Event Image</label>
            <div className="space-y-4">
              <input
                type="url"
                value={form.banner}
                onChange={(e) => setForm({ ...form, banner: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-md"
                placeholder="Enter image URL or upload below"
              />
              <div className="text-center">
                <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl border border-white/20 inline-flex items-center transition-all duration-200 backdrop-blur-md text-white">
                  <span className="mr-2 text-lg">📎</span>
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setForm({ ...form, banner: url });
                      }
                    }}
                  />
                </label>
                <p className="text-xs text-gray-300 mt-2">JPG, PNG, GIF up to 5MB</p>
              </div>
              {form.banner && (
                <div className="mt-4">
                  <img 
                    src={form.banner} 
                    alt="Preview" 
                    className="w-full h-40 object-cover rounded-xl border border-white/20"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden text-center py-12 bg-white/10 rounded-xl border border-white/20">
                    <span className="text-gray-300">Image preview not available</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              onClick={() => setModalOpen(false)}
              className="px-6 py-3 text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200 backdrop-blur-md"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                editing ? '✏️ Update Event' : '✨ Create Event'
              )}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Category name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Category description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3B82F6"
              />
            </div>
          </div>
          
          {/* Category List */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Existing Categories</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {eventCategories.map(cat => (
                <div key={cat._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm font-medium">{cat?.name || 'Unknown'}</span>
                  </div>
                  <div className="space-x-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat._id);
                        setCategoryForm({ name: cat.name, description: cat.description || '', color: cat.color });
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-100 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Delete this category?')) {
                          try {
                            await deleteEventCategory(cat._id);
                          } catch (error) {
                            alert('Failed to delete category');
                          }
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-800 px-2 py-1 bg-red-100 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setCategoryModalOpen(false);
                setEditingCategory(null);
                setCategoryForm({ name: '', description: '', color: '#3B82F6' });
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!categoryForm.name) {
                  alert('Category name is required');
                  return;
                }
                try {
                  if (editingCategory) {
                    await updateEventCategory(editingCategory, categoryForm);
                  } else {
                    await addEventCategory(categoryForm);
                  }
                  setCategoryForm({ name: '', description: '', color: '#3B82F6' });
                  setEditingCategory(null);
                } catch (error) {
                  alert('Failed to save category');
                }
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title={`QR Code - ${selectedEvent?.title}`}>
        {selectedEvent && (
          <div className="text-center">
            {selectedEvent.qrCode ? (
              <>
                <div className="mb-4">
                  <QRCodeGenerator 
                    value={generateQRUrl(selectedEvent)}
                    size={300}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Check-in URL</label>
                  <input
                    type="text"
                    value={generateQRUrl(selectedEvent)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <button
                  onClick={() => copyQRUrl(selectedEvent)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
                >
                  Copy URL
                </button>
              </>
            ) : (
              <div className="py-8">
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-gray-600 mb-4">No QR code generated for this event yet.</p>
                <button
                  onClick={async () => {
                    try {
                      await generateEventQR(selectedEvent._id);
                      // Refresh the selected event data
                      const updatedEvent = events.find(e => e._id === selectedEvent._id);
                      setSelectedEvent(updatedEvent);
                    } catch (error) {
                      alert('Failed to generate QR code');
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Generate QR Code
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

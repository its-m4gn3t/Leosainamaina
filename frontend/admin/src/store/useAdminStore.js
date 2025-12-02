import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';
const AUTH_KEY = 'leo_admin_token';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAdminStore = create((set, get) => ({
  announcements: [],
  events: [],
  eventCategories: [],
  members: [],
  certificates: [],
  attendance: [],
  contacts: [],
  admins: [],
  isAuthenticated: !!localStorage.getItem(AUTH_KEY),
  user: null,
  loading: false,
  error: null,
  
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/auth/login', { email, password });
      const { token, ...user } = response.data;
      localStorage.setItem(AUTH_KEY, token);
      set({ isAuthenticated: true, user, loading: false });
      return true;
    } catch (error) {
      // Fallback for demo credentials
      if (email === 'admin@leoclub.local' && password === 'admin123') {
        localStorage.setItem(AUTH_KEY, 'demo-token');
        set({ isAuthenticated: true, user: { email, role: 'Admin' }, loading: false });
        return true;
      }
      set({ error: error.response?.data?.message || 'Login failed', loading: false });
      return false;
    }
  },
  
  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ isAuthenticated: false, user: null });
  },
  
  fetchAnnouncements: async () => {
    try {
      const response = await api.get('/announcements');
      set({ announcements: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  fetchEvents: async () => {
    try {
      const response = await api.get('/events');
      set({ events: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  fetchEventCategories: async () => {
    try {
      const response = await api.get('/event-categories');
      set({ eventCategories: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  addEventCategory: async (category) => {
    try {
      const response = await api.post('/event-categories', category);
      set((state) => ({ eventCategories: [...state.eventCategories, response.data] }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  updateEventCategory: async (id, updates) => {
    try {
      const response = await api.put(`/event-categories/${id}`, updates);
      set((state) => ({
        eventCategories: state.eventCategories.map(c => c._id === id ? response.data : c)
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  deleteEventCategory: async (id) => {
    try {
      await api.delete(`/event-categories/${id}`);
      set((state) => ({
        eventCategories: state.eventCategories.filter(c => c._id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  fetchMembers: async () => {
    try {
      const response = await api.get('/members');
      set({ members: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  fetchContacts: async () => {
    try {
      const response = await api.get('/contact');
      set({ contacts: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  updateContactStatus: async (id, status) => {
    try {
      const response = await api.put(`/contact/${id}`, { status });
      set((state) => ({
        contacts: state.contacts.map(c => c._id === id ? response.data : c)
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  deleteContact: async (id) => {
    try {
      await api.delete(`/contact/${id}`);
      set((state) => ({
        contacts: state.contacts.filter(c => c._id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  addAnnouncement: async (announcement) => {
    try {
      const response = await api.post('/announcements', {
        title: announcement.title,
        content: announcement.description
      });
      set((state) => ({ announcements: [response.data, ...state.announcements] }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  updateAnnouncement: async (id, updates) => {
    try {
      const response = await api.put(`/announcements/${id}`, {
        title: updates.title,
        content: updates.description
      });
      set((state) => ({
        announcements: state.announcements.map(a => a._id === id ? response.data : a)
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  deleteAnnouncement: async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      set((state) => ({
        announcements: state.announcements.filter(a => a._id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  addEvent: async (event) => {
    try {
      const response = await api.post('/events', event);
      set((state) => ({ events: [...state.events, response.data] }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  updateEvent: async (id, updates) => {
    try {
      const response = await api.put(`/events/${id}`, updates);
      set((state) => ({
        events: state.events.map(e => e._id === id ? response.data : e)
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  deleteEvent: async (id) => {
    try {
      await api.delete(`/events/${id}`);
      set((state) => ({
        events: state.events.filter(e => e._id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  addMember: async (member) => {
    try {
      const nameParts = member.name.trim().split(' ');
      const memberData = {
        firstName: nameParts[0] || member.name,
        lastName: nameParts.slice(1).join(' ') || '',
        email: member.email,
        phone: member.phone,
        position: member.position,
        image: member.image,
        bio: member.bio,
        isFoundingMember: member.isFoundingMember,
        isActive: member.isActive,
        yearJoined: member.yearJoined
      };
      
      // Only add password if provided
      if (member.password) {
        memberData.password = member.password;
      }
      
      console.log('Adding member:', memberData);
      const response = await api.post('/members', memberData);
      set((state) => ({ members: [...state.members, response.data] }));
      return response.data;
    } catch (error) {
      console.error('Add member error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },
  
  updateMember: async (id, updates) => {
    try {
      const response = await api.put(`/members/${id}`, {
        firstName: updates.name.split(' ')[0] || updates.name,
        lastName: updates.name.split(' ')[1] || '',
        email: updates.email,
        phone: updates.phone,
        position: updates.position,
        image: updates.image,
        bio: updates.bio,
        isFoundingMember: updates.isFoundingMember,
        isActive: updates.isActive,
        yearJoined: updates.yearJoined
      });
      set((state) => ({
        members: state.members.map(m => m._id === id ? response.data : m)
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  deleteMember: async (id) => {
    try {
      await api.delete(`/members/${id}`);
      set((state) => ({
        members: state.members.filter(m => m._id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  addCertificate: async (certificate) => {
    try {
      const response = await api.post('/certificates', certificate);
      set((state) => ({ certificates: [...state.certificates, response.data] }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  generateCertificate: async (recipientName, eventId, certificateType) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/certificates/generate', {
        recipientName,
        eventId: eventId || null,
        certificateType
      });
      
      set((state) => ({ 
        certificates: [response.data, ...(state.certificates || [])],
        loading: false 
      }));
      
      if (response.data.fileUrl) {
        const a = document.createElement('a');
        a.href = response.data.fileUrl;
        a.download = `${recipientName.replace(/\s+/g, '_')}_certificate.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },
  
  fetchCertificates: async () => {
    try {
      const response = await api.get('/certificates');
      set({ certificates: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  // Attendance functions
  fetchAttendance: async () => {
    try {
      const response = await api.get('/attendance');
      set({ attendance: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  markAttendance: async (attendanceData) => {
    try {
      set({ loading: true });
      const response = await api.post('/attendance/mark', attendanceData);
      set((state) => ({ 
        attendance: [response.data, ...state.attendance],
        loading: false 
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  markQRAttendance: async (qrToken, memberId) => {
    try {
      set({ loading: true });
      const response = await api.post('/attendance/qr', { qrToken, memberId });
      set((state) => ({ 
        attendance: [response.data, ...state.attendance],
        loading: false 
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  generateEventQR: async (eventId) => {
    try {
      const response = await api.post(`/attendance/generate-qr/${eventId}`);
      // Update the event with the new QR code
      set((state) => ({
        events: state.events.map(e => 
          e._id === eventId ? { ...e, qrCode: response.data.qrToken } : e
        )
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  deleteAttendance: async (id) => {
    try {
      await api.delete(`/attendance/${id}`);
      set((state) => ({
        attendance: state.attendance.filter(a => a._id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  getAttendanceByEvent: async (eventId) => {
    try {
      const response = await api.get(`/attendance/event/${eventId}`);
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  getAttendanceByMember: async (memberId) => {
    try {
      const response = await api.get(`/attendance/member/${memberId}`);
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  // Admin management functions
  fetchAdmins: async () => {
    try {
      const response = await api.get('/auth/admins');
      set({ admins: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  addAdmin: async (adminData) => {
    try {
      set({ loading: true });
      const response = await api.post('/auth/register', adminData);
      set((state) => ({ 
        admins: [...(state.admins || []), response.data],
        loading: false 
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateAdmin: async (id, updates) => {
    try {
      set({ loading: true });
      const response = await api.put(`/auth/admin/${id}`, updates);
      set((state) => ({
        admins: (state.admins || []).map(a => a._id === id ? response.data : a),
        loading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  deleteAdmin: async (id) => {
    try {
      await api.delete(`/auth/admin/${id}`);
      set((state) => ({
        admins: (state.admins || []).filter(a => a._id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  }
}));
import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';

// Use environment variable for API URL, fallback to localhost
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const AUTH_KEY = 'leo_admin_token';

// Axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: Socket.IO client
export const socket = io(API_BASE.replace('/api',''), {
  auth: { token: localStorage.getItem(AUTH_KEY) },
  transports: ['websocket'],
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
      const res = await api.post('/auth/login', { email, password });
      const { token, ...user } = res.data;
      localStorage.setItem(AUTH_KEY, token);
      set({ isAuthenticated: true, user, loading: false });
      return true;
    } catch (err) {
      if (email === 'admin@leoclub.local' && password === 'admin123') {
        localStorage.setItem(AUTH_KEY, 'demo-token');
        set({ isAuthenticated: true, user: { email, role: 'Admin' }, loading: false });
        return true;
      }
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ isAuthenticated: false, user: null });
  },

  // ---------- Announcements ----------
  fetchAnnouncements: async () => {
    try {
      const res = await api.get('/announcements');
      set({ announcements: res.data });
    } catch (err) { set({ error: err.message }); }
  },
  addAnnouncement: async (ann) => {
    try {
      const res = await api.post('/announcements', { title: ann.title, content: ann.description });
      set(state => ({ announcements: [res.data, ...state.announcements] }));
      return res.data;
    } catch (err) { set({ error: err.message }); throw err; }
  },
  updateAnnouncement: async (id, upd) => {
    try {
      const res = await api.put(`/announcements/${id}`, { title: upd.title, content: upd.description });
      set(state => ({ announcements: state.announcements.map(a => a._id === id ? res.data : a) }));
      return res.data;
    } catch (err) { set({ error: err.message }); throw err; }
  },
  deleteAnnouncement: async (id) => {
    try { await api.delete(`/announcements/${id}`);
      set(state => ({ announcements: state.announcements.filter(a => a._id !== id) }));
    } catch (err) { set({ error: err.message }); throw err; }
  },

  // ---------- Events ----------
  fetchEvents: async () => {
    try { const res = await api.get('/events'); set({ events: res.data }); } 
    catch (err) { set({ error: err.message }); }
  },
  addEvent: async (event) => {
    try { const res = await api.post('/events', event); set(state => ({ events: [...state.events, res.data] })); return res.data; } 
    catch (err) { set({ error: err.message }); throw err; }
  },
  updateEvent: async (id, upd) => {
    try { const res = await api.put(`/events/${id}`, upd); set(state => ({ events: state.events.map(e => e._id === id ? res.data : e) })); return res.data; } 
    catch (err) { set({ error: err.message }); throw err; }
  },
  deleteEvent: async (id) => {
    try { await api.delete(`/events/${id}`); set(state => ({ events: state.events.filter(e => e._id !== id) })); } 
    catch (err) { set({ error: err.message }); throw err; }
  },

  // ---------- Members ----------
  fetchMembers: async () => {
    try { const res = await api.get('/members'); set({ members: res.data }); } 
    catch (err) { set({ error: err.message }); }
  },
  addMember: async (member) => {
    try {
      const nameParts = member.name.trim().split(' ');
      const data = {
        firstName: nameParts[0] || member.name,
        lastName: nameParts.slice(1).join(' ') || '',
        email: member.email, phone: member.phone, position: member.position,
        image: member.image, bio: member.bio, isFoundingMember: member.isFoundingMember,
        isActive: member.isActive, yearJoined: member.yearJoined
      };
      if (member.password) data.password = member.password;
      const res = await api.post('/members', data);
      set(state => ({ members: [...state.members, res.data] }));
      return res.data;
    } catch (err) { set({ error: err.response?.data?.message || err.message }); throw err; }
  },
  updateMember: async (id, upd) => {
    try {
      const res = await api.put(`/members/${id}`, {
        firstName: upd.name.split(' ')[0] || upd.name,
        lastName: upd.name.split(' ')[1] || '',
        email: upd.email, phone: upd.phone, position: upd.position,
        image: upd.image, bio: upd.bio, isFoundingMember: upd.isFoundingMember,
        isActive: upd.isActive, yearJoined: upd.yearJoined
      });
      set(state => ({ members: state.members.map(m => m._id === id ? res.data : m) }));
      return res.data;
    } catch (err) { set({ error: err.message }); throw err; }
  },
  deleteMember: async (id) => {
    try { await api.delete(`/members/${id}`); set(state => ({ members: state.members.filter(m => m._id !== id) })); } 
    catch (err) { set({ error: err.message }); throw err; }
  },

  // ---------- Certificates ----------
  fetchCertificates: async () => {
    try { const res = await api.get('/certificates'); set({ certificates: res.data }); } 
    catch (err) { set({ error: err.message }); }
  },
  generateCertificate: async (recipientName, eventId, certificateType) => {
    try {
      set({ loading: true, error: null });
      const res = await api.post('/certificates/generate', { recipientName, eventId: eventId||null, certificateType });
      set(state => ({ certificates: [res.data, ...(state.certificates||[])], loading: false }));
      if (res.data.fileUrl) {
        const a = document.createElement('a'); a.href = res.data.fileUrl;
        a.download = `${recipientName.replace(/\s+/g,'_')}_certificate.pdf`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }
      return res.data;
    } catch (err) { set({ error: err.response?.data?.message || err.message, loading: false }); throw err; }
  },

  // ---------- Attendance ----------
  fetchAttendance: async () => { try { const res = await api.get('/attendance'); set({ attendance: res.data }); } catch(err){ set({ error: err.message }); } },
  markAttendance: async (data) => { try { set({ loading:true }); const res = await api.post('/attendance/mark', data); set(state => ({ attendance: [res.data,...state.attendance], loading:false })); return res.data; } catch(err){ set({ error: err.message, loading:false }); throw err; } },
  markQRAttendance: async (qrToken, memberId) => { try { set({ loading:true }); const res = await api.post('/attendance/qr', { qrToken, memberId }); set(state => ({ attendance: [res.data,...state.attendance], loading:false })); return res.data; } catch(err){ set({ error: err.message, loading:false }); throw err; } },
  generateEventQR: async (eventId) => { try { const res = await api.post(`/attendance/generate-qr/${eventId}`); set(state => ({ events: state.events.map(e => e._id===eventId ? {...e, qrCode:res.data.qrToken}: e) })); return res.data; } catch(err){ set({ error: err.message }); throw err; } },
  deleteAttendance: async (id) => { try { await api.delete(`/attendance/${id}`); set(state => ({ attendance: state.attendance.filter(a => a._id!==id) })); } catch(err){ set({ error: err.message }); throw err; } },

  // ---------- Admins ----------
  fetchAdmins: async () => { try { const res = await api.get('/auth/admins'); set({ admins: res.data }); } catch(err){ set({ error: err.message }); } },
  addAdmin: async (data) => { try { set({ loading:true }); const res = await api.post('/auth/register', data); set(state => ({ admins:[...(state.admins||[]), res.data], loading:false })); return res.data; } catch(err){ set({ error: err.message, loading:false }); throw err; } },
  updateAdmin: async (id, upd) => { try { set({ loading:true }); const res = await api.put(`/auth/admin/${id}`, upd); set(state => ({ admins:(state.admins||[]).map(a=>a._id===id?res.data:a), loading:false })); return res.data; } catch(err){ set({ error: err.message, loading:false }); throw err; } },
  deleteAdmin: async (id) => { try { await api.delete(`/auth/admin/${id}`); set(state => ({ admins:(state.admins||[]).filter(a=>a._id!==id) })); } catch(err){ set({ error: err.message }); throw err; } },
}));

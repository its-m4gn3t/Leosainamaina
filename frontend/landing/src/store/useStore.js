import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const useStore = create((set, get) => ({
  announcements: [],
  events: [],
  upcomingEvents: [],
  pastEvents: [],
  members: [],
  leads: [],
  attendance: [],
  memberAttendance: [],
  memberUser: JSON.parse(localStorage.getItem('leo_member_user') || 'null'),
  isMemberAuthenticated: !!localStorage.getItem('leo_member_token'),
  darkMode: JSON.parse(localStorage.getItem('leo_dark_mode') || 'false'),
  loading: false,
  error: null,
  
  fetchAnnouncements: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/announcements');
      set({ announcements: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchEvents: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/events');
      const events = Array.isArray(response.data) ? response.data : [];
      set({ events, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false, events: [] });
    }
  },
  
  fetchUpcomingEvents: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/events');
      const events = Array.isArray(response.data) ? response.data : [];
      const now = new Date();
      const upcoming = events.filter(e => {
        const eventDate = new Date(e.startDate || e.date);
        return eventDate > now;
      }).sort((a, b) => new Date(a.startDate || a.date) - new Date(b.startDate || b.date));
      set({ upcomingEvents: upcoming, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false, upcomingEvents: [] });
    }
  },
  
  fetchPastEvents: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/events');
      const events = Array.isArray(response.data) ? response.data : [];
      const now = new Date();
      const past = events.filter(e => {
        const eventDate = new Date(e.endDate || e.startDate || e.date);
        return eventDate < now;
      }).sort((a, b) => new Date(b.endDate || b.startDate || b.date) - new Date(a.endDate || a.startDate || a.date));
      set({ pastEvents: past, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false, pastEvents: [] });
    }
  },
  
  fetchMembers: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/members');
      set({ members: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  addLead: async (lead) => {
    try {
      const response = await axios.post(`${API_BASE}/contact`, lead);
      set((state) => ({ leads: [...(state.leads || []), response.data] }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  getPastEventsLocal: () => {
    const state = get();
    const now = new Date();
    const events = Array.isArray(state.events) ? state.events : [];
    return events.filter(e => {
      try {
        return new Date(e.endDate || e.startDate || e.date) < now;
      } catch (error) {
        return false;
      }
    }).sort((a,b) => {
      try {
        return new Date(b.endDate || b.startDate || b.date) - new Date(a.endDate || a.startDate || a.date);
      } catch (error) {
        return 0;
      }
    });
  },
  
  getNextEvent: () => {
    const state = get();
    const now = new Date();
    const events = Array.isArray(state.events) ? state.events : [];
    const upcoming = events.filter(e => {
      try {
        return new Date(e.startDate || e.date) > now;
      } catch (error) {
        return false;
      }
    }).sort((a,b) => {
      try {
        return new Date(a.startDate || a.date) - new Date(b.startDate || b.date);
      } catch (error) {
        return 0;
      }
    });
    return upcoming[0] || null;
  },
  
  // Attendance functions
  markQRAttendance: async (qrToken, memberId) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post(`${API_BASE}/attendance/qr`, { qrToken, memberId });
      set((state) => ({ 
        attendance: [...(state.attendance || []), response.data],
        loading: false 
      }));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },
  
  fetchAttendanceByMember: async (memberId) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/attendance/member/${memberId}`);
      set({ attendance: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  // Member authentication
  memberLogin: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post(`${API_BASE}/members/login`, { 
        email, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: false
      });
      const { token, ...user } = response.data;
      localStorage.setItem('leo_member_token', token);
      localStorage.setItem('leo_member_user', JSON.stringify(user));
      set({ 
        isMemberAuthenticated: true, 
        memberUser: user, 
        loading: false 
      });
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Network error - please try again';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },
  
  memberLogout: () => {
    localStorage.removeItem('leo_member_token');
    localStorage.removeItem('leo_member_user');
    set({ 
      isMemberAuthenticated: false, 
      memberUser: null, 
      memberAttendance: [] 
    });
  },
  
  logout: () => {
    localStorage.removeItem('leo_member_token');
    localStorage.removeItem('leo_member_user');
    set({ 
      isMemberAuthenticated: false, 
      memberUser: null, 
      memberAttendance: [] 
    });
  },
  
  fetchMemberAttendance: async (memberId) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/attendance/member/${memberId}`);
      set({ memberAttendance: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode;
    localStorage.setItem('leo_dark_mode', JSON.stringify(newDarkMode));
    set({ darkMode: newDarkMode });
    document.documentElement.classList.toggle('dark', newDarkMode);
  }
}));
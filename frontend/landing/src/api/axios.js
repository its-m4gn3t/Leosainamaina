import axios from 'axios';

const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const API = axios.create({ baseURL: BACKEND });

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('leo_member_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

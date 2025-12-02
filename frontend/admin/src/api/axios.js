import axios from 'axios';
const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const API = axios.create({ baseURL: BACKEND });
API.interceptors.request.use((config)=>{
  const token = localStorage.getItem('leo_admin_token');
  if(token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default API;

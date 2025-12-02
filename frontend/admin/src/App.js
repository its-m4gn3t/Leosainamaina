import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAdminStore } from './store/useAdminStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Announcements from './pages/Announcements';
import Members from './pages/Members';
import Events from './pages/Events';
import Attendance from './pages/Attendance';
import Certificates from './pages/Certificates';
import Contacts from './pages/Contacts';
import AdminManagement from './pages/AdminManagement';
import Messages from './pages/Messages';
import MessagesNew from './pages/MessagesNew';
import MessagesResponsive from './pages/MessagesResponsive';
import Gallery from './pages/Gallery';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAdminStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App(){
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements/></ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute><Members/></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Events/></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance/></ProtectedRoute>} />
        <Route path="/certificates" element={<ProtectedRoute><Certificates/></ProtectedRoute>} />
        <Route path="/contacts" element={<ProtectedRoute><Contacts/></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesResponsive/></ProtectedRoute>} />
        <Route path="/messages-old" element={<ProtectedRoute><Messages/></ProtectedRoute>} />
        <Route path="/gallery" element={<ProtectedRoute><Gallery/></ProtectedRoute>} />
        <Route path="/admin-management" element={<ProtectedRoute><AdminManagement/></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
export default App;

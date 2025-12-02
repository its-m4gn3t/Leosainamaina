import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store/useStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import PastEvents from './pages/PastEvents';
import QRAttendance from './pages/QRAttendance';
import MemberLogin from './pages/MemberLogin';
import MemberDashboard from './pages/MemberDashboard';
import ModernMemberDashboard from './pages/ModernMemberDashboard';
import Contact from './pages/Contact';
import Announcements from './pages/Announcements';
import Members from './pages/Members';
import Messages from './pages/Messages';
import MessagesNew from './pages/MessagesNew';
import ChatApp from './pages/ChatApp';
import InstagramChat from './pages/InstagramChat';
import NewMemberDashboard from './pages/NewMemberDashboard';
import MemberDashboardNew from './pages/MemberDashboardNew';
import Donate from './pages/Donate';
import Gallery from './pages/Gallery';
import MessagingApp from './pages/MessagingApp';

function AppContent(){
  const { darkMode } = useStore();
  const location = useLocation();
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  
  // Hide footer on member dashboard pages
  const hideFooterPaths = ['/member-dashboard', '/chat', '/messages'];
  const shouldHideFooter = hideFooterPaths.includes(location.pathname);
  
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <Navbar />
      <main className="flex-1 bg-white dark:bg-gray-900 transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/events" element={<Events/>} />
          <Route path="/past-events" element={<PastEvents/>} />
          <Route path="/attendance/qr" element={<QRAttendance/>} />
          <Route path="/member-login" element={<MemberLogin/>} />
          <Route path="/member-dashboard" element={<ModernMemberDashboard/>} />
          <Route path="/member-dashboard-old" element={<MemberDashboard/>} />
          <Route path="/announcements" element={<Announcements/>} />
          <Route path="/members" element={<Members/>} />
          <Route path="/messages" element={<MessagingApp/>} />
          <Route path="/chat" element={<MessagingApp/>} />
          <Route path="/instagram-chat" element={<InstagramChat/>} />
          <Route path="/chat" element={<ChatApp/>} />
          <Route path="/messages-old" element={<Messages/>} />
          <Route path="/member-dashboard-new" element={<NewMemberDashboard/>} />
          <Route path="/dashboard" element={<MemberDashboardNew/>} />
          <Route path="/donate" element={<Donate/>} />
          <Route path="/gallery" element={<Gallery/>} />
          <Route path="/contact" element={<Contact/>} />
        </Routes>
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

export default function App(){
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

import React, { useEffect, useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Topbar from '../layout/Topbar';
import { useAdminStore } from '../store/useAdminStore';
import EventCalendar from '../components/EventCalendar';

export default function Dashboard(){
  const { events, members, announcements, certificates, fetchEvents, fetchMembers, fetchAnnouncements } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    fetchEvents();
    fetchMembers();
    fetchAnnouncements();
  }, [fetchEvents, fetchMembers, fetchAnnouncements]);
  
  const stats = [
    { title: 'Events', count: events.length, color: 'bg-blue-500', icon: '📅' },
    { title: 'Members', count: members.length, color: 'bg-green-500', icon: '👥' },
    { title: 'Announcements', count: announcements.length, color: 'bg-orange-500', icon: '📢' },
    { title: 'Certificates', count: certificates.length, color: 'bg-purple-500', icon: '🏆' }
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-4 md:p-6 flex-1">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome, Admin</h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Manage your Leo Club activities and content</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.count}</p>
                  </div>
                  <div className={`${stat.color} rounded-full p-2 md:p-3 text-white text-xl md:text-2xl`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Event Calendar */}
          <div className="mb-6 md:mb-8">
            <EventCalendar />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4">Recent Events</h3>
              <div className="space-y-3">
                {events.slice(0, 5).map(event => (
                  <div key={event._id || event.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm md:text-base">{event.title}</p>
                      <p className="text-xs md:text-sm text-gray-500">{new Date(event.startDate || event.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded self-start sm:self-center">
                      {event.status || 'Active'}
                    </span>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No events yet</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4">Recent Announcements</h3>
              <div className="space-y-3">
                {announcements.slice(0, 5).map(announcement => (
                  <div key={announcement._id || announcement.id} className="py-2 border-b border-gray-100">
                    <p className="font-medium text-sm md:text-base">{announcement.title}</p>
                    <p className="text-xs md:text-sm text-gray-500">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No announcements yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function PastEvents() {
  const { pastEvents, fetchPastEvents, loading } = useStore();
  
  useEffect(() => {
    fetchPastEvents();
  }, [fetchPastEvents]);

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getCategoryIcon = (category) => {
    const icons = {
      Service: '🌱',
      Meeting: '🤝',
      Training: '📚',
      Fundraising: '💰',
      Social: '🎉'
    };
    return icons[category] || '📅';
  };

  const getCategoryColor = (category) => {
    const colors = {
      Service: 'bg-green-100 text-green-800 border-green-200',
      Meeting: 'bg-blue-100 text-blue-800 border-blue-200',
      Training: 'bg-purple-100 text-purple-800 border-purple-200',
      Fundraising: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Social: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading past events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📚 Past Events</h1>
          <p className="text-gray-600 text-lg">Celebrating our journey of community service and leadership</p>
        </div>

        {pastEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Past Events Yet</h3>
            <p className="text-gray-500">Check back soon for our completed activities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {event.banner && (
                  <div className="h-48 bg-gradient-to-r from-orange-400 to-yellow-400 relative overflow-hidden">
                    <img 
                      src={event.banner} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center text-white text-6xl hidden">
                      {getCategoryIcon(event.category)}
                    </div>
                  </div>
                )}
                
                {!event.banner && (
                  <div className="h-48 bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center text-white text-6xl">
                    {getCategoryIcon(event.category)}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(event.category)}`}>
                      {getCategoryIcon(event.category)} {event.category}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {event.totalHours}h
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="text-lg mr-2">📅</span>
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-1">✅</span>
                      Completed
                    </div>
                    <div className="text-sm text-orange-600 font-medium">
                      {event.totalHours} service hours
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Section */}
        {pastEvents.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Our Impact So Far</h2>
              <p className="text-orange-100">Making a difference in our community</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{pastEvents.length}</div>
                <div className="text-orange-100">Events Completed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {pastEvents.reduce((total, event) => total + event.totalHours, 0)}
                </div>
                <div className="text-orange-100">Service Hours</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {new Set(pastEvents.map(e => e.category)).size}
                </div>
                <div className="text-orange-100">Categories Served</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
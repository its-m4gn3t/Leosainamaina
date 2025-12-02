import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export default function Events(){
  const { 
    upcomingEvents, 
    pastEvents, 
    fetchUpcomingEvents, 
    fetchPastEvents, 
    loading 
  } = useStore();
  
  const [showPastEvents, setShowPastEvents] = useState(false);
  
  useEffect(() => {
    fetchUpcomingEvents();
    fetchPastEvents();
  }, [fetchUpcomingEvents, fetchPastEvents]);
  
  const formatDate = (iso) => {
    if (!iso) return 'Date TBD';
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getCategoryIcon = (category) => {
    if (!category) return '📅';
    const icons = {
      Service: '🌱',
      Meeting: '🤝',
      Training: '📚',
      Fundraising: '💰',
      Social: '🎉'
    };
    return icons[category?.name || category] || '📅';
  };

  const getCategoryColor = (category) => {
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-200';
    const colors = {
      Service: 'bg-green-100 text-green-800 border-green-200',
      Meeting: 'bg-blue-100 text-blue-800 border-blue-200',
      Training: 'bg-purple-100 text-purple-800 border-purple-200',
      Fundraising: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Social: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[category?.name || category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const currentEvents = showPastEvents ? pastEvents : upcomingEvents;

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {showPastEvents ? '📚 Past Events' : '🎯 Upcoming Events'}
          </h1>
          <p className="text-gray-600 mb-6">
            {showPastEvents 
              ? 'Celebrating our completed initiatives and achievements'
              : 'Join us in making a difference in our community'
            }
          </p>
          
          {/* Toggle Button */}
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowPastEvents(false)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                !showPastEvents
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎯 Upcoming Events ({upcomingEvents?.length || 0})
            </button>
            <button
              onClick={() => setShowPastEvents(true)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                showPastEvents
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📚 Past Events ({pastEvents?.length || 0})
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {!currentEvents?.length ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">{showPastEvents ? '📚' : '🎯'}</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {showPastEvents ? 'No Past Events Yet' : 'No Upcoming Events'}
                </h3>
                <p className="text-gray-500">
                  {showPastEvents 
                    ? 'Check back soon for our completed activities!' 
                    : 'New events will be announced soon!'}
                </p>
              </div>
            ) : (
              currentEvents.map(event => (
                <div key={event._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  {event.banner ? (
                    <div className="h-48 bg-gradient-to-r from-orange-400 to-yellow-400 relative overflow-hidden">
                      <img 
                        src={event.banner} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center text-white text-6xl hidden">
                        {getCategoryIcon(event.category)}
                      </div>
                      {showPastEvents && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                            ✅ Completed
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center justify-center text-white text-6xl relative">
                      {getCategoryIcon(event.category)}
                      {showPastEvents && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                            ✅ Completed
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(event.category)}`}>
                        {getCategoryIcon(event.category)} {event.category?.name || event.category || 'General'}
                      </span>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {event.totalHours || 0}h
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title || 'Untitled Event'}</h3>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <span className="text-lg mr-2">📅</span>
                      <span className="font-medium">{formatDate(event.startDate || event.date)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-1">
                          {showPastEvents ? '✅' : '🔄'}
                        </span>
                        {showPastEvents ? 'Completed' : 'Upcoming'}
                      </div>
                      <div className="text-sm text-orange-600 font-medium">
                        {event.totalHours || 0} service hours
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Image Gallery for Past Events */}
        {showPastEvents && currentEvents?.length > 0 && (
          <div className="mt-16">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">📸 Event Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentEvents.filter(event => event.banner).map(event => (
                <div key={`gallery-${event._id}`} className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow group">
                  <img 
                    src={event.banner} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Statistics Section */}
        {currentEvents?.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                {showPastEvents ? 'Our Achievements' : 'What\'s Coming Up'}
              </h2>
              <p className="text-orange-100">
                {showPastEvents 
                  ? 'Impact we\'ve made in our community' 
                  : 'Opportunities to make a difference'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{currentEvents.length}</div>
                <div className="text-orange-100">
                  {showPastEvents ? 'Events Completed' : 'Events Planned'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {currentEvents.reduce((total, event) => total + (event.totalHours || 0), 0)}
                </div>
                <div className="text-orange-100">
                  {showPastEvents ? 'Hours Completed' : 'Hours Planned'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {new Set(currentEvents.map(e => e.category?.name || e.category || 'General')).size}
                </div>
                <div className="text-orange-100">Categories</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

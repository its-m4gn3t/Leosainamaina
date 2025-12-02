import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function Announcements() {
  const { announcements, fetchAnnouncements, loading } = useStore();
  
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);
  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📢 Announcements</h1>
          <p className="text-gray-600">Stay updated with our latest news and updates</p>
        </div>
        
        <div className="space-y-6">
          {!announcements?.length ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No announcements yet.</div>
            </div>
          ) : (
            announcements?.map?.(announcement => (
              <div key={announcement._id} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{announcement.title}</h2>
                  <p className="text-gray-500 text-sm">{formatDate(announcement.createdAt)}</p>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: announcement.title,
                          text: announcement.description,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard?.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
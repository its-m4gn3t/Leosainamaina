import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function Members() {
  const { members, fetchMembers, loading } = useStore();
  
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const activeMembers = members?.filter(m => m.isActive !== false) || [];
  const foundingMembers = activeMembers.filter(m => m.isFoundingMember) || [];
  const currentMembers = activeMembers.filter(m => !m.isFoundingMember) || [];

  const formatDate = (iso) => new Date(iso).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">👥 Our Members</h1>
          <p className="text-gray-600">Meet our active members who make Leo Club Of Sainamaina possible</p>
        </div>

        {/* Founding Members */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-orange-600">🏆 Founding Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foundingMembers.map((member) => (
              <div key={member._id} className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
                <div className="text-center">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-orange-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 ${member.image ? 'hidden' : ''}`}>
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.firstName} {member.lastName}</h3>
                  <p className="text-orange-600 font-semibold mb-2">{member.position}</p>
                  {member.bio && <p className="text-gray-600 text-sm mb-2">{member.bio}</p>}
                  <p className="text-gray-500 text-sm">Since {formatDate(member.joinedAt || member.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Current Active Members */}
        {currentMembers.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-600">👥 Current Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentMembers.map((member) => (
                <div key={member._id} className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-blue-500">
                  <div className="text-center">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-blue-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 ${member.image ? 'hidden' : ''}`}>
                      <span className="text-xl">👤</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{member.firstName} {member.lastName}</h3>
                    <p className="text-blue-600 font-medium text-sm mb-1">{member.position || 'Member'}</p>
                    <p className="text-gray-500 text-xs">Year {member.yearJoined || new Date().getFullYear()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}



        {/* Join Us Section */}
        <section className="mt-16 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community!</h2>
          <p className="text-xl mb-6">
            Become part of Leo Club Of Sainamaina and make a difference in your community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-white text-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Contact Us
            </a>
            <a 
              href="mailto:info@leosainamaina.org" 
              className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-500 transition"
            >
              Send Email
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
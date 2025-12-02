import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Home(){
  const { 
    announcements, 
    events, 
    upcomingEvents,
    pastEvents,
    members,
    fetchAnnouncements, 
    fetchEvents, 
    fetchUpcomingEvents,
    fetchPastEvents,
    fetchMembers,
    getNextEvent, 
    loading 
  } = useStore();
  
  const [activeSection, setActiveSection] = useState(0);
  
  useEffect(() => {
    fetchAnnouncements();
    fetchEvents();
    fetchUpcomingEvents();
    fetchPastEvents();
    fetchMembers();
  }, [fetchAnnouncements, fetchEvents, fetchUpcomingEvents, fetchPastEvents, fetchMembers]);
  
  const nextEvent = getNextEvent();
  const recentAnnouncements = (announcements || []).slice(0, 3);
  const foundingMembers = (members || []).filter(m => m.isFoundingMember).slice(0, 6);
  const recentPastEvents = (pastEvents || []).slice(0, 6);

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
      Social: '🎉',
      Environmental: '🌿',
      Education: '🎓'
    };
    return icons[category?.name || category] || '📅';
  };

  return (
    <div className="min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-24 px-4 overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-xl rounded-full px-8 py-4 mb-8 border border-white/20 shadow-2xl">
                <span className="text-lg font-semibold flex items-center gap-3">
                  <span className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></span>
                  <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Serving Sainamaina Community
                  </span>
                </span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-none">
                <span className="block bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Leo Club
                </span>
                <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent mt-2">
                  Sainamaina
                </span>
              </h1>
              <p className="text-2xl lg:text-3xl mb-10 opacity-95 leading-relaxed font-light">
                Empowering <span className="font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">youth</span> through community service, 
                <span className="font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">leadership</span> training, and local action.
              </p>
              
              {/* Support Mission Section */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-xl">
                    <span className="text-2xl">💛</span>
                    <span>Support Our Mission</span>
                    <span className="text-2xl">🚀</span>
                  </div>
                </div>
                <p className="text-white/95 text-center mb-8 text-xl leading-relaxed">
                  "Every donation helps us create lasting change in our community. Together, we can build a brighter tomorrow for Sainamaina."
                </p>
                <div className="text-center">
                  <Link to="/donate" className="inline-block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all transform hover:scale-105 shadow-xl border border-white/20">
                    <span className="flex items-center gap-4">
                      <span className="text-2xl">🎁</span>
                      <span>Donate Now</span>
                      <span className="text-2xl">❤️</span>
                    </span>
                  </Link>
                  <p className="text-white/80 text-sm mt-4">Your generosity fuels our community impact</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link to="/events" className="group relative bg-white/95 backdrop-blur-sm text-gray-900 px-12 py-6 rounded-2xl font-bold text-xl hover:bg-white transition-all transform hover:scale-105 shadow-2xl hover:shadow-3xl overflow-hidden">
                  <span className="relative z-10 flex items-center gap-4">
                    <span className="text-3xl group-hover:animate-bounce">🎯</span>
                    <span>Explore Events</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
                <Link to="/members" className="group relative border-2 border-white/80 backdrop-blur-sm px-12 py-6 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all transform hover:scale-105 shadow-xl overflow-hidden">
                  <span className="relative z-10 flex items-center gap-4">
                    <span className="text-3xl group-hover:animate-bounce">👥</span>
                    <span>Join Our Mission</span>
                  </span>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white p-8 rounded-3xl shadow-2xl max-w-sm w-full">
                <div className="flex items-center mb-6">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 animate-pulse shadow-lg"></div>
                  <h3 className="font-bold text-xl">Next Event</h3>
                </div>
                {nextEvent ? (
                  <div>
                    <h4 className="font-bold text-lg bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mb-3">{nextEvent.title}</h4>
                    <div className="flex items-center text-white/80 text-sm mb-4">
                      <span className="mr-2 text-lg">📅</span>
                      {formatDate(nextEvent.startDate || nextEvent.date)}
                    </div>
                    <Link to="/events" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all block text-center shadow-lg">
                      View Details →
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-white/70 mb-4">No events scheduled yet</div>
                    <Link to="/events" className="text-yellow-300 font-semibold hover:text-yellow-200 transition-colors">
                      Check back soon →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About Us */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">About Leo Club of Sainamaina</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              A youth-led, community-driven volunteer organization dedicated to empowering young people through leadership, 
              service, and positive community transformation. Chartered under Lions Clubs International.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-8 rounded-2xl border border-orange-100 dark:border-orange-800">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Our Mission</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                To empower young people of Sainamaina with opportunities for leadership, community service, 
                personal development, and social responsibility—creating engaged citizens who contribute to a better tomorrow.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800">
              <div className="text-4xl mb-4">🔭</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Our Vision</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                To become a model youth organization that inspires hope, fosters leadership, 
                and drives sustainable development across Sainamaina and beyond.
              </p>
            </div>
          </div>
          
          {/* Core Values */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">💛 Our Core Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: "👑", title: "Leadership", desc: "We encourage members to grow as responsible and confident leaders" },
                { icon: "🎆", title: "Experience", desc: "We learn through projects, teamwork, and real-world community engagement" },
                { icon: "🎁", title: "Opportunity", desc: "We provide a platform for youths to explore their talents, skills, and potential" },
                { icon: "❤️", title: "Service", desc: "At the heart of our club lies the commitment to help those in need" },
                { icon: "💯", title: "Integrity", desc: "We practice honesty, transparency, and accountability in everything we do" },
                { icon: "🤝", title: "Unity", desc: "We believe in the power of working together for common goals" }
              ].map((value, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                  <div className="text-3xl mb-3">{value.icon}</div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{value.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* History */}
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-8 rounded-2xl">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">🕰️ Our Journey</h3>
            <p className="text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
              Leo Club of Sainamaina was formed to unite the youth of our community under a single banner of service and leadership. 
              Inspired by the global vision of Lions Clubs International, our founders aimed to create a platform where young individuals 
              can contribute to local development, lead impactful initiatives, and represent Sainamaina with pride.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500 to-yellow-400">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">📊 Our Impact</h2>
            <p className="text-orange-100 text-lg">Numbers that tell our story</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center text-white">
              <div className="text-5xl font-bold mb-2">{(pastEvents?.length || 0) + (upcomingEvents?.length || 0)}</div>
              <div className="text-orange-100 font-medium">Total Events</div>
            </div>
            <div className="text-center text-white">
              <div className="text-5xl font-bold mb-2">{pastEvents?.reduce((total, event) => total + event.totalHours, 0) || 0}</div>
              <div className="text-orange-100 font-medium">Service Hours</div>
            </div>
            <div className="text-center text-white">
              <div className="text-5xl font-bold mb-2">{members?.length || 0}</div>
              <div className="text-orange-100 font-medium">Active Members</div>
            </div>
            <div className="text-center text-white">
              <div className="text-5xl font-bold mb-2">4+</div>
              <div className="text-orange-100 font-medium">Years of Service</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Focus Areas */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">🎯 Our Impact Areas</h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">Seven key areas where we create lasting positive change</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[
              { icon: "🎆", title: "Youth Empowerment", items: ["Leadership training", "Skill development", "Career guidance"] },
              { icon: "🤝", title: "Community Service", items: ["Family support", "Blood donation", "Cleanliness drives"] },
              { icon: "📚", title: "Education & Literacy", items: ["Book distribution", "School outreach", "Digital literacy"] },
              { icon: "🏥", title: "Health & Well-Being", items: ["Health camps", "Mental health support", "Nutrition programs"] },
              { icon: "🌱", title: "Environment", items: ["Tree plantation", "Clean-up drives", "Climate awareness"] },
              { icon: "🎭", title: "Cultural Engagement", items: ["Festival events", "Sports activities", "Art programs"] },
              { icon: "🆘", title: "Emergency Response", items: ["Disaster relief", "Volunteer mobilization", "Crisis support"] }
            ].map((area, idx) => (
              <div key={idx} className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">{area.icon}</div>
                  <h3 className="text-white font-bold text-lg mb-3">{area.title}</h3>
                </div>
                <ul className="text-white/90 space-y-2">
                  {area.items.map((item, i) => (
                    <li key={i} className="text-sm flex items-center">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Latest Announcements */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">📢 Latest Updates</h2>
            <p className="text-gray-600 text-lg">Stay informed about our activities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentAnnouncements?.map?.(announcement => (
              <div key={announcement._id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-900">{announcement.title}</h3>
                  <span className="text-xl">📢</span>
                </div>
                <p className="text-gray-500 text-sm mb-3">{formatDate(announcement.createdAt)}</p>
                <p className="text-gray-700">{announcement.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Upcoming Events */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">🎯 Upcoming Events</h2>
            <p className="text-gray-600 text-lg">Join us in making a difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {(upcomingEvents || []).slice(0, 6).map(event => (
              <div key={event._id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-orange-500">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{getCategoryIcon(event.category)}</span>
                  <span 
                    className="px-2 py-1 rounded text-sm text-white"
                    style={{ backgroundColor: event.category?.color || '#F97316' }}
                  >
                    {event.category?.name || event.category}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">{event.title}</h4>
                <div className="flex items-center text-orange-600 font-semibold mb-4">
                  <span className="mr-2">📅</span>
                  {formatDate(event.startDate || event.date)}
                </div>
                <div className="text-sm text-gray-600">{event.totalHours} hours</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/events" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all">
              View All Events →
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Past Events Gallery */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">📸 Event Gallery</h2>
            <p className="text-gray-600 text-lg">Memories from our completed initiatives</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {recentPastEvents.map(event => (
              <div key={event._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                {event.banner ? (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={event.banner} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="h-48 bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white text-4xl hidden">
                      {getCategoryIcon(event.category)}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white text-4xl">
                    {getCategoryIcon(event.category)}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      ✅ Completed
                    </span>
                    <span className="text-xs text-gray-500">{event.totalHours}h</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">{event.title}</h4>
                  <p className="text-sm text-gray-600">{formatDate(event.endDate || event.date)}</p>
                </div>
              </div>
            ))}
          </div>
          {recentPastEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Gallery Coming Soon</h3>
              <p className="text-gray-500">Event photos will be displayed here after completion</p>
            </div>
          )}
        </div>
      </section>

      {/* 8. Founding Members */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">🏆 Founding Members</h2>
            <p className="text-gray-600 text-lg">Meet the visionaries who started it all</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {foundingMembers.map(member => (
              <div key={member._id} className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 text-center">
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-orange-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👤</span>
                  </div>
                )}
                <h3 className="font-bold text-lg text-gray-900 mb-1">{member.firstName} {member.lastName}</h3>
                <p className="text-orange-600 font-semibold mb-2">{member.position}</p>
                {member.bio && <p className="text-gray-600 text-sm">{member.bio}</p>}
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/members" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all">
              Meet All Members →
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Values & Principles */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">💎 Our Core Values</h2>
            <p className="text-blue-200 text-lg">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🤝", title: "Service", desc: "Putting community needs first" },
              { icon: "👑", title: "Leadership", desc: "Developing future leaders" },
              { icon: "🤗", title: "Fellowship", desc: "Building lasting friendships" },
              { icon: "🌟", title: "Excellence", desc: "Striving for the highest standards" }
            ].map((value, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-blue-200">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Community Impact */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">🌍 Community Impact</h2>
            <p className="text-gray-600 text-lg">How we're making a difference in Sainamaina</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Environmental</h3>
              <p className="text-gray-600">Tree plantations, clean-up drives, and environmental awareness programs</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Educational</h3>
              <p className="text-gray-600">Supporting local schools, literacy programs, and educational resources</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Social</h3>
              <p className="text-gray-600">Community events, health camps, and support for vulnerable families</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Partnerships */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">🤝 Our Partners</h2>
          <p className="text-gray-600 text-lg mb-12">Working together for greater impact</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Lions Club International", icon: "🦁" },
              { name: "Local Government", icon: "🏛️" },
              { name: "Schools & Colleges", icon: "🎓" },
              { name: "Healthcare Centers", icon: "🏥" }
            ].map((partner, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-3">{partner.icon}</div>
                <h3 className="font-semibold text-gray-900">{partner.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Testimonials */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">💬 What People Say</h2>
            <p className="text-purple-200 text-lg">Voices from our community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { quote: "Leo Club Sainamaina has been instrumental in bringing positive change to our community.", author: "Community Leader" },
              { quote: "The youth leadership programs have helped shape many young minds in our area.", author: "Local Teacher" },
              { quote: "Their environmental initiatives have made our neighborhood cleaner and greener.", author: "Resident" }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
                <p className="text-white/90 mb-4 italic">"{testimonial.quote}"</p>
                <p className="text-purple-200 font-semibold">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Get Involved */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">🚀 Get Involved</h2>
            <p className="text-gray-600 text-lg">Multiple ways to make a difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "👥", title: "Become a Member", desc: "Join our community of changemakers" },
              { icon: "🎯", title: "Volunteer", desc: "Help us with events and activities" },
              { icon: "💰", title: "Donate", desc: "Support our community initiatives" },
              { icon: "📢", title: "Spread the Word", desc: "Share our mission with others" }
            ].map((way, idx) => (
              <div key={idx} className="text-center bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{way.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{way.title}</h3>
                <p className="text-gray-600">{way.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. Contact Information */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">📞 Contact Us</h2>
            <p className="text-gray-300 text-lg">Ready to make a difference? Get in touch!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-gray-300">info@leosainamaina.org</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Phone</h3>
              <p className="text-gray-300">+977-XXX-XXXX</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Location</h3>
              <p className="text-gray-300">Sainamaina, Nepal</p>
            </div>
          </div>
          <div className="text-center">
            <Link to="/contact" className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all">
              Send Message →
            </Link>
          </div>
        </div>
      </section>

      {/* 15. Footer CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500 to-yellow-400 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Join Leo Club of Sainamaina and be part of a community that's creating positive change every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all">
              Join Us Today
            </Link>
            <Link to="/events" className="border-2 border-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-orange-600 transition-all">
              Explore Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

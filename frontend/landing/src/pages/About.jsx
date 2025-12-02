import React from 'react';

export default function About(){
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">About Leo Club Of Sainamaina</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-8">
              Leo Club of Sainamaina is a youth-led, community-driven volunteer organization dedicated to empowering young people through leadership, service, and positive community transformation. Chartered under Lions Clubs International, our club brings together passionate youths of Sainamaina who are committed to creating meaningful impact through innovation, teamwork, and humanitarian service.
            </p>
            
            <p className="text-gray-700 mb-8">
              We believe that leadership begins with service, and every member of our club plays an active role in uplifting society, promoting social change, and building a compassionate community for all.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-orange-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-orange-600 mb-4">⭐ Our Mission</h2>
                <p className="text-gray-700">
                  To empower young people of Sainamaina with opportunities for leadership, community service, personal development, and social responsibility—creating engaged citizens who contribute to a better tomorrow.
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-yellow-600 mb-4">🔭 Our Vision</h3>
                <p className="text-gray-700">
                  To become a model youth organization that inspires hope, fosters leadership, and drives sustainable development across Sainamaina and beyond.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">💛 Our Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-bold text-lg mb-2">Leadership</h4>
                  <p className="text-gray-700">We encourage members to grow as responsible and confident leaders.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-bold text-lg mb-2">Experience</h4>
                  <p className="text-gray-700">We learn through projects, teamwork, and real-world community engagement.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-bold text-lg mb-2">Opportunity</h4>
                  <p className="text-gray-700">We provide a platform for youths to explore their talents, skills, and potential.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-bold text-lg mb-2">Service</h4>
                  <p className="text-gray-700">At the heart of our club lies the commitment to help those in need.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-bold text-lg mb-2">Integrity</h4>
                  <p className="text-gray-700">We practice honesty, transparency, and accountability in everything we do.</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🕰️ Our History</h2>
              <p className="text-gray-700 mb-4">
                Leo Club of Sainamaina was formed to unite the youth of our community under a single banner of service and leadership. Inspired by the global vision of Lions Clubs International, our founders aimed to create a platform where young individuals can contribute to local development, lead impactful initiatives, and represent Sainamaina with pride.
              </p>
              <p className="text-gray-700">
                Since our establishment, we have grown into a vibrant and active club known for creativity, teamwork, and a strong commitment to community welfare.
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-6 rounded-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🌟 Our Impact</h2>
              <p className="text-gray-700">
                Throughout our journey, Leo Club of Sainamaina has touched countless lives through service, awareness, empowerment, and community mobilization. Our goal is to continue expanding our reach, developing compassionate leaders, and building a stronger, more connected Sainamaina.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

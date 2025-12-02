import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function Contact(){
  const { addLead } = useStore();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all fields');
      return;
    }
    addLead(formData);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
            <p className="text-gray-600 mb-8">Send us a message and we will get back to you.</p>
            
            {isSubmitted && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                Thanks — message saved successfully!
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea 
                  rows="5" 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
                  required
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition">
                Send Message
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Get Involved</h3>
            <p className="text-gray-600 mb-8">Follow our Facebook page and reach out to join events or volunteer.</p>
            
            <div className="space-y-4">
              <div>
                <strong className="text-gray-800">Facebook:</strong>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 ml-2">
                  LEO Club Of Sainamaina
                </a>
              </div>
              <div>
                <strong className="text-gray-800">Location:</strong>
                <span className="text-gray-600 ml-2">Sainamaina, Rupandehi, Lumbini Province</span>
              </div>
              <div>
                <strong className="text-gray-800">Email:</strong>
                <span className="text-gray-600 ml-2">info@leosainamaina.org</span>
              </div>
              <div>
                <strong className="text-gray-800">Phone:</strong>
                <span className="text-gray-600 ml-2">+977-XXXX-XXXXXX</span>
              </div>
            </div>

            <div className="mt-8 p-6 bg-orange-50 rounded-lg">
              <h4 className="font-bold text-lg mb-3">Join Our Mission</h4>
              <p className="text-gray-700 text-sm">
                Leo Club Of Sainamaina welcomes young people aged 12-30 who are passionate about community service and leadership development. Contact us to learn about membership opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

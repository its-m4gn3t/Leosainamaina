import React, { useState } from 'react';

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('one-time');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const predefinedAmounts = [500, 1000, 2500, 5000, 10000];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount('');
  };

  const handleInputChange = (e) => {
    setDonorInfo({
      ...donorInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleDonate = (e) => {
    e.preventDefault();
    const amount = selectedAmount || customAmount;
    if (!amount || amount <= 0) {
      alert('Please select or enter a valid donation amount');
      return;
    }
    
    // Here you would integrate with payment gateway
    alert(`Thank you for your ${amount} NPR donation! Payment integration coming soon.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-400 text-white py-20 px-4">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <span className="text-lg font-medium">💝 Make a Difference Today</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold mb-6">
            Support Our Mission
          </h1>
          <p className="text-xl lg:text-2xl mb-8 opacity-95 max-w-3xl mx-auto">
            Your generous donation helps us create lasting positive change in Sainamaina through community service, youth empowerment, and local development initiatives.
          </p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Your Impact in Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center border-l-4 border-orange-500">
              <div className="text-4xl mb-4">🌱</div>
              <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-700">Trees Planted</div>
              <div className="text-sm text-gray-500 mt-2">NPR 100 = 5 trees</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center border-l-4 border-blue-500">
              <div className="text-4xl mb-4">📚</div>
              <div className="text-3xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-gray-700">Students Supported</div>
              <div className="text-sm text-gray-500 mt-2">NPR 500 = 1 student kit</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center border-l-4 border-green-500">
              <div className="text-4xl mb-4">🏥</div>
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-700">Health Camps</div>
              <div className="text-sm text-gray-500 mt-2">NPR 2000 = 1 health camp</div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-2">Choose Your Donation</h2>
              <p className="text-orange-100">Every contribution makes a difference</p>
            </div>
            
            <form onSubmit={handleDonate} className="p-8">
              {/* Donation Type */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-900 mb-4">Donation Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setDonationType('one-time')}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                      donationType === 'one-time'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    One-time
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationType('monthly')}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                      donationType === 'monthly'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-900 mb-4">Select Amount (NPR)</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {predefinedAmounts.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleAmountSelect(amount)}
                      className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                        selectedAmount === amount
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={handleCustomAmount}
                    className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="1"
                  />
                  <span className="absolute right-4 top-3 text-gray-500">NPR</span>
                </div>
              </div>

              {/* Donor Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={donorInfo.name}
                    onChange={handleInputChange}
                    className="py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={donorInfo.email}
                    onChange={handleInputChange}
                    className="py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (Optional)"
                  value={donorInfo.phone}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
                />
                <textarea
                  name="message"
                  placeholder="Message or dedication (Optional)"
                  value={donorInfo.message}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                ></textarea>
              </div>

              {/* Donate Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 text-white py-4 px-8 rounded-2xl font-bold text-xl hover:from-orange-600 hover:to-yellow-500 transition-all transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center justify-center gap-3">
                  <span>💝</span>
                  Donate {selectedAmount || customAmount ? `NPR ${selectedAmount || customAmount}` : 'Now'}
                  <span>🙏</span>
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Why Donate */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Your Donation Matters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Direct Impact</h3>
              <p className="text-gray-600">100% of donations go directly to community projects and initiatives</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent Use</h3>
              <p className="text-gray-600">Regular updates on how your donations are making a difference</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Local Focus</h3>
              <p className="text-gray-600">Supporting Sainamaina community development and youth empowerment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Large Donations */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Planning a Larger Donation?</h2>
          <p className="text-xl mb-8 text-blue-200">
            For corporate partnerships, major gifts, or in-kind donations, we'd love to discuss how we can work together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:info@leosainamaina.org" 
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all"
            >
              📧 Email Us
            </a>
            <a 
              href="tel:+977-XXX-XXXX" 
              className="border-2 border-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-gray-900 transition-all"
            >
              📞 Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
import React, { useState } from 'react';

export default function ModernDateTimePicker({ 
  label, 
  value, 
  onChange, 
  placeholder = "Select date and time",
  required = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Parse existing value
  React.useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date.toISOString().split('T')[0]);
      setSelectedTime(date.toTimeString().slice(0, 5));
    }
  }, [value]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    updateDateTime(date, selectedTime);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    updateDateTime(selectedDate, time);
  };

  const updateDateTime = (date, time) => {
    if (date && time) {
      const dateTime = `${date}T${time}`;
      onChange(dateTime);
      setIsOpen(false);
    }
  };

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    const date = new Date(value);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickDateOptions = [
    { label: 'Today', getValue: () => new Date() },
    { label: 'Tomorrow', getValue: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { label: 'Next Week', getValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { label: 'Next Month', getValue: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-left text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-md transition-all duration-200 hover:bg-white/20"
        >
          <div className="flex items-center justify-between">
            <span className={value ? 'text-white' : 'text-gray-300'}>
              {formatDisplayValue()}
            </span>
            <svg className={`w-5 h-5 text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4">
              {/* Quick Date Options */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Select</h4>
                <div className="grid grid-cols-2 gap-2">
                  {quickDateOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => {
                        const date = option.getValue();
                        const dateStr = date.toISOString().split('T')[0];
                        const timeStr = '10:00';
                        setSelectedDate(dateStr);
                        setSelectedTime(timeStr);
                        updateDateTime(dateStr, timeStr);
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Picker */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Date</h4>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                />
              </div>

              {/* Time Slots */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Times</h4>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleTimeChange(time)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        selectedTime === time
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                
                {/* Custom Time */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Custom Time</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedDate('');
                    setSelectedTime('');
                    onChange('');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
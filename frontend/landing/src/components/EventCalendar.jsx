import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // month, week

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  const nepaliMonths = [
    'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];

  const englishMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];
  const englishDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonth = new Date(year, month - 1, 0);
      days.push({ day: prevMonth.getDate() - startingDayOfWeek + i + 1, isCurrentMonth: false });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true });
    }
    
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({ day, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (day, isCurrentMonth) => {
    if (!day || !Array.isArray(events) || !isCurrentMonth) return [];
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return events.filter(event => {
      if (!event?.startDate) return false;
      try {
        const eventDate = new Date(event.startDate).toISOString().split('T')[0];
        return eventDate === dateStr;
      } catch (error) {
        return false;
      }
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return false;
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const getTithiInfo = (day) => {
    // Simplified tithi calculation (in real app, use proper Nepali calendar library)
    const tithis = ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा/अमावस्या'];
    return tithis[day % 15];
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 border border-red-100 dark:border-gray-700">
      {/* Header - Hamro Patro Style */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-red-200 dark:border-gray-600">
        <div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
            📅 पात्रो Calendar
          </h2>
          <p className="text-sm text-red-600 dark:text-red-400">Leo Club Events</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
          >
            ←
          </button>
          <div className="text-center">
            <div className="font-bold text-lg text-red-800 dark:text-red-300">
              {englishMonths[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">
              {nepaliMonths[currentDate.getMonth()]} २०८१
            </div>
          </div>
          <button
            onClick={() => navigateMonth(1)}
            className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid - Hamro Patro Style */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {dayNames.map((day, index) => (
          <div key={day} className="p-3 text-center bg-red-600 text-white font-bold rounded-lg mb-2">
            <div className="text-sm">{day}</div>
            <div className="text-xs opacity-80">{englishDays[index]}</div>
          </div>
        ))}
        
        {/* Calendar days */}
        {getDaysInMonth(currentDate).map((dateObj, index) => {
          const { day, isCurrentMonth } = dateObj;
          const dayEvents = getEventsForDate(day, isCurrentMonth);
          const hasEvents = dayEvents.length > 0;
          const today = isToday(day, isCurrentMonth);
          
          return (
            <div
              key={index}
              className={`relative p-2 min-h-[80px] border-2 cursor-pointer transition-all hover:shadow-lg ${
                !isCurrentMonth 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700' 
                  : today
                  ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white border-red-400 shadow-lg'
                  : hasEvents
                  ? 'bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 border-orange-300 dark:border-orange-600'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-gray-600'
              } rounded-lg`}
              onClick={() => isCurrentMonth && setSelectedDate(day)}
            >
              {/* Date number */}
              <div className={`font-bold text-lg mb-1 ${
                today ? 'text-white' : isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
              }`}>
                {day}
              </div>
              
              {/* Nepali date & tithi */}
              {isCurrentMonth && (
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                  <div>{day + 15}</div>
                  <div className="text-[10px] opacity-75">{getTithiInfo(day)}</div>
                </div>
              )}
              
              {/* Events */}
              {hasEvents && isCurrentMonth && (
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event, i) => (
                    <div
                      key={i}
                      className="text-[10px] bg-red-600 text-white px-1 py-0.5 rounded truncate font-medium"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-red-700 dark:text-red-300 font-bold">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              )}
              
              {/* Today indicator */}
              {today && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Events - Hamro Patro Style */}
      {selectedDate && (
        <div className="mt-6 p-6 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 rounded-xl border-2 border-red-200 dark:border-red-700">
          <h3 className="font-bold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
            🗓️ {englishMonths[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
            <span className="text-sm">({nepaliMonths[currentDate.getMonth()]} {selectedDate + 15})</span>
          </h3>
          {getEventsForDate(selectedDate, true).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🕉️</div>
              <p className="text-red-600 dark:text-red-400">यस दिन कुनै कार्यक्रम छैन</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">No events scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getEventsForDate(selectedDate, true).map(event => (
                <div key={event._id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-red-500 shadow-md">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{event.title}</h4>
                    <p className="text-red-600 dark:text-red-400 font-medium">{event.location}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🕐 {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-2xl">
                    {event.category?.name === 'Service' ? '🌱' : 
                     event.category?.name === 'Meeting' ? '🤝' : 
                     event.category?.name === 'Training' ? '📚' : '📅'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
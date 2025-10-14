import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';

export default function Calendar() {
  const { isDarkTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const scrollRef = useRef(null);

  // Sample events data matching the screenshot exactly
  const sampleEvents = [
    {
      id: 1,
      date: 4,
      client: 'Client A',
      package: 'Package A',
      time: '11 AM',
      status: 'approved',
      color: 'bg-green-400 text-white',
      span: 1
    },
    {
      id: 2,
      date: 10,
      client: 'Client B',
      package: 'Meeting',
      time: '2 PM',
      status: 'pending',
      color: 'bg-blue-300 text-white',
      span: 2 // Spans 2 cells
    },
    {
      id: 3,
      date: 15,
      client: 'Client C',
      package: 'Package C',
      time: '11 AM',
      status: 'pending',
      color: 'bg-purple-300 text-white',
      span: 1
    },
    {
      id: 4,
      date: 19,
      client: 'Client D',
      package: 'Package D',
      time: '9 AM',
      status: 'approved',
      color: 'bg-green-400 text-white',
      span: 2 // Spans 2 cells
    }
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Fetch calendar data
  useEffect(() => {
    fetchCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const fetchCalendarData = () => {
    setLoading(true);
    setError(null);

    const token = sessionStorage.getItem("backend-token");
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_DEV_API_URL || "http://localhost:3000";

    if (!token) {
      setEvents(sampleEvents);
      setLoading(false);
      return;
    }

    fetch(`${apiUrl}/api/Analytics/calendar`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch calendar data");
        return response.json();
      })
      .then(data => {
        // Filter events for the current month and year
        const filtered = data.filter(event => {
          const eventDate = new Date(event.date);
          return (
            eventDate.getFullYear() === currentYear &&
            eventDate.getMonth() === currentMonth
          );
        }).map(event => ({
          ...event,
          date: new Date(event.date).getDate(),
          color: event.status === "approved"
            ? "bg-green-400 text-white"
            : "bg-purple-300 text-white",
          span: 1
        }));
        setEvents(filtered);
      })
      .catch(err => {
        setError(err.message);
        setEvents(sampleEvents); // Fallback to sample data
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
  };

  const handleDayClick = (day) => {
    console.log('Day clicked:', day);
  };

  const getEventsForDate = (date) => {
    return events.filter(event => event.date === date);
  };

  const getSpannedEvents = () => {
    // Create a map to track which cells are occupied by spanning events
    const spannedEventMap = new Map();
    
    events.forEach(event => {
      if (event.span > 1) {
        for (let i = 0; i < event.span; i++) {
          const targetDate = event.date + i;
          if (targetDate <= daysInMonth) {
            spannedEventMap.set(targetDate, {
              ...event,
              isStart: i === 0,
              isEnd: i === event.span - 1,
              position: i
            });
          }
        }
      }
    });
    
    return spannedEventMap;
  };

  const renderCalendarDays = () => {
    const days = [];
    const spannedEventMap = getSpannedEvents();
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className={`h-14 border ${
          isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
        }`}></div>
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day).filter(event => event.span === 1);
      const spannedEvent = spannedEventMap.get(day);
      
      days.push(
        <div 
          key={day} 
          className={`h-14 border p-1 relative cursor-pointer transition-colors overflow-hidden ${
            isDarkTheme 
              ? 'border-gray-600 bg-gray-800 hover:bg-gray-700' 
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
          onClick={() => handleDayClick(day)}
        >
          <span className={`text-xs font-medium ${
            isDarkTheme ? 'text-gray-300' : 'text-gray-700'
          }`}>{day}</span>
          <div className="mt-1 overflow-hidden">
            {/* Regular single-cell events */}
            {dayEvents.slice(0, 1).map(event => (
              <div
                key={event.id}
                className={`${event.color} rounded text-xs cursor-pointer hover:opacity-90 transition-opacity p-1`}
                style={{ fontSize: '9px', lineHeight: '1' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event);
                }}
              >
                <div className="font-medium truncate">{event.client}</div>
                <div className="opacity-90 truncate">{event.package}</div>
                <div className="opacity-90 truncate">{event.time}</div>
              </div>
            ))}
            
            {/* Show +more indicator if there are more events */}
            {dayEvents.length > 1 && (
              <div className={`text-xs mt-1 ${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`}>
                +{dayEvents.length - 1} more
              </div>
            )}
            
            {/* Spanned events */}
            {spannedEvent && (
              <div
                className={`${spannedEvent.color} ${spannedEvent.isStart ? 'rounded-l' : ''} ${spannedEvent.isEnd ? 'rounded-r' : ''} text-xs cursor-pointer hover:opacity-90 transition-opacity absolute left-1 right-0 z-10 p-1 overflow-hidden`}
                style={{
                  left: spannedEvent.isStart ? '4px' : '0px',
                  right: spannedEvent.isEnd ? '4px' : '-1px',
                  top: '14px',
                  fontSize: '9px',
                  lineHeight: '1'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(spannedEvent);
                }}
              >
                {spannedEvent.isStart && (
                  <>
                    <div className="font-medium truncate">{spannedEvent.client}</div>
                    <div className="opacity-90 truncate">{spannedEvent.package}</div>
                    <div className="opacity-90 truncate">{spannedEvent.time}</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  // Auto-scroll to current month when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && scrollRef.current) {
      const currentMonthElement = scrollRef.current.children[currentMonth];
      if (currentMonthElement) {
        currentMonthElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [isDropdownOpen, currentMonth]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectMonth = (monthIndex) => {
    setCurrentDate(new Date(currentYear, monthIndex, 1));
    setIsDropdownOpen(false);
  };

  return (
    <div className={`rounded-lg border w-full h-full flex flex-col overflow-hidden ${
      isDarkTheme 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="p-4 flex-shrink-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-bold flex items-center gap-2 ${
            isDarkTheme ? 'text-white' : 'text-gray-800'
          }`}>
            <CalendarIcon size={20} className="text-primary" />
            Calendar
            <span className={`ml-2 badge badge-outline badge-lg ${
              isDarkTheme 
                ? 'text-gray-300 bg-gray-700 border-gray-600' 
                : 'text-base-content bg-base-100 border-base-300'
            }`}>{currentYear}</span>
          </h2>
          
          {/* Month Dropdown with Primary Color Hover */}
          <div className="dropdown dropdown-end" ref={dropdownRef}>
            <button
              className={`btn btn-ghost btn-sm gap-2 hover:bg-primary hover:text-primary-content ${
                isDarkTheme ? 'text-gray-300' : 'text-gray-700'
              }`}
              onClick={toggleDropdown}
            >
              <CalendarIcon size={16} className={`${
                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`${
                isDarkTheme ? 'text-gray-300' : 'text-gray-700'
              }`}>{monthNames[currentMonth]}</span>
              <div className="flex flex-col">
                <ChevronUp size={10} className={`${
                  isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <ChevronDown size={10} className={`${
                  isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
            </button>
            
            {isDropdownOpen && (
              <div 
                ref={scrollRef}
                className={`dropdown-content rounded-box z-[1] w-48 shadow-lg border overflow-y-auto scrollbar-thin ${
                  isDarkTheme 
                    ? 'bg-gray-800 border-gray-600 scrollbar-thumb-gray-600 scrollbar-track-gray-800' 
                    : 'bg-base-100 border-base-300 scrollbar-thumb-gray-300 scrollbar-track-gray-100'
                }`}
                style={{ 
                  height: 'calc(6 * 2.75rem)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: isDarkTheme ? '#4B5563 #1F2937' : '#D1D5DB #F3F4F6'
                }}
              >
                {monthNames.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => selectMonth(index)}
                    className={`w-full px-4 py-3 text-left transition-colors duration-200 border-b last:border-b-0 flex items-center hover:bg-primary hover:text-primary-content ${
                      index === currentMonth 
                        ? 'bg-primary text-primary-content' 
                        : isDarkTheme 
                          ? 'text-gray-300 border-gray-600' 
                          : 'text-gray-700 border-gray-200'
                    }`}
                    style={{ minHeight: '2.75rem' }}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className={`alert alert-warning mb-4 ${
            isDarkTheme 
              ? 'bg-yellow-900 border-yellow-700 text-yellow-100' 
              : ''
          }`}>
            <span>Using sample data: {error}</span>
          </div>
        )}
      </div>

      {/* Calendar Content */}
      <div className="flex-1 min-h-0 px-4 pb-4">
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          /* Calendar Grid */
          <div className={`border rounded-lg overflow-hidden h-full flex flex-col ${
            isDarkTheme ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <div className="grid grid-cols-7 flex-shrink-0">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={day} className={`p-2 text-center text-xs font-medium border-r last:border-r-0 h-8 ${
                  isDarkTheme 
                    ? 'text-gray-400 bg-gray-700 border-gray-600' 
                    : 'text-gray-600 bg-gray-50 border-gray-200'
                }`}>
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days grid */}
            <div className="grid grid-cols-7 flex-1">
              {renderCalendarDays()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 1)); // December 2024
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = sessionStorage.getItem("backend-token");
      if (!token) {
        setEvents(sampleEvents);
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8000/api/calendar/${currentYear}/${currentMonth + 1}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch calendar data");
      }
      
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
      setEvents(sampleEvents); // Fallback to sample data
    } finally {
      setLoading(false);
    }
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
        <div key={`empty-${i}`} className="h-14 border border-gray-200 bg-white"></div>
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day).filter(event => event.span === 1);
      const spannedEvent = spannedEventMap.get(day);
      
      days.push(
        <div 
          key={day} 
          className="h-14 border border-gray-200 p-1 relative cursor-pointer hover:bg-gray-50 transition-colors bg-white overflow-hidden"
          onClick={() => handleDayClick(day)}
        >
          <span className="text-xs font-medium text-gray-700">{day}</span>
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
              <div className="text-xs text-gray-500 mt-1">
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full h-full flex flex-col overflow-hidden">
      <div className="p-4 flex-shrink-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Calendar
          </h2>
          
          {/* Month Dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2 hover:bg-gray-100">
              <CalendarIcon size={16} className="text-gray-500" />
              <span className="text-gray-700">{monthNames[currentMonth]}</span>
              <div className="flex flex-col">
                <ChevronUp size={10} className="text-gray-500" />
                <ChevronDown size={10} className="text-gray-500" />
              </div>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow-lg border border-base-300">
              {monthNames.map((month, index) => (
                <li key={month}>
                  <a 
                    onClick={() => setCurrentDate(new Date(currentYear, index, 1))}
                    className={`${index === currentMonth ? 'active' : ''}`}
                  >
                    {month}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="alert alert-warning mb-4">
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
          <div className="border border-gray-200 rounded-lg overflow-hidden h-full flex flex-col">
            <div className="grid grid-cols-7 flex-shrink-0">
              {/* Day headers with numbers */}
              {['1', '2', '3', '4', '5', '6', '7'].map((day, index) => (
                <div key={day} className="p-2 text-center text-xs font-medium text-gray-600 bg-gray-50 border-r border-gray-200 last:border-r-0 h-8">
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
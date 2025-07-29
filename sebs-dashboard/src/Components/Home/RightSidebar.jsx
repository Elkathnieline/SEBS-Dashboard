import { useState, useEffect } from 'react';
import { Check, Clock, X, ChevronRight, Upload, Calendar as CalendarIcon, User } from 'lucide-react';

export default function RightSidebar() {
  const [bookingStats, setBookingStats] = useState({
    accepted: 28,
    pending: 12,
    declined: 3
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample meetings data with simplified details
  const sampleMeetings = [
    {
      id: 1,
      clientName: 'Client Name',
      time: '11:00',
      date: '2024-12-15'
    },
    {
      id: 2,
      clientName: 'Client Name',
      time: '13:00',
      date: '2024-12-15'
    }
  ];

  useEffect(() => {
    fetchBookingStats();
    fetchUpcomingMeetings();
  }, []);

  const fetchBookingStats = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("backend-token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/booking-stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch booking stats');
      
      const data = await response.json();
      setBookingStats(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching booking stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingMeetings = async () => {
    try {
      const token = sessionStorage.getItem("backend-token");
      if (!token) {
        setUpcomingMeetings(sampleMeetings);
        return;
      }

      const response = await fetch('http://localhost:8000/api/upcoming-meetings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch meetings');
      
      const data = await response.json();
      setUpcomingMeetings(data);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setUpcomingMeetings(sampleMeetings); // Fallback to sample data
    }
  };

  const handleViewAllBookings = () => {
    console.log('View All Bookings clicked - navigation not yet implemented');
    // Navigation will be implemented later
  };

  const handleMeetingClick = (meetingId) => {
    console.log('Meeting clicked:', meetingId, '- navigation not yet implemented');
    // Navigation will be implemented later
  };

  const handleGalleryUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.png,.jpg,.jpeg';
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      
      console.log('Files selected for upload:', files.map(f => f.name));
      // File upload logic will be implemented later
    };
    
    input.click();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Bookings Section */}
      <div className="card bg-base-100 shadow-lg rounded-2xl">
        <div className="card-body p-6">
          <h2 className="card-title text-xl font-bold text-base-content mb-4">
            Bookings
          </h2>
          
          {loading && (
            <div className="flex justify-center items-center py-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}

          {!loading && (
            <div className="space-y-3">
              {/* Accepted */}
              <div className="flex items-center justify-between p-4 bg-base-50 rounded-xl border border-base-200 hover:bg-base-100 transition-colors">
                <div>
                  <h3 className="font-semibold text-base-content">Accepted</h3>
                  <p className="text-sm text-base-content/60">{bookingStats.accepted} Clients</p>
                </div>
                <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                  <Check size={20} className="text-success-content" />
                </div>
              </div>

              {/* Pending */}
              <div className="flex items-center justify-between p-4 bg-base-50 rounded-xl border border-base-200 hover:bg-base-100 transition-colors">
                <div>
                  <h3 className="font-semibold text-base-content">Pending</h3>
                  <p className="text-sm text-base-content/60">{bookingStats.pending} Clients</p>
                </div>
                <div className="w-12 h-12 bg-info/20 rounded-full flex items-center justify-center border-2 border-info/30">
                  <Clock size={20} className="text-info" />
                </div>
              </div>

              {/* Declined */}
              <div className="flex items-center justify-between p-4 bg-base-50 rounded-xl border border-base-200 hover:bg-base-100 transition-colors">
                <div>
                  <h3 className="font-semibold text-base-content">Declined</h3>
                  <p className="text-sm text-base-content/60">{bookingStats.declined} Clients</p>
                </div>
                <div className="w-12 h-12 bg-error rounded-full flex items-center justify-center">
                  <X size={20} className="text-error-content" />
                </div>
              </div>

              {/* View All Bookings Button */}
              <button 
                onClick={handleViewAllBookings}
                className="btn btn-primary w-full mt-4 gap-2"
              >
                View All Bookings
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Meetings Section */}
      <div className="card bg-base-100 shadow-lg rounded-2xl">
        <div className="card-body p-6">
          <h2 className="card-title text-xl font-bold text-base-content mb-4">
            Upcoming Meetings
          </h2>
          
          <div className="space-y-3">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <div 
                  key={meeting.id}
                  onClick={() => handleMeetingClick(meeting.id)}
                  className="p-4 bg-base-50 rounded-xl border border-base-200 cursor-pointer hover:bg-base-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-base-content/60" />
                        <h3 className="font-semibold text-base-content">{meeting.clientName}</h3>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon size={16} className="text-base-content/60" />
                        <p className="text-lg font-bold text-base-content">{meeting.time}</p>
                      </div>
                      <p className="text-sm text-base-content/60">{formatDate(meeting.date)}</p>
                    </div>
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <ChevronRight size={16} className="text-primary-content" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-base-content/60">
                <CalendarIcon size={32} className="mx-auto mb-2 text-base-content/40" />
                <p>No upcoming meetings</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Upload Section */}
      <div className="card bg-base-100 shadow-lg rounded-2xl">
        <div className="card-body p-6">
          <h2 className="card-title text-xl font-bold text-base-content mb-4">
            Gallery Upload
          </h2>
          
          <button 
            onClick={handleGalleryUpload}
            className="btn btn-primary w-full gap-2"
          >
            <Upload size={20} />
            Upload Images
          </button>
          
          <p className="text-xs text-base-content/60 mt-2 text-center">
            Supports PNG and JPG files
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-warning shadow-lg">
          <span>Using sample data: {error}</span>
        </div>
      )}
    </div>
  );
}
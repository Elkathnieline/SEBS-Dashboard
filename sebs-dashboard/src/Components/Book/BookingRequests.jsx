import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Package, Edit, Loader2, RefreshCw } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import BookingPreview from './BookingPreview.jsx';
import { 
  fetchBookingRequests, 
  updateBookingStatus, 
  transformBookingData, 
  enumMapper 
} from '../../Services/BookingService.js';

export default function BookingRequests() {
  const { isDarkTheme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enumsLoaded, setEnumsLoaded] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      initializeData();
      hasInitialized.current = true;
    }
  }, []);

  const initializeData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load enums first
      const controller = new AbortController();
      const enumsSuccess = await enumMapper.loadEnums(controller.signal);
      
      if (!enumsSuccess) {
        throw new Error('Failed to load enum data');
      }
      
      setEnumsLoaded(true);
      
      // Then load bookings
      await fetchBookings(controller.signal);
      
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Failed to initialize booking data");
        console.error("Initialization error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async (signal) => {
    try {
      const data = await fetchBookingRequests(signal);
      const transformedData = transformBookingData(data);
      setBookings(transformedData);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Failed to load booking requests");
        console.error("Fetch error:", err);
      }
    }
  };

  const handleRefresh = () => {
    const controller = new AbortController();
    setError(null);
    fetchBookings(controller.signal);
  };

  const handleStatusUpdate = (bookingId, newStatus) => {
    const bookingToUpdate = bookings.find(b => b.id === bookingId);
    
    // Optimistic update
    if (newStatus === 'cancelled') {
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      window.dispatchEvent(new CustomEvent('bookingDeclined', { 
        detail: { bookingId, booking: bookingToUpdate }
      }));
    } else {
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
    }

    // Close modal
    setIsModalOpen(false);
    setSelectedBooking(null);

    // API call - convert status name to enum value
    const statusValue = enumMapper.getStatusValue(newStatus);
    if (statusValue === null) {
      console.error('Unknown status:', newStatus);
      return;
    }

    const controller = new AbortController();
    updateBookingStatus(bookingId, statusValue, controller.signal)
      .catch((err) => {
        // Revert optimistic update on failure
        if (newStatus === 'cancelled') {
          setBookings(prev => [...prev, bookingToUpdate]);
        } else {
          setBookings(prev => prev.map(booking => 
            booking.id === bookingId 
              ? bookingToUpdate
              : booking
          ));
        }
        console.error("Status update failed:", err);
        setError("Failed to update booking status");
      });
  };

  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const getStatusBadge = (status, statusDisplay) => {
    const statusConfig = {
      awaitingconfirmation: { class: 'badge-warning', text: statusDisplay || 'Awaiting Confirmation' },
      confirmed: { class: 'badge-success', text: statusDisplay || 'Confirmed' },
      cancelled: { class: 'badge-error', text: statusDisplay || 'Cancelled' },
      completed: { class: 'badge-info', text: statusDisplay || 'Completed' },
      noshow: { class: 'badge-error', text: statusDisplay || 'No Show' }
    };
    
    const config = statusConfig[status.toLowerCase()] || { 
      class: 'badge-ghost', 
      text: statusDisplay || status 
    };
    
    return (
      <div className={`badge ${config.class}`}>
        {config.text}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span>Loading booking requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button className="btn btn-sm" onClick={initializeData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${
          isDarkTheme ? 'text-white' : 'text-base-content'
        }`}>
          Booking Requests
        </h2>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {bookings
          .filter(booking => booking.status !== 'cancelled')
          .map((booking) => (
          <div key={booking.id} className={`card shadow-lg ${
            isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
          }`}>
            <div className="card-body p-4">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-start lg:items-center">
                <div className="lg:col-span-2 flex items-center gap-3">
                  <div className="avatar placeholder flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full ${
                      isDarkTheme ? 'bg-gray-700' : 'bg-primary text-primary-content'
                    }`}>
                      <span className="text-lg">{booking.client.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-semibold text-sm lg:text-base truncate ${
                      isDarkTheme ? 'text-white' : 'text-base-content'
                    }`}>
                      {booking.client.name}
                    </h3>
                    <p className={`text-xs lg:text-sm truncate ${
                      isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                    }`}>
                      {booking.client.email}
                    </p>
                    <p className={`text-xs lg:text-sm ${
                      isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                    }`}>
                      {booking.client.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <Calendar size={16} className="text-secondary flex-shrink-0" />
                  <span className={`text-xs lg:text-sm truncate ${
                    isDarkTheme ? 'text-gray-300' : 'text-base-content'
                  }`}>
                    {booking.dateTime}
                  </span>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <MapPin size={16} className="text-secondary flex-shrink-0" />
                  <span className={`text-xs lg:text-sm truncate ${
                    isDarkTheme ? 'text-gray-300' : 'text-base-content'
                  }`}>
                    {booking.address}
                  </span>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <Package size={16} className="text-secondary flex-shrink-0" />
                  <div className={`text-xs lg:text-sm ${
                    isDarkTheme ? 'text-gray-300' : 'text-base-content'
                  }`}>
                    <div className="truncate">{booking.package.name}</div>
                    <div className="text-[10px] text-base-content/60">{booking.package.duration}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0">
                  <div className="flex-shrink-0">
                    {getStatusBadge(booking.status, booking.statusDisplay)}
                  </div>
                  <button
                    onClick={() => handleEditBooking(booking)}
                    className="btn btn-sm btn-outline flex-shrink-0"
                    title="Edit booking"
                  >
                    <Edit size={14} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bookings.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-base-content/60">No booking requests found</p>
        </div>
      )}

      <BookingPreview
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Package, XCircle, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import { bookingService } from '../../Services/BookingService.js';
import { enumMapper } from '../../Utils/EnumMapper.js';
import { transformBookingData } from '../../Utils/BookingTransformer.js';

export default function DeclinedBookings() {
  const { isDarkTheme } = useTheme();
  const [declinedBookings, setDeclinedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enumsLoaded, setEnumsLoaded] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      initializeData();
      hasInitialized.current = true;
    }
    
    // Listen for declined bookings from BookingRequests
    const handleBookingDeclined = (event) => {
      const { booking } = event.detail;
      setDeclinedBookings(prev => [
        ...prev,
        { ...booking, status: 'declined', declinedAt: new Date().toISOString() }
      ]);
    };

    window.addEventListener('bookingDeclined', handleBookingDeclined);
    
    return () => {
      window.removeEventListener('bookingDeclined', handleBookingDeclined);
    };
  }, []);

  const initializeData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load enums first
      const enumsSuccess = await enumMapper.loadEnums(bookingService);
      
      if (!enumsSuccess) {
        throw new Error('Failed to load enum data');
      }
      
      setEnumsLoaded(true);
      
      // Then load declined bookings
      await fetchDeclinedBookings();
      
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Failed to initialize declined booking data");
        console.error("Initialization error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDeclinedBookings = async () => {
    try {
      const data = await bookingService.fetchDeclinedBookings();
      const transformedData = transformBookingData(data);
      setDeclinedBookings(transformedData);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Failed to load declined bookings");
        console.error("Fetch error:", err);
      }
    }
  };

  const handleRefresh = () => {
    setError(null);
    fetchDeclinedBookings();
  };

  const handleDeleteDeclined = async (bookingId) => {
    if (window.confirm('Are you sure you want to permanently delete this declined booking?')) {
      // Optimistic update
      setDeclinedBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      try {
        await bookingService.deleteBooking(bookingId);
        console.log('Declined booking deleted');
      } catch (error) {
        console.error('Error deleting booking:', error);
        // Revert the optimistic update on failure
        fetchDeclinedBookings();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin mr-2" size={20} />
        <span>Loading declined bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className={`alert alert-error ${
          isDarkTheme ? 'bg-red-900 border-red-700 text-red-100' : ''
        }`}>
          <XCircle size={20} />
          <span>{error}</span>
          <button className="btn btn-sm btn-outline" onClick={initializeData}>
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${
          isDarkTheme ? 'text-white' : 'text-base-content'
        }`}>
          Declined Bookings
        </h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {declinedBookings.length === 0 ? (
        <div className={`text-center py-12 ${
          isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
        }`}>
          <XCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No declined bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {declinedBookings.map((booking) => (
            <div
              key={booking.id}
              className={`card shadow-lg ${
                isDarkTheme
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-base-100'
              }`}
            >
              <div className="card-body p-4">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-start lg:items-center">
                  <div className="lg:col-span-2 flex items-center gap-3">
                    <div className="avatar placeholder flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full bg-error text-error-content`}>
                        <span className="text-lg">
                          {booking.client.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-semibold text-sm lg:text-base break-words ${
                        isDarkTheme ? 'text-white' : 'text-base-content'
                      }`}>
                        {booking.client.name}
                      </h3>
                      <p className={`text-xs lg:text-sm break-words ${
                        isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                      }`}>
                        {booking.client.email}
                      </p>
                      <p className={`text-xs lg:text-sm break-words ${
                        isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                      }`}>
                        {booking.client.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 min-w-0">
                    <Calendar size={16} className="text-secondary flex-shrink-0 mt-1" />
                    <span className={`text-xs lg:text-sm break-words ${
                      isDarkTheme ? 'text-gray-300' : 'text-base-content'
                    }`}>
                      {booking.dateTime}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin size={16} className="text-secondary flex-shrink-0 mt-1" />
                    <span className={`text-xs lg:text-sm break-words ${
                      isDarkTheme ? 'text-gray-300' : 'text-base-content'
                    }`}>
                      {booking.address}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 min-w-0">
                    <Package size={16} className="text-secondary flex-shrink-0 mt-1" />
                    <div className={`text-xs lg:text-sm ${
                      isDarkTheme ? 'text-gray-300' : 'text-base-content'
                    }`}>
                      <div className="break-words leading-tight max-w-full overflow-wrap-anywhere">
                        {booking.package.name}
                      </div>
                      <div className="text-[10px] text-base-content/60 mt-1 break-words max-w-full overflow-wrap-anywhere">
                        {booking.package.duration}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0">
                    <div className="badge badge-error">Declined</div>
                    <button
                      onClick={() => handleDeleteDeclined(booking.id)}
                      className="btn btn-sm btn-error btn-outline flex-shrink-0"
                      title="Delete permanently"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Additional Info Row */}
                {booking.reference && (
                  <div className="mt-3 pt-3 border-t border-base-300">
                    <div className="flex flex-wrap gap-4 text-xs">
                      <span className={`${
                        isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                      }`}>
                        Reference: <span className="font-mono">{booking.reference}</span>
                      </span>
                      {booking.bookingDate && (
                        <span className={`${
                          isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                        }`}>
                          Booked: {booking.bookingDate}
                        </span>
                      )}
                      {booking.declinedAt && (
                        <span className={`${
                          isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                        }`}>
                          Declined: {new Date(booking.declinedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Package, XCircle, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import { 
  fetchBookingRequests, 
  transformBookingData, 
  enumMapper 
} from '../../Services/BookingService.js';

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
      const controller = new AbortController();
      const enumsSuccess = await enumMapper.loadEnums(controller.signal);
      
      if (!enumsSuccess) {
        throw new Error('Failed to load enum data');
      }
      
      setEnumsLoaded(true);
      
      // Then load declined bookings
      await fetchDeclinedBookings(controller.signal);
      
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Failed to initialize declined booking data");
        console.error("Initialization error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDeclinedBookings = (signal) => {
    const token = sessionStorage.getItem("backend-token");
    const API_BASE = import.meta.env.VITE_DEV_API_URL || import.meta.env.VITE_API_URL;
    
    return fetch(`${API_BASE}/api/admin/booking?status=3`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      signal,
    })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch declined bookings");
      return res.json();
    })
    .then(data => {
      const transformedData = transformBookingData(data);
      setDeclinedBookings(transformedData);
    })
    .catch(err => {
      if (err.name !== "AbortError") {
        setError("Failed to load declined bookings");
        console.error("Fetch error:", err);
      }
    });
  };

  const handleRefresh = () => {
    const controller = new AbortController();
    setError(null);
    fetchDeclinedBookings(controller.signal);
  };

  const handleDeleteDeclined = (bookingId) => {
    if (window.confirm('Are you sure you want to permanently delete this declined booking?')) {
      setDeclinedBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      const token = sessionStorage.getItem("backend-token");
      const API_BASE = import.meta.env.VITE_DEV_API_URL || import.meta.env.VITE_API_URL;
      
      // API call to delete
      fetch(`${API_BASE}/api/admin/booking/${bookingId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete booking');
        }
        console.log('Declined booking deleted');
      })
      .catch(error => {
        console.error('Error deleting booking:', error);
        // Revert the optimistic update on failure
        const controller = new AbortController();
        fetchDeclinedBookings(controller.signal);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span>Loading declined bookings...</span>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDarkTheme ? 'bg-red-600' : 'bg-error'
          }`}>
            <XCircle size={20} className="text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${
              isDarkTheme ? 'text-white' : 'text-base-content'
            }`}>
              Declined Bookings
            </h2>
            <p className={`text-sm ${
              isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
            }`}>
              Total declined: {declinedBookings.length}
            </p>
          </div>
        </div>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {declinedBookings.length === 0 ? (
        <div className={`text-center py-12 ${
          isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
        }`}>
          <XCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No declined bookings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {declinedBookings.map((booking) => (
            <div key={booking.id} className={`card shadow-lg border-l-4 border-l-error ${
              isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-base-100'
            }`}>
              <div className="card-body p-4">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-start lg:items-center">
                  {/* Client Info */}
                  <div className="lg:col-span-2 flex items-center gap-3">
                    <div className="avatar placeholder flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-error text-error-content">
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

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar size={16} className="text-error flex-shrink-0" />
                    <span className={`text-xs lg:text-sm truncate ${
                      isDarkTheme ? 'text-gray-300' : 'text-base-content'
                    }`}>
                      {booking.dateTime}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin size={16} className="text-error flex-shrink-0" />
                    <span className={`text-xs lg:text-sm truncate ${
                      isDarkTheme ? 'text-gray-300' : 'text-base-content'
                    }`}>
                      {booking.address}
                    </span>
                  </div>

                  {/* Package */}
                  <div className="flex items-center gap-2 min-w-0">
                    <Package size={16} className="text-error flex-shrink-0" />
                    <div className={`text-xs lg:text-sm ${
                      isDarkTheme ? 'text-gray-300' : 'text-base-content'
                    }`}>
                      <div className="truncate">{booking.package.name}</div>
                      <div className="text-[10px] text-base-content/60">{booking.package.duration}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0">
                    <div className="flex-shrink-0">
                      <div className="badge badge-error">
                        {booking.statusDisplay || 'Declined'}
                      </div>
                    </div>
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
                      <span className={`${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                        Reference: <span className="font-mono">{booking.reference}</span>
                      </span>
                      {booking.bookingDate && (
                        <span className={`${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                          Booked: {booking.bookingDate}
                        </span>
                      )}
                      {booking.package.totalPrice > 0 && (
                        <span className={`${isDarkTheme ? 'text-gray-400' : 'text-base-content/60'}`}>
                          Value: ${booking.package.totalPrice}
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
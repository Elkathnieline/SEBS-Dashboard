import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Package, RefreshCw, Loader2, ChevronDown, Filter, X, Check } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import { bookingService } from '../../Services/BookingService.js';
import { enumMapper } from '../../Utils/EnumMapper.js';
import { transformBookingData } from '../../Utils/BookingTransformer.js';

export default function ProcessedBookings() {
  const { isDarkTheme } = useTheme();
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enumsLoaded, setEnumsLoaded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All Processed');
  const hasInitialized = useRef(false);

  const statusOptions = [
    { value: 'All Processed', label: 'All Processed', color: 'btn-primary' },
    { value: 'Confirmed', label: 'Confirmed', color: 'btn-success' },
    { value: 'Declined', label: 'Declined', color: 'btn-error' },
    { value: 'Cancelled', label: 'Cancelled', color: 'btn-warning' }
  ];

  useEffect(() => {
    if (!hasInitialized.current) {
      initializeData();
      hasInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    // Filter bookings when status changes
    filterBookings();
  }, [allBookings, selectedStatus]);

  const initializeData = () => {
    setLoading(true);
    setError(null);
    
    // Load enums first
    enumMapper.loadEnums(bookingService)
      .then((enumsSuccess) => {
        if (!enumsSuccess) {
          throw new Error('Failed to load enum data');
        }
        setEnumsLoaded(true);
        return fetchProcessedBookings();
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to initialize processed booking data");
          console.error("Initialization error:", err);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchProcessedBookings = () => {
    return bookingService.fetchBookingRequests()
      .then((data) => {
        // Filter out pending bookings (status 1) - only show processed ones
        const processedData = data.filter((booking) => booking.status !== 1);
        const transformedData = transformBookingData(processedData);
        
        // Sort by date (newest first)
        const sortedData = transformedData.sort((a, b) => {
          const dateA = new Date(a.originalData.eventDetails?.eventDate || a.originalData.bookingDate || 0);
          const dateB = new Date(b.originalData.eventDetails?.eventDate || b.originalData.bookingDate || 0);
          return dateB - dateA; // Descending order (newest first)
        });
        
        setAllBookings(sortedData);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load processed bookings");
          console.error("Fetch error:", err);
        }
      });
  };

  const filterBookings = () => {
    if (selectedStatus === 'All Processed') {
      setFilteredBookings(allBookings);
    } else {
      const filtered = allBookings.filter(booking => 
        booking.statusDisplay === selectedStatus
      );
      setFilteredBookings(filtered);
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handleRefresh = () => {
    setError(null);
    fetchProcessedBookings();
  };

  const handleStatusUpdate = (bookingId, newStatus) => {
    // Show warning for canceling confirmed bookings
    if (newStatus === 'Canceled' && allBookings.find(b => b.id === bookingId)?.statusDisplay === 'Confirmed') {
      if (!window.confirm('Warning: This booking is already approved. Canceling it will move it to cancelled bookings. Are you sure you want to proceed?')) {
        return;
      }
    }

    // Get numeric status value from enum mapper
    let numericStatus;
    if (newStatus === 'Canceled') {
      numericStatus = 4; // Cancelled status
    } else {
      numericStatus = enumMapper.getStatusValue(newStatus) || 4;
    }

    // Optimistic update
    setAllBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, statusDisplay: newStatus }
          : booking
      )
    );

    // Real API call
    bookingService.updateBookingStatus(bookingId, numericStatus)
      .then((response) => {
        console.log('Status update successful:', response);
        // Refresh to get latest data
        fetchProcessedBookings();
      })
      .catch((err) => {
        console.error('Status update failed:', err);
        // Revert optimistic update on failure
        fetchProcessedBookings();
        setError('Failed to update booking status');
      });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Confirmed: { class: "badge-success", text: "Confirmed" },
      Declined: { class: "badge-error", text: "Declined" },
      Cancelled: { class: "badge-warning", text: "Cancelled" },
    };

    const config = statusConfig[status] || { class: "badge-ghost", text: status };
    return <div className={`badge ${config.class}`}>{config.text}</div>;
  };

  const getCurrentStatusOption = () => {
    return statusOptions.find(option => option.value === selectedStatus) || statusOptions[0];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin mr-2" size={20} />
        <span>Loading processed bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className={`alert alert-error ${
          isDarkTheme ? 'bg-red-900 border-red-700 text-red-100' : ''
        }`}>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className={`text-2xl font-bold ${
          isDarkTheme ? 'text-white' : 'text-base-content'
        }`}>
          Processed Bookings
        </h2>
        
        <div className="flex items-center gap-3">
          {/* Status Filter Dropdown */}
          <div className="dropdown dropdown-end">
            <div 
              tabIndex={0} 
              role="button" 
              className={`btn ${getCurrentStatusOption().color} btn-sm gap-2`}
            >
              <Filter size={16} />
              {selectedStatus}
              <ChevronDown size={16} />
            </div>
            <ul tabIndex={0} className={`dropdown-content menu rounded-box z-[1] w-52 p-2 shadow ${
              isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
            }`}>
              {statusOptions.map((option) => (
                <li key={option.value}>
                  <a 
                    onClick={() => handleStatusChange(option.value)}
                    className={selectedStatus === option.value ? 'active' : ''}
                  >
                    <span className={`badge ${option.color.replace('btn-', 'badge-')} badge-sm mr-2`}></span>
                    {option.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Refresh Button */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className={`text-sm ${
        isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
      }`}>
        Showing {filteredBookings.length} of {allBookings.length} processed bookings
        {selectedStatus !== 'All Processed' && ` (${selectedStatus})`}
        {allBookings.length > 0 && ' • Sorted by date (newest first)'}
      </div>

      {filteredBookings.length === 0 ? (
        <div className={`text-center py-12 ${
          isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
        }`}>
          <Filter size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">
            {selectedStatus === 'All Processed' 
              ? 'No processed bookings found' 
              : `No ${selectedStatus.toLowerCase()} bookings found`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
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
                      <div className={`w-12 h-12 rounded-full ${
                        booking.statusDisplay === 'Confirmed' ? 'bg-success text-success-content' :
                        booking.statusDisplay === 'Declined' ? 'bg-error text-error-content' :
                        'bg-warning text-warning-content'
                      }`}>
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

                  <div className="flex items-center justify-end gap-3">
                    {getStatusBadge(booking.statusDisplay)}
                    
                    {/* Actions for confirmed bookings */}
                    {booking.statusDisplay === 'Confirmed' && (
                      <div className="flex items-center gap-2">
                      
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'Canceled')}
                          className="btn btn-error btn-xs"
                          title="Cancel booking"
                        >
                          <X size={12} />
                          Cancel
                        </button>
                      </div>
                    )}
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
                      {booking.approvedDate && (
                        <span className={`${
                          isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                        }`}>
                          Processed: {booking.approvedDate}
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
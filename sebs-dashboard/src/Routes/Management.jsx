import { useState, useEffect, useCallback } from 'react';
import { Settings, AlertCircle } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import BookingRequests from '../Components/Book/BookingRequests.jsx';
import ProcessedBookings from '../Components/Book/ProcessedBookings.jsx';
import { useLoaderData, useFetcher, redirect } from 'react-router-dom';
import { bookingService } from '../Services/BookingService.js';
import { enumMapper } from '../Utils/EnumMapper.js';
import { transformBookingData } from '../Utils/BookingTransformer.js';

// Loader: fetch all bookings and enums
export async function loader() {
  await enumMapper.loadEnums(bookingService);
  const allBookings = await bookingService.fetchBookingRequests();
  const transformed = transformBookingData(allBookings);
  return { bookings: transformed };
}

// Action: update booking status
export async function action({ request }) {
  const formData = await request.formData();
  const bookingId = parseInt(formData.get('bookingId'), 10);
  const statusValue = formData.get('status');
  
  // Convert to number if it's a string
  const numericStatus = typeof statusValue === 'string' ? parseInt(statusValue, 10) : statusValue;
  
  console.log('Action received:', { bookingId, statusValue, numericStatus });
  
  if (!bookingId || !numericStatus) {
    return { success: false, error: 'Invalid booking ID or status' };
  }
  
  try {
    const result = await bookingService.updateBookingStatus(bookingId, numericStatus);
    console.log('Status update successful:', result);
    return { success: true, data: result };
  } catch (err) {
    console.error('Action error:', err);
    return { success: false, error: err.message };
  }
}

export default function Management() {
  const { isDarkTheme } = useTheme();
  const { bookings } = useLoaderData();
  const fetcher = useFetcher();
  // Error and pending state can be handled via fetcher
  const [bookingError, setBookingError] = useState(null);
  const [declineError, setDeclineError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force refresh when BookingRequests changes
  const handleBookingRequestsChange = useCallback(() => {
    console.log('Management: Received booking requests change event');
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Listen for custom events from BookingRequests
    const handleBookingUpdate = () => handleBookingRequestsChange();
    const handleBookingStatusChange = () => handleBookingRequestsChange();
    const handleBookingRefresh = () => handleBookingRequestsChange();

    window.addEventListener('bookingUpdated', handleBookingUpdate);
    window.addEventListener('bookingStatusChanged', handleBookingStatusChange);
    window.addEventListener('bookingRequestsRefreshed', handleBookingRefresh);

    return () => {
      window.removeEventListener('bookingUpdated', handleBookingUpdate);
      window.removeEventListener('bookingStatusChanged', handleBookingStatusChange);
      window.removeEventListener('bookingRequestsRefreshed', handleBookingRefresh);
    };
  }, [handleBookingRequestsChange]);

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-full mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkTheme ? 'bg-blue-600' : 'bg-primary'
          }`}>
            <Settings size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className={`text-2xl lg:text-3xl font-bold ${
              isDarkTheme ? 'text-white' : 'text-base-content'
            }`}>
              Management
            </h1>
            <p className={`text-sm lg:text-base ${
              isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
            }`}>
              Manage bookings and business operations
            </p>
          </div>
        </div>

        {/* Booking Requests Section */}
        <div className="space-y-6">
          {bookingError && (
            <div className={`alert alert-error flex items-center gap-2 ${isDarkTheme ? 'bg-red-900 border-red-700 text-red-100' : ''}`}>
              <AlertCircle size={20} className="mr-2" />
              <span className="flex-1">{bookingError}</span>
              <button
                className="btn btn-xs btn-circle btn-ghost"
                onClick={() => setBookingError(null)}
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}
          <BookingRequests 
            bookings={bookings.filter(b => b.status === "awaiting confirmation" || b.status === "pending")}
            fetcher={fetcher}
            isDarkTheme={isDarkTheme}
          />
        </div>

        {/* Declined Bookings Section */}
        <div className="space-y-6">
          {declineError && (
            <div className={`alert alert-error flex items-center gap-2 ${isDarkTheme ? 'bg-red-900 border-red-700 text-red-100' : ''}`}>
              <AlertCircle size={20} className="mr-2" />
              <span className="flex-1">{declineError}</span>
              <button
                className="btn btn-xs btn-circle btn-ghost"
                onClick={() => setDeclineError(null)}
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}
          <ProcessedBookings 
            bookings={bookings.filter(b => b.status !== "awaiting confirmation" && b.status !== "pending")}
            fetcher={fetcher}
            isDarkTheme={isDarkTheme}
          />
        </div>
      </div>
    </div>
  );
}
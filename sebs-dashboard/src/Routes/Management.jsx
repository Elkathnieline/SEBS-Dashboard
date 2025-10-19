import { useState } from 'react';
import { Settings, AlertCircle } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import BookingRequests from '../Components/Book/BookingRequests.jsx';
import ProcessedBookings from '../Components/Book/ProcessedBookings.jsx';

export default function Management() {
  const { isDarkTheme } = useTheme();
  const [bookingError, setBookingError] = useState(null);
  const [declineError, setDeclineError] = useState(null);

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
          <BookingRequests setError={setBookingError} />
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
          <ProcessedBookings setError={setDeclineError} />
        </div>
      </div>
    </div>
  );
}
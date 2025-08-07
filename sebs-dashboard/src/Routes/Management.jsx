import { useState } from 'react';
import { Settings } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import BookingRequests from '../Components/Book/BookingRequests.jsx';
import DeclinedBookings from '../Components/Book/DeclinedBookings.jsx';

export default function Management() {
  const { isDarkTheme } = useTheme();

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkTheme ? 'bg-blue-600' : 'bg-primary'
          }`}>
            <Settings size={24} className="text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${
              isDarkTheme ? 'text-white' : 'text-base-content'
            }`}>
              Management
            </h1>
            <p className={`${
              isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
            }`}>
              Manage bookings and business operations
            </p>
          </div>
        </div>

        {/* Booking Requests Section */}
        <BookingRequests />

        {/* Declined Bookings Section */}
        <DeclinedBookings />
      </div>
    </div>
  );
}
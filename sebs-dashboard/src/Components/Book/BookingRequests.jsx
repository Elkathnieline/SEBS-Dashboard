import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Package, Edit } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import BookingPreview from './BookingPreview.jsx';

export default function BookingRequests() {
  const { isDarkTheme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    console.log('BookingRequests useEffect triggered');
    if (!hasInitialized.current) {
      console.log('First time initialization');
      fetchBookings();
      hasInitialized.current = true;
    } else {
      console.log('Preventing re-fetch - component already initialized');
    }
  }, []);

  // Add debugging for component re-renders
  useEffect(() => {
    console.log('BookingRequests re-rendered');
  });

  const fetchBookings = () => {
    console.log('fetchBookings called');
    setLoading(true);
    setTimeout(() => {
      const mockBookings = [
        {
          id: 1,
          client: {
            name: "Gab Cruz",
            email: "sdhwhfud@gmail.com",
            phone: "212345678"
          },
          dateTime: "2:00 PM, Tue, 13 Nov",
          address: "AGsdgadsdg",
          package: {
            name: "Package A",
            duration: "1 hour"
          },
          status: "confirmed"
        },
        {
          id: 2,
          client: {
            name: "Jeremhie",
            email: "sdhwhfud@gmail.com",
            phone: "212345678"
          },
          dateTime: "4:00 PM, Tue, 12 Nov",
          address: "wdgjwedfef",
          package: {
            name: "Package B",
            duration: "3 hours"
          },
          status: "pending"
        },
        {
          id: 3,
          client: {
            name: "Jomar",
            email: "sdhwhfud@gmail.com",
            phone: "212345678"
          },
          dateTime: "3:00 PM, Tue, 11 Nov",
          address: "sfdfd",
          package: {
            name: "Package D",
            duration: "4 hours"
          },
          status: "confirmed"
        },
        {
          id: 4,
          client: {
            name: "Faith",
            email: "sdhwhfud@gmail.com",
            phone: "212345678"
          },
          dateTime: "1:00 PM, Tue, 10 Nov",
          address: "dsfddf",
          package: {
            name: "Package A",
            duration: "2 hours"
          },
          status: "confirmed"
        }
      ];
      console.log('Setting mock bookings:', mockBookings);
      setBookings(mockBookings);
      setLoading(false);
    }, 1000);
  };

  const handleStatusUpdate = (bookingId, newStatus) => {
    console.log('handleStatusUpdate called:', { bookingId, newStatus });
    
    const bookingToUpdate = bookings.find(b => b.id === bookingId);
    console.log('Booking to update:', bookingToUpdate);
    
    if (newStatus === 'canceled') {
      setBookings(prev => {
        const updated = prev.filter(booking => booking.id !== bookingId);
        console.log('After decline filter:', updated);
        return updated;
      });
      
      window.dispatchEvent(new CustomEvent('bookingDeclined', { 
        detail: { bookingId, booking: bookingToUpdate }
      }));
    } else if (newStatus === 'confirmed') {
      setBookings(prev => {
        const updated = prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'confirmed' }
            : booking
        );
        console.log('After approval update:', updated);
        return updated;
      });
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

    // Simulate API call without affecting state
    console.log('Simulating API call for booking:', bookingId, 'status:', newStatus);
  };

  const handleEditBooking = (booking) => {
    console.log('Opening modal for:', booking);
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { class: 'badge-success', text: 'Confirmed' },
      pending: { class: 'badge-warning', text: 'Pending' },
      canceled: { class: 'badge-error', text: 'Canceled' }
    };
    
    const config = statusConfig[status] || { class: 'badge-ghost', text: status };
    
    return (
      <div className={`badge ${config.class}`}>
        {config.text}
      </div>
    );
  };

  console.log('Current bookings state:', bookings);
  console.log('Loading state:', loading);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${
        isDarkTheme ? 'text-white' : 'text-base-content'
      }`}>
        Booking Requests
      </h2>

      <div className="space-y-4">
        {bookings
          .filter(booking => booking.status !== 'canceled')
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
                  <span className={`text-xs lg:text-sm truncate ${
                    isDarkTheme ? 'text-gray-300' : 'text-base-content'
                  }`}>
                    {booking.package.name} - {booking.package.duration}
                  </span>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0">
                  <div className="flex-shrink-0">
                    {getStatusBadge(booking.status)}
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

      <BookingPreview
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
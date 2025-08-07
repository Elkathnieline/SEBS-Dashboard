import { useState, useEffect } from 'react';
import { Calendar, MapPin, Package, Edit } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import BookingPreview from './BookingPreview.jsx';

export default function BookingRequests() {
  const { isDarkTheme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
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
      setBookings(mockBookings);
      setLoading(false);
    }, 1000);
  };

  const handleStatusUpdate = (bookingId, newStatus) => {
    const bookingToUpdate = bookings.find(b => b.id === bookingId);
    
    if (newStatus === 'canceled') {
      // Remove from main list when declined
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      // Dispatch custom event for declined bookings counter
      window.dispatchEvent(new CustomEvent('bookingDeclined', { 
        detail: { bookingId, booking: bookingToUpdate }
      }));
    } else {
      // Update status for approved bookings
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
    }

    // API call
    fetch(`/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: newStatus })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      return response.json();
    })
    .then(data => {
      console.log('Booking status updated:', data);
    })
    .catch(error => {
      console.error('Error updating status:', error);
      // Only refetch if there was an error, otherwise the optimistic update should work
      if (newStatus !== 'canceled') {
        fetchBookings();
      }
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

      {/* Booking Cards - Filter out canceled bookings */}
      <div className="space-y-4">
        {bookings
          .filter(booking => booking.status !== 'canceled')
          .map((booking) => (
          <div key={booking.id} className={`card shadow-lg ${
            isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
          }`}>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                {/* Client Info */}
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className={`w-12 h-12 rounded-full ${
                      isDarkTheme ? 'bg-gray-700' : 'bg-primary text-primary-content'
                    }`}>
                      <span className="text-lg">{booking.client.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      isDarkTheme ? 'text-white' : 'text-base-content'
                    }`}>
                      {booking.client.name}
                    </h3>
                    <p className={`text-sm ${
                      isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                    }`}>
                      {booking.client.email}
                    </p>
                    <p className={`text-sm ${
                      isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                    }`}>
                      {booking.client.phone}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-secondary" />
                  <span className={`text-sm ${
                    isDarkTheme ? 'text-gray-300' : 'text-base-content'
                  }`}>
                    {booking.dateTime}
                  </span>
                </div>

                {/* Address */}
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-secondary" />
                  <span className={`text-sm ${
                    isDarkTheme ? 'text-gray-300' : 'text-base-content'
                  }`}>
                    {booking.address}
                  </span>
                </div>

                {/* Package */}
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-secondary" />
                  <span className={`text-sm ${
                    isDarkTheme ? 'text-gray-300' : 'text-base-content'
                  }`}>
                    {booking.package.name} - {booking.package.duration}
                  </span>
                </div>

                {/* Status & Edit Button */}
                <div className="flex items-center justify-between gap-2">
                  {getStatusBadge(booking.status)}
                  <button
                    onClick={() => handleEditBooking(booking)}
                    className="btn btn-sm btn-outline"
                    title="Edit booking"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Preview Modal */}
      <BookingPreview
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Package, XCircle, Trash2 } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';

export default function DeclinedBookings() {
  const { isDarkTheme } = useTheme();
  const [declinedBookings, setDeclinedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeclinedBookings();
    
    // Listen for declined bookings from BookingRequests
    const handleBookingDeclined = (event) => {
      const { booking } = event.detail;
      setDeclinedBookings(prev => [
        ...prev,
        { ...booking, status: 'canceled', declinedAt: new Date().toISOString() }
      ]);
    };

    window.addEventListener('bookingDeclined', handleBookingDeclined);
    
    return () => {
      window.removeEventListener('bookingDeclined', handleBookingDeclined);
    };
  }, []);

  const fetchDeclinedBookings = () => {
    setLoading(true);
    
    // API call to fetch declined bookings
    fetch('/api/bookings?status=canceled', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch declined bookings');
      }
      return response.json();
    })
    .then(data => {
      setDeclinedBookings(data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching declined bookings:', error);
      // Mock data for now
      setTimeout(() => {
        setDeclinedBookings([]);
        setLoading(false);
      }, 1000);
    });
  };

  const handleDeleteDeclined = (bookingId) => {
    if (window.confirm('Are you sure you want to permanently delete this declined booking?')) {
      setDeclinedBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      // API call to delete
      fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete booking');
        }
        console.log('Declined booking deleted');
      })
      .catch(error => {
        console.error('Error deleting booking:', error);
        fetchDeclinedBookings();
      });
    }
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
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  {/* Client Info */}
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="w-12 h-12 rounded-full bg-error text-error-content">
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
                    <Calendar size={16} className="text-error" />
                    <span className={`text-sm ${
                      isDarkTheme ? 'text-gray-300' : 'text-base-content'
                    }`}>
                      {booking.dateTime}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-error" />
                    <span className={`text-sm ${
                      isDarkTheme ? 'text-gray-300' : 'text-base-content'
                    }`}>
                      {booking.address}
                    </span>
                  </div>

                  {/* Package */}
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-error" />
                    <span className={`text-sm ${
                      isDarkTheme ? 'text-gray-300' : 'text-base-content'
                    }`}>
                      {booking.package.name} - {booking.package.duration}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <div className="badge badge-error">Declined</div>
                    <button
                      onClick={() => handleDeleteDeclined(booking.id)}
                      className="btn btn-sm btn-error btn-outline"
                      title="Delete permanently"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
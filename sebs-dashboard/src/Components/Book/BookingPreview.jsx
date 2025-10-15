import { Phone, Mail, Check, X } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';

export default function BookingPreview({ 
  booking, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}) {
  const { isDarkTheme } = useTheme();

  const handleStatusUpdate = (status) => {
    // Show warning for declining approved bookings
    if (status === 'canceled' && booking.status === 'confirmed') {
      if (!window.confirm('Warning: This booking is already approved. Declining it will move it to declined bookings. Are you sure you want to proceed?')) {
        return;
      }
    }
    
    // Update status first, then close modal
    onStatusUpdate(booking.id, status);
    
    // Add a small delay to ensure state update completes
    setTimeout(() => {
      onClose();
    }, 100);
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="modal modal-open">
      <div className={`modal-box w-11/12 max-w-2xl ${
        isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-bold ${
            isDarkTheme ? 'text-white' : 'text-base-content'
          }`}>
            Booking Details
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X size={16} />
          </button>
        </div>

        <div className={`card ${
          isDarkTheme ? 'bg-gray-700' : 'bg-primary/5'
        }`}>
          <div className="card-body">
            <h4 className={`text-xl font-semibold mb-4 ${
              isDarkTheme ? 'text-white' : 'text-base-content'
            }`}>
              {booking.client.name}
            </h4>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-secondary" />
                <span className={`${
                  isDarkTheme ? 'text-gray-300' : 'text-base-content'
                }`}>
                  {booking.client.email}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-secondary" />
                <span className={`${
                  isDarkTheme ? 'text-gray-300' : 'text-base-content'
                }`}>
                  {booking.client.phone}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h5 className={`font-semibold mb-2 ${
                  isDarkTheme ? 'text-white' : 'text-base-content'
                }`}>
                  Date & Time
                </h5>
                <p className={`${
                  isDarkTheme ? 'text-gray-300' : 'text-base-content'
                }`}>
                  {booking.dateTime}
                </p>
              </div>
              <div>
                <h5 className={`font-semibold mb-2 ${
                  isDarkTheme ? 'text-white' : 'text-base-content'
                }`}>
                  Package
                </h5>
                <p className={`${
                  isDarkTheme ? 'text-gray-300' : 'text-base-content'
                }`}>
                  {booking.package.name} - {booking.package.duration}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h5 className={`font-semibold mb-2 ${
                isDarkTheme ? 'text-white' : 'text-base-content'
              }`}>
                Address
              </h5>
              <p className={`${
                isDarkTheme ? 'text-gray-300' : 'text-base-content'
              }`}>
                {booking.address}
              </p>
            </div>

       

            {/* Actions for awaiting confirmation bookings */}
            {booking.status === 'pending' && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleStatusUpdate('Confirmed')}
                  className="btn btn-success flex-1"
                >
                  <Check size={16} />
                  Approve Booking
                </button>
                <button
                  onClick={() => handleStatusUpdate('Declined')}
                  className="btn btn-error flex-1"
                >
                  <X size={16} />
                  Decline Booking
                </button>
              </div>
            )}

            {/* Actions for confirmed bookings */}
            {booking.status === 'confirmed' && (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="badge badge-success badge-lg mb-4">
                    <Check size={16} className="mr-2" />
                    Booking Approved
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => handleStatusUpdate('declined')}
                    className="btn btn-error"
                  >
                    <X size={16} />
                    Decline Booking
                  </button>
                </div>
              </div>
            )}

            {/* Status display for declined bookings */}
            {booking.status === 'declined' && (
              <div className="text-center">
                <div className="badge badge-error badge-lg">
                  <X size={16} className="mr-2" />
                  Booking Declined
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
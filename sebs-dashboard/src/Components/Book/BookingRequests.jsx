import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  MapPin,
  Package,
  Edit,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../../Contexts/ThemeContext.jsx";
import BookingPreview from "./BookingPreview.jsx";
import { bookingService } from "../../Services/BookingService.js";

export default function BookingRequests({ bookings, fetcher, isDarkTheme }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStatusUpdate = (bookingId, newStatus) => {
    fetcher.submit(
      { bookingId, newStatus },
      { method: 'post' }
    );
    setIsModalOpen(false);
    setSelectedBooking(null);
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
      Confirmed: { class: "badge-success", text: "Confirmed" },
      Pending: { class: "badge-warning", text: "Pending" },
      Cancelled: { class: "badge-error", text: "Cancelled" },
      Declined: { class: "badge-error", text: "Declined" },
    };
    const config = statusConfig[status] || { class: "badge-ghost", text: status };
    return <div className={`badge ${config.class}`}>{config.text}</div>;
  };

  if (fetcher.state === 'submitting' || fetcher.state === 'loading') {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-4">Loading pending booking requests...</span>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className={`text-center py-12 ${isDarkTheme ? "text-gray-400" : "text-base-content/60"}`}>
        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg">No pending booking requests found</p>
        <p className="text-sm mt-2">All requests have been processed</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDarkTheme ? "text-white" : "text-base-content"}`}>Pending Booking Requests</h2>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className={`card shadow-lg ${isDarkTheme ? "bg-gray-800 border border-gray-700" : "bg-base-100"}`}
          >
            <div className="card-body p-4">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-start lg:items-center">
                <div className="lg:col-span-2 flex items-center gap-3">
                  <div className="avatar placeholder flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full bg-warning text-warning-content`}>
                      <span className="text-lg">{booking.client.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-semibold text-sm lg:text-base break-words ${isDarkTheme ? "text-white" : "text-base-content"}`}>{booking.client.name}</h3>
                    <p className={`text-xs lg:text-sm break-words ${isDarkTheme ? "text-gray-400" : "text-base-content/60"}`}>{booking.client.email}</p>
                    <p className={`text-xs lg:text-sm break-words ${isDarkTheme ? "text-gray-400" : "text-base-content/60"}`}>{booking.client.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 min-w-0">
                  <Calendar size={16} className="text-secondary flex-shrink-0 mt-1" />
                  <span className={`text-xs lg:text-sm break-words ${isDarkTheme ? "text-gray-300" : "text-base-content"}`}>{booking.dateTime}</span>
                </div>

                <div className="flex items-start gap-2 min-w-0">
                  <MapPin size={16} className="text-secondary flex-shrink-0 mt-1" />
                  <span className={`text-xs lg:text-sm break-words ${isDarkTheme ? "text-gray-300" : "text-base-content"}`}>{booking.address}</span>
                </div>

                <div className="flex items-start gap-2 min-w-0">
                  <Package size={16} className="text-secondary flex-shrink-0 mt-1" />
                  <div className={`text-xs lg:text-sm ${isDarkTheme ? "text-gray-300" : "text-base-content"}`}>
                    <div className="break-words leading-tight max-w-full overflow-wrap-anywhere">{booking.package.name}</div>
                    <div className="text-[10px] text-base-content/60 mt-1 break-words max-w-full overflow-wrap-anywhere">{booking.package.duration}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0">
                  <div className="flex-shrink-0">{getStatusBadge(booking.statusDisplay)}</div>
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

              {/* Additional Info Row */}
              {booking.reference && (
                <div className="mt-3 pt-3 border-t border-base-300">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span className={`${isDarkTheme ? "text-gray-400" : "text-base-content/60"}`}>
                      Reference: <span className="font-mono">{booking.reference}</span>
                    </span>
                    {booking.bookingDate && (
                      <span className={`${isDarkTheme ? "text-gray-400" : "text-base-content/60"}`}>Booked: {booking.bookingDate}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Preview Modal */}
      {selectedBooking && (
        <BookingPreview
          booking={selectedBooking}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          isDarkTheme={isDarkTheme}
        />
      )}
    </div>
  );
}

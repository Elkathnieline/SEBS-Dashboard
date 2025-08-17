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
import {
  fetchBookingRequests,
  transformBookingData,
  enumMapper,
  updateBookingStatus,
} from "../../Services/BookingService.js";

export default function BookingRequests() {
  const { isDarkTheme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enumsLoaded, setEnumsLoaded] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    console.log("BookingRequests useEffect triggered");
    if (!hasInitialized.current) {
      console.log("First time initialization");
      initializeData();
      hasInitialized.current = true;
    } else {
      console.log("Preventing re-fetch - component already initialized");
    }
  }, []);

  // Add debugging for component re-renders
  useEffect(() => {
    console.log("BookingRequests re-rendered");
  });

  const initializeData = () => {
    setLoading(true);
    setError(null);

    // Load enums first
    enumMapper
      .loadEnums()
      .then((enumsSuccess) => {
        if (!enumsSuccess) {
          throw new Error("Failed to load enum data");
        }
        setEnumsLoaded(true);
        return fetchBookings();
      })
      .catch((err) => {
        console.error("Initialization error:", err);
        setError("Failed to initialize booking data");
        setLoading(false);
      });
  };

  const fetchBookings = () => {
    console.log("fetchBookings called");
    const controller = new AbortController();

    return fetchBookingRequests(controller.signal)
      .then((data) => {
        console.log("Raw API data:", data);
        // Filter out declined bookings (status 3) and transform data
        const filteredData = data.filter((booking) => booking.status !== 3);
        const transformedData = transformBookingData(filteredData);
        console.log("Transformed bookings:", transformedData);
        setBookings(transformedData);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
          setError("Failed to load booking requests");
          setLoading(false);
        }
      });
  };

  const handleStatusUpdate = (bookingId, newStatus) => {
    console.log("handleStatusUpdate called:", { bookingId, newStatus });

    const bookingToUpdate = bookings.find((b) => b.id === bookingId);
    console.log("Booking to update:", bookingToUpdate);

    // Get numeric status value from enum mapper
    let numericStatus;
    if (newStatus === "canceled") {
      numericStatus = 4; // Cancelled status
    } else if (newStatus === "confirmed") {
      numericStatus = 2; // Confirmed status
    } else if (newStatus === "awaiting confirmation") {
      numericStatus = 1; // Awaiting Confirmation status
    } else {
      numericStatus = enumMapper.getStatusValue(newStatus) || 1; // Default to awaiting confirmation
    }

    // Optimistic update
    if (newStatus === "canceled") {
      setBookings((prev) => {
        const updated = prev.filter((booking) => booking.id !== bookingId);
        console.log("After decline filter:", updated);
        return updated;
      });

      window.dispatchEvent(
        new CustomEvent("bookingDeclined", {
          detail: { bookingId, booking: bookingToUpdate },
        })
      );
    } else {
      setBookings((prev) => {
        const updated = prev.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: newStatus,
                statusDisplay:
                  enumMapper.getBookingStatus(numericStatus).displayName,
              }
            : booking
        );
        console.log("After status update:", updated);
        return updated;
      });
    }

    // Close modal
    setIsModalOpen(false);
    setSelectedBooking(null);

    // Real API call
    const controller = new AbortController();
    updateBookingStatus(bookingId, numericStatus, controller.signal)
      .then((response) => {
        console.log("Status update successful:", response);
      })
      .catch((err) => {
        console.error("Status update failed:", err);
        // Revert optimistic update on failure
        fetchBookings();
        setError("Failed to update booking status");
      });
  };

  const handleEditBooking = (booking) => {
    console.log("Opening modal for:", booking);
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("Closing modal");
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleRefresh = () => {
    setError(null);
    fetchBookings();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { class: "badge-success", text: "Confirmed" },
      awaitingconfirmation: { class: "badge-warning", text: "Awaiting Confirmation" },
      canceled: { class: "badge-error", text: "Canceled" },
      cancelled: { class: "badge-error", text: "Cancelled" },
      declined: { class: "badge-error", text: "Declined" },
      completed: { class: "badge-success", text: "Completed" },
      noshow: { class: "badge-error", text: "No Show" },
    };

    const config = statusConfig[status] || {
      class: "badge-ghost",
      text: status,
    };

    return <div className={`badge ${config.class}`}>{config.text}</div>;
  };

  console.log("Current bookings state:", bookings);
  console.log("Loading state:", loading);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="alert alert-error">
          <AlertCircle size={20} />
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
      <div className="flex items-center justify-between">
        <h2
          className={`text-2xl font-bold ${
            isDarkTheme ? "text-white" : "text-base-content"
          }`}
        >
          Booking Requests
        </h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {bookings.length === 0 ? (
        <div
          className={`text-center py-12 ${
            isDarkTheme ? "text-gray-400" : "text-base-content/60"
          }`}
        >
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No booking requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`card shadow-lg ${
                isDarkTheme
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-base-100"
              }`}
            >
              <div className="card-body p-4">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-start lg:items-center">
                  <div className="lg:col-span-2 flex items-center gap-3">
                    <div className="avatar placeholder flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full ${
                          isDarkTheme
                            ? "bg-gray-700"
                            : "bg-primary text-primary-content"
                        }`}
                      >
                        <span className="text-lg">
                          {booking.client.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`font-semibold text-sm lg:text-base break-words ${
                          isDarkTheme ? "text-white" : "text-base-content"
                        }`}
                      >
                        {booking.client.name}
                      </h3>
                      <p
                        className={`text-xs lg:text-sm break-words ${
                          isDarkTheme ? "text-gray-400" : "text-base-content/60"
                        }`}
                      >
                        {booking.client.email}
                      </p>
                      <p
                        className={`text-xs lg:text-sm break-words ${
                          isDarkTheme ? "text-gray-400" : "text-base-content/60"
                        }`}
                      >
                        {booking.client.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 min-w-0">
                    <Calendar
                      size={16}
                      className="text-secondary flex-shrink-0 mt-1"
                    />
                    <span
                      className={`text-xs lg:text-sm break-words ${
                        isDarkTheme ? "text-gray-300" : "text-base-content"
                      }`}
                    >
                      {booking.dateTime}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin
                      size={16}
                      className="text-secondary flex-shrink-0 mt-1"
                    />
                    <span
                      className={`text-xs lg:text-sm break-words ${
                        isDarkTheme ? "text-gray-300" : "text-base-content"
                      }`}
                    >
                      {booking.address}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 min-w-0">
                    <Package
                      size={16}
                      className="text-secondary flex-shrink-0 mt-1"
                    />
                    <div
                      className={`text-xs lg:text-sm ${
                        isDarkTheme ? "text-gray-300" : "text-base-content"
                      }`}
                    >
                      <div className="break-words leading-tight max-w-full overflow-wrap-anywhere">
                        {booking.package.name}
                      </div>
                      <div className="text-[10px] text-base-content/60 mt-1 break-words max-w-full overflow-wrap-anywhere">
                        {booking.package.duration}
                      </div>
                    </div>
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

                {/* Additional Info Row */}
                {booking.reference && (
                  <div className="mt-3 pt-3 border-t border-base-300">
                    <div className="flex flex-wrap gap-4 text-xs">
                      <span
                        className={`${
                          isDarkTheme ? "text-gray-400" : "text-base-content/60"
                        }`}
                      >
                        Reference:{" "}
                        <span className="font-mono">{booking.reference}</span>
                      </span>
                      {booking.bookingDate && (
                        <span
                          className={`${
                            isDarkTheme
                              ? "text-gray-400"
                              : "text-base-content/60"
                          }`}
                        >
                          Booked: {booking.bookingDate}
                        </span>
                      )}
                      {booking.package.totalPrice > 0 && (
                        <span
                          className={`${
                            isDarkTheme
                              ? "text-gray-400"
                              : "text-base-content/60"
                          }`}
                        >
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

      <BookingPreview
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}

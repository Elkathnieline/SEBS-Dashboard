import { useState, useCallback, useEffect } from 'react';
import { bookingService } from '../Services/BookingService.js';
import { enumMapper } from '../Utils/EnumMapper.js';
import { transformBookingData } from '../Utils/BookingTransformer.js';

export const useBookings = (filterStatus = null) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enumsLoaded, setEnumsLoaded] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load enums first if not loaded
      if (!enumsLoaded) {
        const enumsSuccess = await enumMapper.loadEnums(bookingService);
        if (!enumsSuccess) {
          throw new Error('Failed to load enum data');
        }
        setEnumsLoaded(true);
      }

      // Fetch bookings
      const data = await bookingService.fetchBookingRequests();
      
      // Filter if needed (e.g., exclude declined bookings)
      const filteredData = filterStatus !== null 
        ? data.filter(booking => booking.status !== filterStatus)
        : data;
      
      const transformedData = transformBookingData(filteredData);
      setBookings(transformedData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, enumsLoaded]);

  const updateBookingStatus = useCallback(async (bookingId, newStatus) => {
    const bookingToUpdate = bookings.find(b => b.id === bookingId);
    if (!bookingToUpdate) return { success: false, error: 'Booking not found' };

    // Get numeric status value
    let numericStatus;
    if (newStatus === "canceled") {
      numericStatus = 4;
    } else if (newStatus === "confirmed") {
      numericStatus = 2;
    } else if (newStatus === "awaiting confirmation") {
      numericStatus = 1;
    } else {
      numericStatus = enumMapper.getStatusValue(newStatus) || 1;
    }

    try {
      // Optimistic update
      setBookings(prev => {
        if (newStatus === "canceled") {
          // Remove from list if declined
          return prev.filter(booking => booking.id !== bookingId);
        } else {
          // Update status
          return prev.map(booking =>
            booking.id === bookingId
              ? {
                  ...booking,
                  status: newStatus,
                  statusDisplay: enumMapper.getBookingStatus(numericStatus).displayName
                }
              : booking
          );
        }
      });

      // API call
      await bookingService.updateBookingStatus(bookingId, numericStatus);
      
      // Dispatch custom event for declined bookings
      if (newStatus === "canceled") {
        window.dispatchEvent(
          new CustomEvent("bookingDeclined", {
            detail: { bookingId, booking: bookingToUpdate }
          })
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Status update failed:', error);
      // Revert optimistic update
      fetchBookings();
      return { success: false, error: error.message };
    }
  }, [bookings, fetchBookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    enumsLoaded,
    fetchBookings,
    updateBookingStatus
  };
};
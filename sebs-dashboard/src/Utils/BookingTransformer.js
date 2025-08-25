import { enumMapper } from './EnumMapper.js';

export function transformBookingData(apiData) {
  return apiData.map(booking => {
    const eventDetails = booking.eventDetails || {};
    
    // Get enum display names with fallbacks
    const statusInfo = enumMapper.getBookingStatus(booking.status);
    const eventTypeInfo = enumMapper.getEventType(eventDetails.eventType || 0);

    // Format date with fallback
    let dateTime = 'No date set';
    if (eventDetails.eventDate) {
      try {
        const eventDate = new Date(eventDetails.eventDate);
        dateTime = eventDate.toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        });
      } catch (error) {
        console.warn('Invalid event date:', eventDetails.eventDate);
        dateTime = 'Invalid date';
      }
    }

    // Process services
    const services = eventDetails.eventServices || [];
    const servicesSummary = services.length > 0 
      ? `${services.length} service${services.length !== 1 ? 's' : ''}`
      : 'No services';

    // Calculate total price
    const totalPrice = services.reduce((sum, service) => {
      if (!service) return sum;
      return sum + (service.customPrice || service.serviceBasePrice || 0) * (service.quantity || 1);
    }, 0);

    // Format booking date
    let formattedBookingDate = 'Unknown';
    if (booking.bookingDate) {
      try {
        const bookingDate = new Date(booking.bookingDate);
        formattedBookingDate = bookingDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        console.warn('Invalid booking date:', booking.bookingDate);
        formattedBookingDate = 'Invalid date';
      }
    }

    const mappedStatus = statusInfo.name ? statusInfo.name.toLowerCase() : 'unknown';

    return {
      id: booking.bookingID || booking.id || 0,
      reference: booking.bookingReference || 'No reference',
      bookingDate: formattedBookingDate,
      client: {
        name: booking.customerName || 'Unknown customer',
        email: booking.customerEmail || 'No email',
        phone: booking.customerPhone || 'No phone'
      },
      dateTime: dateTime,
      address: eventDetails.location || 'No location',
      eventType: eventTypeInfo.displayName || 'Unknown type',
      package: {
        name: eventDetails.name || 'Custom Event',
        duration: servicesSummary,
        totalPrice: totalPrice
      },
      status: mappedStatus,
      statusDisplay: statusInfo.displayName || 'Unknown status',
      notes: eventDetails.notes || '',
      approvedBy: booking.approvedByName || null,
      approvedDate: booking.approvedDate ? formatApprovedDate(booking.approvedDate) : null,
      originalData: booking,
      services: services
    };
  });
}

function formatApprovedDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString('en-US');
  } catch (error) {
    console.warn('Invalid approved date:', dateString);
    return null;
  }
}
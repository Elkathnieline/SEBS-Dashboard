export class EnumMapper {
  constructor() {
    this.bookingStatuses = new Map();
    this.eventTypes = new Map();
    this.isLoaded = false;
  }

  async loadEnums(bookingService) {
    if (this.isLoaded) return true;

    try {
      const [statusesData, eventTypesData] = await Promise.all([
        bookingService.fetchBookingStatuses(),
        bookingService.fetchEventTypes()
      ]);

      // Create status mappings
      statusesData.forEach(status => {
        this.bookingStatuses.set(status.value, {
          name: status.name,
          displayName: status.displayName
        });
      });

      // Create event type mappings
      eventTypesData.forEach(eventType => {
        this.eventTypes.set(eventType.value, {
          name: eventType.name,
          displayName: eventType.displayName
        });
      });

      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('Failed to load enums:', error);
      return false;
    }
  }

  getBookingStatus(value) {
    return this.bookingStatuses.get(value) || { name: 'Unknown', displayName: 'Unknown' };
  }

  getEventType(value) {
    return this.eventTypes.get(value) || { name: 'Unknown', displayName: 'Unknown' };
  }

  getStatusValue(name) {
    for (const [value, status] of this.bookingStatuses) {
      if (status.displayName === name) {
        return value;
      }
    }
    return null;
  }
}

// Create singleton instance
export const enumMapper = new EnumMapper();
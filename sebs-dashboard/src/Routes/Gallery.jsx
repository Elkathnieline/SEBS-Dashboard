import { useState } from 'react';
import { Camera } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import PhotoUpload from '../Components/Photos/PhotoUpload.jsx';
import PhotoPreview from '../Components/Photos/PhotoPreview.jsx';
import Highlights from '../Components/Photos/Highlights.jsx';
import EventAlbums from '../Components/Photos/EventAlbums.jsx';

export default function Gallery() {
  const { isDarkTheme } = useTheme();
  const [photos, setPhotos] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Remove handlePhotoUpload since all uploads create events
  const handleHighlightUpload = (newHighlight) => {
    if (highlights.length < 10) {
      setHighlights(prev => [newHighlight, ...prev]);
    }
  };

  const handleRemoveHighlight = (photoId) => {
    setHighlights(prev => prev.filter(h => h.id !== photoId));
  };

  const handleEventUpload = (event) => {
    setEvents(prev => [event, ...prev]);
    setPhotos(prev => [...event.photos, ...prev]);
  };

  const handlePublishEvent = (eventId) => {
    setEvents(prev => prev.map(event =>
      event.id === eventId
        ? { ...event, status: 'published', isPublished: true }
        : event
    ));

    // API call would be:
    // fetch(`/api/events/${eventId}/publish`, {
    //   method: 'PUT',
    //   headers: { 
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // })
    // .then(response => {
    //   if (!response.ok) {
    //     throw new Error('Failed to publish event');
    //   }
    //   return response.json();
    // })
    // .then(data => {
    //   console.log('Event published:', data);
    // })
    // .catch(error => {
    //   console.error('Publish failed:', error);
    // });
  };

  const handleDeletePhotoFromEvent = (eventId, photoId) => {
    // Remove photo from the specific event
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, photos: event.photos.filter(photo => photo.id !== photoId) }
        : event
    ).filter(event => event.photos.length > 0)); // Automatically remove empty events

    // Remove photo from main photos array
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    
    // Remove from highlights if present
    setHighlights(prev => prev.filter(h => h.id !== photoId));

    // API call would be:
    // fetch(`/api/events/${eventId}/photos/${photoId}`, {
    //   method: 'DELETE',
    //   headers: { 
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // })
    // .then(response => {
    //   if (!response.ok) {
    //     throw new Error('Failed to delete photo');
    //   }
    //   return response.json();
    // })
    // .then(data => {
    //   console.log('Photo deleted:', data);
    // })
    // .catch(error => {
    //   console.error('Delete failed:', error);
    // });
  };

  const handleDeleteEvent = (eventId) => {
    // Get all photo IDs from this event before deletion
    const eventToDelete = events.find(event => event.id === eventId);
    const photoIdsToDelete = eventToDelete?.photos.map(photo => photo.id) || [];

    // Remove entire event
    setEvents(prev => prev.filter(event => event.id !== eventId));
    
    // Remove all photos from this event from photos array
    setPhotos(prev => prev.filter(photo => !photoIdsToDelete.includes(photo.id)));
    
    // Remove any highlights that were part of this event
    setHighlights(prev => prev.filter(h => !photoIdsToDelete.includes(h.id)));

    // API call would be:
    // fetch(`/api/events/${eventId}`, {
    //   method: 'DELETE',
    //   headers: { 
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // })
    // .then(response => {
    //   if (!response.ok) {
    //     throw new Error('Failed to delete event');
    //   }
    //   return response.json();
    // })
    // .then(data => {
    //   console.log('Event deleted:', data);
    // })
    // .catch(error => {
    //   console.error('Delete failed:', error);
    // });
  };

  const handlePreviewPhoto = (photo) => {
    setSelectedPhoto(photo);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedPhoto(null);
  };

  const handleUpdateCaption = (photoId, newCaption) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, caption: newCaption }
        : photo
    ));
    setHighlights(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, caption: newCaption }
        : photo
    ));
    // Update captions in events too
    setEvents(prev => prev.map(event => ({
      ...event,
      photos: event.photos.map(photo => 
        photo.id === photoId 
          ? { ...photo, caption: newCaption }
          : photo
      )
    })));
  };

  const handleDeletePhotoFromPreview = (photoId) => {
    // Find which event contains this photo
    const eventWithPhoto = events.find(event => 
      event.photos.some(photo => photo.id === photoId)
    );
    
    if (eventWithPhoto) {
      // Use existing delete handler
      handleDeletePhotoFromEvent(eventWithPhoto.id, photoId);
    } else {
      // Handle individual photos if any
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      setHighlights(prev => prev.filter(h => h.id !== photoId));
    }
  };

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
            <Camera size={24} className="text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${
              isDarkTheme ? 'text-white' : 'text-base-content'
            }`}>
              Gallery
            </h1>
            <p className={`${
              isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
            }`}>
              Create and manage photo events
            </p>
          </div>
        </div>

        {/* Upload Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PhotoUpload 
            onEventUpload={handleEventUpload}
          />
          <div className="lg:col-span-2">
            <Highlights
              highlights={highlights}
              onUploadHighlight={handleHighlightUpload}
              onRemoveHighlight={handleRemoveHighlight}
              onPreviewPhoto={handlePreviewPhoto}
            />
          </div>
        </div>

        {/* Event Albums - Vertical Layout */}
        <EventAlbums
          events={events}
          onPreviewPhoto={handlePreviewPhoto}
          onDeletePhoto={handleDeletePhotoFromEvent}
          onDeleteEvent={handleDeleteEvent}
          onPublishEvent={handlePublishEvent}
        />

        {/* Photo Preview Modal */}
        <PhotoPreview
          photo={selectedPhoto}
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          onDeletePhoto={handleDeletePhotoFromPreview}
        />
      </div>
    </div>
  );
}

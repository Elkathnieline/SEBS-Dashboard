import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { useGallery } from '../Hooks/useGallery.js';
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
  const [isLoading, setIsLoading] = useState(true);
  
  const { deleteImage, publishEvent, uploadHighlights, fetchHighlights } = useGallery();

  // Fetch highlights on component mount
  useEffect(() => {
    const loadHighlights = async () => {
      setIsLoading(true);
      const result = await fetchHighlights();
      
      if (result.success) {
        setHighlights(result.highlights);
      }
      setIsLoading(false);
    };

    loadHighlights();
  }, [fetchHighlights]);

  const handleHighlightUpload = (newHighlight) => {
    if (highlights.length < 10) {
      setHighlights(prev => [newHighlight, ...prev]);
    }
  };

  const handleRemoveHighlight = async (photoId) => {
    // Find the highlight to get its highlightId
    const highlight = highlights.find(h => h.id === photoId);
    
    if (highlight && highlight.highlightId) {
      const result = await deleteImage(highlight.highlightId, 'highlight');
      
      if (result.success) {
        setHighlights(prev => prev.filter(h => h.id !== photoId));
      }
    } else {
      // Fallback for local-only highlights
      setHighlights(prev => prev.filter(h => h.id !== photoId));
    }
  };

  const handleEventUpload = (event) => {
    setEvents(prev => [event, ...prev]);
    setPhotos(prev => [...event.photos, ...prev]);
  };

  const handlePublishEvent = async (eventId) => {
    const result = await publishEvent(eventId);
    
    if (result.success) {
      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, status: 'published', isPublished: true }
          : event
      ));
    }
  };

  const handleDeletePhotoFromEvent = async (eventId, photoId) => {
    // Call API to delete the image
    const result = await deleteImage(photoId);
    
    if (result.success) {
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
    }
  };

  const handleDeleteEvent = async (eventId) => {
    // Get all photo IDs from this event before deletion
    const eventToDelete = events.find(event => event.id === eventId);
    const photoIdsToDelete = eventToDelete?.photos.map(photo => photo.id) || [];

    // Delete all photos from the API
    const deletePromises = photoIdsToDelete.map(photoId => deleteImage(photoId));
    await Promise.all(deletePromises);

    // Remove entire event
    setEvents(prev => prev.filter(event => event.id !== eventId));
    
    // Remove all photos from this event from photos array
    setPhotos(prev => prev.filter(photo => !photoIdsToDelete.includes(photo.id)));
    
    // Remove any highlights that were part of this event
    setHighlights(prev => prev.filter(h => !photoIdsToDelete.includes(h.id)));
  };

  const handlePreviewPhoto = (photo) => {
    console.log('Preview photo:', photo);
    if (photo && photo.id) {
      setSelectedPhoto(photo);
      setIsPreviewOpen(true);
    }
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

  const handleDeletePhotoFromPreview = async (photoId) => {
    // Find which event contains this photo
    const eventWithPhoto = events.find(event => 
      event.photos.some(photo => photo.id === photoId)
    );
    
    if (eventWithPhoto) {
      // Use existing delete handler
      await handleDeletePhotoFromEvent(eventWithPhoto.id, photoId);
    } else {
      // Handle individual photos if any
      const result = await deleteImage(photoId);
      
      if (result.success) {
        setPhotos(prev => prev.filter(photo => photo.id !== photoId));
        setHighlights(prev => prev.filter(h => h.id !== photoId));
      }
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
              isLoading={isLoading}
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

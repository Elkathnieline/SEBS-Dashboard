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
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  
  const { 
    deleteImage, 
    publishEventGallery, 
    fetchHighlights,
    fetchEventGalleries,
    deleteEventGallery,
    removeImageFromGallery
  } = useGallery();

  // Fetch highlights and event galleries on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load highlights
      const highlightsResult = await fetchHighlights();
      if (highlightsResult.success) {
        setHighlights(highlightsResult.highlights);
      }
      
      // Load existing event galleries
      setIsLoadingEvents(true);
      const galleriesResult = await fetchEventGalleries();
      if (galleriesResult.success) {
        setEvents(galleriesResult.galleries);
        // Extract all photos from events
        const allEventPhotos = galleriesResult.galleries.flatMap(event => event.photos);
        setPhotos(allEventPhotos);
      }
      setIsLoadingEvents(false);
      
      setIsLoading(false);
    };

    loadData();
  }, [fetchHighlights, fetchEventGalleries]);

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
    const result = await publishEventGallery(eventId); // Use new method
    
    if (result.success) {
      setEvents(prev => prev.map(event =>
        event.id === eventId
          ? { ...event, status: 'published', isPublished: true }
          : event
      ));
    }
  };

  const handleDeletePhotoFromEvent = async (eventId, photoId) => {
    // Find the event and photo
    const event = events.find(e => e.id === eventId);
    const photo = event?.photos.find(p => p.id === photoId);
    
    if (!photo) return;

    // Use removeImageFromGallery if we have eventImageId, otherwise delete completely
    const result = photo.eventImageId 
      ? await removeImageFromGallery(eventId, photo.eventImageId)
      : await deleteImage(photoId, 'gallery-image');
    
    if (result.success) {
      // Remove photo from the specific event
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, photos: event.photos.filter(photo => photo.id !== photoId) }
          : event
      ).filter(event => event.photos.length > 0)); // Automatically remove empty events

      // Remove photo from main photos array
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      
      // Remove from highlights if present (use imageId for highlights)
      setHighlights(prev => prev.filter(h => h.imageId !== photoId && h.id !== photoId));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    // Use the proper API endpoint to delete entire gallery
    const result = await deleteEventGallery(eventId);
    
    if (result.success) {
      // Get photo IDs before removing event
      const eventToDelete = events.find(event => event.id === eventId);
      const photoIdsToDelete = eventToDelete?.photos.map(photo => photo.id) || [];

      // Remove entire event
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      // Remove all photos from this event from photos array
      setPhotos(prev => prev.filter(photo => !photoIdsToDelete.includes(photo.id)));
      
      // Remove any highlights that were part of this event
      setHighlights(prev => prev.filter(h => 
        !photoIdsToDelete.includes(h.id) && !photoIdsToDelete.includes(h.imageId)
      ));
    }
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
      // Use existing delete handler for event photos
      await handleDeletePhotoFromEvent(eventWithPhoto.id, photoId);
    } else {
      // Handle individual photos if any (highlights)
      const highlight = highlights.find(h => h.id === photoId || h.imageId === photoId);
      
      if (highlight) {
        // Use highlight deletion
        await handleRemoveHighlight(photoId);
      } else {
        // Fallback to general image deletion
        const result = await deleteImage(photoId);
        
        if (result.success) {
          setPhotos(prev => prev.filter(photo => photo.id !== photoId));
          setHighlights(prev => prev.filter(h => h.id !== photoId));
        }
      }
    }
    
    // Close preview after deletion
    handleClosePreview();
  };

  // NEW: Handle adding photos to existing gallery
  const handleAddPhotosToGallery = (galleryId, newPhotos) => {
    setEvents(prev => prev.map(event =>
      event.id === galleryId
        ? { 
            ...event, 
            photos: [...event.photos, ...newPhotos],
            photoCount: event.photos.length + newPhotos.length
          }
        : event
    ));
    
    // Add to main photos array as well
    setPhotos(prev => [...prev, ...newPhotos]);
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

        {/* Event Albums - Show loading state */}
        {isLoadingEvents ? (
          <div className={`text-center py-8 ${
            isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
          }`}>
            <div className="loading loading-spinner loading-lg mx-auto mb-4"></div>
            <p>Loading event galleries...</p>
          </div>
        ) : (
          <EventAlbums
            events={events}
            onPreviewPhoto={handlePreviewPhoto}
            onDeletePhoto={handleDeletePhotoFromEvent}
            onDeleteEvent={handleDeleteEvent}
            onPublishEvent={handlePublishEvent}
            onAddPhotos={handleAddPhotosToGallery}  // NEW: Pass handler for adding photos
          />
        )}

        {/* Photo Preview Modal */}
        <PhotoPreview
          photo={selectedPhoto}
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          onDeletePhoto={handleDeletePhotoFromPreview}
          onUpdateCaption={handleUpdateCaption}
        />
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { highlightsService } from '../Services/HighlightsService.js';
import { eventGalleryService } from '../Services/EventGalleryService.js';

export const useGallery = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const fetchHighlights = useCallback(async () => {
    try {
      const highlights = await highlightsService.fetchHighlights();
      return { success: true, highlights };
    } catch (error) {
      console.error('Error fetching highlights:', error);
      setError(error.message);
      return { success: false, error: error.message, highlights: [] };
    }
  }, []);

  const uploadHighlights = useCallback(async (files, caption = '', startingDisplayOrder = 0) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await highlightsService.uploadHighlights(files, caption, startingDisplayOrder);
      
      setIsUploading(false);
      setUploadProgress(100);
      
      return { success: true, ...result };
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      setIsUploading(false);
      setUploadProgress(0);
      
      return { success: false, error: error.message };
    }
  }, []);

  const uploadImages = useCallback(async (files, eventTitle) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await eventGalleryService.uploadEventImages(files, eventTitle);
      
      // Create event structure to match current format
      const newEvent = {
        id: result.galleryId,
        title: eventTitle,
        photos: result.photos,
        createdAt: new Date().toISOString(),
        status: 'draft',
        isPublished: false,
        photoCount: result.photos.length
      };

      setIsUploading(false);
      setUploadProgress(100);
      
      return { success: true, event: newEvent, photos: result.photos };
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      setIsUploading(false);
      setUploadProgress(0);
      
      return { success: false, error: error.message };
    }
  }, []);

  const uploadEventImages = useCallback(async (files, eventTitle) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Progress callback for two-step upload
      const handleProgress = ({ step, progress }) => {
        setUploadProgress(progress);
      };

      const result = await eventGalleryService.uploadEventImages(
        files, 
        eventTitle,
        handleProgress
      );
      
      // Create event structure to match current format
      const newEvent = {
        id: result.eventGalleryId,
        title: eventTitle,
        photos: result.photos,
        createdAt: new Date().toISOString(),
        status: 'draft',
        isPublished: false,
        photoCount: result.photos.length
      };

      setIsUploading(false);
      setUploadProgress(100);
      
      return { success: true, event: newEvent, photos: result.photos };
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
      setIsUploading(false);
      setUploadProgress(0);
      
      return { success: false, error: error.message };
    }
  }, []);

  const deleteImage = useCallback(async (id, type = 'image') => {
    try {
      if (type === 'highlight') {
        await highlightsService.deleteHighlight(id);
      } else if (type === 'event') {
        await eventGalleryService.deleteEventImage(id);
      } else {
        // For generic images, use base method from either service
        await highlightsService.deleteImage(id, type);
      }
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  const publishEvent = useCallback(async (eventId) => {
    try {
      const result = await eventGalleryService.publishEventGallery(eventId);
      return { success: true, event: result };
    } catch (error) {
      console.error('Publish error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Fetch all event galleries
  const fetchEventGalleries = useCallback(() => {
    return eventGalleryService.fetchEventGalleries()
      .then(galleries => {
        return { success: true, galleries };
      })
      .catch(error => {
        console.error('Error fetching event galleries:', error);
        setError(error.message);
        return { success: false, error: error.message, galleries: [] };
      });
  }, []);

  // Fetch specific event gallery
  const fetchEventGallery = useCallback((galleryId) => {
    return eventGalleryService.getEventGallery(galleryId)
      .then(gallery => {
        return { success: true, gallery };
      })
      .catch(error => {
        console.error('Error fetching event gallery:', error);
        setError(error.message);
        return { success: false, error: error.message, gallery: null };
      });
  }, []);

  // Delete event gallery
  const deleteEventGallery = useCallback((galleryId) => {
    return eventGalleryService.deleteEventGallery(galleryId)
      .then(() => {
        return { success: true };
      })
      .catch(error => {
        console.error('Delete gallery error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      });
  }, []);

  // Publish event gallery
  const publishEventGallery = useCallback((galleryId) => {
    return eventGalleryService.publishEventGallery(galleryId)
      .then(result => {
        return { success: true, gallery: result };
      })
      .catch(error => {
        console.error('Publish gallery error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      });
  }, []);

  // Remove image from gallery (delete event image)
  const removeImageFromGallery = useCallback((galleryId, eventImageId) => {
    return eventGalleryService.deleteEventImage(eventImageId)
      .then(() => {
        return { success: true };
      })
      .catch(error => {
        console.error('Remove image from gallery error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      });
  }, []);

  // Upload additional images to existing gallery
  const uploadToExistingGallery = useCallback((galleryId, files, caption = "", startingDisplayOrder = 0) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    return eventGalleryService.uploadToExistingGallery(galleryId, files, caption, startingDisplayOrder)
      .then(result => {
        setIsUploading(false);
        setUploadProgress(100);
        return { success: true, ...result };
      })
      .catch(error => {
        console.error('Upload to existing gallery error:', error);
        setError(error.message);
        setIsUploading(false);
        setUploadProgress(0);
        return { success: false, error: error.message };
      });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    // State
    isUploading,
    uploadProgress,
    error,
    
    // Actions
    fetchHighlights,
    fetchEventGalleries,
    fetchEventGallery,
    uploadImages,
    uploadEventImages,
    uploadHighlights,
    uploadToExistingGallery,
    deleteImage,
    deleteEventGallery,
    publishEvent,
    publishEventGallery,
    removeImageFromGallery,
    clearError,
    resetUpload
  };
};

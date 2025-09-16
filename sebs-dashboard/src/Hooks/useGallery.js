import { useState, useCallback } from 'react';
import { galleryService } from '../Services/GalleryService.js';

export const useGallery = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const fetchHighlights = useCallback(async () => {
    try {
      const highlights = await galleryService.fetchHighlights();
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
      const result = await galleryService.uploadHighlights(files, caption, startingDisplayOrder);
      
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
      const result = await galleryService.uploadImages(files, eventTitle);
      
      // Create event structure (this could also be moved to service)
      const eventId = Date.now();
      const newEvent = {
        id: eventId,
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
      const result = await galleryService.uploadEventImages(files, eventTitle);
      
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
      await galleryService.deleteImage(id, type);
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  const publishEvent = useCallback(async (eventId) => {
    try {
      const result = await galleryService.publishEvent(eventId);
      return { success: true, event: result };
    } catch (error) {
      console.error('Publish error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Fetch all event galleries
  const fetchEventGalleries = useCallback(() => {
    return galleryService.fetchEventGalleries()
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
    return galleryService.getEventGallery(galleryId)
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
    return galleryService.deleteEventGallery(galleryId)
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
    return galleryService.publishEventGallery(galleryId)
      .then(result => {
        return { success: true, gallery: result };
      })
      .catch(error => {
        console.error('Publish gallery error:', error);
        setError(error.message);
        return { success: false, error: error.message };
      });
  }, []);

  // Remove image from gallery (not delete image completely)
  const removeImageFromGallery = useCallback((galleryId, eventImageId) => {
    return galleryService.removeImageFromGallery(galleryId, eventImageId)
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

    return galleryService.uploadToExistingGallery(galleryId, files, caption, startingDisplayOrder)
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

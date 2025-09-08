import { cacheManager } from '../Utils/CacheManager.js';

class GalleryService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_DEV_API_URL || "";
  }

  getAuthHeaders() {
    const token = sessionStorage.getItem("backend-token");
    if (!token) {
      throw new Error("Authentication token not found");
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async fetchHighlights() {
    const cacheKey = cacheManager.generateKey('gallery', 'highlights');
    
    return cacheManager.getOrSet(
      cacheKey,
      async () => {
        const response = await fetch(`${this.apiUrl}/api/highlights`, {
          method: "GET",
          headers: {
            ...this.getAuthHeaders(),
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Failed to fetch highlights" }));
          throw new Error(errorData.message || "Failed to fetch highlights");
        }

        const highlightsData = await response.json();

        // Transform the API response to match the actual response structure
        return highlightsData
          .map((highlight) => ({
            id: highlight.imageId,
            highlightId: highlight.highlightId,
            imageId: highlight.imageId,
            // Use the imageUrl directly from the API response
            url: highlight.imageUrl ? `${this.apiUrl}${highlight.imageUrl}` : null,
            caption: highlight.image?.caption || "",
            uploadDate: highlight.image?.uploadedAt || new Date().toISOString(),
            displayOrder: highlight.displayOrder,
            isHighlight: true,
            originalName: highlight.image?.fileName,
            width: highlight.image?.width,
            height: highlight.image?.height,
            type: highlight.image?.contentType,
            // Extract S3 key from imageUrl for future use
            s3Key: highlight.imageUrl ? highlight.imageUrl.split('/').pop() : null,
          }))
          .filter(highlight => highlight.url) // Filter out highlights without valid URLs
          .sort((a, b) => a.displayOrder - b.displayOrder);
      },
      { 
        namespace: 'highlights',
        storageType: 'session' 
      }
    );
  }

  // Helper function as shown in API documentation
  getImageUrl(s3Key, width = null, height = null) {
    if (!s3Key || s3Key.trim() === '') return null;
    
    let url = `${this.apiUrl}/api/public/images/images/${s3Key}`;
    
    if (width && height) {
      url += `?width=${width}&height=${height}`;
    }
    
    return url;
  }

  // Alternative method for direct image access (as per documentation)
  getDirectImageUrl(s3Key) {
    if (!s3Key || s3Key.trim() === '') return null;
    return `${this.apiUrl}/api/public/images/images/${s3Key}`;
  }

  // Remove the old normalizeImageUrl method and replace with getImageUrl
  normalizeImageUrl(imageUrl) {
    // Legacy support - if imageUrl contains s3Key info, extract it
    if (!imageUrl || imageUrl.trim() === '') return null;

    // If it's already a complete URL, return as-is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // If it's an S3 key, use the proxy endpoint
    return this.getImageUrl(imageUrl);
  }

  // NEW: Use the recommended highlights upload endpoint
  async uploadHighlights(files, caption = "", startingDisplayOrder = 0) {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("Files", file);
    });

    formData.append("Caption", caption);
    formData.append("StartingDisplayOrder", startingDisplayOrder.toString());

    const response = await fetch(
      `${this.apiUrl}/api/highlights/upload`, // NEW: Use domain-specific endpoint
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Upload failed" }));
      throw new Error(errorData.message || "Failed to upload highlights");
    }

    const result = await response.json();

    // Transform response to match BulkHighlightUploadResponseDTO
    const uploadedPhotos = result.successfulUploads?.map((upload, index) => ({
      id: upload.image?.imageId || upload.highlight?.imageId || Date.now() + index,
      highlightId: upload.highlight?.highlightId,
      imageId: upload.image?.imageId,
      url: this.getImageUrl(upload.image?.s3Key),
      caption: upload.image?.caption || caption || files[index].name.split(".")[0],
      uploadDate: upload.image?.uploadedAt || new Date().toISOString(),
      originalName: files[index].name,
      size: files[index].size,
      type: files[index].type,
      isHighlight: true,
      displayOrder: upload.highlight?.displayOrder || startingDisplayOrder + index,
      fileName: upload.image?.fileName,
      width: upload.image?.width,
      height: upload.image?.height,
      s3Key: upload.image?.s3Key,
    })).filter(photo => photo.s3Key) || [];

    return {
      photos: uploadedPhotos,
      errors: result.errors || [],
      totalFiles: result.totalFiles || files.length,
      successCount: result.successCount || uploadedPhotos.length,
      errorCount: result.errorCount || 0,
    };
  }

  async uploadImages(files, eventTitle) {
    const uploadedPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", file.name.split(".")[0]);

      const response = await fetch(`${this.apiUrl}/api/admin/images/upload`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Upload failed" }));
        throw new Error(errorData.message || `Failed to upload ${file.name}`);
      }

      const result = await response.json();

      // Only add photos with valid S3 keys
      if (result.s3Key) {
        const uploadedPhoto = {
          id: result.imageId || result.id || Date.now() + i,
          // Use the proxy endpoint for uploaded images
          url: this.getImageUrl(result.s3Key) || URL.createObjectURL(file),
          caption: result.caption || file.name.split(".")[0],
          uploadDate:
            result.uploadedAt ||
            result.uploadDate ||
            result.createdAt ||
            new Date().toISOString(),
          originalName: file.name,
          size: file.size,
          type: file.type,
          fileName: result.fileName,
          width: result.width,
          height: result.height,
          s3Key: result.s3Key,
        };

        uploadedPhotos.push(uploadedPhoto);
      } else {
        console.warn(`Upload for ${file.name} succeeded but no S3 key received`);
      }
    }

    return {
      photos: uploadedPhotos,
      eventTitle,
    };
  }

  async deleteImage(id, type = "image") {
    let endpoint;
    
    switch (type) {
      case "highlight":
        endpoint = `${this.apiUrl}/api/highlights/${id}`;
        break;
      case "gallery-image":
        // This removes the image completely, not just from gallery
        endpoint = `${this.apiUrl}/api/Event-Gallery/images/${id}`;
        break;
      default:
        endpoint = `${this.apiUrl}/api/admin/images/${id}`;
    }

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Delete failed" }));
      throw new Error(errorData.message || "Failed to delete");
    }

    return true;
  }

  async publishEvent(eventId) {
    const response = await fetch(
      `${this.apiUrl}/api/admin/events/${eventId}/publish`,
      {
        method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Publish failed" }));
      throw new Error(errorData.message || "Failed to publish event");
    }

    return await response.json();
  }

  // Preload image for better UX
  preloadImage(s3Key, width = null, height = null) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = this.getImageUrl(s3Key, width, height);
    });
  }

  // Preload multiple images
  async preloadImages(highlights) {
    const preloadPromises = highlights.map(highlight => 
      this.preloadImage(highlight.s3Key, 150, 96).catch(() => null)
    );
    
    return Promise.allSettled(preloadPromises);
  }

  // Add public highlights fetch (no auth required)
  async fetchPublicHighlights() {
    const cacheKey = cacheManager.generateKey('gallery', 'public-highlights');
    
    return cacheManager.getOrSet(
      cacheKey,
      async () => {
        const response = await fetch(`${this.apiUrl}/api/public/highlights`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Failed to fetch public highlights" }));
          throw new Error(errorData.message || "Failed to fetch public highlights");
        }

        const highlights = await response.json();

        // Transform to match your existing structure
        return highlights.map((highlight) => ({
          id: highlight.imageId || highlight.id,
          url: highlight.imageUrl ? `${this.apiUrl}${highlight.imageUrl}` : null,
          caption: highlight.image?.caption || highlight.image?.fileName || "",
          fileName: highlight.image?.fileName,
          width: highlight.image?.width,
          height: highlight.image?.height,
          displayOrder: highlight.displayOrder,
          isPublished: true
        })).filter(highlight => highlight.url);
      },
      { 
        namespace: 'gallery-public',
        storageType: 'local' // Public data can persist across sessions
      }
    );
  }

  // NEW: Improved Event Gallery upload using recommended endpoint
  async uploadEventImages(files, eventTitle) {
    // Step 1: Create gallery using recommended endpoint
    const galleryResponse = await fetch(`${this.apiUrl}/api/Event-Gallery/Create`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: eventTitle,
        isPublished: false
      })
    });

    if (!galleryResponse.ok) {
      throw new Error("Failed to create event gallery");
    }

    const galleryResult = await galleryResponse.json();
    const eventGalleryId = galleryResult.eventGalleryId;

    try {
      // Step 2: Upload images using domain-specific endpoint
      const formData = new FormData();
      
      Array.from(files).forEach((file) => {
        formData.append("Files", file);
      });
      
      formData.append("Caption", "Event photos");
      formData.append("StartingDisplayOrder", "0");

      const uploadResponse = await fetch(
        `${this.apiUrl}/api/Event-Gallery/${eventGalleryId}/upload`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload images to gallery");
      }

      const uploadResult = await uploadResponse.json();

      // Transform response to match expected format
      const photos = uploadResult.successfulUploads?.map((upload) => ({
        id: upload.image?.imageId,
        url: this.getImageUrl(upload.image?.s3Key),
        caption: upload.image?.caption || upload.image?.fileName?.split(".")[0] || "",
        uploadDate: upload.image?.uploadedAt || new Date().toISOString(),
        originalName: upload.image?.fileName,
        size: upload.image?.fileSize,
        type: upload.image?.contentType,
        s3Key: upload.image?.s3Key,
      })).filter(photo => photo.s3Key) || [];

      return {
        eventGalleryId,
        photos,
        eventTitle
      };

    } catch (error) {
      // Cleanup gallery if upload failed
      await fetch(`${this.apiUrl}/api/Event-Gallery/${eventGalleryId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }).catch(deleteError => {
        console.error('Failed to cleanup gallery after error:', deleteError);
      });
      
      throw error;
    }
  }

  // NEW: Fetch all event galleries using promise chain
  fetchEventGalleries() {
    const cacheKey = cacheManager.generateKey('gallery', 'event-galleries');
    
    return cacheManager.getOrSet(
      cacheKey,
      () => fetch(`${this.apiUrl}/api/Event-Gallery`, {
        method: "GET",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
      })
      .then(response => {
        if (!response.ok) {
          return response.json()
            .catch(() => ({ message: "Failed to fetch event galleries" }))
            .then(errorData => {
              throw new Error(errorData.message || "Failed to fetch event galleries");
            });
        }
        return response.json();
      })
      .then(galleries => {
        // Transform API response to match expected format
        return galleries.map(gallery => ({
          id: gallery.eventGalleryId,
          title: gallery.title,
          createdAt: gallery.createdAt,
          isPublished: gallery.isPublished,
          status: gallery.isPublished ? 'published' : 'draft',
          photoCount: gallery.images?.length || 0,
          photos: gallery.images?.map(eventImage => ({
            id: eventImage.image?.imageId,
            eventImageId: eventImage.eventImageId, // Important for removal from gallery
            galleryId: eventImage.eventGalleryId,
            url: eventImage.imageUrl ? `${this.apiUrl}${eventImage.imageUrl}` : this.getImageUrl(eventImage.image?.s3Key),
            caption: eventImage.image?.caption || eventImage.image?.fileName?.split(".")[0] || "",
            uploadDate: eventImage.image?.uploadedAt || new Date().toISOString(),
            originalName: eventImage.image?.fileName,
            size: eventImage.image?.fileSize,
            type: eventImage.image?.contentType,
            displayOrder: eventImage.displayOrder,
            fileName: eventImage.image?.fileName,
            width: eventImage.image?.width,
            height: eventImage.image?.height,
          })).filter(photo => photo.url) || []
        }));
      }),
      { 
        namespace: 'gallery-events',
        storageType: 'session' 
      }
    );
  }

  // IMPROVED: Get specific gallery with images using promise chain
  getEventGallery(galleryId) {
    return fetch(`${this.apiUrl}/api/Event-Gallery/${galleryId}`, {
      method: "GET",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    })
    .then(response => {
      if (!response.ok) {
        return response.json()
          .catch(() => ({ message: "Failed to fetch gallery" }))
          .then(errorData => {
            throw new Error(errorData.message || "Failed to fetch gallery");
          });
      }
      return response.json();
    })
    .then(gallery => {
      // Transform to match expected format
      return {
        id: gallery.eventGalleryId,
        title: gallery.title,
        createdAt: gallery.createdAt,
        isPublished: gallery.isPublished,
        status: gallery.isPublished ? 'published' : 'draft',
        photoCount: gallery.images?.length || 0,
        photos: gallery.images?.map(eventImage => ({
          id: eventImage.image?.imageId,
          eventImageId: eventImage.eventImageId,
          galleryId: eventImage.eventGalleryId,
          url: eventImage.imageUrl ? `${this.apiUrl}${eventImage.imageUrl}` : this.getImageUrl(eventImage.image?.s3Key),
          caption: eventImage.image?.caption || eventImage.image?.fileName?.split(".")[0] || "",
          uploadDate: eventImage.image?.uploadedAt || new Date().toISOString(),
          originalName: eventImage.image?.fileName,
          size: eventImage.image?.fileSize,
          type: eventImage.image?.contentType,
          displayOrder: eventImage.displayOrder,
          fileName: eventImage.image?.fileName,
          width: eventImage.image?.width,
          height: eventImage.image?.height,
        })).filter(photo => photo.url) || []
      };
    });
  }

  // IMPROVED: Delete entire event gallery using promise chain
  deleteEventGallery(galleryId) {
    return fetch(`${this.apiUrl}/api/Event-Gallery/${galleryId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    .then(response => {
      if (!response.ok) {
        return response.json()
          .catch(() => ({ message: "Failed to delete gallery" }))
          .then(errorData => {
            throw new Error(errorData.message || "Failed to delete gallery");
          });
      }
      return true;
    });
  }

  // IMPROVED: Publish event gallery using promise chain
  publishEventGallery(galleryId) {
    return fetch(`${this.apiUrl}/api/Event-Gallery/${galleryId}/publish`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    })
    .then(response => {
      if (!response.ok) {
        return response.json()
          .catch(() => ({ message: "Failed to publish gallery" }))
          .then(errorData => {
            throw new Error(errorData.message || "Failed to publish gallery");
          });
      }
      return response.json();
    });
  }

  // NEW: Generic upload method following the guide's pattern
  async uploadToController(endpoint, files, options = {}) {
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('Files', file);
    });
    
    if (options.caption) formData.append('Caption', options.caption);
    if (options.startingDisplayOrder) formData.append('StartingDisplayOrder', options.startingDisplayOrder.toString());

    const url = options.galleryId 
      ? `${this.apiUrl}${endpoint}/${options.galleryId}/upload`
      : `${this.apiUrl}${endpoint}/upload`;
      
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Upload failed" }));
      throw new Error(errorData.message || "Upload failed");
    }

    return await response.json();
  }

  // NEW: Upload additional images to existing gallery
  uploadToExistingGallery(galleryId, files, caption = "", startingDisplayOrder = 0) {
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append("Files", file);
    });
    
    formData.append("Caption", caption);
    formData.append("StartingDisplayOrder", startingDisplayOrder.toString());

    return fetch(`${this.apiUrl}/api/Event-Gallery/${galleryId}/upload`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
        return response.json()
          .catch(() => ({ message: "Failed to upload images to gallery" }))
          .then(errorData => {
            throw new Error(errorData.message || "Failed to upload images to gallery");
          });
      }
      return response.json();
    })
    .then(result => {
      // Transform response to match expected format
      const photos = result.successfulUploads?.map((upload) => ({
        id: upload.image?.imageId,
        eventImageId: upload.eventImageId,
        galleryId: galleryId,
        url: upload.imageUrl ? `${this.apiUrl}${upload.imageUrl}` : this.getImageUrl(upload.image?.s3Key),
        caption: upload.image?.caption || upload.image?.fileName?.split(".")[0] || "",
        uploadDate: upload.image?.uploadedAt || new Date().toISOString(),
        originalName: upload.image?.fileName,
        size: upload.image?.fileSize,
        type: upload.image?.contentType,
        displayOrder: upload.displayOrder,
        fileName: upload.image?.fileName,
        width: upload.image?.width,
        height: upload.image?.height,
      })).filter(photo => photo.url) || [];

      return {
        photos,
        errors: result.errors || [],
        totalFiles: result.totalFiles || files.length,
        successCount: result.successCount || photos.length,
        errorCount: result.errorCount || 0,
      };
    });
  }

  // Cache invalidation methods
  invalidateHighlightsCache() {
    cacheManager.invalidate('highlights');
    cacheManager.invalidate('gallery-public');
    // Dispatch event for external components
    window.dispatchEvent(new CustomEvent('galleryUpload'));
  }

  invalidateGalleryCache() {
    cacheManager.invalidate('gallery-events');
    cacheManager.invalidate('gallery');
    // Dispatch event for external components
    window.dispatchEvent(new CustomEvent('galleryUpload'));
  }

  invalidatePublicCache() {
    cacheManager.invalidate('gallery-public');
    // Dispatch event for external components
    window.dispatchEvent(new CustomEvent('galleryPublish'));
  }

  // Override upload methods to invalidate cache
  async uploadHighlights(files, caption = "", startingDisplayOrder = 0) {
    const result = await super.uploadHighlights?.(files, caption, startingDisplayOrder) || 
                    this.originalUploadHighlights(files, caption, startingDisplayOrder);
    
    if (result.successCount > 0) {
      this.invalidateHighlightsCache();
    }
    
    return result;
  }

  // Store original methods for cache invalidation wrappers
  originalUploadHighlights = super.uploadHighlights || this.uploadHighlights;
  originalDeleteImage = this.deleteImage;
  originalPublishEvent = this.publishEvent;

  async deleteImage(id, type = "image") {
    const result = await this.originalDeleteImage(id, type);
    
    if (result) {
      if (type === 'highlight') {
        this.invalidateHighlightsCache();
      } else {
        this.invalidateGalleryCache();
      }
      // Dispatch event for external components
      window.dispatchEvent(new CustomEvent('galleryDelete'));
    }
    
    return result;
  }

  async publishEvent(eventId) {
    const result = await this.originalPublishEvent(eventId);
    
    if (result) {
      this.invalidatePublicCache();
    }
    
    return result;
  }

  // Utility method to refresh all gallery caches
  refreshAllCaches() {
    cacheManager.invalidate('gallery');
    cacheManager.invalidate('highlights');
    cacheManager.invalidate('gallery-public');
    cacheManager.invalidate('gallery-events');
  }
}

export const galleryService = new GalleryService();

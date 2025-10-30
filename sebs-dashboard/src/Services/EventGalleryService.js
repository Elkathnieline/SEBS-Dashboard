// src/Services/EventGalleryService.js
import BaseGalleryService from './BaseGalleryService.js';

class EventGalleryService extends BaseGalleryService {
  constructor() {
    super();
  }

  fetchEventGalleries() {
    return fetch(`${this.apiUrl}/api/Event-Gallery`, {
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
      }));
    });
  }

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

  // Create event gallery (Step 1 of 2-step upload)
  createEventGallery(eventTitle) {
    return fetch(`${this.apiUrl}/api/Event-Gallery/Create`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Title: eventTitle,
        IsPublished: false
      }),
    })
    .then(response => {
      if (!response.ok) {
        return response.json()
          .catch(() => ({ message: "Failed to create event gallery" }))
          .then(errorData => {
            throw new Error(errorData.message || "Failed to create event gallery");
          });
      }
      return response.json();
    })
    .then(gallery => {
      return {
        eventGalleryId: gallery.eventGalleryId,
        title: gallery.title,
        isPublished: gallery.isPublished,
        createdAt: gallery.createdAt
      };
    });
  }

  // Two-step upload: Create gallery, then upload images
  async uploadEventImages(files, eventTitle, onProgress) {
    let createdGalleryId = null;
    
    try {
      // Step 1: Create event gallery
      if (onProgress) onProgress({ step: 'creating', progress: 10 });
      
      const gallery = await this.createEventGallery(eventTitle);
      createdGalleryId = gallery.eventGalleryId;
      
      if (onProgress) onProgress({ step: 'uploading', progress: 30 });
      
      // Step 2: Upload images to the created gallery
      const result = await this.uploadToExistingGallery(
        createdGalleryId, 
        files, 
        "", // caption
        0   // startingDisplayOrder
      );
      
      if (onProgress) onProgress({ step: 'complete', progress: 100 });
      
      // Return combined result
      return {
        photos: result.photos,
        eventTitle: eventTitle,
        eventGalleryId: createdGalleryId,
        errors: result.errors || [],
        totalFiles: result.totalFiles || files.length,
        successCount: result.successCount || result.photos.length,
        errorCount: result.errorCount || 0,
      };
      
    } catch (error) {
      // If upload failed and we created a gallery, delete it
      if (createdGalleryId) {
        try {
          await this.deleteEventGallery(createdGalleryId);
          console.log(`Cleaned up empty gallery ${createdGalleryId} after upload failure`);
        } catch (deleteError) {
          console.error('Failed to cleanup gallery:', deleteError);
        }
      }
      
      throw error;
    }
  }

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

  async deleteEventImage(eventImageId) {
    return this.deleteImage(eventImageId, "event");
  }
}

export const eventGalleryService = new EventGalleryService();
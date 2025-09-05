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

  async   uploadHighlights(files, caption = "", startingDisplayOrder = 0) {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("Files", file);
    });

    formData.append("Caption", caption);
    formData.append("StartingDisplayOrder", startingDisplayOrder.toString());

    const response = await fetch(
      `${this.apiUrl}/api/admin/images/upload-highlights`,
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

    // Transform response and filter out any uploads without valid S3 keys
    const uploadedPhotos =
      result.successfulUploads?.map((upload, index) => ({
        id:
          upload.image?.imageId ||
          upload.highlight?.imageId ||
          Date.now() + index,
        highlightId: upload.highlight?.highlightId,
        imageId: upload.image?.imageId,
        // Use the proxy endpoint for uploaded images
        url: this.getImageUrl(upload.image?.s3Key),
        caption:
          upload.image?.caption || caption || files[index].name.split(".")[0],
        uploadDate:
          upload.image?.uploadedAt ||
          upload.image?.uploadDate ||
          upload.image?.createdAt ||
          new Date().toISOString(),
        originalName: files[index].name,
        size: files[index].size,
        type: files[index].type,
        isHighlight: true,
        displayOrder:
          upload.highlight?.displayOrder || startingDisplayOrder + index,
        fileName: upload.image?.fileName,
        width: upload.image?.width,
        height: upload.image?.height,
        s3Key: upload.image?.s3Key,
      })).filter(photo => photo.s3Key) || []; // Filter out photos without S3 keys

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
    if (type === "highlight") {
      endpoint = `${this.apiUrl}/api/highlights/${id}`;
    } else {
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
  }

  async uploadEventImages(files, eventTitle) {
    let eventGalleryId = null;
    
    return fetch(`${this.apiUrl}/api/Event-Gallery/info`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: eventTitle,
        isPublished: false
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to create event gallery");
      }
      return response.json();
    })
    .then(eventResult => {
      eventGalleryId = eventResult.eventGalleryId;
      
      // Upload images sequentially
      const uploadPromises = files.map((file, index) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("caption", file.name.split(".")[0]);

        return fetch(`${this.apiUrl}/api/admin/images/upload`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: formData,
        })
        .then(uploadResponse => {
          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }
          return uploadResponse.json();
        })
        .then(uploadResult => ({
          imageId: uploadResult.imageId,
          s3Key: uploadResult.s3Key,
          file: file,
          index: index
        }));
      });

      return Promise.all(uploadPromises);
    })
    .then(uploadedImages => {
      // Associate images with event gallery
      const associatePromises = uploadedImages.map((image, index) => {
        return fetch(`${this.apiUrl}/api/Event-Gallery/${eventGalleryId}/images`, {
          method: "POST",
          headers: {
            ...this.getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageId: image.imageId,
            displayOrder: index
          })
        })
        .then(associateResponse => {
          if (!associateResponse.ok) {
            throw new Error(`Failed to associate image with event`);
          }
          return image;
        });
      });

      return Promise.all(associatePromises);
    })
    .then(associatedImages => {
      // Create photos array for UI
      const photos = associatedImages.map((image) => ({
        id: image.imageId,
        url: this.getImageUrl(image.s3Key),
        caption: image.file.name.split(".")[0],
        uploadDate: new Date().toISOString(),
        originalName: image.file.name,
        size: image.file.size,
        type: image.file.type,
        s3Key: image.s3Key,
      }));

      return {
        eventGalleryId,
        photos,
        eventTitle
      };
    })
    .catch(error => {
      // Cleanup event if created but images failed
      if (eventGalleryId) {
        fetch(`${this.apiUrl}/api/Event-Gallery/${eventGalleryId}`, {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }).catch(deleteError => {
          console.error('Failed to cleanup event after error:', deleteError);
        });
      }
      
      throw error;
    });
  }

  // Add new delete methods for event galleries
  async deleteEventGallery(eventId, deleteImages = true) {
    return fetch(`${this.apiUrl}/api/Event-Gallery/${eventId}?deleteImages=${deleteImages}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to delete event gallery");
      }
      return true;
    });
  }

  async deleteImageFromEventGallery(galleryId, eventImageId) {
    return fetch(`${this.apiUrl}/api/Event-Gallery/${galleryId}/images/${eventImageId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to delete image from gallery");
      }
      return true;
    });
  }
}

export const galleryService = new GalleryService();

// src/Services/BaseGalleryService.js
import { apiService } from './ApiService.js';

class BaseGalleryService {
  constructor() {
    this.apiUrl = apiService.getBaseUrl();
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

  // Helper function for image URLs
  getImageUrl(s3Key, width = null, height = null) {
    if (!s3Key || s3Key.trim() === '') {
      return null;
    }
    
    let url = `${this.apiUrl}/api/public/images/images/${s3Key}`;
    
    if (width && height) {
      url += `?width=${width}&height=${height}`;
    }
    
    return url;
  }

  // Alternative method for direct image access
  getDirectImageUrl(s3Key) {
    if (!s3Key || s3Key.trim() === '') {
      return null;
    }
    return `${this.apiUrl}/api/public/images/images/${s3Key}`;
  }

  // Legacy support for normalizing image URLs
  normalizeImageUrl(imageUrl) {
    if (!imageUrl || imageUrl.trim() === '') {
      return null;
    }

    // If it's already a complete URL, return as-is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // If it's an S3 key, use the proxy endpoint
    return this.getImageUrl(imageUrl);
  }

  // Generic delete method for images
  async deleteImage(id, type = "image") {
    let endpoint;
    
    switch (type) {
      case "highlight":
        endpoint = `${this.apiUrl}/api/highlights/${id}`;
        break;
      case "event":
        endpoint = `${this.apiUrl}/api/admin/events/images/${id}`;
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
        .catch(() => ({ message: "Failed to delete image" }));
      throw new Error(errorData.message || "Failed to delete image");
    }

    return true;
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
  async preloadImages(items) {
    const preloadPromises = items.map(item => 
      this.preloadImage(item.s3Key).catch(() => null)
    );
    return Promise.allSettled(preloadPromises);
  }

  // Generic upload helper
  async uploadToController(endpoint, files, options = {}) {
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    // Add additional options to form data
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Upload failed" }));
      throw new Error(errorData.message || "Upload failed");
    }

    return response.json();
  }
}

export default BaseGalleryService;
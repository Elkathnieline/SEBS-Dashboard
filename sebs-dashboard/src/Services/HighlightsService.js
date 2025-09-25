// src/Services/HighlightsService.js
import BaseGalleryService from './BaseGalleryService.js';

class HighlightsService extends BaseGalleryService {
  constructor() {
    super();
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
        url: highlight.imageUrl ? `${this.apiUrl}${highlight.imageUrl}` : null,
        caption: highlight.image?.caption || "",
        uploadDate: highlight.image?.uploadedAt || new Date().toISOString(),
        displayOrder: highlight.displayOrder,
        isHighlight: true,
        originalName: highlight.image?.fileName,
        width: highlight.image?.width,
        height: highlight.image?.height,
        type: highlight.image?.contentType,
        s3Key: highlight.imageUrl ? highlight.imageUrl.split('/').pop() : null,
      }))
      .filter(highlight => highlight.url)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

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

    const highlightsData = await response.json();

    return highlightsData
      .map((highlight) => ({
        id: highlight.imageId,
        highlightId: highlight.highlightId,
        imageId: highlight.imageId,
        url: this.getImageUrl(highlight.s3Key),
        caption: highlight.caption || "",
        uploadDate: highlight.uploadedAt || new Date().toISOString(),
        displayOrder: highlight.displayOrder,
        isHighlight: true,
        originalName: highlight.fileName,
        width: highlight.width,
        height: highlight.height,
        type: highlight.contentType,
        s3Key: highlight.s3Key,
      }))
      .filter(highlight => highlight.s3Key)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async uploadHighlights(files, caption = "", startingDisplayOrder = 0) {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    formData.append("Caption", caption);
    formData.append("StartingDisplayOrder", startingDisplayOrder.toString());

    const response = await fetch(
      `${this.apiUrl}/api/highlights/upload`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to upload highlights" }));
      throw new Error(errorData.message || "Failed to upload highlights");
    }

    const result = await response.json();

    // Transform response to match expected format
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

  async deleteHighlight(highlightId) {
    return this.deleteImage(highlightId, "highlight");
  }
}

export const highlightsService = new HighlightsService();
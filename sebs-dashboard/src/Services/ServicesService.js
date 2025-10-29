import { apiService } from './ApiService.js';

class ServicesService {
  constructor() {
    this.apiUrl = apiService.getBaseUrl();
  }

  getAuthHeaders() {
    return apiService.getAuthHeaders();
  }

  async fetchServices() {
    const response = await fetch(`${this.apiUrl}/api/service`, {
      method: "GET",
      headers: this.getAuthHeaders(),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to fetch services");
    }

    return response.json();
  }

  async createService(formData) {
    const token = sessionStorage.getItem("backend-token");
    
    // FormData should already be created with proper field names (Name, Description, BasePrice, ImageFile)
    // Log the FormData contents for debugging
    console.log('Creating new service');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }
    
    const response = await fetch(`${this.apiUrl}/api/service`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, browser will set it with boundary
      },
      body: formData,
      credentials: "include"
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create failed:', response.status, errorText);
      throw new Error(`Failed to create service: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async updateService(id, serviceData) {
    const token = sessionStorage.getItem("backend-token");
    
    // Create FormData matching ServiceUpdateWithImageDTO
    const formData = new FormData();
    formData.append('Name', serviceData.name);
    formData.append('Description', serviceData.description);
    formData.append('BasePrice', serviceData.basePrice);
    
    // Only append image if a new file was selected
    if (serviceData.image && serviceData.image instanceof File) {
      formData.append('ImageFile', serviceData.image);
      // Optional caption for the image
      if (serviceData.caption) {
        formData.append('Caption', serviceData.caption);
      }
    } else if (serviceData.imageId) {
      // If keeping existing image, send the ImageId
      formData.append('ImageId', serviceData.imageId);
    }
    
    // Log the FormData contents for debugging
    console.log('Updating service with ID:', id);
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }
    
    const response = await fetch(`${this.apiUrl}/api/service/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - browser sets it with boundary
      },
      body: formData,
      credentials: "include"
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update failed:', response.status, errorText);
      throw new Error(`Failed to update service: ${response.status} ${errorText}`);
    }

    // 204 No Content returns empty body - check status before parsing JSON
    if (response.status === 204) {
      return { success: true, message: 'Service updated successfully' };
    }

    return response.json();
  }

  async deleteService(id) {
    const response = await fetch(`${this.apiUrl}/api/service/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Failed to delete service");
    }

    return true;
  }
}

export const servicesService = new ServicesService();
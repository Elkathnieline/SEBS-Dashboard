// src/Services/ApiService.js

class ApiService {
  constructor() {
    this.baseUrl = this.getApiUrl();
  }

  getApiUrl() {
    // Check if we're in production environment (multiple ways)
    const isProduction = import.meta.env.PROD || 
                        import.meta.env.VITE_ENVIRONMENT === 'production';
    
    if (isProduction) {
      // Use the API URL set in Vercel environment variables
      const prodUrl = import.meta.env.VITE_API_URL;
      if (!prodUrl) {
        console.error('VITE_API_URL not set in production environment');
        throw new Error('Production API URL not configured');
      }
      return prodUrl;
    } else {
      // Development environment - use local API
      return import.meta.env.VITE_DEV_API_URL || 'http://localhost:5139';
    }
  }

  // Get the base API URL
  getBaseUrl() {
    return this.baseUrl;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = sessionStorage.getItem("backend-token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Helper method for making authenticated requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      },
      credentials: "include"
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  // Helper method for making public requests (no auth)
  async makePublicRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }
}

// Export a singleton instance
export const apiService = new ApiService();
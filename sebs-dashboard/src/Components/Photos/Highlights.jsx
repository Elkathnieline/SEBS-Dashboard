import { useState } from 'react';
import { Star, Edit3, Trash2, Plus, Upload, AlertCircle } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import { useGallery } from '../../Hooks/useGallery.js';
import { galleryService } from '../../Services/GalleryService.js';

export default function Highlights({ highlights, onUploadHighlight, onRemoveHighlight, onPreviewPhoto, isLoading = false }) {
  const { isDarkTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  
  const { 
    isUploading, 
    error, 
    uploadHighlights, 
    clearError 
  } = useGallery();

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Check if we have space for new highlights
    const availableSlots = 10 - highlights.length;
    const filesToUpload = files.slice(0, availableSlots);
    
    if (filesToUpload.length < files.length) {
      alert(`Only uploading ${filesToUpload.length} files due to highlight limit of 10.`);
    }
    
    // Use the bulk upload endpoint
    const result = await uploadHighlights(
      filesToUpload, 
      '', // No specific caption - will use filename
      highlights.length // Starting display order
    );
    
    if (result.success) {
      // Add all successfully uploaded photos
      result.photos.forEach(photo => {
        onUploadHighlight(photo);
      });
      
      // Show any errors that occurred
      if (result.errors && result.errors.length > 0) {
        alert(`Some uploads failed:\n${result.errors.join('\n')}`);
      }
    }
    
    e.target.value = ''; // Reset input
  };

  // Helper function to get optimized image URL with proper fallback
  const getOptimizedImageUrl = (photo, width = 150, height = 150) => {
    if (!photo) return null;
    
    // If we have a direct URL from the API, use it
    if (photo.url && photo.url.trim() !== '') {
      return photo.url;
    }
    
    // Try S3 key as fallback (for newly uploaded images)
    if (photo.s3Key) {
      return galleryService.getImageUrl(photo.s3Key, width, height);
    }
    
    // Return null to prevent rendering img with empty src
    return null;
  };

  // Component to handle image rendering with proper error handling
  const SafeImage = ({ photo, className, onClick, alt }) => {
    // Use smaller thumbnails for highlights grid (150x96 as suggested in docs)
    const imageUrl = getOptimizedImageUrl(photo, 150, 96);
    
    if (!imageUrl) {
      // Render placeholder when no valid image URL is available
      return (
        <div 
          className={`${className} bg-gray-200 flex items-center justify-center cursor-pointer`}
          onClick={onClick}
        >
          <Star size={24} className="text-gray-400" />
        </div>
      );
    }
    
    return (
      <img
        src={imageUrl}
        alt={alt || photo.caption || 'Highlight'}
        className={className}
        onClick={onClick}
        loading="lazy" // Add lazy loading for better performance
        onError={(e) => {
          // Handle image load errors gracefully
          console.warn('Failed to load image:', imageUrl);
          const placeholder = document.createElement('div');
          placeholder.className = `${className} bg-gray-200 flex items-center justify-center cursor-pointer`;
          placeholder.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-gray-400"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
          placeholder.onclick = onClick;
          e.target.parentElement.replaceChild(placeholder, e.target);
        }}
      />
    );
  };

  return (
    <div className={`card shadow-lg h-full ${
      isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
    }`}>
      <div className="card-body h-full flex flex-col">
        {/* Error Display */}
        {error && (
          <div className={`alert alert-error mb-4 ${
            isDarkTheme ? 'bg-red-900 border-red-700 text-red-100' : ''
          }`}>
            <AlertCircle size={16} />
            <span>{error}</span>
            <button 
              type="button"
              onClick={clearError}
              className="btn btn-sm btn-ghost"
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Progress for bulk uploads */}
        {isUploading && (
          <div className={`mb-4 p-3 rounded-lg ${
            isDarkTheme ? 'bg-gray-700' : 'bg-base-200'
          }`}>
            <div className="flex justify-between text-sm mb-2">
              <span className={isDarkTheme ? 'text-gray-300' : 'text-base-content'}>
                Uploading highlights...
              </span>
            </div>
            <div className="loading loading-bars loading-sm"></div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Star size={24} className="text-yellow-500" />
            <div>
              <h2 className={`text-xl font-bold ${
                isDarkTheme ? 'text-white' : 'text-base-content'
              }`}>
                Highlights
              </h2>
              <p className={`text-sm ${
                isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
              }`}>
                Showcase your best photos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`badge ${
              isDarkTheme ? 'badge-outline' : 'badge-primary'
            }`}>
              {highlights.length}/10
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`btn btn-sm ${isEditing ? 'btn-primary' : 'btn-outline'}`}
              disabled={isLoading}
            >
              <Edit3 size={14} />
              {isEditing ? 'Done' : 'Edit'}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className={`text-center h-full flex flex-col justify-center ${
              isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
            }`}>
              <div className="loading loading-spinner loading-lg mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Loading highlights...</h3>
              <p>Fetching your saved highlights</p>
            </div>
          ) : highlights.length === 0 ? (
            <div className={`text-center h-full flex flex-col justify-center ${
              isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
            }`}>
              <Star size={64} className="mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No highlights yet</h3>
              <p className="mb-6">Upload photos to showcase your best moments</p>
              <label className="btn btn-primary">
                <Upload size={16} />
                {isUploading ? 'Uploading...' : 'Upload Highlights'}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={highlights.length >= 10 || isUploading}
                />
              </label>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4 flex-1 content-start">
                {highlights.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group cursor-pointer"
                  >
                    <div className={`rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      isDarkTheme 
                        ? 'border-gray-600 hover:border-yellow-500' 
                        : 'border-base-300 hover:border-yellow-500'
                    }`}>
                      <SafeImage
                        photo={photo}
                        className="w-full h-24 object-cover"
                        onClick={() => onPreviewPhoto(photo)}
                        alt={photo.caption || 'Highlight'}
                      />
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => onRemoveHighlight(photo.id)}
                        className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Add more button */}
                {highlights.length < 10 && (
                  <label className={`flex items-center justify-center rounded-lg border-2 border-dashed h-24 cursor-pointer transition-colors ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isDarkTheme 
                      ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300' 
                      : 'border-base-300 hover:border-primary text-base-content/40 hover:text-primary'
                  }`}>
                    <Plus size={24} />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-center flex-shrink-0">
                  <label className="btn btn-outline btn-sm">
                    <Upload size={14} />
                    {isUploading ? 'Uploading...' : 'Add More'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={highlights.length >= 10 || isUploading}
                    />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
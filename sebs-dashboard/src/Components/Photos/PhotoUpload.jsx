import { useState } from 'react';
import { Upload, Calendar, Image, AlertCircle } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import { useGallery } from '../../Hooks/useGallery.js';

export default function PhotoUpload({ onUpload, onEventUpload }) {
  const { isDarkTheme } = useTheme();
  const [eventTitle, setEventTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const { 
    isUploading, 
    uploadProgress, 
    error, 
    uploadEventImages, // Use new method instead of uploadImages
    clearError,
    resetUpload 
  } = useGallery();

  // All uploads create events (even single photos)
  const requiresTitle = selectedFiles.length > 0;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Auto-generate title based on file count and date
    if (files.length > 0 && !eventTitle.trim()) {
      const today = new Date().toLocaleDateString();
      if (files.length === 1) {
        setEventTitle(`Photo - ${today}`);
      } else {
        setEventTitle(`Event - ${today}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || !eventTitle.trim()) return;

    clearError();
    
    const result = await uploadEventImages(selectedFiles, eventTitle);
    
    if (result.success) {
      onEventUpload(result.event);
      resetForm();
    }
    // Error handling is managed by the hook
  };

  const resetForm = () => {
    setEventTitle('');
    setSelectedFiles([]);
    resetUpload(); // Reset upload state from hook
    // Reset file input
    const fileInput = document.querySelector('#photo-upload-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className={`card shadow-lg h-full ${
      isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
    }`}>
      <div className="card-body h-full flex flex-col">
        <div className="flex items-center gap-2 mb-6 flex-shrink-0">
          <Calendar size={20} className="text-primary" />
          <div>
            <h2 className={`card-title ${
              isDarkTheme ? 'text-white' : 'text-base-content'
            }`}>
              Create Event
            </h2>
            <p className={`text-sm ${
              isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
            }`}>
              {selectedFiles.length === 1 ? 'Single photo event' : selectedFiles.length > 1 ? `${selectedFiles.length} photos event` : 'Upload photos as event'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
          {/* Error Display */}
          {error && (
            <div className={`alert alert-error ${
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

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={isDarkTheme ? 'text-gray-300' : 'text-base-content'}>
                  Uploading photos...
                </span>
                <span className={isDarkTheme ? 'text-gray-300' : 'text-base-content'}>
                  {uploadProgress}%
                </span>
              </div>
              <progress 
                className="progress progress-primary w-full" 
                value={uploadProgress} 
                max="100"
              ></progress>
            </div>
          )}

          {/* Event Title - Always required */}
          <div className="form-control">
            <label className="label">
              <span className={`label-text ${
                isDarkTheme ? 'text-gray-300' : 'text-base-content'
              }`}>
                Event Title *
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g., Birthday Party, Nature Walk, Family Dinner"
              className={`input input-bordered ${
                isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : ''
              }`}
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              required
            />
          </div>

          {/* File Upload */}
          <div className="form-control flex-1">
            <label className="label">
              <span className={`label-text ${
                isDarkTheme ? 'text-gray-300' : 'text-base-content'
              }`}>
                Select Photos
              </span>
            </label>
            <input
              id="photo-upload-input"
              type="file"
              multiple
              accept="image/*"
              className={`file-input file-input-bordered ${
                isDarkTheme ? 'bg-gray-700 border-gray-600' : ''
              }`}
              onChange={handleFileSelect}
              required
            />
            
            {selectedFiles.length > 0 && (
              <div className="label">
                <span className="label-text-alt text-primary">
                  {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''} selected
                  <span className="ml-2 badge badge-primary badge-sm">
                    Event Mode
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Preview Grid */}
          {selectedFiles.length > 0 && (
            <div className="form-control">
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {selectedFiles.slice(0, 4).map((file, index) => (
                  <div
                    key={index}
                    className={`relative rounded-lg overflow-hidden border ${
                      isDarkTheme ? 'border-gray-600' : 'border-base-300'
                    }`}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-16 object-cover"
                    />
                    {selectedFiles.length > 4 && index === 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          +{selectedFiles.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || selectedFiles.length === 0 || !eventTitle.trim()}
            className={`btn btn-primary w-full mt-auto flex-shrink-0 ${isUploading ? 'loading' : ''}`}
          >
            {isUploading ? (
              `Uploading... (${uploadProgress}%)`
            ) : (
              <>
                <Calendar size={16} />
                Upload Event ({selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''})
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
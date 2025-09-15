import { useState, useRef } from 'react';
import { Calendar, Trash2, Edit3, Check, X, Upload, Eye, Plus } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import { useGallery } from '../../Hooks/useGallery.js';

export default function EventAlbums({ events, onPreviewPhoto, onDeletePhoto, onDeleteEvent, onPublishEvent, onAddPhotos }) {
  const { isDarkTheme } = useTheme();
  const [editingEventId, setEditingEventId] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [uploadingToGallery, setUploadingToGallery] = useState(null);
  const fileInputRefs = useRef({});
  
  // Get functions from hook for proper error handling
  const { removeImageFromGallery, uploadToExistingGallery } = useGallery();

  if (events.length === 0) {
    return (
      <div className={`text-center py-8 ${
        isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
      }`}>
        <Calendar size={48} className="mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-semibold mb-2">No event galleries yet</h3>
        <p>Upload photos to create your first event gallery</p>
      </div>
    );
  }

  const handleAddPhotosToGallery = async (galleryId, files) => {
    if (!files || files.length === 0) return;

    setUploadingToGallery(galleryId);

    // Get current photo count for display order
    const event = events.find(e => e.id === galleryId);
    const startingDisplayOrder = event?.photos.length || 0;

    const result = await uploadToExistingGallery(
      galleryId, 
      files, 
      "Additional event photos", 
      startingDisplayOrder
    );

    if (result.success && result.photos.length > 0) {
      // Add new photos to the event
      onAddPhotos(galleryId, result.photos);
      
      // Show success message
      console.log(`${result.successCount} photos added to gallery`);
      
      // Show errors if any
      if (result.errors && result.errors.length > 0) {
        console.warn('Some uploads failed:', result.errors);
      }
    }

    setUploadingToGallery(null);
    
    // Reset file input
    if (fileInputRefs.current[galleryId]) {
      fileInputRefs.current[galleryId].value = '';
    }
  };

  const handleFileInputChange = (galleryId, e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleAddPhotosToGallery(galleryId, files);
    }
  };

  const handleDeletePhoto = async (eventId, photoId, photoTitle, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${photoTitle}"?`)) {
      const event = events.find(e => e.id === eventId);
      const photo = event?.photos.find(p => p.id === photoId);
      
      if (photo?.eventImageId) {
        const result = await removeImageFromGallery(eventId, photo.eventImageId);
        
        if (result.success) {
          onDeletePhoto(eventId, photoId);
          const newSelected = new Set(selectedPhotos);
          newSelected.delete(photoId);
          setSelectedPhotos(newSelected);
        }
      } else {
        onDeletePhoto(eventId, photoId);
      }
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle, photoCount, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the entire "${eventTitle}" event? This will remove all ${photoCount} photos.`)) {
      const event = events.find(e => e.id === eventId);
      if (event) {
        const deletePromises = event.photos.map(photo => 
          removeImageFromGallery(eventId, photo.eventImageId)
        );
        
        try {
          await Promise.all(deletePromises);
          onDeleteEvent(eventId);
          setEditingEventId(null);
          setSelectedPhotos(new Set());
        } catch (error) {
          console.error('Error deleting event photos:', error);
          alert('Some photos could not be deleted. Please try again.');
        }
      }
    }
  };

  const handlePublishEvent = (eventId, eventTitle, e) => {
    e.stopPropagation();
    if (window.confirm(`Publish "${eventTitle}" to the frontend? It will be visible to all users.`)) {
      onPublishEvent(eventId);
    }
  };

  const handleBulkDeletePhotos = async (eventId, photoIds, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${photoIds.length} selected photos?`)) {
      const event = events.find(e => e.id === eventId);
      
      const deletePromises = photoIds.map(photoId => {
        const photo = event?.photos.find(p => p.id === photoId);
        
        if (photo?.eventImageId) {
          return removeImageFromGallery(eventId, photo.eventImageId)
            .then(result => {
              if (result.success) {
                onDeletePhoto(eventId, photoId);
              }
              return result;
            });
        } else {
          onDeletePhoto(eventId, photoId);
          return Promise.resolve({ success: true });
        }
      });
      
      try {
        await Promise.all(deletePromises);
        setSelectedPhotos(new Set());
      } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('Some photos could not be deleted. Please try again.');
      }
    }
  };

  const togglePhotoSelection = (photoId, e) => {
    e.stopPropagation();
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const toggleEditMode = (eventId) => {
    if (editingEventId === eventId) {
      setEditingEventId(null);
      setSelectedPhotos(new Set());
    } else {
      setEditingEventId(eventId);
      setSelectedPhotos(new Set());
    }
  };

  const selectAllPhotos = (eventPhotos, e) => {
    e.stopPropagation();
    const allPhotoIds = eventPhotos.map(photo => photo.id);
    setSelectedPhotos(new Set(allPhotoIds));
  };

  const deselectAllPhotos = (e) => {
    e.stopPropagation();
    setSelectedPhotos(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar size={20} className="text-secondary" />
        <h2 className={`text-xl font-bold ${
          isDarkTheme ? 'text-white' : 'text-base-content'
        }`}>
          Event Albums
        </h2>
        <div className="badge badge-secondary">
          {events.length} album{events.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-4">
        {events.map((event) => {
          const isEditing = editingEventId === event.id;
          const selectedCount = event.photos.filter(photo => selectedPhotos.has(photo.id)).length;
          const isPublished = event.isPublished || event.status === 'published';
          const isUploading = uploadingToGallery === event.id;
          
          return (
            <div key={event.id} className={`card shadow-lg ${
              isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
            }`}>
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-lg font-semibold ${
                      isDarkTheme ? 'text-white' : 'text-base-content'
                    }`}>
                      {event.title}
                    </h3>
                    <div className={`badge ${isPublished ? 'badge-success' : 'badge-warning'}`}>
                      {isPublished ? 'Published' : 'Draft'}
                    </div>
                    {isUploading && (
                      <div className="badge badge-info">
                        Uploading...
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="badge badge-secondary">
                      {event.photos.length} photo{event.photos.length !== 1 ? 's' : ''}
                    </div>
                    {isEditing && selectedCount > 0 && (
                      <div className="badge badge-primary">
                        {selectedCount} selected
                      </div>
                    )}
                    
                    {/* Add Photos Button - Available for both published and unpublished events */}
                    <label className={`btn btn-xs btn-primary ${isUploading ? 'loading' : ''}`}>
                      <Plus size={12} />
                      {isUploading ? 'Adding...' : 'Add Photos'}
                      <input
                        ref={(el) => {
                          if (el) fileInputRefs.current[event.id] = el;
                        }}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileInputChange(event.id, e)}
                        disabled={isUploading}
                      />
                    </label>
                    
                    {/* Publish button only for unpublished events */}
                    {!isPublished && (
                      <button
                        onClick={(e) => handlePublishEvent(event.id, event.title, e)}
                        className="btn btn-sm btn-success"
                        title="Publish event to make it visible on the frontend"
                        disabled={isUploading}
                      >
                        <Upload size={14} />
                        Publish
                      </button>
                    )}
                    
                    <button
                      onClick={() => toggleEditMode(event.id)}
                      className={`btn btn-sm ${
                        isEditing ? 'btn-primary' : 'btn-outline'
                      }`}
                      disabled={isUploading}
                    >
                      <Edit3 size={14} />
                      {isEditing ? 'Done' : 'Edit'}
                    </button>
                  </div>
                </div>

                {/* Edit Controls - Still available in edit mode */}
                {isEditing && (
                  <div className={`flex flex-wrap items-center gap-2 mb-4 p-3 rounded-lg ${
                    isDarkTheme ? 'bg-gray-700' : 'bg-base-200'
                  }`}>
                    <div className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-base-content/70'}`}>
                      Edit mode: Select photos to delete or manage bulk actions
                    </div>
                    
                    <div className="divider divider-vertical mx-2"></div>
                    
                    <button
                      onClick={(e) => selectAllPhotos(event.photos, e)}
                      className="btn btn-xs btn-outline"
                      disabled={isUploading}
                    >
                      <Check size={12} />
                      Select All
                    </button>
                    <button
                      onClick={deselectAllPhotos}
                      className="btn btn-xs btn-outline"
                      disabled={selectedCount === 0 || isUploading}
                    >
                      <X size={12} />
                      Deselect All
                    </button>
                    {selectedCount > 0 && (
                      <button
                        onClick={(e) => handleBulkDeletePhotos(
                          event.id, 
                          event.photos.filter(photo => selectedPhotos.has(photo.id)).map(photo => photo.id),
                          e
                        )}
                        className="btn btn-xs btn-error"
                        disabled={isUploading}
                      >
                        <Trash2 size={12} />
                        Delete Selected ({selectedCount})
                      </button>
                    )}
                    <div className="divider divider-vertical mx-2"></div>
                    <button
                      onClick={(e) => handleDeleteEvent(event.id, event.title, event.photos.length, e)}
                      className="btn btn-xs btn-error btn-outline"
                      disabled={isUploading}
                    >
                      <Trash2 size={12} />
                      Delete Event
                    </button>
                  </div>
                )}
                
                {/* Info banner for published events */}
                {isPublished && !isEditing && (
                  <div className={`alert alert-info mb-4 ${
                    isDarkTheme ? 'bg-blue-900 border-blue-700 text-blue-100' : ''
                  }`}>
                    <div className="flex items-center gap-2">
                      <Eye size={16} />
                      <span className="text-sm">
                        This event is published and visible to users. You can still add more photos anytime!
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {event.photos.map((photo, index) => {
                    const isSelected = selectedPhotos.has(photo.id);
                    
                    return (
                      <div
                        key={photo.id}
                        className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                          isSelected
                            ? 'border-primary shadow-lg'
                            : isDarkTheme 
                              ? 'border-gray-600 hover:border-gray-500' 
                              : 'border-base-300 hover:border-primary'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={`${event.title} - ${index + 1}`}
                          className="w-full h-24 object-cover"
                          onClick={(e) => isEditing ? togglePhotoSelection(photo.id, e) : onPreviewPhoto(photo)}
                          loading="lazy"
                        />
                        
                        {/* Selection checkbox in edit mode */}
                        {isEditing && (
                          <div className="absolute top-1 left-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => togglePhotoSelection(photo.id, e)}
                              className="checkbox checkbox-primary checkbox-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                        
                        {/* Individual delete button - shows on hover when not in edit mode */}
                        {!isEditing && (
                          <button
                            onClick={(e) => handleDeletePhoto(
                              event.id, 
                              photo.id, 
                              photo.caption || `Photo ${index + 1}`, 
                              e
                            )}
                            className="absolute top-1 right-1 btn btn-xs btn-circle btn-error opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity"
                            title={`Delete ${photo.caption || `Photo ${index + 1}`}`}
                          >
                            <Trash2 size={10} />
                          </button>
                        )}

                        {/* Individual delete button in edit mode */}
                        {isEditing && (
                          <button
                            onClick={(e) => handleDeletePhoto(
                              event.id, 
                              photo.id, 
                              photo.caption || `Photo ${index + 1}`, 
                              e
                            )}
                            className="absolute top-1 right-1 btn btn-xs btn-circle btn-error opacity-70 hover:opacity-100 transition-opacity"
                            title={`Delete ${photo.caption || `Photo ${index + 1}`}`}
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
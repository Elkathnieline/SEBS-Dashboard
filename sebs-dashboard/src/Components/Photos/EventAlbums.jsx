import { useState } from 'react';
import { Calendar, Trash2, Edit3, Check, X, Upload, Eye } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';

export default function EventAlbums({ events, onPreviewPhoto, onDeletePhoto, onDeleteEvent, onPublishEvent }) {
  const { isDarkTheme } = useTheme();
  const [editingEventId, setEditingEventId] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());

  if (events.length === 0) return null;

  const handleDeletePhoto = (eventId, photoId, photoTitle, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${photoTitle}"?`)) {
      onDeletePhoto(eventId, photoId);
      // Remove from selected if it was selected
      const newSelected = new Set(selectedPhotos);
      newSelected.delete(photoId);
      setSelectedPhotos(newSelected);
    }
  };

  const handleDeleteEvent = (eventId, eventTitle, photoCount, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the entire "${eventTitle}" event? This will remove all ${photoCount} photos.`)) {
      onDeleteEvent(eventId);
      setEditingEventId(null);
      setSelectedPhotos(new Set());
    }
  };

  const handlePublishEvent = (eventId, eventTitle, e) => {
    e.stopPropagation();
    if (window.confirm(`Publish "${eventTitle}" to the frontend? It will be visible to all users.`)) {
      onPublishEvent(eventId);
    }
  };

  const handleBulkDeletePhotos = (eventId, photoIds, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${photoIds.length} selected photos?`)) {
      photoIds.forEach(photoId => onDeletePhoto(eventId, photoId));
      setSelectedPhotos(new Set());
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
      </div>
      
      <div className="space-y-4">
        {events.map((event) => {
          const isEditing = editingEventId === event.id;
          const selectedCount = event.photos.filter(photo => selectedPhotos.has(photo.id)).length;
          const isPublished = event.isPublished || event.status === 'published';
          
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
                    {!isPublished && (
                      <button
                        onClick={(e) => handlePublishEvent(event.id, event.title, e)}
                        className="btn btn-sm btn-success"
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
                    >
                      <Edit3 size={14} />
                      {isEditing ? 'Done' : 'Edit'}
                    </button>
                  </div>
                </div>

                {/* Edit Controls */}
                {isEditing && (
                  <div className={`flex flex-wrap items-center gap-2 mb-4 p-3 rounded-lg ${
                    isDarkTheme ? 'bg-gray-700' : 'bg-base-200'
                  }`}>
                    <button
                      onClick={(e) => selectAllPhotos(event.photos, e)}
                      className="btn btn-xs btn-outline"
                    >
                      <Check size={12} />
                      Select All
                    </button>
                    <button
                      onClick={deselectAllPhotos}
                      className="btn btn-xs btn-outline"
                      disabled={selectedCount === 0}
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
                      >
                        <Trash2 size={12} />
                        Delete Selected ({selectedCount})
                      </button>
                    )}
                    <div className="divider divider-vertical mx-2"></div>
                    <button
                      onClick={(e) => handleDeleteEvent(event.id, event.title, event.photos.length, e)}
                      className="btn btn-xs btn-error btn-outline"
                    >
                      <Trash2 size={12} />
                      Delete Event
                    </button>
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
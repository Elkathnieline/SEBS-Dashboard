import { useState } from 'react';
import { Camera } from 'lucide-react';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import PhotoUpload from '../Components/Photos/PhotoUpload.jsx';
import PhotoGallery from '../Components/Photos/PhotoGallery.jsx';
import PhotoPreview from '../Components/Photos/PhotoPreview.jsx';

export default function Gallery() {
  const { isDarkTheme } = useTheme();
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePhotoUpload = (newPhoto) => {
    setPhotos(prev => [newPhoto, ...prev]);
  };

  const handleDeletePhoto = (photoId) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const handlePreviewPhoto = (photo) => {
    setSelectedPhoto(photo);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedPhoto(null);
  };

  const handleUpdateCaption = (photoId, newCaption) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, caption: newCaption }
        : photo
    ));
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkTheme ? 'bg-blue-600' : 'bg-primary'
          }`}>
            <Camera size={24} className="text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${
              isDarkTheme ? 'text-white' : 'text-base-content'
            }`}>
              Gallery
            </h1>
            <p className={`${
              isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
            }`}>
              Upload and manage your photos
            </p>
          </div>
        </div>

        {/* Photo Upload */}
        <PhotoUpload onUpload={handlePhotoUpload} />

        {/* Stats */}
        <div className={`stats shadow mb-6 ${
          isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-200'
        }`}>
          <div className="stat">
            <div className={`stat-title ${
              isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
            }`}>
              Total Photos
            </div>
            <div className="stat-value text-primary">{photos.length}</div>
          </div>
        </div>

        {/* Photo Gallery */}
        <PhotoGallery 
          photos={photos}
          onDeletePhoto={handleDeletePhoto}
          onPreviewPhoto={handlePreviewPhoto}
        />

        {/* Photo Preview Modal */}
        <PhotoPreview
          photo={selectedPhoto}
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          onUpdateCaption={handleUpdateCaption}
        />
      </div>
    </div>
  );
}

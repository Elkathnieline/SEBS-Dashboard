import { useTheme } from '../../Contexts/ThemeContext.jsx';
import PhotoCard from './PhotoCard.jsx';
import PropTypes from 'prop-types';

export default function PhotoGallery({ photos, onDeletePhoto, onPreviewPhoto }) {
  const { isDarkTheme } = useTheme();

  if (photos.length === 0) {
    return (
      <div className={`card shadow-lg ${
        isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-200'
      }`}>
        <div className="card-body text-center py-12">
          <h3 className={`text-lg font-medium mb-2 ${
            isDarkTheme ? 'text-gray-300' : 'text-base-content'
          }`}>
            No photos uploaded yet
          </h3>
          <p className={`${
            isDarkTheme ? 'text-gray-500' : 'text-base-content/60'
          }`}>
            Upload your first photo to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onDelete={onDeletePhoto}
          onPreview={onPreviewPhoto}
        />
      ))}
    </div>
  );
}

PhotoGallery.propTypes = {
  photos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  })).isRequired,
  onDeletePhoto: PropTypes.func.isRequired,
  onPreviewPhoto: PropTypes.func.isRequired,
};
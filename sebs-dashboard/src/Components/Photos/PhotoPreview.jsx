import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import PropTypes from 'prop-types';

export default function PhotoPreview({ photo, isOpen, onClose, onDeletePhoto }) {
  const { isDarkTheme } = useTheme();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      onDeletePhoto(photo.id);
      onClose(); // Close preview after deletion
    }
  };

  if (!isOpen || !photo) return null;

  return (
    <div className="modal modal-open">
      <div className={`modal-box w-11/12 max-w-4xl ${
        isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${
            isDarkTheme ? 'text-white' : 'text-base-content'
          }`}>
            Photo Preview
          </h3>
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-sm btn-error btn-outline gap-2"
              onClick={handleDelete}
              title="Delete photo"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <button 
              className={`btn btn-sm btn-circle ${
                isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              onClick={onClose}
              title="Close preview"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="mb-4">
          <img 
            src={photo.url} 
            alt={photo.caption || 'Photo preview'}
            className="w-full max-h-96 object-contain rounded-lg"
          />
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

PhotoPreview.propTypes = {
  photo: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    url: PropTypes.string.isRequired,
    caption: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDeletePhoto: PropTypes.func.isRequired,
};
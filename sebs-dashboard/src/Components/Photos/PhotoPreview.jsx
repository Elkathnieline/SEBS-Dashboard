import { useState } from 'react';
import { X, Edit2, Save, Calendar } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import PropTypes from 'prop-types';

export default function PhotoPreview({ photo, isOpen, onClose, onUpdateCaption }) {
  const { isDarkTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(photo?.caption || '');

  const handleSave = () => {
    onUpdateCaption(photo.id, editCaption);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditCaption(photo?.caption || '');
    setIsEditing(false);
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
          <button 
            className={`btn btn-sm btn-circle ${
              isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Image */}
        <div className="mb-4">
          <img 
            src={photo.url} 
            alt={photo.caption}
            className="w-full max-h-96 object-contain rounded-lg"
          />
        </div>

        {/* Caption Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={`text-md font-semibold ${
              isDarkTheme ? 'text-white' : 'text-base-content'
            }`}>
              Caption
            </h4>
            {!isEditing && (
              <button 
                className="btn btn-sm btn-outline gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={14} />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <textarea
                className={`textarea textarea-bordered w-full ${
                  isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-base-100'
                }`}
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                rows="3"
                placeholder="Enter photo caption..."
              />
              <div className="flex gap-2">
                <button 
                  className="btn btn-primary btn-sm gap-2"
                  onClick={handleSave}
                >
                  <Save size={14} />
                  Save
                </button>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className={`${
              isDarkTheme ? 'text-gray-300' : 'text-base-content'
            }`}>
              {photo.caption}
            </p>
          )}

          {/* Date */}
          <div className={`flex items-center gap-2 text-sm ${
            isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
          }`}>
            <Calendar size={16} />
            {new Date(photo.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

PhotoPreview.propTypes = {
  photo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdateCaption: PropTypes.func.isRequired,
};
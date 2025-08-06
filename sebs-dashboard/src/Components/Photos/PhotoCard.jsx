import { Calendar, Trash2, Eye } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import PropTypes from 'prop-types';

export default function PhotoCard({ photo, onDelete, onPreview }) {
  const { isDarkTheme } = useTheme();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      onDelete(photo.id);
    }
  };

  return (
    <div className={`card shadow-lg transition-all duration-300 hover:scale-105 ${
      isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-200'
    }`}>
      <figure className="relative">
        <img 
          src={photo.url} 
          alt={photo.caption}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={() => onPreview(photo)}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <button 
            className={`btn btn-sm btn-circle ${
              isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() => onPreview(photo)}
          >
            <Eye size={16} />
          </button>
          <button 
            className="btn btn-sm btn-circle btn-error"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </figure>
      <div className="card-body p-4">
        <h3 className={`text-sm font-medium ${
          isDarkTheme ? 'text-white' : 'text-base-content'
        }`}>
          {photo.caption}
        </h3>
        <div className={`flex items-center gap-2 text-xs ${
          isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
        }`}>
          <Calendar size={12} />
          {new Date(photo.date).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

PhotoCard.propTypes = {
  photo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
};
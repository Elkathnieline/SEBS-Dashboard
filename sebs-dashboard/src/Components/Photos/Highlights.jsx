import { useState } from 'react';
import { Star, Edit3, Trash2, Plus, Upload } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';

export default function Highlights({ highlights, onUploadHighlight, onRemoveHighlight, onPreviewPhoto }) {
  const { isDarkTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file, index) => {
      if (highlights.length + index < 10) {
        const newPhoto = {
          id: Date.now() + index,
          url: URL.createObjectURL(file),
          caption: file.name.split('.')[0],
          uploadDate: new Date().toISOString(),
          isHighlight: true
        };
        onUploadHighlight(newPhoto);
      }
    });
    e.target.value = ''; // Reset input
  };

  return (
    <div className={`card shadow-lg h-full ${
      isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
    }`}>
      <div className="card-body h-full flex flex-col">
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
            >
              <Edit3 size={14} />
              {isEditing ? 'Done' : 'Edit'}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {highlights.length === 0 ? (
            <div className={`text-center h-full flex flex-col justify-center ${
              isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
            }`}>
              <Star size={64} className="mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No highlights yet</h3>
              <p className="mb-6">Upload photos to showcase your best moments</p>
              <label className="btn btn-primary">
                <Upload size={16} />
                Upload Highlights
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={highlights.length >= 10}
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
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Highlight'}
                        className="w-full h-24 object-cover"
                        onClick={() => onPreviewPhoto(photo)}
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
                    />
                  </label>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-center flex-shrink-0">
                  <label className="btn btn-outline btn-sm">
                    <Upload size={14} />
                    Add More
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={highlights.length >= 10}
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
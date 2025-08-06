import { useState } from 'react';
import { Upload, Image } from 'lucide-react';
import { useTheme } from '../../Contexts/ThemeContext.jsx';
import PropTypes from 'prop-types';

export default function PhotoUpload({ onUpload }) {
  const { isDarkTheme } = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [caption, setCaption] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto = {
          id: Date.now().toString(),
          url: e.target.result,
          caption: caption || 'Untitled Photo',
          date: new Date().toISOString(),
          file: file
        };
        onUpload(newPhoto);
        setCaption('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('file-upload').click();
  };

  return (
    <div className={`card shadow-lg mb-6 w-[40vw] max-w-md mx-auto ${
      isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-base-100'
    }`}>
      <div className="card-body">
        <h2 className={`text-2xl font-bold mb-2 ${
          isDarkTheme ? 'text-white' : 'text-base-content'
        }`}>
          Gallery
        </h2>
        <p className={`mb-6 ${
          isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
        }`}>
          Upload Images
        </p>

        {/* Caption Input */}
        <div className="form-control mb-6">
          <input 
            type="text" 
            placeholder="Enter photo caption..."
            className={`input input-bordered ${
              isDarkTheme ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-base-100'
            }`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${
            dragActive 
              ? 'border-primary bg-primary/10 scale-105' 
              : isDarkTheme 
                ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          {/* Upload Icon - Smaller for compact design */}
          <div className={`mb-4 ${
            isDarkTheme ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Upload size={48} className="mx-auto" strokeWidth={1.5} />
          </div>

          {/* Upload Button */}
          <button 
            type="button"
            className="btn btn-primary btn-md px-6 py-2"
            onClick={triggerFileInput}
          >
            Upload
          </button>

          {/* Hidden file input */}
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            multiple={false}
          />
        </div>

        {/* Helper text */}
        <p className={`text-center text-xs mt-3 ${
          isDarkTheme ? 'text-gray-500' : 'text-base-content/60'
        }`}>
          Drag and drop images here or click upload button
        </p>
      </div>
    </div>
  );
}

PhotoUpload.propTypes = {
  onUpload: PropTypes.func.isRequired,
};
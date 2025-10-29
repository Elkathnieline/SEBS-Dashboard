import { useState, useEffect } from 'react';
import { useTheme } from '../Contexts/ThemeContext.jsx';
import { servicesService } from '../Services/ServicesService.js';
import { apiService } from '../Services/ApiService.js';

const Services = () => {
    const { isDarkTheme } = useTheme();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentService, setCurrentService] = useState({
        serviceID: null,
        name: '',
        description: '',
        basePrice: '',
        imageId: null,
        image: null
    });
    const [error, setError] = useState(null);

    // Helper function to get full image URL
    const getImageUrl = (service) => {
        if (!service.imageUrl) return null;
        // If imageUrl is already a full URL (starts with http), return as is
        if (service.imageUrl.startsWith('http')) {
            return service.imageUrl;
        }
        // Otherwise, prepend the API base URL
        return `${apiService.getBaseUrl()}${service.imageUrl}`;
    };

    // Fetch all services
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await servicesService.fetchServices();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
            setError('Failed to fetch services');
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentService({ ...currentService, [name]: value });
    };

    // Handle image upload
    const handleImageChange = (e) => {
        setCurrentService({ ...currentService, image: e.target.files[0] });
    };

    // Create or Update service
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editMode) {
                // For update, pass the service data object
                const serviceData = {
                    name: currentService.name,
                    description: currentService.description,
                    basePrice: currentService.basePrice,
                    image: currentService.image, // Will be null if no new image selected
                    imageId: currentService.imageId // Preserve existing image if no new one
                };
                await servicesService.updateService(currentService.serviceID, serviceData);
            } else {
                // For create, use FormData as before
                const formData = new FormData();
                formData.append('Name', currentService.name);
                formData.append('Description', currentService.description);
                formData.append('BasePrice', currentService.basePrice);
                
                if (currentService.image && currentService.image instanceof File) {
                    formData.append('ImageFile', currentService.image);
                }
                
                await servicesService.createService(formData);
            }
            await fetchServices();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving service:', error);
            setError('Failed to save service');
        } finally {
            setLoading(false);
        }
    };

    // Delete service
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            setLoading(true);
            setError(null);
            try {
                await servicesService.deleteService(id);
                await fetchServices();
            } catch (error) {
                console.error('Error deleting service:', error);
                setError('Failed to delete service');
            } finally {
                setLoading(false);
            }
        }
    };

    // Open modal for adding/editing
    const handleOpenModal = (service = null) => {
        if (service) {
            setEditMode(true);
            setCurrentService({
                serviceID: service.serviceID,
                name: service.name,
                description: service.description,
                basePrice: service.basePrice,
                imageId: service.imageId, // Store existing imageId
                image: null // Will be set if user selects new image
            });
        } else {
            setEditMode(false);
            setCurrentService({ 
                serviceID: null, 
                name: '', 
                description: '', 
                basePrice: '', 
                imageId: null,
                image: null 
            });
        }
        setShowModal(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentService({ 
            serviceID: null, 
            name: '', 
            description: '', 
            basePrice: '', 
            imageId: null,
            image: null 
        });
        setEditMode(false);
        setError(null);
    };

    return (
        <div className={`min-h-screen p-6 transition-colors duration-300 ${
            isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className={`text-3xl font-bold ${
                        isDarkTheme ? 'text-white' : 'text-base-content'
                    }`}>
                        Services Management
                    </h1>
                    <button
                        onClick={() => handleOpenModal()}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            isDarkTheme 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-primary hover:bg-primary/90 text-white'
                        }`}
                    >
                        Add Service
                    </button>
                </div>

                {error && (
                    <div className={`alert mb-4 ${
                        isDarkTheme ? 'alert-error' : 'alert-error'
                    }`}>
                        <span>{error}</span>
                    </div>
                )}

                {loading && services.length === 0 && (
                    <div className="text-center py-8">
                        <div className="loading loading-spinner loading-lg"></div>
                        <p className={`mt-4 ${
                            isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                        }`}>
                            Loading services...
                        </p>
                    </div>
                )}

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => {
                        const imageUrl = getImageUrl(service);
                        return (
                        <div key={service.serviceID} className={`rounded-lg p-4 shadow-md transition-colors ${
                            isDarkTheme ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                        }`}>
                            {imageUrl && (
                                <img
                                    src={imageUrl}
                                    alt={service.name}
                                    className="w-full h-48 object-cover rounded mb-4"
                                    onError={(e) => {
                                        console.error('Image failed to load:', imageUrl);
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                            <h3 className={`text-xl font-semibold mb-2 ${
                                isDarkTheme ? 'text-white' : 'text-base-content'
                            }`}>
                                {service.name}
                            </h3>
                            <p className={`mb-2 ${
                                isDarkTheme ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                {service.description}
                            </p>
                            <p className={`text-lg font-bold mb-4 ${
                                isDarkTheme ? 'text-white' : 'text-base-content'
                            }`}>
                                ${service.basePrice}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(service)}
                                    className="btn btn-warning btn-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(service.serviceID)}
                                    className="btn btn-error btn-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        );
                    })}
                </div>

                {services.length === 0 && !loading && (
                    <div className={`text-center py-12 ${
                        isDarkTheme ? 'text-gray-400' : 'text-base-content/60'
                    }`}>
                        <p className="text-xl mb-2">No services found</p>
                        <p>Click "Add Service" to create your first service</p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`rounded-lg p-6 w-full max-w-md ${
                            isDarkTheme ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            <h2 className={`text-2xl font-bold mb-4 ${
                                isDarkTheme ? 'text-white' : 'text-base-content'
                            }`}>
                                {editMode ? 'Edit Service' : 'Add Service'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className={`block mb-2 ${
                                        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={currentService.name}
                                        onChange={handleInputChange}
                                        className={`input input-bordered w-full ${
                                            isDarkTheme ? 'bg-gray-700 text-white' : ''
                                        }`}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className={`block mb-2 ${
                                        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={currentService.description}
                                        onChange={handleInputChange}
                                        className={`textarea textarea-bordered w-full ${
                                            isDarkTheme ? 'bg-gray-700 text-white' : ''
                                        }`}
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className={`block mb-2 ${
                                        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Base Price
                                    </label>
                                    <input
                                        type="number"
                                        name="basePrice"
                                        value={currentService.basePrice}
                                        onChange={handleInputChange}
                                        className={`input input-bordered w-full ${
                                            isDarkTheme ? 'bg-gray-700 text-white' : ''
                                        }`}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className={`block mb-2 ${
                                        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Image {editMode && currentService.imageId && '(Current image shown below)'}
                                    </label>
                                    {editMode && currentService.imageId && !currentService.image && (
                                        <div className="mb-3">
                                            <img 
                                                src={getImageUrl(services.find(s => s.serviceID === currentService.serviceID))}
                                                alt="Current service"
                                                className="w-full h-32 object-cover rounded border"
                                            />
                                            <p className={`text-xs mt-1 ${
                                                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                                Upload a new image to replace the current one, or leave empty to keep it
                                            </p>
                                        </div>
                                    )}
                                    {currentService.image && (
                                        <div className="mb-3">
                                            <img 
                                                src={URL.createObjectURL(currentService.image)}
                                                alt="New service preview"
                                                className="w-full h-32 object-cover rounded border"
                                            />
                                            <p className={`text-xs mt-1 ${
                                                isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                                New image preview
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={`file-input file-input-bordered w-full ${
                                            isDarkTheme ? 'bg-gray-700 text-white' : ''
                                        }`}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-1"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="btn btn-ghost flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;
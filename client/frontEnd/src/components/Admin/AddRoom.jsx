import React, { useState, useEffect } from 'react';
import { useBooking } from '../../context/useBooking';
import { useAuth } from '../../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import './AddRoom.css';

function AddRoom() {
    const { addRoom } = useBooking();
    const { isLoggedIn, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [capacity, setCapacity] = useState(1);
    const [description, setDescription] = useState('');
    const [amenities, setAmenities] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        } else if (isLoggedIn && !isAdmin) {
            navigate('/');
        }
    }, [isLoggedIn, isAdmin, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        setError('');
        
        // If there's an image, convert to base64
        let imageData = imagePreview;
        if (image && !imagePreview) {
            const reader = new FileReader();
            reader.onloadend = () => {
                submitRoom(reader.result);
            };
            reader.readAsDataURL(image);
        } else {
            submitRoom(imageData);
        }
    };

    const submitRoom = async (imageBase64) => {
        try {
            const roomData = {
                name: name,
                description: description,
                price: parseFloat(price),
                capacity: parseInt(capacity),
                image: imageBase64 || '',
                amenities: amenities
            };
            
            const result = await addRoom(roomData);
            
            if (result.success) {
                alert('Room added successfully!');
                // Reset form
                setName('');
                setPrice('');
                setCapacity(1);
                setDescription('');
                setAmenities('');
                setImage(null);
                setImagePreview('');
                navigate('/admin');
            } else {
                setError(result.message || 'Failed to add room');
            }
        } catch (err) {
            setError('An error occurred');
        }
        setLoading(false);
    };

return (
        <div className="add-room-page">
            {/* Header */}
            <div className="add-room-header">
                <div className="header-content">
                    <div className="header-icon">🏠</div>
                    <div className="header-text">
                        <h1>Add New Room</h1>
                        <p>Create a new room listing for your hotel</p>
                    </div>
                </div>
                <Link to="/admin" className="header-back-btn">
                    ← Back to Dashboard
                </Link>
            </div>

            {/* Quick Info Cards */}
            <div className="quick-info-grid">
                <div className="quick-info-card price">
                    <div className="quick-info-icon">💰</div>
                    <div className="quick-info-text">
                        <h4>Set Your Price</h4>
                        <p>Price per night in USD</p>
                    </div>
                </div>
                <div className="quick-info-card capacity">
                    <div className="quick-info-icon">👥</div>
                    <div className="quick-info-text">
                        <h4>Guest Capacity</h4>
                        <p>Maximum guests allowed</p>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="add-room-card">
                <div className="add-room-card-header">
                    <h2>Room Details</h2>
                    <p>Fill in the information about your new room</p>
                </div>
                
                <form onSubmit={handleSubmit} className="add-room-form">
                    {error && (
                        <div className="error-message">
                            <span className="error-message-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                Room Name <span className="required">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="form-input"
                                required
                                placeholder="e.g. Deluxe Suite"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price" className="form-label">
                                Price per Night <span className="required">*</span>
                            </label>
                            <input 
                                type="number" 
                                id="price" 
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)}
                                min="0"
                                step="0.01"
                                className="form-input"
                                required
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="capacity" className="form-label">
                                Guest Capacity <span className="required">*</span>
                            </label>
                            <select 
                                id="capacity"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                className="form-select"
                                required
                            >
                                <option value={1}>1 Person</option>
                                <option value={2}>2 Persons</option>
                                <option value={3}>3 Persons</option>
                                <option value={4}>4 Persons</option>
                                <option value={5}>5 Persons</option>
                                <option value={6}>6 Persons</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="amenities" className="form-label">
                                Amenities
                            </label>
                            <input 
                                type="text" 
                                id="amenities" 
                                value={amenities} 
                                onChange={(e) => setAmenities(e.target.value)}
                                className="form-input"
                                placeholder="e.g. WiFi, TV, AC, Mini Bar"
                            />
                            <p className="form-hint">Separate amenities with commas</p>
                        </div>
                    </div>

                    <div className="form-row single">
                        <div className="form-group">
                            <label htmlFor="description" className="form-label">
                                Description <span className="required">*</span>
                            </label>
                            <textarea 
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                className="form-textarea"
                                placeholder="Describe the room features, layout, and special amenities..."
                                required
                            />
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="image-upload-section">
                        <div className="form-group">
                            <label htmlFor="image" className="form-label">
                                Room Image
                            </label>
                            
                            {!imagePreview ? (
                                <div className="file-input-container">
                                    <input 
                                        type="file" 
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="form-file"
                                    />
                                    <p className="file-input-hint">Supported formats: PNG, JPG, GIF</p>
                                </div>
                            ) : (
                                <div className="image-preview-container">
                                    <div className="image-preview-card">
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Preview" />
                                        </div>
                                        <div className="image-preview-info">
                                            <h4>Image Selected</h4>
                                            <p>Room photo preview</p>
                                        </div>
                                        <button 
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={() => {
                                                setImage(null);
                                                setImagePreview('');
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <Link to="/admin" className="btn btn-cancel">
                            Cancel
                        </Link>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`btn btn-submit ${loading ? 'btn-loading' : ''}`}
                        >
                            {loading ? 'Adding Room...' : '➕ Add Room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddRoom;


import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/useBooking';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import '../styles/BookingForm.css';

function BookingForm() {
  const { rooms, createBooking } = useBooking();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const selectedRoom = location.state?.selectedRoom;
  
const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    checkinDate: '',
    checkinTime: '14:00',
    checkoutTime: '11:00',
    nights: 1,
    specialRequests: '',
    roomId: selectedRoom?.id || ''
  });
  
const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showDoubleBookNotification, setShowDoubleBookNotification] = useState(false);
  const [doubleBookMessage, setDoubleBookMessage] = useState('');

// Find room by ID, using the mapped fields from context
  const room = rooms.find(r => r.id == formData.roomId);
  
  // Also try to find by selectedRoom if room not yet selected
  const selectedRoomData = selectedRoom || rooms.find(r => r.id == formData.roomId);

  useEffect(() => {
    if (selectedRoom && rooms.length > 0) {
      setFormData(prev => ({ ...prev, roomId: String(selectedRoom.id) }));
    }
  }, [selectedRoom, rooms]);

  useEffect(() => {
    // Calculate price based on room and nights
    const roomPrice = room?.price || selectedRoomData?.price || 0;
    if (roomPrice > 0 && formData.nights > 0) {
      setTotalPrice(formData.nights * roomPrice);
    }
  }, [formData.roomId, formData.nights, room, selectedRoomData]);

const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.checkinDate) newErrors.checkinDate = 'Check-in date is required';
    if (!formData.roomId) newErrors.roomId = 'Please select a room';
    // Allow today or future dates (not past dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.checkinDate && new Date(formData.checkinDate) < today) {
      newErrors.checkinDate = 'Check-in date cannot be in the past';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleRoomSelect = (roomId) => {
    setFormData(prev => ({ ...prev, roomId }));
    setShowRoomDropdown(false);
  };
  
const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Send date only (database expects DATE type, not DATETIME)
    const checkIn = formData.checkinDate;
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + formData.nights);
    
const result = await createBooking({
      room_id: parseInt(formData.roomId),
      check_in: checkIn,
      check_out: checkOut.toISOString().split('T')[0],
      guests: 1,
      total_price: totalPrice
    });

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => navigate('/rooms'), 4000);
    } else {
      // Check for double booking or room not available error
      const errorMessage = result.message || '';
      if (errorMessage.includes('not available') || errorMessage.includes('double')) {
        setDoubleBookMessage(errorMessage);
        setShowDoubleBookNotification(true);
      } else {
        setErrors({ submit: result.message });
      }
    }
    setLoading(false);
  };

if (submitted) {
    const confirmedRoom = room || selectedRoomData;
    return (
      <div className="success-screen">
        <div className="success-content">
          <div className="success-icon"></div>
          <h1>Booking Confirmed!</h1>
          <p>Thank you, <strong>{formData.name}</strong>!</p>
          <div className="success-details">
            <strong>{confirmedRoom?.name || confirmedRoom?.type || 'Room'}</strong> | Room #{formData.roomId} | ${totalPrice.toLocaleString()}
          </div>
          <p>Redirecting to rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <header className="booking-header">
        <h1>Complete Your Booking</h1>
        <p>Fill out the details below - it only takes 2 minutes</p>
        
{selectedRoomData && (
          <div className="room-preview">
            <div className="room-icon"></div>
            <div className="room-info">
              <h2>{selectedRoomData.name || selectedRoomData.type || 'Room'}</h2>
              <p>Room #{selectedRoomData.id} • ${selectedRoomData.price}/night</p>
            </div>
          </div>
        )}
      </header>

<main className="booking-container">
        {showDoubleBookNotification && (
          <div className="double-booking-notification">
            <div className="notification-icon">⚠️</div>
            <div className="notification-content">
              <h3>Double Booking Detected!</h3>
              <p>{doubleBookMessage}. Please select different dates or a different room.</p>
            </div>
            <button 
              type="button" 
              className="dismiss-btn"
              onClick={() => setShowDoubleBookNotification(false)}
            >
              ×
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="booking-form">
          <section className="form-section">
            <h3> Guest Information</h3>
            <div className="form-grid">
              <div className="form-field">
                <input
                  id="guest-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                  required
                />
                <label htmlFor="guest-name">Full Name *</label>
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              
              <div className="form-field">
                <input
                  id="guest-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                  required
                />
                <label htmlFor="guest-email">Email Address *</label>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-field">
                <input
                  id="guest-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                <label htmlFor="guest-phone">Phone Number (optional)</label>
              </div>
            </div>
          </section>

<section className="form-section">
            <h3>Stay Details</h3>
            <div className="form-grid">
              <div className="form-field">
                <input
                  id="checkin-date"
                  type="date"
                  value={formData.checkinDate}
                  onChange={(e) => handleInputChange('checkinDate', e.target.value)}
                  className={errors.checkinDate ? 'error' : ''}
                  required
                />
                <label htmlFor="checkin-date">Check-in Date *</label>
                {errors.checkinDate && <span className="error-message">{errors.checkinDate}</span>}
              </div>
<div className="form-field">
                <input
                  id="checkin-time"
                  type="time"
                  value={formData.checkinTime}
                  onChange={(e) => handleInputChange('checkinTime', e.target.value)}
                  required
                />
                <label htmlFor="checkin-time">Check-in Time *</label>
              </div>
              <div className="form-field">
                <input
                  id="checkout-time"
                  type="time"
                  value={formData.checkoutTime}
                  onChange={(e) => handleInputChange('checkoutTime', e.target.value)}
                  required
                />
                <label htmlFor="checkout-time">Check-out Time *</label>
              </div>
              <div className="form-field">
                <select
                  id="nights"
                  value={formData.nights}
                  onChange={(e) => handleInputChange('nights', parseInt(e.target.value))}
                  required
                >
                  <option value={1}>1 Night</option>
                  <option value={2}>2 Nights</option>
                  <option value={3}>3 Nights</option>
                  <option value={4}>4 Nights</option>
                  <option value={5}>5 Nights</option>
                  <option value={7}>1 Week</option>
                  <option value={14}>2 Weeks</option>
                  <option value={30}>1 Month</option>
                </select>
                <label htmlFor="nights">Number of Nights *</label>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h3> Room Selection</h3>
            <div className="room-selector-container">
              <div 
                className={`room-selector ${room ? 'selected' : ''}`}
                onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                tabIndex="0"
                role="button"
              >
{room ? (
                  <>
                    <span className="room-checkmark">✓</span>
                    <span className="room-number">Room #{room.id}</span>
                    <span className="room-type">{room.name || room.type}</span>
                    <span className="room-price">${room.price}/night</span>
                  </>
                ) : (
                  <span className="room-placeholder">Click to select room</span>
                )}
              </div>
              
{showRoomDropdown && (
                <div className="room-dropdown">
                  {rooms.map((r) => (
                    <div
                      key={r.id}
                      className="room-option"
                      onClick={() => handleRoomSelect(String(r.id))}
                      role="button"
                      tabIndex="0"
                    >
                      <div className="room-visual"></div>
                      <div className="room-details">
                        <div className="room-number">Room #{r.id}</div>
                        <div className="room-type">{r.name || r.type}</div>
                        <div className="room-size">{r.size}</div>
                      </div>
                      <div className="room-price">${r.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.roomId && <span className="error-message">{errors.roomId}</span>}
          </section>

          <section className="form-section">
            <h3>Special Requests (Optional)</h3>
            <textarea
              id="special-requests"
              placeholder="Early check-in, late check-out, crib, dietary needs..."
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              rows="4"
            />
          </section>

          {room && (
            <div className="price-summary">
              <h3>Booking Summary</h3>
              <div className="price-total">${totalPrice.toLocaleString()}</div>
              <div className="price-breakdown">
                {formData.nights} nights × ${room.price}/night | Room #{room.id}
              </div>
            </div>
          )}

          <button type="submit" className={`submit-btn ${loading || !room ? 'disabled' : ''}`} disabled={loading || !room}>
            {loading ? ' Processing...' : `Book Now - $${totalPrice.toLocaleString()}`}
          </button>

          <div className="booking-info">
            <h4> Booking Information</h4>
            <ul>
              <li>Free cancellation</li>
              <li>Payment due at check-in</li>
              
            </ul>
          </div>
        </form>
        </main>
      </div>
    

  );
}

export default BookingForm;


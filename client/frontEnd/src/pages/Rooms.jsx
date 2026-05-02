import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/useBooking';
import { useAuth } from '../context/useAuth';
import '../styles/Rooms.css';

function Rooms() {
  const { rooms, loading } = useBooking();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleBook = (room) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/booking', { state: { selectedRoom: room } });
  };

  if (loading) {
    return (
      <div className="rooms-page">
        <div className="rooms-header">
          <h1 className="page-title">All Available Rooms</h1>
        </div>
        <div className="empty-state">
          <p>Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <h1 className="page-title">All Available Rooms</h1>
        <p className="page-subtitle">Choose from our comfortable and modern rooms designed for the perfect stay</p>
      </div>

      {rooms.length === 0 ? (
        <div className="empty-state">
          <h3>No Rooms Available</h3>
          <p>Check back later for our room offerings!</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room) => (
<article key={room.id} className="room-card">
              <div className="room-card-header">
                <span className="room-badge">{room.available !== false ? 'Available' : 'Unavailable'}</span>
                <img
                  src={room.image}
                  alt={room.name || room.type}
                  className="room-image"
                  onError={(e) => {
                    e.target.src = '/src/assets/room1.png';
                  }}
                />
                <div className="room-overlay"></div>
              </div>
              <div className="room-content">
                <h3 className="room-type">{room.name || room.type || 'Standard Room'}</h3>
                <div className="room-price">${room.price}</div>
                <div className="room-details">
                  <div className="room-size">{room.size || room.capacity || 'Standard'}</div>
                  <p>{room.description}</p>
                </div>
                <button
                  className="room-book-btn"
                  onClick={() => handleBook(room)}
                  disabled={room.available === false}
                >
                  {isLoggedIn ? (room.available !== false ? 'Book Now' : 'Not Available') : 'Login to Book'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Rooms;

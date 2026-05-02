import React from 'react';
import { useNavigate } from 'react-router-dom';
/* RoomCard.css consolidated into App.css */

function RoomCard({ rooms = [] }) {
  const navigate = useNavigate();

  const handleBook = (room) => {
    // Could set selected room in context here
    navigate('/booking', { state: { selectedRoom: room } });
  };

  return (
    <div className="rooms-container">
      {rooms.map((room) => (
        <article key={room.id} className="room-card">
          <img 
            src={room.image} 
            alt={room.type} 
            className="room-image"
          />
          <h3 className="room-type">{room.type}</h3>
          <div className="room-price">${room.price}</div>
          <div className="room-size">{room.size}</div>
          <p className="room-description">{room.description}</p>
          <button 
            className="room-book-btn"
            onClick={() => handleBook(room)}
          >
            Book Now
          </button>
        </article>
      ))}
    </div>
  );
}

export default RoomCard;

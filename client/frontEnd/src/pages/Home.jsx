import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/useBooking';
import { useAuth } from '../context/useAuth';
import '../styles/Home.css';

function Home() {
  const { rooms, loading, fetchBookings } = useBooking();
  const { isLoggedIn, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      loadRecentBookings();
    }
  }, [isLoggedIn, isAdmin]);

  const loadRecentBookings = async () => {
    await fetchBookings();
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.id) {
      try {
        const response = await fetch(`http://localhost:3007/api/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || userData.id}` }
        });
        const data = await response.json();
        if (data.bookings) {
          setRecentBookings(data.bookings.slice(0, 3));
        }
      } catch (error) {
        console.error('Error loading recent bookings:', error);
      }
    }
  };

  const handleBook = (room) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/booking', { state: { selectedRoom: room } });
  };

const getCheckInDisplay = (booking) => {
    if (!booking.check_in) return '';
    // Handle both date formats
    if (booking.check_in.includes('T')) {
      const date = new Date(booking.check_in);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return booking.check_in;
  };

  const getCheckOutDisplay = (booking) => {
    if (!booking.check_out) return '';
    // Handle both date formats
    if (booking.check_out.includes('T')) {
      const date = new Date(booking.check_out);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return booking.check_out;
  };

  const getCreatedAtDisplay = (booking) => {
    if (!booking.created_at) return '';
    const date = new Date(booking.created_at);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  const featuredRooms = rooms && rooms.length > 0 ? rooms.slice(0, 3) : [];

  return (
    <div>
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to HotelReserve</h1>
          <p className="hero-subtitle">Discover luxury, comfort, and exceptional service in our premium rooms. Your perfect stay awaits.</p>
          
          {!isLoggedIn ? (
            <div className="hero-buttons">
              <Link to="/register" className="hero-cta">Get Started</Link>
              <Link to="/rooms" className="hero-cta-outline">Explore Rooms</Link>
            </div>
          ) : (
            <Link to="/rooms" className="hero-cta">Explore Rooms</Link>
          )}
        </div>
      </div>
      
      {isLoggedIn && (
        <div className="user-welcome">
          <p>Welcome back, <strong>{user?.name}</strong>! {isAdmin ? 'You have admin access.' : 'Ready to book your next stay?'}</p>
        </div>
      )}
      
      {isLoggedIn && !isAdmin && recentBookings.length > 0 && (
        <section className="recent-section">
          <div className="section-wrapper">
            <h2 className="section-title">Your Recent Bookings</h2>
            <div className="recent-bookings-grid">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="recent-booking-card">
                  <div className="recent-booking-header">
                    <span className="recent-room-name">{booking.room_name || 'Room #' + booking.room_id}</span>
                    <span className={'recent-status status-' + booking.status}>{booking.status}</span>
                  </div>
<div className="recent-booking-dates">
                    <div className="date-time-row">
                      <span className="label">Check-in:</span>
                      <span className="value">{getCheckInDisplay(booking)}</span>
                    </div>
                    <div className="date-time-row">
                      <span className="label">Check-out:</span>
                      <span className="value">{getCheckOutDisplay(booking)}</span>
                    </div>
                    <div className="date-time-row">
                      <span className="label">Booked:</span>
                      <span className="value">{getCreatedAtDisplay(booking)}</span>
                    </div>
                  </div>
                  <div className="recent-booking-price">
                    ${booking.total_price}
                  </div>
                </div>
              ))}
            </div>
            <Link to="/rooms" className="recent-view-all">View All Bookings</Link>
          </div>
        </section>
      )}
      
      <section className="featured-section">
        <div className="section-wrapper">
          <h2 className="section-title">Featured Rooms</h2>
          {loading ? (
            <p>Loading...</p>
          ) : featuredRooms.length > 0 ? (
            <div className="featured-grid">
              {featuredRooms.map((room, index) => (
                <div key={room.id} className="featured-card">
                  <span className="featured-badge">Featured</span>
                  <div className="featured-image-wrapper">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="featured-image"
                      onError={(e) => {
                        e.target.src = '/src/assets/room1.png';
                      }}
                    />
                    <div className="featured-overlay"></div>
                  </div>
                  <div className="featured-content">
                    <h3 className="featured-type">{room.name || room.type || 'Standard Room'}</h3>
                    <div className="featured-price">${room.price}</div>
                    <div className="room-size">{room.size || room.capacity || 'Standard'}</div>
                    <p className="room-description">{room.description}</p>
                    <button
                      className="featured-cta"
                      onClick={() => handleBook(room)}
                    >
                      {isLoggedIn ? 'Book Now' : 'Login to Book'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No rooms available at the moment.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;

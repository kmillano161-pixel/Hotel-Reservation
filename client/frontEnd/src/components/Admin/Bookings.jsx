import React, { useEffect, useState } from 'react'
import { useBooking } from '../../context/useBooking'
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';

function Bookings() {
  const { bookings, fetchAllBookings, updateBookingStatus } = useBooking();
  const { isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    } else if (isLoggedIn && !isAdmin) {
      navigate('/');
    } else {
      loadBookings();
    }
  }, [isLoggedIn, isAdmin, navigate]);

  // Auto-refresh bookings every 30 seconds for real-time updates
  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      const interval = setInterval(() => {
        loadBookings();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, isAdmin]);

  const loadBookings = async () => {
    setLoading(true);
    await fetchAllBookings();
    setLoading(false);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    await updateBookingStatus(bookingId, newStatus);
    await loadBookings();
  };

  // Format date for display (e.g., "Jan 23, 2025")
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    // Handle ISO date format
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

// Get today's date for filtering
  const getTodayStr = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get current date for comparison
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];

  // Filter bookings for today (check-in date is today)
  const todayReservations = bookings.filter(booking => {
    let checkInDate = booking.check_in;
    if (checkInDate && checkInDate.includes('T')) {
      checkInDate = checkInDate.split('T')[0];
    }
    return checkInDate === todayStr && booking.status !== 'cancelled';
  });

  // Filter other bookings (not today's)
  const otherBookings = bookings.filter(booking => {
    let checkInDate = booking.check_in;
    if (checkInDate && checkInDate.includes('T')) {
      checkInDate = checkInDate.split('T')[0];
    }
    return checkInDate !== todayStr;
  });

  return (
    <div className="admin-page">
      {/* Today's Reservations Section */}
      {todayReservations.length > 0 && (
        <div className="admin-card today-reservations">
          <div className="admin-header">
            <h2>Today's Reservations</h2>
            <span className="today-badge">{todayReservations.length} for today</span>
          </div>
          <div className="admin-form">
            <ul className="booking-list today-list">
              {todayReservations.map((booking) => (
                <li key={booking.id} className="booking-item today-item">
                  <div className="booking-details">
                    <strong>{booking.user_name || 'Guest'}</strong>
                    <div className="booking-meta">
                      Room: {booking.room_name || 'Room #' + booking.room_id} | 
                      Check-in: {formatDate(booking.check_in)} | 
                      Check-out: {formatDate(booking.check_out)} |
                      Guests: {booking.guests}
                    </div>
                    <div className="booking-status">
                      Status: <span className={'status-' + booking.status}>{booking.status}</span>
                    </div>
                  </div>
                  <div className="booking-total">
                    ${booking.total_price}
                  </div>
                  {booking.status === 'pending' && (
                    <div className="booking-actions">
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        className="admin-btn-small"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                        className="admin-btn-small cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* All Bookings Section */}
      <div className="admin-card">
        <div className="admin-header">
          <h2>All Bookings</h2>
        </div>
        <div className="admin-form">
          {loading ? (
            <div className="empty-state">
              <p>Loading bookings...</p>
            </div>
          ) : otherBookings.length === 0 ? (
            <div className="empty-state">
              <p>No bookings available.</p>
            </div>
          ) : (
            <ul className="booking-list">
              {otherBookings.map((booking) => (
                <li key={booking.id} className="booking-item">
                  <div className="booking-details">
                    <strong>{booking.user_name || 'Guest'}</strong>
                    <div className="booking-meta">
                      Room: {booking.room_name || 'Room #' + booking.room_id} | 
                      Check-in: {formatDate(booking.check_in)} | 
                      Check-out: {formatDate(booking.check_out)} |
                      Guests: {booking.guests}
                    </div>
                    <div className="booking-status">
                      Status: <span className={'status-' + booking.status}>{booking.status}</span>
                    </div>
                  </div>
                  <div className="booking-total">
                    ${booking.total_price}
                  </div>
                  {booking.status === 'pending' && (
                    <div className="booking-actions">
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        className="admin-btn-small"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                        className="admin-btn-small cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Bookings;

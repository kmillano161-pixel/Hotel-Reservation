import React, { useEffect, useMemo, useState } from 'react';
import { useBooking } from '../context/useBooking';
import { useAuth } from '../context/useAuth';
import './MyBookings.css';

function MyBookings() {
  const { bookings, fetchBookings, cancelBooking } = useBooking();
  const { isLoggedIn, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      setLoading(true);
      setError('');
      try {
        await fetchBookings();
      } catch (e) {
        setError(e?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const sortedBookings = useMemo(() => {
    const copy = [...(bookings || [])];
    copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return copy;
  }, [bookings]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const s = String(dateStr);
    const date = s.includes('T') ? new Date(s) : new Date(s + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCancel = async (bookingId) => {
    const ok = window.confirm('Are you sure you want to cancel this booking?');
    if (!ok) return;
    setError('');
    const result = await cancelBooking(bookingId);
    if (!result?.success) {
      setError(result?.message || 'Failed to cancel booking');
    } else {
      // fetchBookings() is called inside cancelBooking
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="my-bookings-page">
        <div className="empty-state">Please login to view your bookings.</div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-header">
        <h1>My Bookings</h1>
        {user?.name && <p>Welcome, {user.name}</p>}
      </div>

      {error && (
        <div className="my-bookings-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <p>Loading your bookings...</p>
        </div>
      ) : sortedBookings.length === 0 ? (
        <div className="empty-state">
          <p>No bookings found.</p>
        </div>
      ) : (
        <div className="my-bookings-list">
          {sortedBookings.map((b) => {
            const status = b.status || 'unknown';
            const canCancel = status !== 'cancelled';
            return (
              <div key={b.id} className="my-booking-card">
                <div className="my-booking-main">
                  <div className="my-booking-title-row">
                    <div className="my-booking-room">
                      <strong>{b.room_name || `Room #${b.room_id}`}</strong>
                    </div>
                    <div className={`status-chip status-${status}`}> {status} </div>
                  </div>

                  <div className="my-booking-meta">
                    <div>
                      <span className="meta-label">Check-in:</span> {formatDate(b.check_in)}
                    </div>
                    <div>
                      <span className="meta-label">Check-out:</span> {formatDate(b.check_out)}
                    </div>
                    <div>
                      <span className="meta-label">Guests:</span> {b.guests ?? 1}
                    </div>
                  </div>

                  <div className="my-booking-price">
                    Total: <strong>${b.total_price}</strong>
                  </div>
                </div>

                <div className="my-booking-actions">
                  <button
                    type="button"
                    className={`cancel-btn ${canCancel ? '' : 'disabled'}`}
                    disabled={!canCancel}
                    onClick={() => handleCancel(b.id)}
                  >
                    Cancel booking
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBookings;


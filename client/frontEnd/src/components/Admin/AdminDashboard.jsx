import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useBooking } from '../../context/useBooking';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { bookings, rooms, fetchAllBookings, fetchRooms } = useBooking();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalEarnings: 0,
    recentBookings: []
  });
  
  const [loading, setLoading] = useState(true);
  
  const loadDashboardData = async () => {
    console.log('AdminDashboard: Starting to load data...');
    setLoading(true);
    try {
      await Promise.all([
        fetchAllBookings(),
        fetchRooms()
      ]);
      console.log('AdminDashboard: Data loaded successfully');
    } catch (error) {
      console.error('AdminDashboard: Error loading data:', error);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    loadDashboardData();
  }, []);

// Helper to format date for display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Second useEffect to update stats when bookings or rooms change
  useEffect(() => {
    console.log('AdminDashboard: Processing data - bookings:', bookings?.length, 'rooms:', rooms?.length);
    
    // Guard against undefined or empty data - wait for both to be loaded
    if (bookings === undefined || rooms === undefined) {
      console.log('AdminDashboard: Waiting for data to load...');
      return;
    }
    
    if (!bookings || bookings.length === 0) {
      console.log('AdminDashboard: No bookings found, using defaults');
      setStats({
        todayBookings: 0,
        totalRooms: rooms.length || 0,
        totalBookings: 0,
        totalEarnings: 0,
        recentBookings: []
      });
      return;
    }
    
    // Calculate today's date (format: YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    console.log('Today date:', today);
    
    // Filter bookings for today - extract date part from check_in if it's ISO format
    const todayBookings = bookings.filter(b => {
      let checkInDate = b.check_in;
      if (checkInDate && checkInDate.includes('T')) {
        checkInDate = checkInDate.split('T')[0];
      }
      return checkInDate === today && (b.status === 'pending' || b.status === 'confirmed');
    });
    console.log('Today bookings:', todayBookings.length);
    
    // Calculate total earnings - only confirmed/completed bookings
    const totalEarnings = bookings.reduce((sum, b) => {
      if (b.status === 'confirmed' || b.status === 'completed') {
        return sum + (parseFloat(b.total_price) || 0);
      }
      return sum;
    }, 0);
    console.log('Total earnings:', totalEarnings);
    
    // Sort bookings by created_at descending and get recent 5
    const sortedBookings = [...bookings].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    ).slice(0, 5);
    console.log('Recent bookings:', sortedBookings.length);
    
    setStats({
      todayBookings: todayBookings.length,
      totalRooms: rooms.length,
      totalBookings: bookings.length,
      totalEarnings: totalEarnings,
      recentBookings: sortedBookings
    });
    console.log('AdminDashboard: Stats updated:', stats);
  }, [bookings, rooms]);
  
  if (loading) {
    return (
      <div className="admin-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's your hotel overview.</p>
        </div>
        <button onClick={handleLogout} className="header-logout-btn">
          Logout
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card today">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>Today's Bookings</h3>
            <p className="stat-value">{stats.todayBookings}</p>
            <span className="stat-label">reservations today</span>
          </div>
        </div>
        
        <div className="stat-card rooms">
          <div className="stat-icon">🏠</div>
          <div className="stat-info">
            <h3>Total Rooms</h3>
            <p className="stat-value">{stats.totalRooms}</p>
            <span className="stat-label">available rooms</span>
          </div>
        </div>
        
        <div className="stat-card bookings">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <p className="stat-value">{stats.totalBookings}</p>
            <span className="stat-label">all time</span>
          </div>
        </div>
        
        <div className="stat-card earnings">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Earnings</h3>
            <p className="stat-value">${stats.totalEarnings.toLocaleString()}</p>
            <span className="stat-label">revenue</span>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <NavLink to="/admin/add-room" className="action-card primary">
            <div className="action-icon">➕</div>
            <div className="action-info">
              <h3>Add New Room</h3>
              <p>Create a new room listing</p>
            </div>
          </NavLink>
          
          <NavLink to="/admin/bookings" className="action-card secondary">
            <div className="action-icon">📋</div>
            <div className="action-info">
              <h3>View All Bookings</h3>
              <p>Manage reservations</p>
            </div>
          </NavLink>
        </div>
      </div>
      
      {/* Recent Bookings */}
      <div className="dashboard-section">
        <h2>Recent Bookings</h2>
        <div className="bookings-table">
          {stats.recentBookings.length === 0 ? (
            <div className="empty-state">
              <p>No recent bookings. Bookings will appear here.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Check-in Date</th>
                  <th>Nights</th>
                  <th>Room Type</th>
                  <th>Total</th>
                </tr>
              </thead>
<tbody>
                {stats.recentBookings.map((b, index) => {
                  // Calculate nights from check_in and check_out dates
                  const checkIn = new Date(b.check_in);
                  const checkOut = new Date(b.check_out);
                  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={index}>
                      <td className="guest-name">{b.user_name}</td>
<td>{formatDateDisplay(b.check_in)}</td>
                      <td>{nights}</td>
                      <td>{b.room_name}</td>
                      <td className="price">${b.total_price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

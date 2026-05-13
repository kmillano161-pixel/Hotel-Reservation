import React, { createContext, useContext, useState, useEffect } from 'react';
import API_URL from './api';

export const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Sample rooms as fallback (for offline/demo purposes)
const sampleRooms = [
  { id: 1, name: 'Big Room', type: 'Big', price: 300, size: 'BIG', image: '/src/assets/room1.png', description: 'Spacious room for families', capacity: 4, amenities: 'WiFi, TV, AC' },
  { id: 2, name: 'Small Room', type: 'Small', price: 200, size: 'SMALL', image: '/src/assets/room2.png', description: 'Cozy room for solo travelers', capacity: 1, amenities: 'WiFi, TV' },
  { id: 3, name: 'Medium Room', type: 'Medium', price: 250, size: 'MEDIUM', image: '/src/assets/room3.png', description: 'Perfect for couples', capacity: 2, amenities: 'WiFi, TV, AC' },
  { id: 4, name: 'VIP Suite', type: 'VIP', price: 350, size: 'VIP', image: '/src/assets/room4.png', description: 'Luxury suite with premium amenities', capacity: 2, amenities: 'WiFi, TV, AC, Mini Bar' }
];

export function BookingProvider({ children }) {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

const fetchRooms = async () => {
    try {
      console.log('Fetching rooms from API...');
      const response = await fetch(`http://localhost:3007/api/rooms`);
      const data = await response.json();
      
      console.log('Rooms API response:', response.status, data);
      
if (data.rooms && data.rooms.length > 0) {
        // Map backend field names to frontend expected names - keep both 'name' and 'type' for compatibility
        const mappedRooms = data.rooms.map(room => ({
          id: room.id,
          name: room.name,  // Keep original name from backend
          type: room.name || 'Standard', // Also set type to name for display
          price: parseFloat(room.price),
          size: room.capacity ? `${room.capacity}-Person` : 'Standard',
          capacity: room.capacity,
          image: room.image || '/src/assets/room1.png',
          description: room.description || 'Comfortable room with modern amenities',
          amenities: room.amenities,
          available: room.available
        }));
        console.log('Mapped rooms:', mappedRooms.length);
        setRooms(mappedRooms);
      } else {
        console.log('No rooms from API, using sample rooms');
        setRooms(sampleRooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms(sampleRooms);
    }
    setLoading(false);
  };

const getAuthHeader = () => {
    // First try to get token
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Using token from localStorage');
      return { Authorization: `Bearer ${token}` };
    }
    // Fallback to user ID for backward compatibility
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User data from localStorage:', userData);
    if (userData && userData.id) {
      console.log('Using user ID as fallback:', userData.id);
      return { Authorization: `Bearer ${userData.id}` };
    }
    console.log('No auth header available');
    return {};
  };

  const fetchBookings = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) return;
      
      const response = await fetch(`http://localhost:3007/api/bookings/my-bookings`, {
        headers: { ...getAuthHeader() }
      });
      const data = await response.json();
      
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

// Fetch all bookings (for admin)
  const fetchAllBookings = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || userData.role !== 'admin') {
        console.log('fetchAllBookings: User not admin or not found', userData);
        return { success: false, message: 'Unauthorized' };
      }
      
      console.log('Fetching all bookings with auth header:', getAuthHeader());
      
      const response = await fetch(`http://localhost:3007/api/bookings`, {
        headers: { ...getAuthHeader() }
      });
      const data = await response.json();
      
      console.log('All bookings response:', response.status, data);
      
      if (response.ok) {
        setBookings(data.bookings || []);
        return { success: true, bookings: data.bookings };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { success: false, message: 'Network error' };
    }
  };

const createBooking = async (bookingData) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) {
        return { success: false, message: 'Please login to make a booking' };
      }
      
      console.log('Creating booking with data:', bookingData);
      console.log('Auth header:', getAuthHeader());
      
// Ensure proper data types
      const formattedData = {
        room_id: parseInt(bookingData.room_id),
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        guests: parseInt(bookingData.guests) || 1,
        total_price: parseFloat(bookingData.total_price),
        payment_method: bookingData.payment_method
      };
      
      const response = await fetch(`http://localhost:3007/api/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(formattedData)
      });
      const data = await response.json();
      
      console.log('Booking response:', response.status, data);
      
      if (response.ok) {
        // Refresh bookings after creating new one
        await fetchBookings();
        return { success: true, message: 'Booking created successfully', bookingId: data.bookingId };
      } else {
        return { success: false, message: data.message || 'Booking failed' };
      }
    } catch (error) {
      console.error('Booking error:', error);
      return { success: false, message: 'Network error' };
    }
  };

  // Add new room (for admin)
  const addRoom = async (roomData) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || userData.role !== 'admin') {
        return { success: false, message: 'Unauthorized' };
      }
      
      const response = await fetch(`http://localhost:3007/api/rooms`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(roomData)
      });
      const data = await response.json();
      
      if (response.ok) {
        // Refresh rooms after adding
        await fetchRooms();
        return { success: true, message: 'Room added successfully', roomId: data.roomId };
      } else {
        return { success: false, message: data.message || 'Failed to add room' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

// Update booking status (for admin)
  const updateBookingStatus = async (bookingId, status) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || userData.role !== 'admin') {
        return { success: false, message: 'Unauthorized' };
      }
      
      const response = await fetch(`http://localhost:3007/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: 'Booking status updated' };
      } else {
        return { success: false, message: data.message || 'Failed to update status' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  // Update room (for admin)
  const updateRoom = async (roomId, roomData) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || userData.role !== 'admin') {
        return { success: false, message: 'Unauthorized' };
      }
      
      const response = await fetch(`http://localhost:3007/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(roomData)
      });
      const data = await response.json();
      
      if (response.ok) {
        // Refresh rooms after updating
        await fetchRooms();
        return { success: true, message: 'Room updated successfully' };
      } else {
        return { success: false, message: data.message || 'Failed to update room' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  // Delete room (for admin)
  const deleteRoom = async (roomId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || userData.role !== 'admin') {
        return { success: false, message: 'Unauthorized' };
      }
      
      const response = await fetch(`http://localhost:3007/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        // Refresh rooms after deleting
        await fetchRooms();
        return { success: true, message: 'Room deleted successfully' };
      } else {
        return { success: false, message: data.message || 'Failed to delete room' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const value = {
    rooms,
    bookings,
    loading,
    fetchRooms,
    fetchBookings,
    fetchAllBookings,
    createBooking,
    addRoom,
    updateRoom,
    deleteRoom,
    updateBookingStatus
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

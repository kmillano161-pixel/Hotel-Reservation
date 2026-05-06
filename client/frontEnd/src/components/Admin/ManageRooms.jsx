import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../../context/useBooking';
import { useAuth } from '../../context/useAuth';
import './AdminDashboard.css'; // Reuse styles

const ManageRooms = () => {
  const bookingCtx = useBooking();
  const { rooms, fetchRooms, deleteRoom, updateRoom } = bookingCtx;
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleDelete = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room? This cannot be undone.')) return;
    
    setLoading(true);
    setDeletingId(roomId);
    try {
      const result = await deleteRoom(roomId);
      if (result.success) {
        alert('Room deleted successfully!');
        await fetchRooms();
      } else {
        alert('Failed to delete room: ' + result.message);
      }
    } catch (error) {
      alert('Error deleting room');
    }
    setLoading(false);
    setDeletingId(null);
  };

  const openEdit = (room) => {
    setEditingRoom(room);
    setEditForm({
      name: room.name,
      description: room.description,
      price: room.price,
      capacity: room.capacity,
      amenities: room.amenities
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const saveEdit = async () => {
    if (!editingRoom) return;
    
    setLoading(true);
    try {
      const result = await updateRoom(editingRoom.id, editForm);
      if (result.success) {
        alert('Room updated successfully!');
        setEditingRoom(null);
        setEditForm({});
        await fetchRooms();
      } else {
        alert('Failed to update room: ' + result.message);
      }
    } catch (error) {
      alert('Error updating room');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="admin-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>{deletingId ? 'Deleting room...' : 'Loading rooms...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Manage Rooms</h1>
          <p>Edit or delete existing rooms</p>
        </div>
        <Link to="/admin" className="header-back-btn">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Add New Room Link */}
      <div className="dashboard-section">
        <Link to="/admin/add-room" className="action-card primary" style={{ display: 'inline-block', width: '300px' }}>
          <div className="action-icon">+</div>
          <div className="action-info">
            <h3>Add New Room</h3>
            <p>Create a new room listing</p>
          </div>
        </Link>
      </div>

      {/* Rooms Table */}
      <div className="dashboard-section">
        <h2>All Rooms ({rooms.length})</h2>
        {rooms.length === 0 ? (
          <div className="empty-state">
            <p>No rooms found. <Link to="/admin/add-room">Add your first room</Link></p>
          </div>
        ) : (
          <div className="bookings-table">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Capacity</th>
                  <th>Description</th>
                  <th>Amenities</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>
                      <img 
                        src={room.image} 
                        alt={room.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => { e.target.src = '/src/assets/room1.png'; }}
                      />
                    </td>
                    <td>{room.name}</td>
                    <td>${parseFloat(room.price).toFixed(2)}</td>
                    <td>{room.capacity} guests</td>
                    <td>{room.description?.substring(0, 50)}...</td>
                    <td>{room.amenities || 'None'}</td>
                    <td>
                      <button 
                        onClick={() => openEdit(room)}
                        className="btn btn-small btn-primary"
                        style={{ marginRight: '8px' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(room.id)}
                        className="btn btn-small btn-danger"
                        disabled={deletingId === room.id}
                      >
                        {deletingId === room.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRoom && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="modal" style={{
            background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto'
          }}>
            <h3>Edit Room: {editingRoom.name}</h3>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
              <input 
                name="name" value={editForm.name} onChange={handleEditChange}
                placeholder="Room Name" style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input 
                name="price" type="number" step="0.01" value={editForm.price} onChange={handleEditChange}
                placeholder="Price" style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input 
                name="capacity" type="number" value={editForm.capacity} onChange={handleEditChange}
                placeholder="Capacity" style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <textarea 
                name="description" value={editForm.description} onChange={handleEditChange}
                placeholder="Description" rows="3" style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input 
                name="amenities" value={editForm.amenities} onChange={handleEditChange}
                placeholder="Amenities (comma separated)" style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingRoom(null)} className="btn btn-cancel">Cancel</button>
              <button onClick={saveEdit} disabled={loading} className="btn btn-submit">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;

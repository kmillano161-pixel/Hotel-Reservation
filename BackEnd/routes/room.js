const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Middleware to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all rooms
router.get('/', asyncHandler(async (req, res) => {
  const [rooms] = await pool.query('SELECT * FROM rooms ORDER BY created_at DESC');
  res.json({ rooms });
}));

// Get single room
router.get('/:id', asyncHandler(async (req, res) => {
  const [rooms] = await pool.query('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
  if (rooms.length === 0) {
    return res.status(404).json({ message: 'Room not found' });
  }
  res.json({ room: rooms[0] });
}));

// Add new room (admin)
router.post('/', asyncHandler(async (req, res) => {
  const { name, description, price, capacity, image, amenities } = req.body;
  
  // Validate required fields
  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }
  
  const [result] = await pool.query(
    'INSERT INTO rooms (name, description, price, capacity, image, amenities) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description || '', price, capacity || 1, image || '', amenities || '']
  );
  
  res.status(201).json({ message: 'Room added successfully', roomId: result.insertId });
}));

// Update room (admin)
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, description, price, capacity, image, amenities, available } = req.body;
  
  await pool.query(
    'UPDATE rooms SET name = ?, description = ?, price = ?, capacity = ?, image = ?, amenities = ?, available = ? WHERE id = ?',
    [name, description, price, capacity, image, amenities, available, req.params.id]
  );
  
  res.json({ message: 'Room updated successfully' });
}));

// Delete room (admin)
router.delete('/:id', asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
  res.json({ message: 'Room deleted successfully' });
}));

module.exports = router;

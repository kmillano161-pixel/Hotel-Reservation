const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hotel-reservation-secret-key-2024';

// Middleware to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware to get user ID from token
const getUserIdFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  // If it's a Bearer token, verify it
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.userId;
    } catch (err) {
      // Fallback: try to parse the token itself as a user ID (for backward compatibility)
      console.log('JWT verification failed, trying as user ID:', token);
      const userId = parseInt(token);
      return isNaN(userId) ? null : userId;
    }
  }
  
  // Otherwise try as plain user ID (backward compatibility)
  const userId = parseInt(authHeader);
  return isNaN(userId) ? null : userId;
};

// Get all bookings (admin)
router.get('/', asyncHandler(async (req, res) => {
  const userId = getUserIdFromHeader(req.headers.authorization);
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const [bookings] = await pool.query(`
    SELECT b.*, r.name as room_name, r.image as room_image, u.name as user_name, u.email as user_email
    FROM bookings b 
    LEFT JOIN rooms r ON b.room_id = r.id 
    LEFT JOIN users u ON b.user_id = u.id 
    ORDER BY b.created_at DESC
  `);
  res.json({ bookings });
}));

// Get user's bookings
router.get('/my-bookings', asyncHandler(async (req, res) => {
  const userId = getUserIdFromHeader(req.headers.authorization);
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const [bookings] = await pool.query(`
    SELECT b.*, r.name as room_name, r.image as room_image
    FROM bookings b 
    LEFT JOIN rooms r ON b.room_id = r.id 
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `, [userId]);
  
  res.json({ bookings });
}));

// Create booking (auto-confirm + online payment only)
router.post('/', asyncHandler(async (req, res) => {
  let { room_id, check_in, check_out, guests, total_price, payment_method } = req.body;

  // Parse and validate types
  room_id = parseInt(room_id);
  guests = parseInt(guests) || 1;
  total_price = parseFloat(total_price);

  // Convert dates to proper format (YYYY-MM-DD)
  if (check_in) check_in = String(check_in).split('T')[0];
  if (check_out) check_out = String(check_out).split('T')[0];

  // Validate required fields
  if (!room_id || isNaN(room_id)) {
    return res.status(400).json({ message: 'Room ID is required and must be a number' });
  }
  if (!check_in) {
    return res.status(400).json({ message: 'Check-in date is required' });
  }
  if (!check_out) {
    return res.status(400).json({ message: 'Check-out date is required' });
  }
  if (isNaN(total_price)) {
    return res.status(400).json({ message: 'Total price is required and must be a number' });
  }

  // Online payment only
  if (!payment_method || !['credit_card', 'e_wallet'].includes(payment_method)) {
    return res.status(400).json({ message: 'Payment method is required (credit_card or e_wallet)' });
  }

  const user_id = getUserIdFromHeader(req.headers.authorization);
  if (!user_id) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Transactional overlap check to reduce race conditions
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock overlapping rows for this room
    const [existing] = await conn.query(
      `SELECT id FROM bookings
       WHERE room_id = ?
         AND status != 'cancelled'
         AND check_in < ?
         AND check_out > ?
       FOR UPDATE`,
      [room_id, check_out, check_in]
    );

    if (existing.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Room is not available for selected dates' });
    }

    // Auto-confirm immediately
    const [result] = await conn.query(
      `INSERT INTO bookings (user_id, room_id, check_in, check_out, guests, total_price, status, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [user_id, room_id, check_in, check_out, guests, total_price, 'confirmed', payment_method, 'paid']
    );

    await conn.commit();
    res.status(201).json({ message: 'Booking created successfully', bookingId: result.insertId, status: 'confirmed' });
  } catch (err) {
    await conn.rollback();
    console.error('Booking creation failed:', err);
    res.status(500).json({ message: 'Failed to create booking', error: err.message });
  } finally {
    conn.release();
  }
}));

// Update booking status (admin)
router.put('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;

  // Enforce that auto-confirmed bookings cannot be manually changed.
  // Only allow status changes if the current booking is still pending.
  const [rows] = await pool.query('SELECT status FROM bookings WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const currentStatus = rows[0].status;
  if (currentStatus !== 'pending') {
    return res.status(400).json({ message: 'Booking cannot be modified after auto-confirm' });
  }

  await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);

  res.json({ message: 'Booking status updated successfully' });
}));

// Cancel booking
router.put('/:id/cancel', asyncHandler(async (req, res) => {
  const userId = getUserIdFromHeader(req.headers.authorization);
  
  const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [req.params.id, userId]);
  
  if (bookings.length === 0) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
  
  res.json({ message: 'Booking cancelled successfully' });
}));

module.exports = router;

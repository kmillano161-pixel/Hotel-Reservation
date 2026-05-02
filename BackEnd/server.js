const express = require('express');
const cors = require('cors');
const path = require('path');
const authRouter = require('./routes/auth');
const roomRouter = require('./routes/room');
const bookingRouter = require('./routes/booking');
const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors(
    {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }
))

app.use(express.json());


// Routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

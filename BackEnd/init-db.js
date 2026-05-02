const mysql = require('mysql2/promise');

async function initDatabase() {
  // First connect without database to create it
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  // Create database
  await connection.query('CREATE DATABASE IF NOT EXISTS hotel_reservation');
  await connection.query('USE hotel_reservation');

  // Create users table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      role ENUM('user', 'admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

// Create rooms table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      capacity INT DEFAULT 1,
      image MEDIUMTEXT,
      amenities TEXT,
      available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

// Create bookings table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      room_id INT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INT DEFAULT 1,
      total_price DECIMAL(10, 2) NOT NULL,
      status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )
  `);

  // Insert sample rooms
  const [existingRooms] = await connection.query('SELECT COUNT(*) as count FROM rooms');
  if (existingRooms[0].count === 0) {
    await connection.query(`
      INSERT INTO rooms (name, description, price, capacity, image, amenities, available) VALUES
      ('Big Room', 'Spacious room for families with premium amenities', 300, 4, '/src/assets/room1.png', 'WiFi, TV, AC, Mini Bar, Bathtub', TRUE),
      ('Small Room', 'Cozy room for solo travelers', 200, 1, '/src/assets/room2.png', 'WiFi, TV', TRUE),
      ('Medium Room', 'Perfect for couples', 250, 2, '/src/assets/room3.png', 'WiFi, TV, AC', TRUE),
      ('VIP Suite', 'Luxury suite with premium amenities', 350, 2, '/src/assets/room4.png', 'WiFi, TV, AC, Mini Bar, Bathtub, Balcony', TRUE)
    `);
  }

  // Insert admin user (password: admin123)
  const [existingAdmin] = await connection.query("SELECT id FROM users WHERE email = 'admin@hotel.com'");
  if (existingAdmin.length === 0) {
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      ['Administrator', 'admin@hotel.com', hashedPassword, '+1234567890', 'admin']
    );
  }

  console.log('Database initialized successfully!');
  await connection.end();
}

initDatabase().catch(console.error);

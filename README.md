# Hotel Reservation System

A full-stack hotel room reservation application with React frontend and Express/MySQL backend.

## Features

- User registration and login
- Role-based access (User / Admin)
- Browse available rooms
- Book rooms with date selection
- Admin dashboard to manage rooms and bookings

## Tech Stack

- **Frontend**: React, React Router (fetch API)
- **Backend**: Express.js, MySQL, bcrypt
- **Database**: MySQL

## Setup Instructions

### 1. Database Setup

```bash
cd BackEnd
npm install
```

Make sure MySQL is running and create a database:

```sql
CREATE DATABASE hotel_reservation;
```

Then initialize the database:

```bash
node init-db.js
```

Or manually run the SQL in `init-db.js` if needed.

### 2. Start Backend

```bash
node server.js
```

Server runs on http://localhost:5000

### 3. Start Frontend

```bash
cd client/frontEnd
npm run dev
```

Frontend runs on http://localhost:5173

## Default Admin Credentials

- Email: admin@hotel.com
- Password: admin123

## Role-Based Access

### Regular User:
- Browse rooms on Home/Rooms
- Register and login
- Book rooms (requires login)
- View My Bookings

### Admin:
- All user features
- Access /admin dashboard
- Add/Edit/Delete rooms
- View all bookings
- Update booking status

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| / | All | Home page |
| /rooms | All | Rooms listing |
| /login | All | Login page |
| /register | All | Registration page |
| /booking | User+ | Make booking |
| /admin | Admin | Admin dashboard |
| /admin/add-room | Admin | Add new room |
| /admin/bookings | Admin | View all bookings |

## API Endpoints

### Auth
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Rooms
- GET /api/rooms - Get all rooms
- POST /api/rooms - Add room (admin)
- PUT /api/rooms/:id - Update room (admin)
- DELETE /api/rooms/:id - Delete room (admin)

### Bookings
- GET /api/bookings - Get all bookings (admin)
- GET /api/bookings/my-bookings - Get user bookings
- POST /api/bookings - Create booking
- PUT /api/bookings/:id/status - Update status (admin)

## Running the Application

1. Start MySQL
2. Run `node init-db.js` once to set up database
3. In terminal 1: `cd BackEnd && node server.js`
4. In terminal 2: `cd client/frontEnd && npm run dev`
5. Open http://localhost:5173

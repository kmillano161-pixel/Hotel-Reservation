import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './context/useBooking';
import { AuthProvider, useAuth } from './context/useAuth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Rooms from './pages/Rooms';
import BookingForm from './pages/BookingForm';
import Registration from './pages/Registration';
import Login from './components/Login';
import AddRoom from './components/Admin/AddRoom';
import Bookings from './components/Admin/Bookings';
import AdminDashboard from './components/Admin/AdminDashboard';
import ManageRooms from './components/Admin/ManageRooms';
import './App.css';

function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

function AppContent() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
<Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          
          <Route path="/booking" element={
            <RequireAuth>
              <BookingForm />
            </RequireAuth>
          } />
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/add-room" element={
            <AdminRoute>
              <AddRoom />
            </AdminRoute>
          } />
          <Route path="/admin/manage-rooms" element={
            <AdminRoute>
              <ManageRooms />
            </AdminRoute>
          } />
          <Route path="/admin/bookings" element={
            <AdminRoute>
              <Bookings />
            </AdminRoute>
          } />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; 2026 Hotel Reservation.</p>
      </footer>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <AppContent />
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

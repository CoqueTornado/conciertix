// Import necessary components from react-router-dom for routing
import { Routes, Route } from 'react-router-dom';

// Import page components
import HomePage from './pages/HomePage';
import EventDetailsPage from './pages/EventDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyReservationsPage from './pages/MyReservationsPage';
import UserProfilePage from './pages/UserProfilePage';
import EventCalendarPage from './pages/EventCalendarPage';

// Import route protection components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Import Admin panel layout and page components
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminEventListPage from './pages/AdminEventListPage';
import AdminCreateEventPage from './pages/AdminCreateEventPage';
import AdminEditEventPage from './pages/AdminEditEventPage';
import AdminArtistListPage from './pages/AdminArtistListPage';
import AdminCreateArtistPage from './pages/AdminCreateArtistPage';
import AdminEditArtistPage from './pages/AdminEditArtistPage';
import AdminVenueListPage from './pages/AdminVenueListPage';
import AdminCreateVenuePage from './pages/AdminCreateVenuePage';
import AdminEditVenuePage from './pages/AdminEditVenuePage';
import AdminReservationListPage from './pages/AdminReservationListPage';
import AdminUserListPage from './pages/AdminUserListPage';

// Import shared components
import Navbar from './components/Navbar';

// Import global styles
import './App.css';

/**
 * @function App
 * @description The main application component that sets up the routing structure.
 * It defines all the public, user-specific, and admin-specific routes for the application.
 * @returns {JSX.Element} The rendered application with a Navbar and routes.
 */
function App() {
  return (
    // Main application container, styled by App.css to take full height/width.
    <div className="App">
      {/* Navbar component, displayed on all pages. */}
      <Navbar />
      {/* Main content area for page-specific content. */}
      {/* This container ensures consistent padding and max-width for all pages. */}
      <main className="main-content-container">
        {/* Defines the routing configuration for the application. */}
        <Routes>
          {/* Publicly accessible routes. */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events/:eventId" element={<EventDetailsPage />} />
          <Route path="/calendar" element={<EventCalendarPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* User Panel Routes - Protected by ProtectedRoute */}
          {/* These routes are only accessible to authenticated users. */}
          <Route path="/user" element={<ProtectedRoute />}>
            <Route path="my-reservations" element={<MyReservationsPage />} />
            <Route path="profile" element={<UserProfilePage />} />
            {/* Additional user-specific routes can be added here. */}
          </Route>

          {/* Admin Panel Routes - Protected by AdminRoute and uses AdminLayout */}
          {/* These routes are only accessible to authenticated admin users. */}
          {/* AdminLayout provides a consistent structure for admin pages. */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              {/* Default admin page (dashboard). */}
              <Route index element={<AdminDashboardPage />} />
              {/* Routes for managing events. */}
              <Route path="events" element={<AdminEventListPage />} />
              <Route path="events/new" element={<AdminCreateEventPage />} />
              <Route path="events/edit/:eventId" element={<AdminEditEventPage />} />
              {/* Routes for managing artists. */}
              <Route path="artists" element={<AdminArtistListPage />} />
              <Route path="artists/new" element={<AdminCreateArtistPage />} />
              <Route path="artists/edit/:artistId" element={<AdminEditArtistPage />} />
              {/* Routes for managing venues. */}
              <Route path="venues" element={<AdminVenueListPage />} />
              <Route path="venues/new" element={<AdminCreateVenuePage />} />
              <Route path="venues/edit/:venueId" element={<AdminEditVenuePage />} />
              {/* Routes for managing reservations and users. */}
              <Route path="reservations" element={<AdminReservationListPage />} />
              <Route path="users" element={<AdminUserListPage />} />
            </Route>
          </Route>
        </Routes>
      </main>
      {/* Placeholder for a potential Footer component. */}
      {/* If a full-width footer is needed, it should be placed outside main-content-container. */}
    </div>
  );
}

export default App;

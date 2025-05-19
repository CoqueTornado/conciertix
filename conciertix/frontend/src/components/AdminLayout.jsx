// Import necessary components from react-router-dom for navigation and rendering nested routes.
import { Link, Outlet, useNavigate } from 'react-router-dom';
// Import useAuth hook from AuthContext to access authentication state and logout function.
import { useAuth } from '../context/AuthContext';
// Import styles for the AdminLayout component.
import './AdminLayout.css';

/**
 * @function AdminLayout
 * @description Provides the main structure for the admin panel, including a header, sidebar navigation,
 * and a content area where nested admin routes are rendered.
 * It also handles user logout functionality.
 *
 * @returns {JSX.Element} The rendered admin layout structure.
 */
const AdminLayout = () => {
  // Retrieve logout function and user information from the authentication context.
  const { logout, user } = useAuth();
  // Hook for programmatic navigation.
  const navigate = useNavigate();

  /**
   * Handles the user logout process.
   * Calls the logout function from AuthContext and navigates the user to the login page.
   */
  const handleLogout = () => {
    logout(); // Clears authentication state.
    navigate('/login'); // Redirects to the login page.
  };

  return (
    // Main container for the admin layout.
    <div className="admin-layout">
      {/* Header section of the admin panel. */}
      <header className="admin-header">
        <h1>IndieAccess Pass - Admin Panel</h1>
        {/* Displays user information and logout button. */}
        <div className="admin-user-info">
          {/* Display welcome message if user object exists. Checks for user.username or user.Username for flexibility. */}
          {user && <span>Welcome, {user.username || user.Username}</span>}
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      {/* Container for the main content area, including sidebar and page content. */}
      <div className="admin-main-content">
        {/* Sidebar navigation for the admin panel. */}
        <aside className="admin-sidebar">
          <nav>
            <ul>
              {/* Navigation links to different sections of the admin panel. */}
              <li><Link to="/admin">Dashboard</Link></li>
              <li><Link to="/admin/events">Event Management</Link></li>
              <li><Link to="/admin/artists">Artist Management</Link></li>
              <li><Link to="/admin/venues">Venue Management</Link></li>
              <li><Link to="/admin/reservations">Reservation Management</Link></li>
              <li><Link to="/admin/users">User Management</Link></li>
            </ul>
          </nav>
        </aside>
        {/* Main content area where specific admin pages are rendered. */}
        <main className="admin-page-content">
          {/* Outlet component from react-router-dom renders the matched child route's component. */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
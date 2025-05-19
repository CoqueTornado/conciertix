// Import useAuth hook from AuthContext to access authenticated user's information.
import { useAuth } from '../context/AuthContext';
// Import styles for this page.
import './AdminDashboardPage.css';

/**
 * @function AdminDashboardPage
 * @description The main dashboard page for the admin panel.
 * It typically displays a welcome message, summary statistics (e.g., event counts, user counts),
 * and quick links to common admin actions. Currently, stats and quick actions are placeholders.
 *
 * @returns {JSX.Element} The rendered admin dashboard page.
 */
const AdminDashboardPage = () => {
  // Retrieve the authenticated user object from AuthContext.
  const { user } = useAuth();

  return (
    <div className="admin-dashboard-page">
      <h2>Admin Dashboard</h2>
      {/* Display a welcome message if the user object is available.
          Checks for `user.username` or `user.Username` for flexibility in how the username is stored. */}
      {user && <p className="welcome-message">Welcome to the Admin Panel, {user.username || user.Username}!</p>}
      
      {/* Section for displaying key statistics. Currently placeholders. */}
      <div className="dashboard-stats">
        {/* Placeholder for Upcoming Events Count */}
        <div className="stat-card">
          <h3>Upcoming Events Count</h3>
          <p>[To be implemented - e.g., fetch and display count]</p>
        </div>
        {/* Placeholder for Total Reservations */}
        <div className="stat-card">
          <h3>Total Reservations</h3>
          <p>[To be implemented - e.g., fetch and display count]</p>
        </div>
        {/* Placeholder for Registered Users Count */}
        <div className="stat-card">
          <h3>Registered Users</h3>
          <p>[To be implemented - e.g., fetch and display count]</p>
        </div>
        {/* Additional stat cards can be added here as needed. */}
      </div>

      {/* Section for quick actions. Currently placeholders with alert functionality. */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <ul>
          {/* Placeholder button to navigate to Create Event page. */}
          <li>
            <button onClick={() => alert('Navigate to Create Event (Functionality to be implemented using react-router-dom navigate)')}>
              Create New Event
            </button>
          </li>
          {/* Placeholder button to navigate to Manage Users page. */}
          <li>
            <button onClick={() => alert('Navigate to Manage Users (Functionality to be implemented using react-router-dom navigate)')}>
              Manage Users
            </button>
          </li>
          {/* Add more quick action links/buttons as needed. */}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
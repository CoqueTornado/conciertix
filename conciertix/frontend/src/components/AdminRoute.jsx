// Import Navigate for redirection and Outlet for rendering nested routes from react-router-dom.
import { Navigate, Outlet } from 'react-router-dom';
// Import useAuth hook from AuthContext to access authentication state and user details.
import { useAuth } from '../context/AuthContext';

/**
 * @function AdminRoute
 * @description A protected route component that ensures only authenticated admin users can access
 * its child routes. If the user is not authenticated or is not an admin, they are redirected.
 *
 * @returns {JSX.Element} Renders the child routes via <Outlet /> if access is granted,
 * otherwise redirects the user.
 */
const AdminRoute = () => {
  // Retrieve user object, authentication status, and loading state from AuthContext.
  const { user, isAuthenticated, loading } = useAuth();

  // Display a loading indicator while authentication status is being determined.
  if (loading) {
    // A more sophisticated loading spinner or component could be used here.
    return <div>Loading...</div>;
  }

  // If the user is not authenticated, redirect them to the login page.
  // `replace` prop ensures the login page replaces the current entry in history.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if the authenticated user has the 'Admin' role.
  // It's crucial that the `user` object from AuthContext correctly populates the `Role` property
  // (or a similar field like `role` or `userRole` depending on backend and context setup).
  // The current check `user.Role` assumes the backend sends `Role` with a capital 'R'.
  if (user && user.Role === 'Admin') {
    // If the user is authenticated and is an Admin, render the child routes.
    return <Outlet />;
  }

  // If the user is authenticated but not an Admin, redirect them to the homepage.
  // Consider creating a dedicated "Not Authorized" or "Access Denied" page for a better user experience.
  // `replace` prop is used here as well.
  return <Navigate to="/" replace />;
};

export default AdminRoute;
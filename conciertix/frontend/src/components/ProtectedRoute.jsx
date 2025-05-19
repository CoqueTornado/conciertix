import React, { useContext } from 'react';
// Navigate is used for programmatic redirection.
// Outlet is used to render child routes within this protected route.
import { Navigate, Outlet } from 'react-router-dom';
// AuthContext provides authentication-related data like the token.
import { AuthContext } from '../context/AuthContext';

/**
 * @function ProtectedRoute
 * @description A component that protects routes requiring authentication.
 * If the user is not authenticated (i.e., no token is present in AuthContext),
 * it redirects them to the login page. Otherwise, it renders the child route's content.
 * This component is typically used to wrap routes that should only be accessible to logged-in users.
 *
 * @returns {JSX.Element} Either a <Navigate> component to redirect the user,
 * or an <Outlet /> component to render the intended child route.
 */
const ProtectedRoute = () => {
  // Retrieve the authentication token from the AuthContext.
  // The `token` is a primary indicator of an authenticated session.
  const { token } = useContext(AuthContext);

  // Check if the token exists.
  if (!token) {
    // If no token is found, the user is considered not authenticated.
    // Redirect the user to the "/login" page.
    // The `replace` prop ensures that the current route in history is replaced by the login route,
    // so the user doesn't navigate back to the protected route via the browser's back button after logging in.
    return <Navigate to="/login" replace />;
  }

  // If a token exists, the user is considered authenticated.
  // Render the child route's component using the <Outlet /> component.
  // <Outlet /> acts as a placeholder where matched child routes will be rendered.
  return <Outlet />;
};

export default ProtectedRoute;
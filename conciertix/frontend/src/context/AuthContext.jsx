import React, { createContext, useState, useEffect, useContext } from 'react';
// Import the pre-configured axios instance for API calls.
import api from '../services/api';

/**
 * @constant AuthContext
 * @description Creates a React context for authentication state.
 * Initialized to null, will be provided by AuthProvider.
 */
export const AuthContext = createContext(null);

/**
 * @function useAuth
 * @description Custom hook to easily consume the AuthContext in functional components.
 * Provides a convenient way to access authentication state (user, token, etc.) and methods (login, logout).
 * @returns {Object} The value provided by AuthContext (user, token, login, logout, etc.).
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * @function AuthProvider
 * @description A component that provides authentication state and methods to its children
 * via the AuthContext. It manages user data, authentication token, loading states, and errors.
 *
 * @param {Object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components that will have access to the AuthContext.
 * @returns {JSX.Element} The AuthContext.Provider wrapping the children components.
 */
export const AuthProvider = ({ children }) => {
  // State for the authenticated user object. Null if not authenticated.
  const [user, setUser] = useState(null);
  // State for the authentication token (JWT). Initialized from localStorage.
  const [token, setToken] = useState(localStorage.getItem('token'));
  // State to indicate if an authentication operation (login, register) is in progress.
  const [loading, setLoading] = useState(false); // Initially true if auto-login/user fetch happens on load
  // State to store any error messages from authentication operations.
  const [error, setError] = useState(null);

  // Effect to synchronize the token state with localStorage.
  // Runs whenever the `token` state changes.
  useEffect(() => {
    if (token) {
      // If token exists, store it in localStorage for persistence.
      localStorage.setItem('token', token);
      // Note: The API service (`../services/api.js`) is typically configured to
      // automatically include this token in request headers.
    } else {
      // If token is null (e.g., after logout), remove it from localStorage.
      localStorage.removeItem('token');
    }
  }, [token]); // Dependency: `token`.

  /**
   * Attempts to log in the user with the provided credentials.
   * @async
   * @param {string} username - The user's username.
   * @param {string} password - The user's password.
   * @returns {Promise<boolean>} True if login is successful, false otherwise.
   */
  const login = async (username, password) => {
    setLoading(true); // Set loading state to true.
    setError(null);   // Clear any previous errors.
    try {
      // Make API call to the login endpoint.
      const response = await api.post('/auth/login', { Username: username, Password: password });
      if (response.data && response.data.token) {
        // If login is successful and a token is received:
        setToken(response.data.token); // Update token state.
        // Store user details (either full object from backend or a basic one).
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user); // Update user state with full user object.
        } else {
          // Fallback if backend doesn't send full user object on login.
          const basicUser = { username }; // Create a basic user object.
          localStorage.setItem('user', JSON.stringify(basicUser));
          setUser(basicUser);
        }
        return true; // Indicate successful login.
      } else {
        // If no token is received, throw an error.
        throw new Error('Login failed: No token received');
      }
    } catch (err) {
      // Handle login errors.
      setError(err.response?.data?.message || err.message || 'Login failed');
      setUser(null); // Clear user state.
      setToken(null); // Clear token state (triggers useEffect to remove from localStorage).
      localStorage.removeItem('user'); // Explicitly remove user from localStorage.
      return false; // Indicate failed login.
    } finally {
      setLoading(false); // Reset loading state.
    }
  };

  /**
   * Attempts to register a new user with the provided details.
   * @async
   * @param {string} username - The desired username.
   * @param {string} email - The user's email address.
   * @param {string} password - The desired password.
   * @returns {Promise<boolean>} True if registration is successful, false otherwise.
   */
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Make API call to the register endpoint. Default role is "User".
      await api.post('/auth/register', { Username: username, Email: email, Password: password, Role: "User" });
      // Optionally: Could automatically log the user in here by calling `login(username, password)`.
      return true; // Indicate successful registration.
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
      return false; // Indicate failed registration.
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs out the current user.
   * Clears user and token state, and removes them from localStorage.
   */
  const logout = () => {
    setUser(null);
    setToken(null); // This will trigger the useEffect to remove 'token' from localStorage.
    localStorage.removeItem('user'); // Explicitly remove 'user' from localStorage.
    // For JWT-based auth, client-side cleanup is usually sufficient.
    // No API call is typically needed unless the backend maintains active session records to invalidate.
  };

  // Effect to load user and token from localStorage on initial application load.
  // This allows persistence of the login session across browser refreshes.
  useEffect(() => {
    setLoading(true); // Start with loading true for this initial check
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      // If token and user data are found in localStorage:
      setToken(storedToken); // Restore token state.
      try {
        setUser(JSON.parse(storedUser)); // Restore user state, parsing from JSON.
      } catch (e) {
        // Handle cases where stored user data might be corrupted.
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem('user'); // Clear corrupted data.
        // Optionally, could also clear token and force logout here if user data is critical.
      }
    }
    setLoading(false); // Mark initial loading as complete.
  }, []); // Empty dependency array: run only once on component mount.

  // Value object to be provided by the AuthContext.
  // Includes authentication state and methods.
  const value = {
    user,          // Current authenticated user object, or null.
    token,         // Current authentication token, or null.
    loading,       // Boolean indicating if an auth operation is in progress.
    error,         // Error object or message if an auth operation failed.
    login,         // Function to log in a user.
    register,      // Function to register a new user.
    logout,        // Function to log out the current user.
    isAuthenticated: !!token, // Boolean derived state: true if a token exists, false otherwise.
  };

  // Provide the 'value' object to all child components via AuthContext.Provider.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

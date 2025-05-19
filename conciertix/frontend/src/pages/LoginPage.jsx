import React, { useState } from 'react';
// useNavigate for programmatic redirection, Link for navigation to other routes like register.
import { useNavigate, Link } from 'react-router-dom';
// useAuth hook to access login function, loading state, and error messages from AuthContext.
import { useAuth } from '../context/AuthContext';

/**
 * @function LoginPage
 * @description Page component for user login.
 * It provides a form for users to enter their username and password.
 * On submission, it uses the `login` function from AuthContext to authenticate the user.
 * Displays loading states and error messages related to the login process.
 *
 * @returns {JSX.Element} The rendered login page with a form and a link to the registration page.
 */
function LoginPage() {
  // State for the username input field.
  const [username, setUsername] = useState('');
  // State for the password input field.
  const [password, setPassword] = useState('');
  // Destructure login function, loading state, and error state from AuthContext.
  const { login, loading, error } = useAuth();
  // Hook for programmatic navigation, used to redirect after successful login.
  const navigate = useNavigate();

  /**
   * Handles the form submission for login.
   * Prevents default form action and calls the `login` function from AuthContext.
   * Redirects to the homepage on successful login.
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior.
    // Call the login function from AuthContext with username and password.
    const success = await login(username, password);
    if (success) {
      // If login is successful, navigate to the homepage.
      // Consider navigating to a user dashboard or the previous page if `location.state.from` was passed.
      navigate('/');
    }
    // If login fails, the `error` state from AuthContext will be updated and displayed.
  };

  // Basic inline styles are used here for simplicity. Consider using CSS classes or a styling library.
  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '50px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
      <form onSubmit={handleSubmit}>
        {/* Username Input Field */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Update username state on change.
            required // HTML5 validation: field is required.
            autoComplete="username" // Helps browsers with autofill.
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        {/* Password Input Field */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state on change.
            required // HTML5 validation: field is required.
            autoComplete="current-password" // Helps browsers with autofill for current password.
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        {/* Display login error message if any. */}
        {error && <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading} // Disable button while login is in progress.
          style={{ width: '100%', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        >
          {loading ? 'Logging in...' : 'Login'} {/* Change button text based on loading state. */}
        </button>
      </form>
      {/* Link to Registration Page */}
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Register here</Link>
      </p>
    </div>
  );
}

export default LoginPage;
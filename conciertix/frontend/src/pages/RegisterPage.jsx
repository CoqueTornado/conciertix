import React, { useState } from 'react';
// useNavigate for programmatic redirection, Link for navigation to other routes like login.
import { useNavigate, Link } from 'react-router-dom';
// useAuth hook to access register function, loading state, and error messages from AuthContext.
import { useAuth } from '../context/AuthContext';

/**
 * @function RegisterPage
 * @description Page component for user registration.
 * It provides a form for users to enter their desired username, email, and password.
 * Includes client-side validation for password confirmation and basic email format.
 * On submission, it uses the `register` function from AuthContext to create a new user account.
 * Displays loading states and error messages related to the registration process.
 *
 * @returns {JSX.Element} The rendered registration page with a form and a link to the login page.
 */
function RegisterPage() {
  // State for the username input field.
  const [username, setUsername] = useState('');
  // State for the email input field.
  const [email, setEmail] = useState('');
  // State for the password input field.
  const [password, setPassword] = useState('');
  // State for the confirm password input field.
  const [confirmPassword, setConfirmPassword] = useState('');
  // Destructure register function, loading state, and error state (from API calls) from AuthContext.
  const { register, loading, error } = useAuth();
  // State for client-side form validation errors (e.g., passwords don't match).
  const [formError, setFormError] = useState('');
  // Hook for programmatic navigation, used to redirect after successful registration.
  const navigate = useNavigate();

  /**
   * Handles the form submission for registration.
   * Prevents default form action, performs client-side validation,
   * and calls the `register` function from AuthContext.
   * Redirects to the login page on successful registration.
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior.
    setFormError('');   // Clear any previous client-side form errors.

    // Client-side validation: Check if passwords match.
    if (password !== confirmPassword) {
      setFormError("Passwords don't match. Please try again.");
      return; // Stop submission if passwords don't match.
    }
    // Client-side validation: Basic email format check.
    // This is a simple regex; more robust validation might be needed or handled by backend.
    if (!/\S+@\S+\.\S+/.test(email)) {
        setFormError("Please enter a valid email address.");
        return; // Stop submission if email format is invalid.
    }

    // Call the register function from AuthContext with username, email, and password.
    const success = await register(username, email, password);
    if (success) {
      // If registration is successful, navigate to the login page.
      // Optionally, could auto-login the user here or show a success message before redirecting.
      navigate('/login');
    }
    // If registration fails, the `error` state from AuthContext (API error) will be updated and displayed.
  };

  // Basic inline styles are used here for simplicity. Consider using CSS classes or a styling library.
  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '50px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
      <form onSubmit={handleSubmit}>
        {/* Username Input Field */}
        <div style={{ marginBottom: '10px' }}>
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
        {/* Email Input Field */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email" // Input type 'email' provides some browser-level validation.
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on change.
            required
            autoComplete="email"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        {/* Password Input Field */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state on change.
            required
            autoComplete="new-password" // Hint for password managers.
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        {/* Confirm Password Input Field */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Update confirmPassword state.
            required
            autoComplete="new-password"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        {/* Display client-side form validation errors. */}
        {formError && <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{formError}</p>}
        {/* Display API errors (from AuthContext). */}
        {error && <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading} // Disable button while registration is in progress.
          style={{ width: '100%', padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        >
          {loading ? 'Registering...' : 'Register'} {/* Change button text based on loading state. */}
        </button>
      </form>
      {/* Link to Login Page */}
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Already have an account? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Login here</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
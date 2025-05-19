// Import React hooks for state, effects, and context.
import React, { useState, useEffect, useContext } from 'react';
// Import AuthContext to access user data and authentication token.
// Note: `useAuth` is a custom hook that simplifies `useContext(AuthContext)`.
// It's good practice to use `useAuth` if available, but `useContext(AuthContext)` is also correct.
import { useAuth, AuthContext } from '../context/AuthContext.jsx';
// Import the pre-configured axios instance for API calls.
import api from '../services/api';
// Import styles for this page.
import './UserProfilePage.css';

/**
 * @function UserProfilePage
 * @description Page component for displaying and managing the authenticated user's profile.
 * It fetches the user's profile data, allows them to update their email,
 * and includes placeholders for future features like password change and notification preferences.
 *
 * @returns {JSX.Element} The rendered user profile page.
 */
const UserProfilePage = () => {
  // Destructure user object and token from AuthContext.
  // `user` from context might be used for initial display or checks, `token` for API calls.
  const { user, token } = useContext(AuthContext);
  // State to store the user's profile data fetched from the API.
  const [profileData, setProfileData] = useState({
    username: '', // Username (usually not editable by user)
    email: '',    // User's email
    role: '',     // User's role (e.g., 'User', 'Admin')
  });
  // State for the email input field, allowing users to edit their email.
  const [editableEmail, setEditableEmail] = useState('');
  // State to indicate if profile data is currently being loaded or updated.
  const [loading, setLoading] = useState(true); // True initially to fetch profile.
  // State to store general error messages (e.g., from fetching profile data).
  const [error, setError] = useState(null);
  // State for success messages (e.g., after successful profile update).
  const [successMessage, setSuccessMessage] = useState('');
  // State for error messages specific to profile update attempts.
  const [updateError, setUpdateError] = useState('');

  // Effect to fetch the user's profile data when the component mounts or the token changes.
  useEffect(() => {
    /**
     * Fetches the current user's profile details from the API.
     * @async
     */
    const fetchUserProfile = async () => {
      // If no token, user is not authenticated; set error and stop loading.
      if (!token) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true); // Indicate start of data fetching.
        setError(null);   // Clear previous general errors.
        setSuccessMessage(''); // Clear previous success messages.
        setUpdateError(''); // Clear previous update errors.

        // API call to get the current user's profile (e.g., '/users/me').
        // Authentication token is passed in headers.
        const response = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Update profileData state with fetched data.
        setProfileData({
          username: response.data.username || '',
          email: response.data.email || '',
          role: response.data.role || '', // Assuming backend provides role
        });
        // Initialize the editable email field with the fetched email.
        setEditableEmail(response.data.email || '');
        setLoading(false); // Indicate end of data fetching.
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch your profile data.');
        setLoading(false);
      }
    };

    fetchUserProfile(); // Invoke the fetch function.
  }, [token]); // Dependency: token. Re-fetch if token changes.

  /**
   * Handles changes in the editable email input field.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleEmailChange = (e) => {
    setEditableEmail(e.target.value);
  };

  /**
   * Handles the submission of the profile update form (currently only email update).
   * Makes an API call to update the user's email.
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior.
    // Ensure user is authenticated before attempting update.
    if (!token) {
      setUpdateError('Not authenticated. Please log in to update your profile.');
      return;
    }
    setLoading(true); // Indicate start of update process.
    setUpdateError(''); // Clear previous update errors.
    setSuccessMessage(''); // Clear previous success messages.
    try {
      // API call to update the user's profile (e.g., PUT '/users/me').
      // Send only the editable fields, in this case, just the email.
      const response = await api.put('/users/me',
        { email: editableEmail }, // Payload with the new email.
        { headers: { Authorization: `Bearer ${token}` } } // Auth header.
      );
      // Update local profile data with the new email from response or the submitted one.
      setProfileData(prevData => ({ ...prevData, email: response.data.email || editableEmail }));
      setEditableEmail(response.data.email || editableEmail); // Sync editable field with updated data.
      setSuccessMessage('Profile updated successfully!');
      setLoading(false); // Indicate end of update process.
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateError(err.response?.data?.message || err.message || 'Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  // Display loading message while initial profile data is being fetched.
  if (loading && !profileData.username) {
    return <div className="loading-container user-profile-page"><p>Loading profile...</p></div>;
  }

  // Display error message if fetching profile data failed.
  if (error && !profileData.username) { // Show general fetch error only if profile data isn't loaded
    return <div className="error-container user-profile-page">Error: {error}</div>;
  }

  // Main JSX for the user profile page.
  return (
    <div className="user-profile-page">
      <h2>My Profile</h2>
      
      {/* Display basic profile information (username, role). */}
      <div className="profile-info">
        <p><strong>Username:</strong> {profileData.username}</p>
        <p><strong>Role:</strong> {profileData.role}</p>
      </div>

      {/* Form for updating user information (currently only email). */}
      <form onSubmit={handleSubmit} className="profile-form">
        <h3>Update Information</h3>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email" // Input type 'email' for basic browser validation.
            id="email"
            value={editableEmail}
            onChange={handleEmailChange}
            required // HTML5 validation: field is required.
          />
        </div>
        {/* Display update-specific errors or success messages. */}
        {updateError && <p className="error-message">{updateError}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button type="submit" disabled={loading}>
          {loading && profileData.username ? 'Updating...' : 'Update Email'} {/* Show 'Updating...' only if not initial load */}
        </button>
      </form>

      {/* Placeholder section for account management actions like password change. */}
      <div className="profile-actions">
        <h3>Account Management</h3>
        <button disabled className="placeholder-button">Change Password (Coming Soon)</button>
        {/*
          Password change typically involves current password verification and is often a separate flow/endpoint.
          If updating password via PUT /users/me, fields for currentPassword, newPassword,
          and confirmNewPassword would be added to the form above.
        */}
      </div>

      {/* Placeholder section for notification preferences. */}
      <div className="notification-preferences">
        <h3>Notification Preferences</h3>
        <p>Notification Preferences - Coming Soon!</p>
        {/* This section could include toggles for email notifications, etc. */}
      </div>
    </div>
  );
};

export default UserProfilePage;
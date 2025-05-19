import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// Import the reusable form component for venue creation/editing.
import AdminVenueForm from '../components/AdminVenueForm';
// Import AuthContext to access user's token for authenticated API calls.
import { AuthContext } from '../context/AuthContext';
// Import the pre-configured axios instance for API calls.
import api from '../services/api';

/**
 * @function AdminCreateVenuePage
 * @description Page component for creating a new venue in the admin panel.
 * It utilizes the AdminVenueForm component and manages the submission process,
 * including API interaction and feedback (loading, success, error states).
 *
 * @returns {JSX.Element} The rendered page for creating a new venue.
 */
function AdminCreateVenuePage() {
  // Hook for programmatic navigation.
  const navigate = useNavigate();
  // Access user context, specifically for the authentication token.
  // Note: The `user` object from AuthContext should contain the `token`.
  // If `api.js` is set up to automatically include the token from localStorage,
  // explicitly passing it in headers might be redundant but offers clarity.
  const { user, token: authToken } = useContext(AuthContext); // Renaming token to authToken for clarity if user also has a token prop.
  
  // State to indicate if the form submission is in progress.
  const [isLoading, setIsLoading] = useState(false);
  // State to store any error messages from the API call or form validation.
  const [error, setError] = useState(null);
  // State to store a success message after successful venue creation.
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Handles the submission of the venue creation form.
   * Constructs the DTO and makes an API call to create the new venue.
   * @async
   * @param {Object} formData - The data from the AdminVenueForm.
   * @param {string} formData.name - The name of the venue.
   * @param {string} formData.address - The address of the venue.
   * @param {string} formData.city - The city where the venue is located.
   */
  const handleSubmit = async (formData) => {
    setIsLoading(true); // Set loading state.
    setError(null);     // Clear previous errors.
    setSuccessMessage(''); // Clear previous success messages.

    // Prepare the DTO (Data Transfer Object) for the API request.
    const venueDto = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
    };

    try {
      // Make a POST request to the venues API endpoint.
      // The `api` service might be configured to automatically include the auth token.
      // If not, or for explicit control, set Authorization header.
      // Ensure `authToken` (from `useContext(AuthContext)`) is the actual token string.
      const headers = {};
      if (authToken) { // Check if authToken is available
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const response = await api.post('/api/venues', venueDto, { headers });

      // Check for successful response status (e.g., 201 Created or 200 OK).
      if (response.status === 201 || response.status === 200) {
        setSuccessMessage('Venue created successfully! Redirecting...');
        // Redirect to the admin venues list page after a short delay.
        setTimeout(() => {
          navigate('/admin/venues');
        }, 1500);
      } else {
        // Handle cases where the API returns a success status code but indicates an issue in the body.
        // This is less common for POST/create operations if they follow RESTful practices (201 for success).
        setError(response.data?.message || 'Failed to create venue. Unexpected success response.');
      }
    } catch (err) {
      // Handle errors from the API call.
      console.error('Create venue error:', err.response?.data || err.message);
      const apiError = err.response?.data;
      // Check if the API response includes specific validation errors.
      if (apiError?.errors) {
        // Concatenate multiple validation error messages if present.
        const messages = Object.values(apiError.errors).flat().join(' ');
        setError(messages || 'An unexpected error occurred due to invalid data.');
      } else {
        // Set a general error message.
        setError(apiError?.message || apiError?.title || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false); // Reset loading state regardless of outcome.
    }
  };
  
  // Note: Admin role check should ideally be handled by a route guard (<AdminRoute />)
  // rather than directly within page components for better separation of concerns and consistency.

  return (
    <div className="admin-page-container"> {/* General container for admin pages */}
      {/* Display success message if venue creation was successful. */}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {/* Render the AdminVenueForm component. */}
      <AdminVenueForm
        onSubmit={handleSubmit} // Pass the submit handler.
        isLoading={isLoading}   // Pass the current loading state.
        error={error}           // Pass any error messages to the form for display.
        isEdit={false}          // Indicate that this is for creation, not editing.
      />
    </div>
  );
}

export default AdminCreateVenuePage;
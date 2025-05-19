import React, { useState, useEffect, useContext } from 'react';
// useNavigate for redirection, useParams to get venueId from URL.
import { useNavigate, useParams } from 'react-router-dom';
// Reusable form component for venue data.
import AdminVenueForm from '../components/AdminVenueForm';
// AuthContext to access user's token for authenticated API calls.
import { AuthContext } from '../context/AuthContext';
// API service for backend communication.
import api from '../services/api';

/**
 * @function AdminEditVenuePage
 * @description Page component for editing an existing venue in the admin panel.
 * It fetches the venue's current data, populates the AdminVenueForm,
 * and handles the submission of updated data.
 *
 * @returns {JSX.Element} The rendered page for editing a venue.
 */
function AdminEditVenuePage() {
  // Hook for programmatic navigation.
  const navigate = useNavigate();
  // Get venueId from URL parameters.
  const { venueId } = useParams();
  // Access user context, specifically for the authentication token.
  // Using `authToken` for clarity if `user` object itself might have a `token` property.
  const { user, token: authToken } = useContext(AuthContext);

  // State for the venue's initial data to pre-fill the form.
  const [initialData, setInitialData] = useState(null);
  // State to indicate if the form submission (update) is in progress.
  const [isLoading, setIsLoading] = useState(false);
  // State to indicate if the initial venue data is being fetched.
  const [isFetching, setIsFetching] = useState(true);
  // State to store error messages (from fetching or updating).
  const [error, setError] = useState(null);
  // State for success messages after a successful update.
  const [successMessage, setSuccessMessage] = useState('');

  // Effect to fetch venue details when the component mounts or venueId/authToken changes.
  useEffect(() => {
    /**
     * Fetches details for a specific venue by ID.
     * @async
     */
    const fetchVenueDetails = async () => {
      setIsFetching(true); // Start fetching.
      setError(null);     // Clear previous errors.
      try {
        // Prepare headers for authenticated request.
        // This might be redundant if `api.js` globally handles auth tokens.
        const headers = {};
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }
        // API call to get venue details.
        const response = await api.get(`/api/venues/${venueId}`, { headers });
        setInitialData(response.data); // Populate form with fetched data.
      } catch (err) {
        console.error('Fetch venue details error:', err.response?.data || err.message);
        setError(err.response?.data?.message || err.response?.data?.title || 'Failed to fetch venue details. The venue may not exist or an error occurred.');
      } finally {
        setIsFetching(false); // Finish fetching.
      }
    };

    // Fetch details only if venueId and authToken are available.
    if (venueId && authToken) {
      fetchVenueDetails();
    } else if (venueId && !authToken) {
        // Handle case where token might not be loaded yet or user is not authenticated
        setError("Authentication token not available. Please log in.");
        setIsFetching(false);
    }
  }, [venueId, authToken]); // Dependencies: venueId and authToken.

  /**
   * Handles the submission of the updated venue data.
   * Constructs the DTO and makes an API call to update the venue.
   * @async
   * @param {Object} formData - The updated data from the AdminVenueForm.
   */
  const handleSubmit = async (formData) => {
    setIsLoading(true); // Start loading for submission.
    setError(null);     // Clear previous submission errors.
    setSuccessMessage(''); // Clear previous success messages.

    // Prepare DTO for updating the venue.
    const venueDto = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
    };

    try {
      // Prepare headers for authenticated request.
      const headers = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      // API call to update the venue.
      const response = await api.put(`/api/venues/${venueId}`, venueDto, { headers });

      // Check for successful response (200 OK or 204 No Content are common for PUT).
      if (response.status === 200 || response.status === 204) {
        setSuccessMessage('Venue updated successfully! Redirecting...');
        // Redirect to admin venues list after a delay.
        setTimeout(() => {
          navigate('/admin/venues');
        }, 1500);
      } else {
        // Handle unexpected success status codes.
        setError(response.data?.message || 'Failed to update venue. Please try again.');
      }
    } catch (err) {
      // Handle errors from the API call.
      console.error('Update venue error:', err.response?.data || err.message);
      const apiError = err.response?.data;
      // Check for specific validation errors from the backend.
      if (apiError?.errors) {
        const messages = Object.values(apiError.errors).flat().join(' ');
        setError(messages || 'An unexpected error occurred due to invalid data during update.');
      } else {
        // Set a general error message.
        setError(apiError?.message || apiError?.title || 'An unexpected error occurred while updating. Please try again.');
      }
    } finally {
      setIsLoading(false); // Finish loading for submission.
    }
  };

  // Display loading message while fetching initial venue data.
  if (isFetching) {
    return <div className="loading-indicator admin-page-container">Loading venue details...</div>;
  }

  // Display error message if fetching failed and no initial data is available to show the form.
  if (error && !initialData) {
    return <div className="error-message admin-page-container">{error}</div>;
  }
  
  // Fallback if initialData is still null after fetching (e.g., venue not found, but no explicit error set for this).
  if (!initialData && !isFetching) {
      return <div className="admin-page-container"><p>Venue data could not be loaded or venue not found.</p></div>;
  }


  return (
    <div className="admin-page-container">
      <h2>Edit Venue</h2>
      {/* Display success message if venue update was successful. */}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {/* Display submission error if one occurred (passed to AdminVenueForm). */}
      {/* The AdminVenueForm itself might also display form-specific validation errors. */}
      {initialData && ( // Ensure initialData is loaded before rendering the form
        <AdminVenueForm
          initialData={initialData} // Pass fetched data to pre-fill the form.
          onSubmit={handleSubmit}   // Pass the update handler.
          isLoading={isLoading}     // Pass submission loading state.
          error={error && !successMessage ? error : null} // Pass current submission error to form, clear if success.
          isEdit={true}             // Indicate the form is in edit mode.
        />
      )}
    </div>
  );
}

export default AdminEditVenuePage;
import React, { useState, useEffect, useContext } from 'react';
// useParams to get artistId from URL, useNavigate for redirection.
import { useParams, useNavigate } from 'react-router-dom';
// Reusable form component for artist data.
import AdminArtistForm from '../components/AdminArtistForm';
// AuthContext for user role verification.
import { AuthContext } from '../context/AuthContext';
// API service for backend communication.
import api from '../services/api';
// Styles for this page.
import './AdminEditArtistPage.css';

/**
 * @function AdminEditArtistPage
 * @description Page component for editing an existing artist in the admin panel.
 * It fetches the artist's current data, populates the AdminArtistForm,
 * and handles the submission of updated data.
 *
 * @returns {JSX.Element} The rendered page for editing an artist.
 */
function AdminEditArtistPage() {
  // Get artistId from URL parameters.
  const { artistId } = useParams();
  // Hook for programmatic navigation.
  const navigate = useNavigate();
  // Get user from AuthContext to check admin privileges.
  const { user } = useContext(AuthContext); // Assuming user object contains role information.

  // State for the artist's initial data to populate the form.
  const [initialData, setInitialData] = useState(null);
  // State to indicate if the form submission (update) is in progress.
  const [isLoading, setIsLoading] = useState(false);
  // State to indicate if the initial artist data is being fetched.
  const [isFetching, setIsFetching] = useState(true);
  // State to store error messages (either from fetching or updating).
  const [error, setError] = useState(null);
  // State for success messages after a successful update.
  const [successMessage, setSuccessMessage] = useState('');

  // Effect to fetch the artist's details when the component mounts or artistId changes.
  useEffect(() => {
    /**
     * Fetches details for a specific artist by ID.
     * @async
     */
    const fetchArtist = async () => {
      if (!artistId) {
        setError('Artist ID is missing from URL.');
        setIsFetching(false);
        return;
      }
      setIsFetching(true); // Start fetching.
      setError(null);     // Clear previous errors.
      try {
        // API call to get artist details.
        const response = await api.get(`/api/artists/${artistId}`);
        setInitialData(response.data); // Populate form with fetched data.
      } catch (err) {
        console.error('Error fetching artist details:', err.response?.data || err.message);
        setError(err.response?.data?.message || err.response?.data?.title || 'Failed to fetch artist details. The artist may not exist or an error occurred.');
      } finally {
        setIsFetching(false); // Finish fetching.
      }
    };

    fetchArtist();
  }, [artistId]); // Dependency: artistId. Re-fetch if it changes.

  /**
   * Handles the submission of the updated artist data.
   * Makes an API call to update the artist.
   * @async
   * @param {Object} formData - The updated data from the AdminArtistForm.
   */
  const handleSubmit = async (formData) => {
    setIsLoading(true); // Start loading for submission.
    setError(null);     // Clear previous submission errors.
    setSuccessMessage(''); // Clear previous success messages.

    // Prepare DTO for updating the artist.
    // Ensure optional fields are sent as null if empty, or as per API requirements.
    const updateArtistDto = {
      name: formData.name,
      bio: formData.bio || null,
      imageUrl: formData.imageUrl || null,
      genre: formData.genre || null,
    };

    try {
      // API call to update the artist.
      await api.put(`/api/artists/${artistId}`, updateArtistDto);
      setSuccessMessage('Artist updated successfully! Redirecting to artist list...');
      // Redirect to artist list after a delay.
      setTimeout(() => {
        navigate('/admin/artists');
      }, 2000);
    } catch (err) {
      console.error('Error updating artist:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.response?.data?.title || 'Failed to update artist. Please try again.');
    } finally {
      setIsLoading(false); // Finish loading for submission.
    }
  };

  // Basic client-side role check. Ideally, use an <AdminRoute> wrapper.
  // Check `user.Role` or `user.role` based on your AuthContext user object structure.
  if (!user || (user.Role !== 'Admin' && user.role !== 'Admin')) {
    // Redirect non-admins. Calling navigate directly in render body is not ideal.
    // useEffect(() => navigate('/login'), [navigate]); // A slightly better approach.
    navigate('/login');
    return <p>Access Denied. Admins only. Redirecting...</p>;
  }

  // Display loading message while fetching initial artist data.
  if (isFetching) {
    return <div className="admin-edit-artist-page"><p>Loading artist details...</p></div>;
  }

  // Display error message if fetching failed and no initial data is available.
  if (error && !initialData) {
    return <div className="admin-edit-artist-page"><p className="error-message">{error}</p></div>;
  }
  
  // Display message if artist not found (and not currently fetching).
  // This case might be covered by the error above if API returns 404.
  if (!initialData && !isFetching) {
    return <div className="admin-edit-artist-page"><p>Artist not found.</p></div>;
  }

  return (
    <div className="admin-edit-artist-page">
      {/* Display submission-related errors or success messages. */}
      {error && <p className="error-message form-error">{error}</p>}
      {successMessage && <p className="success-message form-success">{successMessage}</p>}
      {/* Render the form only if initialData has been successfully fetched. */}
      {initialData && (
        <AdminArtistForm
          initialData={initialData} // Pass fetched data to pre-fill the form.
          onSubmit={handleSubmit}   // Pass the update handler.
          isEditMode={true}         // Indicate the form is in edit mode.
          isLoading={isLoading}     // Pass submission loading state.
        />
      )}
    </div>
  );
}

export default AdminEditArtistPage;
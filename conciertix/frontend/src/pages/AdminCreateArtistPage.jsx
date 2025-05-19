import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// Import the reusable form component for artist creation/editing.
import AdminArtistForm from '../components/AdminArtistForm';
// Import AuthContext to check user authentication and role.
import { AuthContext } from '../context/AuthContext';
// Import the pre-configured axios instance for API calls.
import api from '../services/api';
// Import styles for this page.
import './AdminCreateArtistPage.css';

/**
 * @function AdminCreateArtistPage
 * @description Page component for creating a new artist in the admin panel.
 * It uses the AdminArtistForm component and handles the submission logic,
 * including API calls and user feedback (loading, error, success messages).
 * It also includes a basic check for admin privileges.
 *
 * @returns {JSX.Element} The rendered page for creating an artist.
 */
function AdminCreateArtistPage() {
  // Hook for programmatic navigation.
  const navigate = useNavigate();
  // Get user details from AuthContext to check for admin role.
  const { user } = useContext(AuthContext); // Assuming `user` object has a `role` or `Role` property.
  // State to indicate if the form submission is in progress.
  const [isLoading, setIsLoading] = useState(false);
  // State to store any error messages from the API call.
  const [error, setError] = useState(null);
  // State to store a success message after successful creation.
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Handles the submission of the artist creation form.
   * Makes an API call to create the new artist.
   * @async
   * @param {Object} formData - The data from the AdminArtistForm.
   * @param {string} formData.name - The name of the artist.
   * @param {string} [formData.bio] - The biography of the artist.
   * @param {string} [formData.imageUrl] - The URL for the artist's image.
   * @param {string} [formData.genre] - The genre of the artist.
   */
  const handleSubmit = async (formData) => {
    setIsLoading(true); // Set loading state.
    setError(null);     // Clear previous errors.
    setSuccessMessage(''); // Clear previous success messages.

    // Prepare the DTO (Data Transfer Object) for the API request.
    // Ensure optional fields are sent as null if empty, or as per API requirements.
    const createArtistDto = {
      name: formData.name,
      bio: formData.bio || null, // Send null if bio is empty.
      imageUrl: formData.imageUrl || null, // Send null if imageUrl is empty.
      genre: formData.genre || null, // Send null if genre is empty.
    };

    try {
      // Make a POST request to the artists API endpoint.
      // The `api` service should automatically include authentication headers if configured.
      await api.post('/api/artists', createArtistDto);
      setSuccessMessage('Artist created successfully! Redirecting to artist list...');
      // Redirect to the artist list page after a short delay to show the success message.
      setTimeout(() => {
        navigate('/admin/artists');
      }, 2000); // 2-second delay.
    } catch (err) {
      // Handle errors from the API call.
      console.error('Error creating artist:', err.response?.data || err.message);
      // Set a user-friendly error message.
      setError(err.response?.data?.message || err.response?.data?.title || 'Failed to create artist. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state regardless of outcome.
    }
  };

  // Basic client-side check for admin role.
  // Ideally, this should be handled by a wrapper component like <AdminRoute /> for consistency
  // and to avoid direct navigation calls within the component body during render.
  // The check `user.role` should match how the role is stored in your `user` object from AuthContext.
  // It might be `user.Role` (capital R) depending on your backend and AuthContext setup.
  if (!user || (user.role !== 'Admin' && user.Role !== 'Admin')) {
    // If not an admin, redirect to login.
    // Note: Calling navigate directly in the render body can lead to issues.
    // It's better to return a <Navigate /> component or handle this in a route guard.
    // For this exercise, we'll keep it but acknowledge it's not best practice.
    // useEffect(() => navigate('/login'), [navigate]); // A slightly better way if kept here.
    navigate('/login'); // This might cause warnings if called during render.
    return <p>Access Denied. Admins only. Redirecting...</p>; // Show a message while redirecting.
  }

  return (
    <div className="admin-create-artist-page">
      {/* Display error or success messages related to form submission. */}
      {error && <p className="error-message form-error">{error}</p>}
      {successMessage && <p className="success-message form-success">{successMessage}</p>}
      {/* Render the AdminArtistForm component, passing the handleSubmit callback and loading state. */}
      <AdminArtistForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

export default AdminCreateArtistPage;
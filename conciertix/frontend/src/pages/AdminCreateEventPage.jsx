import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import the reusable form component for event creation/editing.
import AdminEventForm from '../components/AdminEventForm';
// Import the pre-configured axios instance for API calls.
import api from '../services/api';

/**
 * @function AdminCreateEventPage
 * @description Page component for creating a new event in the admin panel.
 * It fetches necessary data (artists, venues) for the form, uses the AdminEventForm component,
 * and handles the submission logic, including API calls and user feedback.
 *
 * @returns {JSX.Element} The rendered page for creating an event.
 */
const AdminCreateEventPage = () => {
  // Hook for programmatic navigation.
  const navigate = useNavigate();
  // State for storing the list of available artists (for selection in the form).
  const [artists, setArtists] = useState([]);
  // State for storing the list of available venues (for selection in the form).
  const [venues, setVenues] = useState([]);
  // State to indicate if data is currently being loaded (either initial data or during submission).
  const [isLoading, setIsLoading] = useState(false); // Consider setting to true initially for data fetch.
  // State to store any error messages from API calls.
  const [error, setError] = useState(null);
  // State to store a success message after successful creation.
  const [successMessage, setSuccessMessage] = useState('');

  // Effect to fetch initial data (artists and venues) when the component mounts.
  useEffect(() => {
    /**
     * Fetches artist and venue data from the API.
     * @async
     */
    const fetchData = async () => {
      setIsLoading(true); // Indicate start of data loading.
      try {
        // Use Promise.all to fetch artists and venues concurrently.
        const [artistsRes, venuesRes] = await Promise.all([
          api.get('/artists'), // API endpoint for fetching artists.
          api.get('/venues')   // API endpoint for fetching venues.
        ]);
        // Update state with fetched data. Fallback to empty array if data is not as expected.
        setArtists(artistsRes.data || []);
        setVenues(venuesRes.data || []);
        setError(null); // Clear any previous errors.
      } catch (err) {
        console.error("Error fetching artists or venues:", err);
        setError("Failed to load data for the form. Please try refreshing the page.");
        setArtists([]); // Reset to empty arrays on error.
        setVenues([]);
      } finally {
        setIsLoading(false); // Indicate end of data loading.
      }
    };
    fetchData();
  }, []); // Empty dependency array: run only once on component mount.

  /**
   * Handles the submission of the event creation form.
   * Prepares the payload and makes an API call to create the new event.
   * @async
   * @param {Object} formData - The data from the AdminEventForm.
   *                           Includes fields like name, description, eventDate, venueId, artistIds, etc.
   */
  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    // Prepare the payload for the API request.
    // Ensure numeric fields are correctly typed and artistIds is an array.
    const payload = {
      ...formData,
      totalCapacity: Number(formData.totalCapacity), // Convert to number.
      pricePerTicket: Number(formData.pricePerTicket), // Convert to number.
      artistIds: formData.artistIds || [], // Ensure artistIds is an array, even if undefined.
      // venueId is expected to be a string from the select input.
    };
    
    // Optional: Remove imagePosterUrl from payload if it's empty and the backend
    // prefers the field to be absent rather than an empty string for optional fields.
    if (payload.imagePosterUrl === '') {
        delete payload.imagePosterUrl;
    }

    try {
      // Make a POST request to the events API endpoint.
      await api.post('/events', payload);
      setSuccessMessage('Event created successfully! Redirecting to event list...');
      // Redirect to the admin events list page after a short delay.
      setTimeout(() => {
        navigate('/admin/events'); // Adjust route if necessary.
      }, 2000); // 2-second delay.
    } catch (err) {
      console.error("Error creating event:", err);
      // Set a user-friendly error message.
      const errorMessage = err.response?.data?.message || err.response?.data?.title || "Failed to create event. Please check the details and try again.";
      setError(errorMessage);
      // Log detailed validation errors if the backend provides them.
      if (err.response?.data?.errors) {
        console.error("Validation errors:", err.response.data.errors);
        // These could be formatted and displayed more specifically to the user if needed.
      }
    } finally {
      setIsLoading(false); // Reset loading state.
    }
  };

  // Display a loading message if initial data (artists/venues) is still being fetched.
  if (isLoading && artists.length === 0 && venues.length === 0) {
    return <div className="container mx-auto p-4 text-center">Loading form data...</div>;
  }

  return (
    <div className="container mx-auto p-4"> {/* Basic container styling */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Event</h1>
      {/* Display error message if an error occurred. */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {/* Display success message after successful creation. */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      {/* Render the AdminEventForm component. */}
      <AdminEventForm
        onSubmit={handleSubmit} // Pass the submit handler.
        artists={artists}       // Pass the fetched list of artists.
        venues={venues}         // Pass the fetched list of venues.
        isLoading={isLoading}   // Pass the current loading state.
        submitButtonText="Create Event" // Customize button text for creation mode.
      />
    </div>
  );
};

export default AdminCreateEventPage;
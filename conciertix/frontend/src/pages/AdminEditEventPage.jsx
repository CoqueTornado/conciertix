import React, { useState, useEffect } from 'react';
// useNavigate for redirection, useParams to get eventId from URL.
import { useNavigate, useParams } from 'react-router-dom';
// Reusable form component for event data.
import AdminEventForm from '../components/AdminEventForm';
// API service for backend communication.
import api from '../services/api';

/**
 * @function AdminEditEventPage
 * @description Page component for editing an existing event in the admin panel.
 * It fetches the event's current data and related data (artists, venues),
 * populates the AdminEventForm, and handles the submission of updated data.
 *
 * @returns {JSX.Element} The rendered page for editing an event.
 */
const AdminEditEventPage = () => {
  // Hook for programmatic navigation.
  const navigate = useNavigate();
  // Get eventId from URL parameters.
  const { eventId } = useParams();
  // State for the event's initial data to pre-fill the form.
  const [initialData, setInitialData] = useState(null);
  // State for the list of all available artists (for the form's select input).
  const [artists, setArtists] = useState([]);
  // State for the list of all available venues (for the form's select input).
  const [venues, setVenues] = useState([]);
  // State to indicate if the form submission (update) is in progress.
  const [isLoading, setIsLoading] = useState(false);
  // State to indicate if initial data (event, artists, venues) is being fetched.
  const [isFetchingData, setIsFetchingData] = useState(true);
  // State to store error messages (from fetching or updating).
  const [error, setError] = useState(null);
  // State for success messages after a successful update.
  const [successMessage, setSuccessMessage] = useState('');

  // Effect to fetch event details, all artists, and all venues when the component mounts or eventId changes.
  useEffect(() => {
    /**
     * Fetches all necessary data for the event edit form.
     * @async
     */
    const fetchData = async () => {
      setIsFetchingData(true); // Start fetching data.
      setError(null);         // Clear previous errors.
      try {
        // Fetch event details, all artists, and all venues concurrently.
        const [eventRes, artistsRes, venuesRes] = await Promise.all([
          api.get(`/events/${eventId}`), // API endpoint for specific event.
          api.get('/artists'),          // API endpoint for all artists.
          api.get('/venues')            // API endpoint for all venues.
        ]);
        
        const eventData = eventRes.data;
        
        // Process artist IDs from the event data.
        // The backend might return artists in different structures (e.g., array of full artist objects,
        // array of IDs, or through a join table like eventArtists). This logic attempts to handle common cases.
        let processedArtistIds = [];
        if (eventData.artists && Array.isArray(eventData.artists)) {
          // Case 1: eventData.artists is an array of artist objects, map to their IDs.
          processedArtistIds = eventData.artists.map(artist => artist.id);
        } else if (eventData.artistIds && Array.isArray(eventData.artistIds)) {
          // Case 2: eventData.artistIds is already an array of IDs.
          processedArtistIds = eventData.artistIds;
        } else if (eventData.eventArtists && Array.isArray(eventData.eventArtists)) {
          // Case 3: eventData.eventArtists is from a join table, map to artistId.
          processedArtistIds = eventData.eventArtists.map(ea => ea.artistId);
        }

        // Set initial data for the form, including the processed artistIds.
        setInitialData({ ...eventData, artistIds: processedArtistIds });
        // Set lists of all available artists and venues for the form dropdowns.
        setArtists(artistsRes.data || []);
        setVenues(venuesRes.data || []);

      } catch (err) {
        console.error("Error fetching data for edit page:", err);
        setError("Failed to load event data or supporting information. The event may not exist or an error occurred. Please try again.");
        // Reset artists and venues lists on error to prevent form issues.
        setArtists([]);
        setVenues([]);
      } finally {
        setIsFetchingData(false); // Finish fetching data.
      }
    };

    // Fetch data only if eventId is present.
    if (eventId) {
      fetchData();
    }
  }, [eventId]); // Dependency: eventId. Re-fetch if it changes.

  /**
   * Handles the submission of the updated event data.
   * Prepares the payload and makes an API call to update the event.
   * @async
   * @param {Object} formData - The updated data from the AdminEventForm.
   */
  const handleSubmit = async (formData) => {
    setIsLoading(true); // Start loading for submission.
    setError(null);     // Clear previous submission errors.
    setSuccessMessage(''); // Clear previous success messages.

    // Prepare payload for the API request.
    // Ensure numeric fields are numbers and artistIds is an array.
    const payload = {
      ...formData,
      totalCapacity: Number(formData.totalCapacity),
      pricePerTicket: Number(formData.pricePerTicket),
      artistIds: formData.artistIds || [], // Default to empty array if undefined.
    };
    
    // Optional: Remove imagePosterUrl if empty and backend prefers absence.
    if (payload.imagePosterUrl === '') {
        delete payload.imagePosterUrl;
    }

    try {
      // API call to update the event.
      await api.put(`/events/${eventId}`, payload);
      setSuccessMessage('Event updated successfully! Redirecting to event list...');
      // Redirect to admin events list after a delay.
      setTimeout(() => {
        navigate('/admin/events');
      }, 2000);
    } catch (err) {
      console.error("Error updating event:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.title || "Failed to update event. Please check the details and try again.";
      setError(errorMessage);
      // Log detailed validation errors if available from backend.
      if (err.response?.data?.errors) {
        console.error("Validation errors:", err.response.data.errors);
      }
    } finally {
      setIsLoading(false); // Finish loading for submission.
    }
  };

  // Display loading message while fetching initial data.
  if (isFetchingData) {
    return <div className="container mx-auto p-4 text-center">Loading event data...</div>;
  }

  // If fetching is done but no initialData (e.g., event not found or fetch error).
  if (!initialData && !isFetchingData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Event</h1>
        <p className="text-red-500">{error || "Event not found or could not be loaded."}</p>
        {/* Provide a button to go back to the event list. */}
        <button onClick={() => navigate('/admin/events')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Back to Event List
        </button>
      </div>
    );
  }
  
  // Render the main page content.
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Event</h1>
      {/* Display general error message if one exists and no success message is active. */}
      {error && !successMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {/* Display success message if event update was successful. */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      {/* Render the form only if initialData has been successfully fetched. */}
      {initialData && (
        <AdminEventForm
          initialData={initialData}       // Pass fetched data to pre-fill the form.
          onSubmit={handleSubmit}         // Pass the update handler.
          artists={artists}               // Pass the list of all artists for selection.
          venues={venues}                 // Pass the list of all venues for selection.
          isLoading={isLoading}           // Pass submission loading state.
          submitButtonText="Update Event" // Customize button text for edit mode.
        />
      )}
    </div>
  );
};

export default AdminEditEventPage;
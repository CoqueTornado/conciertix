import React, { useState, useEffect } from 'react';
// Link component for navigation, e.g., to create or edit event pages.
import { Link } from 'react-router-dom';
// API service for backend communication.
import api from '../services/api';
// Styles for this page.
import './AdminEventListPage.css';

/**
 * @function AdminEventListPage
 * @description Page component for listing and managing events in the admin panel.
 * It fetches events from an API, displays them in a table, and provides
 * options to create new events, edit existing ones, or delete them.
 *
 * @returns {JSX.Element} The rendered admin event list page.
 */
const AdminEventListPage = () => {
  // State for storing the list of events.
  const [events, setEvents] = useState([]);
  // State to indicate if event data is currently being loaded.
  const [loading, setLoading] = useState(true);
  // State to store any error messages from API calls.
  const [error, setError] = useState(null);

  // Effect to fetch events when the component mounts.
  useEffect(() => {
    /**
     * Fetches all events from the API.
     * @async
     */
    const fetchEvents = async () => {
      try {
        setLoading(true); // Indicate loading has started.
        // API call to get all events.
        // Note: The endpoint '/api/events' might differ based on actual API structure.
        // It's common for admin endpoints to fetch all data or paginated data.
        // This example assumes it fetches all events without pagination for simplicity.
        // For production, pagination (`api.get('/api/events?page=1&limit=10')`) is recommended.
        const response = await api.get('/api/events');
        setEvents(response.data || []); // Set events, fallback to empty array if data is null/undefined.
        setError(null); // Clear any previous errors.
      } catch (err) {
        // Set a user-friendly error message.
        setError(err.message || 'Failed to fetch events. Please try again.');
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false); // Indicate loading has finished.
      }
    };

    fetchEvents();
  }, []); // Empty dependency array: run only once on component mount.

  /**
   * Handles the deletion of an event.
   * Prompts for confirmation before making the API call.
   * @async
   * @param {string|number} eventId - The ID of the event to delete.
   */
  const handleDelete = async (eventId) => {
    // Confirm with the user before proceeding with deletion.
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        // API call to delete the event by its ID.
        await api.delete(`/api/events/${eventId}`);
        // Update the local state to remove the deleted event from the list.
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        // Optionally, display a success message (e.g., using a toast notification library).
        alert('Event deleted successfully!');
      } catch (err) {
        // Set an error message if deletion fails.
        setError(err.message || 'Failed to delete event. Please try again.');
        console.error("Error deleting event:", err);
        alert('Failed to delete event.'); // Simple alert for error.
      }
    }
  };

  // Display a loading message while event data is being fetched.
  if (loading) {
    return <div className="admin-page-container">Loading events...</div>;
  }

  // Display an error message if fetching events failed.
  if (error) {
    return <div className="admin-event-list-error admin-page-container">Error: {error}</div>;
  }

  return (
    <div className="admin-event-list-page admin-page-container">
      <h1>Event Management</h1>
      {/* Link to navigate to the page for creating a new event. */}
      <Link to="/admin/events/new" className="btn btn-primary mb-3">
        Create New Event
      </Link>
      {/* Conditional rendering: display message if no events, otherwise display the table. */}
      {events.length === 0 ? (
        <p>No events found. Create one!</p>
      ) : (
        <table className="table table-striped event-table"> {/* Added 'event-table' for specific styling */}
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Status</th>
              <th>Tickets (Avail/Total)</th>
              <th>Price (€)</th> {/* Assuming price is in Euros */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{event.name}</td>
                <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                <td>{event.venueName || 'N/A'}</td>
                <td>{event.status || 'N/A'}</td>
                {/* Ensure availableTickets and totalCapacity are present in event object */}
                <td>{typeof event.availableTickets !== 'undefined' ? event.availableTickets : 'N/A'} / {event.totalCapacity || 'N/A'}</td>
                {/* Display price, format to 2 decimal places, or 'N/A'/'Free'. */}
                <td>{event.pricePerTicket > 0 ? `€${event.pricePerTicket.toFixed(2)}` : (event.pricePerTicket === 0 ? 'Free' : 'N/A')}</td>
                <td>
                  {/* Link to edit the specific event. */}
                  <Link to={`/admin/events/edit/${event.id}`} className="btn btn-sm btn-warning me-2">
                    Edit
                  </Link>
                  {/* Button to delete the specific event. */}
                  <button onClick={() => handleDelete(event.id)} className="btn btn-sm btn-danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Future: Add pagination controls if the list becomes long. */}
    </div>
  );
};

export default AdminEventListPage;
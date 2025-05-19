// Import React hooks for state, effects, and context.
import React, { useState, useEffect, useContext, useCallback } from 'react';
// Import useAuth hook to access authentication token.
import { useAuth } from '../context/AuthContext.jsx';
// Import the pre-configured axios instance for API calls.
import api from '../services/api';
// Import styles for this page.
import './MyReservationsPage.css';

/**
 * @function MyReservationsPage
 * @description Page component for users to view their event reservations.
 * It fetches the user's reservations, displays them categorized as active/upcoming
 * and past/cancelled. Allows users to cancel active reservations, download e-tickets,
 * and add events to their calendar.
 *
 * @returns {JSX.Element} The rendered page displaying user's reservations.
 */
const MyReservationsPage = () => {
  // State for storing the list of all reservations for the user.
  const [reservations, setReservations] = useState([]);
  // State to indicate if reservation data is currently being loaded.
  const [loading, setLoading] = useState(true);
  // State to store any general error messages from API calls.
  const [error, setError] = useState(null);
  // State to track which reservation is currently being cancelled (to show loading state on button).
  const [cancellingReservationId, setCancellingReservationId] = useState(null);
  // State to store error messages specific to cancellation attempts.
  const [cancelError, setCancelError] = useState(null);
  // State to track which ticket is currently being downloaded.
  const [downloadingTicketId, setDownloadingTicketId] = useState(null);
  // State to store error messages specific to ticket download attempts.
  const [downloadError, setDownloadError] = useState(null);
  // State to track which calendar event (.ics file) is being downloaded.
  const [downloadingCalendarId, setDownloadingCalendarId] = useState(null);
  // State to store error messages specific to calendar file download attempts.
  const [calendarDownloadError, setCalendarDownloadError] = useState(null);
  // Get authentication token from AuthContext to ensure API calls are authenticated.
  const { token } = useAuth();

  /**
   * Fetches the current user's reservations from the API.
   * Uses `useCallback` for memoization.
   * @async
   */
  const fetchReservations = useCallback(async () => {
    // If no token, user is not authenticated; set error and stop loading.
    if (!token) {
      setLoading(false);
      setError(new Error('User not authenticated. Please log in to view your reservations.'));
      return;
    }
    try {
      setLoading(true); // Indicate start of data fetching.
      // API call to get user's reservations. Endpoint assumes '/reservations/my-reservations'.
      const response = await api.get('/reservations/my-reservations');
      setReservations(response.data || []); // Store fetched reservations, fallback to empty array.
      setError(null); // Clear any previous errors.
    } catch (err) {
      console.error('Error fetching reservations:', err);
      // Set a user-friendly error message.
      setError(err.response?.data?.message || err.message || 'Failed to fetch your reservations.');
      setReservations([]); // Clear reservations list on error.
    } finally {
      setLoading(false); // Indicate end of data fetching.
    }
  }, [token]); // Dependency: token. Re-fetch if token changes (e.g., on login/logout).

  // Effect to fetch reservations when the component mounts or the token changes.
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]); // `fetchReservations` is memoized.

  /**
   * Handles the cancellation of a reservation.
   * Prompts for confirmation and makes an API call to cancel.
   * @async
   * @param {string|number} reservationId - The ID of the reservation to cancel.
   */
  const handleCancelReservation = async (reservationId) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      setCancellingReservationId(reservationId); // Set loading state for this specific reservation's cancel button.
      setCancelError(null); // Clear previous cancellation errors.
      try {
        // API call to cancel the reservation. Endpoint assumes '/reservations/:id/cancel'.
        await api.post(`/reservations/${reservationId}/cancel`);
        alert('Reservation cancelled successfully.'); // Simple success feedback.
        fetchReservations(); // Re-fetch reservations to update the list.
      } catch (err) {
        console.error('Error cancelling reservation:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to cancel reservation.';
        setCancelError(errorMessage); // Store cancellation error for display.
        alert(`Cancellation failed: ${errorMessage}`); // Simple error feedback.
      } finally {
        setCancellingReservationId(null); // Reset loading state for the cancel button.
      }
    }
  };

  /**
   * Handles downloading the e-ticket (PDF) for a reservation.
   * Makes an API call that returns a blob, then triggers a browser download.
   * @async
   * @param {string|number} reservationId - The ID of the reservation.
   * @param {string} uniqueBookingReference - The booking reference, used for the filename.
   */
  const handleDownloadTicket = async (reservationId, uniqueBookingReference) => {
    setDownloadingTicketId(reservationId); // Set loading state for this ticket's download button.
    setDownloadError(null); // Clear previous download errors.
    try {
      // API call to get the ticket PDF. `responseType: 'blob'` is crucial.
      const response = await api.get(`/reservations/${reservationId}/ticket`, {
        responseType: 'blob',
      });

      // Create a blob URL from the response data.
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a'); // Create a temporary anchor element.
      link.href = url;

      // Attempt to get filename from Content-Disposition header; otherwise, construct a default.
      let filename = `Ticket-${uniqueBookingReference || reservationId}.pdf`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      link.setAttribute('download', filename); // Set download attribute with the filename.

      document.body.appendChild(link); // Append link to the body.
      link.click(); // Programmatically click the link to trigger download.
      link.parentNode.removeChild(link); // Remove the temporary link.
      window.URL.revokeObjectURL(url); // Release the blob URL.

    } catch (err) {
      console.error('Error downloading ticket:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to download ticket.';
      setDownloadError(`Failed to download ticket for booking ${uniqueBookingReference || reservationId}: ${errorMessage}`);
      alert(`Ticket download failed: ${errorMessage}`); // Simple error feedback.
    } finally {
      setDownloadingTicketId(null); // Reset loading state for the download button.
    }
  };

  /**
   * Handles adding an event to the user's calendar by downloading an .ics file.
   * Makes an API call that returns a blob, then triggers a browser download.
   * @async
   * @param {string|number} reservationId - The ID of the reservation.
   * @param {string} eventName - The name of the event, used for the .ics filename.
   * @param {string} eventDate - The date of the event, used for the .ics filename.
   */
  const handleAddToCalendar = async (reservationId, eventName, eventDate) => {
    setDownloadingCalendarId(reservationId); // Set loading state for this calendar button.
    setCalendarDownloadError(null); // Clear previous calendar download errors.
    try {
      // API call to get the .ics calendar file. `responseType: 'blob'` is crucial.
      const response = await api.get(`/reservations/${reservationId}/calendar`, {
        responseType: 'blob',
      });

      // Create a blob URL from the response data.
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/calendar' }));
      const link = document.createElement('a'); // Create a temporary anchor element.
      link.href = url;

      // Sanitize eventName and format eventDate for a safe and descriptive filename.
      const safeEventName = eventName ? eventName.replace(/[^a-z0-9_.-]/gi, '_') : 'Event';
      const safeEventDate = eventDate ? new Date(eventDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const filename = `Event-${safeEventName}-${safeEventDate}.ics`;

      link.setAttribute('download', filename); // Set download attribute.
      document.body.appendChild(link);
      link.click(); // Trigger download.
      link.parentNode.removeChild(link); // Clean up.
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error downloading calendar file:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to download calendar file.';
      setCalendarDownloadError(`Failed to download .ics for reservation ${reservationId}: ${errorMessage}`);
      alert(`Calendar download failed: ${errorMessage}`); // Simple error feedback.
    } finally {
      setDownloadingCalendarId(null); // Reset loading state for the calendar button.
    }
  };

  /**
   * Formats a date string into a more readable format (e.g., "January 1, 2023, 7:00 PM").
   * @param {string} dateString - The ISO date string to format.
   * @returns {string} The formatted date string, or 'N/A' if dateString is null/empty, or original string on error.
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, { // Uses browser's default locale.
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // Return original string if formatting fails.
    }
  };

  // Display loading message while fetching initial data.
  if (loading) {
    return <div className="loading-container my-reservations-page"><p>Loading your reservations...</p></div>;
  }

  // Display error message if fetching reservations failed.
  if (error) {
    return <div className="error-container my-reservations-page"><p>Error: {error.toString()}</p></div>;
  }

  // Filter reservations into active/upcoming and past/cancelled categories for display.
  const activeReservations = reservations.filter(
    (res) => res.status?.toLowerCase() === 'confirmed' || res.status?.toLowerCase() === 'active'
  );
  const pastOrCancelledReservations = reservations.filter(
    (res) => res.status?.toLowerCase() !== 'confirmed' && res.status?.toLowerCase() !== 'active'
  );

  // Main JSX for the page.
  return (
    <div className="my-reservations-page">
      <h1>My Reservations</h1>

      {/* Display cancellation error if any. */}
      {cancelError && (
        <div className="error-container" style={{ backgroundColor: 'lightpink', padding: '10px', marginBottom: '15px' }}>
          <p>Cancellation Error: {cancelError}</p>
        </div>
      )}
      {/* Display ticket download error if any. */}
      {downloadError && (
        <div className="error-container" style={{ backgroundColor: 'lightgoldenrodyellow', color: 'darkred', padding: '10px', marginBottom: '15px' }}>
          <p>Download Error: {downloadError}</p>
        </div>
      )}
      {/* Display calendar download error if any. */}
      {calendarDownloadError && (
        <div className="error-container" style={{ backgroundColor: 'lightcoral', color: 'white', padding: '10px', marginBottom: '15px' }}>
          <p>Calendar Download Error: {calendarDownloadError}</p>
        </div>
      )}

      {/* Message if user has no reservations and not currently loading. */}
      {reservations.length === 0 && !loading && (
        <p>You have no reservations yet. Explore events and book your tickets!</p>
      )}

      {/* Section for Active/Upcoming Reservations. */}
      {activeReservations.length > 0 && (
        <section className="reservations-section">
          <h2>Active/Upcoming Reservations</h2>
          <ul className="reservations-list">
            {activeReservations.map((reservation) => (
              <li key={reservation.id} className="reservation-item">
                <h3>{reservation.eventName || 'N/A'}</h3>
                <p><strong>Date:</strong> {formatDate(reservation.eventDate)}</p>
                <p><strong>Tickets:</strong> {reservation.numberOfTickets || 'N/A'}</p>
                <p><strong>Total Price:</strong> ${reservation.totalPrice?.toFixed(2) || 'N/A'}</p>
                <p><strong>Booking Reference:</strong> {reservation.uniqueBookingReference || 'N/A'}</p>
                <p><strong>Status:</strong> <span className={`status status-${reservation.status?.toLowerCase()}`}>{reservation.status || 'N/A'}</span></p>
                <div className="reservation-actions">
                  {/* Download E-Ticket Button */}
                  <button
                    onClick={() => handleDownloadTicket(reservation.id, reservation.uniqueBookingReference)}
                    disabled={downloadingTicketId === reservation.id || reservation.status?.toLowerCase() !== 'confirmed'}
                    title={reservation.status?.toLowerCase() !== 'confirmed' ? 'Ticket available only for confirmed reservations' : 'Download E-Ticket'}
                  >
                    {downloadingTicketId === reservation.id ? 'Downloading...' : 'Download E-Ticket'}
                  </button>
                  {/* Cancel Reservation Button */}
                  <button
                    onClick={() => handleCancelReservation(reservation.id)}
                    disabled={cancellingReservationId === reservation.id || (reservation.status?.toLowerCase() !== 'confirmed' && reservation.status?.toLowerCase() !== 'active')}
                    title={ (reservation.status?.toLowerCase() !== 'confirmed' && reservation.status?.toLowerCase() !== 'active') ? 'Cannot cancel this reservation' : 'Cancel Reservation'}
                  >
                    {cancellingReservationId === reservation.id ? 'Cancelling...' : 'Cancel Reservation'}
                  </button>
                  {/* Add to Calendar Button */}
                  <button
                    onClick={() => handleAddToCalendar(reservation.id, reservation.eventName, reservation.eventDate)}
                    disabled={downloadingCalendarId === reservation.id || reservation.status?.toLowerCase() !== 'confirmed'}
                    title={reservation.status?.toLowerCase() !== 'confirmed' ? 'Only available for confirmed reservations' : 'Add to Calendar'}
                  >
                    {downloadingCalendarId === reservation.id ? 'Downloading...' : 'Add to Calendar'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Section for Past/Cancelled Reservations. */}
      {pastOrCancelledReservations.length > 0 && (
        <section className="reservations-section">
          <h2>Past/Cancelled Reservations</h2>
          <ul className="reservations-list">
            {pastOrCancelledReservations.map((reservation) => (
              <li key={reservation.id} className="reservation-item past-item"> {/* Added 'past-item' for distinct styling. */}
                <h3>{reservation.eventName || 'N/A'}</h3>
                <p><strong>Date:</strong> {formatDate(reservation.eventDate)}</p>
                <p><strong>Tickets:</strong> {reservation.numberOfTickets || 'N/A'}</p>
                <p><strong>Total Price:</strong> ${reservation.totalPrice?.toFixed(2) || 'N/A'}</p>
                <p><strong>Booking Reference:</strong> {reservation.uniqueBookingReference || 'N/A'}</p>
                <p><strong>Status:</strong> <span className={`status status-${reservation.status?.toLowerCase()}`}>{reservation.status || 'N/A'}</span></p>
                 <div className="reservation-actions">
                  {/* Typically no actions for past/cancelled reservations, or could show 'View Details' if applicable. */}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default MyReservationsPage;
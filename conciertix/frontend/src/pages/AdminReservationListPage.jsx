import React, { useState, useEffect, useCallback } from 'react';
// API service functions for fetching and managing reservations.
import { getAllReservations, cancelReservation } from '../services/api';
// Styles for this page.
import './AdminReservationListPage.css';

/**
 * @function AdminReservationListPage
 * @description Page component for listing and managing event reservations in the admin panel.
 * It allows admins to view all reservations, filter them, and cancel existing reservations.
 * Includes pagination and loading/error/success states.
 *
 * @returns {JSX.Element} The rendered admin reservation list page.
 */
const AdminReservationListPage = () => {
  // State for storing the list of reservations.
  const [reservations, setReservations] = useState([]);
  // State for filter criteria (eventId, userId, status).
  const [filters, setFilters] = useState({
    eventId: '',
    userId: '',
    status: '', // e.g., 'Confirmed', 'Cancelled', or empty for all.
  });
  // State for pagination details (current page, items per page, total pages).
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // Number of reservations per page.
    totalPages: 1,
  });
  // State to indicate if data is currently being loaded or an action is in progress.
  const [loading, setLoading] = useState(false);
  // State to store any error messages from API calls.
  const [error, setError] = useState(null);
  // State for success messages (e.g., after cancelling a reservation).
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Fetches reservations from the API based on current filters and pagination.
   * Uses `useCallback` for memoization to optimize performance.
   * @async
   */
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(''); // Clear previous success messages on new fetch.
    try {
      // Construct query parameters for the API request.
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters, // Spread filter values.
      };
      // Remove empty filter parameters to avoid sending them to the API.
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      // Call the API service to get reservations.
      const response = await getAllReservations(params);
      // Update state with fetched reservations. Adjust based on API response structure.
      // Assumes response.data.reservations or response.data is the array of reservations.
      setReservations(response.data.reservations || response.data || []);
      
      // Update pagination state based on API response.
      if (response.data.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.pagination.totalPages,
        }));
      } else if (response.data.totalItems && response.data.limit) {
        // Fallback if pagination info is structured differently (e.g., totalItems and limit).
         setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(response.data.totalItems / response.data.limit),
        }));
      } else {
        // If no pagination info, assume 1 page or adjust as needed.
        setPagination(prev => ({ ...prev, totalPages: 1}));
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reservations. Please try again.');
      console.error("Fetch reservations error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]); // Dependencies: re-fetch if filters or pagination changes.

  // Effect to fetch reservations when the component mounts or `fetchReservations` function reference changes.
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]); // `fetchReservations` is memoized by useCallback.

  /**
   * Handles changes in filter input fields.
   * Updates the `filters` state and resets pagination to the first page.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e - The input change event.
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when filters change.
  };

  /**
   * Handles the cancellation of a reservation.
   * Prompts for confirmation and makes an API call to cancel.
   * @async
   * @param {string|number} reservationId - The ID of the reservation to cancel.
   */
  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? This action may not be reversible.')) {
      return; // Do nothing if user cancels the confirmation.
    }
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      await cancelReservation(reservationId); // API call to cancel.
      setSuccessMessage('Reservation cancelled successfully.');
      fetchReservations(); // Refresh the list of reservations.
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel reservation. Please try again.');
      console.error("Cancel reservation error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles changing the current page for pagination.
   * @param {number} newPage - The new page number to navigate to.
   */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="admin-reservation-list-page admin-page-container">
      <h2>Reservation Management</h2>

      {/* Display error and success messages. */}
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {/* Filter controls section. */}
      <div className="filters-container">
        <input
          type="text"
          name="eventId"
          placeholder="Filter by Event ID"
          value={filters.eventId}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="userId" // Could be user ID or part of user name depending on backend search.
          placeholder="Filter by User ID/Name"
          value={filters.userId}
          onChange={handleFilterChange}
        />
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          {/* Add other relevant reservation statuses if applicable (e.g., Pending, Attended). */}
        </select>
      </div>

      {/* Loading indicator. */}
      {loading && <p>Loading reservations...</p>}

      {/* Message if no reservations are found and not currently loading. */}
      {!loading && reservations.length === 0 && <p>No reservations found matching your criteria.</p>}

      {/* Display table and pagination if reservations exist and not loading. */}
      {!loading && reservations.length > 0 && (
        <>
          <table className="reservations-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Event Name</th>
                <th>User Name</th>
                <th>Reservation Date</th>
                <th>Tickets</th>
                <th>Total Price (€)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(reservation => (
                <tr key={reservation.id}>
                  <td>{reservation.uniqueBookingReference || 'N/A'}</td>
                  <td>{reservation.eventName || 'N/A'}</td>
                  <td>{reservation.userName || 'N/A'}</td>
                  <td>{new Date(reservation.reservationDate).toLocaleDateString()}</td>
                  <td>{reservation.numberOfTickets}</td>
                  <td>€{reservation.totalPrice?.toFixed(2) || '0.00'}</td>
                  <td>{reservation.status}</td>
                  <td>
                    {/* Allow cancellation only if the reservation is 'Confirmed'. */}
                    {reservation.status === 'Confirmed' && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="cancel-button" // Style this button appropriately.
                        disabled={loading} // Disable while another action is loading.
                      >
                        Cancel Reservation
                      </button>
                    )}
                    {/* Placeholder for future actions like validating tickets or check-in. */}
                    <button disabled className="placeholder-button" style={{marginLeft: '10px'}}>Validate/Check-in (Future)</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls. */}
          {pagination.totalPages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReservationListPage;
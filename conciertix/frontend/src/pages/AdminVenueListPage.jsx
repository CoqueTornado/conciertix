import React, { useState, useEffect, useCallback } from 'react';
// Link for navigation (though buttons with navigate are used here), useNavigate for programmatic navigation.
import { Link, useNavigate } from 'react-router-dom';
// API service for backend communication.
import api from '../services/api';
// Styles for this page.
import './AdminVenueListPage.css';

/**
 * @function AdminVenueListPage
 * @description Page component for listing, managing (edit/delete), and creating venues in the admin panel.
 * It fetches venues from an API, supports pagination (basic client-side idea, needs backend for full support),
 * and allows deletion of venues. Includes search term state for future implementation.
 *
 * @returns {JSX.Element} The rendered admin venue list page.
 */
const AdminVenueListPage = () => {
  // State for storing the list of venues.
  const [venues, setVenues] = useState([]);
  // State to indicate if data is currently being loaded.
  const [loading, setLoading] = useState(true);
  // State to store any error messages from API calls.
  const [error, setError] = useState(null);
  // State for the current page number in pagination.
  const [currentPage, setCurrentPage] = useState(1);
  // State for the total number of pages available (ideally from API).
  const [totalPages, setTotalPages] = useState(1);
  // State for the search term (for future search functionality).
  const [searchTerm, setSearchTerm] = useState('');

  // Hook for programmatic navigation.
  const navigate = useNavigate();

  /**
   * Fetches venues from the API based on page number and search term.
   * Uses `useCallback` to memoize the function.
   * @async
   * @param {number} [page=1] - The page number to fetch.
   * @param {string} [search=''] - The search term to filter venues.
   */
  const fetchVenues = useCallback(async (page = 1, search = '') => {
    setLoading(true); // Indicate loading has started.
    setError(null);   // Clear previous errors.
    try {
      // Construct query parameters for the API request.
      // Assumes API supports `page`, `limit`, and `search` query parameters.
      const params = { page, limit: 10 }; // Default limit of 10 items per page.
      if (search) {
        params.search = search; // Add search term if provided.
      }
      // API call to get venues.
      const response = await api.get('/venues', { params }); // Endpoint might be /api/venues
      
      // Update state with fetched data. Adjust based on your API's response structure.
      // `response.data.items` or `response.data.venues` for list, `response.data` for a simple array.
      setVenues(response.data.venues || response.data.items || response.data || []);
      
      // Update totalPages based on API response.
      // Common structures: response.data.totalPages, response.data.meta.totalPages, or calculate from totalCount.
      setTotalPages(response.data.totalPages || Math.ceil((response.data.totalCount || (response.data.items || response.data || []).length) / params.limit) || 1);
      setCurrentPage(response.data.currentPage || page); // Update current page from API if provided.
    } catch (err) {
      console.error("Error fetching venues:", err);
      // Set a user-friendly error message.
      setError(err.response?.data?.message || 'Failed to fetch venues. Please try again.');
    } finally {
      setLoading(false); // Indicate loading has finished.
    }
  }, []); // Empty dependency array: function doesn't depend on component state/props that would cause re-creation.

  // Effect to fetch venues when the component mounts or when currentPage/searchTerm changes.
  useEffect(() => {
    fetchVenues(currentPage, searchTerm);
  }, [fetchVenues, currentPage, searchTerm]); // Dependencies: fetchVenues function, currentPage, and searchTerm.

  /**
   * Handles the deletion of a venue.
   * Prompts for confirmation before deleting.
   * @async
   * @param {string|number} venueId - The ID of the venue to delete.
   */
  const handleDeleteVenue = async (venueId) => {
    // Confirm with the user before deleting.
    if (window.confirm('Are you sure you want to delete this venue? This may affect existing events.')) {
      try {
        await api.delete(`/venues/${venueId}`); // API call to delete the venue. Endpoint might be /api/venues/:id
        // alert('Venue deleted successfully!'); // Optional: use a notification system.
        // Update local state to remove the deleted venue.
        setVenues(prevVenues => prevVenues.filter(venue => venue.id !== venueId));
        // Consider re-fetching if total count/pages might change and affect pagination display.
        // If current page becomes empty after deletion, might want to go to previous page.
        if (venues.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev -1); // This will trigger fetchVenues via useEffect
        } else {
            // fetchVenues(currentPage, searchTerm); // Or just refetch current page
        }
      } catch (err) {
        console.error("Error deleting venue:", err);
        setError(err.response?.data?.message || 'Failed to delete venue. Please try again.');
      }
    }
  };

  /**
   * Navigates to the page for creating a new venue.
   */
  const handleCreateNew = () => {
    navigate('/admin/venues/new');
  };

  /**
   * Navigates to the page for editing an existing venue.
   * @param {string|number} venueId - The ID of the venue to edit.
   */
  const handleEdit = (venueId) => {
    navigate(`/admin/venues/edit/${venueId}`);
  };
  
  /**
   * Navigates to the next page of venues.
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1); // useEffect will trigger fetchVenues.
    }
  };

  /**
   * Navigates to the previous page of venues.
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1); // useEffect will trigger fetchVenues.
    }
  };

  // Display a loading message while data is being fetched.
  if (loading && venues.length === 0) { // Show loading only if no venues are displayed yet
    return <div className="admin-venue-list-page loading admin-page-container">Loading venues...</div>;
  }

  return (
    <div className="admin-venue-list-page admin-page-container">
      <h1>Venue Management</h1>
      {/* Display error message if an error occurred. */}
      {error && <div className="error-message">Error: {error}</div>}
      
      {/* Actions bar: search (optional) and create new button. */}
      <div className="actions-bar">
        {/* Optional: Search input for future implementation. */}
        {/*
        <input
            type="text"
            placeholder="Search venues..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset to page 1 on search
        />
        */}
        <button onClick={handleCreateNew} className="create-new-button">
          Create New Venue
        </button>
      </div>

      {/* Display message if no venues are found and not currently loading. */}
      {venues.length === 0 && !loading && <p>No venues found. Add one!</p>}

      {/* Display table and pagination if venues exist. */}
      {venues.length > 0 && (
        <>
          <table className="venues-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>City</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((venue) => (
                <tr key={venue.id}>
                  <td>{venue.name}</td>
                  <td>{venue.address}</td>
                  <td>{venue.city}</td>
                  <td className="venue-actions">
                    {/* Button to navigate to the edit venue page. */}
                    <button onClick={() => handleEdit(venue.id)} className="edit-button">
                      Edit
                    </button>
                    {/* Button to delete the venue. */}
                    <button onClick={() => handleDeleteVenue(venue.id)} className="delete-button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls: Display only if more than one page. */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button onClick={handlePreviousPage} disabled={currentPage === 1 || loading}>
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages || loading}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminVenueListPage;
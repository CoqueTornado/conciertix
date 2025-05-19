import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Assuming `getArtists` and `deleteArtist` are functions in your API service layer.
import { getArtists, deleteArtist } from '../services/api';
import './AdminArtistListPage.css'; // Styles for this page.

/**
 * @function AdminArtistListPage
 * @description Page component for listing, managing (edit/delete), and creating artists in the admin panel.
 * It fetches artists from an API, supports pagination, and allows deletion of artists.
 *
 * @returns {JSX.Element} The rendered admin artist list page.
 */
const AdminArtistListPage = () => {
  // State for storing the list of artists.
  const [artists, setArtists] = useState([]);
  // State to indicate if data is currently being loaded.
  const [loading, setLoading] = useState(true);
  // State to store any error messages from API calls.
  const [error, setError] = useState(null);
  // State for the current page number in pagination.
  const [currentPage, setCurrentPage] = useState(1);
  // State for the total number of pages available.
  const [totalPages, setTotalPages] = useState(1);
  // State for the search term (for future implementation).
  // eslint-disable-next-line no-unused-vars -- Kept for future search functionality.
  const [searchTerm, setSearchTerm] = useState('');

  // Hook for programmatic navigation.
  const navigate = useNavigate();

  /**
   * Fetches artists from the API based on page number and search term.
   * Uses `useCallback` to memoize the function, preventing unnecessary re-creations.
   * @async
   * @param {number} [page=1] - The page number to fetch.
   * @param {string} [searchTerm=''] - The search term to filter artists (currently unused but planned).
   */
  const fetchArtists = useCallback(async (page = 1, currentSearchTerm = '') => {
    setLoading(true); // Indicate loading has started.
    setError(null);   // Clear previous errors.
    try {
      // Call the API service to get artists. Assumes it supports pagination (page, itemsPerPage) and search.
      const response = await getArtists(page, 10, currentSearchTerm); // Fetch 10 items per page.
      
      // Update state with fetched data. Adjust based on your API's response structure.
      // `response.data.items` for paginated list, `response.data` for a simple array.
      setArtists(response.data.items || response.data || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || page);
    } catch (err) {
      console.error("Error fetching artists:", err);
      // Set a user-friendly error message.
      setError(err.response?.data?.message || err.message || 'Failed to fetch artists. Please try again.');
    } finally {
      setLoading(false); // Indicate loading has finished.
    }
  }, []); // Empty dependency array for useCallback as it doesn't depend on component state/props directly.

  // Effect to fetch artists when the component mounts or when currentPage/searchTerm changes.
  useEffect(() => {
    fetchArtists(currentPage, searchTerm);
  }, [fetchArtists, currentPage, searchTerm]); // Dependencies: fetchArtists function, currentPage, and searchTerm.

  /**
   * Handles the deletion of an artist.
   * Prompts for confirmation before deleting.
   * @async
   * @param {string|number} artistId - The ID of the artist to delete.
   */
  const handleDeleteArtist = async (artistId) => {
    // Confirm with the user before deleting.
    if (window.confirm('Are you sure you want to delete this artist? This action cannot be undone.')) {
      try {
        await deleteArtist(artistId); // Call API to delete the artist.
        // Consider using a more sophisticated notification system than alert().
        // alert('Artist deleted successfully!');
        fetchArtists(currentPage, searchTerm); // Refetch artists to update the list.
      } catch (err) {
        console.error("Error deleting artist:", err);
        setError(err.response?.data?.message || err.message || 'Failed to delete artist. Please try again.');
      }
    }
  };

  /**
   * Navigates to the previous page of artists.
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      // `fetchArtists` will be called by the useEffect hook when `currentPage` changes.
      // However, calling it directly ensures immediate fetch if preferred.
      // For consistency with how `useEffect` is set up, changing `currentPage` is sufficient.
      setCurrentPage(prev => prev - 1);
    }
  };

  /**
   * Navigates to the next page of artists.
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Display a loading message while data is being fetched.
  if (loading && artists.length === 0) return <div className="loading-spinner">Loading artists...</div>;
  // Note: Error display is handled within the main return block for better layout control.

  return (
    <div className="admin-artist-list-page">
      <h2>Artist Management</h2>
      {/* Display error message if an error occurred during API calls. */}
      {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>Error: {error}</div>}
      
      {/* Actions section: e.g., button to create a new artist. */}
      <div className="admin-actions">
        <Link to="/admin/artists/new" className="btn btn-primary">Create New Artist</Link>
        {/* Placeholder for search input for future implementation. */}
        {/* <input type="text" placeholder="Search artists..." onChange={(e) => setSearchTerm(e.target.value)} /> */}
      </div>

      {/* Display message if no artists are found and not currently loading. */}
      {artists.length === 0 && !loading && <p>No artists found. Add some!</p>}
      
      {/* Display table and pagination if artists exist. */}
      {artists.length > 0 && (
        <>
          <table className="artists-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Genre</th>
                <th>Bio (Snippet)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr key={artist.id}>
                  <td>{artist.name}</td>
                  <td>{artist.genre || 'N/A'}</td>
                  {/* Display a snippet of the bio, or 'N/A' if no bio. */}
                  <td>{artist.bio ? `${artist.bio.substring(0, 100)}${artist.bio.length > 100 ? '...' : ''}` : 'N/A'}</td>
                  <td>
                    {/* Button to navigate to the edit artist page. */}
                    <button
                      onClick={() => navigate(`/admin/artists/edit/${artist.id}`)}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    {/* Button to delete the artist. */}
                    <button
                      onClick={() => handleDeleteArtist(artist.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls. */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button onClick={handlePreviousPage} disabled={currentPage <= 1}>
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={handleNextPage} disabled={currentPage >= totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminArtistListPage;
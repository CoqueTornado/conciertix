// Import React hooks for state and lifecycle management.
import React, { useState, useEffect, useCallback } from 'react';
// Import the pre-configured axios instance for API calls from the centralized service.
import api from '../services/api';
// Import the EventCard component to display individual event summaries.
import EventCard from '../components/EventCard';

// Note: The direct import of 'axios' and the API_BASE_URL constant are removed as `api` service is now used.

/**
 * @function HomePage
 * @description The main landing page of the application.
 * It displays a list of upcoming events, allows users to filter these events
 * by various criteria (genre, date, city, artist), and search by a general term.
 * Implements pagination for navigating through event results.
 *
 * @returns {JSX.Element} The rendered home page with event listings and filters.
 */
function HomePage() {
  // State for storing the list of events fetched from the API.
  const [events, setEvents] = useState([]);
  // State for filter criteria applied by the user.
  const [filters, setFilters] = useState({
    genre: '',
    dateFrom: '',
    dateTo: '',
    city: '',
    artist: '', // Corresponds to artistName in API query params.
  });
  // State for the general search term entered by the user.
  const [searchTerm, setSearchTerm] = useState('');
  // State to indicate if event data is currently being loaded.
  const [loading, setLoading] = useState(false); // Initialize to false, true when fetchEvents starts.
  // State to store any error messages from API calls.
  const [error, setError] = useState(null);
  // State for the current page number in pagination.
  const [currentPage, setCurrentPage] = useState(1);
  // State for the total number of pages available, based on API response.
  const [totalPages, setTotalPages] = useState(1);

  // Debounce timer ID for search input.
  const [debounceTimeoutId, setDebounceTimeoutId] = useState(null);

  /**
   * Fetches events from the API based on current filters, search term, and pagination.
   * Uses `useCallback` for memoization to prevent unnecessary re-creations if dependencies haven't changed.
   * @async
   */
  const fetchEvents = useCallback(async () => {
    setLoading(true); // Indicate start of data fetching.
    setError(null);   // Clear previous errors.
    try {
      // Construct query parameters for the API request.
      // Undefined parameters are typically omitted by axios.
      const params = {
        page: currentPage,
        limit: 10, // Define page size (number of events per page).
        genre: filters.genre || undefined,
        startDate: filters.dateFrom || undefined,
        endDate: filters.dateTo || undefined,
        city: filters.city || undefined,
        artistName: filters.artist || undefined, // `artist` filter maps to `artistName` query param.
        searchTerm: searchTerm || undefined,
      };
      
      // Make API call using the centralized `api` service.
      const response = await api.get(`/events`, { params });
      
      let eventList = [];
      let pages = 1; // Default total pages to 1.

      // Process the API response to extract event list and pagination info.
      // This logic handles various common API response structures.
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Case: API returns a simple array of events (no explicit pagination info).
          eventList = response.data;
          // Estimate total pages if not provided; assumes this response is the only page.
          pages = response.data.length > 0 ? 1 : 0;
        } else if (typeof response.data === 'object' && response.data !== null) {
          // Case: API returns an object, potentially containing events and pagination details.
          if (Array.isArray(response.data.events)) {
            eventList = response.data.events;
          } else if (Array.isArray(response.data.data)) {
            eventList = response.data.data;
          } else if (Array.isArray(response.data.items)) {
            eventList = response.data.items;
          } else {
            // Log warning if events array is not found in expected locations.
            console.warn("HomePage: Events array not found in expected locations. Response data:", JSON.stringify(response.data, null, 2));
          }

          // Extract totalPages from common pagination structures.
          if (typeof response.data.totalPages === 'number') {
            pages = response.data.totalPages;
          } else if (response.data.pagination?.totalPages) { // Optional chaining
            pages = response.data.pagination.totalPages;
          } else if (response.data.meta?.totalPages) {
              pages = response.data.meta.totalPages;
          } else if (response.data.totalItems && params.limit) {
            // Calculate totalPages if totalItems and limit are provided.
            pages = Math.ceil(response.data.totalItems / params.limit);
          }
        } else {
          console.error("HomePage: Unexpected response.data format:", response.data);
          setError('Failed to process events: Unexpected data format from server.');
        }
      } else {
        console.error("HomePage: No data received in response.");
        setError('Failed to fetch events: No data received.');
      }
      
      setEvents(Array.isArray(eventList) ? eventList : []); // Ensure events is always an array.
      setTotalPages(pages > 0 ? pages : 1); // Ensure totalPages is at least 1.

    } catch (err) {
      // Handle errors during API call.
      console.error("Error fetching events in HomePage:", err.response?.data || err.message || err);
      let errorMessage = 'Failed to fetch events. Please try again later.';
      if (err.response?.data?.message) {
        errorMessage = `Failed to fetch events: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage = `Failed to fetch events: ${err.message}`;
      }
      setError(errorMessage);
      setEvents([]); // Clear events list on error.
      setTotalPages(1); // Reset pagination.
    } finally {
      setLoading(false); // Indicate end of data fetching.
    }
  }, [filters, searchTerm, currentPage]); // Dependencies: re-fetch if these change.

  // Effect to trigger `fetchEvents` when filters, searchTerm, or currentPage change.
  // The actual fetch is debounced for searchTerm changes by another useEffect below.
  useEffect(() => {
    // For direct filter changes or page changes, fetch immediately.
    // For searchTerm, the debounced useEffect will eventually lead to this.
    fetchEvents();
  }, [fetchEvents]); // fetchEvents is memoized and includes its own dependencies.

  /**
   * Handles changes in filter input fields.
   * Updates the `filters` state and resets pagination to the first page.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to page 1 when any filter changes.
  };

  /**
   * Handles changes in the search term input field.
   * Updates `searchTerm` state. Actual fetch is debounced.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Don't reset currentPage here immediately; let debounce handle triggering fetch.
    // If instant search is desired without debounce on each keystroke, then reset currentPage here.
  };
  
  // Debounced effect for search term changes.
  // This delays the API call until the user stops typing for a short period.
  useEffect(() => {
    // Clear the previous timeout if searchTerm changes again quickly.
    if (debounceTimeoutId) {
      clearTimeout(debounceTimeoutId);
    }
    // Set a new timeout to trigger fetch after 500ms of inactivity.
    const newTimeoutId = setTimeout(() => {
      if (searchTerm !== undefined) { // Check if searchTerm is defined to avoid issues on initial load
        setCurrentPage(1); // Reset to page 1 when a new debounced search is performed.
        // The change in currentPage (if it actually changes) or the initial call from main useEffect will trigger fetchEvents.
        // If currentPage is already 1, and searchTerm was the only change, main useEffect will still re-run due to searchTerm dependency in fetchEvents.
      }
    }, 500); // 500ms debounce period.
    setDebounceTimeoutId(newTimeoutId);

    // Cleanup function to clear timeout if component unmounts or searchTerm changes again.
    return () => {
      clearTimeout(newTimeoutId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]); // Dependency: searchTerm.

  /**
   * Handles changing the current page for pagination.
   * @param {number} newPage - The new page number to navigate to.
   */
  const handlePageChange = (newPage) => {
    // Update current page only if it's within valid range.
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage); // This will trigger `fetchEvents` via useEffect.
    }
  };

  return (
    <div> {/* Main container for the home page. */}
      <h1 className="page-title">Discover Upcoming Events</h1>

      {/* Container for filter controls and search bar. */}
      <div className="filters-and-search-container">
        {/* Filter controls for genre, city, artist, and date range. */}
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="genre-filter">Genre</label>
            <input id="genre-filter" type="text" name="genre" placeholder="e.g., Rock, Jazz" value={filters.genre} onChange={handleFilterChange} className="filter-input"/>
          </div>
          <div className="filter-group">
            <label htmlFor="city-filter">City</label>
            <input id="city-filter" type="text" name="city" placeholder="e.g., New York, London" value={filters.city} onChange={handleFilterChange} className="filter-input"/>
          </div>
          <div className="filter-group">
            <label htmlFor="artist-filter">Artist</label>
            <input id="artist-filter" type="text" name="artist" placeholder="e.g., The Beatles" value={filters.artist} onChange={handleFilterChange} className="filter-input"/>
          </div>
          <div className="filter-group date-filter-group">
            <label htmlFor="dateFrom-filter">Start Date</label>
            <input id="dateFrom-filter" type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="filter-input date-input"/>
          </div>
          <div className="filter-group date-filter-group">
            <label htmlFor="dateTo-filter">End Date</label>
            <input id="dateTo-filter" type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="filter-input date-input"/>
          </div>
        </div>
        {/* Search bar for general event search. */}
        <div className="search-bar-container">
          <label htmlFor="search-input" className="visually-hidden">Search events</label> {/* Hidden label for accessibility. */}
          <div className="search-input-wrapper">
            <input id="search-input" type="text" placeholder="Search events by name, artist..." value={searchTerm} onChange={handleSearchChange} className="search-input"/>
            <span className="search-icon">🔍</span> {/* Magnifying glass icon. */}
          </div>
        </div>
      </div>

      {/* Display loading message while fetching data. */}
      {loading && <p className="loading-message">Loading events...</p>}
      {/* Display error message if an API call fails. */}
      {error && <p className="error-message">{error}</p>}

      {/* Container for the list of event cards. */}
      <div className="event-list-container">
        {events.length > 0 ? (
          // Map through the fetched events and render an EventCard for each.
          events.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          // Display message if no events match filters and not currently loading.
          !loading && <p className="no-events-message">No events match your current filters. Try adjusting your search or broadening your criteria!</p>
        )}
      </div>

      {/* Pagination controls, shown only if there is more than one page. */}
      {totalPages > 1 && (
        <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || loading}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || loading}>
          Next
        </button>
      </div>
      )}
    </div>
  );
}

export default HomePage;
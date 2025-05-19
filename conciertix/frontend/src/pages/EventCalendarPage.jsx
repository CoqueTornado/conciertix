// Import React hooks for state and lifecycle management.
import React, { useState, useEffect, useCallback } from 'react';
// Import components for navigation.
import { useNavigate, Link } from 'react-router-dom';
// Import react-big-calendar components and moment for date localization.
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
// Import default CSS for react-big-calendar.
import 'react-big-calendar/lib/css/react-big-calendar.css';
// Import API service for fetching event data.
import api from '../services/api';
// Import custom CSS for this page.
import './EventCalendarPage.css';

// Initialize moment localizer for react-big-calendar.
const localizer = momentLocalizer(moment);

/**
 * Helper function to format a date string for display (e.g., "January 1st 2023").
 * @param {string} dateString - The ISO date string to format.
 * @returns {string} The formatted date string.
 */
const formatDate = (dateString) => {
  return moment(dateString).format('MMMM Do YYYY');
};

/**
 * Helper function to format a time string for display (e.g., "7:30 PM").
 * @param {string} dateString - The ISO date string (containing time) to format.
 * @returns {string} The formatted time string.
 */
const formatTime = (dateString) => {
  return moment(dateString).format('h:mm A');
};

/**
 * @function EventCalendarPage
 * @description A page component that displays events in both a calendar view and a filterable list.
 * It fetches events, allows users to filter by search term, date, and genre,
 * and provides navigation to individual event detail pages.
 *
 * @returns {JSX.Element} The rendered event calendar page.
 */
function EventCalendarPage() {
  // State for the date currently displayed/focused on by the react-big-calendar component.
  const [displayedCalendarDate, setDisplayedCalendarDate] = useState(new Date());
  // State to store all events fetched from the API.
  const [allEvents, setAllEvents] = useState([]);
  // State to store events after applying filters (search, date, genre).
  const [filteredEvents, setFilteredEvents] = useState([]);
  // State to store events formatted for the react-big-calendar component.
  const [calendarEvents, setCalendarEvents] = useState([]);
  // State to indicate if event data is currently being loaded.
  const [loading, setLoading] = useState(true);
  // State to store any error messages from API calls.
  const [error, setError] = useState(null);
  // Hook for programmatic navigation.
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState(''); // For text-based search.
  const [selectedDate, setSelectedDate] = useState(''); // For filtering by a specific date.
  const [selectedGenre, setSelectedGenre] = useState(''); // For filtering by genre.
  // State to store unique genres extracted from events, for populating the genre filter dropdown.
  const [availableGenres, setAvailableGenres] = useState([]);

  /**
   * Fetches all events within a broad date range (current month to one year ahead).
   * Populates `allEvents` and `availableGenres`.
   * Uses `useCallback` for memoization.
   * @async
   */
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Define a wide date range to fetch a good set of events.
      const startDate = moment().startOf('month').toISOString();
      const endDate = moment().add(1, 'year').endOf('month').toISOString();

      // API call to fetch events. Assumes API supports date range and pagination.
      // Fetches a large number of events (pageSize=1000) to simplify client-side filtering for this example.
      const response = await api.get(`/events?startDate=${startDate}&endDate=${endDate}&pageNumber=1&pageSize=1000`);
      
      let eventList = [];
      // Handle various possible API response structures for the event list.
      if (Array.isArray(response.data)) {
        eventList = response.data;
      } else if (response.data && Array.isArray(response.data.events)) { // Common structure: { events: [] }
        eventList = response.data.events;
      } else if (response.data && Array.isArray(response.data.data)) { // Common structure: { data: [] }
        eventList = response.data.data;
      } else if (response.data && typeof response.data === 'object' && response.data !== null && Object.keys(response.data).length > 0) {
        // Attempt to find an array key if the data is nested within an object.
        const arrayKey = Object.keys(response.data).find(key => Array.isArray(response.data[key]));
        if (arrayKey) {
            eventList = response.data[arrayKey];
        } else {
            setError("Received an unexpected data format for events.");
        }
      } else {
        setError(response.data?.message || "Failed to process events from server. Unexpected format.");
      }
      
      setAllEvents(eventList); // Store all fetched events.

      // Extract unique genres from the event list for the filter dropdown.
      const genres = [...new Set(eventList.map(event => event.genre).filter(Boolean))]; // Filter out null/empty genres.
      setAvailableGenres(genres.sort()); // Sort genres alphabetically.

    } catch (err) {
      console.error("[EventCalendarPage] Error fetching events:", err);
      setError(err.message || 'Failed to fetch events. Please check your connection and try again.');
    } finally {
      setLoading(false); // Mark loading as complete.
    }
  }, []); // Empty dependency array: fetchEvents itself doesn't depend on component state/props.

  // Effect to fetch events when the component mounts.
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // Dependency: fetchEvents (memoized).

  // Effect to filter events whenever `allEvents` or any filter criteria (searchTerm, selectedDate, selectedGenre) changes.
  useEffect(() => {
    let currentEvents = [...allEvents]; // Start with all fetched events.

    // Apply search term filter.
    if (searchTerm) {
      currentEvents = currentEvents.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.venue?.name && event.venue.name.toLowerCase().includes(searchTerm.toLowerCase())) || // Check if venue and venue.name exist
        (event.artists && event.artists.some(artist => artist.name.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Apply date filter.
    if (selectedDate) {
      currentEvents = currentEvents.filter(event =>
        moment(event.eventDate).isSame(selectedDate, 'day') // Compare dates ignoring time.
      );
    }

    // Apply genre filter.
    if (selectedGenre) {
      currentEvents = currentEvents.filter(event => event.genre === selectedGenre);
    }

    setFilteredEvents(currentEvents); // Update the list of filtered events for display.

    // Format the filtered events for the react-big-calendar.
    const formattedForCalendar = currentEvents.map(event => ({
      id: event.id,         // Event ID.
      title: event.name,    // Event name (displayed on the calendar).
      start: new Date(event.eventDate), // Start date/time of the event.
      end: new Date(event.eventDate),   // End date/time (can be same as start for single-day events).
      resource: event,      // Store the full event object for access on select.
    }));
    setCalendarEvents(formattedForCalendar); // Update events for the calendar view.
  }, [allEvents, searchTerm, selectedDate, selectedGenre]); // Dependencies: re-filter when these change.

  /**
   * Handles selection of an event on the react-big-calendar.
   * Navigates to the event's detail page.
   * @param {Object} event - The calendar event object (contains `resource` with full event data).
   */
  const handleSelectEventOnCalendar = (event) => {
    navigate(`/events/${event.resource.id}`); // Navigate using the event ID from the resource.
  };
  
  /**
   * Handles navigation within the react-big-calendar (e.g., changing month).
   * Updates the `displayedCalendarDate` state.
   * @param {Date} newDate - The new date/month the calendar has navigated to.
   */
  const handleNavigateCalendar = (newDate) => {
    setDisplayedCalendarDate(newDate);
    // Note: This currently only updates the calendar's displayed month.
    // The `filteredEvents` list and `calendarEvents` are driven by the main filters,
    // not by the calendar's internal navigation month unless explicitly implemented.
  };

  /**
   * Clears all active filters (search term, selected date, selected genre).
   */
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
    setSelectedGenre('');
  };

  // Display loading message while initial data is being fetched.
  if (loading && allEvents.length === 0) return <div className="loading-message event-calendar-page">Loading events...</div>;
  // Display error message if fetching failed.
  if (error) return <div className="error-message event-calendar-page">Error loading events: {error}</div>;

  return (
    <div className="event-calendar-page">
      <h1 className="page-title">Explore Upcoming Events</h1>

      {/* Container for filter controls. */}
      <div className="filters-search-container">
        {/* Search input */}
        <div className="form-group">
          <label htmlFor="search-term">Search Events</label>
          <input
            type="text"
            id="search-term"
            placeholder="Event name, artist, venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Date picker filter */}
        <div className="form-group">
          <label htmlFor="date-filter">Filter by Date</label>
          <input
            type="date"
            id="date-filter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        {/* Genre select filter */}
        <div className="form-group">
          <label htmlFor="genre-filter">Filter by Genre</label>
          <select
            id="genre-filter"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {/* Populate genre options from availableGenres state. */}
            {availableGenres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
        {/* Button to clear all filters. */}
        <button onClick={handleClearFilters} className="filter-button" style={{backgroundColor: '#6c757d'}}>Clear Filters</button>
      </div>

      {/* Layout for calendar view and event list view. */}
      <div className="calendar-and-events-layout">
        {/* Calendar View Section */}
        <div className="calendar-container-wrapper">
          <h2 className="calendar-section-title">Event Calendar View</h2>
          <div className="calendar-container">
            <Calendar
              localizer={localizer} // Moment.js localizer.
              date={displayedCalendarDate} // Controlled date for calendar navigation.
              events={calendarEvents} // Events to display on the calendar.
              startAccessor="start"   // Accessor for event start date.
              endAccessor="end"       // Accessor for event end date.
              style={{ height: '100%' }} // Ensure calendar takes full height of its container.
              onSelectEvent={handleSelectEventOnCalendar} // Handler for clicking an event.
              onNavigate={handleNavigateCalendar} // Handler for changing month/view.
              views={['month']} // Only show month view.
              defaultView="month"
              popup // Use popups for events on days with many entries.
            />
          </div>
        </div>

        {/* Event List Section */}
        <div className="event-list-container">
          <h2 className="section-title">
            {/* Title changes based on whether filters are active. */}
            {searchTerm || selectedDate || selectedGenre ? 'Filtered Events' : 'All Upcoming Events'} ({filteredEvents.length})
          </h2>
          {/* Display event cards or a "no events" message. */}
          {filteredEvents.length > 0 ? (
            <div className="event-grid"> {/* Grid layout for event cards. */}
              {filteredEvents.map(event => (
                // Event card, navigates to event details on click.
                <div key={event.id} className="event-card" onClick={() => navigate(`/events/${event.id}`)}>
                  <h4>{event.name}</h4>
                  <p className="event-date">{formatDate(event.eventDate)}</p>
                  <p className="event-time">{formatTime(event.eventDate)}</p>
                  {event.venue && <p><strong>Venue:</strong> {event.venue.name}</p>}
                  {event.artists && event.artists.length > 0 && (
                    <p><strong>Artists:</strong> {event.artists.map(a => a.name).join(', ')}</p>
                  )}
                  {event.genre && <p className="event-genre">{event.genre}</p>}
                  {/* Explicit link for accessibility and clear user action. */}
                  <Link to={`/events/${event.id}`} className="event-details-link">View Details</Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events-message">
              No events match your current filters. Try adjusting your search criteria!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCalendarPage;
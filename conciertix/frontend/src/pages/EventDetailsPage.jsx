// Import React hooks for state, effects, context, and refs.
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Import routing hooks from react-router-dom.
import { useParams, useNavigate, useLocation } from 'react-router-dom';
// Import the pre-configured axios instance for API calls.
import axios from '../services/api';
// Import react-leaflet components for map display.
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// Import AuthContext for user authentication details.
import { useAuth } from '../context/AuthContext.jsx';
// Import Leaflet CSS.
import 'leaflet/dist/leaflet.css';
// Import Leaflet library.
import L from 'leaflet';
// Import CSS Modules for component-specific styling.
import styles from './EventDetailsPage.module.css';
// Import Heroicons for UI elements.
import { CalendarIcon, ClockIcon, MapPinIcon, InformationCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

// Fix for default Leaflet marker icon issue when using with bundlers like Webpack.
// This ensures marker icons are correctly loaded.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Constants for image loading (currently, retry logic is simplified).
const MAX_RETRIES = 3; // Max number of retries for image loading (not actively used in current retry logic).
const RETRY_DELAY_MS = 3000; // Delay for retrying image load (not actively used).

/**
 * @function FallbackSvg
 * @description A simple SVG component used as a placeholder for images that fail to load.
 * @param {Object} props - Component props.
 * @param {string} [props.className] - Optional additional CSS class for the container.
 * @returns {JSX.Element} A div containing an SVG placeholder image.
 */
const FallbackSvg = ({ className }) => (
  <div className={`${styles.fallbackSvgContainer} ${className || ''}`}>
    {/* SVG representing a generic image icon. */}
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2H8C4.68629 2 2 4.68629 2 8V16C2 19.3137 4.68629 22 8 22H16C19.3137 22 22 19.3137 22 16V8C22 4.68629 19.3137 2 16 2Z" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 14L17.7071 9.70711C17.3166 9.31658 16.6834 9.31658 16.2929 9.70711L12 14H22Z" fill="#A0A0A0" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 18L7.70711 12.2929C8.09763 11.9024 8.7308 11.9024 9.12132 12.2929L12 15" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

/**
 * @function EventDetailsPage
 * @description Displays detailed information about a specific event.
 * Features include event description, artist details, venue information with a map,
 * ticket reservation, and image loading with fallbacks.
 * Implements scroll-triggered animations for sections.
 *
 * @returns {JSX.Element} The rendered event details page.
 */
const EventDetailsPage = () => {
  // Get eventId from URL parameters.
  const { eventId } = useParams();
  // Hooks for navigation and accessing location state.
  const navigate = useNavigate();
  const location = useLocation();
  // Authentication context for user and token. Renamed `user` to `currentUser` to avoid naming conflicts.
  const { user: currentUser, token } = useAuth();

  // State for event data.
  const [event, setEvent] = useState(null);
  // State for details of artists performing at the event.
  const [artistsDetails, setArtistsDetails] = useState([]);
  // State for overall loading status of the page (fetching event/artist data).
  const [loading, setLoading] = useState(true);
  // State for general errors during data fetching.
  const [error, setError] = useState(null);

  // State for event poster image loading.
  const [imageLoadError, setImageLoadError] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0); // Kept for potential future retry logic enhancement.
  const [currentImageUrl, setCurrentImageUrl] = useState(''); // Stores the (potentially transformed) image URL.

  // State for ticket reservation.
  const [selectedTickets, setSelectedTickets] = useState(1); // Default to 1 ticket.
  const [reservationLoading, setReservationLoading] = useState(false); // Loading state for reservation API call.
  const [reservationError, setReservationError] = useState(null);   // Error message for reservation.
  const [reservationSuccess, setReservationSuccess] = useState(null); // Success message for reservation.

  // State for UI toggles.
  const [showFullDescription, setShowFullDescription] = useState(false); // For expanding/collapsing event description.
  const [expandedBios, setExpandedBios] = useState({}); // Tracks expanded state for each artist's bio. { [artistId]: boolean }

  // Refs for IntersectionObserver to animate sections on scroll.
  const sectionsRef = useRef([]);
  sectionsRef.current = []; // Initialize on each render to collect new refs for the current render cycle.
  /**
   * Adds a DOM element to the `sectionsRef` array for IntersectionObserver.
   * This function is passed as a ref callback to elements that need to be observed.
   * @param {HTMLElement | null} el - The DOM element to observe, or null if the element is unmounted.
   */
  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  // Effect for setting up IntersectionObserver for scroll animations on sections.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.fadeInUp); // Apply fade-in animation class.
            observer.unobserve(entry.target); // Stop observing after the animation is triggered once.
          }
        });
      },
      { threshold: 0.1 } // Trigger animation when 10% of the element is visible.
    );

    // Observe all elements collected in sectionsRef.
    sectionsRef.current.forEach((section) => {
      if (section) { // Ensure section is not null
        observer.observe(section);
      }
    });

    // Cleanup function: unobserve all elements when component unmounts or dependencies change.
    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, [loading, event]); // Re-run this effect when page loading state changes or event data is (re)loaded.

  // Effect to fetch event and associated artist details when eventId (from URL) changes.
  useEffect(() => {
    /**
     * Fetches event details and details of associated artists from the API.
     * @async
     */
    const fetchEventDetails = async () => {
      try {
        setLoading(true); // Indicate start of data fetching.
        setError(null);   // Clear previous errors.
        setReservationError(null); // Clear previous reservation messages.
        setReservationSuccess(null);

        // Fetch main event data using the eventId.
        const response = await axios.get(`/events/${eventId}`);
        setEvent(response.data); // Store fetched event data.

        // Initialize selected tickets based on availability.
        if (response.data.availableTickets > 0) {
            setSelectedTickets(1); // Default to 1 if tickets are available.
        } else {
            setSelectedTickets(0); // No tickets can be selected if none are available.
        }

        // If the event has associated artist IDs, fetch details for each artist.
        if (response.data.artistIds && response.data.artistIds.length > 0) {
          const artistPromises = response.data.artistIds.map(id =>
            axios.get(`/artists/${id}`) // Assumes an API endpoint like /artists/:id.
          );
          // Use Promise.allSettled to fetch all artists concurrently and handle individual failures gracefully.
          const artistResults = await Promise.allSettled(artistPromises);
          const successfulArtists = artistResults
            .filter(result => result.status === 'fulfilled') // Filter out any failed artist fetch requests.
            .map(result => result.value.data); // Extract data from successful responses.
          setArtistsDetails(successfulArtists); // Store details of successfully fetched artists.
        }
        setLoading(false); // Indicate end of data fetching.
      } catch (err) {
        console.error("Error fetching event details:", err);
        let errorMessage = 'Failed to load event details. Please try again later.';
        // Extract a more specific error message from the API response if available.
        if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
        } else if (err.message) {
            errorMessage = err.message;
        }
        setError(errorMessage); // Set error state for display.
        setLoading(false); // Indicate end of data fetching (even on error).
      }
    };

    fetchEventDetails(); // Invoke the fetch function.
  }, [eventId]); // Dependency: eventId. Re-fetch if the eventId changes.

  /**
   * Handles changes in the ticket quantity input field.
   * Ensures the selected quantity is a valid number within the available range.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleTicketChange = (e) => {
    let quantity = parseInt(e.target.value, 10);
    if (isNaN(quantity) || quantity < 0) {
        quantity = 0; // Default to 0 if input is not a valid non-negative number.
    }
    // Cap the quantity at the number of available tickets for the event.
    if (event && quantity > event.availableTickets) {
        quantity = event.availableTickets;
    }
    setSelectedTickets(quantity); // Update state with the validated quantity.
  };

  /**
   * Handles the "Reserve Now" button click action.
   * Checks for user authentication, validates selected ticket quantity,
   * and makes an API call to create a reservation.
   * @async
   */
  const handleReserveNow = async () => {
    // If user is not authenticated, redirect them to the login page.
    // Pass current location in state to allow redirection back after login.
    if (!token || !currentUser) {
      navigate('/login', { state: { from: location, message: "Please log in to reserve tickets." } });
      return;
    }

    // Validate that at least one ticket is selected.
    if (selectedTickets <= 0) {
      setReservationError("Please select at least one ticket.");
      return;
    }

    setReservationLoading(true); // Indicate start of reservation process.
    setReservationError(null);   // Clear previous reservation errors.
    setReservationSuccess(null); // Clear previous reservation success messages.

    try {
      // Prepare data for the reservation API request.
      const reservationData = {
        EventId: event.id, // ID of the current event.
        NumberOfTickets: selectedTickets, // Number of tickets selected by the user.
      };
      // API call to create a reservation.
      const response = await axios.post('/reservations', reservationData);
      setReservationSuccess(`Reservation successful! Your booking ID is ${response.data.id}. Check your email for details.`);
      
      // Re-fetch event details to update the displayed number of available tickets.
       const updatedEventResponse = await axios.get(`/events/${eventId}`);
       setEvent(updatedEventResponse.data);
       // Reset selected tickets based on new availability after reservation.
       if (updatedEventResponse.data.availableTickets > 0) {
           setSelectedTickets(1); // Reset to 1 if tickets are still available.
       } else {
           setSelectedTickets(0); // Set to 0 if the event is now sold out.
       }

    } catch (err) {
      console.error("Error making reservation:", err);
      // Extract and display a user-friendly error message from the API response or a generic one.
      const apiError = err.response?.data?.message || err.response?.data?.title || JSON.stringify(err.response?.data) || 'An unexpected error occurred.';
      setReservationError(`Reservation failed: ${apiError}`);
    } finally {
      setReservationLoading(false); // Indicate end of reservation process.
    }
  };

  /**
   * Transforms image URLs from 'via.placeholder.com' to 'placehold.co'
   * and adjusts query parameters. This is a specific workaround for placeholder services.
   * @param {string} originalUrl - The original image URL.
   * @returns {string} The transformed URL or the original URL if no transformation is needed or possible.
   */
  const getTransformedImageUrl = useCallback((originalUrl) => {
    if (!originalUrl || typeof originalUrl !== 'string') return ''; // Return empty if URL is invalid.
    let finalUrl = originalUrl;
    // Check if the URL is from via.placeholder.com.
    if (originalUrl.includes('via.placeholder.com')) {
      try {
        // Ensure the URL has a protocol (http or https).
        const baseUrl = originalUrl.startsWith('//') ? `https:${originalUrl}` : originalUrl;
        const tempUrl = new URL(baseUrl);
        // If it's a via.placeholder.com URL, change hostname and text parameter.
        if (tempUrl.hostname.endsWith('via.placeholder.com')) {
          tempUrl.hostname = 'placehold.co'; // New placeholder service domain.
          const params = new URLSearchParams(tempUrl.search);
          if (params.has('Text')) { // Parameter name difference for text.
            const textValue = params.get('Text');
            params.delete('Text');
            params.set('text', textValue); // Set new parameter name.
            tempUrl.search = params.toString();
          }
          finalUrl = tempUrl.toString();
        }
      } catch (e) {
        // Fallback to string replacement if URL parsing fails (e.g., malformed URL).
        console.warn('URL parsing failed for image transformation, falling back to string replacement:', originalUrl, e);
        finalUrl = originalUrl.replace(/https:\/\/via\.placeholder\.com/g, 'https://placehold.co').replace('?Text=', '?text=').replace('&Text=', '&text=');
      }
    }
    return finalUrl;
  }, []); // Memoized as it doesn't depend on component state/props that would cause re-creation.

  // Effect to set and transform the event poster image URL when event data is loaded or changes.
  useEffect(() => {
    if (event?.imagePosterUrl) { // If event data exists and has an imagePosterUrl.
      const transformedUrl = getTransformedImageUrl(event.imagePosterUrl);
      setCurrentImageUrl(transformedUrl); // Set the URL for the <img> tag.
      setImageLoadError(false); // Reset image load error state.
      setRetryAttempt(0);     // Reset retry attempts.
    } else if (event && !event.imagePosterUrl) {
      // If event data is loaded but there's no image URL, trigger fallback.
      setCurrentImageUrl(''); // Clear any previous URL.
      setImageLoadError(true); // Set error to true to show fallback.
      setRetryAttempt(MAX_RETRIES); // Mark as max retries to prevent further attempts if logic were added.
    }
  }, [event, getTransformedImageUrl]); // Dependencies: event data and the memoized transformation function.

  /**
   * Handles errors during image loading for the event poster.
   * Sets `imageLoadError` to true to display a fallback SVG.
   * Current implementation does not actively retry; retry logic would require further enhancement.
   */
  const handleImageError = useCallback(() => {
    setImageLoadError(true); // Trigger display of the fallback SVG.
  }, []); // Memoized as it has no dependencies.

  /**
   * Handles successful image loading for the event poster.
   * Resets `imageLoadError` and `retryAttempt` states.
   */
  const handleImageLoad = () => {
    setImageLoadError(false); // Image loaded successfully.
    setRetryAttempt(0); // Reset retry attempts.
  };

  /**
   * Validates if a string is a valid HTTP/HTTPS URL or a root-relative path (starts with '/').
   * @param {string} string - The string (URL or path) to validate.
   * @returns {boolean} True if the string is a valid URL or root-relative path, false otherwise.
   */
  const isValidHttpUrl = (string) => {
    if (!string) return false; // Empty string is not valid.
    try {
      // Attempt to create a URL object. If it's a relative path, it resolves against window.location.origin.
      const url = new URL(string, window.location.origin);
      // Check if protocol is http or https, or if the original string was a root-relative path.
      return url.protocol === "http:" || url.protocol === "https:" || string.startsWith('/');
    } catch (_) {
      // If URL constructor fails (e.g. not a valid absolute/relative URL structure but might be a path like '/foo')
      // still allow root-relative paths, as they are valid for <img> src attributes.
      return string.startsWith('/');
    }
  };

  /** Toggles the expanded/collapsed state of the event description. */
  const toggleDescription = () => setShowFullDescription(!showFullDescription);

  /**
   * Toggles the expanded/collapsed state for a specific artist's biography.
   * @param {string|number} artistId - The ID of the artist whose biography visibility is being toggled.
   */
  const toggleBio = (artistId) => {
    setExpandedBios(prev => ({ ...prev, [artistId]: !prev[artistId] }));
  };

  /**
   * Formats an event date string into a more readable format, including start and end times.
   * Example output: "Sat, Nov 23, 2025 • 7:00 PM – 10:00 PM"
   * @param {string} dateString - The ISO date string for the event.
   * @returns {string} The formatted date and time string, or an error/placeholder message if formatting fails or date is unavailable.
   */
  const formattedEventDateTime = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      // Assuming a fixed event duration (e.g., 3 hours) for example purposes.
      // Ideally, event end time or duration should come from the API.
      const endDate = new Date(date.getTime() + 3 * 60 * 60 * 1000);
      
      // Options for formatting date and time parts.
      const optionsDate = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      const optionsTime = { hour: 'numeric', minute: '2-digit', hour12: true };

      const startDateStr = date.toLocaleDateString('en-US', optionsDate);
      const startTimeStr = date.toLocaleTimeString('en-US', optionsTime);
      const endTimeStr = endDate.toLocaleTimeString('en-US', optionsTime);

      return `${startDateStr} • ${startTimeStr} – ${endTimeStr}`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date"; // Fallback for invalid date strings.
    }
  };

  // Conditional rendering for loading state.
  if (loading) {
    return <div className={styles.pageContainer}><div className={styles.contentWrapper}><p className={styles.bodyText}>Loading event details...</p></div></div>;
  }

  // Conditional rendering for error state.
  if (error) {
    return <div className={styles.pageContainer}><div className={styles.contentWrapper}><p className={`${styles.bodyText} ${styles.errorText}`}>{error}</p></div></div>;
  }

  // Conditional rendering if event data is not found after loading.
  if (!event) {
    return <div className={styles.pageContainer}><div className={styles.contentWrapper}><p className={styles.bodyText}>Event not found.</p></div></div>;
  }

  // Destructure event properties for easier use in JSX, after ensuring `event` is not null.
  const {
    name,
    description,
    eventDate,
    venueName,
    venueCity,
    venueAddress,
    pricePerTicket,
    availableTickets,
    venueLatitude, // Assumed to be available from event data for the map.
    venueLongitude // Assumed to be available from event data for the map.
  } = event;

// Define the status string that indicates a published event. This should match the backend's representation.
const EVENT_STATUS_PUBLISHED = "Published";
// Check if the event is published. This controls whether reservation options are shown.
const isEventPublished = event && event.status === EVENT_STATUS_PUBLISHED;

  // Define the character limit for truncating the event description before "Read More" is shown.
  const DESCRIPTION_TRUNCATE_LENGTH = 250;

  // Main JSX for rendering the event details page.
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* Section for the main event image/banner. */}
        <section ref={addToRefs} className={`${styles.eventBanner} ${styles.fadeInUp}`}>
          {imageLoadError || !isValidHttpUrl(currentImageUrl) ? (
            <FallbackSvg /> // Show fallback SVG if image fails to load or URL is invalid.
          ) : (
            <img
              key={currentImageUrl} // Key helps React re-render if URL changes (e.g., after transformation).
              src={currentImageUrl}
              alt={`${name || 'Event'} poster`} // Alt text for accessibility.
              className={styles.eventBannerImage}
              onError={handleImageError} // Handler for image load errors.
              onLoad={handleImageLoad}   // Handler for successful image loads.
            />
          )}
        </section>

        {/* Section for core event information: Title, Date, Time, Location. */}
        <section ref={addToRefs} className={`${styles.coreInfoSection} ${styles.fadeInUp}`}>
          <h1 className={styles.eventTitle}>{name}</h1>
          <div className={styles.dateTimeLocation}>
            <span><CalendarIcon width={18} height={18} /> {formattedEventDateTime(eventDate)}</span>
            <span><MapPinIcon width={18} height={18} /> {venueName} • {venueCity}</span>
          </div>
        </section>

        {/* Section for ticket information and reservation call to action. */}
        <section ref={addToRefs} className={`${styles.section} ${styles.fadeInUp}`}>
          <h2 className={styles.sectionHeading}>Tickets</h2>
          {/* Conditional rendering based on event publication status. */}
          {event && !isEventPublished ? (
            <p className={`${styles.bodyText} ${styles.eventNotPublishedMessage}`}>
              This event is not yet published and reservations are not open.
            </p>
          ) : event ? ( // If event is published (or status is not explicitly "Not Published"), show ticket options.
            <>
              <p className={`${styles.bodyText}`} style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem'}}>
                ${pricePerTicket?.toFixed(2) || 'N/A'} {/* Display ticket price, formatted to 2 decimal places. */}
              </p>
              <p className={styles.secondaryText} style={{marginBottom: '1rem'}}>
                {availableTickets > 0 ? `${availableTickets} tickets remaining` : 'Currently unavailable'}
              </p>

              {/* Ticket quantity selection and reservation button, shown only if tickets are available. */}
              {availableTickets > 0 ? (
                <>
                  <div className={styles.ticketSelection}>
                    <label htmlFor="ticketQuantity" className={styles.labelText}>Quantity:</label>
                    <input
                      type="number"
                      id="ticketQuantity"
                      name="ticketQuantity"
                      min="1" // Minimum 1 ticket.
                      max={availableTickets} // Maximum is number of available tickets.
                      value={selectedTickets}
                      onChange={handleTicketChange}
                      className={styles.ticketInput}
                      disabled={reservationLoading} // Disable input field during reservation API call.
                    />
                  </div>
                  <button
                    onClick={handleReserveNow}
                    className={`${styles.ctaButton} ${ (reservationLoading || selectedTickets === 0) ? styles.ctaButtonDisabled : ''}`}
                    disabled={reservationLoading || selectedTickets === 0} // Disable button if reserving or 0 tickets selected.
                    aria-live="polite" // For screen readers to announce changes (e.g., button text change).
                  >
                    {reservationLoading ? 'Reserving...' : 'Reserve Tickets'}
                  </button>
                </>
              ) : (
                // "Sold Out" button if no tickets are available.
                <button
                  className={`${styles.ctaButton} ${styles.ctaButtonDisabled}`}
                  disabled={true}
                  aria-live="polite"
                >
                  Sold Out
                </button>
              )}
              {/* Display success or error messages related to reservation attempts. */}
              {reservationSuccess && <p className={styles.secondaryText} style={{color: 'green', marginTop: '0.5rem'}}>{reservationSuccess}</p>}
              {reservationError && <p className={styles.secondaryText} style={{color: 'red', marginTop: '0.5rem'}}>{reservationError}</p>}
            </>
          ) : null /* Fallback if event object is somehow null after initial loading checks (should not happen). */}
        </section>

        {/* Event Description Section. Rendered only if description exists. */}
        {description && (
          <section ref={addToRefs} className={`${styles.section} ${styles.fadeInUp}`}>
            <h2 className={styles.sectionHeading}>About this Event</h2>
            <p className={styles.bodyText}>
              {/* Show full description or a truncated version with a "Read More" option. */}
              {showFullDescription || description.length <= DESCRIPTION_TRUNCATE_LENGTH ?
                description :
                `${description.substring(0, DESCRIPTION_TRUNCATE_LENGTH)}...`}
            </p>
            {/* "Read More/Less" button if description is longer than truncation length. */}
            {description.length > DESCRIPTION_TRUNCATE_LENGTH && (
              <button onClick={toggleDescription} className={styles.readMoreLink}>
                {showFullDescription ? 'Read Less' : 'Read More'}
              </button>
            )}
          </section>
        )}

        {/* Speakers / Performers Section. Rendered only if artist details are available. */}
        {artistsDetails && artistsDetails.length > 0 && (
          <section ref={addToRefs} className={`${styles.section} ${styles.fadeInUp}`}>
            <h2 className={styles.sectionHeading}>Performers</h2>
            <div className={styles.performersGrid}> {/* Grid layout for performer cards. */}
              {artistsDetails.map(artist => (
                <div key={artist.id} className={styles.performerCard}>
                  <img
                    src={artist.photoUrl || `https://placehold.co/100x100/E0E0E0/777777?text=${artist.name.charAt(0)}`} // Fallback placeholder image using artist's initial.
                    alt={artist.name}
                    className={styles.performerPhoto}
                    onError={(e) => e.target.src = `https://placehold.co/100x100/E0E0E0/777777?text=${artist.name.charAt(0)}`} // Fallback on image load error.
                  />
                  <h3 className={styles.performerName}>{artist.name}</h3>
                  {artist.genre && <p className={styles.secondaryText} style={{fontSize: '0.8rem', marginBottom: '0.5rem'}}>{artist.genre}</p>}
                  {/* Expandable biography section for each artist, if bio exists. */}
                  {artist.bio && (
                    <>
                      <button onClick={() => toggleBio(artist.id)} className={styles.performerBioToggle} aria-expanded={!!expandedBios[artist.id]}>
                        Bio {expandedBios[artist.id] ? <ChevronUpIcon width={16} style={{display: 'inline-block'}} /> : <ChevronDownIcon width={16} style={{display: 'inline-block'}} />}
                      </button>
                      <div className={`${styles.performerBio} ${expandedBios[artist.id] ? styles.performerBioVisible : ''}`}>
                        <p>{artist.bio}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Venue Details & Map Section. */}
        <section ref={addToRefs} className={`${styles.section} ${styles.fadeInUp}`}>
            <h2 className={styles.sectionHeading}>Venue</h2>
          <div className={styles.venueMapContainer}> {/* Container for text details and map. */}
            <div> {/* Venue address and city details. */}
              <h3 className={styles.bodyText} style={{fontWeight: 600}}>{venueName}</h3>
              <p className={styles.secondaryText}>{venueAddress}</p>
              <p className={styles.secondaryText}>{venueCity}</p>
            </div>
            <div className={styles.leafletContainer}> {/* Container for the Leaflet map. */}
              {(venueLatitude && venueLongitude) ? ( // If coordinates are available, render map with marker.
                <MapContainer
                    center={[venueLatitude, venueLongitude]} // Set map center to venue coordinates.
                    zoom={15} // Set initial zoom level.
                    scrollWheelZoom={false} // Disable map zoom via scroll wheel.
                    style={{ height: '100%', width: '100%' }} // Ensure map fills its container.
                    className={styles.mapView} // Apply custom styles if needed.
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &bull; Tiles &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Using a light-themed CartoDB tile layer.
                  />
                  <Marker position={[venueLatitude, venueLongitude]}> {/* Marker at venue location. */}
                    <Popup>{venueName} <br /> {venueAddress}</Popup> {/* Popup with venue name and address. */}
                  </Marker>
                </MapContainer>
              ) : venueAddress ? ( // Fallback if only address is available (could use geocoding here ideally for better accuracy).
                 <MapContainer
                    center={[51.505, -0.09]} // Default map center (e.g., London) if no coordinates.
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                 >
                   <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &bull; Tiles &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />
                   <Marker position={[51.505, -0.09]}> {/* Marker at default position. */}
                    <Popup>{venueName} <br /> {venueAddress} <br /> (Map position approximate)</Popup>
                   </Marker>
                 </MapContainer>
              ) : ( // If no location data (neither coordinates nor address), show a placeholder.
                <div className={styles.mapPlaceholder}>
                  <MapPinIcon width={30} height={30} style={{marginRight: '0.5rem'}} /> Map data unavailable
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Placeholder for a future Gallery Section. */}
        <section ref={addToRefs} className={`${styles.section} ${styles.fadeInUp}`}>
            <h2 className={styles.sectionHeading}>Gallery</h2>
            <p className={styles.secondaryText}>More media coming soon.</p>
        </section>

      </div>
    </div>
  );
};

export default EventDetailsPage;
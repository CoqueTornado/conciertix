import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

// Constants for image loading retry mechanism.
const MAX_RETRIES = 3; // Maximum number of times to retry loading an image.
const RETRY_DELAY_MS = 3000; // Delay in milliseconds before retrying image load.

/**
 * @function FallbackSvg
 * @description A simple SVG component used as a placeholder when an event image fails to load
 * or is not available.
 * @returns {JSX.Element} An SVG element displaying "Image not available".
 */
const FallbackSvg = () => (
  <svg width="100%" height="100%" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="200" fill="#CCCCCC"/> {/* Background rectangle */}
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#555555" fontSize="16px" fontFamily="Arial, sans-serif">
      Image not available
    </text>
  </svg>
);

/**
 * @function EventCard
 * @description A component that displays a summary of an event, including its image, name,
 * artists, date, venue, and price. It includes image loading with retry logic and a fallback.
 *
 * @param {Object} props - The component's props.
 * @param {Object} props.event - The event object containing details to display.
 * @param {(string|number)} props.event.id - Unique identifier for the event.
 * @param {string} props.event.name - Name of the event.
 * @param {string[]} [props.event.artistNames] - Array of names of participating artists.
 * @param {string} props.event.eventDate - ISO string representation of the event date and time.
 * @param {string} [props.event.venueName] - Name of the venue.
 * @param {string} [props.event.venueCity] - City where the venue is located.
 * @param {number} [props.event.pricePerTicket] - Price of a ticket for the event.
 * @param {string} [props.event.imagePosterUrl] - URL of the event's poster image.
 * @returns {JSX.Element|null} The rendered event card or null if no event data is provided.
 */
function EventCard({ event }) {
  // State to track if the image has failed to load.
  const [imageLoadError, setImageLoadError] = useState(false);
  // State to track the current image load retry attempt.
  const [retryAttempt, setRetryAttempt] = useState(0);
  // State to store the current (potentially transformed) image URL.
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  // If no event data is provided, render nothing.
  if (!event) {
    return null;
  }

  // Destructure event properties for easier access.
  const {
    id,
    name,
    artistNames,
    eventDate,
    venueName,
    venueCity,
    pricePerTicket,
    imagePosterUrl, // Original URL from the event data
  } = event;

  /**
   * Transforms image URLs from 'via.placeholder.com' to 'placehold.co'
   * and adjusts query parameters. This is a specific workaround for placeholder services.
   * @param {string} originalUrl - The original image URL.
   * @returns {string} The transformed URL or the original URL if no transformation is needed or possible.
   */
  const getTransformedImageUrl = useCallback((originalUrl) => {
    if (!originalUrl || typeof originalUrl !== 'string') return ''; // Return empty if URL is invalid
    let finalUrl = originalUrl;
    // Check if the URL is from via.placeholder.com
    if (originalUrl.includes('via.placeholder.com')) {
      try {
        // Ensure the URL has a protocol
        const baseUrl = originalUrl.startsWith('//') ? `https:${originalUrl}` : originalUrl;
        const tempUrl = new URL(baseUrl);
        // If it's a via.placeholder.com URL, change hostname and params
        if (tempUrl.hostname.endsWith('via.placeholder.com')) {
          tempUrl.hostname = 'placehold.co'; // New placeholder service
          const params = new URLSearchParams(tempUrl.search);
          if (params.has('Text')) { // Parameter name difference
            const textValue = params.get('Text');
            params.delete('Text');
            params.set('text', textValue); // Set new parameter
            tempUrl.search = params.toString();
          }
          finalUrl = tempUrl.toString();
        }
      } catch (e) {
        // Fallback to string replacement if URL parsing fails (e.g., malformed URL)
        console.warn('URL parsing failed for image transformation, falling back to string replacement:', originalUrl, e);
        let newUrl = originalUrl.replace(/https:\/\/via\.placeholder\.com/g, 'https://placehold.co');
        newUrl = newUrl.replace('?Text=', '?text=').replace('&Text=', '&text=');
        finalUrl = newUrl;
      }
    }
    return finalUrl;
  }, []); // Empty dependency array as this function does not depend on component state/props directly.

  // Effect to set the initial image URL and reset error/retry states when imagePosterUrl changes.
  useEffect(() => {
    const transformedUrl = getTransformedImageUrl(imagePosterUrl);
    setCurrentImageUrl(transformedUrl);
    setImageLoadError(false); // Reset error state
    setRetryAttempt(0);     // Reset retry attempts
  }, [imagePosterUrl, getTransformedImageUrl]); // Dependencies: run when imagePosterUrl or the transformation function changes.

  /**
   * Callback function triggered when the image fails to load.
   * It sets the imageLoadError state to true to display the fallback.
   * It manages retry attempts but the actual retry is triggered by the useEffect below.
   */
  const handleImageError = useCallback(() => {
    if (retryAttempt < MAX_RETRIES) {
      setImageLoadError(true); // Show fallback immediately, retry will be triggered by useEffect.
    } else {
      setImageLoadError(true); // Max retries reached, keep showing fallback.
    }
  }, [retryAttempt]); // Dependency: retryAttempt.

  /**
   * Callback function triggered when the image successfully loads.
   * Resets imageLoadError and retryAttempt states.
   */
  const handleImageLoad = () => {
    setImageLoadError(false);
    setRetryAttempt(0);
  };

  // Effect to handle image loading retries.
  useEffect(() => {
    let timer;
    // If an image load error occurred and we haven't reached max retries:
    if (imageLoadError && retryAttempt < MAX_RETRIES) {
      timer = setTimeout(() => {
        setRetryAttempt(prev => prev + 1); // Increment retry attempt
        // By setting imageLoadError to false, we attempt to re-render the <img> tag.
        // The `key` prop on the <img> tag (currentImageUrl + retryAttempt) ensures React
        // treats it as a new element, forcing a re-attempt to load the src.
        console.log(`Retrying image load (attempt ${retryAttempt + 1}): ${currentImageUrl}`);
        setImageLoadError(false); // This will cause the img tag to try loading again.
      }, RETRY_DELAY_MS);
    }
    // Cleanup function to clear the timeout if the component unmounts or dependencies change.
    return () => clearTimeout(timer);
  }, [imageLoadError, retryAttempt, currentImageUrl]); // Dependencies: trigger on error, attempt count, or URL change.

  /**
   * Validates if a string is a valid HTTP/HTTPS URL or a relative path.
   * @param {string} string - The string to validate.
   * @returns {boolean} True if the string is a valid URL or path, false otherwise.
   */
  const isValidHttpUrl = (string) => {
    if (!string) return false;
    try {
      // Attempt to create a URL object. If it's a relative path, it resolves against window.location.origin.
      const url = new URL(string, window.location.origin);
      // Check if protocol is http or https, or if the original string was a root-relative path.
      return url.protocol === "http:" || url.protocol === "https:" || string.startsWith('/');
    } catch (_) {
      // If URL constructor fails (e.g. not a valid absolute/relative URL structure but might be a path like '/foo')
      // still allow root-relative paths.
      return string.startsWith('/');
    }
  };

  return (
    <div className="event-card">
      {/* Conditional rendering for image: Show FallbackSvg if error or URL is invalid. */}
      {imageLoadError || !isValidHttpUrl(currentImageUrl) ? (
        <div className="event-card-image event-card-image-placeholder">
          <FallbackSvg />
        </div>
      ) : (
        <img
          // Key is crucial for forcing React to re-render the img element on retry,
          // which re-triggers the src load attempt.
          key={currentImageUrl + retryAttempt}
          src={currentImageUrl}
          alt={`${name} poster`}
          className="event-card-image"
          onError={handleImageError} // Handle image load errors
          onLoad={handleImageLoad}   // Handle successful image loads
        />
      )}
      <div className="event-card-content">
        <h3 className="event-card-title">{name}</h3>
        {/* Display artist names if available. */}
        {artistNames && artistNames.length > 0 && (
          <p className="event-card-artists"><strong>Artists:</strong> {artistNames.join(', ')}</p>
        )}
        {/* Display formatted event date and time. */}
        <p className="event-card-date">
          <strong>Date:</strong> {new Date(eventDate).toLocaleDateString()} - {new Date(eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        {/* Display venue name and city. */}
        <p className="event-card-venue">
          <strong>Venue:</strong> {venueName} - {venueCity}
        </p>
        {/* Display ticket price, or "Free" if price is 0 or less. */}
        <p className="event-card-price">
          {pricePerTicket > 0 ? `$${pricePerTicket.toFixed(2)}` : 'Free'}
        </p>
        {/* Link to the detailed event page. */}
        <Link to={`/events/${id}`} className="event-card-details-button">
          View Details
        </Link>
      </div>
    </div>
  );
}

// PropTypes for type-checking the 'event' prop.
EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string, // Optional description
    eventDate: PropTypes.string.isRequired, // Expected to be an ISO date string
    venueName: PropTypes.string,
    venueCity: PropTypes.string,
    artistNames: PropTypes.arrayOf(PropTypes.string),
    pricePerTicket: PropTypes.number,
    imagePosterUrl: PropTypes.string, // URL for the event poster
    status: PropTypes.string, // e.g., 'Published', 'Cancelled'
  }).isRequired,
};

export default EventCard;
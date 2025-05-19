import React, { useState, useEffect } from 'react';

/**
 * @function AdminEventForm
 * @description A form component for creating or editing event details in the admin panel.
 * It handles form state, validation, data formatting, and submission.
 *
 * @param {Object} props - The component's props.
 * @param {Object} [props.initialData={}] - Initial data to populate the form, used in edit mode.
 *   Includes fields like name, description, eventDate, venueId, artistIds, etc.
 * @param {function} props.onSubmit - Callback function executed when the form is submitted with valid data.
 *   Receives the formatted form data as an argument.
 * @param {Array} [props.artists=[]] - An array of artist objects (e.g., `{ id: '1', name: 'Artist Name' }`) to populate the artist selection dropdown.
 * @param {Array} [props.venues=[]] - An array of venue objects (e.g., `{ id: '1', name: 'Venue Name' }`) to populate the venue selection dropdown.
 * @param {boolean} [props.isLoading=false] - Flag to indicate if the form submission is in progress (disables submit button).
 * @param {string} [props.submitButtonText="Submit"] - Text to display on the submit button.
 * @returns {JSX.Element} The rendered event form.
 */
const AdminEventForm = ({ initialData = {}, onSubmit, artists = [], venues = [], isLoading = false, submitButtonText = "Submit" }) => {
  // State for form data, initialized with default values or initialData.
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventDate: '', // Stored as YYYY-MM-DDTHH:mm for datetime-local input
    venueId: '',
    artistIds: [], // Array of selected artist IDs
    totalCapacity: 0,
    pricePerTicket: 0,
    imagePosterUrl: '',
    status: 'Draft', // Default event status
    ...initialData, // Spread initialData to override defaults if provided
  });
  // State for form validation errors.
  const [errors, setErrors] = useState({});

  // Effect to process initialData, especially for formatting eventDate and ensuring artistIds is an array.
  useEffect(() => {
    if (initialData) {
      const formattedInitialData = { ...initialData };

      // Format eventDate from ISO string (if provided) to YYYY-MM-DDTHH:mm for the datetime-local input.
      if (initialData.eventDate) {
        const date = new Date(initialData.eventDate);
        if (!isNaN(date)) { // Check if date is valid
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
          const day = date.getDate().toString().padStart(2, '0');
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          formattedInitialData.eventDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
          formattedInitialData.eventDate = ''; // Clear if the initial date is invalid
        }
      }

      // Ensure artistIds is always an array, even if initialData.artistIds is undefined or not an array.
      formattedInitialData.artistIds = Array.isArray(initialData.artistIds) ? initialData.artistIds : [];
      
      // Update formData state with the processed initialData.
      setFormData(prevData => ({ ...prevData, ...formattedInitialData }));
    }
  }, [initialData]); // Dependency: re-run effect if initialData changes.

  /**
   * Handles changes in form input fields.
   * Updates the formData state based on input type and clears any existing error for the changed field.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} e - The input change event.
   */
  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;

    if (name === "artistIds") { // Handle multi-select for artistIds
      const values = Array.from(selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, [name]: values }));
    } else if (type === 'number') { // Handle number inputs, parse to float
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else { // Handle other input types
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear the error message for the field being edited.
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  /**
   * Validates the form data based on defined rules.
   * Sets error messages in the `errors` state.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Event name is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.eventDate) {
        newErrors.eventDate = "Event date and time are required.";
    } else if (new Date(formData.eventDate) <= new Date()) {
        // Check if the selected date is in the past
        newErrors.eventDate = "Event date must be in the future.";
    }
    if (!formData.venueId) newErrors.venueId = "Venue is required.";
    if (formData.artistIds.length === 0) newErrors.artistIds = "At least one artist must be selected.";
    if (formData.totalCapacity <= 0) newErrors.totalCapacity = "Total capacity must be greater than 0.";
    if (formData.pricePerTicket < 0) newErrors.pricePerTicket = "Price per ticket cannot be negative."; // Allows 0 for free events
    if (!formData.status) newErrors.status = "Status is required.";
    
    setErrors(newErrors);
    // Returns true if the newErrors object is empty.
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the form submission.
   * Prevents default form submission, validates the form, formats data (eventDate to ISO),
   * and calls the onSubmit prop if valid.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default browser form submission.
    if (validateForm()) {
      // Prepare data for submission, converting eventDate to ISO string format for the backend.
      const submissionData = {
        ...formData,
        eventDate: new Date(formData.eventDate).toISOString(),
      };
      onSubmit(submissionData); // Call the provided onSubmit handler.
    }
  };

  // JSX for the form structure.
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white shadow-md rounded-lg">
      {/* Event Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Event Name</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Description Textarea */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          id="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* Event Date & Time Input */}
      <div>
        <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">Event Date & Time</label>
        <input
          type="datetime-local" // HTML5 input for date and time
          name="eventDate"
          id="eventDate"
          value={formData.eventDate} // Value should be in YYYY-MM-DDTHH:mm format
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.eventDate && <p className="mt-1 text-xs text-red-500">{errors.eventDate}</p>}
      </div>

      {/* Venue Selection Dropdown */}
      <div>
        <label htmlFor="venueId" className="block text-sm font-medium text-gray-700">Venue</label>
        <select
          name="venueId"
          id="venueId"
          value={formData.venueId}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select a Venue</option>
          {/* Populate options from the venues prop */}
          {venues.map(venue => (
            <option key={venue.id} value={venue.id}>{venue.name}</option>
          ))}
        </select>
        {errors.venueId && <p className="mt-1 text-xs text-red-500">{errors.venueId}</p>}
      </div>

      {/* Artists Multi-Selection Dropdown */}
      <div>
        <label htmlFor="artistIds" className="block text-sm font-medium text-gray-700">Artists</label>
        <select
          multiple // Allows selection of multiple artists
          name="artistIds"
          id="artistIds"
          value={formData.artistIds} // Expects an array of IDs
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32"
        >
          {/* Populate options from the artists prop */}
          {artists.map(artist => (
            <option key={artist.id} value={artist.id}>{artist.name}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">Hold Ctrl (or Cmd on Mac) to select multiple artists.</p>
        {errors.artistIds && <p className="mt-1 text-xs text-red-500">{errors.artistIds}</p>}
      </div>

      {/* Total Capacity Input */}
      <div>
        <label htmlFor="totalCapacity" className="block text-sm font-medium text-gray-700">Total Capacity</label>
        <input
          type="number"
          name="totalCapacity"
          id="totalCapacity"
          value={formData.totalCapacity}
          onChange={handleChange}
          min="0" // Minimum allowed value
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.totalCapacity && <p className="mt-1 text-xs text-red-500">{errors.totalCapacity}</p>}
      </div>

      {/* Price Per Ticket Input */}
      <div>
        <label htmlFor="pricePerTicket" className="block text-sm font-medium text-gray-700">Price Per Ticket (€)</label>
        <input
          type="number"
          name="pricePerTicket"
          id="pricePerTicket"
          value={formData.pricePerTicket}
          onChange={handleChange}
          min="0" // Minimum allowed value (can be free)
          step="0.01" // Allows decimal values for currency
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.pricePerTicket && <p className="mt-1 text-xs text-red-500">{errors.pricePerTicket}</p>}
      </div>

      {/* Image Poster URL Input (Optional) */}
      <div>
        <label htmlFor="imagePosterUrl" className="block text-sm font-medium text-gray-700">Image Poster URL (Optional)</label>
        <input
          type="text" // Consider type="url" for better semantics
          name="imagePosterUrl"
          id="imagePosterUrl"
          value={formData.imagePosterUrl}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {/* No error display for optional field currently */}
      </div>

      {/* Status Selection Dropdown */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          id="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Cancelled">Cancelled</option>
          {/* Additional statuses can be added here as needed (e.g., Postponed, SoldOut) */}
        </select>
        {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
      </div>

      {/* Submit Button Area */}
      <div className="pt-5">
        <button
          type="submit"
          disabled={isLoading} // Disable button when isLoading is true
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {/* Display 'Submitting...' text when isLoading is true, otherwise display submitButtonText prop */}
          {isLoading ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default AdminEventForm;
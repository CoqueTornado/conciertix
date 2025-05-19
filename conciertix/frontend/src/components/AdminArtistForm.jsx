import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * @function AdminArtistForm
 * @description A form component for creating or editing artist details in the admin panel.
 * It handles form state, validation, and submission.
 *
 * @param {Object} props - The component's props.
 * @param {Object} [props.initialData={}] - Initial data to populate the form, used in edit mode.
 * @param {string} [props.initialData.name] - The initial name of the artist.
 * @param {string} [props.initialData.bio] - The initial biography of the artist.
 * @param {string} [props.initialData.imageUrl] - The initial image URL for the artist.
 * @param {string} [props.initialData.genre] - The initial genre of the artist.
 * @param {function} props.onSubmit - Callback function to execute when the form is submitted with valid data.
 * @param {boolean} [props.isEditMode=false] - Flag to indicate if the form is in edit mode.
 * @param {boolean} [props.isLoading=false] - Flag to indicate if the form submission is in progress.
 * @returns {JSX.Element} The rendered artist form.
 */
function AdminArtistForm({ initialData = {}, onSubmit, isEditMode = false, isLoading = false }) {
  // State for form data (name, bio, imageUrl, genre).
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    imageUrl: '',
    genre: '',
  });
  // State for form validation errors.
  const [errors, setErrors] = useState({});

  // Effect to populate form data when in edit mode and initialData is available.
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        name: initialData.name || '',
        bio: initialData.bio || '',
        imageUrl: initialData.imageUrl || '',
        genre: initialData.genre || '',
      });
    }
  }, [initialData, isEditMode]); // Dependencies: re-run if initialData or isEditMode changes.

  /**
   * Handles changes in form input fields.
   * Updates the formData state and clears any existing error for the changed field.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e - The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being changed.
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  /**
   * Validates the form data.
   * Currently, only checks if the name is provided.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }
    // Additional validation rules can be added here (e.g., for genre, URL format).
    setErrors(newErrors);
    // Returns true if there are no error messages.
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the form submission.
   * Prevents default form submission, validates the form, and calls the onSubmit prop if valid.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default browser submission.
    if (validateForm()) {
      onSubmit(formData); // Call the provided onSubmit handler with form data.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-artist-form">
      {/* Form title changes based on whether it's edit or create mode. */}
      <h2>{isEditMode ? 'Edit Artist' : 'Create New Artist'}</h2>

      {/* Name Input Field */}
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name" // Must match the key in formData state.
          value={formData.name}
          onChange={handleChange}
          required // HTML5 built-in validation.
        />
        {/* Display error message if validation fails for the name field. */}
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>

      {/* Bio Textarea Field */}
      <div className="form-group">
        <label htmlFor="bio">Bio:</label>
        <textarea
          id="bio"
          name="bio" // Must match the key in formData state.
          value={formData.bio}
          onChange={handleChange}
        />
      </div>

      {/* Image URL Input Field */}
      <div className="form-group">
        <label htmlFor="imageUrl">Image URL:</label>
        <input
          type="text" // Consider type="url" for better semantics and potential browser validation.
          id="imageUrl"
          name="imageUrl" // Must match the key in formData state.
          value={formData.imageUrl}
          onChange={handleChange}
        />
      </div>

      {/* Genre Input Field */}
      <div className="form-group">
        <label htmlFor="genre">Genre:</label>
        <input
          type="text"
          id="genre"
          name="genre" // Must match the key in formData state.
          value={formData.genre}
          onChange={handleChange}
        />
        {/* Potential: Add error display for genre if validation is added. */}
      </div>

      {/* Submit Button */}
      {/* Button text and disabled state change based on isLoading and isEditMode props. */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : (isEditMode ? 'Update Artist' : 'Create Artist')}
      </button>
    </form>
  );
}

// PropTypes for type-checking the component's props.
AdminArtistForm.propTypes = {
  /** Initial data for the form, typically used when editing an existing artist. */
  initialData: PropTypes.shape({
    name: PropTypes.string,
    bio: PropTypes.string,
    imageUrl: PropTypes.string,
    genre: PropTypes.string,
  }),
  /** Callback function triggered on successful form submission. Receives form data as an argument. */
  onSubmit: PropTypes.func.isRequired,
  /** Boolean flag indicating if the form is in "edit" mode (true) or "create" mode (false). */
  isEditMode: PropTypes.bool,
  /** Boolean flag indicating if a submission is currently in progress, used to disable the submit button. */
  isLoading: PropTypes.bool,
};

export default AdminArtistForm;
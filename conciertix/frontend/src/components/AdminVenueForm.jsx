import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * @function AdminVenueForm
 * @description A form component for creating or editing venue details in the admin panel.
 * It handles form state, validation, and submission, and can display submission errors.
 *
 * @param {Object} props - The component's props.
 * @param {Object} [props.initialData={}] - Initial data to populate the form, used in edit mode.
 * @param {string} [props.initialData.name] - The initial name of the venue.
 * @param {string} [props.initialData.address] - The initial address of the venue.
 * @param {string} [props.initialData.city] - The initial city of the venue.
 * @param {function} props.onSubmit - Asynchronous callback function to execute when the form is submitted with valid data.
 *                                    Receives the form data as an argument.
 * @param {boolean} [props.isEdit=false] - Flag to indicate if the form is in edit mode.
 * @param {boolean} [props.isLoading=false] - Flag to indicate if the form submission is in progress.
 * @param {string|Object|null} [props.error=null] - An error message or object to display if submission fails.
 * @returns {JSX.Element} The rendered venue form.
 */
function AdminVenueForm({ initialData = {}, onSubmit, isEdit = false, isLoading = false, error = null }) {
  // State for form data (name, address, city).
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
  });
  // State for form validation errors specific to this form.
  const [formErrors, setFormErrors] = useState({});

  // Effect to populate form data when in edit mode and initialData is available.
  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        city: initialData.city || '',
      });
    }
  }, [initialData, isEdit]); // Dependencies: re-run if initialData or isEdit mode changes.

  /**
   * Handles changes in form input fields.
   * Updates the formData state and clears any existing validation error for the changed field.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Dynamically update the field based on input's 'name' attribute.
    }));
    // Clear validation error for the field being edited.
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null, // Set the specific error to null.
      }));
    }
  };

  /**
   * Validates the form data.
   * Checks if required fields (name, address, city) are filled.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    setFormErrors(errors); // Update the formErrors state with any new errors.
    // Returns true if the 'errors' object has no keys (i.e., no errors found).
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles the form submission.
   * Prevents default form submission, validates the form, and calls the asynchronous onSubmit prop if valid.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser submission.
    if (validateForm()) {
      await onSubmit(formData); // Call the provided onSubmit handler with form data.
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form"> {/* General class for admin forms */}
      {/* Form title changes based on whether it's edit or create mode. */}
      <h2>{isEdit ? 'Edit Venue' : 'Create New Venue'}</h2>

      {/* Display general submission error if present */}
      {error && (
        <div className="error-message">
          {typeof error === 'string' ? error : 'An unexpected error occurred. Please try again.'}
        </div>
      )}

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
        {/* Display validation error message for the name field. */}
        {formErrors.name && <span className="error-text">{formErrors.name}</span>}
      </div>

      {/* Address Input Field */}
      <div className="form-group">
        <label htmlFor="address">Address:</label>
        <input
          type="text"
          id="address"
          name="address" // Must match the key in formData state.
          value={formData.address}
          onChange={handleChange}
          required
        />
        {formErrors.address && <span className="error-text">{formErrors.address}</span>}
      </div>

      {/* City Input Field */}
      <div className="form-group">
        <label htmlFor="city">City:</label>
        <input
          type="text"
          id="city"
          name="city" // Must match the key in formData state.
          value={formData.city}
          onChange={handleChange}
          required
        />
        {formErrors.city && <span className="error-text">{formErrors.city}</span>}
      </div>

      {/* Submit Button */}
      {/* Button text and disabled state change based on isLoading and isEdit props. */}
      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading
          ? (isEdit ? 'Updating...' : 'Creating...')
          : (isEdit ? 'Update Venue' : 'Create Venue')}
      </button>
    </form>
  );
}

// PropTypes for type-checking the component's props.
AdminVenueForm.propTypes = {
  /** Initial data for the form, typically used when editing an existing venue. */
  initialData: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
  }),
  /** Asynchronous callback function triggered on successful form submission. Receives form data. */
  onSubmit: PropTypes.func.isRequired,
  /** Boolean flag indicating if the form is in "edit" mode (true) or "create" mode (false). */
  isEdit: PropTypes.bool,
  /** Boolean flag indicating if a submission is currently in progress. */
  isLoading: PropTypes.bool,
  /** Error message (string or object) from a failed submission attempt, or null if no error. */
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default AdminVenueForm;
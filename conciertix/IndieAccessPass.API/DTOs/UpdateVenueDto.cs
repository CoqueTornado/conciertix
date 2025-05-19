using System.ComponentModel.DataAnnotations;

namespace IndieAccessPass.API.DTOs
{
    /// <summary>
    /// Data Transfer Object for updating an existing venue.
    /// All fields are optional; only provided fields will be updated.
    /// </summary>
    public class UpdateVenueDto
    {
        /// <summary>
        /// Gets or sets the new name of the venue.
        /// If provided, it must be between 2 and 150 characters.
        /// </summary>
        [StringLength(150, MinimumLength = 2, ErrorMessage = "Venue name must be between 2 and 150 characters.")]
        public string? Name { get; set; }

        /// <summary>
        /// Gets or sets the new street address of the venue.
        /// If provided, it cannot exceed 250 characters.
        /// </summary>
        [StringLength(250, ErrorMessage = "Venue address cannot exceed 250 characters.")]
        public string? Address { get; set; }

        /// <summary>
        /// Gets or sets the new city where the venue is located.
        /// If provided, it cannot exceed 100 characters.
        /// </summary>
        [StringLength(100, ErrorMessage = "Venue city cannot exceed 100 characters.")]
        public string? City { get; set; }
    }
}
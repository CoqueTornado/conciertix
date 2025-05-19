using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Data Transfer Object for creating a new venue.
    /// </summary>
    namespace IndieAccessPass.API.DTOs
    {
        public class CreateVenueDto
        {
            /// <summary>
            /// Gets or sets the name of the venue. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Venue name is required.")]
            [StringLength(150, MinimumLength = 2, ErrorMessage = "Venue name must be between 2 and 150 characters.")]
            public required string Name { get; set; }

            /// <summary>
            /// Gets or sets the street address of the venue. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Venue address is required.")]
            [StringLength(250, ErrorMessage = "Venue address cannot exceed 250 characters.")]
            public required string Address { get; set; }

            /// <summary>
            /// Gets or sets the city where the venue is located. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Venue city is required.")]
            [StringLength(100, ErrorMessage = "Venue city cannot exceed 100 characters.")]
            public required string City { get; set; }
        }
    }
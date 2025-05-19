using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Data Transfer Object for creating a new event.
    /// </summary>
    namespace IndieAccessPass.API.DTOs
    {
        public class CreateEventDto
        {
            /// <summary>
            /// Gets or sets the name of the event. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Event name is required.")]
            [StringLength(200, MinimumLength = 3, ErrorMessage = "Event name must be between 3 and 200 characters.")]
            public required string Name { get; set; }

            /// <summary>
            /// Gets or sets the description of the event. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Event description is required.")]
            [StringLength(2000, ErrorMessage = "Event description cannot exceed 2000 characters.")]
            public required string Description { get; set; }

            /// <summary>
            /// Gets or sets the date and time of the event. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Event date is required.")]
            // TODO: Add custom validation to ensure EventDate is in the future if needed.
            public DateTime EventDate { get; set; }

            /// <summary>
            /// Gets or sets the unique identifier of the venue where the event will take place. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Venue ID is required.")]
            public required Guid VenueId { get; set; }

            /// <summary>
            /// Gets or sets a list of unique identifiers for the artists performing at the event. This field is required.
            /// </summary>
            [Required(ErrorMessage = "At least one Artist ID is required.")]
            [MinLength(1, ErrorMessage = "At least one artist must be associated with the event.")]
            public List<Guid> ArtistIds { get; set; } = new List<Guid>();

            /// <summary>
            /// Gets or sets the total capacity of the event (maximum number of attendees). This field is required and must be at least 1.
            /// </summary>
            [Required(ErrorMessage = "Total capacity is required.")]
            [Range(1, int.MaxValue, ErrorMessage = "Total capacity must be at least 1.")]
            public int TotalCapacity { get; set; }

            /// <summary>
            /// Gets or sets the price per ticket for the event. This field is required and cannot be negative.
            /// </summary>
            [Required(ErrorMessage = "Price per ticket is required.")]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "Price per ticket cannot be negative.")]
            [DataType(DataType.Currency)]
            public decimal PricePerTicket { get; set; }

            /// <summary>
            /// Gets or sets the URL for the event's poster image. This field is optional.
            /// Must be a valid URL format if provided.
            /// </summary>
            [Url(ErrorMessage = "Image poster URL must be a valid URL.")]
            [StringLength(2048, ErrorMessage = "Image poster URL cannot exceed 2048 characters.")]
            public string? ImagePosterUrl { get; set; }

            /// <summary>
            /// Gets or sets the status of the event (e.g., "Draft", "Published", "Cancelled"). This field is required.
            /// </summary>
            /// <remarks>
            /// TODO: Consider using an enum for Status or validating against a predefined list of allowed string values.
            /// </remarks>
            [Required(ErrorMessage = "Event status is required.")]
            [RegularExpression("^(Draft|Published|Cancelled)$", ErrorMessage = "Status must be 'Draft', 'Published', or 'Cancelled'.")]
            public required string Status { get; set; }
        }
    }
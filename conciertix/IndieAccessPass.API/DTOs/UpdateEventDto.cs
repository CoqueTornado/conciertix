using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Data Transfer Object for updating an existing event.
    /// All fields are optional; only provided fields will be updated.
    /// </summary>
    namespace IndieAccessPass.API.DTOs
    {
        public class UpdateEventDto
        {
            /// <summary>
            /// Gets or sets the new name of the event.
            /// If provided, it must be between 3 and 200 characters.
            /// </summary>
            [StringLength(200, MinimumLength = 3, ErrorMessage = "Event name must be between 3 and 200 characters.")]
            public string? Name { get; set; }

            /// <summary>
            /// Gets or sets the new description of the event.
            /// If provided, it cannot exceed 2000 characters.
            /// </summary>
            [StringLength(2000, ErrorMessage = "Event description cannot exceed 2000 characters.")]
            public string? Description { get; set; }

            /// <summary>
            /// Gets or sets the new date and time of the event.
            /// TODO: Add custom validation to ensure EventDate is in the future if status is 'Published'.
            /// </summary>
            public DateTime? EventDate { get; set; }

            /// <summary>
            /// Gets or sets the new unique identifier of the venue where the event will take place.
            /// </summary>
            public Guid? VenueId { get; set; }

            /// <summary>
            /// Gets or sets a new list of unique identifiers for the artists performing at the event.
            /// If provided, at least one artist ID must be included.
            /// </summary>
            [MinLength(1, ErrorMessage = "If ArtistIds is provided, at least one artist must be associated with the event.")]
            public List<Guid>? ArtistIds { get; set; }

            /// <summary>
            /// Gets or sets the new total capacity of the event.
            /// If provided, it must be at least 1.
            /// </summary>
            [Range(1, int.MaxValue, ErrorMessage = "Total capacity must be at least 1.")]
            public int? TotalCapacity { get; set; }

            /// <summary>
            /// Gets or sets the new number of available tickets for the event.
            /// </summary>
            /// <remarks>
            /// Caution: Directly updating available tickets might bypass logic tied to reservations.
            /// Ensure this is handled correctly in the service layer (e.g., not exceeding total capacity, consistency with reservations).
            /// It might be better to calculate this field rather than allowing direct updates.
            /// </remarks>
            [Range(0, int.MaxValue, ErrorMessage = "Available tickets cannot be negative.")]
            public int? AvailableTickets { get; set; }

            /// <summary>
            /// Gets or sets the new price per ticket for the event.
            /// If provided, it cannot be negative.
            /// </summary>
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "Price per ticket cannot be negative.")]
            [DataType(DataType.Currency)]
            public decimal? PricePerTicket { get; set; }

            /// <summary>
            /// Gets or sets the new URL for the event's poster image.
            /// If provided, it must be a valid URL and cannot exceed 2048 characters.
            /// </summary>
            [Url(ErrorMessage = "Image poster URL must be a valid URL.")]
            [StringLength(2048, ErrorMessage = "Image poster URL cannot exceed 2048 characters.")]
            public string? ImagePosterUrl { get; set; }

            /// <summary>
            /// Gets or sets the new status of the event (e.g., "Draft", "Published", "Cancelled").
            /// </summary>
            /// <remarks>
            /// TODO: Consider using an enum for Status or validating against a predefined list of allowed string values.
            /// </remarks>
            [RegularExpression("^(Draft|Published|Cancelled)$", ErrorMessage = "Status must be 'Draft', 'Published', or 'Cancelled'.")]
            public string? Status { get; set; }
        }
    }
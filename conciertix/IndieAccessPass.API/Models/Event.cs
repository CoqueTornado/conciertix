using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

    /// <summary>
    /// Represents a musical event or concert.
    /// </summary>
    namespace IndieAccessPass.API.Models
    {
        public class Event
        {
            /// <summary>
            /// Gets or sets the unique identifier for the event.
            /// This is the primary key.
            /// </summary>
            [Key]
            public Guid Id { get; set; }

            /// <summary>
            /// Gets or sets the name of the event. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Event name is required.")]
            [StringLength(200, MinimumLength = 3, ErrorMessage = "Event name must be between 3 and 200 characters.")]
            public required string Name { get; set; }

            /// <summary>
            /// Gets or sets a detailed description of the event. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Event description is required.")]
            [StringLength(2000, ErrorMessage = "Event description cannot exceed 2000 characters.")]
            public required string Description { get; set; }

            /// <summary>
            /// Gets or sets the date and time when the event takes place. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Event date is required.")]
            public DateTime EventDate { get; set; }

            /// <summary>
            /// Gets or sets the unique identifier of the venue where the event is held.
            /// This is a foreign key to the <see cref="Venue"/> entity.
            /// </summary>
            [Required(ErrorMessage = "Venue ID is required.")]
            public Guid VenueId { get; set; }

            /// <summary>
            /// Gets or sets the navigation property for the venue associated with this event.
            /// </summary>
            [ForeignKey("VenueId")]
            public Venue? Venue { get; set; }

            /// <summary>
            /// Gets or sets the total capacity (maximum number of attendees) for the event. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Total capacity is required.")]
            [Range(1, int.MaxValue, ErrorMessage = "Total capacity must be at least 1.")]
            public int TotalCapacity { get; set; }

            /// <summary>
            /// Gets or sets the number of tickets currently available for the event.
            /// This value should be less than or equal to <see cref="TotalCapacity"/>.
            /// </summary>
            [Range(0, int.MaxValue, ErrorMessage = "Available tickets cannot be negative.")]
            public int AvailableTickets { get; set; }

            /// <summary>
            /// Gets or sets the price per ticket for the event.
            /// The value is stored with a precision of 18 digits, with 2 decimal places.
            /// </summary>
            [Column(TypeName = "decimal(18,2)")]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "Price per ticket cannot be negative.")]
            public decimal PricePerTicket { get; set; }

            /// <summary>
            /// Gets or sets the URL for the event's promotional poster image. This field is optional.
            /// </summary>
            [Url(ErrorMessage = "Image poster URL must be a valid URL.")]
            [StringLength(2048, ErrorMessage = "Image poster URL cannot exceed 2048 characters.")]
            public string? ImagePosterUrl { get; set; }

            /// <summary>
            /// Gets or sets the current status of the event (e.g., "Draft", "Published", "Cancelled", "Past"). This field is required.
            /// </summary>
            /// <remarks>
            /// Consider using an enum for Status for better type safety and to restrict possible values.
            /// </remarks>
            [Required(ErrorMessage = "Event status is required.")]
            [StringLength(20, ErrorMessage = "Status cannot exceed 20 characters.")] // Example length, adjust as needed
            public required string Status { get; set; }

            /// <summary>
            /// Gets or sets the collection of EventArtist join entities, representing the artists performing at this event.
            /// This is a navigation property for the many-to-many relationship between Event and Artist.
            /// </summary>
            public ICollection<EventArtist> EventArtists { get; set; } = new List<EventArtist>();

            /// <summary>
            /// Gets or sets the collection of reservations made for this event.
            /// This is a navigation property for the one-to-many relationship between Event and Reservation.
            /// </summary>
            public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        }
    }
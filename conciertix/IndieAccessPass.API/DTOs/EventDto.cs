using System;
using System.Collections.Generic;

    /// <summary>
    /// Data Transfer Object for an event.
    /// </summary>
    namespace IndieAccessPass.API.DTOs
    {
        public class EventDto
        {
            /// <summary>
            /// Gets or sets the unique identifier for the event.
            /// </summary>
            public Guid Id { get; set; }

            /// <summary>
            /// Gets or sets the name of the event. This field is required.
            /// </summary>
            public required string Name { get; set; }

            /// <summary>
            /// Gets or sets the description of the event. This field is required.
            /// </summary>
            public required string Description { get; set; }

            /// <summary>
            /// Gets or sets the date and time of the event.
            /// </summary>
            public DateTime EventDate { get; set; }

            /// <summary>
            /// Gets or sets the name of the venue where the event will take place. This field is required.
            /// </summary>
            public required string VenueName { get; set; }

            /// <summary>
            /// Gets or sets the city where the venue is located. This field is required.
            /// </summary>
            public required string VenueCity { get; set; }

            /// <summary>
            /// Gets or sets a list of names of the artists performing at the event.
            /// </summary>
            public List<string> ArtistNames { get; set; } = new List<string>();

            /// <summary>
            /// Gets or sets the total capacity of the event (maximum number of attendees).
            /// </summary>
            public int TotalCapacity { get; set; }

            /// <summary>
            /// Gets or sets the number of currently available tickets for the event.
            /// </summary>
            public int AvailableTickets { get; set; }

            /// <summary>
            /// Gets or sets the price per ticket for the event.
            /// </summary>
            public decimal PricePerTicket { get; set; }

            /// <summary>
            /// Gets or sets the URL for the event's poster image. This field is optional.
            /// </summary>
            public string? ImagePosterUrl { get; set; }

            /// <summary>
            /// Gets or sets the current status of the event (e.g., "Draft", "Published", "Cancelled"). This field is required.
            /// </summary>
            public required string Status { get; set; }
        }
    }
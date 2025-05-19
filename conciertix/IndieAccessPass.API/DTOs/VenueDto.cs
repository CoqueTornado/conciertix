using System;

    /// <summary>
    /// Data Transfer Object for a venue.
    /// </summary>
    namespace IndieAccessPass.API.DTOs
    {
        public class VenueDto
        {
            /// <summary>
            /// Gets or sets the unique identifier for the venue.
            /// </summary>
            public Guid Id { get; set; }

            /// <summary>
            /// Gets or sets the name of the venue. This field is required.
            /// </summary>
            public required string Name { get; set; }

            /// <summary>
            /// Gets or sets the street address of the venue. This field is required.
            /// </summary>
            public required string Address { get; set; }

            /// <summary>
            /// Gets or sets the city where the venue is located. This field is required.
            /// </summary>
            public required string City { get; set; }
        }
    }
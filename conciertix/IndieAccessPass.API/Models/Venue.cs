using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Represents a venue where events can take place.
    /// </summary>
    namespace IndieAccessPass.API.Models
    {
        public class Venue
        {
            /// <summary>
            /// Gets or sets the unique identifier for the venue.
            /// This is the primary key.
            /// </summary>
            [Key]
            public Guid Id { get; set; }

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

            /// <summary>
            /// Gets or sets the collection of events that are scheduled to take place at this venue.
            /// This is a navigation property for the one-to-many relationship between Venue and Event.
            /// </summary>
            public ICollection<Event> Events { get; set; } = new List<Event>();
        }
    }
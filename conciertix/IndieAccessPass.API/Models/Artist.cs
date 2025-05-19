using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Represents an artist or band performing at events.
    /// </summary>
    namespace IndieAccessPass.API.Models
    {
        public class Artist
        {
            /// <summary>
            /// Gets or sets the unique identifier for the artist.
            /// This is the primary key.
            /// </summary>
            [Key]
            public Guid Id { get; set; }

            /// <summary>
            /// Gets or sets the name of the artist. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Artist name is required.")]
            [StringLength(100, MinimumLength = 1, ErrorMessage = "Artist name must be between 1 and 100 characters.")]
            public required string Name { get; set; }

            /// <summary>
            /// Gets or sets the biography of the artist. This field is optional.
            /// </summary>
            [StringLength(2000, ErrorMessage = "Bio cannot exceed 2000 characters.")]
            public string? Bio { get; set; }

            /// <summary>
            /// Gets or sets the URL for the artist's image. This field is optional.
            /// </summary>
            [Url(ErrorMessage = "Image URL must be a valid URL.")]
            [StringLength(2048, ErrorMessage = "Image URL cannot exceed 2048 characters.")]
            public string? ImageUrl { get; set; }

            /// <summary>
            /// Gets or sets the genre of the artist (e.g., "Folk", "Synthwave", "Rock"). This field is optional.
            /// </summary>
            [StringLength(50, ErrorMessage = "Genre cannot exceed 50 characters.")]
            public string? Genre { get; set; }

            /// <summary>
            /// Gets or sets the collection of EventArtist join entities, representing the events this artist is associated with.
            /// This is a navigation property for the many-to-many relationship between Artist and Event.
            /// </summary>
            public ICollection<EventArtist> EventArtists { get; set; } = new List<EventArtist>();
        }
    }
using System;

    /// <summary>
    /// Data Transfer Object for an artist.
    /// </summary>
    namespace IndieAccessPass.API.DTOs
    {
        public class ArtistDto
        {
            /// <summary>
            /// Gets or sets the unique identifier for the artist.
            /// </summary>
            public Guid Id { get; set; }

            /// <summary>
            /// Gets or sets the name of the artist. This field is required.
            /// </summary>
            public required string Name { get; set; }

            /// <summary>
            /// Gets or sets the biography of the artist. This field is optional.
            /// </summary>
            public string? Bio { get; set; }

            /// <summary>
            /// Gets or sets the URL for the artist's image. This field is optional.
            /// </summary>
            public string? ImageUrl { get; set; }

            /// <summary>
            /// Gets or sets the genre of the artist. This field is optional.
            /// </summary>
            public string? Genre { get; set; }
        }
    }
using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Data Transfer Object for creating a new artist.
    /// </summary>
    namespace IndieAccessPass.API.DTOs
    {
        public class CreateArtistDto
        {
            /// <summary>
            /// Gets or sets the name of the artist. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Artist name is required.")]
            [StringLength(100, MinimumLength = 2, ErrorMessage = "Artist name must be between 2 and 100 characters.")]
            public required string Name { get; set; }

            /// <summary>
            /// Gets or sets the biography of the artist. This field is optional.
            /// </summary>
            [StringLength(1000, ErrorMessage = "Bio cannot exceed 1000 characters.")]
            public string? Bio { get; set; }

            /// <summary>
            /// Gets or sets the URL for the artist's image. This field is optional.
            /// Must be a valid URL format if provided.
            /// </summary>
            [Url(ErrorMessage = "Image URL must be a valid URL.")]
            [StringLength(2048, ErrorMessage = "Image URL cannot exceed 2048 characters.")]
            public string? ImageUrl { get; set; }

            /// <summary>
            /// Gets or sets the genre of the artist. This field is optional.
            /// </summary>
            [StringLength(50, ErrorMessage = "Genre cannot exceed 50 characters.")]
            public string? Genre { get; set; }
        }
    }
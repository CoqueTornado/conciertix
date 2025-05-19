using System.ComponentModel.DataAnnotations;

namespace IndieAccessPass.API.DTOs
{
    /// <summary>
    /// Data Transfer Object for updating an existing artist.
    /// All fields are optional; only provided fields will be updated.
    /// </summary>
    public class UpdateArtistDto
    {
        /// <summary>
        /// Gets or sets the new name of the artist.
        /// If provided, it must be between 2 and 100 characters.
        /// </summary>
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Artist name must be between 2 and 100 characters.")]
        public string? Name { get; set; }

        /// <summary>
        /// Gets or sets the new biography of the artist.
        /// If provided, it cannot exceed 1000 characters.
        /// </summary>
        [StringLength(1000, ErrorMessage = "Bio cannot exceed 1000 characters.")]
        public string? Bio { get; set; }

        /// <summary>
        /// Gets or sets the new URL for the artist's image.
        /// If provided, it must be a valid URL and cannot exceed 2048 characters.
        /// </summary>
        [Url(ErrorMessage = "Image URL must be a valid URL.")]
        [StringLength(2048, ErrorMessage = "Image URL cannot exceed 2048 characters.")]
        public string? ImageUrl { get; set; }

        /// <summary>
        /// Gets or sets the new genre of the artist.
        /// If provided, it cannot exceed 50 characters.
        /// </summary>
        [StringLength(50, ErrorMessage = "Genre cannot exceed 50 characters.")]
        public string? Genre { get; set; }
    }
}
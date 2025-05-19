using System;
using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Represents a user of the application.
    /// </summary>
    namespace IndieAccessPass.API.Models
    {
        public class User
        {
            /// <summary>
            /// Gets or sets the unique identifier for the user.
            /// This is the primary key.
            /// </summary>
            [Key]
            public Guid Id { get; set; }

            /// <summary>
            /// Gets or sets the username of the user. This field is required and must be unique.
            /// </summary>
            [Required(ErrorMessage = "Username is required.")]
            [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters.")]
            // Unique constraint is configured in ApplicationDbContext.OnModelCreating
            public required string Username { get; set; }

            /// <summary>
            /// Gets or sets the email address of the user. This field is required, must be a valid email format, and must be unique.
            /// </summary>
            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress(ErrorMessage = "Invalid email address format.")]
            [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
            // Unique constraint is configured in ApplicationDbContext.OnModelCreating
            public required string Email { get; set; }

            /// <summary>
            /// Gets or sets the hashed password for the user. This field is required.
            /// The actual password is not stored; only its hash.
            /// </summary>
            [Required(ErrorMessage = "Password hash is required.")]
            public string PasswordHash { get; set; } = string.Empty;

            /// <summary>
            /// Gets or sets the role assigned to the user (e.g., "User", "Admin"). This field is required.
            /// </summary>
            /// <remarks>
            /// Consider using an enum for Role for better type safety and to restrict possible values.
            /// </remarks>
            [Required(ErrorMessage = "User role is required.")]
            [StringLength(20, ErrorMessage = "Role cannot exceed 20 characters.")] // Example length
            public required string Role { get; set; }
        }
    }
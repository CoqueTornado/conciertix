using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Data Transfer Object for user registration.
    /// </summary>
    namespace IndieAccessPass.API.DTOs
    {
        public class RegisterDto
        {
            /// <summary>
            /// Gets or sets the desired username for the new user. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Username is required.")]
            [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters.")]
            public required string Username { get; set; }

            /// <summary>
            /// Gets or sets the email address for the new user. This field is required and must be a valid email format.
            /// </summary>
            [Required(ErrorMessage = "Email is required.")]
            [EmailAddress(ErrorMessage = "Invalid email address format.")]
            [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
            public required string Email { get; set; }

            /// <summary>
            /// Gets or sets the password for the new user. This field is required.
            /// </summary>
            /// <remarks>
            /// TODO: Add password complexity requirements (e.g., length, special characters) using a custom validation attribute or by checking in the service layer.
            /// Example: [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must be at least 8 characters long and include uppercase, lowercase, a digit, and a special character.")]
            /// </remarks>
            [Required(ErrorMessage = "Password is required.")]
            [DataType(DataType.Password)]
            [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters long.")]
            public required string Password { get; set; }

            /// <summary>
            /// Gets or sets the role for the new user (e.g., "User", "Admin"). This field is required.
            /// </summary>
            /// <remarks>
            /// TODO: Validate this against a predefined list of roles, possibly using an enum or a custom validation attribute.
            /// </remarks>
            [Required(ErrorMessage = "Role is required.")]
            [RegularExpression("^(User|Admin)$", ErrorMessage = "Role must be 'User' or 'Admin'.")]
            public required string Role { get; set; }
        }
    }
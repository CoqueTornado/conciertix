using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Data Transfer Object for user login.
    /// </summary>
    namespace IndieAccessPass.API.DTOs
    {
        public class LoginDto
        {
            /// <summary>
            /// Gets or sets the username for login. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Username is required.")]
            public required string Username { get; set; }

            /// <summary>
            /// Gets or sets the password for login. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Password is required.")]
            [DataType(DataType.Password)]
            public required string Password { get; set; }
        }
    }
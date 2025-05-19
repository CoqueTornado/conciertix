using IndieAccessPass.API.Data;
using IndieAccessPass.API.DTOs;
using IndieAccessPass.API.Models;
using IndieAccessPass.API.Services; // Added for IEmailService
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace IndieAccessPass.API.Controllers
{
    /// <summary>
    /// API controller for handling user authentication, including registration and login.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _passwordHasher;
        private readonly IEmailService _emailService;

        /// <summary>
        /// Initializes a new instance of the <see cref="AuthController"/> class.
        /// </summary>
        /// <param name="context">The database context.</param>
        /// <param name="configuration">The application configuration.</param>
        /// <param name="emailService">The email service for sending notifications.</param>
        public AuthController(ApplicationDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<User>();
            _emailService = emailService;
        }

        /// <summary>
        /// Registers a new user.
        /// </summary>
        /// <param name="registerDto">The data transfer object containing user registration information.</param>
        /// <returns>An <see cref="IActionResult"/> indicating the result of the registration attempt.
        /// Returns Ok with a success message if registration is successful.
        /// Returns BadRequest if the model state is invalid or if the username/email already exists.
        /// </returns>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingUserByUsername = await _context.Users.FirstOrDefaultAsync(u => u.Username == registerDto.Username);
            if (existingUserByUsername != null)
            {
                return BadRequest("Username already exists.");
            }

            var existingUserByEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
            if (existingUserByEmail != null)
            {
                return BadRequest("Email already exists.");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = registerDto.Username,
                Email = registerDto.Email,
                Role = registerDto.Role // TODO: Consider validating role string against a predefined list of roles.
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, registerDto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Send registration confirmation email
            try
            {
                await _emailService.SendRegistrationConfirmationEmailAsync(user);
            }
            catch (Exception ex)
            {
                // Log the exception but don't fail the registration.
                // This ensures user registration is not blocked by email sending issues.
                // Consider using a more robust logging mechanism like ILogger.
                Console.WriteLine($"Error sending registration email for user {user.Email}: {ex.Message}"); // TODO: Replace Console.WriteLine with proper logging.
            }

            return Ok(new { Message = "User registered successfully" });
        }

        /// <summary>
        /// Logs in an existing user.
        /// </summary>
        /// <param name="loginDto">The data transfer object containing user login credentials.</param>
        /// <returns>An <see cref="IActionResult"/> containing the JWT token if login is successful;
        /// otherwise, BadRequest or Unauthorized.
        /// </returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null || _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, loginDto.Password) == PasswordVerificationResult.Failed)
            {
                return Unauthorized("Invalid username or password.");
            }

            var token = GenerateJwtToken(user);
            return Ok(new { Token = token });
        }

        /// <summary>
        /// Generates a JWT token for the authenticated user.
        /// </summary>
        /// <param name="user">The user for whom to generate the token.</param>
        /// <returns>A JWT token string.</returns>
        /// <exception cref="InvalidOperationException">Thrown if JWT configuration (Key, Issuer, Audience) is missing.</exception>
        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key (Jwt:Key) is not configured in appsettings.json.");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), // Subject (user ID)
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // JWT ID
                new Claim(ClaimTypes.NameIdentifier, user.Username), // Username
                new Claim(ClaimTypes.Email, user.Email), // Email
                new Claim(ClaimTypes.Role, user.Role) // User role
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer (Jwt:Issuer) is not configured in appsettings.json."),
                audience: _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience (Jwt:Audience) is not configured in appsettings.json."),
                claims: claims,
                expires: DateTime.Now.AddHours(1), // Token expiration time (e.g., 1 hour)
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
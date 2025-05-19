using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;

namespace IndieAccessPass.API.Controllers
{
    /// <summary>
    /// API controller for managing user-specific information.
    /// All actions in this controller require user authentication.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        /// <summary>
        /// Gets the information for the currently authenticated user.
        /// Retrieves user details (ID, Username, Email, Role) from the JWT token claims.
        /// </summary>
        /// <returns>
        /// An <see cref="OkObjectResult"/> containing the current user's information if authenticated.
        /// An <see cref="UnauthorizedResult"/> if the user is not authenticated or user ID is not found in claims.
        /// </returns>
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = User.FindFirstValue(ClaimTypes.Name);
            var userEmail = User.FindFirstValue(ClaimTypes.Email);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userId))
            {
                // This case should ideally be rare if [Authorize] is effective,
                // but good practice to check.
                return Unauthorized();
            }

            return Ok(new
            {
                Id = userId,
                Username = userName,
                Email = userEmail,
                Role = userRole
            });
        }

        /// <summary>
        /// Updates the information for the currently authenticated user.
        /// </summary>
        /// <param name="userData">The data to update the user with.
        /// TODO: Replace 'object' with a specific Data Transfer Object (DTO) for user updates (e.g., UpdateUserDto) for type safety and validation.
        /// </param>
        /// <returns>
        /// A <see cref="NoContentResult"/> if the update is successful (or if no changes were made).
        /// An <see cref="UnauthorizedResult"/> if the user is not authenticated.
        /// A <see cref="NotFoundResult"/> if the user to update is not found (after implementing DB logic).
        /// A <see cref="BadRequestObjectResult"/> if the provided userData is invalid (after implementing DTO and validation).
        /// </returns>
        /// <remarks>
        /// TODO: Implement the actual logic to update user data in the database.
        /// This includes:
        /// 1. Defining a specific DTO for `userData`.
        /// 2. Retrieving the user entity from the database using `userId`.
        /// 3. Applying the changes from the DTO to the user entity.
        /// 4. Saving changes to the database.
        /// 5. Handling potential errors like user not found or concurrency issues.
        /// 6. Potentially re-validating data or handling password changes separately and securely.
        /// </remarks>
        [HttpPut("me")]
        public IActionResult UpdateUserMe([FromBody] object userData)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // TODO: Add logic to find the user by userId and update their information
            // using the data from 'userData'. This requires ApplicationDbContext injection.
            // Example (assuming _context is injected like in other controllers):
            // var userToUpdate = await _context.Users.FindAsync(Guid.Parse(userId));
            // if (userToUpdate == null)
            // {
            //     return NotFound("User not found.");
            // }
            // // Map properties from userData (ideally a DTO) to userToUpdate
            // // e.g., if (userDataDto.Email != null) userToUpdate.Email = userDataDto.Email;
            // // Consider password change logic separately if needed.
            // await _context.SaveChangesAsync();

            return NoContent(); // Or Ok(updatedUserDataDto)
        }
    }
}
using IndieAccessPass.API.Data;
using IndieAccessPass.API.DTOs;
using IndieAccessPass.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IndieAccessPass.API.Controllers
{
    /// <summary>
    /// API controller for managing venues.
    /// </summary>
    [ApiController]
    [Route("api/venues")]
    public class VenuesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="VenuesController"/> class.
        /// </summary>
        /// <param name="context">The database context.</param>
        public VenuesController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets a paginated list of venues, optionally filtered by a search term.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve (default is 1).</param>
        /// <param name="pageSize">The number of venues per page (default is 10).</param>
        /// <param name="searchTerm">An optional search term to filter venues by name or city.</param>
        /// <returns>A list of venues.</returns>
        // GET: api/venues
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VenueDto>>> GetVenues([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? searchTerm = null)
        {
            var query = _context.Venues.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lowerSearchTerm = searchTerm.ToLower();
                query = query.Where(v =>
                    (v.Name != null && v.Name.ToLower().Contains(lowerSearchTerm)) ||
                    (v.City != null && v.City.ToLower().Contains(lowerSearchTerm))
                );
            }

            var venues = await query
                .OrderBy(v => v.Name)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new VenueDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Address = v.Address,
                    City = v.City
                })
                .ToListAsync();

            return Ok(venues);
        }

        /// <summary>
        /// Gets a specific venue by its ID.
        /// </summary>
        /// <param name="id">The ID of the venue to retrieve.</param>
        /// <returns>The requested venue if found; otherwise, NotFound.</returns>
        // GET: api/venues/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<VenueDto>> GetVenue(Guid id)
        {
            var venue = await _context.Venues
                .Select(v => new VenueDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Address = v.Address,
                    City = v.City
                })
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venue == null)
            {
                return NotFound();
            }

            return Ok(venue);
        }

        /// <summary>
        /// Creates a new venue. (Admin only)
        /// </summary>
        /// <param name="createVenueDto">The data transfer object containing venue information.</param>
        /// <returns>The created venue.</returns>
        // POST: api/venues
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<VenueDto>> CreateVenue(CreateVenueDto createVenueDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var venue = new Venue
            {
                Name = createVenueDto.Name,
                Address = createVenueDto.Address,
                City = createVenueDto.City
            };

            _context.Venues.Add(venue);
            await _context.SaveChangesAsync();

            var venueDto = new VenueDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Address = venue.Address,
                City = venue.City
            };

            return CreatedAtAction(nameof(GetVenue), new { id = venue.Id }, venueDto);
        }

        /// <summary>
        /// Updates an existing venue. (Admin only)
        /// </summary>
        /// <param name="id">The ID of the venue to update.</param>
        /// <param name="updateVenueDto">The data transfer object containing updated venue information.</param>
        /// <returns>NoContent if successful; otherwise, BadRequest or NotFound.</returns>
        // PUT: api/venues/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateVenue(Guid id, UpdateVenueDto updateVenueDto)
        {
            var venue = await _context.Venues.FindAsync(id);

            if (venue == null)
            {
                return NotFound();
            }
            
            // Apply updates only if the DTO properties are not null (or handle as per your DTO design)
            if (updateVenueDto.Name != null)
            {
                venue.Name = updateVenueDto.Name;
            }
            if (updateVenueDto.Address != null)
            {
                venue.Address = updateVenueDto.Address;
            }
            if (updateVenueDto.City != null)
            {
                venue.City = updateVenueDto.City;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VenueExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw; // Re-throw if it's a genuine concurrency issue and the entity still exists.
                }
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a venue by its ID. (Admin only)
        /// A venue cannot be deleted if it is associated with any existing events.
        /// </summary>
        /// <param name="id">The ID of the venue to delete.</param>
        /// <returns>NoContent if successful; otherwise, NotFound or BadRequest.</returns>
        // DELETE: api/venues/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVenue(Guid id)
        {
            var venue = await _context.Venues.FindAsync(id);
            if (venue == null)
            {
                return NotFound();
            }

            // Check if the venue is linked to any events
            var isVenueLinkedToEvent = await _context.Events.AnyAsync(e => e.VenueId == id);
            if (isVenueLinkedToEvent)
            {
                return BadRequest("Venue cannot be deleted as it is associated with existing events. Please reassign or delete those events first.");
            }

            _context.Venues.Remove(venue);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Checks if a venue exists by its ID.
        /// </summary>
        /// <param name="id">The ID of the venue to check.</param>
        /// <returns>True if the venue exists; otherwise, false.</returns>
        private bool VenueExists(Guid id)
        {
            return _context.Venues.Any(e => e.Id == id);
        }
    }
}